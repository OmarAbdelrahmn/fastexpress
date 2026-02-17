'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, History, ArrowRight, Truck, Plus, Trash2 } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { formatPlateNumber } from '@/lib/utils/formatters';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import SearchableSelect from '@/components/Ui/SearchableSelect';

export default function MemberSparePartsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [spareParts, setSpareParts] = useState([]);
    const [vehicles, setVehicles] = useState([]);
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
            // Using member-specific endpoint for spare parts list
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.SPARE_PARTS.LIST);
            setSpareParts(response || []);
        } catch (error) {
            console.error('Error loading spare parts:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل قطع الغيار');
        }
    };

    const loadVehicles = async () => {
        try {
            // Using member-specific endpoint for vehicles if available, or fallback to general list depending on permission
            // Assuming MEMBER.VEHICLES is the correct endpoint for members
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.VEHICLES);
            setVehicles(response || []);
        } catch (error) {
            console.error('Error loading vehicles:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل المركبات');
        }
    };


    const handleVehicleSelect = (vehicleId, index) => {
        const vehicle = vehicles.find(v => v.vehicleNumber === vehicleId);
        if (vehicle) {
            const updatedEntries = [...usageEntries];
            updatedEntries[index].selectedVehicle = vehicle;
            updatedEntries[index].vehicleNumber = vehicle.vehicleNumber;
            setUsageEntries(updatedEntries);
        }
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
            // Prepare the request body
            const requestBody = {
                usages: usageEntries.map(entry => ({
                    sparePartId: parseInt(entry.sparePartId),
                    vehicleNumber: entry.vehicleNumber,
                    quantityUsed: parseInt(entry.quantityUsed)
                }))
            };

            // Using member-specific endpoint for recording usage
            await ApiService.post(API_ENDPOINTS.MEMBER.SPARE_PARTS.RECORD_USAGE, requestBody);

            showAlert('success', 'تم تسجيل الاستخدام بنجاح');

            // Reset form
            setUsageEntries([
                { sparePartId: '', vehicleNumber: '', selectedVehicle: null, quantityUsed: '' }
            ]);
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
        <div className="space-y-7">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-row items-center justify-center gap-4 px-2 md:px-4">
                <Button
                    variant="outline"
                    onClick={() => router.push('/member/maintenance/spare-parts/history')}
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                    <History size={18} className="ml-2" />
                    <span className="text-sm md:text-base">عرض السجل</span>
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push('/member/maintenance/spare-parts/stock')}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                    <Package size={18} className="ml-2" />
                    <span className="text-sm md:text-base">عرض المخزون</span>
                </Button>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-2 md:mx-4">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Usage Entries */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">إدخالات الاستخدام</h3>
                            <Button
                                type="button"
                                onClick={addUsageEntry}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm"
                            >
                                <Plus size={16} className="ml-2" />
                                إضافة إدخال
                            </Button>
                        </div>

                        {usageEntries.map((entry, index) => (
                            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-sm md:text-base text-gray-900">إدخال رقم {index + 1}</h4>
                                    {usageEntries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeUsageEntry(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    {/* Spare Part Selection */}
                                    <SearchableSelect
                                        label="قطعة الغيار"
                                        value={entry.sparePartId}
                                        onChange={(e) => handleSparePartChange(e.target.value, index)}
                                        options={spareParts.map(part => ({
                                            id: part.id,
                                            name: `${part.name} - ${part.quantity > 0 ? `الكمية المتاحة: ${part.quantity}` : 'نفدت الكمية'}`,
                                            disabled: part.quantity <= 0
                                        }))}
                                        placeholder="اختر قطعة الغيار"
                                        required
                                        labelClassName="text-xs md:text-sm"
                                    />

                                    {/* Vehicle Selection */}
                                    <SearchableSelect
                                        label="المركبة"
                                        value={entry.vehicleNumber}
                                        onChange={(e) => handleVehicleSelect(e.target.value, index)}
                                        options={vehicles.map(vehicle => ({
                                            id: vehicle.vehicleNumber,
                                            name: `[${vehicle.plateNumberE}] -- ${formatPlateNumber(vehicle.plateNumberA)}`
                                        }))}
                                        placeholder="ابحث عن المركبة (رقم اللوحة، الموديل...)"
                                        required
                                        labelClassName="text-xs md:text-sm"
                                    />

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
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
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col-reverse md:flex-row gap-3">
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
                            onClick={() => router.push('/member/dashboard')}
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
