'use client'
import React, { memo, useCallback } from 'react';
import { Sale } from "@/lib/types/sales";
import { useTableData } from '@/hooks/useTableData';
import TableWrapper from '@/components/TableWrapper/TableWrapper';
import TableControls from '@/components/TableControls/TableControls';
import TableStatus from '@/components/TableStatus/TableStatus';
import { getSales } from '@/actions/getSales';

const CACHE_KEY = 'wb_sales_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000;

const SaleRow = memo(({ sale }: { sale: Sale }) => {
    try {
        JSON.stringify(sale);
        return (
            <tr>
                <td>{sale.date}</td>
                <td>{sale.lastChangeDate}</td>
                <td>{sale.warehouseName}</td>
                <td>{sale.countryName}</td>
                <td>{sale.regionName}</td>
                <td>{sale.supplierArticle}</td>
                <td><a href={`https://www.wildberries.ru/catalog/${sale.nmId}/detail.aspx`} target="_blank">{sale.nmId}</a></td>
                <td>{sale.barcode}</td>
                <td>{sale.subject}</td>
                <td>{sale.brand}</td>
                <td>{sale.incomeID}</td>
                <td>{sale.totalPrice} ₽</td>
                <td>{sale.discountPercent} %</td>
                <td>{sale.spp} ₽</td>
                <td>{sale.paymentSaleAmount} ₽</td>
                <td>{sale.forPay} ₽</td>
                <td>{sale.finishedPrice} ₽</td>
                <td>{sale.priceWithDisc} ₽</td>
                <td>{sale.saleID}</td>
                <td>{sale.sticker}</td>
                <td>{sale.gNumber}</td>
                <td>{sale.srid}</td>
            </tr>
        )
    }
    catch (error) {
        console.error('Failed to render sale row due to:', error);
        return null;
    }
});

SaleRow.displayName = 'SaleRow';

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
        <th>Скидка за оплату WB Кошельком</th>
        <th>К перечислению продавцу</th>
        <th>Фактическая цена с учетом всех скидок</th>
        <th>Цена со скидкой продавца</th>
        <th>Уникальный ID продажи/возврата</th>
        <th>ID стикера</th>
        <th>Номер заказа</th>
        <th>Уникальный ID заказа</th>
    </tr>
    </thead>
));

TableHeader.displayName = 'TableHeader';

export default function SalesTable() {
    const fetchFunction = useCallback(async () => {
        const response = await getSales(new Date(Date.now() - 80 * 24 * 60 * 1000).toISOString());
        if (response.error) {
            console.error(response.error);
            return [];
        }
        return response.data || [];
    }, []);

    const {
        displayedItems: displayedSales,
        filteredItems: filteredSales,
        allItems: allSales,
        isLoading,
        hasMore,
        lastUpdated,
        searchQuery,
        debouncedQuery,
        setSearchQuery,
        refreshData,
        handleScroll
    } = useTableData<Sale>({
        fetchFunction,
        cacheKey: CACHE_KEY,
        storeName: 'sales',
        cacheExpiryMs: CACHE_EXPIRY_MS
    });

    return (
        <TableWrapper onScroll={handleScroll}>
            <h1 style={{textAlign: "center"}}>Таблица продаж</h1>
            <TableControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={refreshData}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
            />

            <table>
                <TableHeader/>
                <tbody>
                {displayedSales.map((sale) => (
                    <SaleRow key={sale.srid} sale={sale}/>
                ))}
                </tbody>
            </table>
            <TableStatus
                isLoading={isLoading}
                hasMore={hasMore}
                filteredCount={filteredSales.length}
                displayedCount={displayedSales.length}
                totalCount={allSales.length}
                searchQuery={debouncedQuery}
            />
        </TableWrapper>
    )
}