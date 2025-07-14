export interface Order {
    date: string;
    lastChangeDate: string;
    warehouseName: string;
    countryName: string;
    regionName: string;
    supplierArticle: string;
    nmId: number;
    barcode: string;
    subject: string;
    brand: string;
    incomeID: number;
    totalPrice: number;
    discountPercent: number;
    spp: number;
    finishedPrice: number;
    priceWithDisc: number; //= totalPrice * (1 - discountPercent/100)
    isCancel: boolean;
    cancelDate: string;
    sticker: string;
    gNumber: string;
    srid: string; // srid === rid
}