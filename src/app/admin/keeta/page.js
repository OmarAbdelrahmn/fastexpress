'use client';
import Link from 'next/link';
import PageHeader from '@/components/layout/pageheader';
import { useLanguage } from '@/lib/context/LanguageContext';
import { CalendarDays, Users } from 'lucide-react';

export default function KeetaPage() {
    const { t } = useLanguage();

    const services = [
        {
            key: 'monthlyShifts',
            title: t('keta.monthlyShiftsTitle'),
            description: t('keta.monthlyShiftsDesc'),
            icon: CalendarDays,
            href: '/admin/keeta/monthly-shifts',
            gradient: 'from-indigo-500 to-blue-600',
            bg: 'bg-indigo-50',
            border: 'border-indigo-200',
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
        },
        {
            key: 'freelancer',
            title: t('keta.freelancerTitle'),
            description: t('keta.freelancerDesc'),
            icon: Users,
            href: '/admin/shifts/keta-freelancer',
            gradient: 'from-violet-500 to-purple-600',
            bg: 'bg-violet-50',
            border: 'border-violet-200',
            iconBg: 'bg-violet-100',
            iconColor: 'text-violet-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <PageHeader
                title={t('keta.title')}
                subtitle={t('keta.subtitle')}
                icon={CalendarDays}
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
                                    {t('keta.openService')}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
