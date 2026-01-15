import React from 'react';

const KetaDailySummaryTemplate = ({ data }) => {
    if (!data) return null;

    return (
        <div id="keta-daily-summary-print" className="hidden print:block bg-white w-full h-full p-4 font-sans" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-dashed border-gray-400 pb-4">
                {/* Title Section */}
                <div className="flex flex-col items-start gap-4">
                    <div className="p-2 bg-white">
                        <h1 className="text-xl font-bold text-[#1e3a8a]">ملخص كيتا اليومي</h1>
                    </div>
                    <div className="flex flex-col gap-1 pr-2">
                        <div className="flex items-center gap-4 font-bold text-gray-700">
                            <span className="text-[#1e3a8a] text-lg">التاريخ:</span>
                            <span className="text-xl">{data.reportDate}</span>
                        </div>
                    </div>
                </div>

                {/* Company Info */}
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-[#1e3a8a]">شركة الخدمة السريعة</h2>
                        <p className="text-[#f59e0b] font-bold text-lg">للخدمات اللوجستية</p>
                    </div>
                    <div className="w-16 h-16 rounded flex items-center justify-center text-[#1e3a8a]">
                        <img src="/2.png" className="w-full h-full" alt="logo" />
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-300 rounded-lg p-6 bg-green-50">
                    <h3 className="text-lg font-bold text-gray-600 mb-2">إجمالي الطلبات (Delivered)</h3>
                    <p className="text-4xl font-bold text-green-800">{data.totalOrdersDelivered?.toLocaleString()}</p>
                </div>

                {/* <div className="border border-gray-300 rounded-lg p-6 bg-orange-50">
                    <h3 className="text-lg font-bold text-gray-600 mb-2">متوسط ساعات العمل</h3>
                    <p className="text-4xl font-bold text-orange-600">{data.averageWorkingHours?.toFixed(2)}</p>
                </div> */}

                <div className="border border-gray-300 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-bold text-gray-600 mb-2">إجمالي الطلبات المرفوضة</h3>
                    <p className="text-4xl font-bold text-red-600">{data.totalShifts?.toLocaleString()}</p>
                </div>

                <div className="border border-gray-300 rounded-lg p-6 bg-purple-50">
                    <h3 className="text-lg font-bold text-gray-600 mb-2">إجمالي المناديب</h3>
                    <p className="text-4xl font-bold text-purple-600">{data.totalRiders?.toLocaleString()}</p>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #keta-daily-summary-print, #keta-daily-summary-print * {
                    visibility: visible;
                  }
                  #keta-daily-summary-print {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    margin: 0;
                    padding: 20px;
                    background: white !important;
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

export default KetaDailySummaryTemplate;
