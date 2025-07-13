'use client'
import styles from '../orders.module.css';
import React, { memo, useCallback } from 'react';
import { fetchOrders } from '@/lib/api/wbOrders';
import { Order } from "@/lib/types/orders";
import { useTableData } from '@/hooks/useTableData';
import TableWrapper from '@/components/TableWrapper/TableWrapper';
import TableControls from '@/components/TableControls/TableControls';
import TableStatus from '@/components/TableStatus/TableStatus';

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
        <td>{order.isSupply ? 'Да' : 'Нет'}</td>
        <td>{order.isRealization ? 'Да' : 'Нет'}</td>
        <td>{order.totalPrice} ₽</td>
        <td>{order.discountPercent}%</td>
        <td>{order.spp} ₽</td>
        <td>{order.finishedPrice} ₽</td>
        <td>{order.priceWithDisc} ₽</td>
        <td>{order.isCancel ? 'Да' : 'Нет'}</td>
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
    const fetchFunction = useCallback(async () => {
        return await fetchOrders(new Date(Date.now() - 80 * 24 * 60 * 1000).toISOString());
    }, []);

    const {
        displayedItems: displayedOrders,
        filteredItems: filteredOrders,
        allItems: allOrders,
        isLoading,
        hasMore,
        lastUpdated,
        searchQuery,
        debouncedQuery,
        setSearchQuery,
        refreshData,
        handleScroll
    } = useTableData<Order>({
        fetchFunction,
        cacheKey: CACHE_KEY,
        storeName: 'orders',
        cacheExpiryMs: CACHE_EXPIRY_MS
    });

    return (
        <TableWrapper onScroll={handleScroll}>
            <TableControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={refreshData}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
            />

            <table className={styles.ordersTable}>
                <TableHeader />
                <tbody>
                {displayedOrders.map((order) => (
                    <OrderRow key={order.srid} order={order} />
                ))}
                </tbody>
            </table>

            <TableStatus
                isLoading={isLoading}
                hasMore={hasMore}
                filteredCount={filteredOrders.length}
                displayedCount={displayedOrders.length}
                totalCount={allOrders.length}
                searchQuery={debouncedQuery}
            />
        </TableWrapper>
    );
}