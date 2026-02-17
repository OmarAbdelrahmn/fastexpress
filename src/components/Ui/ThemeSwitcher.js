'use client';

import { useTheme } from '@/lib/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher() {
    const { theme, setThemeMode } = useTheme();

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => setThemeMode('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${theme === 'light'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
            >
                <Sun size={20} />
                <span className="font-medium">فاتح</span>
            </button>
            <button
                onClick={() => setThemeMode('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${theme === 'dark'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
            >
                <Moon size={20} />
                <span className="font-medium">داكن</span>
            </button>
        </div>
    );
}
