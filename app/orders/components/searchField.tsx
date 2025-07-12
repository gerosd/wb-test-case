"use client"
import React, {ReactElement} from "react";
import styles from "../orders.module.css";
import Image from "next/image";
import searchIcon from '@/public/search.svg';

export default function SearchField(): ReactElement {
    const [inputValue, setInputValue] = React.useState("");

    return (
        <label htmlFor="search" className={styles.searchField}>
            <input
                type="text"
                id="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Поиск товаров"
            />
            <Image src={searchIcon} alt="Search" />
        </label>
    )
}