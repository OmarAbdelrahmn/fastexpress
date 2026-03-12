import React, { memo } from 'react';

const RidersTableDesktop = ({ riderSummaries, selectedCompany, totalExpectedDays }) => {
    return (
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">المعرف</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">اسم المندوب</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">ايام العمل</th>
                        <th className="px-4 py-3 text-start font-medium text-red-500 uppercase">ايام الغياب</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">ساعات العمل</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">ساعات العمل المستهدفة</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">فرق الساعات</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">اجمالي الطلبات</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">الطلبات المستهدفة</th>
                        <th className="px-4 py-3 text-start font-medium text-gray-500 uppercase">فرق الطلبات</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
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
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-gray-700 text-start">
                                    {rider.workingId}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                    <div>
                                        <div className="font-medium text-gray-900">{rider.riderNameAR}</div>
                                        <div className="text-xs text-gray-500">{rider.riderNameEN}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                                        {rider.actualWorkingDays}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-bold text-red-600 text-start">
                                    {missingDays > 0 ? missingDays : '-'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-700 text-start">
                                    {rider.totalWorkingHours ? Number(rider.totalWorkingHours).toFixed(2) : "0.00"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-start">
                                    {rider.targetWorkingHours}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${hoursPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {hoursPositive ? '+' : ''}{hoursDiff ? Number(hoursDiff).toFixed(2) : "0.00"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-600 text-start">
                                    {rider.totalOrders}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-start">
                                    {rider.targetOrders}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-start">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ordersPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {ordersPositive ? '+' : ''}{recalculatedOrdersDiff}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default memo(RidersTableDesktop);
