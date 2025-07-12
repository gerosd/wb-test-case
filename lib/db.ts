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
    const db = await initDB();
    return new Promise<any>((resolve, reject) => {
        const transaction = db.transaction('orders', 'readonly');
        const store = transaction.objectStore('orders');
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

export const setCache = async (key: string, data: any) => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('orders', 'readwrite');
        const store = transaction.objectStore('orders');
        store.put({ cacheKey: key, data, timestamp: Date.now() });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};