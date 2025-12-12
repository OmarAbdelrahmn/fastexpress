// // File: src/app/employees/page.js
// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Loader2 } from 'lucide-react';

// export default function EmployeesPage() {
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect to employees/admin immediately
//     router.push('/employees/admin');
//   }, [router]);

//   // Show a loading spinner while redirecting
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <div className="text-center">
//         <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={48} />
//         <p className="text-gray-600 text-lg">جاري التحويل إلى صفحة إدارة الموظفين...</p>
//       </div>
//     </div>
//   );
// }

// File: src/app/employees/page.js
'use client';

import { redirect } from 'next/navigation';

export default function EmployeesPage() {
  redirect('/employees/admin');
}
