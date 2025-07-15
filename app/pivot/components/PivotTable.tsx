'use client'
import React, { memo, useCallback, useState, useMemo } from 'react';
import { PivotItem } from '@/actions/getPivotData';
import { useTableData } from '@/hooks/useTableData';
import TableWrapper from '@/components/TableWrapper/TableWrapper';
import TableControls from '@/components/TableControls/TableControls';
import TableStatus from '@/components/TableStatus/TableStatus';
import { getPivotData } from '@/actions/getPivotData';

const CACHE_KEY = 'wb_pivot_cache';
const CACHE_EXPIRY_MS = 30 * 60 * 1000;

type SortField = 'forPay' | 'totalSales' | 'totalRevenue';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 2
    }).format(value);
};

const TableHeader = memo(({ sortConfig, onSort }: { 
    sortConfig: SortConfig, 
    onSort: (field: SortField) => void 
}) => {
    const getSortIndicator = (field: SortField) => {
        if (sortConfig.field !== field) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <thead>
            <tr>
                <th>Артикул WB</th>
                <th>Баркод</th>
                <th>Предмет</th>
                <th>Стикер</th>
                <th onClick={() => onSort('forPay')} style={{ cursor: 'pointer' }}>
                    К перечислению {getSortIndicator('forPay')}
                </th>
                <th onClick={() => onSort('totalSales')} style={{ cursor: 'pointer' }}>
                    Количество продаж {getSortIndicator('totalSales')}
                </th>
                <th onClick={() => onSort('totalRevenue')} style={{ cursor: 'pointer' }}>
                    Общая выручка {getSortIndicator('totalRevenue')}
                </th>
            </tr>
        </thead>
    );
});

TableHeader.displayName = 'TableHeader';

const PivotRow = memo(({ item }: { item: PivotItem }) => (
    <tr>
        <td><a href={`https://www.wildberries.ru/catalog/${item.nmId}/detail.aspx`} target="_blank">{item.nmId}</a></td>
        <td>{item.barcode}</td>
        <td>{item.subject}</td>
        <td>{item.sticker}</td>
        <td>{formatCurrency(item.forPay)}</td>
        <td>{item.totalSales}</td>
        <td>{formatCurrency(item.totalRevenue)}</td>
    </tr>
));

PivotRow.displayName = 'PivotRow';

export default function PivotTable() {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'totalRevenue',
        direction: 'desc'
    });

    const fetchFunction = useCallback(async () => {
        const startDate = new Date(Date.now() - 80 * 24 * 60 * 1000).toISOString();
        const response = await getPivotData(startDate);
        if (response.error) {
            console.error(response.error);
            return [];
        }
        return response.data;
    }, []);

    const {
        displayedItems: displayedPivotItems,
        filteredItems: filteredPivotItems,
        allItems: allPivotItems,
        isLoading,
        lastUpdated,
        searchQuery,
        debouncedQuery,
        setSearchQuery,
        refreshData,
        handleScroll
    } = useTableData<PivotItem>({
        fetchFunction,
        cacheKey: CACHE_KEY,
        storeName: 'pivot',
        cacheExpiryMs: CACHE_EXPIRY_MS
    });

    const sortedItems = useMemo(() => {
        return [...displayedPivotItems].sort((a, b) => {
            const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
            const field = sortConfig.field;
            
            if (typeof a[field] === 'number' && typeof b[field] === 'number') {
                return (a[field] as number - b[field] as number) * multiplier;
            }
            return 0;
        });
    }, [displayedPivotItems, sortConfig]);

    const handleSort = useCallback((field: SortField) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    }, []);

    const totals = useMemo(() => {
        return filteredPivotItems.reduce((acc, item) => ({
            totalSales: acc.totalSales + item.totalSales,
            totalRevenue: acc.totalRevenue + item.totalRevenue
        }), { totalSales: 0, totalRevenue: 0 });
    }, [filteredPivotItems]);

    return (
        <TableWrapper onScroll={handleScroll}>
            <h1 style={{textAlign: "center"}}>Сводная таблица заказов и продаж</h1>
            <TableControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={refreshData}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
            />

            <div style={{color: "var(--text-color)", margin: '0 0.5rem 1rem 0', textAlign: 'right' }}>
                <strong>Итого: </strong>
                Продаж: {totals.totalSales}, 
                Выручка: {formatCurrency(totals.totalRevenue)}
            </div>

            <table>
                <TableHeader sortConfig={sortConfig} onSort={handleSort} />
                <tbody>
                    {sortedItems.map((item) => (
                        <PivotRow key={item.nmId} item={item} />
                    ))}
                </tbody>
            </table>

            <TableStatus
                isLoading={isLoading}
                hasMore={false}
                filteredCount={filteredPivotItems.length}
                displayedCount={sortedItems.length}
                totalCount={allPivotItems.length}
                searchQuery={debouncedQuery}
            />
        </TableWrapper>
    );
} 