// File: src/app/dashboard/vehicles/all/page.js
'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Table from '@/components/Ui/Table';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import { Plus, Search } from 'lucide-react';
import Card from '@/components/Ui/Card';



export default function AllVehiclesPage() {
  const { get, loading, error } = useApi();
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const result = await get(API_ENDPOINTS.VEHICLES.LIST);
    if (result.data) {
      setVehicles(result.data);
    }
  };

  const columns = [
    { header: 'رقم اللوحة', accessor: 'plateNumber' },
    { header: 'رقم الهيكل', accessor: 'chassisNumber' },
    { header: 'الرقم التسلسلي', accessor: 'serialNumber' },
    { 
      header: 'الحالة', 
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.isAvailable ? 'متاح' : 'مستخدم'}
        </span>
      )
    },
    { header: 'الموقع', accessor: 'location' },
  ];

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.chassisNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">جميع المركبات</h1>
        <Button>
          <Plus size={18} />
          إضافة مركبة
        </Button>
      </div>

      {error && (
        <Alert type="error" title="خطأ" message={error} />
      )}

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="البحث برقم اللوحة أو رقم الهيكل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <Table 
          columns={columns} 
          data={filteredVehicles} 
          loading={loading}
        />
      </Card>
    </div>
  );
}