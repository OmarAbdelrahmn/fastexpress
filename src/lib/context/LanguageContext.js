'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import ar from '@/i18n/locales/ar.json';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('ar');
  const [translations, setTranslations] = useState({ ar });

  useEffect(() => {
    // Load saved language from localStorage
    const savedLocale = localStorage.getItem('language') || 'ar';
    setLocale(savedLocale);
    
    // Set document direction
    document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLocale;

    // If English is saved, load it dynamically
    if (savedLocale === 'en') {
      import('@/i18n/locales/en.json').then((module) => {
        setTranslations(prev => ({ ...prev, en: module.default }));
      });
    }
  }, []);

  const changeLanguage = async (newLocale) => {
    if (newLocale === 'en' && !translations.en) {
      const module = await import('@/i18n/locales/en.json');
      setTranslations(prev => ({ ...prev, en: module.default }));
    }
    setLocale(newLocale);
    localStorage.setItem('language', newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[locale] || translations.ar; // Fallback to ar if en is loading
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};