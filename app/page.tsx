import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
    return (
        <div className={styles.mainPage}>
            <p>Перейдите по кнопке ниже на интересующую вас таблицу</p>
            <div className={styles.pageLinks}>
                <Link href='/pivot' className={styles.nfButton}>Выручка</Link>
                <Link href="/orders" className={styles.nfButton}>Заказы</Link>
                <Link href="/sales" className={styles.nfButton}>Продажи</Link>
                <Link href='/products' className={styles.nfButton}>Товары</Link>
            </div>
        </div>
    );
}
