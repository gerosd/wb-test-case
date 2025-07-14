'use client'
import React, { memo, useCallback } from 'react';
import { Order } from "@/lib/types/orders";
import { useTableData } from '@/hooks/useTableData';
import TableWrapper from '@/components/TableWrapper/TableWrapper';
import TableControls from '@/components/TableControls/TableControls';
import TableStatus from '@/components/TableStatus/TableStatus';
import { getOrders } from '@/actions/getOrders';

const CACHE_KEY = 'wb_orders_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000;

const OrderRow = memo(({ order }: { order: Order }) => (
    <tr>
        <td>{order.date}</td>
        <td>{order.lastChangeDate}</td>
        <td>{order.warehouseName}</td>
        <td>{order.countryName}</td>
        <td>{order.regionName}</td>
        <td>{order.supplierArticle}</td>
        <td><a href={`https://www.wildberries.ru/catalog/${order.nmId}/detail.aspx`} target="_blank">{order.nmId}</a></td>
        <td>{order.barcode}</td>
        <td>{order.subject}</td>
        <td>{order.brand}</td>
        <td>{order.incomeID}</td>
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
        <th>Страна</th>
        <th>Регион</th>
        <th>Артикул продавца</th>
        <th>Артикул WB</th>
        <th>Баркод</th>
        <th>Предмет</th>
        <th>Бренд</th>
        <th>Номер поставки</th>
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
        const response = await getOrders(new Date(Date.now() - 80 * 24 * 60 * 1000).toISOString());
        if (response.error) {
            console.error(response.error);
            return [];
        }
        return response.data || [];
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
            <h1 style={{textAlign: "center"}}>Таблица заказов</h1>
            <TableControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={refreshData}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
            />

            <table>
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