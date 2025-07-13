'use client'
import styles from '../sales.module.css';
import React, { memo, useCallback } from 'react';
import { fetchSales } from '@/lib/api/wbSales';
import { Sale } from "@/lib/types/sales";
import { useTableData } from '@/hooks/useTableData';
import TableWrapper from '@/components/TableWrapper/TableWrapper';
import TableControls from '@/components/TableControls/TableControls';
import TableStatus from '@/components/TableStatus/TableStatus';

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
                <td>{sale.warehouseType}</td>
                <td>{sale.countryName}</td>
                <td>{sale.oblastOkrugName}</td>
                <td>{sale.regionName}</td>
                <td>{sale.supplierArticle}</td>
                <td>{sale.nmId}</td>
                <td>{sale.barcode}</td>
                <td>{sale.category}</td>
                <td>{sale.subject}</td>
                <td>{sale.brand}</td>
                <td>{sale.techSize}</td>
                <td>{sale.incomeID}</td>
                <td>{sale.isSupply ? 'Да' : 'Нет'}</td>
                <td>{sale.isRealization ? 'Да' : 'Нет'}</td>
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
        return await fetchSales(new Date(Date.now() - 80 * 24 * 60 * 1000).toISOString());
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
            <TableControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={refreshData}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
            />

            <table className={styles.orderTable}>
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