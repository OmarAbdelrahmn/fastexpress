import React from 'react';

const SpecialReportTemplate = ({ data, ref }) => {
    if (!data) return null;

    return (
        <div id="special-report-print" className="hidden print:block bg-white w-full h-full p-8 font-sans" dir="rtl">
            {/* Header */}
            <div className="bg-[#1a365d] text-white p-4 flex justify-between items-center mb-12 border-4 border-[#1a365d]">

                {/* Title Box */}
                <div className="flex-1 flex justify-center">
                    <div className="border-2 border-[#f4a261] p-2 px-8 text-center bg-[#1e40af] bg-opacity-30">
                        <h1 className="text-2xl font-bold mb-1">تقرير فرق عدد الطلبات حسب التاريخ</h1>
                        <h2 className="text-lg font-semibold text-white">Total Orders Difference in Date Range</h2>
                    </div>
                </div>

                {/* Company Logo/Name Area */}
                <div className="flex flex-col items-end justify-center w-1/4">
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <h3 className="text-xl font-bold">شركة الخدمة السريعة</h3>
                            <p className="text-sm text-gray-300">للخدمات اللوجستية</p>
                        </div>
                        {/* Logo Icon Placeholder - matching the E logo roughly */}
                        <div className="w-10 h-10 border-2 border-white rounded md:rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold">E</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">

                {/* Right Column (Period 1) */}
                <div className="flex flex-col items-center">
                    <div className="bg-[#22c55e] text-white py-2 px-12 text-xl font-bold mb-2 w-full text-center shadow-md">
                        عدد الطلبات
                    </div>
                    <div className="bg-[#06b6d4] text-white py-1 px-8 text-lg font-semibold mb-4 w-3/4 text-center shadow-md">
                        في الفترة
                    </div>

                    <div className="flex flex-col gap-2 mb-4 w-full px-4 font-bold text-lg">
                        <div className="flex justify-between items-center text-blue-800">
                            <span>من</span>
                            <span className="text-red-500">{data.period1Start}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-800">
                            <span>إلى</span>
                            <span className="text-red-500">{data.period1End}</span>
                        </div>
                    </div>

                    <div className="w-full h-1 bg-black mb-1"></div>
                    <div className="w-full h-1 bg-black mb-4"></div>

                    <div className="bg-[#7e22ce] text-white py-2 px-8 text-2xl font-bold w-3/4 text-center rounded shadow-md">
                        {data.period1TotalOrders}
                    </div>
                </div>

                {/* Middle Column (Difference & Stats) */}
                <div className="flex flex-col items-center justify-start pt-0">
                    <div className="bg-[#22c55e] text-white py-2 px-12 text-xl font-bold mb-4 w-full text-center shadow-md">
                        الفرق
                    </div>

                    <div className="bg-[#6b7280] text-white py-2 px-8 text-2xl font-bold w-full text-center mb-12 shadow-md">
                        {data.ordersDifference}
                    </div>

                    <div className="bg-[#1e3a8a] text-white py-2 px-12 text-xl font-bold mb-4 w-full text-center shadow-md">
                        النسبة
                    </div>

                    <div className="bg-[#0000ff] text-white py-1 px-4 text-xl font-bold w-1/2 text-center mb-4 flex justify-between items-center shadow-md mx-auto">
                        <span>%</span>
                        <span>{data.changePercentage}</span>
                    </div>

                    <div className="bg-[#22c55e] text-white py-2 px-8 text-xl font-bold w-3/4 text-center shadow-md">
                        {data.trendDescription && data.trendDescription.includes('increase') ? 'زيادة' : 'نقصان'}
                    </div>

                </div>

                {/* Left Column (Period 2) */}
                <div className="flex flex-col items-center">
                    <div className="bg-[#22c55e] text-white py-2 px-12 text-xl font-bold mb-2 w-full text-center shadow-md">
                        عدد الطلبات
                    </div>
                    <div className="bg-[#06b6d4] text-white py-1 px-8 text-lg font-semibold mb-4 w-3/4 text-center shadow-md">
                        في الفترة
                    </div>

                    <div className="flex flex-col gap-2 mb-4 w-full px-4 font-bold text-lg">
                        <div className="flex justify-between items-center text-blue-800">
                            <span>من</span>
                            <span className="text-red-500">{data.period2Start}</span>
                        </div>
                        <div className="flex justify-between items-center text-blue-800">
                            <span>إلى</span>
                            <span className="text-red-500">{data.period2End}</span>
                        </div>
                    </div>

                    <div className="w-full h-1 bg-black mb-1"></div>
                    <div className="w-full h-1 bg-black mb-4"></div>

                    <div className="bg-[#7e22ce] text-white py-2 px-8 text-2xl font-bold w-3/4 text-center rounded shadow-md">
                        {data.period2TotalOrders}
                    </div>
                </div>

            </div>

            {/* Footer / Extra info if needed, or just padding */}
            <div className="mt-20"></div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #special-report-print, #special-report-print * {
            visibility: visible;
          }
          #special-report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20px;
            background: white;
            z-index: 9999;
            direction: rtl !important;
          }
           /* Ensure background colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
        </div>
    );
};

export default SpecialReportTemplate;
