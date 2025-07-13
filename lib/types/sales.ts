export interface Sale {
    date: string;
    lastChangeDate: string;
    warehouseName: string;
    warehouseType: string;
    countryName: string;
    oblastOkrugName: string;
    regionName: string;
    supplierArticle: string;
    nmId: number;
    barcode: string;
    category: string;
    subject: string;
    brand: string;
    techSize: string;
    incomeID: number;
    isSupply: boolean;
    isRealization: boolean;
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