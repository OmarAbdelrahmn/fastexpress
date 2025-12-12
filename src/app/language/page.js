'use client';

import LanguageSwitcher from '@/components/Ui/LanguageSwitcher';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function LanguagePage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-100 dark:bg-blue-900">
            <div className="bg-white dark:bg-black p-8 rounded-xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
                    {t('common.selectLanguage') || 'Select Language'}
                </h1>

                <div className="flex justify-center">
                    <LanguageSwitcher />
                </div>

                <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                    {t('common.languageDescription') || 'Choose your preferred language to continue'}
                </p>
            </div>
        </div>
    );
}
