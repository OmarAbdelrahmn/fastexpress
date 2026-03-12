import React, { memo } from 'react';

const RidersTableMobile = ({ riderSummaries, selectedCompany, totalExpectedDays }) => {
    return (
        <div className="md:hidden space-y-4">
            {riderSummaries.map((rider, idx) => {
                const hoursDiff = rider.hoursDifference;
                const hoursPositive = hoursDiff >= 0;

                // Recalculate target orders and difference based on company
                const dailyOrderTarget = selectedCompany === 'keta' ? 12 : 14;
                const recalculatedTargetOrders = (totalExpectedDays || 0) * dailyOrderTarget;
                const recalculatedOrdersDiff = rider.totalOrders - recalculatedTargetOrders;
                const ordersPositive = recalculatedOrdersDiff >= 0;

                const missingDays = Math.abs(rider.missingDays || 0);

                return (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-2">
                            <div>
                                <div className="font-bold text-gray-900">{rider.riderNameAR}</div>
                                <div className="text-xs text-gray-500">{rider.riderNameEN}</div>
                            </div>
                            <span className="font-mono bg-white px-2 py-1 rounded text-xs border border-gray-200 text-gray-600">
                                {rider.workingId}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs">ايام العمل</span>
                                <span className="font-medium">{rider.actualWorkingDays}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs text-red-500">ايام الغياب</span>
                                <span className="font-bold text-red-600">{missingDays > 0 ? missingDays : '-'}</span>
                            </div>

                            <div className="col-span-2 grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                <div className="text-center">
                                    <span className="text-gray-400 block text-[10px]">الساعات</span>
                                    <span className="font-bold text-gray-800 block text-xs">{rider.totalWorkingHours ? Number(rider.totalWorkingHours).toFixed(1) : "0"}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-gray-400 block text-[10px]">الهدف</span>
                                    <span className="text-gray-500 block text-xs">{rider.targetWorkingHours}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-gray-400 block text-[10px]">الفرق</span>
                                    <span className={`block text-xs font-bold ${hoursPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {hoursPositive ? '+' : ''}{hoursDiff ? Number(hoursDiff).toFixed(1) : "0"}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-2 grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                <div className="text-center">
                                    <span className="text-gray-400 block text-[10px]">الطلبات</span>
                                    <span className="font-bold text-blue-600 block text-xs">{rider.totalOrders}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-gray-400 block text-[10px]">الهدف</span>
                                    <span className="text-gray-500 block text-xs">{recalculatedTargetOrders}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-gray-400 block text-[10px]">الفرق</span>
                                    <span className={`block text-xs font-bold ${ordersPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {ordersPositive ? '+' : ''}{recalculatedOrdersDiff}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default memo(RidersTableMobile);
