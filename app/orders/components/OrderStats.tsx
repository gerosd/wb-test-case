'use client'
import React, { useMemo } from 'react';
import { Order } from "@/lib/types/orders";
import styles from './orderStats.module.css';

interface OrderStatsProps {
    orders: Order[];
}

const OrderStats = ({ orders }: OrderStatsProps) => {
    const stats = useMemo(() => {
        const total = orders.length;
        const cancelled = orders.filter(order => order.isCancel).length;
        const active = total - cancelled;
        
        const cancelPercentage = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0';
        const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : '0';

        return {
            total,
            cancelled,
            active,
            cancelPercentage,
            activePercentage
        };
    }, [orders]);

    return (
        <div className={styles.orderStatsWrapper}>
            <h2>Статистика заказов</h2>
            <div className={styles.orderStatsContainer}>
                <div>
                    <h3>Всего заказов</h3>
                    <p style={{ fontSize: '1.5rem', margin: 0 }}>{stats.total}</p>
                </div>
                <div>
                    <h3 style={{ color: '#4CAF50' }}>Успешные заказы</h3>
                    <p style={{ fontSize: '1.5rem', margin: 0, color: '#4CAF50' }}>
                        {stats.active} ({stats.activePercentage}%)
                    </p>
                </div>
                <div>
                    <h3 style={{ color: '#f44336' }}>Отмененные заказы</h3>
                    <p style={{ fontSize: '1.5rem', margin: 0, color: '#f44336' }}>
                        {stats.cancelled} ({stats.cancelPercentage}%)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderStats; 