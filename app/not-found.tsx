import Link from 'next/link';
import styles from './notFoundWrapper.module.css';

export default function NotFound() {
    return (
        <div className={styles.notFoundWrapper}>
            <h1>Страница не найдена</h1>
            <p>К сожалению, запрашиваемая страница не существует.</p>
            <div className={styles.linksList}>
                <Link href='/pivot' className={styles.nfButton}>Выручка</Link>
                <Link href="/orders" className={styles.nfButton}>Заказы</Link>
                <Link href="/sales" className={styles.nfButton}>Продажи</Link>
                <Link href='/products' className={styles.nfButton}>Товары</Link>
            </div>
        </div>
    )
}