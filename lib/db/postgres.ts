import { Pool } from 'pg';

const pool = new Pool({
    connectionString: 'postgresql://postgres.gnkrtyzgrpmdudjqhhqg:lPZ7q7x9zM12BLnU@aws-0-eu-north-1.pooler.supabase.com:6543/postgres',
});

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export const getCache = async <T>(
    key: string,
    storeName: string
): Promise<CacheEntry<T> | null> => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT data, timestamp FROM cache WHERE cache_key = $1 AND store_name = $2',
            [key, storeName]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return {
            data: result.rows[0].data,
            timestamp: parseInt(result.rows[0].timestamp)
        };
    } catch (error) {
        console.error('Error getting cache:', error);
        return null;
    } finally {
        client.release();
    }
};

export const setCache = async <T>(
    key: string,
    value: CacheEntry<T>,
    storeName: string
): Promise<void> => {
    const client = await pool.connect();
    try {
        const jsonData = JSON.stringify(value.data);
        
        await client.query(
            `INSERT INTO cache (cache_key, store_name, data, timestamp)
             VALUES ($1, $2, $3::jsonb, $4)
             ON CONFLICT (cache_key)
             DO UPDATE SET data = $3::jsonb, timestamp = $4, store_name = $2`,
            [key, storeName, jsonData, value.timestamp]
        );
    } catch (error) {
        console.error('Error setting cache:', error);
    } finally {
        client.release();
    }
};

export const clearOldCache = async (maxAgeMs: number): Promise<void> => {
    const client = await pool.connect();
    try {
        const cutoffTime = Date.now() - maxAgeMs;
        await client.query(
            'DELETE FROM cache WHERE timestamp < $1',
            [cutoffTime]
        );
    } catch (error) {
        console.error('Error clearing old cache:', error);
    } finally {
        client.release();
    }
}; 