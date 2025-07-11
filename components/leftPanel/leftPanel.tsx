import styles from './leftPanel.module.css';
import Link from "next/link";

export default function LeftPanel() {
    return (
        <div className={styles.leftPanel}>
            <h1>Данные с WB</h1>
            <div className={styles.panelContent}>
                <Link href='/products' className={`${styles.contentButton} ${styles.activePage}`}>Все товары</Link>
                <Link href='/search' className={styles.contentButton}>Поиск по товарам</Link>
            </div>
        </div>
    )
}