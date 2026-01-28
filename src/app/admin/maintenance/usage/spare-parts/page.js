'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, History, ArrowRight, Truck } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';

export default function SparePartsUsagePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [selectedSparePart, setSelectedSparePart] = useState('');
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [quantityUsed, setQuantityUsed] = useState('');
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadSpareParts();
        loadVehicles();
    }, []);

    const loadSpareParts = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.LIST + "/2");
            setSpareParts(response || []);
        } catch (error) {
            console.error('Error loading spare parts:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل قطع الغيار');
        }
    };

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

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSparePart) {
            showAlert('error', 'الرجاء اختيار قطعة الغيار');
            return;
        }

        if (!selectedVehicle) {
            showAlert('error', 'الرجاء اختيار المركبة');
            return;
        }

        if (!quantityUsed || quantityUsed <= 0) {
            showAlert('error', 'الرجاء إدخال كمية صحيحة');
            return;
        }

        setLoading(true);
        try {
            await ApiService.post(API_ENDPOINTS.SPARE_PARTS.RECORD_USAGE(selectedSparePart), {
                vehicleNumber:selectedVehicle.vehicleNumber,
                quantityUsed: parseInt(quantityUsed)
            });

            showAlert('success', 'تم تسجيل الاستخدام بنجاح');

            // Reset form
            setSelectedSparePart('');
            setSelectedVehicle(null);
            setVehicleSearch('');
            setQuantityUsed('');
        } catch (error) {
            console.error('Error recording usage:', error);
            showAlert('error', error.response?.data?.message || 'حدث خطأ أثناء تسجيل الاستخدام');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="تسجيل استخدام قطع الغيار"
                subtitle="تسجيل استخدام قطع الغيار للمركبات"
                icon={Package}
            />

            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex gap-4 px-5">
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/maintenance/usage')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={20} className="ml-2" />
                    رجوع
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/maintenance/usage/spare-parts/history')}
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                    <History size={20} className="ml-2" />
                    عرض السجل
                </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mx-5">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Spare Part Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            قطعة الغيار <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedSparePart}
                            onChange={(e) => setSelectedSparePart(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-100 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            required
                        >
                            <option value="">اختر قطعة الغيار</option>
                            {spareParts.map((part) => (
                                <option key={part.id} value={part.id}>
                                    {part.name} - الكمية المتاحة: {part.quantity}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicle Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            المركبة <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="ابحث عن المركبة (رقم اللوحة، رقم الشاسيه، رقم التسلسل، الموديل، اللون...)"
                            value={vehicleSearch}
                            onChange={(e) => setVehicleSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>

                    {/* Vehicles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                        {filteredVehicles.map((vehicle) => (
                            <div
                                key={vehicle.plateNumberA || vehicle.vehicleNumber}
                                onClick={() => handleVehicleSelect(vehicle)}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedVehicle?.plateNumberA === vehicle.plateNumberA
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <Truck className={`${selectedVehicle?.plateNumberA === vehicle.plateNumberA ? 'text-orange-600' : 'text-gray-400'}`} size={24} />
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

                    {/* Selected Vehicle Details */}
                    {selectedVehicle && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">تفاصيل المركبة المختارة:</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div><span className="font-medium">رقم اللوحة (عربي):</span> {formatPlateNumber(selectedVehicle.plateNumberA) || 'غير متوفر'}</div>
                                <div><span className="font-medium">رقم اللوحة (إنجليزي):</span> {selectedVehicle.plateNumberE || 'غير متوفر'}</div>
                                <div><span className="font-medium">نوع المركبة:</span> {selectedVehicle.vehicleType || 'غير متوفر'}</div>
                                <div><span className="font-medium">الشركة المصنعة:</span> {selectedVehicle.manufacturer || 'غير متوفر'}</div>
                                <div><span className="font-medium">رقم المركبة:</span> {selectedVehicle.vehicleNumber || 'غير متوفر'}</div>
                                <div><span className="font-medium">الرقم التسلسلي:</span> {selectedVehicle.serialNumber || 'غير متوفر'}</div>
                                {selectedVehicle.manufactureYear && (
                                    <div><span className="font-medium">سنة الصنع:</span> {selectedVehicle.manufactureYear}</div>
                                )}
                                {selectedVehicle.location && (
                                    <div><span className="font-medium">الموقع:</span> {selectedVehicle.location}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            الكمية المستخدمة <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="number"
                            min="1"
                            placeholder="أدخل الكمية المستخدمة"
                            value={quantityUsed}
                            onChange={(e) => setQuantityUsed(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="bg-orange-600 hover:bg-orange-700 text-white cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? 'جاري التسجيل...' : 'تسجيل الاستخدام'}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/admin/maintenance/usage')}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
