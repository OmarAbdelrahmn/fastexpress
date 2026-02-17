'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '@/lib/api/apiService';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import PageHeader from '@/components/layout/pageheader';
import { BadgeDollarSign, Calendar, Search, FileSpreadsheet, DollarSign, Package, Wrench } from 'lucide-react';
import Button from '@/components/Ui/Button';
import Table from '@/components/Ui/Table';
import * as XLSX from 'xlsx';

export default function HousingCostsPage() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]); // This will hold housingCosts array
    const [summary, setSummary] = useState(null); // This will hold the full response object
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
        // Use the state values directly, but since we set them as defaults, 
        // they will be available on mount if we call loadData.
        // However, to be extra safe on the first call, we can pass them or just rely on state.
        setLoading(true);
        try {
            // We use state here, but note that the default values are already in state.
            const response = await ApiService.get(API_ENDPOINTS.SPARE_PARTS.ALL_HOUSINGS_COSTS(fromDate, toDate));
            if (response && response.housingCosts) {
                const housingData = response.housingCosts;

                // Add company stock as a row if it exists
                if (response.companyStock) {
                    const companyRow = {
                        housingName: 'مستودع الشركة / المخزون العام',
                        vehicleCount: "-",
                        riderCount: "-",
                        sparePartsCost: response.companyStock.sparePartsCost || 0,
                        accessoriesCost: response.companyStock.accessoriesCost || 0,
                        accessoriesLabel: 'معدات السائقين',
                        totalCost: response.companyStock.totalCost || 0,
                        isCompanyStock: true // For potential styling
                    };
                    setData([...housingData, companyRow]);
                } else {
                    setData(housingData);
                }

                setSummary(response);
            } else {
                setData([]);
                setSummary(null);
            }
        } catch (error) {
            console.error('Error loading housing costs:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (fromDate && toDate) {
            loadData();
        } else {
            alert('الرجاء اختيار التاريخ من وإلى');
        }
    };

    const handleExcelExport = () => {
        if (!data || data.length === 0) return;

        const excelData = data.map(item => ({
            "السكن": item.housingName,
            "عدد المركبات": item.vehicleCount,
            "عدد السائقين": item.riderCount,
            "تكلفة قطع الغيار": `${Number(item.sparePartsCost).toFixed(2)} ر.س`,
            "تكلفة معدات السائقين": `${Number(item.accessoriesCost).toFixed(2)} ر.س`,
            "نوع الصنف": "معدات السائقين",
            "التكلفة الإجمالية": `${Number(item.totalCost).toFixed(2)} ر.س`,
        }));

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wscols = [
            { wch: 25 }, // Housing Name
            { wch: 15 }, // Vehicles
            { wch: 15 }, // Riders
            { wch: 20 }, // Spare Parts
            { wch: 20 }, // Accessories
            { wch: 20 }, // Total
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تكاليف السكن");
        XLSX.writeFile(wb, `housing_costs_${fromDate}_${toDate}.xlsx`);
    };

    const columns = [
        {
            header: 'السكن',
            accessor: 'housingName',
            render: (row) => (
                <span className={row.isCompanyStock ? "font-bold text-blue-700" : ""}>
                    {row.housingName}
                </span>
            )
        },
        {
            header: 'عدد المركبات',
            accessor: 'vehicleCount',
        },
        {
            header: 'عدد السائقين',
            accessor: 'riderCount',
        },
        {
            header: 'تكلفة قطع الغيار',
            accessor: 'sparePartsCost',
            render: (row) => `${Number(row.sparePartsCost).toFixed(2)} ر.س`
        },
        {
            header: 'تكلفة معدات السائقين',
            accessor: 'accessoriesCost',
            render: (row) => `${Number(row.accessoriesCost).toFixed(2)} ر.س`
        },
        {
            header: 'التكلفة الإجمالية',
            accessor: 'totalCost',
            render: (row) => <span className="font-bold text-green-600">{Number(row.totalCost).toFixed(2)} ر.س</span>
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="تكاليف قطع الغيار حسب السكن"
                subtitle="عرض تكاليف قطع الغيار لكل سكن خلال فترة محددة"
                icon={BadgeDollarSign}
            />
            <div className="mx-4 md:mx-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Summary Cards */}
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border-r-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs md:text-sm text-gray-500 mb-1">إجمالي التكلفة</p>
                            <h3 className="text-lg md:text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.grandTotalCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-2 md:p-3 bg-blue-50 rounded-full text-blue-600">
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border-r-4 border-orange-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">قطع الغيار</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {summary ? `${Number(summary.grandTotalSparePartsCost).toFixed(2)} ر.س` : '-'}
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
                                {summary ? `${Number(summary.grandTotalAccessoriesCost).toFixed(2)} ر.س` : '-'}
                            </h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                            <Package size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm mx-4 md:mx-6">
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
                        disabled={!data || data.length === 0}
                    >
                        <FileSpreadsheet size={18} className="ml-2" />
                        تصدير إكسل
                    </Button>
                </div>

                <Table
                    columns={columns}
                    data={data}
                    loading={loading}
                    emptyMessage="الرجاء اختيار الفترة وعمل بحث لعرض البيانات"
                />
            </div>
        </div>
    );
}
