import React from 'react';
import { useLanguage } from '@/lib/context/LanguageContext';

const KetaDailyRiderDetailsTemplate = ({ data }) => {
    const { t, language } = useLanguage();

    if (!data) return null;

    return (
        <div id="keta-rider-details-print" className="hidden print:block bg-white w-full h-full p-4 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-dashed border-gray-400 pb-4">
                <div className="flex flex-col items-start gap-4">
                    <div className="p-2 bg-white">
                        <h1 className="text-xl font-bold text-[#1e3a8a]">{t('keta.details.title')}</h1>
                    </div>
                    <div className="flex flex-col gap-1 pr-2">
                        <div className="flex items-center gap-4 font-bold text-gray-700">
                            <span className="text-[#1e3a8a] text-lg">{t('common.date')}:</span>
                            <span className="text-xl">{data.reportDate}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-[#1e3a8a]">{t('common.companyName')}</h2>
                        <p className="text-[#f59e0b] font-bold text-lg">{t('common.logisticsServices')}</p>
                    </div>
                    <div className="w-16 h-16 rounded flex items-center justify-center text-[#1e3a8a]">
                        <img src="/2.png" className="w-full h-full" alt="logo" />
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded p-4 bg-gray-50 flex justify-between items-center">
                    <span className="font-bold text-gray-600">{t('keta.details.totalRiders')}:</span>
                    <span className="text-xl font-bold text-[#1e3a8a]">{data.filteredRiders?.length || 0}</span>
                </div>
                <div className="border border-gray-200 rounded p-4 bg-gray-50 flex justify-between items-center">
                    <span className="font-bold text-gray-600">{t('keta.details.totalOrders')}:</span>
                    <span className="text-xl font-bold text-[#1e3a8a]">
                        {data.filteredRiders?.reduce((sum, rider) => sum + (rider.orderCount || 0), 0)}
                    </span>
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-right text-sm border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-[#1a365d] text-white">
                        <th className="border border-gray-300 px-4 py-2">{t('common.rank')}</th>
                        <th className="border border-gray-300 px-4 py-2">{t('employees.rider')}</th>
                        <th className="border border-gray-300 px-4 py-2">{t('common.housingGroup')}</th>
                        <th className="border border-gray-300 px-4 py-2">{t('common.orders')}</th>
                        <th className="border border-gray-300 px-4 py-2">{t('common.workingHours')}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.filteredRiders?.map((rider, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                <div className="font-bold">{language === 'ar' ? rider.riderNameAR : rider.riderNameEN || rider.riderNameAR}</div>
                                <div className="text-xs text-gray-500">{rider.workingId} | {rider.iqamaNo}</div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{rider.housingGroup}</td>
                            <td className="border border-gray-300 px-4 py-2 font-bold">{rider.orderCount}</td>
                            <td className="border border-gray-300 px-4 py-2">{rider.workingHours ? Number(rider.workingHours).toFixed(2) : "0.00"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style jsx global>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #keta-rider-details-print, #keta-rider-details-print * {
                    visibility: visible;
                  }
                  #keta-rider-details-print {
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
                   @page {
                    margin: 10mm;
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

export default KetaDailyRiderDetailsTemplate;
