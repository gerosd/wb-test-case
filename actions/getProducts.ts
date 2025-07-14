'use server'
import {Product, ProductResponse} from "@/lib/types/products";

interface GetProductsParams {
    cursor?: {
        updatedAt?: string;
        nmID?: number;
    };
    filter: {
        textSearch?: string;
    };
}

interface RawProduct {
    nmID: number;
    imtID: number;
    nmUUID: string;
    subjectID: number;
    subjectName: string;
    vendorCode: string;
    brand: string;
    title: string;
    photos: [{
        c246x328: string;
    }];
    createdAt: string;
    updatedAt: string;
    [key: string]: unknown;
}

interface RawApiResponse {
    cards: RawProduct[];
    cursor: {
        updatedAt: string;
        nmID: number;
        total: number;
    };
    [key: string]: unknown;
}

export const getProducts = async (params: GetProductsParams): Promise<{
    data: Product[],
    cursor: ProductResponse['cursor'] | undefined,
    error?: string
}> => {
    try {
        const response = await fetch('https://content-api.wildberries.ru/content/v2/get/cards/list', {
            method: 'POST',
            headers: {
                'Authorization': `${process.env.AUTH_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                settings: {
                    filter: {
                        ...params.filter,
                        withPhoto: -1
                    },
                    cursor: {
                        limit: 100,
                        ...(params.cursor && {
                            updatedAt: params.cursor.updatedAt,
                            nmID: params.cursor.nmID
                        })
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            return {data: [], cursor: undefined, error: `API Error: ${response.status} ${response.statusText}`};
        }

        const data = await response.json() as RawApiResponse;

        if (!data || typeof data !== 'object') {
            console.error('Invalid API response format:', data);
            return {data: [], cursor: undefined, error: 'Invalid API response format'};
        }

        if (!Array.isArray(data.cards)) {
            console.error('Invalid cards data:', data);
            return {data: [], cursor: undefined, error: 'Invalid cards data format'};
        }

        const transformedCards: Product[] = data.cards.map(card => ({
            nmID: card.nmID,
            imtID: card.imtID,
            nmUUID: card.nmUUID,
            subjectID: card.subjectID,
            subjectName: card.subjectName,
            vendorCode: card.vendorCode,
            brand: card.brand,
            title: card.title,
            photos: Array.isArray(card.photos) && card.photos.length > 0 ? 
                [{ c246x328: card.photos[0]?.c246x328 || '' }] : 
                [{ c246x328: '' }],
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
        }));

        const cursor = data.cursor && data.cursor.total >= 100 ? {
            updatedAt: data.cursor.updatedAt,
            nmID: data.cursor.nmID,
            total: data.cursor.total
        } : undefined;

        return {
            data: transformedCards,
            cursor
        };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return {
            data: [],
            cursor: undefined,
            error: error instanceof Error ? error.message : 'Failed to fetch products'
        };
    }
}

export const getProductById = async (nmId: number): Promise<{
    data: Product | null,
    error?: string
}> => {
    try {
        const response = await fetch('https://content-api.wildberries.ru/content/v2/get/cards/list', {
            method: 'POST',
            headers: {
                'Authorization': `${process.env.AUTH_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                settings: {
                    filter: {
                        nmID: nmId,
                        withPhoto: -1
                    },
                    cursor: {
                        limit: 1
                    }
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            return { data: null, error: `API Error: ${response.status} ${response.statusText}` };
        }

        const data = await response.json() as RawApiResponse;

        if (!data || typeof data !== 'object' || !Array.isArray(data.cards) || data.cards.length === 0) {
            return { data: null, error: 'Product not found' };
        }

        const card = data.cards[0];
        const transformedCard: Product = {
            nmID: card.nmID,
            imtID: card.imtID,
            nmUUID: card.nmUUID,
            subjectID: card.subjectID,
            subjectName: card.subjectName,
            vendorCode: card.vendorCode,
            brand: card.brand,
            title: card.title,
            photos: Array.isArray(card.photos) && card.photos.length > 0 ? 
                [{ c246x328: card.photos[0]?.c246x328 || '' }] : 
                [{ c246x328: '' }],
            createdAt: card.createdAt,
            updatedAt: card.updatedAt
        };

        return { data: transformedCard };
    } catch (error) {
        console.error("Failed to fetch product:", error);
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Failed to fetch product'
        };
    }
};