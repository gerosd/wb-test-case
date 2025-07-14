export interface Sale {
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
    paymentSaleAmount: number;
    forPay: number;
    finishedPrice: number;
    priceWithDisc: number; // = totalPrice * (1 - discountPercent/100)
    saleID: number;
    sticker: string;
    gNumber: string;
    srid: string; // srid === rid
}