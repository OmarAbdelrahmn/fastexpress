'use client';

import { useLanguage } from '@/lib/context/LanguageContext';

/**
 * StatusBadge Component
 * Displays employee/rider status with appropriate colors and labels
 * 
 * Status Colors:
 * - enable (Active): Green - Active/Working
 * - disable (Inactive): Red - Inactive
 * - fleeing (Fleeing): Dark Red/Crimson - Critical situation
 * - vacation (On Vacation): Blue - Temporary absence
 * - accident (Accident): Orange - Medical leave due to accident
 * - sick (Sick): Yellow/Amber - Medical leave due to illness
 */

export default function StatusBadge({ status }) {
    const { t } = useLanguage();

    const statusConfig = {
        enable: {
            labelKey: 'status.enable',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
        },
        disable: {
            labelKey: 'status.disable',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
        },
        fleeing: {
            labelKey: 'status.fleeing',
            bgColor: 'bg-rose-100',
            textColor: 'text-rose-800',
        },
        vacation: {
            labelKey: 'status.vacation',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
        },
        accident: {
            labelKey: 'status.accident',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
        },
        sick: {
            labelKey: 'status.sick',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
        },
    };

    const normalizedStatus = status?.toString().toLowerCase().trim();
    const config = statusConfig[normalizedStatus] || statusConfig.disable;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {t(config.labelKey)}
        </span>
    );
}

