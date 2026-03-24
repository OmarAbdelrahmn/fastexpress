'use client';

import React, { useState } from 'react';

export default function AttendanceReportPage() {
  const initialFormState = {
    employeeName: '',
    iqamaNo: '',
    salary: '',
    companyHours: '',
    startDate: '',
    endDate: '',
    hasAttendance: true,
    excludedDays: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [reportData, setReportData] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const formatTimeAMPM = (totalMins) => {
    let h = Math.floor(totalMins / 60);
    let m = totalMins % 60;
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00 ${ampm}`;
  };

  const generateReport = (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.employeeName) {
      alert('الرجاء إدخال الاسم، وتاريخ البداية والنهاية.');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (start > end) {
      alert('تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية.');
      return;
    }

    // Parse excluded days into an array of integers (e.g. "8, 26, 28" -> [8, 26, 28])
    const excludedDaysList = formData.excludedDays
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));

    const days = [];
    let currentDate = new Date(start);
    let totalMinutesWorked = 0;

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); 
      const dayOfMonth = currentDate.getDate();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      const isExcluded = excludedDaysList.includes(dayOfMonth);

      const arDayFormat = new Intl.DateTimeFormat('ar-EG-u-nu-latn', { weekday: 'long' }).format(currentDate);
      
      // 4-digit year format
      const dateStr = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      let attendTimeStr = '';
      let leaveTimeStr = '';
      let hoursWorkedStr = '';

      const shouldHaveTime = !isWeekend && !isExcluded;

      if (shouldHaveTime) {
        if (formData.hasAttendance) {
          const attendMins = Math.floor(Math.random() * (515 - 460 + 1)) + 460;
          const diffMins = Math.floor(Math.random() * (490 - 460 + 1)) + 460;
          const leaveMins = attendMins + diffMins;
          
          totalMinutesWorked += diffMins;

          attendTimeStr = formatTimeAMPM(attendMins);
          leaveTimeStr = formatTimeAMPM(leaveMins);
          
          const workH = Math.floor(diffMins / 60);
          const workM = diffMins % 60;
          hoursWorkedStr = `${workH.toString().padStart(2, '0')}:${workM.toString().padStart(2, '0')}`;
        } else {
          attendTimeStr = 'لا يوجد';
          leaveTimeStr = 'لا يوجد';
          hoursWorkedStr = 'لا يوجد';
        }
      } else if (isExcluded) {
        attendTimeStr = 'لا يوجد';
        leaveTimeStr = 'لا يوجد';
        hoursWorkedStr = 'لا يوجد';
      }

      days.push({
        dayName: arDayFormat,
        date: dateStr,
        attend: attendTimeStr,
        leave: leaveTimeStr,
        worked: hoursWorkedStr
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalWorkH = Math.floor(totalMinutesWorked / 60);
    const totalWorkM = totalMinutesWorked % 60;
    const totalWorkedStr = `${totalWorkH.toString().padStart(2, '0')}:${totalWorkM.toString().padStart(2, '0')}`;

    setReportData({
      ...formData,
      rows: days,
      totalHours: formData.hasAttendance ? totalWorkedStr : '00:00',
      wage: '0.00'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setReportData(null);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            margin: 0 auto !important;
            padding: 20px !important;
            font-family: Arial, sans-serif !important;
          }
          .report-table th, .report-table td {
            border: none !important;
            padding: 4px 0 !important;
            font-size: 14px !important;
          }
          .report-header-text {
             font-size: 16px !important;
          }
        }
      `}} />

      {/* Form Section */}
      {!reportData && (
        <div className="max-w-4xl mx-auto py-10 px-4 no-print">
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">إنشاء كشف حضور وانصراف</h1>
            <form onSubmit={generateReport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الموظف</label>
                <input type="text" name="employeeName" value={formData.employeeName} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
                <input type="text" name="iqamaNo" value={formData.iqamaNo} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الشهري</label>
                <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد ساعات العمل للشركة</label>
                <input type="number" name="companyHours" value={formData.companyHours} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              
              <div className="md:col-span-2 pt-2 border-t border-gray-200 mt-2">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                  <input type="checkbox" name="hasAttendance" checked={formData.hasAttendance} onChange={handleInputChange} className="w-5 h-5 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm font-medium text-gray-700">توليد أوقات حضور وإنصراف عشوائية (إذا تم إزالة التحديد سيظهر "لا يوجد")</span>
                </label>
              </div>

              <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">أيام مستثناة من الشهر (مثال: 8, 26, 28)</label>
                <input type="text" name="excludedDays" value={formData.excludedDays} onChange={handleInputChange} placeholder="أدخل أرقام الأيام مفصولة بفاصلة" className="w-full border border-gray-300 rounded p-2" />
              </div>

              <div className="md:col-span-2 flex justify-center mt-4 gap-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded transition">
                  إنشاء التقرير
                </button>
                <button type="button" onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-8 rounded transition">
                  تفريغ الحقول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Section */}
      {reportData && (
        <div className="print-container max-w-[800px] mx-auto bg-white p-8 shadow-lg print:shadow-none mb-10 mt-10 print:m-0">
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
               <span className="font-bold text-md">شركة الخدمة السريعة للخدمات اللوجستية</span>
               <span className="font-bold text-lg text-center">Express Service</span>
            </div>
            {/* You can replace this src with your actual logo */}
            <img src="/2.png" alt="Company Logo" className="h-18 object-contain" onError={(e) => e.target.style.display = 'none'} />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-md font-bold inline-block border-b-2 border-black pb-1">كشف حضور و انصراف</h2>
          </div>

          <div className="border-t border-b border-black py-2 mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm font-semibold mb-2">
              <div className="col-span-1"></div>
              <div className="col-span-1 text-center">رقم الهوية</div>
              <div className="col-span-1 text-left">عدد ساعات العمل للشركة</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-2 text-gray-700">
              <div className="col-span-1">اسم الموظف : <span className="mr-2 font-bold text-black">{reportData.employeeName}</span></div>
              <div className="col-span-1 text-center">{reportData.iqamaNo || '-'}</div>
              <div className="col-span-1 text-left pr-10">{reportData.companyHours || '-'}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="col-span-1 border-t border-gray-300 pt-1 mt-1">الراتب الشهري : <span className="mr-2 font-bold text-black">{reportData.salary || '-'}</span></div>
              <div className="col-span-1 border-t border-gray-300 pt-1 mt-1"></div>
              <div className="col-span-1 border-t border-gray-300 pt-1 mt-1"></div>
            </div>
          </div>

          <table className="w-full text-center report-table mb-2 border-collapse">
            <thead>
              <tr className="border-b border-black text-sm">
                <th className="py-2 font-semibold">اليوم</th>
                <th className="py-2 font-semibold">التاريخ</th>
                <th className="py-2 font-semibold">ساعة الحضور</th>
                <th className="py-2 font-semibold">ساعة الإنصراف</th>
                <th className="py-2 font-semibold">عدد ساعات العمل</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {reportData.rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-200 print:border-none">
                  <td className="py-1">{row.dayName}</td>
                  <td className="py-1">{row.date}</td>
                  <td className="py-1">{row.attend}</td>
                  <td className="py-1">{row.leave}</td>
                  <td className="py-1">{row.worked}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-black mt-2 pt-2 text-sm text-center">
             <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="text-right font-semibold">مجموع ساعات العمل</div>
                <div className="text-left font-bold">{reportData.totalHours}</div>
             </div>
             <div className="border-t border-gray-400 pt-2 grid grid-cols-2 gap-4">
                <div className="text-right font-semibold">الأجرة حسب ساعات العمل</div>
                <div className="text-left font-bold">{reportData.wage}</div>
             </div>
          </div>

          <div className="mt-8 flex justify-center gap-4 no-print">
            <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded transition flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              طباعة كشف الحضور (PDF)
            </button>
            <button onClick={handleReset} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-8 rounded transition flex items-center gap-2">
              إنشاء تقرير جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
