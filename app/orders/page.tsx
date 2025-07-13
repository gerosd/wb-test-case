import styles from '@/styles/table.module.css';
import ProductsTable from "@/app/orders/components/OrdersTable";

export default function OrdersPage() {
    return (
        <div className={styles.tableContainer}>
            <ProductsTable/>
        </div>
    )
}