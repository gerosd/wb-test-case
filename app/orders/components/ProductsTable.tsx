'use client'
import styles from '../orders.module.css';
import React, {useState, useEffect, useCallback, useMemo, memo} from 'react'
import { fetchOrders } from '@/lib/api/wbOrders';
import { Order } from "@/lib/types/orders";
import { getCache, setCache } from '@/lib/db';
import SearchField from "@/components/SearchField/SearchField";

const PAGE_SIZE = 50;
const CACHE_KEY = 'wb_orders_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000;

const OrderRow = memo(({ order }: { order: Order }) => (
    <tr>
        <td>{order.date}</td>
        <td>{order.lastChangeDate}</td>
        <td>{order.warehouseName}</td>
        <td>{order.warehouseType}</td>
        <td>{order.countryName}</td>
        <td>{order.oblastOkrugName}</td>
        <td>{order.regionName}</td>
        <td>{order.supplierArticle}</td>
        <td>{order.nmId}</td>
        <td>{order.barcode}</td>
        <td>{order.category}</td>
        <td>{order.subject}</td>
        <td>{order.brand}</td>
        <td>{order.techSize}</td>
        <td>{order.incomeID}</td>
        <td>{order.isSupply}</td>
        <td>{order.isRealization}</td>
        <td>{order.totalPrice} ₽</td>
        <td>{order.discountPercent} ₽</td>
        <td>{order.spp} ₽</td>
        <td>{order.finishedPrice} ₽</td>
        <td>{order.priceWithDisc} ₽</td>
        <td>{order.isCancel}</td>
        <td>{order.cancelDate}</td>
        <td>{order.sticker}</td>
        <td>{order.gNumber}</td>
        <td>{order.srid}</td>
    </tr>
));

OrderRow.displayName = 'OrderRow';

const TableHeader = memo(() => (
    <thead>
    <tr>
        <th>Дата</th>
        <th>Дата обновления</th>
        <th>Склад отгрузки</th>
        <th>Тип склада</th>
        <th>Страна</th>
        <th>Округ</th>
        <th>Регион</th>
        <th>Артикул продавца</th>
        <th>Артикул WB</th>
        <th>Баркод</th>
        <th>Категория</th>
        <th>Предмет</th>
        <th>Бренд</th>
        <th>Размер товара</th>
        <th>Номер поставки</th>
        <th>Договор поставки</th>
        <th>Договор реализации</th>
        <th>Цена без скидок</th>
        <th>Скидка продавца</th>
        <th>Скидка WB</th>
        <th>Цена с учетом всех скидок</th>
        <th>Цена со скидкой продавца</th>
        <th>Отмена заказа</th>
        <th>Дата отмены</th>
        <th>ID стикера</th>
        <th>Номер заказа</th>
        <th>Уникальный ID заказа</th>
    </tr>
    </thead>
));

TableHeader.displayName = 'TableHeader';

export default function OrdersTable() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [debouncedQuery, setDebouncedQuery] = useState<string>('');

    const filterOrders = useCallback((orders: Order[], query: string): Order[] => {
        if (!query.trim()) return orders;

        const lowerQuery = query.toLowerCase().trim();
        return orders.filter(order => {
            return Object.values(order).some(value => {
                if (value == null) return false;
                return String(value).toLowerCase().includes(lowerQuery);
            });
        });
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    useEffect(() => {
        if (allOrders.length > 0) {
            const filtered = filterOrders(allOrders, debouncedQuery);
            setFilteredOrders(filtered);
            setPage(0);
        } else {
            setFilteredOrders([]);
            setPage(0);
        }
    }, [allOrders, debouncedQuery, filterOrders]);

    useEffect(() => {
        if (filteredOrders.length > 0) {
            const endIndex = (page + 1) * PAGE_SIZE;
            const newOrders = filteredOrders.slice(0, endIndex);
            setDisplayedOrders(newOrders);
            setHasMore(endIndex < filteredOrders.length);
        } else {
            setDisplayedOrders([]);
            setHasMore(false);
        }
    }, [page, filteredOrders]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const now = Date.now();

            const cached = await getCache(CACHE_KEY);

            if (cached && cached.timestamp && now - cached.timestamp < CACHE_EXPIRY_MS) {
                setAllOrders(cached.data || []);
                setLastUpdated(new Date(cached.timestamp).toLocaleString());
                return;
            }

            const orders = await fetchOrders(new Date(Date.now() - 80 * 24 * 60 * 1000).toISOString());

            await setCache(CACHE_KEY, {
                data: orders,
                timestamp: now
            });

            setAllOrders(orders);
            setLastUpdated(new Date().toLocaleString());
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;

        if (isNearBottom && !isLoading && hasMore && filteredOrders.length > 0) {
            setPage(prev => prev + 1);
        }
    }, [isLoading, hasMore, filteredOrders.length]);

    const refreshData = useCallback(async () => {
        try {
            setIsLoading(true);
            const orders = await fetchOrders(new Date(Date.now() - 80 * 24 * 60 * 1000).toISOString());

            await setCache(CACHE_KEY, {
                data: orders,
                timestamp: Date.now()
            });

            setAllOrders(orders);
            setPage(0);
            setLastUpdated(new Date().toLocaleString());
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const controls = useMemo(() => (
        <div className={styles.controls}>
            <SearchField
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
                onClick={refreshData}
                disabled={isLoading}
                className={styles.refreshButton}
            >
                {isLoading ? 'Обновление...' : 'Обновить данные'}
            </button>
            {lastUpdated && (
                <div className={styles.lastUpdated}>
                    Данные актуальны на: {lastUpdated}
                </div>
            )}
        </div>
    ), [isLoading, lastUpdated, refreshData, searchQuery]);

    const loadingIndicator = useMemo(() => (
        isLoading && <div className={styles.loading}>Загрузка...</div>
    ), [isLoading]);

    const endMessage = useMemo(() => {
        if (filteredOrders.length === 0 && allOrders.length > 0) {
            return (
                <div className={styles.loading}>
                    Ничего не найдено по запросу "{debouncedQuery}"
                </div>
            );
        }

        if (!hasMore && filteredOrders.length > 0) {
            return (
                <div className={styles.loading}>
                    Показано {displayedOrders.length} из {filteredOrders.length} записей
                </div>
            );
        }

        return null;
    }, [hasMore, filteredOrders.length, displayedOrders.length, allOrders.length, debouncedQuery]);

    return (
        <div className={styles.tableContainer} onScroll={handleScroll}>
            {controls}

            <table className={styles.ordersTable}>
                <TableHeader />
                <tbody>
                {displayedOrders.map((order) => (
                    <OrderRow key={order.srid} order={order} />
                ))}
                </tbody>
            </table>

            {loadingIndicator}
            {endMessage}
        </div>
    )
}