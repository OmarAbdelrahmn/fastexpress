'use client';

import { useLanguage } from '@/lib/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe size={18} className="text-white/80" />
      <select
        value={locale}
        onChange={(e) => changeLanguage(e.target.value)}
        className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/20 transition-colors cursor-pointer"
      >
        <option value="ar" className="bg-gray-800">العربية</option>
        <option value="en" className="bg-gray-800">English</option>
        <option value="bn" className="bg-gray-800">বাংলা</option>
      </select>
    </div>
  );
}