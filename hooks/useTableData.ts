import React, { useState, useEffect, useCallback } from 'react';
import { getCache, setCache } from '@/lib/db';

export interface UseTableDataOptions<T> {
    fetchFunction: () => Promise<T[]>;
    cacheKey: string;
    storeName?: string;
    cacheExpiryMs?: number;
    pageSize?: number;
    filterFunction?: (items: T[], query: string) => T[];
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

const defaultFilterFunction = <T>(items: T[], query: string): T[] => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase().trim();
    return items.filter(item => {
        return Object.values(item as any).some(value => {
            if (value == null) return false;
            return String(value).toLowerCase().includes(lowerQuery);
        });
    });
};

export function useTableData<T>({
                                    fetchFunction,
                                    cacheKey,
                                    storeName = 'orders',
                                    cacheExpiryMs = 30 * 60 * 1000,
                                    pageSize = 50,
                                    filterFunction = defaultFilterFunction
                                }: UseTableDataOptions<T>): UseTableDataReturn<T> {

    const [allItems, setAllItems] = useState<T[]>([]);
    const [filteredItems, setFilteredItems] = useState<T[]>([]);
    const [displayedItems, setDisplayedItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        if (allItems.length > 0) {
            const filtered = filterFunction(allItems, debouncedQuery);
            setFilteredItems(filtered);
            setPage(0);
        } else {
            setFilteredItems([]);
            setPage(0);
        }
    }, [allItems, debouncedQuery, filterFunction]);

    useEffect(() => {
        if (filteredItems.length > 0) {
            const endIndex = (page + 1) * pageSize;
            const newItems = filteredItems.slice(0, endIndex);
            setDisplayedItems(newItems);
            setHasMore(endIndex < filteredItems.length);
        } else {
            setDisplayedItems([]);
            setHasMore(false);
        }
    }, [page, filteredItems, pageSize]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const now = Date.now();

            const cached = await getCache(cacheKey, storeName);

            if (cached && cached.timestamp && now - cached.timestamp < cacheExpiryMs) {
                setAllItems(cached.data || []);
                setLastUpdated(new Date(cached.timestamp).toLocaleString());
                return;
            }

            const items = await fetchFunction();

            await setCache(cacheKey, {
                data: items,
                timestamp: now
            }, storeName);

            setAllItems(items);
            setLastUpdated(new Date().toLocaleString());
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFunction, cacheKey, storeName, cacheExpiryMs]);

    const refreshData = useCallback(async () => {
        try {
            setIsLoading(true);
            const items = await fetchFunction();

            await setCache(cacheKey, {
                data: items,
                timestamp: Date.now()
            }, storeName);

            setAllItems(items);
            setPage(0);
            setLastUpdated(new Date().toLocaleString());
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFunction, cacheKey, storeName]);

    const loadMoreData = useCallback(() => {
        if (!isLoading && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [isLoading, hasMore]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;

        if (isNearBottom && !isLoading && hasMore && filteredItems.length > 0) {
            loadMoreData();
        }
    }, [isLoading, hasMore, filteredItems.length, loadMoreData]);

    useEffect(() => {
        loadData();
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