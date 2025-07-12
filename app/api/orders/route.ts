import { NextResponse } from "next/server";
import {Order} from "@/lib/types/orders";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');

    if (!dateFrom) {
        return NextResponse.json(
            { error: 'Parameter dateFrom is required' },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders?dateFrom=${encodeURIComponent(dateFrom)}`, {
            headers: {
                'Authorization': `${process.env.AUTH_KEY}`,
            },
        });

        if (!res.ok) {
            throw new Error(`API responded with status ${res.status}`);
        }

        const data: Order[] = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}