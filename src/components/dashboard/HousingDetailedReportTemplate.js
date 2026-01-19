import React from 'react';

const HousingDetailedReportTemplate = ({ data }) => {
    if (!data) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return dateString;
        } catch (e) {
            return dateString;
        }
    };

    const calculateHousingStats = (riders) => {
        const totalRiders = riders?.length || 0;
        const totalOrders = riders?.reduce((sum, rider) => sum + (Number(rider.acceptedOrders) || 0), 0) || 0;
        const averageOrders = totalRiders > 0 ? (totalOrders / totalRiders).toFixed(1) : "0";
        return { totalRiders, totalOrders, averageOrders };
    };

    return (
        <div id="housing-detailed-report-print" className="hidden print:block bg-white w-full h-full p-4 font-sans" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 border-b-2 border-dashed border-gray-400 pb-4">

                {/* Title Section */}
                <div className="flex flex-col items-start gap-4">
                    <div className="p-2 bg-white">
                        <h1 className="text-xl font-bold text-[#1e3a8a]">تقرير تفصيلي لعدد الطلبات لجميع السائقين</h1>
                    </div>

                    <div className="flex flex-col gap-1 pr-2">
                        <div className="flex items-center gap-4 font-bold text-gray-700">
                            <span className="text-[#1e3a8a] text-lg">تاريخ الطلب:</span>
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
                    <div className="w-16 h-16 flex items-center justify-center text-[#1e3a8a]">
                        <img src="/2.png" className="w-full h-full" alt="logo" />
                    </div>
                </div>
            </div>

            {/* Main Content - Housing Loop */}
            <div className="flex flex-col gap-8">
                {data.housingDetails?.map((housing, hIndex) => (
                    <div key={hIndex} className={hIndex > 0 ? "break-before-page" : ""}>
                        {/* Housing Header */}
                        <div className="flex justify-start mb-2">
                            <div className="bg-[#fef08a] px-8 py-2 font-bold text-xl text-[#1e3a8a] w-fit rounded-sm shadow-sm">
                                {housing.housingName}
                            </div>
                        </div>

                        {/* Table */}
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#fde68a] text-black font-bold text-center border-b-2 border-white">
                                    <th className="py-2 px-2 w-[5%]">م</th>
                                    <th className="py-2 px-4 w-[50%] text-right">اسم السائق</th>
                                    <th className="py-2 px-4 w-[20%]">الطلبات</th>
                                    <th className="py-2 px-4 w-[25%]">المعرف</th>
                                </tr>
                            </thead>
                            <tbody>
                                {housing.riders?.map((rider, rIndex) => (
                                    <tr key={rIndex} className="text-center font-bold items-center border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-1 px-2 text-gray-600">{rIndex + 1}</td>
                                        <td className="py-1 px-4 text-right text-black">{rider.riderName}</td>
                                        <td className="py-1 px-4">
                                            <div className="border border-[#1e3a8a] text-[#1e3a8a] px-2 py-0.5 inline-block min-w-[3rem]">
                                                {rider.acceptedOrders}
                                            </div>
                                        </td>
                                        <td className="py-1 px-4 text-gray-700">{rider.workingId || rider.riderId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Housing Summary Stats */}
                        <div className="flex justify-around items-center bg-gray-50 border-t-2 border-dashed border-gray-300 mt-2 p-2 rounded text-sm font-bold text-[#1e3a8a]">
                            <div className="flex items-center gap-2">
                                <span>إجمالي السائقين:</span>
                                <span className="bg-white px-3 py-0.5 rounded border border-gray-200">{calculateHousingStats(housing.riders).totalRiders}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>إجمالي الطلبات:</span>
                                <span className="bg-white px-3 py-0.5 rounded border border-gray-200">{calculateHousingStats(housing.riders).totalOrders}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>متوسط الطلبات:</span>
                                <span className="bg-white px-3 py-0.5 rounded border border-gray-200">{calculateHousingStats(housing.riders).averageOrders}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grand Totals */}
            <div className="mt-8 mb-8 break-inside-avoid border-t-4 border-black pt-4">
                <div className="flex justify-around items-center font-bold text-xl bg-gray-100 p-4 rounded">
                    <div className="flex items-center gap-4">
                        <span className="text-[#1e3a8a]">إجمالي عدد الطلبات الكلي:</span>
                        <span className="bg-[#1e3a8a] text-white px-6 py-1 rounded">{data.grandTotalOrders}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[#1e3a8a]">إجمالي عدد السائقين:</span>
                        <span className="bg-[#1e3a8a] text-white px-6 py-1 rounded">{data.grandTotalRiders}</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #housing-detailed-report-print, #housing-detailed-report-print * {
            visibility: visible;
          }
           #housing-detailed-report-print {
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
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .break-inside-avoid {
                page-break-inside: avoid;
          }
          .break-before-page {
            page-break-before: always;
          }
        }
      `}</style>
        </div>
    );
};

export default HousingDetailedReportTemplate;
