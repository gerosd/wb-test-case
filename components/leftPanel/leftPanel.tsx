import styles from './leftPanel.module.css';
import Link from "next/link";

export default function LeftPanel() {
    return (
        <div className={styles.leftPanel}>
            <h1>Данные с WB</h1>
            <div className={styles.panelContent}>
                <Link href='/orders' className={styles.contentButton}>Заказы</Link>
                <Link href='/sales' className={styles.contentButton}>Продажи</Link>
            </div>
        </div>
    )
}