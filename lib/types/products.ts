export interface Product {
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
}

export interface ProductCursor {
    updatedAt: string;
    nmID: number;
    total: number;
}

export interface ProductResponse {
    data: Product[];
    cursor?: ProductCursor;
    error?: string;
}