// // File: src/app/dashboard/riders/all/page.js
// 'use client';

// import { useEffect, useState } from 'react';
// import { useApi } from '@/hooks/useApi';
// import { API_ENDPOINTS } from '@/lib/api/endpoints';
// import Card from '@/components/Ui/Card';
// import Table from '@/components/Ui/Table';
// import Button from '@/components/Ui/Button';
// import Alert from '@/components/Ui/Alert';
// import { Plus, Search, Edit, Trash2 } from 'lucide-react';

// export default function AllRidersPage() {
//   const { get, loading, error } = useApi();
//   const [riders, setRiders] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     loadRiders();
//   }, []);

//   const loadRiders = async () => {
//     const result = await get(API_ENDPOINTS.RIDER.LIST);
//     if (result.data) {
//       setRiders(result.data);
//     }
//   };

//   const columns = [
//     { header: 'رقم العمل', accessor: 'workingId' },
//     { header: 'رقم الإقامة', accessor: 'iqamaNo' },
//     { header: 'الاسم', accessor: 'name' },
//     { header: 'الشركة', accessor: 'companyName' },
//     { 
//       header: 'الإجراءات',
//       render: (row) => (
//         <div className="flex gap-2">
//           <button className="text-blue-600 hover:text-blue-800">
//             <Edit size={18} />
//           </button>
//           <button className="text-red-600 hover:text-red-800">
//             <Trash2 size={18} />
//           </button>
//         </div>
//       )
//     },
//   ];

//   const filteredRiders = riders.filter(rider =>
//     rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     rider.workingId?.toString().includes(searchTerm) ||
//     rider.iqamaNo?.toString().includes(searchTerm)
//   );

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-800">جميع السائقين</h1>
//         <Button>
//           <Plus size={18} />
//           إضافة سائق
//         </Button>
//       </div>

//       {error && (
//         <Alert type="error" title="خطأ" message={error} />
//       )}

//       <Card>
//         <div className="mb-4">
//           <div className="relative">
//             <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//             <input
//               type="text"
//               placeholder="البحث بال