import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCacheData, setCacheData } from '@/actions/cacheActions';

export interface UseTableDataOptions<T> {
    fetchFunction: () => Promise<T[]>;
    cacheKey: string;
    storeName: string;
    cacheExpiryMs?: number;
    pageSize?: number;
    filterFunction?: (items: T[], query: string) => T[];
    loadMoreFunction?: () => Promise<T[]>;
    hasMoreCheck?: (newItems: T[]) => boolean;
}

export interface UseTableDataReturn<T> {
    allItems: T[];
    filteredItems: T[];
    displayedItems: T[];
    isLoading: boolean;
    hasMore: boolean;
    page: number;
    lastUpdated: string;
    searchQuery: string;
    debouncedQuery: string;
    setSearchQuery: (query: string) => void;
    loadData: () => Promise<void>;
    refreshData: () => Promise<void>;
    loadMoreData: () => void;
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const defaultFilterFunction = <T,>(items: T[], query: string): T[] => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase().trim();
    return items.filter(item => {
        return Object.values(item as object).some(value => {
            if (value == null) return false;
            return String(value).toLowerCase().includes(lowerQuery);
        });
    });
};

export function useTableData<T>({
    fetchFunction,
    cacheKey,
    storeName,
    cacheExpiryMs = 30 * 60 * 1000,
    pageSize = 50,
    filterFunction = defaultFilterFunction,
    loadMoreFunction,
    hasMoreCheck
}: UseTableDataOptions<T>): UseTableDataReturn<T> {
    const [allItems, setAllItems] = useState<T[]>([]);
    const [filteredItems, setFilteredItems] = useState<T[]>([]);
    const [displayedItems, setDisplayedItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');
    const isInitialMount = useRef(true);
    const isLoadingMore = useRef(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        const filtered = filterFunction(allItems, debouncedQuery);
        setFilteredItems(filtered);
        setPage(0);
        setHasMore(filtered.length > pageSize);
    }, [allItems, debouncedQuery, filterFunction, pageSize]);

    useEffect(() => {
        const endIndex = (page + 1) * pageSize;
        const newItems = filteredItems.slice(0, endIndex);
        setDisplayedItems(newItems);
        setHasMore(Boolean(endIndex < filteredItems.length || (loadMoreFunction && !isLoadingMore.current)));
    }, [page, filteredItems, pageSize, loadMoreFunction]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const now = Date.now();

            const cached = await getCacheData<T[]>(cacheKey, storeName);

            if (cached && cached.timestamp && now - cached.timestamp < cacheExpiryMs) {
                setAllItems(cached.data);
                setLastUpdated(new Date(cached.timestamp).toLocaleString());
                return;
            }

            const items = await fetchFunction();
            const itemsArray = Array.isArray(items) ? items : [];

            await setCacheData(cacheKey, {
                data: itemsArray,
                timestamp: now
            }, storeName);

            setAllItems(itemsArray);
            setLastUpdated(new Date().toLocaleString());
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFunction, cacheKey, storeName, cacheExpiryMs]);

    const refreshData = useCallback(async () => {
        try {
            setIsLoading(true);
            const items = await fetchFunction();
            const itemsArray = Array.isArray(items) ? items : [];

            await setCacheData(cacheKey, {
                data: itemsArray,
                timestamp: Date.now()
            }, storeName);

            setAllItems(itemsArray);
            setPage(0);
            setLastUpdated(new Date().toLocaleString());
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFunction, cacheKey, storeName]);

    const loadMoreData = useCallback(async () => {
        if (!isLoading && hasMore && !isLoadingMore.current) {
            if (loadMoreFunction) {
                try {
                    isLoadingMore.current = true;
                    setIsLoading(true);
                    const newItems = await loadMoreFunction();
                    if (Array.isArray(newItems) && newItems.length > 0) {
                        setAllItems(prev => [...prev, ...newItems]);
                        if (hasMoreCheck) {
                            setHasMore(hasMoreCheck(newItems));
                        } else {
                            setHasMore(newItems.length === pageSize);
                        }
                    } else {
                        setHasMore(false);
                    }
                } catch (error) {
                    console.error('Error loading more data:', error);
                    setHasMore(false);
                } finally {
                    setIsLoading(false);
                    isLoadingMore.current = false;
                }
            } else {
                setPage(prev => prev + 1);
            }
        }
    }, [isLoading, hasMore, loadMoreFunction, pageSize, hasMoreCheck]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;

        if (isNearBottom && !isLoading && hasMore && !isLoadingMore.current) {
            loadMoreData();
        }
    }, [isLoading, hasMore, loadMoreData]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            loadData();
        }
    }, [loadData]);

    return {
        allItems,
        filteredItems,
        displayedItems,
        isLoading,
        hasMore,
        page,
        lastUpdated,
        searchQuery,
        debouncedQuery,
        setSearchQuery,
        loadData,
        refreshData,
        loadMoreData,
        handleScroll
    };
}