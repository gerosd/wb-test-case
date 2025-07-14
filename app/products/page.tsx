import styles from '@/styles/table.module.css';
import ProductsTable from "./components/ProductsTable";

export default function ProductsPage() {
    return (
        <div className={styles.tableContainer}>
            <ProductsTable />
        </div>
    )
} 