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

            if (!db.objectStoreNames.contains('sales')) {
                db.createObjectStore('sales', { keyPath: 'cacheKey' });
            }
        };
    });
};

export const getCache = async (key: string, storeName: string = 'orders') => {
    try {
        const db = await initDB();
        return new Promise<any>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    console.log(`Cache hit [${storeName}]:`, key, 'Data length:', result.data?.length || 0);
                } else {
                    console.log(`Cache miss [${storeName}]:`, key);
                }
                resolve(result);
            };
        });
    } catch (error) {
        console.error('Error getting cache:', error);
        return null;
    }
};

export const setCache = async (key: string, data: any, storeName: string = 'orders') => {
    try {
        const db = await initDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            const cacheData = {
                cacheKey: key,
                ...data
            };

            console.log(`Saving to cache [${storeName}]:`, key, 'Data length:', cacheData.data?.length || 0);

            const request = store.put(cacheData);

            request.onerror = () => {
                console.error('Error saving to cache:', request.error);
                reject(request.error);
            };

            transaction.oncomplete = () => {
                console.log(`Successfully saved to cache [${storeName}]:`, key);
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