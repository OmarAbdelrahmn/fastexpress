"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Calendar, ArrowRight, BarChart2, AlertCircle, Activity, User } from "lucide-react";
import Link from "next/link";

export default function MemberReportsPage() {
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [monthlyParams, setMonthlyParams] = useState({
        year: currentYear,
        month: currentMonth
    });

    const [dailyDate, setDailyDate] = useState(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const offset = yesterday.getTimezoneOffset() * 60000;
        return new Date(yesterday - offset).toISOString().split('T')[0];
    });

    const handleMonthlyNavigate = () => {
        router.push(`/member/reports/monthly?year=${monthlyParams.year}&month=${monthlyParams.month}`);
    };



    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: "يناير" },
        { value: 2, label: "فبراير" },
        { value: 3, label: "مارس" },
        { value: 4, label: "أبريل" },
        { value: 5, label: "مايو" },
        { value: 6, label: "يونيو" },
        { value: 7, label: "يوليو" },
        { value: 8, label: "أغسطس" },
        { value: 9, label: "سبتمبر" },
        { value: 10, label: "أكتوبر" },
        { value: 11, label: "نوفمبر" },
        { value: 12, label: "ديسمبر" }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">التقارير</h1>
                    <p className="text-gray-500 mt-2">عرض وتحليل تقارير الأداء والسكن</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Report Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <BarChart2 className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">التقرير الشهري</h2>
                            <p className="text-sm text-gray-500">ملخص أداء المناديب والسكن شهرياً</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">السنة</label>
                                <select
                                    value={monthlyParams.year}
                                    onChange={(e) => setMonthlyParams({ ...monthlyParams, year: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الشهر</label>
                                <select
                                    value={monthlyParams.month}
                                    onChange={(e) => setMonthlyParams({ ...monthlyParams, month: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleMonthlyNavigate}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                        >
                            <span>عرض التقرير</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Daily Report Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-emerald-100 p-3 rounded-xl">
                            <FileText className="text-emerald-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">التقرير اليومي</h2>
                            <p className="text-sm text-gray-500">متابعة الأداء اليومي (ملخص / مفصل)</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                            <input
                                type="date"
                                value={dailyDate}
                                onChange={(e) => setDailyDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => router.push(`/member/reports/daily?date=${dailyDate}&view=detailed`)}
                                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-colors"
                            >
                                <span>تقرير مفصل</span>
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => router.push(`/member/reports/daily?date=${dailyDate}&view=summary`)}
                                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors"
                            >
                                <span>تقرير ملخص</span>
                                <BarChart2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>


                {/* Rejection Report Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-red-100 p-3 rounded-xl">
                            <AlertCircle className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">تقرير المرفوضات</h2>
                            <p className="text-sm text-gray-500">تحليل حالات الرفض ونسب التقييم للمناديب</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            عرض مفصل لجميع حالات الرفض والرفض الحقيقي، مع إحصائيات دقيقة ومقارنة بالمستهدف.
                        </p>

                        <button
                            onClick={() => router.push('/member/reports/rejection')}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
                        >
                            <span>عرض التقرير</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Riders Summary Report Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <Activity className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">ملخص المناديب</h2>
                            <p className="text-sm text-gray-500">تقارير شاملة عن أداء وساعات عمل المناديب</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            متابعة دقيقة لساعات العمل، أيام الغياب، والطلبات المنجزة مقارنة بالمستهدف لكل مندوب.
                        </p>

                        <button
                            onClick={() => router.push('/member/reports/riders-summary')}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                        >
                            <span>عرض التقرير</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Rider Daily Detail Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-indigo-100 p-3 rounded-xl">
                            <User className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">تفاصيل المندوب اليومية</h2>
                            <p className="text-sm text-gray-500">تحليل أداء مندوب محدد بالتفصيل</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            عرض سجل مفصل لأداء المندوب يومياً، بما في ذلك ساعات العمل، الطلبات، وحالات الرفض.
                        </p>

                        <button
                            onClick={() => router.push('/member/reports/rider-daily')}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors"
                        >
                            <span>عرض التقرير</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
