import React from 'react';

const HousingReportTemplate = ({ data }) => {
    if (!data) return null;

    // Format date safely
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return dateString; // Assuming API returns formatted string or YYYY-MM-DD
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div id="housing-report-print" className="hidden print:block bg-white w-full h-full p-4 font-sans" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-dashed border-gray-400 pb-4">

                {/* Title Section */}
                <div className="flex flex-col items-start gap-4">
                    <div className="p-2 bg-white">
                        <h1 className="text-xl font-bold text-[#1e3a8a]">تقرير إجمالي عدد الطلبات لكل مجموعة</h1>
                    </div>

                    <div className="flex flex-col gap-1 pr-2">
                        <div className="flex items-center gap-4 font-bold text-gray-700">
                            <span className="text-[#1e3a8a] text-lg">اليوم:</span>
                            <span className="text-xl">{formatDate(data.reportDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Company Info */}
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-[#1e3a8a]">شركة الخدمة السريعة</h2>
                        <p className="text-[#f59e0b] font-bold text-lg">للخدمات اللوجستية</p>
                    </div>
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 rounded flex items-center justify-center text-[#1e3a8a]">
                        <img src="2.png" className="w-full h-full" alt="logo" />
                    </div>
                </div>
            </div>

            {/* Table Headers */}
            <div className="flex gap-2 mb-2 text-white font-bold text-center text-sm md:text-base">
                <div className="bg-[#1a365d] w-[15%] py-2 flex items-center justify-center rounded-sm">
                    نسبة كل مجموعة<br />
                </div>
                <div className="bg-[#1a365d] w-[15%] py-2 flex items-center justify-center rounded-sm">
                    عدد السائقين
                </div>
                <div className="bg-[#1a365d] w-[25%] py-2 flex items-center justify-center rounded-sm">
                    متوسط عدد الطلبات
                </div>
                <div className="bg-[#1a365d] w-[23%] py-2 flex items-center justify-center rounded-sm">
                     عدد الطلبات الإجمالي
                </div>
                <div className="bg-[#1a365d] w-[22%] py-2 flex items-center justify-center rounded-sm">
                    المجموعة
                </div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-2">
                {data.housingSummaries?.map((item, index) => (
                    <React.Fragment key={index}>
                        <div className="flex gap-2 items-stretch h-10 text-center font-bold text-black border-none">
                            {/* Percentage */}
                            <div className="w-[15%] bg-[#06b6d4] flex items-center justify-center underline decoration-black">
                                {item.percentageOfTotalOrders}%
                            </div>
                            {/* Active Riders */}
                            <div className="w-[15%] bg-[#fbbf24] flex items-center justify-center underline decoration-black">
                                {item.activeRiders}
                            </div>
                            {/* Avg Orders */}
                            <div className="w-[25%] bg-[#a3e635] flex items-center justify-center underline decoration-black">
                                {item.averageOrdersPerRider}
                            </div>
                            {/* Total Orders */}
                            <div className="w-[23%] bg-[#0000cc] text-white flex items-center justify-center underline decoration-white">
                                {item.totalOrders}
                            </div>
                            {/* Housing Name */}
                            <div className="w-[22%] bg-[#b91c1c] text-white flex items-center justify-center rounded-sm">
                                {item.housingName}
                            </div>
                        </div>
                        {/* Dashed Separator */}
                        <div className="w-full border-b-4 border-dashed border-[#4c1d95] my-1"></div>
                    </React.Fragment>
                ))}
            </div>

            {/* Footer Totals */}
            <div className="mt-8 flex flex-col items-center gap-4">

                {/* Total Orders */}
                <div className="flex w-full max-w-2xl justify-between items-center">
                    <div className="font-bold text-2xl text-[#1e3a8a]">إجمالي عدد الطلبات الكلي</div>
                    <div className="flex items-center w-1/4">
                        <div className="bg-[#000080] text-white text-xl font-bold py-2 text-center flex-grow">
                            {data.totalOrders}
                        </div>
                        <div className="font-bold text-xl text-[#1e3a8a] px-4">
                            طلب
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-3xl h-1 bg-black"></div>

                {/* Total Riders */}
                <div className="flex w-full max-w-2xl justify-between items-center">
                    <div className="font-bold text-2xl text-[#1e3a8a]">إجمالي عدد السائقين النشطين خلال هذه الفترة</div>
                    <div className="flex items-center w-1/4">
                        <div className="bg-[#000080] text-white text-xl font-bold py-2 text-center flex-grow">
                            {data.totalRiders}
                        </div>
                        <div className="font-bold text-xl text-[#1e3a8a] px-4">
                            سائق
                        </div>
                    </div>
                </div>

            </div>


            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #housing-report-print, #housing-report-print * {
            visibility: visible;
          }
          #housing-report-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            z-index: 9999;
            direction: rtl !important;
          }
          /* Ensure strict color printing */
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

export default HousingReportTemplate;
