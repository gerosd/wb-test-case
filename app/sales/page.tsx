import styles from '@/styles/table.module.css';
import SalesTable from "@/app/sales/components/SalesTable";

export default function SalesPage() {
    return (
        <div className={styles.tableContainer}>
            <SalesTable/>
        </div>
    )
}