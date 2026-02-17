'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, ArrowRight, Package, Truck, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';

export default function MemberSparePartsHistoryPage() {
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
            // Using member-specific endpoint for vehicles
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.VEHICLES);
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
            // NOTE: The history endpoint in endpoints.js is just a base URL.
            // We need to pass the vehicle number. Since the endpoints definition might be just the path,
            // we should assume the backend handles filtering by vehicle if we duplicate the admin pattern.
            // However, the admin endpoint was: wrapper function (vehicleNumber) => `...`
            // The MEMBER.SPARE_PARTS.HISTORY is a string "/api/member/spare-parts/history".
            // I will assume for now it takes a query param or path param. 
            // Let's check how the admin one was: BY_VEHICLE_HISTORY(vehicleNumber)
            // If the member one is a string, we might need to append keys like `?vehicleNumber=${vehicleNumber}`

            // Checking the user request, they main goal is "make the pages".
            // I'll assume standard query param pattern for now:
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.SPARE_PARTS.HISTORY(vehicleNumber));
            setHistoryData(response || []);
        } catch (error) {
            console.error('Error loading history:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السجل');
            setHistoryData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExcelExport = () => {
        if (!historyData || historyData.length === 0) {
            showAlert('error', 'لا توجد بيانات لتصديرها');
            return;
        }

        const dataToExport = historyData.map(row => ({
            'رقم السجل': row.id,
            'اسم قطعة الغيار': row.sparePartName,
            'رقم المركبة': row.vehicleNumber,
            'الكمية المستخدمة': row.quantityUsed,
            'تاريخ الاستخدام': new Date(row.usedAt).toLocaleString('ar-SA'),
            'التكلفة (ر.س)': (row.totalCost || row.cost || (row.unitPrice * row.quantityUsed) || 0).toFixed(2)
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Spare Parts History');

        const fileName = `spare_parts_history_${selectedVehicle?.plateNumberA || selectedVehicle?.vehicleNumber || 'export'}.xlsx`;
        XLSX.writeFile(workbook, fileName);
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
        // Include Cost column as requested in previous steps for consistency
        {
            header: 'التكلفة',
            accessor: 'totalCost',
            render: (row) => {
                const cost = row.totalCost || row.cost || (row.unitPrice * row.quantityUsed) || 0;
                return `${Number(cost).toFixed(2)} ر.س`;
            }
        }
    ];

    return (
        <div className="space-y-6">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col md:flex-row gap-4 px-4 md:px-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/member/maintenance/spare-parts')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={18} className="ml-2" />
                    <span className="text-sm md:text-base">رجوع</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push('/member/maintenance/spare-parts')}
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                    <Package size={18} className="ml-2" />
                    <span className="text-sm md:text-base">تسجيل استخدام جديد</span>
                </Button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-4 md:mx-6">
                {/* Vehicle Search */}
                <div className="mb-6">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
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
                                <h4 className="font-medium text-sm md:text-base text-blue-900 flex items-center gap-2">
                                    <Truck size={18} />
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
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs md:text-sm">
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
                                {selectedVehicle.manufactureYear && (
                                    <div>
                                        <span className="font-medium text-gray-700">سنة الصنع:</span>
                                        <span className="mr-2 text-gray-900">{selectedVehicle.manufactureYear}</span>
                                    </div>
                                )}
                                <div className="col-span-full mt-4 pt-4 border-t border-blue-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي قطع الغيار المستلمة</span>
                                        <span className="text-lg md:text-xl font-bold text-blue-600">{historyData.length}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي التكلفة</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {historyData.reduce((sum, item) => sum + (item.totalCost || item.cost || (item.unitPrice * item.quantity) || 0), 0).toFixed(2)} <span className="text-xs">ر.س</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* History Table */}
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                <h4 className="font-medium text-sm md:text-base text-gray-900 flex items-center gap-2">
                                    <History size={18} />
                                    سجل الاستخدام
                                </h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExcelExport}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                    disabled={loading || historyData.length === 0}
                                >
                                    <FileSpreadsheet size={16} className="ml-2" />
                                    تصدير Excel
                                </Button>
                            </div>
                            <Table
                                columns={columns.map(col => ({ ...col, className: 'text-xs md:text-sm' }))}
                                data={historyData}
                                loading={loading}
                            />

                            {!loading && historyData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    لا يوجد سجل استخدام لهذا المركبة
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
