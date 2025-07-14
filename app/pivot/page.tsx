import styles from '@/styles/table.module.css';
import PivotTable from './components/PivotTable';

export default function PivotPage() {
    return (<div className={styles.tableContainer}>
            <PivotTable/>;
        </div>
    )
}