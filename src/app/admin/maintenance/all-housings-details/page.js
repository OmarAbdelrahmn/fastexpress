'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import { FileText, Calendar, Search, FileSpreadsheet, Package, DollarSign, Wrench } from 'lucide-react';
import Button from '@/components/Ui/Button';
import Table from '@/components/Ui/Table';
import * as XLSX from 'xlsx';

export default function AllHousingsDetailsPage() {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-01-01`;
    });
    const [toDate, setToDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.ALL_HOUSINGS_DETAILS(fromDate, toDate));
            console.log(response);

            if (response) {
                setSummary({
                    totalCost: response.totalCompanyCost || 0,
                    totalSparePartsCost: response.totalCompanySparePartsCost || 0,
                    totalAccessoriesCost: response.totalCompanyAccessoriesCost || 0,
                });
                const processed = processData(response);
                setTableData(processed);
            } else {
                setTableData([]);
                setSummary(null);
            }

        } catch (error) {
            console.error('Error loading details:', error);
            setTableData([]);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data) => {
        let rows = [];

        // Helper to process housing/stock details
        const processDetail = (detail, isCompanyStock = false) => {
            const housingName = isCompanyStock ? 'مستودع الشركة / المخزون العام' : detail.housingName;

            // Process Vehicle Usages (Spare Parts)
            if (detail.vehicleUsages && Array.isArray(detail.vehicleUsages)) {
                detail.vehicleUsages.forEach(vehicleUsage => {
                    if (vehicleUsage.sparePartsUsed && Array.isArray(vehicleUsage.sparePartsUsed)) {
                        vehicleUsage.sparePartsUsed.forEach(item => {
                            rows.push({
                                housingName: housingName,
                                date: item.usedAt,
                                type: 'قطع غيار',
                                itemName: item.sparePartName,
                                entityName: `${vehicleUsage.vehiclePlate} - ${vehicleUsage.vehicleNumber || ''}`, // Vehicle
                                quantity: item.quantityUsed,
                                cost: item.totalCost,
                                originalItem: item,
                                isCompanyStock
                            });
                        });
                    }
                });
            }

            // Process Rider Usages (Accessories)
            if (detail.riderUsages && Array.isArray(detail.riderUsages)) {
                detail.riderUsages.forEach(riderUsage => {
                    if (riderUsage.accessoriesUsed && Array.isArray(riderUsage.accessoriesUsed)) {
                        riderUsage.accessoriesUsed.forEach(item => {
                            rows.push({
                                housingName: housingName,
                                date: item.issuedAt,
                                type: 'معدات السائقين',
                                itemName: item.accessoryName,
                                entityName: `${riderUsage.riderNameAR} (${riderUsage.riderNameEN})`, // Rider
                                quantity: 1, // Accessorries usually 1 per record in this context unless specified otherwise
                                cost: item.price,
                                originalItem: item,
                                isCompanyStock
                            });
                        });
                    }
                });
            }
        };

        // Process Housings
        if (data.housings && Array.isArray(data.housings)) {
            data.housings.forEach(housing => processDetail(housing));
        }

        // Process Company Stock
        if (data.companyStock) {
            processDetail(data.companyStock, true);
        }

        // Sort by date descending
        return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const handleSearch = () => {
        if (fromDate && toDate) {
            loadData();
        } else {
            alert('الرجاء اختيار التاريخ من وإلى');
        }
    };

    const handleExcelExport = () => {
        if (!tableData || tableData.length === 0) return;

        const excelData = tableData.map(item => ({
            "السكن/الموقع": item.housingName,
            "التاريخ": item.date ? new Date(item.date).toLocaleDateString('ar-SA') : '-',
            "النوع": item.type,
            "المركبة/السائق": item.entityName,
            "الصنف": item.itemName,
            "الكمية": item.quantity,
            "التكلفة": `${Number(item.cost).toFixed(2)} ر.س`,
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wscols = [
            { wch: 30 }, // Housing
            { wch: 15 }, // Date
            { wch: 15 }, // Type
            { wch: 30 }, // Entity
            { wch: 25 }, // Item
            { wch: 10 }, // Quantity
            { wch: 15 }, // Cost
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تفاصيل الاستخدام");
        XLSX.writeFile(wb, `usage_details_${fromDate}_${toDate}.xlsx`);
    };

    const columns = [
        {
            header: 'السكن/الموقع',
            accessor: 'housingName',
            render: (row) => (
                <span className={row.isCompanyStock ? "font-bold text-blue-700" : ""}>
                    {row.housingName}
                </span>
            )
        },
        {
            header: 'التاريخ',
            accessor: 'date',
            render: (row) => row.date ? new Date(row.date).toLocaleDateString('ar-SA') : '-'
        },
        {
            header: 'النوع',
            accessor: 'type',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs ${row.type === 'قطع غيار'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                    {row.type}
                </span>
            )
        },
        {
            header: 'المركبة/السائق',
            accessor: 'entityName',
        },
        {
            header: 'الصنف',
            accessor: 'itemName',
        },
        {
            header: 'الكمية',
            accessor: 'quantity',
        },
        {
            header: 'التكلفة',
            accessor: 'cost',
            render: (row) => <span className="font-bold text-green-600">{Number(row.cost).toFixed(2)} ر.س</span>
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="تفاصيل استخدام السكنات والمخزون"
                subtitle="عرض تفاصيل شاملة لاستخدام قطع الغيار و معدات السائقين"
                icon={FileText}
            />

            {/* Summary Cards */}
            <div className="mx-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">إجمالي التكلفة</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.totalCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-orange-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">قطع الغيار</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.totalSparePartsCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-full text-orange-600">
                            <Wrench size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">معدات السائقين</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.totalAccessoriesCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                            <Package size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mx-5">
                <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <Button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white mb-[1px]"
                        disabled={loading}
                    >
                        <Search size={18} className="ml-2" />
                        بحث
                    </Button>

                    <Button
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50 mb-[1px] mr-auto"
                        onClick={handleExcelExport}
                        disabled={!tableData || tableData.length === 0}
                    >
                        <FileSpreadsheet size={18} className="ml-2" />
                        تصدير إكسل
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={tableData}
                    loading={loading}
                    emptyMessage="الرجاء اختيار الفترة وعمل بحث لعرض البيانات"
                />
            </div>
        </div>
    );
}
