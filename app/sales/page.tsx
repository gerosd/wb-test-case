import styles from './sales.module.css';
import SalesTable from "@/app/sales/components/SalesTable";

export default function SalesPage() {
    return (
        <div className={styles.salesPage}>
            <SalesTable/>
        </div>
    )
}