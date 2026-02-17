'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, ArrowRight, Package, Truck } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';

export default function SparePartsHistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadVehicles();
    }, []);

    const loadVehicles = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.VEHICLES.LIST);
            setVehicles(response || []);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل المركبات');
        }
    };

    const filteredVehicles = vehicles.filter(vehicle => {
        if (!vehicleSearch) return true;
        const search = vehicleSearch.toLowerCase();
        return (
            vehicle.plateNumberA?.toLowerCase().includes(search) ||
            vehicle.plateNumberE?.toLowerCase().includes(search) ||
            vehicle.vehicleNumber?.toLowerCase().includes(search) ||
            String(vehicle.serialNumber || '')?.toLowerCase().includes(search) ||
            vehicle.vehicleType?.toLowerCase().includes(search) ||
            vehicle.manufacturer?.toLowerCase().includes(search) ||
            vehicle.ownerName?.toLowerCase().includes(search)
        );
    });

    const handleVehicleSelect = async (vehicle) => {
        setSelectedVehicle(vehicle);

        // Load history for selected vehicle
        await loadHistory(vehicle.vehicleNumber);
    };

    const loadHistory = async (vehicleNumber) => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.VEHICLE_HISTORY(vehicleNumber));
            setHistoryData(response || []);
        } catch (error) {
            console.error('Error loading history:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السجل');
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const columns = [
        {
            header: 'رقم السجل',
            accessor: 'id',
        },
        {
            header: 'اسم قطعة الغيار',
            accessor: 'sparePartName',
        },
        {
            header: 'رقم المركبة',
            accessor: 'vehicleNumber',
        },
        {
            header: 'الكمية المستخدمة',
            accessor: 'quantityUsed',
        },
        {
            header: 'تاريخ الاستخدام',
            accessor: 'usedAt',
            render: (row) => new Date(row.usedAt).toLocaleString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="سجل استخدام قطع الغيار"
                subtitle="عرض سجل استخدام قطع الغيار حسب المركبة"
                icon={History}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col md:flex-row gap-3 px-4 md:px-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/maintenance/usage')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full md:w-auto text-sm md:text-base"
                >
                    <ArrowRight size={18} className="ml-2" />
                    رجوع
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/maintenance/usage/spare-parts')}
                    className="border-orange-600 text-orange-600 hover:bg-orange-50 w-full md:w-auto text-sm md:text-base"
                >
                    <Package size={18} className="ml-2" />
                    تسجيل استخدام جديد
                </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mx-5">
                {/* Vehicle Search */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ابحث عن المركبة
                    </label>
                    <Input
                        placeholder="ابحث عن المركبة (رقم اللوحة، رقم الشاسيه، رقم التسلسل، الموديل، اللون...)"
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        icon={Search}
                    />
                </div>

                {/* Vehicles Grid */}
                {!selectedVehicle && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 mb-6">
                        {filteredVehicles.map((vehicle) => (
                            <div
                                key={vehicle.plateNumberA || vehicle.vehicleNumber}
                                onClick={() => handleVehicleSelect(vehicle)}
                                className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-orange-300 hover:bg-gray-50"
                            >
                                <div className="flex items-start gap-3">
                                    <Truck className="text-gray-400" size={24} />
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">
                                            {formatPlateNumber(vehicle.plateNumberA) || vehicle.vehicleNumber}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {vehicle.vehicleType} - {vehicle.manufacturer}
                                        </div>
                                        {vehicle.vehicleNumber && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                رقم المركبة: {vehicle.vehicleNumber}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredVehicles.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                لا توجد مركبات تطابق البحث
                            </div>
                        )}
                    </div>
                )}

                {/* Vehicle Details */}
                {selectedVehicle && (
                    <>
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                                    <Package size={20} />
                                    تفاصيل المركبة
                                </h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedVehicle(null);
                                        setHistoryData([]);
                                    }}
                                    className="text-sm"
                                >
                                    اختيار مركبة أخرى
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">رقم اللوحة (عربي):</span>
                                    <span className="mr-2 text-gray-900">{formatPlateNumber(selectedVehicle.plateNumberA) || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">رقم اللوحة (إنجليزي):</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.plateNumberE || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">نوع المركبة:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.vehicleType || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">الشركة المصنعة:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.manufacturer || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">رقم المركبة:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.vehicleNumber || 'غير متوفر'}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">الرقم التسلسلي:</span>
                                    <span className="mr-2 text-gray-900">{selectedVehicle.serialNumber || 'غير متوفر'}</span>
                                </div>
                                {selectedVehicle.manufactureYear && (
                                    <div>
                                        <span className="font-medium text-gray-700">سنة الصنع:</span>
                                        <span className="mr-2 text-gray-900">{selectedVehicle.manufactureYear}</span>
                                    </div>
                                )}
                                {selectedVehicle.location && (
                                    <div>
                                        <span className="font-medium text-gray-700">الموقع:</span>
                                        <span className="mr-2 text-gray-900">{selectedVehicle.location}</span>
                                    </div>
                                )}
                                <div className="col-span-full mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي قطع الغيار المستخدمة</span>
                                        <span className="text-xl font-bold text-blue-600">{historyData.length}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي التكلفة</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {historyData.reduce((sum, item) => sum + (item.totalCost || item.cost || (item.unitPrice * item.quantityUsed) || 0), 0).toFixed(2)} ر.س
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Table */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <History size={20} />
                                سجل الاستخدام
                            </h4>
                            <Table
                                columns={[...columns, {
                                    header: 'التكلفة',
                                    accessor: 'totalCost',
                                    render: (row) => {
                                        const cost = row.totalCost || row.cost || (row.unitPrice * row.quantityUsed) || 0;
                                        return `${Number(cost).toFixed(2)} ر.س`;
                                    }
                                }]}
                                data={historyData}
                                loading={loading}
                            />

                            {!loading && historyData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    لا يوجد سجل استخدام لهذه المركبة
                                </div>
                            )}
                        </div>
                    </>
                )}

                {!selectedVehicle && filteredVehicles.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <History size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>اختر مركبة لعرض سجل الاستخدام</p>
                    </div>
                )}
            </div>
        </div>
    );
}
