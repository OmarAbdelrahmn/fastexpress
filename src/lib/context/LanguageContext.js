'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import bn from '@/i18n/locales/bn.json';

const translations = { ar, en, bn };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('ar');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLocale = localStorage.getItem('language') || 'ar';
    setLocale(savedLocale);
    
    // Set document direction
    document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLocale;
  }, []);

  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('language', newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[locale];
    
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