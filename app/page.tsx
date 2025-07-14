import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
    return (
        <div className={styles.mainPage}>
            <p>Перейдите по кнопке ниже на интересующую вас таблицу</p>
            <div className={styles.pageLinks}>
                <Link href="/orders" className={styles.nfButton}>Заказы</Link>
                <Link href="/sales" className={styles.nfButton}>Продажи</Link>
            </div>
        </div>
    );
}
