import React from 'react';
import styles from './tableWrapper.module.css';

interface TableWrapperProps {
    children: React.ReactNode;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    className?: string;
}

export default function TableWrapper({
                                         children,
                                         onScroll,
                                         className = ''
                                     }: TableWrapperProps) {
    return (
        <div
            className={`${styles.tableContainer} ${className}`}
            onScroll={onScroll}
        >
            {children}
        </div>
    );
}