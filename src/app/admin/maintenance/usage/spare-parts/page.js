'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, History, ArrowRight, Truck, Plus, Trash2 } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import SearchableSelect from '@/components/Ui/SearchableSelect';

export default function SparePartsUsagePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [vehicleSearch, setVehicleSearch] = useState('');
    const [alert, setAlert] = useState(null);

    // Array to hold multiple usage entries
    const [usageEntries, setUsageEntries] = useState([
        { sparePartId: '', vehicleNumber: '', selectedVehicle: null, quantityUsed: '' }
    ]);

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

    const handleVehicleSelect = (vehicle, index) => {
        const updatedEntries = [...usageEntries];
        updatedEntries[index].selectedVehicle = vehicle;
        updatedEntries[index].vehicleNumber = vehicle.vehicleNumber;
        setUsageEntries(updatedEntries);
        setVehicleSearch(''); // Clear search after selection
    };

    const handleSparePartChange = (value, index) => {
        const updatedEntries = [...usageEntries];
        updatedEntries[index].sparePartId = value;
        setUsageEntries(updatedEntries);
    };

    const handleQuantityChange = (value, index) => {
        const updatedEntries = [...usageEntries];
        updatedEntries[index].quantityUsed = value;
        setUsageEntries(updatedEntries);
    };

    const addUsageEntry = () => {
        setUsageEntries([
            ...usageEntries,
            { sparePartId: '', vehicleNumber: '', selectedVehicle: null, quantityUsed: '' }
        ]);
    };

    const removeUsageEntry = (index) => {
        if (usageEntries.length > 1) {
            const updatedEntries = usageEntries.filter((_, i) => i !== index);
            setUsageEntries(updatedEntries);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all entries
        for (let i = 0; i < usageEntries.length; i++) {
            const entry = usageEntries[i];

            if (!entry.sparePartId) {
                showAlert('error', `الرجاء اختيار قطعة الغيار للإدخال رقم ${i + 1}`);
                return;
            }

            if (!entry.selectedVehicle) {
                showAlert('error', `الرجاء اختيار المركبة للإدخال رقم ${i + 1}`);
                return;
            }

            if (!entry.quantityUsed || entry.quantityUsed <= 0) {
                showAlert('error', `الرجاء إدخال كمية صحيحة للإدخال رقم ${i + 1}`);
                return;
            }
        }

        setLoading(true);
        try {
            // Prepare the request body in the new format
            const requestBody = {
                usages: usageEntries.map(entry => ({
                    sparePartId: parseInt(entry.sparePartId),
                    vehicleNumber: entry.vehicleNumber,
                    quantityUsed: parseInt(entry.quantityUsed)
                }))
            };

            await ApiService.post(API_ENDPOINTS.SPARE_PARTS.RECORD_USAGE, requestBody);

            console.log(requestBody);
            showAlert('success', 'تم تسجيل الاستخدام بنجاح');

            // Reset form
            setUsageEntries([
                { sparePartId: '', vehicleNumber: '', selectedVehicle: null, quantityUsed: '' }
            ]);
            setVehicleSearch('');
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
                    {/* Vehicle Search - Shared for all entries */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            البحث عن المركبات
                        </label>
                        <Input
                            placeholder="ابحث عن المركبة (رقم اللوحة، رقم الشاسيه، رقم التسلسل، الموديل، اللون...)"
                            value={vehicleSearch}
                            onChange={(e) => setVehicleSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>

                    {/* Vehicles Grid - Only show when searching */}
                    {vehicleSearch && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 border-2 border-gray-200 rounded-lg">
                            {filteredVehicles.map((vehicle) => (
                                <div
                                    key={vehicle.plateNumberA || vehicle.vehicleNumber}
                                    className="p-4 border-2 rounded-lg cursor-pointer transition-all border-gray-200 hover:border-orange-300 hover:bg-gray-50"
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
                                            {/* Add selection buttons for each entry */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {usageEntries.map((entry, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleVehicleSelect(vehicle, index)}
                                                        className={`text-xs px-2 py-1 rounded ${entry.selectedVehicle?.vehicleNumber === vehicle.vehicleNumber
                                                            ? 'bg-orange-500 text-white'
                                                            : 'bg-gray-200 text-gray-700 hover:bg-orange-100'
                                                            }`}
                                                    >
                                                        إدخال {index + 1}
                                                    </button>
                                                ))}
                                            </div>
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

                    {/* Usage Entries */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">إدخالات الاستخدام</h3>
                            <Button
                                type="button"
                                onClick={addUsageEntry}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus size={20} className="ml-2" />
                                إضافة إدخال
                            </Button>
                        </div>

                        {usageEntries.map((entry, index) => (
                            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900">إدخال رقم {index + 1}</h4>
                                    {usageEntries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeUsageEntry(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>

                                {/* Spare Part Selection */}
                                <SearchableSelect
                                    label="قطعة الغيار"
                                    value={entry.sparePartId}
                                    onChange={(e) => handleSparePartChange(e.target.value, index)}
                                    options={spareParts.map(part => ({
                                        id: part.id,
                                        name: `${part.name} - الكمية المتاحة: ${part.quantity}`
                                    }))}
                                    placeholder="اختر قطعة الغيار"
                                    required
                                />

                                {/* Selected Vehicle Display */}
                                {entry.selectedVehicle ? (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h5 className="font-medium text-blue-900 mb-2">المركبة المختارة:</h5>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div><span className="font-medium">رقم اللوحة (عربي):</span> {formatPlateNumber(entry.selectedVehicle.plateNumberA) || 'غير متوفر'}</div>
                                            <div><span className="font-medium">رقم اللوحة (إنجليزي):</span> {entry.selectedVehicle.plateNumberE || 'غير متوفر'}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                                        الرجاء اختيار مركبة من نتائج البحث أعلاه
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
                                        value={entry.quantityUsed}
                                        onChange={(e) => handleQuantityChange(e.target.value, index)}
                                        required
                                    />
                                </div>
                            </div>
                        ))}
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
