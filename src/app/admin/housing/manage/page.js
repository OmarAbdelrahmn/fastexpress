'use client';

import { Suspense } from 'react';
import HousingManagePage from './HousingManagePage';
import { useLanguage } from '@/lib/context/LanguageContext';

// Loading fallback component
function HousingManageLoading() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    </div>
  );
}


export default function Page() {
  return (
    <Suspense fallback={<HousingManageLoading />}>
      <HousingManagePage />
    </Suspense>
  );
}