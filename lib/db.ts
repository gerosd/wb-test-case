export const initDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('WBCacheDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('orders')) {
                db.createObjectStore('orders', { keyPath: 'cacheKey' });
            }
        };
    });
};

export const getCache = async (key: string) => {
    try {
        const db = await initDB();
        return new Promise<any>((resolve, reject) => {
            const transaction = db.transaction('orders', 'readonly');
            const store = transaction.objectStore('orders');
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    console.log('Cache hit:', key, 'Data length:', result.data?.length || 0);
                } else {
                    console.log('Cache miss:', key);
                }
                resolve(result);
            };
        });
    } catch (error) {
        console.error('Error getting cache:', error);
        return null;
    }
};

export const setCache = async (key: string, data: any) => {
    try {
        const db = await initDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction('orders', 'readwrite');
            const store = transaction.objectStore('orders');

            // ✅ Правильная структура данных для кэша
            const cacheData = {
                cacheKey: key,
                ...data // Разворачиваем data, чтобы timestamp и data были на верхнем уровне
            };

            console.log('Saving to cache:', key, 'Data length:', cacheData.data?.length || 0);

            const request = store.put(cacheData);

            request.onerror = () => {
                console.error('Error saving to cache:', request.error);
                reject(request.error);
            };

            transaction.oncomplete = () => {
                console.log('Successfully saved to cache:', key);
                resolve();
            };

            transaction.onerror = () => {
                console.error('Transaction error:', transaction.error);
                reject(transaction.error);
            };
        });
    } catch (error) {
        console.error('Error setting cache:', error);
        throw error;
    }
};