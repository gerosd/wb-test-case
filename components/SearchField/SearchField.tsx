"use client"
import React, { ReactElement, ChangeEvent } from "react";
import styles from "./searchField.module.css";
import Image from "next/image";
import searchIcon from '@/public/search.svg';

interface SearchFieldProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SearchField = ({ value, onChange }: SearchFieldProps): ReactElement => (
    <label htmlFor="search" className={styles.searchField}>
        <input
            type="text"
            id="search"
            value={value}
            onChange={onChange}
            placeholder="Поиск по всем полям"
        />
        <Image src={searchIcon} alt="Search"/>
    </label>
);

SearchField.displayName = 'SearchField';
export default SearchField;