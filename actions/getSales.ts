"use server";
import { Sale } from "@/lib/types/sales";

export const getSales = async (dateFrom: string): Promise<{ data?: Sale[], error?: string }> => {
    if (!dateFrom) {
        return { error: 'Parameter dateFrom is required' };
    }

    try {
        const res = await fetch(`https://statistics-api.wildberries.ru/api/v1/supplier/sales?dateFrom=${encodeURIComponent(dateFrom)}`, {
            headers: {
                'Authorization': `${process.env.AUTH_KEY}`,
            },
        });

        if (!res.ok) {
            throw new Error(`API responded with status ${res.status}`);
        }

        const data: Sale[] = await res.json();
        return { data };
    } catch (error) {
        console.error("Failed to fetch sales:", error);
        return { error: 'Failed to fetch sales. Please try again later.' };
    }
}