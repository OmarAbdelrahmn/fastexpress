'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Card from '@/components/Ui/Card';
import Button from '@/components/Ui/Button';
import Alert from '@/components/Ui/Alert';
import Input from '@/components/Ui/Input';
import Table from '@/components/Ui/Table';
import PageHeader from '@/components/layout/pageheader';
import StatusBadge from '@/components/Ui/StatusBadge';
import { Filter, Search, Eye, Edit, X } from 'lucide-react';

export default function RiderMultiFilterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const [filters, setFilters] = useState({
        iqamaEndH: '',
        iqamaEndM: '',
        sponsor: '',
        sponsorNo: '',
        passportEnd: '',
        jobTitle: '',
        nameAR: '',
        nameEN: '',
        country: '',
        status: '',
        inksa: '',
        workingId: '',
        companyName: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    const handleSearch = async (e) => {
        e?.preventDefault();

        setLoading(true);
        setErrorMessage('');
        setHasSearched(true);

        try {
            // Build query string with only non-empty filters
            const queryParams = new URLSearchParams();

            Object.keys(filters).forEach(key => {
                if (filters[key] !== '' && filters[key] !== null) {
                    queryParams.append(key, filters[key]);
                }
            });

            const data = await ApiService.get(
                `${API_ENDPOINTS.RIDER.SEARCH}?${queryParams.toString()}`
            );

            setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error filtering riders:', err);
            setErrorMessage(err?.message || 'حدث خطأ في البحث');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFilters({
            iqamaEndH: '',
            iqamaEndM: '',
            sponsor: '',
            sponsorNo: '',
            passportEnd: '',
            jobTitle: '',
            nameAR: '',
            nameEN: '',
            country: '',
            status: '',
            inksa: '',
            workingId: '',
            companyName: ''
        });
        setSearchResults([]);
        setHasSearched(false);
        setErrorMessage('');
    };

    const columns = [
        {
            header: 'رقم الإقامة',
            accessor: 'iqamaNo',
            render: (row) => (
                <span className="font-bold text-blue-600">{row.iqamaNo}</span>
            )
        },
        { header: 'الاسم (عربي)', accessor: 'nameAR' },
        { header: 'الاسم (إنجليزي)', accessor: 'nameEN' },
        { header: 'رقم العمل', accessor: 'workingId' },
        { header: 'الشركة', accessor: 'companyName' },
        {
            header: 'الحالة',
            accessor: 'status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            header: 'الإجراءات',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/riders/${row.iqamaNo}`)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="عرض التفاصيل"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={() => router.push(`/riders/${row.iqamaNo}/edit`)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="تعديل"
                    >
                        <Edit size={18} />
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="البحث المتقدم - المناديب"
                subtitle="تصفية المناديب حسب معايير متعددة"
                icon={Filter}
            />

            {errorMessage && (
                <Alert
                    type="error"
                    title="خطأ"
                    message={errorMessage}
                    onClose={() => setErrorMessage('')}
                />
            )}

            {/* Filter Form */}
            <Card>
                <form onSubmit={handleSearch} className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">معايير البحث</h3>

                    {/* Personal Info Filters */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">المعلومات الشخصية</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label="الاسم (عربي)"
                                type="text"
                                name="nameAR"
                                value={filters.nameAR}
                                onChange={handleInputChange}
                                placeholder="ابحث بالاسم العربي"
                            />

                            <Input
                                label="الاسم (إنجليزي)"
                                type="text"
                                name="nameEN"
                                value={filters.nameEN}
                                onChange={handleInputChange}
                                placeholder="ابحث بالاسم الإنجليزي"
                            />

                            <Input
                                label="البلد"
                                type="text"
                                name="country"
                                value={filters.country}
                                onChange={handleInputChange}
                                placeholder="ابحث بالبلد"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحالة
                                </label>
                                <select
                                    name="status"
                                    value={filters.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">الكل</option>
                                    <option value="enable">نشط</option>
                                    <option value="disable">غير نشط</option>
                                    <option value="fleeing">هارب</option>
                                    <option value="vacation">إجازة</option>
                                    <option value="accident">حادث</option>
                                    <option value="sick">مريض</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    في السعودية (INKSA)
                                </label>
                                <select
                                    name="inksa"
                                    value={filters.inksa}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">الكل</option>
                                    <option value="true">نعم</option>
                                    <option value="false">لا</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Work Info Filters */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">معلومات العمل</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label="رقم العمل"
                                type="text"
                                name="workingId"
                                value={filters.workingId}
                                onChange={handleInputChange}
                                placeholder="ابحث برقم العمل"
                            />

                            <Input
                                label="الشركة"
                                type="text"
                                name="companyName"
                                value={filters.companyName}
                                onChange={handleInputChange}
                                placeholder="ابحث بالشركة"
                            />

                            <Input
                                label="المسمى الوظيفي"
                                type="text"
                                name="jobTitle"
                                value={filters.jobTitle}
                                onChange={handleInputChange}
                                placeholder="ابحث بالوظيفة"
                            />

                            <Input
                                label="الكفيل"
                                type="text"
                                name="sponsor"
                                value={filters.sponsor}
                                onChange={handleInputChange}
                                placeholder="ابحث بالكفيل"
                            />

                            <Input
                                label="رقم الكفيل"
                                type="number"
                                name="sponsorNo"
                                value={filters.sponsorNo}
                                onChange={handleInputChange}
                                placeholder="ابحث برقم الكفيل"
                            />
                        </div>
                    </div>

                    {/* Date Filters */}
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-3">التواريخ</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Input
                                label="انتهاء الإقامة (ميلادي)"
                                type="date"
                                name="iqamaEndM"
                                value={filters.iqamaEndM}
                                onChange={handleInputChange}
                            />

                            <Input
                                label="انتهاء الإقامة (هجري)"
                                type="text"
                                name="iqamaEndH"
                                value={filters.iqamaEndH}
                                onChange={handleInputChange}
                                placeholder="مثال: 25-10-1425"
                            />

                            <Input
                                label="انتهاء الجواز"
                                type="date"
                                name="passportEnd"
                                value={filters.passportEnd}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            <X size={18} className="ml-2" />
                            إعادة تعيين
                        </Button>
                        <Button type="submit" loading={loading} disabled={loading}>
                            <Search size={18} className="ml-2" />
                            بحث
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Search Results */}
            {hasSearched && (
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        نتائج البحث ({searchResults.length})
                    </h3>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">جاري البحث...</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-600">لا توجد نتائج تطابق معايير البحث</p>
                            <p className="text-sm text-gray-500 mt-2">جرب تعديل المعايير</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={searchResults}
                            loading={loading}
                        />
                    )}
                </Card>
            )}

            {/* Instructions */}
            {!hasSearched && (
                <Card>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">كيفية الاستخدام</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">1</span>
                            </div>
                            <p>اختر معايير البحث التي تريدها (يمكنك استخدام معيار واحد أو أكثر)</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            <p>اضغط على زر "بحث" لعرض النتائج</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="bg-blue-100 p-1 rounded mt-0.5">
                                <span className="text-blue-600 font-bold">3</span>
                            </div>
                            <p>يمكنك إعادة تعيين المعايير والبحث من جديد</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
