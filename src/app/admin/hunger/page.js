'use client';
import Link from 'next/link';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { AlertTriangle, Wallet } from 'lucide-react';

export default function HungerPage() {
    const { t } = useLanguage();

    const services = [
        {
            key: 'hungerDisabilities',
            title: t('hunger.disabilitiesTitle'),
            description: t('hunger.disabilitiesDesc'),
            icon: AlertTriangle,
            href: '/admin/shifts/hunger-disabilities',
            gradient: 'from-orange-500 to-red-500',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
        },
        {
            key: 'wallet',
            title: t('hunger.walletTitle'),
            description: t('hunger.walletDesc'),
            icon: Wallet,
            href: '/admin/hunger/wallet',
            gradient: 'from-emerald-500 to-teal-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('hunger.title')}
                subtitle={t('hunger.subtitle')}
                icon={AlertTriangle}
            />

            <div className="container mx-auto px-4 mt-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {services.map((service) => {
                        const Icon = service.icon;
                        return (
                            <Link
                                key={service.key}
                                href={service.href}
                                className={`group relative overflow-hidden rounded-2xl border ${service.border} ${service.bg} p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                            >
                                {/* Gradient accent bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient}`} />

                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${service.iconBg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={32} className={service.iconColor} />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{service.description}</p>

                                <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                                    {t('hunger.openService')}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
