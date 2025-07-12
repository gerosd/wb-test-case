import React from 'react';
import styles from './orders.module.css';
import ProductsTable from "@/app/orders/components/ProductsTable";

export default function OrdersPage() {
    return (
        <div className={styles.ordersContainer}>
            <ProductsTable />
        </div>
    )
}