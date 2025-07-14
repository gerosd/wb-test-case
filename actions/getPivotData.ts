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

        if (ordersResponse.error) {
            return { data: [], error: `Orders error: ${ordersResponse.error}` };
        }

        if (salesResponse.error) {
            return { data: [], error: `Sales error: ${salesResponse.error}` };
        }

        const pivotMap = new Map<number, PivotItem>();

        ordersResponse.data?.forEach(order => {
            if (!pivotMap.has(order.nmId)) {
                pivotMap.set(order.nmId, {
                    nmId: order.nmId,
                    barcode: order.barcode,
                    subject: order.subject,
                    sticker: order.sticker,
                    forPay: 0,
                    totalSales: 0,
                    totalRevenue: 0
                });
            }
        });

        salesResponse.data?.forEach(sale => {
            const item = pivotMap.get(sale.nmId);
            if (item) {
                item.forPay = sale.forPay;
                item.totalSales++;
                item.totalRevenue += sale.forPay;
            } else {
                pivotMap.set(sale.nmId, {
                    nmId: sale.nmId,
                    barcode: sale.barcode,
                    subject: sale.subject,
                    sticker: sale.sticker,
                    forPay: sale.forPay,
                    totalSales: 1,
                    totalRevenue: sale.forPay
                });
            }
        });

        return {
            data: Array.from(pivotMap.values())
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
        };
    } catch (error) {
        console.error('Failed to fetch pivot data:', error);
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Failed to fetch pivot data'
        };
    }
} 