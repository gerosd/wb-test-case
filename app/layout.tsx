import './globals.css'
import {Montserrat} from "next/font/google";
import type { Metadata } from 'next'
import LeftPanel from '@/components/leftPanel/leftPanel'

export const metadata: Metadata = {
    title: 'Товары WB',
    description: 'Товары WB',
}

const monserrat = Montserrat({
    subsets: ['cyrillic', 'latin']
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru">
        <body className={monserrat.className}>
            <LeftPanel/>
            {children}
        </body>
        </html>
    )
}
