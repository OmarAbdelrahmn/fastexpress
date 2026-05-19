'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/maintenance/money-spending?tab=allHousingsDetails');
    }, [router]);

    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <span className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );
}
