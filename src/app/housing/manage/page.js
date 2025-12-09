import { Suspense } from 'react';
import HousingManagePage from './HousingManagePage';

// Loading fallback component
function HousingManageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
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