'use server'

import { getCache as getCacheFromDb, setCache as setCacheInDb, CacheEntry } from '@/lib/db/postgres';

export async function getCacheData<T>(key: string, storeName: string): Promise<CacheEntry<T> | null> {
    return getCacheFromDb<T>(key, storeName);
}

export async function setCacheData<T>(key: string, value: CacheEntry<T>, storeName: string): Promise<void> {
    return setCacheInDb<T>(key, value, storeName);
}

export async function updateCachedProduct<T>(key: string, storeName: string, productId: number, newData: T): Promise<void> {
    const cache = await getCacheFromDb<T[]>(key, storeName);
    if (!cache) return;

    const items = cache.data;
    if (!Array.isArray(items)) return;

    const updatedItems = items.map(item => {
        // @ts-ignore
        if (item.nmID === productId) {
            return newData;
        }
        return item;
    });

    await setCacheInDb<T[]>(key, {
        data: updatedItems,
        timestamp: Date.now()
    }, storeName);
} 