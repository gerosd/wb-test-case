import React from 'react';
import styles from './orders.module.css';
import SearchField from "@/app/orders/components/searchField";
import ProductsTable from "@/app/orders/components/ProductsTable";

export default function OrdersPage() {
    return (
        <div className={styles.ordersContainer}>
            <SearchField />
            <ProductsTable />
        </div>
    )
}