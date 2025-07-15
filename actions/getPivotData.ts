'use server'

import { getOrders } from './getOrders';
import { getSales } from './getSales';

export interface PivotItem {
    nmId: number;
    barcode: string;
    subject: string;
    sticker: string;
    forPay: number;
    totalSales: number;
    totalRevenue: number;
}

export async function getPivotData(startDate: string): Promise<{
    data: PivotItem[];
    error?: string;
}> {
    try {
        const [ordersResponse, salesResponse] = await Promise.all([
            getOrders(startDate),
            getSales(startDate)
        ]);

        if (ordersResponse.error || salesResponse.error) {
            return {
                data: [],
                error: [
                    ordersResponse.error && `Orders: ${ordersResponse.error}`,
                    salesResponse.error && `Sales: ${salesResponse.error}`
                ].filter(Boolean).join('; ')
            };
        }

        const pivotMap = new Map<number, PivotItem>();

        ordersResponse.data?.forEach(({ nmId, barcode, subject, sticker }) => {
            pivotMap.set(nmId, {
                nmId,
                barcode,
                subject,
                sticker,
                forPay: 0,
                totalSales: 0,
                totalRevenue: 0
            });
        });

        salesResponse.data?.forEach(({ nmId, barcode, subject, sticker, forPay }) => {
            const existingItem = pivotMap.get(nmId);
            const amount = forPay || 0;

            if (existingItem) {
                existingItem.forPay = amount;
                existingItem.totalSales += 1;
                existingItem.totalRevenue += amount;
            } else {
                pivotMap.set(nmId, {
                    nmId,
                    barcode: barcode || '',
                    subject: subject || '',
                    sticker: sticker || '',
                    forPay: amount,
                    totalSales: 1,
                    totalRevenue: amount
                });
            }
        });

        const sortedData = Array.from(pivotMap.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue);

        return { data: sortedData };
    } catch (error) {
        console.error('Failed to fetch pivot data:', error);
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch pivot data'
        };
    }
}