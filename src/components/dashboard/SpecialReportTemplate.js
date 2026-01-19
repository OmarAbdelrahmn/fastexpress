
import React from 'react';

const SpecialReportTemplate = ({ data }) => {
    if (!data) return null;

    return (
        <div id="special-report-print" className="hidden print:block bg-white w-full h-full p-8 font-sans" dir="rtl">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-800 to-blue-700 text-white px-8 py-5 mb-15 rounded-lg shadow-xl flex items-center justify-between">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">
                        تقرير فرق عدد الطلبات
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <h3 className="text-lg font-bold">
                            شركة الخدمة السريعة
                        </h3>
                    </div>
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img
                            src="/2.png"
                            alt="logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-10 max-w-6xl mx-auto">

                {/* Right Column (Period 1) */}
                <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-3 px-8 text-lg font-bold mb-8 w-full text-center rounded-lg shadow-lg">
                        الفترة الأولى
                    </div>
                    <div className="flex flex-col gap-2 mb-8 w-full px-4 text-base">
                        <div className="flex justify-between items-center text-gray-700">
                            <span className="font-bold">من:</span>
                            <span className="font-bold">{data.period1Start}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700">
                            <span className="font-bold">إلى:</span>
                            <span className="font-bold">{data.period1End}</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white py-4 px-6 text-2xl font-bold w-full text-center rounded-lg shadow-xl">
                        {data.period1TotalOrders} طلب
                    </div>
                </div>

                {/* Middle Column (Difference) */}
                <div className="flex flex-col items-center">
                    <div className="invisible py-3 px-8 text-lg font-bold mb-8 w-full">
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white py-3 px-8 text-lg font-bold mb-8 w-full text-center rounded-lg shadow-lg">
                        الفرق
                    </div>

                    <div className={`${Number(data.ordersDifference) < 0 ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-emerald-500 to-green-600'} text-white py-4 px-6 text-2xl font-bold w-full text-center rounded-lg shadow-xl`}>
                        {data.ordersDifference} طلب
                    </div>
                </div>

                {/* Left Column (Period 2) */}
                <div className="flex flex-col items-center">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-3 px-8 text-lg font-bold mb-8 w-full text-center rounded-lg shadow-lg">
                        الفترة الثانية
                    </div>

                    <div className="flex flex-col gap-2 mb-8 w-full px-4 text-base">
                        <div className="flex justify-between items-center text-gray-700">
                            <span className="font-bold">من:</span>
                            <span className="font-bold">{data.period2Start}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-700">
                            <span className="font-bold">إلى:</span>
                            <span className="font-bold">{data.period2End}</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white py-4 px-6 text-2xl font-bold w-full text-center rounded-lg shadow-xl">
                        {data.period2TotalOrders} طلب
                    </div>
                </div>

            </div>

            {/* Percentage Section */}
            <div className="flex flex-row items-center mt-10 max-w-sm mx-auto gap-5">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white py-3 px-8 text-lg font-bold text-center rounded-lg shadow-lg min-w-[150px] flex items-center justify-center">
                    نسبة التغير
                </div>
                <div className={`${Number(data.changePercentage) < 0 ? 'bg-gradient-to-br from-red-600 to-red-700' : 'bg-gradient-to-br from-emerald-500 to-green-600'} text-white py-3 px-8 text-2xl font-bold text-center rounded-lg shadow-xl min-w-[150px]`}>
                    %{data.changePercentage}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    html, body {
                         height: auto;
                         min-height: 100vh;
                         overflow: hidden; 
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
                        padding: 25px;
                        background: white;
                        z-index: 9999;
                        direction: rtl !important;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default SpecialReportTemplate;