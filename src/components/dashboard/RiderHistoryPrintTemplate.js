import React from 'react';

const monthNamesMap = {
    "January": "يناير",
    "February": "فبراير",
    "March": "مارس",
    "April": "أبريل",
    "May": "مايو",
    "June": "يونيو",
    "July": "يوليو",
    "August": "أغسطس",
    "September": "سبتمبر",
    "October": "أكتوبر",
    "November": "نوفمبر",
    "December": "ديسمبر"
};

const RiderHistoryPrintTemplate = ({ data, language, t }) => {
    if (!data) return null;

    // Process data to group by year
    const yearsData = data.monthlyData?.reduce((acc, month) => {
        const year = month.year;
        if (!acc[year]) acc[year] = [];
        acc[year].push(month);
        return acc;
    }, {}) || {};

    // Sort months within each year
    Object.keys(yearsData).forEach(year => {
        yearsData[year].sort((a, b) => a.month - b.month);
    });

    const sortedYears = Object.entries(yearsData).sort(([yearA], [yearB]) => yearB - yearA);

    return (
        <div id="rider-history-print" className="hidden print:block bg-white w-full h-full p-4 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div className="flex justify-between items-start mb-3 border-b border-blue-600 pb-1.5 print-color-exact">
                <div className="flex flex-col items-start gap-1">
                    <div className="bg-blue-600 text-white px-2 py-1 rounded shadow-sm">
                        <h1 className="text-sm font-black uppercase tracking-tight">{t('reports.riderHistory')}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <h2 className="text-3xl font-black text-[#1e3a8a] leading-none mb-0.5">{t('common.companyName')}</h2>
                        <p className="text-[#f59e0b] font-black text-[18px] tracking-wide">{t('common.logisticsServices')}</p>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center p-0.5 bg-white rounded shadow-sm border border-gray-100">
                        <img src="/2.png" className="w-full h-full object-contain" alt="logo" />
                    </div>
                </div>
            </div>

            {/* Rider Info Card */}
            <div className="bg-gradient-to-l from-gray-50 to-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm print-color-exact">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="text-center bg-white rounded border border-gray-200 px-3 py-2 min-w-[100px]">
                            <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider mb-1">آخر وردية</p>
                            <p className="font-black text-gray-900 text-sm">{data.lastShiftDate || '-'}</p>
                        </div>
                        <div className="text-center bg-white rounded border border-gray-200 px-3 py-2 min-w-[100px]">
                            <p className="text-[9px] text-blue-600 font-black uppercase tracking-wider mb-1">أول وردية</p>
                            <p className="font-black text-gray-900 text-sm">{data.firstShiftDate || '-'}</p>
                        </div>
                        {data.activeMonthsCount !== undefined && (
                            <div className="text-center bg-blue-600 rounded shadow px-3 py-2 min-w-[100px] text-white">
                                <p className="text-[9px] font-black uppercase tracking-wider mb-1 opacity-90">الشهور النشطة</p>
                                <p className="font-black text-lg">{data.activeMonthsCount}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-2xl font-black text-[#1e3a8a] leading-none text-right">{data.riderName}</h2>
                            <div className="flex gap-4 text-gray-700 font-bold text-xs mt-1.5">
                                <span className="bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">الرقم الوظيفي: <span className="text-black font-black">{data.workingId}</span></span>
                                <span className="bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">الإقامة: <span className="text-black font-black">{data.iqamaNo}</span></span>
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Years Grid */}
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
                {sortedYears.map(([year, months]) => (
                    <div key={year} className="border border-gray-200 rounded-lg overflow-hidden break-inside-avoid shadow print-break-inside-avoid bg-white">
                        {/* Year Header */}
                        <div className="bg-[#1e3a8a] text-white py-1.5 text-center font-black text-sm uppercase tracking-tighter print-color-exact">
                            {year}
                        </div>

                        {/* Table Header */}
                        <div className="bg-blue-500 flex justify-between px-2 py-1 text-[12px] font-black text-white uppercase tracking-widest border-b border-blue-600 print-color-exact">
                            <span>الشهر</span>
                            <span>الطلبات</span>
                        </div>

                        {/* Months List */}
                        <div className="bg-white">
                            {months.map((month, idx) => (
                                <div key={idx} className={`flex justify-between items-center px-2 py-1 border-b border-gray-100 last:border-0 text-xs font-black ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-1">
                                        <span className="text-gray-900">{month.monthName}</span>
                                        {monthNamesMap[month.monthName] && (
                                            <span className="text-gray-900 font-bold opacity-100 text-[9px]"> ({monthNamesMap[month.monthName]})</span>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-1.5 py-0.5 rounded text-sm font-black ${month.totalAcceptedOrders < 400 ? 'bg-red-50 text-red-700' : 'text-blue-700'}`}>
                                            {month.totalAcceptedOrders?.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="fixed bottom-4 left-6 right-6 flex justify-between text-[8px] text-gray-400 border-t border-gray-100 pt-1.5 font-bold italic">
                <p className="bg-gray-50 px-2 py-0 rounded-full">{t('common.generatedDate')}: {new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                <p className="bg-blue-50 text-blue-300 px-2 py-0 rounded-full font-black uppercase tracking-widest">Fastexpress Management System</p>
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
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
                        min-height: 100vh;
                        padding: 1.5cm;
                        margin: 0;
                        z-index: 9999;
                        overflow: visible;
                    }
                    .print-color-exact {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-break-inside-avoid {
                        break-inside: avoid-page;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default RiderHistoryPrintTemplate;
