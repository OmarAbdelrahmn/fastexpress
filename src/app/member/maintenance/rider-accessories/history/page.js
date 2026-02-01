'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { History, Search, ArrowRight, Package, User } from 'lucide-react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import Alert from '@/components/Ui/Alert';

export default function MemberRiderAccessoriesHistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [riders, setRiders] = useState([]);
    const [riderSearch, setRiderSearch] = useState('');
    const [selectedRider, setSelectedRider] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        loadRiders();
    }, []);

    const loadRiders = async () => {
        try {
            // Using member-specific endpoint for riders
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.RIDERS);
            setRiders(response || []);
        } catch (error) {
            console.error('Error loading riders:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل السائقين');
        }
    };

    const filteredRiders = riders.filter(rider => {
        if (!riderSearch) return true;
        const search = riderSearch.toLowerCase();
        return (
            rider.nameAR?.toLowerCase().includes(search) ||
            rider.nameEN?.toLowerCase().includes(search) ||
            rider.iqamaNo?.toString().includes(search) ||
            rider.workingId?.toLowerCase().includes(search) ||
            rider.phoneNumber?.toLowerCase().includes(search)
        );
    });

    const handleRiderSelect = async (rider) => {
        setSelectedRider(rider);
        // Load history for selected rider using riderid
        await loadHistory(rider.riderId);
    };

    const loadHistory = async (riderId) => {
        setLoading(true);
        try {
            // NOTE: Similar assumption as spare parts history.
            // Using standard query param pattern:
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.RIDER_ACCESSORIES.HISTORY(riderId));
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
            header: 'اسم معدات السائق',
            accessor: 'accessoryName',
        },
        {
            header: 'اسم السائق',
            accessor: 'riderNameAR',
        },
        {
            header: 'تاريخ التسليم',
            accessor: 'issuedAt',
            render: (row) => new Date(row.issuedAt).toLocaleString('ar-SA', {
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
                const cost = row.totalCost || row.cost || (row.unitPrice * row.quantity) || 0;
                return `${Number(cost).toFixed(2)} ر.س`;
            }
        }
    ];

    return (
        <div className="space-y-6">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex gap-4 px-5">
                <Button
                    variant="outline"
                    onClick={() => router.push('/member/maintenance/rider-accessories')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={20} className="ml-2" />
                    رجوع
                </Button>

                <Button
                    variant="outline"
                    onClick={() => router.push('/member/maintenance/rider-accessories')}
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                    <Package size={20} className="ml-2" />
                    تسجيل استخدام جديد
                </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mx-5">
                {/* Rider Search */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        ابحث عن السائق
                    </label>
                    <Input
                        placeholder="ابحث عن السائق (الاسم، رقم الهوية، ID العمل، رقم الهاتف...)"
                        value={riderSearch}
                        onChange={(e) => setRiderSearch(e.target.value)}
                        icon={Search}
                    />
                </div>

                {/* Riders Grid */}
                {!selectedRider && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 mb-6 border-2 border-gray-100 rounded-lg">
                        {filteredRiders.map((rider, index) => (
                            <div
                                key={rider.riderid || rider.iqamaNo || `rider-${index}`}
                                onClick={() => handleRiderSelect(rider)}
                                className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-purple-300 hover:bg-gray-50"
                            >
                                <div className="flex items-start gap-3">
                                    <User className="text-gray-400" size={24} />
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">
                                            {rider.nameAR}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            هوية: {rider.iqamaNo}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            ID العمل: {rider.workingId}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredRiders.length === 0 && (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                لا يوجد سائقون يطابقون البحث
                            </div>
                        )}
                    </div>
                )}

                {/* Rider Details */}
                {selectedRider && (
                    <>
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                                    <User size={20} />
                                    تفاصيل السائق
                                </h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedRider(null);
                                        setHistoryData([]);
                                    }}
                                    className="text-sm"
                                >
                                    اختيار سائق آخر
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">الاسم (عربي):</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.nameAR}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">الاسم (إنجليزي):</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.nameEN}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">معرف العمل:</span>
                                    <span className="mr-2 text-gray-900">{selectedRider.workingId}</span>
                                </div>
                                <div className="col-span-full mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي الطلبات</span>
                                        <span className="text-xl font-bold text-blue-600">{historyData.length}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded shadow-sm">
                                        <span className="block text-gray-600 text-xs mb-1">إجمالي التكلفة</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {historyData.reduce((sum, item) => sum + (item.totalCost || item.cost || (item.unitPrice * item.quantity) || 0), 0).toFixed(2)} ر.س
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
                                columns={columns}
                                data={historyData}
                                loading={loading}
                            />

                            {!loading && historyData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    لا يوجد سجل استخدام لهذا السائق
                                </div>
                            )}
                        </div>
                    </>
                )}

                {!selectedRider && filteredRiders.length > 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <History size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>اختر سائقاً لعرض سجل الاستخدام</p>
                    </div>
                )}
            </div>
        </div>
    );
}
