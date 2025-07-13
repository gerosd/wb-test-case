import {Sale} from "@/lib/types/sales";

export async function fetchSales(dateFrom: string): Promise<Sale[]> {
    const res = await fetch(`/api/sales?dateFrom=${encodeURIComponent(dateFrom)}`, {
        next: { revalidate: 1800 },
    });

    if (!res.ok) {
        throw new Error(`Error fetching sales: ${res.statusText}`);
    }

    const data = await res.json();

    try {
        JSON.stringify(data);
    } catch (e) {
        console.error('Data contains circular references:', e);
        throw new Error('Data contains circular references');
    }

    return data;
}