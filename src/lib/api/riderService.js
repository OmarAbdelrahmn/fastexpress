// File: src/lib/api/riderService.js
'use client';

import { ApiService } from './apiService';
import { API_ENDPOINTS } from './endpoints';

/**
 * Normalizes raw rider data from API into a consistent shape for edit forms.
 */
export function normalizeRiderData(raw) {
  if (!raw) return null;

  const formatDate = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val.split('T')[0];
    return '';
  };

  return {
    iqamaNo: raw.iqamaNo ? String(raw.iqamaNo) : '',
    iqamaEndM: formatDate(raw.iqamaEndM),
    iqamaEndH: formatDate(raw.iqamaEndH),
    passportNo: raw.passportNo || '',
    passportEnd: formatDate(raw.passportEnd),
    sponsor: raw.sponsor || '',
    sponsorNo: raw.sponsorNo != null ? String(raw.sponsorNo) : '',
    jobTitle: raw.jobTitle || '',
    nameAR: raw.nameAR || '',
    nameEN: raw.nameEN || '',
    country: raw.country || '',
    phone: raw.phone || '',
    dateOfBirth: formatDate(raw.dateOfBirth),
    status: raw.status || 'enable',
    iban: raw.iban || '',
    inksa: Boolean(raw.inksa),
    workingId: raw.workingId != null ? String(raw.workingId) : '',
    employeeIqamaNo: raw.employeeIqamaNo != null ? String(raw.employeeIqamaNo) : '',
    tshirtSize: raw.tshirtSize || '',
    licenseNumber: raw.licenseNumber || '',
    companyName: raw.companyName || '',
    housingId: raw.housingId != null ? Number(raw.housingId) : '',
    housingAddress: raw.housingAddress || raw.housing?.name || '',
    isEmployee: Boolean(raw.isEmployee),
    isFreelancer: Boolean(raw.isFreelancer),
    riderId: raw.riderId ?? null,
  };
}

/**
 * Builds a partial update payload containing ONLY changed fields.
 * Rules enforced:
 * - Only changed fields are included.
 * - Empty strings are IGNORED instead of overwriting valid data.
 * - Booleans are guaranteed to be real boolean values.
 * - Numbers (sponsorNo, housingId, employeeIqamaNo) are strictly typed.
 * - housingId can be updated independently (or set to null if unassigned).
 */
export function buildRiderUpdatePayload(formData, originalData = {}) {
  const payload = {};
  const changedFields = [];

  const cleanString = (val) => (typeof val === 'string' ? val.trim() : '');

  // Date fields: only send if non-empty and changed
  const dateFields = ['iqamaEndM', 'iqamaEndH', 'passportEnd', 'dateOfBirth'];
  for (const key of dateFields) {
    const newVal = cleanString(formData[key]);
    const origVal = cleanString(originalData[key]);
    if (newVal && newVal !== origVal) {
      payload[key] = newVal;
      changedFields.push(key);
    }
  }

  // String fields: ignore empty strings; only send if non-empty and different
  const stringFields = [
    'passportNo',
    'sponsor',
    'jobTitle',
    'nameAR',
    'nameEN',
    'country',
    'phone',
    'status',
    'iban',
    'workingId',
    'tshirtSize',
    'licenseNumber',
    'companyName',
  ];

  for (const key of stringFields) {
    const newVal = cleanString(formData[key]);
    const origVal = cleanString(originalData[key]);
    // Ignore empty strings to avoid overwriting valid data
    if (newVal !== '' && newVal !== origVal) {
      payload[key] = newVal;
      changedFields.push(key);
    }
  }

  // Number fields
  if (formData.sponsorNo !== undefined && formData.sponsorNo !== null) {
    const rawSponsorNo = cleanString(formData.sponsorNo);
    const origSponsorNo = cleanString(originalData.sponsorNo);
    if (rawSponsorNo !== '' && rawSponsorNo !== origSponsorNo) {
      const parsed = Number(rawSponsorNo);
      if (!Number.isNaN(parsed)) {
        payload.sponsorNo = parsed;
        changedFields.push('sponsorNo');
      }
    }
  }

  if (formData.employeeIqamaNo !== undefined && formData.employeeIqamaNo !== null) {
    const rawEmpIqama = cleanString(formData.employeeIqamaNo);
    const origEmpIqama = cleanString(originalData.employeeIqamaNo);
    if (rawEmpIqama !== '' && rawEmpIqama !== origEmpIqama) {
      const parsed = Number(rawEmpIqama);
      if (!Number.isNaN(parsed)) {
        payload.employeeIqamaNo = parsed;
        changedFields.push('employeeIqamaNo');
      }
    }
  }

  // Housing ID can be updated separately
  const newHousing = formData.housingId === '' || formData.housingId == null
    ? null
    : Number(formData.housingId);
  const origHousing = originalData.housingId === '' || originalData.housingId == null
    ? null
    : Number(originalData.housingId);

  if (newHousing !== origHousing) {
    payload.housingId = newHousing;
    changedFields.push('housingId');
  }

  // Booleans: must be real boolean primitives
  if (formData.inksa !== undefined && formData.inksa !== null) {
    const newInksa = Boolean(formData.inksa);
    const origInksa = Boolean(originalData.inksa);
    if (newInksa !== origInksa) {
      payload.inksa = newInksa;
      changedFields.push('inksa');
    }
  }

  if (formData.isFreelancer !== undefined && formData.isFreelancer !== null) {
    const newFreelancer = Boolean(formData.isFreelancer);
    const origFreelancer = Boolean(originalData.isFreelancer);
    if (newFreelancer !== origFreelancer) {
      payload.isFreelancer = newFreelancer;
      changedFields.push('isFreelancer');
    }
  }

  return {
    payload,
    hasChanges: changedFields.length > 0,
    changedFields,
  };
}

