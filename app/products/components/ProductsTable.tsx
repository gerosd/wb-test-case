'use client'
import React, { memo, useCallback, useRef, useState, useEffect } from 'react';
import { Product, ProductResponse } from "@/lib/types/products";
import { useTableData } from '@/hooks/useTableData';
import TableWrapper from '@/components/TableWrapper/TableWrapper';
import TableControls from '@/components/TableControls/TableControls';
import TableStatus from '@/components/TableStatus/TableStatus';
import Image from 'next/image';
import { getProducts, getProductById } from '@/actions/getProducts';
import { updateCachedProduct } from '@/actions/cacheActions';
import styles from './productsTable.module.css';

const CACHE_KEY = 'wb_products_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000;
const PAGE_SIZE = 100;

const ProductPhoto = memo(({ product }: { product: Product }) => {
    if (!Array.isArray(product.photos) || !product.photos[0]?.c246x328) {
        return <div className={styles.noPhoto}>Некорректное фото</div>;
    }

    const photo = product.photos[0];
    return (
        <div className={styles.photoContainer}>
            <Image
                src={photo.c246x328}
                alt={product.title}
                width={123}
                height={164}
                style={{ objectFit: 'contain' }}
                unoptimized
            />
        </div>
    );
});

ProductPhoto.displayName = 'ProductPhoto';

const ProductRow = memo(({ product, onProductUpdate }: { product: Product, onProductUpdate?: () => void }) => {
    const [isChecking, setIsChecking] = useState(false);

    const checkForUpdates = useCallback(async () => {
        if (isChecking) return;
        setIsChecking(true);
        try {
            const result = await getProductById(product.nmID);
            if (result.data && result.data.updatedAt !== product.updatedAt) {
                await updateCachedProduct(CACHE_KEY, 'products', product.nmID, result.data);
                onProductUpdate?.();
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        } finally {
            setIsChecking(false);
        }
    }, [product.nmID, product.updatedAt, isChecking, onProductUpdate]);

    useEffect(() => {
        // Check for updates every 5 minutes
        const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [checkForUpdates]);

    if (!product) return null;

    return (
        <tr>
            <td>
                <ProductPhoto product={product} />
            </td>
            <td><a href={`https://www.wildberries.ru/catalog/${product.nmID}/detail.aspx`} target="_blank">{product.nmID}</a></td>
            <td>{product.nmUUID}</td>
            <td>{product.subjectID}</td>
            <td>{product.subjectName}</td>
            <td>{product.vendorCode}</td>
            <td>{product.title}</td>
        </tr>
    );
});

ProductRow.displayName = 'ProductRow';

const TableHeader = memo(() => (
    <thead>
        <tr>
            <th>Фото</th>
            <th>Артикул WB</th>
            <th>UUID</th>
            <th>ID предмета</th>
            <th>Название предмета</th>
            <th>Артикул продавца</th>
            <th>Название товара</th>
        </tr>
    </thead>
));

TableHeader.displayName = 'TableHeader';

export default function ProductsTable() {
    const cursorRef = useRef<ProductResponse['cursor'] | null>(null);
    const [searchFilter, setSearchFilter] = useState('');

    const fetchFunction = useCallback(async () => {
        const response = await getProducts({
            cursor: undefined,
            filter: {
                textSearch: searchFilter
            },
        });

        if (response.error) {
            console.error(response.error);
            return [];
        }

        cursorRef.current = response.cursor || null;
        return response.data;
    }, [searchFilter]);

    const loadMoreFunction = useCallback(async () => {
        if (!cursorRef.current) return [];

        const response = await getProducts({
            cursor: {
                updatedAt: cursorRef.current.updatedAt,
                nmID: cursorRef.current.nmID
            },
            filter: {
                textSearch: searchFilter
            },
        });

        if (response.error) {
            console.error(response.error);
            return [];
        }

        cursorRef.current = response.cursor || null;
        
        return response.data;
    }, [searchFilter]);

    const {
        displayedItems: displayedProducts,
        filteredItems: filteredProducts,
        allItems: allProducts,
        isLoading,
        lastUpdated,
        searchQuery,
        debouncedQuery,
        setSearchQuery,
        refreshData,
        handleScroll,
        hasMore
    } = useTableData<Product>({
        fetchFunction,
        loadMoreFunction,
        cacheKey: CACHE_KEY,
        storeName: 'products',
        cacheExpiryMs: CACHE_EXPIRY_MS,
        pageSize: PAGE_SIZE,
        hasMoreCheck: () => {
            return Boolean(cursorRef.current);
        }
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchFilter(searchQuery);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleRefresh = useCallback(() => {
        cursorRef.current = null;
        refreshData();
    }, [refreshData]);

    const handleProductUpdate = useCallback(() => {
        refreshData();
    }, [refreshData]);

    return (
        <TableWrapper onScroll={handleScroll}>
            <h1 style={{textAlign: "center"}}>Таблица товаров</h1>
            <TableControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={handleRefresh}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
            />

            <table>
                <TableHeader />
                <tbody>
                    {displayedProducts.map((product) => (
                        <ProductRow
                            key={`${product.nmID}`}
                            product={product}
                            onProductUpdate={handleProductUpdate}
                        />
                    ))}
                </tbody>
            </table>

            <TableStatus
                isLoading={isLoading}
                hasMore={hasMore}
                filteredCount={filteredProducts.length}
                displayedCount={displayedProducts.length}
                totalCount={allProducts.length}
                searchQuery={debouncedQuery}
            />
        </TableWrapper>
    );
}