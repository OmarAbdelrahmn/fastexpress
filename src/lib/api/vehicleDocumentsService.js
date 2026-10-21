// File: src/lib/api/vehicleDocumentsService.js
'use client';

import { ApiService, API_BASE_URL } from './apiService';
import { API_ENDPOINTS } from './endpoints';
import { TokenManager } from '../auth/tokenManager';

/**
 * Service for Vehicle Document Expiry and Reminders
 * Follows the API specification defined in the backend contract.
 */
export const VehicleDocumentsService = {
  /**
   * Helper to build clean query string according to backend contract.
   * - documentType: Registration, Insurance, Inspection (omitted for All, never 'All'/'null'/'')
   * - daysBeforeExpiry: 0-3650
   * - page: >= 1
   * - pageSize: 1-200
   */
  _buildQueryString({ documentType, daysBeforeExpiry, page = 1, pageSize = 50 } = {}, includeWindow = true) {
    const params = new URLSearchParams();

    if (documentType && ['Registration', 'Insurance', 'Inspection'].includes(documentType)) {
      params.append('documentType', documentType);
    }

    if (includeWindow && typeof daysBeforeExpiry === 'number' && !isNaN(daysBeforeExpiry)) {
      params.append('daysBeforeExpiry', String(Math.max(0, Math.min(3650, daysBeforeExpiry))));
    }

    params.append('page', String(Math.max(1, page)));
    params.append('pageSize', String(Math.max(1, Math.min(200, pageSize))));

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  },

  /**
   * GET /api/vehicles/documents/reminders
   * Missing, expired, due today, and upcoming documents in one live feed.
   */
  async getReminders(query = {}) {
    const qs = this._buildQueryString(query, true);
    return ApiService.get(`${API_ENDPOINTS.VEHICLES.DOCUMENTS_REMINDERS}${qs}`);
  },

  /**
   * GET /api/vehicles/documents/expiring
   * Dates from today through today + window, inclusive. Excludes expired and missing dates.
   */
  async getExpiring(query = {}) {
    const qs = this._buildQueryString(query, true);
    return ApiService.get(`${API_ENDPOINTS.VEHICLES.DOCUMENTS_EXPIRING}${qs}`);
  },

  /**
   * GET /api/vehicles/documents/missing
   * Documents with no recorded expiry date.
   */
  async getMissing(query = {}) {
    const qs = this._buildQueryString(query, false);
    return ApiService.get(`${API_ENDPOINTS.VEHICLES.DOCUMENTS_MISSING}${qs}`);
  },

  /**
   * Global dashboard badge & summary counters from an unfiltered reminders request
   * GET /api/vehicles/documents/reminders?daysBeforeExpiry=30&page=1&pageSize=1
   */
  async getGlobalCounters(daysBeforeExpiry = 30) {
    const qs = this._buildQueryString({ daysBeforeExpiry, page: 1, pageSize: 1 }, true);
    return ApiService.get(`${API_ENDPOINTS.VEHICLES.DOCUMENTS_REMINDERS}${qs}`);
  },

  /**
   * Loads full vehicle details to safely prefill all three document dates before editing.
   * Checks /api/vehicles/with-rider/{plate} then fallbacks.
   */
  async getVehicleDocumentDates(plateNumberA, vehicleNumber) {
    try {
      if (plateNumberA) {
        const vehicle = await ApiService.get(
          API_ENDPOINTS.VEHICLES.WITH_RIDER(encodeURIComponent(plateNumberA))
        );
        if (vehicle) {
          return {
            licenseExpiryDate: vehicle.licenseExpiryDate ? vehicle.licenseExpiryDate.split('T')[0] : null,
            insuranceExpiryDate: vehicle.insuranceExpiryDate ? vehicle.insuranceExpiryDate.split('T')[0] : null,
            inspectionExpiryDate: vehicle.inspectionExpiryDate ? vehicle.inspectionExpiryDate.split('T')[0] : null,
            vehicle,
          };
        }
      }
    } catch (err) {
      console.warn('Failed to load vehicle by plate for date edit, attempting fallback:', err);
    }

    try {
      if (vehicleNumber) {
        const chaseResults = await ApiService.get(
          API_ENDPOINTS.VEHICLES.BY_CHASE(encodeURIComponent(vehicleNumber))
        );
        const list = Array.isArray(chaseResults) ? chaseResults : [];
        const match = list.find((v) => v.vehicleNumber === vehicleNumber) || list[0];
        if (match) {
          return {
            licenseExpiryDate: match.licenseExpiryDate ? match.licenseExpiryDate.split('T')[0] : null,
            insuranceExpiryDate: match.insuranceExpiryDate ? match.insuranceExpiryDate.split('T')[0] : null,
            inspectionExpiryDate: match.inspectionExpiryDate ? match.inspectionExpiryDate.split('T')[0] : null,
            vehicle: match,
          };
        }
      }
    } catch (err) {
      console.warn('Failed to load vehicle by chase number fallback:', err);
    }

    return {
      licenseExpiryDate: null,
      insuranceExpiryDate: null,
      inspectionExpiryDate: null,
      vehicle: null,
    };
  },

  /**
   * PUT /api/vehicles/documents/{vehicleNumber}
   * Replaces all three expiry dates. Null clears the date; never send empty strings.
   * Explicitly sends all 3 properties.
   */
  async updateDocuments(vehicleNumber, { licenseExpiryDate, insuranceExpiryDate, inspectionExpiryDate }) {
    const payload = {
      licenseExpiryDate: licenseExpiryDate ? licenseExpiryDate.split('T')[0] : null,
      insuranceExpiryDate: insuranceExpiryDate ? insuranceExpiryDate.split('T')[0] : null,
      inspectionExpiryDate: inspectionExpiryDate ? inspectionExpiryDate.split('T')[0] : null,
    };

    return ApiService.put(
      API_ENDPOINTS.VEHICLES.UPDATE_DOCUMENTS(encodeURIComponent(vehicleNumber)),
      payload
    );
  },
  _vehiclesCache: null,
  _vehiclesCacheTime: 0,

  async getVehiclesIndex(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && this._vehiclesCache && now - this._vehiclesCacheTime < 120000) {
      return this._vehiclesCache;
    }

    try {
      const data = await ApiService.get(API_ENDPOINTS.VEHICLES.LIST);
      const list = Array.isArray(data) ? data : [];
      const serialMap = new Map();
      const vehicleMap = new Map();

      for (const v of list) {
        if (v.vehicleNumber) {
          vehicleMap.set(v.vehicleNumber, v);
          if (v.serialNumber) {
            serialMap.set(v.vehicleNumber, String(v.serialNumber));
          }
        }
        if (v.plateNumberA && v.serialNumber) {
          serialMap.set(v.plateNumberA, String(v.serialNumber));
        }
      }

      this._vehiclesCache = { list, vehicleMap, serialMap };
      this._vehiclesCacheTime = now;
      return this._vehiclesCache;
    } catch (err) {
      console.warn('Failed to load vehicles index for search:', err);
      return { list: [], vehicleMap: new Map(), serialMap: new Map() };
    }
  },

  /**
   * Fetches all document reminders across ALL pages (using pageSize=200)
   * so client can perform deep search across entire fleet regardless of page count.
   */
  async getAllDocuments({ tab = 'reminders', documentType, daysBeforeExpiry = 30 } = {}) {
    const queryBase = { documentType, daysBeforeExpiry, pageSize: 200 };

    let fetchPageMethod;
    if (tab === 'expiring') {
      fetchPageMethod = (p) => this.getExpiring({ ...queryBase, page: p });
    } else if (tab === 'missing') {
      fetchPageMethod = (p) => this.getMissing({ ...queryBase, page: p });
    } else {
      fetchPageMethod = (p) => this.getReminders({ ...queryBase, page: p });
    }

    // 1. Fetch first page (up to 200 items)
    const [firstPageRes, vehiclesIndex] = await Promise.all([
      fetchPageMethod(1),
      this.getVehiclesIndex(),
    ]);

    const total = firstPageRes?.totalDocuments ?? 0;
    const allItems = [...(firstPageRes?.items || [])];

    // 2. If more than 200 items, fetch remaining pages in parallel
    if (total > 200) {
      const totalPages = Math.ceil(total / 200);
      const remainingPromises = [];
      for (let p = 2; p <= totalPages; p++) {
        remainingPromises.push(fetchPageMethod(p));
      }
      const results = await Promise.all(remainingPromises);
      for (const res of results) {
        if (Array.isArray(res?.items)) {
          allItems.push(...res.items);
        }
      }
    }

    // 3. Attach serialNumber to each item from vehiclesIndex
    const serialMap = vehiclesIndex?.serialMap;
    for (const item of allItems) {
      if (serialMap) {
        item.serialNumber = serialMap.get(item.vehicleNumber) || serialMap.get(item.plateNumberA) || null;
      }
    }

    return {
      totalDocuments: total,
      checkDate: firstPageRes?.checkDate || '',
      items: allItems,
    };
  },

  /**
   * Clears in-memory vehicle index cache.
   */
  clearCache() {
    this._vehiclesCache = null;
    this._vehiclesCacheTime = 0;
  },

  /**
   * POST /api/vehicles/documents/import?dryRun=true|false&worksheetName=...
   * Bulk import and update registration (licenseExpiryDate) and inspection (inspectionExpiryDate)
   *
   * @param {Object} options
   * @param {File} options.file - The .xlsx file
   * @param {boolean} [options.dryRun=true] - Preview (true) or Apply (false)
   * @param {string} [options.worksheetName] - Optional worksheet name
   * @param {AbortSignal} [options.signal] - Optional abort signal
   * @returns {Promise<Object>} Import report
   */
  async importDocuments({ file, dryRun = true, worksheetName, signal } = {}) {
    if (!file) {
      throw new Error('يرجى تحديد ملف Excel بصيغة .xlsx للمتابعة');
    }

    const token = TokenManager.getToken();
    if (!token) {
      throw new Error('لا يوجد رمز مصادقة صالح. يرجى تسجيل الدخول مجددًا.');
    }

    const endpoint = API_ENDPOINTS.VEHICLES.DOCUMENTS_IMPORT({
      dryRun: Boolean(dryRun),
      worksheetName: worksheetName && worksheetName.trim() ? worksheetName.trim() : undefined,
    });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal,
    });

    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      TokenManager.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
      throw new Error('انتهت صلاحية الجلسة. يرجى إعادة تسجيل الدخول.');
    }

    if (!response.ok) {
      const errorMsg =
        data?.detail ||
        data?.title ||
        (data?.errors && typeof data.errors === 'object'
          ? Object.values(data.errors).flat().join(', ')
          : null) ||
        data?.error?.description ||
        data?.error?.code ||
        `فشل استيراد الوثائق (${response.status})`;

      const err = new Error(errorMsg);
      err.status = response.status;
      err.fullError = data;
      throw err;
    }

    return data;
  },
};

