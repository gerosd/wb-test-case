'use server'
import { Order } from "@/lib/types/orders";

export const getOrders = async (dateFrom: string): Promise<{ data?: Order[], error?: string }> => {
    if (!dateFrom) {
        return { error: 'Parameter dateFrom is required' };
    }

    try {
        const res = await fetch(`https://statistics-api.wildberries.ru/api/v1/supplier/orders?dateFrom=${encodeURIComponent(dateFrom)}`, {
            headers: {
                'Authorization': `${process.env.AUTH_KEY}`,
            },
        });

        if (!res.ok) {
            throw new Error(`API responded with status ${res.status}`);
        }

        const data: Order[] = await res.json();
        return { data };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return { error: 'Failed to fetch orders. Please try again later.' };
    }
}