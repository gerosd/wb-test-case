'use server'

import { getCache, setCache, CacheEntry } from '@/lib/db/postgres';

interface Product {
  nmID: number;
  [key: string]: unknown;
}

export async function getCacheData<T>(key: string, storeName: string): Promise<CacheEntry<T> | null> {
    return getCache<T>(key, storeName);
}

export async function setCacheData<T>(key: string, value: CacheEntry<T>, storeName: string): Promise<void> {
    return setCache<T>(key, value, storeName);
}

export async function updateCachedProduct<T extends Product>(
    key: string, 
    storeName: string, 
    productId: number, 
    newData: T
): Promise<void> {
    const cache = await getCache<T[]>(key, storeName);
    if (!cache) return;

    const items = cache.data;
    if (!Array.isArray(items)) return;

    const updatedItems = items.map(item => {
        if (item.nmID === productId) {
            return newData;
        }
        return item;
    });

    await setCache<T[]>(key, {
        data: updatedItems,
        timestamp: Date.now()
    }, storeName);
}