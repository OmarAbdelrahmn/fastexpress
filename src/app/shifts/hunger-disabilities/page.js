'use client';
import PageHeader from '@/components/layout/pageheader';
import Link from 'next/link';
import { useLanguage } from '@/lib/context/LanguageContext';
import {
    Utensils,
    File,
    ChartBar,
    Calendar,
    User,
    ArrowUp,
    ArrowDown,
    UserCheck,
    UserX,
    Home
} from 'lucide-react';

export default function HungerDisabilitiesPage() {
    const { t } = useLanguage();

    const menuItems = [
        {
            title: t('hungerDisabilities.importFile'),
            description: t('hungerDisabilities.importFileDesc'),
            icon: File,
            href: '/shifts/hunger-disabilities/import',
            color: 'bg-blue-500'
        },
        {
            title: t('hungerDisabilities.summary'),
            description: t('hungerDisabilities.summaryDesc'),
            icon: ChartBar,
            href: '/shifts/hunger-disabilities/summary',
            color: 'bg-indigo-500'
        },
        {
            title: t('hungerDisabilities.dateRange'),
            description: t('hungerDisabilities.dateRangeDesc'),
            icon: Calendar,
            href: '/shifts/hunger-disabilities/date-range',
            color: 'bg-purple-500'
        },
        {
            title: t('hungerDisabilities.monthly'),
            description: t('hungerDisabilities.monthlyDesc'),
            icon: Calendar,
            href: '/shifts/hunger-disabilities/month',
            color: 'bg-pink-500'
        },
        {
            title: t('hungerDisabilities.yearly'),
            description: t('hungerDisabilities.yearlyDesc'),
            icon: Calendar,
            href: '/shifts/hunger-disabilities/year',
            color: 'bg-rose-500'
        },
        {
            title: t('hungerDisabilities.riderDeficit'),
            description: t('hungerDisabilities.riderDeficitDesc'),
            icon: User,
            href: '/shifts/hunger-disabilities/rider',
            color: 'bg-cyan-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('hungerDisabilities.title')}
                subtitle={t('hungerDisabilities.subtitle')}
                icon={Home}
            />

            <div className="container mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
                        >
                            <div className="p-6">
                                <div className={`w-14 h-14 rounded-lg ${item.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

