'use client';

import { useLanguage } from '@/lib/context/LanguageContext';

export default function VehiclesLayout({ children }) {
    const { direction } = useLanguage();
    return <div dir={direction}>{children}</div>;
}
