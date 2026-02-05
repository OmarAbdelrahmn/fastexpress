'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, History, ArrowRight, User, Plus, Trash2 } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Alert from '@/components/Ui/Alert';
import SearchableSelect from '@/components/Ui/SearchableSelect';

export default function RiderAccessoriesUsagePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [accessories, setAccessories] = useState([]);
    const [riders, setRiders] = useState([]);
    const [alert, setAlert] = useState(null);

    // Array to hold multiple usage entries
    const [usageEntries, setUsageEntries] = useState([
        { accessoryId: '', riderId: '', selectedRider: null }
    ]);

    useEffect(() => {
        loadAccessories();
        loadRiders();
    }, []);

    const loadAccessories = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER_ACCESSORY.LIST + "/2");
            setAccessories(response || []);
        } catch (error) {
            console.error('Error loading accessories:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل معدات السائقين');
        }
    };

    const loadRiders = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.RIDER.LIST);

            setRiders(response || []);
        } catch (error) {
            console.error('Error loading riders:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السائقين');
        }
    };


    const handleRiderSelect = (riderId, index) => {
        const rider = riders.find(r => r.riderId === parseInt(riderId));
        if (rider) {
            const updatedEntries = [...usageEntries];
            updatedEntries[index].selectedRider = rider;
            updatedEntries[index].riderId = rider.riderId;
            setUsageEntries(updatedEntries);
        }
    };

    const handleAccessoryChange = (value, index) => {
        const updatedEntries = [...usageEntries];
        updatedEntries[index].accessoryId = value;
        setUsageEntries(updatedEntries);
    };

    const addUsageEntry = () => {
        setUsageEntries([
            ...usageEntries,
            { accessoryId: '', riderId: '', selectedRider: null }
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

            if (!entry.accessoryId) {
                showAlert('error', `الرجاء اختيار المعدات للإدخال رقم ${i + 1}`);
                return;
            }

            if (!entry.selectedRider) {
                showAlert('error', `الرجاء اختيار السائق للإدخال رقم ${i + 1}`);
                return;
            }
        }

        setLoading(true);
        try {
            // Prepare the request body in the new format
            const requestBody = {
                usages: usageEntries.map(entry => ({
                    accessoryId: parseInt(entry.accessoryId),
                    riderId: parseInt(entry.riderId)
                }))
            };

            await ApiService.post(API_ENDPOINTS.RIDER_ACCESSORY.RECORD_USAGE, requestBody);

            showAlert('success', 'تم تسجيل الاستخدام بنجاح');

            // Reset form
            setUsageEntries([
                { accessoryId: '', riderId: '', selectedRider: null }
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
        <div className="space-y-6">
            <PageHeader
                title="تسجيل استخدام معدات السائقين"
                subtitle="تسجيل توزيع معدات السائقين على السائقين"
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
                    onClick={() => router.push('/admin/maintenance/usage/rider-accessories/history')}
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                    <History size={20} className="ml-2" />
                    عرض السجل
                </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mx-5">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Usage Entries */}
                    <div className="space-y-4">
                        <div key="usage-header" className="flex items-center justify-between">
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
                            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-4">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    {/* Accessory Selection */}
                                    <SearchableSelect
                                        label="معدات السائق"
                                        value={entry.accessoryId}
                                        onChange={(e) => handleAccessoryChange(e.target.value, index)}
                                        options={accessories.map(accessory => ({
                                            id: accessory.id,
                                            name: `${accessory.name} - ${accessory.quantity > 0 ? `الكمية المتاحة: ${accessory.quantity}` : 'نفدت الكمية'}`,
                                            disabled: accessory.quantity <= 0
                                        }))}
                                        placeholder="اختر معدات السائق"
                                        required
                                    />

                                    {/* Rider Selection */}
                                    <SearchableSelect
                                        label="السائق"
                                        value={entry.riderId}
                                        onChange={(e) => handleRiderSelect(e.target.value, index)}
                                        options={riders.map(rider => ({
                                            id: rider.riderId,
                                            name: `${rider.nameAR} - ${rider.iqamaNo || ''}`
                                        }))}
                                        placeholder="ابحث عن السائق (الاسم، الهوية...)"
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
                            className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
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
