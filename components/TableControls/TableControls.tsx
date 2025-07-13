import React from 'react';
import styles from './tableControls.module.css';
import SearchField from "@/components/SearchField/SearchField";

interface TableControlsProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
    isLoading: boolean;
    lastUpdated: string;
    additionalControls?: React.ReactNode;
    className?: string;
}

export default function TableControls({
                                          searchQuery,
                                          onSearchChange,
                                          onRefresh,
                                          isLoading,
                                          lastUpdated,
                                          additionalControls,
                                          className = ''
                                      }: TableControlsProps) {
    return (
        <div className={`${styles.controls} ${className}`}>
            {additionalControls}

            <SearchField value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}/>

            <button
                onClick={onRefresh}
                disabled={isLoading}
                className={styles.refreshButton}
            >
                {isLoading ? 'Обновление...' : 'Обновить данные'}
            </button>

            {lastUpdated && (
                <div className={styles.lastUpdated}>
                    Данные актуальны на: {lastUpdated}
                </div>
            )}
        </div>
    );
}