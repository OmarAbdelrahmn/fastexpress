// File: src/lib/api/dailyWorkService.js
'use client';

import { ApiService } from './apiService';
import { API_ENDPOINTS } from './endpoints';

export const dailyWorkService = {
  /**
   * Fetches saved daily work entries for a given date.
   * @param {string} date - Date in 'YYYY-MM-DD' format
   * @returns {Promise<{ date: string, items: Array<{ riderId: number|null, employeeIqamaNo: number, orders: number, workingHours: number }> }>}
   */
  async getByDate(date) {
    if (!date) {
      throw new Error('يرجى تحديد التاريخ');
    }

    const endpoint = API_ENDPOINTS.DAILY_WORK.GET(date);
    const response = await ApiService.get(endpoint);
    return response || { date, items: [] };
  },

  /**
   * Saves or edits daily work entries for a date.
   * @param {string} date - Date in 'YYYY-MM-DD' format
   * @param {Array<Object>} items - Array of items to save/edit
   * @returns {Promise<{ date: string, items: Array }>}
   */
  async saveEntries(date, items) {
    if (!date) {
      const error = new Error('التاريخ مطلوب');
      error.errorCode = 'DailyWork.InvalidDate';
      error.userMessage = 'يرجى تحديد التاريخ';
      throw error;
    }

    if (!Array.isArray(items) || items.length === 0) {
      const error = new Error('قائمة العناصر فارغة');
      error.errorCode = 'DailyWork.InvalidItems';
      error.userMessage = 'يجب إدخال عنصر واحد على الأقل للحفظ';
      throw error;
    }

    if (items.length > 1000) {
      const error = new Error('تجاوزت السجلات الحد الأقصى (1000 عنصر)');
      error.errorCode = 'DailyWork.InvalidItems';
      error.userMessage = 'لا يمكن إرسال أكثر من 1000 سجل في طلب واحد';
      throw error;
    }

    // Format and validate items strictly according to the Daily Work API spec:
    // Exactly one identifier per request item: riderId OR employeeIqamaNo.
    const formattedItems = items.map((item, index) => {
      if (!item) {
        throw new Error(`العنصر رقم ${index + 1} غير صالح`);
      }

      const orders = Math.max(0, parseInt(item.orders, 10) || 0);
      const rawHours = parseFloat(item.workingHours);
      if (isNaN(rawHours) || rawHours < 0 || rawHours > 24) {
        throw new Error(`ساعات العمل للعنصر ${index + 1} يجب أن تكون بين 0 و 24`);
      }
      const workingHours = Number(rawHours.toFixed(2));

      const payload = {
        orders,
        workingHours,
      };

      const hasRiderId = item.riderId !== undefined && item.riderId !== null && item.riderId !== '' && Number(item.riderId) > 0;
      const hasIqamaNo = item.employeeIqamaNo !== undefined && item.employeeIqamaNo !== null && item.employeeIqamaNo !== '' && Number(item.employeeIqamaNo) > 0;

      if (hasRiderId) {
        payload.riderId = Number(item.riderId);
      } else if (hasIqamaNo) {
        payload.employeeIqamaNo = Number(item.employeeIqamaNo);
      } else {
        throw new Error(`العنصر رقم ${index + 1} يتطلب تحديد معرّف المندوب أو رقم الإقامة`);
      }

      return payload;
    });

    try {
      const response = await ApiService.put(API_ENDPOINTS.DAILY_WORK.SAVE, {
        date,
        items: formattedItems,
      });

      return response;
    } catch (err) {
      const code = err.errorCode || err.code;
      if (code === 'DailyWork.InvalidDate') {
        err.userMessage = 'التاريخ المدخل غير صحيح.';
      } else if (code === 'DailyWork.InvalidItems') {
        err.userMessage = 'قائمة العناصر غير صالحة أو فارغة أو تتجاوز 1000 عنصر.';
      } else if (code === 'DailyWork.InvalidItem') {
        err.userMessage = 'أحد العناصر يحتوي على بيانات غير صالحة (الطلبات يجب أن تكون رقماً موجباً وساعات العمل بين 0 و 24).';
      } else if (code === 'DailyWork.DuplicateEmployee') {
        err.userMessage = 'تم تكرار نفس الموظف/المندوب أكثر من مرة في نفس الطلب.';
      } else if (code === 'DailyWork.PersonNotFound') {
        err.userMessage = 'لم يتم العثور على المندوب أو الموظف في النظام (404).';
      } else if (err.status === 403) {
        err.userMessage = 'ليس لديك صلاحية الوصول إلى هذه الخدمة (تتطلب صلاحية Master أو Admin).';
      } else {
        err.userMessage = err.errorDescription || err.detail || err.message || 'حدث خطأ أثناء حفظ سجلات العمل اليومي.';
      }

      throw err;
    }
  },
};
