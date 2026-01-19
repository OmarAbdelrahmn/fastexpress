import React from 'react';

const RiderHistoryPrintTemplate = ({ data, language, t }) => {
    if (!data) return null;

    // Process data to group by year
    const yearsData = data.monthlyData?.reduce((acc, month) => {
        const year = month.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(month);
        return acc;
    }, {}) || {};

    const sortedYears = Object.entries(yearsData).sort(([yearA], [yearB]) => yearB - yearA);

    return (
        <div id="rider-history-print" className="hidden print:block bg-white w-full h-full p-4 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 border-b-2 border-dashed border-gray-400 pb-2 print-color-exact">
                <div className="flex flex-col items-start gap-1">
                    <div className="px-2 py-1 bg-white">
                        <h1 className="text-lg font-bold text-[#1e3a8a]">{t('reports.riderHistory')}</h1>
                    </div>
                    <div className="px-2">
                        <p className="text-[#1e3a8a] text-xs font-bold">{t('reports.riderHistoryDesc')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <h2 className="text-lg font-bold text-[#1e3a8a]">{t('common.companyName')}</h2>
                        <p className="text-[#f59e0b] font-bold text-sm">{t('common.logisticsServices')}</p>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center text-[#1e3a8a]">
                        <img src="/2.png" className="w-full h-full object-contain" alt="logo" />
                    </div>
                </div>
            </div>

            {/* Rider Info Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-5 mb-6 flex flex-col md:flex-row justify-between items-center print-color-exact">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-[#1e3a8a]">{data.riderName}</h2>
                    <div className="flex gap-6 text-gray-700 font-bold text-sm">
                        <p>ID: <span className="text-black">{data.workingId}</span></p>
                        <p>Iqama: <span className="text-black">{data.iqamaNo}</span></p>
                    </div>
                </div>
                <div className="text-right flex gap-8">
                    <div>
                        <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider">{t('firstShiftDate') || 'First Shift'}</p>
                        <p className="font-bold text-black text-sm">{data.firstShiftDate || '-'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider">{t('lastShiftDate') || 'Last Shift'}</p>
                        <p className="font-bold text-black text-sm">{data.lastShiftDate || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Years Grid */}
            <div className="grid grid-cols-4 gap-2">
                {sortedYears.map(([year, months]) => (
                    <div key={year} className="border border-gray-200 rounded-sm overflow-hidden break-inside-avoid shadow-sm print-break-inside-avoid">
                        {/* Year Header */}
                        <div className="bg-[#6B86D6] text-white py-1 text-center font-bold text-sm print-color-exact">
                            {year}
                        </div>

                        {/* Table Header */}
                        <div className="bg-[#144CD5] flex justify-between px-2 py-1 text-[10px] font-bold text-white print-color-exact">
                            <span>الشهر</span>
                            <span>الطلبات</span>
                        </div>

                        {/* Months List */}
                        <div className="bg-white">
                            {months.map((month, idx) => (
                                <div key={idx} className="flex justify-between items-center px-2 py-1 border-b border-gray-100 last:border-0 text-[10px] font-bold">
                                    <span className="text-gray-800">{month.monthName}</span>
                                    <span className={`px-1.5 py-0 rounded ${month.totalAcceptedOrders < 400 ? 'bg-red-100 text-red-600' : 'text-[#1e3a8a]'}`}>
                                        {month.totalAcceptedOrders}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="fixed bottom-4 left-4 right-4 flex justify-between text-[8px] text-gray-400 border-t border-gray-200 pt-1">
                <p>{t('common.generatedDate')}: {new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                <p>Fastexpress</p>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0.5cm;
                    }
                    body {
                        visibility: hidden;
                        background-color: white;
                    }
                    #rider-history-print {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        z-index: 9999;
                    }
                    .print-color-exact {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-break-inside-avoid {
                        break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
};

export default RiderHistoryPrintTemplate;
