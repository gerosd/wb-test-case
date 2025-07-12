import { Order } from "@/lib/types/orders";

export async function fetchOrders(dateFrom: string): Promise<Order[]> {
    const res = await fetch(`/api/orders?dateFrom=${encodeURIComponent(dateFrom)}`, {
        next: { revalidate: 1800 },
    });

    if (!res.ok) {
        throw new Error(`Error fetching orders: ${res.statusText}`);
    }

    return res.json();
}