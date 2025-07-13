import { Sale } from "@/lib/types/sales";

export async function fetchSales(dateFrom: string): Promise<Sale[]> {
    const res = await fetch(`/api/sales?dateFrom=${encodeURIComponent(dateFrom)}`, {
        next: { revalidate: 1800 },
    });

    if (!res.ok) {
        throw new Error(`Error fetching sales: ${res.statusText}`);
    }

    return res.json();
}