export const riderService = {
  /**
   * Fetches a rider by Iqama number and returns a normalized rider object.
   */
  async getRiderByIqama(iqamaNo) {
    if (!iqamaNo) {
      throw new Error('رقم الإقامة مطلوب');
    }

    const endpoint = API_ENDPOINTS.RIDER.BY_IQAMA(iqamaNo);
    const response = await ApiService.get(endpoint);

    let rawRider = null;
    if (Array.isArray(response) && response.length > 0) {
      rawRider = response[0];
    } else if (response && typeof response === 'object') {
      if (Array.isArray(response.data) && response.data.length > 0) {
        rawRider = response.data[0];
      } else if (response.data && typeof response.data === 'object') {
        rawRider = response.data;
      } else if (response.iqamaNo) {
        rawRider = response;
      }
    }

    if (!rawRider) {
      const error = new Error('لم يتم العثور على المندوب برقم الإقامة المحدد (404)');
      error.status = 404;
      throw error;
    }

    return normalizeRiderData(rawRider);
  },

  /**
   * Updates a rider with a partial update payload.
   * Sends PUT /api/Rider/{iqamaNo} and returns the complete updated rider object.
   */
  async updateRider(iqamaNo, updatePayload) {
    if (!iqamaNo) {
      const error = new Error('رقم الإقامة مطلوب في المسار (Route parameter required)');
      error.status = 400;
      throw error;
    }

    const endpoint = API_ENDPOINTS.RIDER.UPDATE(iqamaNo);

    try {
      const response = await ApiService.put(endpoint, updatePayload);
      // The API returns the complete updated rider object
      return normalizeRiderData(response) || response;
    } catch (err) {
      // Enhance error message for clear 400 and 404 responses
      if (err.status === 404) {
        err.userMessage = 'لم يتم العثور على المندوب برقم الإقامة المحدد (404)';
      } else if (err.status === 400) {
        if (err.errorCode === 'AlreadyExists' || err.message?.includes('WorkingId')) {
          err.userMessage = 'معرف العمل (Working ID) مسجل بالفعل لمندوب آخر، يرجى اختيار معرف آخر (400)';
        } else if (err.message?.includes('Company')) {
          err.userMessage = 'الشركة المحددة غير موجودة في النظام (400)';
        } else {
          err.userMessage = err.errorDescription || err.detail || err.message || 'بيانات التحديث غير صالحة (400)';
        }
      } else {
        err.userMessage = err.errorDescription || err.detail || err.message || 'حدث خطأ أثناء تحديث بيانات المندوب';
      }
      throw err;
    }
  },
};
