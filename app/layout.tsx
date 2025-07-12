import type {Metadata} from "next";
import {Montserrat} from "next/font/google";
import "./globals.css";
import React from "react";
import LeftPanel from "@/components/leftPanel/leftPanel";

export const metadata: Metadata = {
    title: "Заказы WB",
    description: "Заказы WB",
};

const monserrat = Montserrat({
    subsets: ['cyrillic', 'latin']
});

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
            <body className={monserrat.className}>
                <LeftPanel/>
                {children}
            </body>
        </html>
    );
}
