'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TokenManager } from '@/lib/auth/tokenManager';
import { useLanguage } from '@/lib/context/LanguageContext';

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const token = TokenManager.getToken();
    if (!token || !TokenManager.isTokenValid()) {
      router.push('/login');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e08911] mx-auto"></div>
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  );
}