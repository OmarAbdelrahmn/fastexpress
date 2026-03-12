import * as XLSX from 'xlsx';

/**
 * Exports housing performance data to an Excel file.
 *
 * @param {Array} reportData - The array of housing report data.
 * @param {string} startDate - The start date string (e.g., YYYY-MM-DD).
 * @param {string} endDate - The end date string (e.g., YYYY-MM-DD).
 * @param {string} selectedCompany - The company identifier ('keta' or 'hunger').
 */
export const exportHousingPerformanceToExcel = (reportData, startDate, endDate, selectedCompany) => {
    if (!reportData || reportData.length === 0) return;

    const excelData = [];

    reportData.forEach(housing => {
        if (housing.summaryReport?.riderSummaries) {
            housing.summaryReport.riderSummaries.forEach(rider => {
                const hoursDiff = rider.hoursDifference;

                // Recalculate target orders and difference based on company
                const dailyOrderTarget = selectedCompany === 'keta' ? 12 : 14;
                const recalculatedTargetOrders = (housing.summaryReport?.totalExpectedDays || 0) * dailyOrderTarget;
                const recalculatedOrdersDiff = rider.totalOrders - recalculatedTargetOrders;

                excelData.push({
                    ['اسم السكن']: housing.housingName,
                    ['المعرف']: rider.workingId,
                    ['رقم الاقامة']: rider.iqamaNo || '',
                    ['اسم المندوب (AR)']: rider.riderNameAR,
                    ['اسم المندوب (EN)']: rider.riderNameEN,
                    ['ايام العمل']: rider.actualWorkingDays,
                    ['ايام الغياب']: Math.abs(rider.missingDays || 0),
                    ['ساعات العمل']: rider.totalWorkingHours ? Number(rider.totalWorkingHours).toFixed(2) : "0.00",
                    ['ساعات العمل المستهدفة']: rider.targetWorkingHours,
                    ['فرق الساعات']: hoursDiff ? Number(hoursDiff).toFixed(2) : "0.00",
                    ['اجمالي الطلبات']: rider.totalOrders,
                    ['الطلبات المستهدفة']: recalculatedTargetOrders,
                    ['فرق الطلبات']: recalculatedOrdersDiff
                });
            });
        }
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance Report");
    XLSX.writeFile(wb, `housing_performance_report_${startDate}_${endDate}.xlsx`);
};
