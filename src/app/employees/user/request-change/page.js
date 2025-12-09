'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { RefreshCcw, Search, ArrowRight, Send, User } from 'lucide-react';

export default function RequestChangeStatusPage() {
    const router = useRouter();
    const [searchIqama, setSearchIqama] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [employeeData, setEmployeeData] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [reason, setReason] = useState('');
    const [requestedBy, setRequestedBy] = useState('');

    const handleSearchEmployee = async () => {
        if (!searchIqama.trim()) {
            setErrorMessage('الرجاء إدخال رقم الإقامة');
            return;
        }

        setSearchLoading(true);
        setErrorMessage('');
        setEmployeeData(null);
        setNewStatus('');

        try {
            const data = await ApiService.get(API_ENDPOINTS.EMPLOYEE.ONE(searchIqama));

            if (data) {
                setEmployeeData(data);
                setErrorMessage('');
            } else {
                setErrorMessage('لم يتم العثور على الموظف');
            }
        } catch (err) {
            console.error('Error searching employee:', err);
            setErrorMessage(err?.message || 'حدث خطأ في البحث عن الموظف');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!employeeData) {
            setErrorMessage('الرجاء البحث عن الموظف أولاً');
            return;
        }

        if (!newStatus) {
            setErrorMessage('الرجاء اختيار الحالة الجديدة');
            return;
        }

        if (newStatus === employeeData.status) {
            setErrorMessage('الحالة المختارة هي نفس الحالة الحالية للموظف');
            return;
        }

        if (!reason.trim()) {
            setErrorMessage('الرجاء إدخال سبب الطلب');
            return;
        }

        if (!requestedBy.trim()) {
            setErrorMessage('الرجاء إدخال اسم مقدم الطلب');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await ApiService.post(
                '/api/Temp/request-change',
                {
                    iqamaNo: employeeData.iqamaNo,
                    newStatus: newStatus,
                    reason: reason,
                    requestedBy: requestedBy
                }
            );

            setSuccessMessage('تم إرسال طلب تغيير الحالة بنجاح. في انتظار موافقة المسؤول.');

            setTimeout(() => {
                router.push('/employees/user');
            }, 2000);
        } catch (err) {
            console.error('Error submitting status change request:', err);
            setErrorMessage(err?.message || 'حدث خطأ أثناء إرسال الطلب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="طلب تغيير حالة موظف"
                subtitle="إرسال طلب لتغيير حالة موظف"
                icon={RefreshCcw}
                actionButton={{
                    text: 'العودة',
                    icon: <ArrowRight size={18} />,
                    onClick: () => router.push('/employees/user'),
                    variant: 'secondary'
                }}
            />

            {successMessage && (
                <Alert
                    type="success"
                    title="نجح"
                    message={successMessage}
                    onClose={() => setSuccessMessage('')}
                />
            )}

            {errorMessage && (
                <Alert
                    type="error"
                    title="خطأ"
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

            {/* Search Employee */}
            <Card>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Search size={20} />
                    البحث عن الموظف
                </h3>

                <div className="flex gap-3 mb-4">
                    <Input
                        label=""
                        type="number"
                        value={searchIqama}
                        onChange={(e) => setSearchIqama(e.target.value)}
                        placeholder="أدخل رقم إقامة الموظف..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchEmployee()}
                    />
                    <Button
                        type="button"
                        onClick={handleSearchEmployee}
                        loading={searchLoading}
                        disabled={searchLoading}
                        className="mt-0"
                    >
                        <Search size={18} className="ml-2" />
                        بحث
                    </Button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                        ابحث عن الموظف الذي تريد تغيير حالته
                    </p>
                </div>
            </Card>

            {/* Employee Information (if found) */}
            {employeeData && (
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} />
                        معلومات الموظف
                    </h3>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-600">الحالة الحالية:</span>
                            <StatusBadge status={employeeData.status} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">رقم الإقامة</p>
                                <p className="font-bold text-gray-800">{employeeData.iqamaNo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">الاسم (عربي)</p>
                                <p className="font-bold text-gray-800">{employeeData.nameAR}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">الاسم (إنجليزي)</p>
                                <p className="font-bold text-gray-800">{employeeData.nameEN}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">المسمى الوظيفي</p>
                                <p className="font-medium text-gray-800">{employeeData.jobTitle}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">البلد</p>
                                <p className="font-medium text-gray-800">{employeeData.country}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                                <p className="font-medium text-gray-800">{employeeData.phone}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Request Form (only show if employee found) */}
            {employeeData && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">تفاصيل الطلب</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحالة الجديدة <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">اختر الحالة الجديدة</option>
                                    <option value="enable">نشط</option>
                                    <option value="disable">غير نشط</option>
                                    <option value="fleeing">هارب</option>
                                    <option value="vacation">إجازة</option>
                                    <option value="accident">حادث</option>
                                    <option value="sick">مريض</option>
                                </select>
                                {newStatus && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm text-gray-600">المعاينة:</span>
                                        <StatusBadge status={newStatus} />
                                    </div>
                                )}
                            </div>

                            <Input
                                label="اسم مقدم الطلب"
                                type="text"
                                value={requestedBy}
                                onChange={(e) => setRequestedBy(e.target.value)}
                                required
                                placeholder="أدخل اسمك"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    سبب تغيير الحالة <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder="اذكر السبب التفصيلي لطلب تغيير حالة هذا الموظف..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex gap-3 justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setEmployeeData(null);
                                    setSearchIqama('');
                                    setNewStatus('');
                                    setReason('');
                                    setRequestedBy('');
                                }}
                                disabled={loading}
                            >
                                إلغاء
                            </Button>
                            <Button type="submit" loading={loading} disabled={loading}>
                                <Send size={18} className="ml-2" />
                                إرسال الطلب
                            </Button>
                        </div>
                    </Card>
                </form>
            )}

            {/* Instructions */}
            {!employeeData && (
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">كيفية الاستخدام</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <p>ابحث عن الموظف برقم الإقامة</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p>تحقق من معلومات الموظف والحالة الحالية</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p>اختر الحالة الجديدة من القائمة</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">4</span>
                            </div>
                            <p>أدخل اسمك وسبب تغيير الحالة</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">5</span>
                            </div>
                            <p>أرسل الطلب وانتظر موافقة المسؤول</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
