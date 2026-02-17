'use client';

import PageHeader from '@/components/layout/pageheader';
import ThemeSwitcher from '@/components/Ui/ThemeSwitcher';
import { useTheme } from '@/lib/context/ThemeContext';
import { Palette, Sun, Moon } from 'lucide-react';

export default function ThemePage() {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12" dir="rtl">
            <PageHeader
                title="إعدادات المظهر"
                subtitle="اختر المظهر المفضل لديك"
                icon={Palette}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">المظهر</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            اختر بين الوضع الفاتح والوضع الداكن
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col gap-6">
                            {/* Theme Switcher */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                                        {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">اختيار المظهر</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            المظهر الحالي: {theme === 'dark' ? 'داكن' : 'فاتح'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Options */}
                            <div className="mt-4">
                                <ThemeSwitcher />
                            </div>

                            {/* Theme Preview */}
                            <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">معاينة:</p>
                                <div className="space-y-3">
                                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                        <p className="text-sm text-gray-900 dark:text-white font-medium">نص عادي</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                        <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">نص ملون</p>
                                    </div>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        زر تجريبي
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                    <div className="flex gap-3">
                        <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h5 className="font-bold text-blue-900 dark:text-blue-200 text-sm">معلومة</h5>
                            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                                سيتم حفظ اختيارك تلقائياً وسيتم تطبيقه في جميع صفحات التطبيق
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
