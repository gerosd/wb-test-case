import React from 'react';
import styles from './tableStatus.module.css';

interface TableStatusProps {
    isLoading: boolean;
    hasMore: boolean;
    filteredCount: number;
    displayedCount: number;
    totalCount: number;
    searchQuery: string;
    className?: string;
}

export default function TableStatus({
                                        isLoading,
                                        hasMore,
                                        filteredCount,
                                        displayedCount,
                                        totalCount,
                                        searchQuery,
                                        className = ''
                                    }: TableStatusProps) {
    if (isLoading) {
        return (
            <div className={`${styles.status} ${className}`}>
                <div className={styles.loading}>Загрузка...</div>
            </div>
        );
    }

    if (filteredCount === 0 && totalCount > 0) {
        return (
            <div className={`${styles.status} ${className}`}>
                <div className={styles.noResults}>
                    Ничего не найдено по запросу &quot;{searchQuery}&quot;
                </div>
            </div>
        );
    }

    if (totalCount === 0) {
        return (
            <div className={`${styles.status} ${className}`}>
                <div className={styles.noData}>
                    Нет данных для отображения
                </div>
            </div>
        );
    }

    if (!hasMore && filteredCount > 0) {
        return (
            <div className={`${styles.status} ${className}`}>
                <div className={styles.summary}>
                    {searchQuery ? (
                        <>
                            `Показано {displayedCount} из {filteredCount} записей`
                            {filteredCount !== totalCount && (
                                <span className={styles.totalCount}>
                                    {' '}(всего: {totalCount})
                                </span>
                            )}
                        </>
                    ) : (
                        `Показано ${displayedCount} из ${filteredCount} записей`
                    )}
                </div>
            </div>
        );
    }

    return null;
}