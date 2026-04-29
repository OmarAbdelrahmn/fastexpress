'use client';

import { useLanguage } from '@/lib/context/LanguageContext';
import { Globe, Check } from 'lucide-react';
import PageHeader from '@/components/layout/pageheader';

const LANGUAGES = [
  { code: 'ar', label: 'العربية', sublabel: 'Arabic', flag: 'AR' },
  { code: 'en', label: 'English', sublabel: 'English', flag: 'EN' },
  { code: 'bn', label: 'বাংলা', sublabel: 'Bengali', flag: 'BN' },
];

export default function LanguagePage() {
  const { t, locale, changeLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <PageHeader 
        title={t('common.selectLanguage') || 'اعدادات اللغة'}
        subtitle={t('common.languageDescription') || 'تحكم في لغة واجهة النظام'}
        icon={Globe}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header strip in card (Optional, but let's keep it elegant) */}
            <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-gray-50/50">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {t('common.selectLanguage') || 'اللغة الافتراضية'}
                </h2>
                <p className="text-xs text-gray-500">
                  {t('common.languageDescription') || 'اختر لغتك المفضلة للمتابعة'}
                </p>
              </div>
            </div>

            {/* Language options */}
            <div className="p-6 space-y-3">
              {LANGUAGES.map((lang) => {
                const isActive = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all duration-200 group
                      ${isActive
                        ? 'border-[#2E63E6] bg-blue-50'
                        : 'border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl leading-none">{lang.flag}</span>
                      <div className="text-left">
                        <p className={`font-bold text-sm ${isActive ? 'text-[#1A44B8]' : 'text-gray-800'}`}>
                          {lang.label}
                        </p>
                        <p className="text-xs text-gray-400">{lang.sublabel}</p>
                      </div>
                    </div>

                    {/* Active indicator */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                      ${isActive ? 'bg-[#2E63E6]' : 'bg-gray-200 group-hover:bg-blue-100'}`}>
                      {isActive && <Check size={13} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Globe size={13} />
              <span>FastExpress System Preferences</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
