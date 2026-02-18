'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Trash2, Building2, Briefcase, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import SearchableSelect from '@/components/Ui/SearchableSelect';

export default function MemberTransfersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

    // Form State
    const [transferType, setTransferType] = useState('MAIN_COMPANY'); // 'MAIN_COMPANY' or 'HOUSING'
    const [selectedHousing, setSelectedHousing] = useState('');
    const [items, setItems] = useState([
        { itemType: '1', itemId: '', quantity: '' } // itemType: '1' (SparePart), '2' (Accessory)
    ]);

    // Data State
    const [housings, setHousings] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [accessories, setAccessories] = useState([]);
    const [transfers, setTransfers] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            loadTransfers();
        }
    }, [activeTab]);

    const loadData = async () => {
        try {
            const [housingsRes, sparePartsRes, accessoriesRes] = await Promise.all([
                ApiService.get(API_ENDPOINTS.HOUSING.LIST),
                ApiService.get(API_ENDPOINTS.MEMBER.SPARE_PARTS.LIST),
                ApiService.get(API_ENDPOINTS.MEMBER.RIDER_ACCESSORIES.LIST)
            ]);
            setHousings(housingsRes || []);
            setSpareParts(sparePartsRes || []);
            setAccessories(accessoriesRes || []);
        } catch (error) {
            console.error('Error loading data:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل البيانات');
        }
    };

    const loadTransfers = async () => {
        try {
            const response = await ApiService.get(API_ENDPOINTS.MEMBER.TRANSFERS.LIST);
            setTransfers(response || []);
        } catch (error) {
            console.error('Error loading transfers:', error);
            showAlert('error', 'حدث خطأ أثناء تحميل سجل التحويلات');
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Reset itemId if type changes
        if (field === 'itemType') {
            newItems[index].itemId = '';
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { itemType: '1', itemId: '', quantity: '' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (transferType === 'HOUSING' && !selectedHousing) {
            showAlert('error', 'الرجاء اختيار السكن');
            return;
        }

        for (const item of items) {
            if (!item.itemId || !item.quantity) {
                showAlert('error', 'الرجاء تعبئة جميع بيانات العناصر');
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                toHousingId: transferType === 'HOUSING' ? parseInt(selectedHousing) : null,
                items: items.map(item => ({
                    itemId: parseInt(item.itemId),
                    itemType: parseInt(item.itemType),
                    quantity: parseInt(item.quantity)
                }))
            };

            await ApiService.post(API_ENDPOINTS.MEMBER.TRANSFERS.CREATE, payload);
            showAlert('success', 'تم إرسال التحويل بنجاح');

            // Reset form
            setItems([{ itemType: '1', itemId: '', quantity: '' }]);
            setSelectedHousing('');
            setTransferType('MAIN_COMPANY');

            // If we are in history tab or want to show history, reload it
            if (activeTab === 'history') loadTransfers();

        } catch (error) {
            console.error('Error creating transfer:', error);
            showAlert('error', error.response?.data?.message || 'حدث خطأ أثناء إنشاء التحويل');
        } finally {
            setLoading(false);
        }
    };

    const handleExcelExport = () => {
        if (!transfers || transfers.length === 0) {
            showAlert('error', 'لا توجد بيانات لتصديرها');
            return;
        }

        const dataToExport = [];
        transfers.forEach(transfer => {
            if (transfer.items && transfer.items.length > 0) {
                transfer.items.forEach(item => {
                    dataToExport.push({
                        'رقم التحويل': transfer.id,
                        'الوجهة': transfer.toLocation || 'الشركة الرئيسية',
                        'تاريخ التحويل': new Date(transfer.transferredAt).toLocaleDateString('ar-SA'),
                        'نوع العنصر': item.itemType === 1 || item.itemType === '1' ? 'قطعة غيار' : 'معدات سائقين',
                        'اسم العنصر': item.itemName || getItemName(item.itemType, item.itemId),
                        'الكمية': item.quantity,
                        'الحالة': 'تم التحويل'
                    });
                });
            } else {
                dataToExport.push({
                    'رقم التحويل': transfer.id,
                    'الوجهة': transfer.toLocation || 'الشركة الرئيسية',
                    'تاريخ التحويل': new Date(transfer.transferredAt).toLocaleDateString('ar-SA'),
                    'نوع العنصر': 'لا يوجد',
                    'اسم العنصر': 'لا يوجد',
                    'الكمية': 0,
                    'الحالة': 'تم التحويل'
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfers History');
        XLSX.writeFile(workbook, `transfers_history_${new Date().getTime()}.xlsx`);
    };

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 3000);
    };

    const getItemName = (type, id) => {
        const idInt = parseInt(id);
        if (type === 1 || type === '1') {
            const part = spareParts.find(p => p.id === idInt);
            return part ? part.name : 'غير محدد';
        } else {
            const acc = accessories.find(a => a.id === idInt);
            return acc ? acc.name : 'غير محدد';
        }
    };

    return (
        <div className="space-y-6">
            {alert && (
                <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            )}

            <div className="flex flex-col md:flex-row gap-4 px-4 md:px-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/member/dashboard')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <ArrowRight size={18} className="ml-2" />
                    <span className="text-sm md:text-base">رجوع</span>
                </Button>

                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all ${activeTab === 'new'
                            ? 'bg-white shadow text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        تحويل جديد
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all ${activeTab === 'history'
                            ? 'bg-white shadow text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <span className="text-xs md:text-base">سجل التحويلات</span>
                    </button>
                </div>
            </div>

            {activeTab === 'new' ? (
                <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm mx-2 md:mx-4">
                    <h2 className="text-base md:text-xl font-bold text-gray-800 mb-6 border-b pb-4">تحويل مواد</h2>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Destination Selection */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">تحويل إلى:</label>
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all w-full md:w-64 ${transferType === 'MAIN_COMPANY'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-200'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="transferType"
                                        value="MAIN_COMPANY"
                                        checked={transferType === 'MAIN_COMPANY'}
                                        onChange={(e) => setTransferType(e.target.value)}
                                        className="sr-only"
                                    />
                                    <Building2 className={`ml-3 ${transferType === 'MAIN_COMPANY' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <div>
                                        <div className={`font-semibold ${transferType === 'MAIN_COMPANY' ? 'text-blue-900' : 'text-gray-700'}`}>الشركة الرئيسية</div>
                                        <div className="text-xs text-gray-500">إرجاع للمستودع الرئيسي</div>
                                    </div>
                                </label>

                                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all w-full md:w-64 ${transferType === 'HOUSING'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-200'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="transferType"
                                        value="HOUSING"
                                        checked={transferType === 'HOUSING'}
                                        onChange={(e) => setTransferType(e.target.value)}
                                        className="sr-only"
                                    />
                                    <Briefcase className={`ml-3 ${transferType === 'HOUSING' ? 'text-blue-600' : 'text-gray-400'}`} />
                                    <div>
                                        <div className={`font-semibold ${transferType === 'HOUSING' ? 'text-blue-900' : 'text-gray-700'}`}>سكن آخر</div>
                                        <div className="text-xs text-gray-500">تحويل لفرع آخر</div>
                                    </div>
                                </label>
                            </div>

                            {transferType === 'HOUSING' && (
                                <div className="mt-4 max-w-md">
                                    <SearchableSelect
                                        label="اختر السكن"
                                        value={selectedHousing}
                                        onChange={(e) => setSelectedHousing(e.target.value)}
                                        options={housings}
                                        placeholder="اختر السكن..."
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Items Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base md:text-lg font-semibold text-gray-800">العناصر المراد تحويلها</h3>
                                <Button type="button" onClick={addItem} className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm">
                                    <Plus size={16} className="ml-1" /> إضافة عنصر
                                </Button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded shadow-sm">
                                        <div className="w-full md:w-1/4">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">نوع العنصر</label>
                                            <select
                                                value={item.itemType}
                                                onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="1">قطع غيار</option>
                                                <option value="2">معدات سائقين</option>
                                            </select>
                                        </div>

                                        <div className="w-full md:w-2/4">
                                            <SearchableSelect
                                                label="اسم العنصر"
                                                value={item.itemId}
                                                onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                                                options={(item.itemType === '1' ? spareParts : accessories).map(opt => ({
                                                    id: opt.id,
                                                    name: `${opt.name} ${opt.quantity <= 0 ? '(نفذت الكمية)' : `(المتاح: ${opt.quantity})`}`
                                                }))}
                                                placeholder="اختر العنصر..."
                                                required
                                            />
                                        </div>

                                        <div className="w-full md:w-1/4">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">الكمية</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
                                                placeholder="الكمية"
                                            />
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-md mb-0.5"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <Button
                                type="submit"
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                                disabled={loading}
                            >
                                {loading ? 'جاري الإرسال...' : 'تأكيد التحويل'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm mx-2 md:mx-4">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-xs md:text-base font-bold text-gray-800">سجل التحويلات السابقة</h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExcelExport}
                                className="text-green-600 border-green-600 hover:bg-green-50 text-xs"
                                disabled={loading || transfers.length === 0}
                            >
                                <FileSpreadsheet size={16} className="ml-0" />
                                تصدير Excel
                            </Button>
                            <Button variant="outline" onClick={loadTransfers} className="text-xs">
                                تحديث
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-y">
                                <tr>
                                    <th className="py-3 px-2 md:px-4 text-xs md:text-sm">رقم التحويل</th>
                                    <th className="py-3 px-2 md:px-4 text-xs md:text-sm">الوجهة</th>
                                    <th className="py-3 px-2 md:px-4 text-xs md:text-sm">تاريخ التحويل</th>
                                    <th className="py-3 px-2 md:px-4 text-xs md:text-sm">العناصر</th>
                                    <th className="py-3 px-2 md:px-4 text-xs md:text-sm">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transfers.length > 0 ? (
                                    transfers.map((transfer) => (
                                        <tr key={transfer.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4">#{transfer.id}</td>
                                            <td className="py-3 px-4">
                                                <span className="flex items-center gap-2 text-blue-600">
                                                    {transfer.toLocation ? (
                                                        <>
                                                            <Briefcase size={12} /> {transfer.toLocation}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Building2 size={12} /> الشركة الرئيسية
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                {new Date(transfer.transferredAt).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm space-y-1">
                                                    {transfer.items?.map((item, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <span className="text-gray-500">{item.itemType === 1 || item.itemType === '1' ? 'قطعة غيار: ' : 'معدة: '}</span>
                                                            <span className="font-medium">{item.itemName || getItemName(item.itemType, item.itemId)}</span>
                                                            <span className="text-gray-400">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                    {(!transfer.items || transfer.items.length === 0) && <span className="text-gray-400">لا يوجد عناصر</span>}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                    تم التحويل
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">
                                            لا توجد تحويلات سابقة
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
