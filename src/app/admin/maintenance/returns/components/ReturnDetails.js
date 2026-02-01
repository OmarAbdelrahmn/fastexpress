import React from 'react';

export default function ReturnDetails({ data }) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* General Info Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">رقم المرتجع</p>
                    <p className="text-sm font-bold text-gray-900">{data.returnNumber || '---'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">المورد</p>
                    <p className="text-sm font-bold text-gray-900">{data.supplierName || '---'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">التاريخ</p>
                    <p className="text-sm font-bold text-gray-900">
                        {data.returnDate ? new Date(data.returnDate).toLocaleString('ar-SA') : '---'}
                    </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium mb-1">بواسطة</p>
                    <p className="text-sm font-bold text-gray-900">{data.processedBy || '---'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
                    <p className="text-xs text-gray-500 font-medium mb-1">سبب الإرجاع</p>
                    <p className="text-sm font-bold text-gray-900">{data.reason || '---'}</p>
                </div>
            </div>

            {/* Notes Section */}
            {data.notes && (
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                    <p className="text-xs text-blue-600 font-semibold mb-2 uppercase tracking-wider">ملاحظات إضافية</p>
                    <p className="text-sm text-gray-700 leading-relaxed italic">
                        "{data.notes}"
                    </p>
                </div>
            )}

            {/* Items Table */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-5 w-1 bg-blue-600 rounded-full"></div>
                    <h4 className="font-bold text-gray-900">الأصناف المرتجعة</h4>
                </div>
                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الصنف</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">النوع</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الكمية</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">سعر الوحدة</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data.items || []).map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.itemName}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {item.itemType === "SparePart" ? "قطع غيار" : "معدات السائقين"}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                        {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {Number(item.unitPrice).toFixed(2)} ر.س
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">
                                        {Number(item.lineTotal).toFixed(2)} ر.س
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-blue-50/30">
                            <tr>
                                <td colSpan="4" className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                                    الإجمالي الكلي
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-black text-blue-700">
                                    {Number(data.totalAmount).toFixed(2)} ر.س
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
