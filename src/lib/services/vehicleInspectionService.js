// File: src/lib/services/vehicleInspectionService.js
'use client';

import { API_BASE_URL, ApiService } from '../api/apiService.js';
import { API_ENDPOINTS } from '../api/endpoints.js';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const INSPECTION_PHOTO_KEYS = [
  'frontImage',
  'backImage',
  'rightImage',
  'leftImage',
  'odometerImage',
];

export const INSPECTION_FIELD_MAP = {
  frontImage: 'FrontImage',
  backImage: 'BackImage',
  rightImage: 'RightImage',
  leftImage: 'LeftImage',
  odometerImage: 'OdometerImage',
  mileageKm: 'MileageKm',
};

/**
 * Validates a single inspection image file.
 * Must be <= 5MB and JPEG, PNG, or WebP.
 */
export function validateInspectionFile(file, fieldName = 'file') {
  if (!file) {
    return { valid: false, error: `${fieldName} is required.` };
  }

  // Check file size (max 5 MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  // Check file extension / MIME type
  const fileName = (file.name || '').toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
  const hasValidMime = !fileType || ALLOWED_FILE_TYPES.includes(fileType);

  if (!hasValidExt && !hasValidMime) {
    return {
      valid: false,
      error: `Invalid file format. Allowed formats: JPEG, PNG, WebP.`,
    };
  }

  return { valid: true };
}

/**
 * Validates an odometer mileage number.
 * Must be non-negative, numeric, and up to one decimal place.
 */
export function validateMileage(mileageKm) {
  if (mileageKm === undefined || mileageKm === null || String(mileageKm).trim() === '') {
    return { valid: false, error: 'Mileage reading is required.' };
  }

  const str = String(mileageKm).trim();
  // Regex: optional leading digits, at most one decimal place, non-negative
  const pattern = /^\d+(\.\d)?$/;
  if (!pattern.test(str)) {
    return {
      valid: false,
      error: 'Mileage must be a non-negative number with at most one decimal place (e.g. 1234.5).',
    };
  }

  const num = parseFloat(str);
  if (isNaN(num) || num < 0) {
    return { valid: false, error: 'Mileage must be greater than or equal to 0.' };
  }

  return { valid: true, value: num };
}

/**
 * Validates a complete inspection dataset (5 photos + mileage).
 * @param {Object} inspection
 * @param {string} prefix 'Inspection' | 'ReturnInspection'
 * @returns {{ valid: boolean, errors: Object }}
 */
export function validateInspection(inspection = {}, prefix = 'Inspection') {
  const errors = {};

  for (const photoKey of INSPECTION_PHOTO_KEYS) {
    const file = inspection[photoKey];
    const validation = validateInspectionFile(file, photoKey);
    if (!validation.valid) {
      errors[photoKey] = validation.error;
    }
  }

  const mileageValidation = validateMileage(inspection.mileageKm);
  if (!mileageValidation.valid) {
    errors.mileageKm = mileageValidation.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Appends inspection fields to an existing or new FormData object.
 * Keys will be:
 *   [Prefix].FrontImage
 *   [Prefix].BackImage
 *   [Prefix].RightImage
 *   [Prefix].LeftImage
 *   [Prefix].OdometerImage
 *   [Prefix].MileageKm
 *
 * @param {FormData} formData
 * @param {Object} inspection
 * @param {string} prefix 'Inspection' | 'ReturnInspection'
 * @returns {FormData}
 */
export function appendInspectionToFormData(formData, inspection = {}, prefix = 'Inspection') {
  const fd = formData || new FormData();

  if (inspection.frontImage) {
    fd.append(`${prefix}.FrontImage`, inspection.frontImage);
  }
  if (inspection.backImage) {
    fd.append(`${prefix}.BackImage`, inspection.backImage);
  }
  if (inspection.rightImage) {
    fd.append(`${prefix}.RightImage`, inspection.rightImage);
  }
  if (inspection.leftImage) {
    fd.append(`${prefix}.LeftImage`, inspection.leftImage);
  }
  if (inspection.odometerImage) {
    fd.append(`${prefix}.OdometerImage`, inspection.odometerImage);
  }
  if (inspection.mileageKm !== undefined && inspection.mileageKm !== null) {
    fd.append(`${prefix}.MileageKm`, String(inspection.mileageKm).trim());
  }

  return fd;
}

/**
 * Resolves an inspection image URL from the API backend.
 * Returned URLs begin with `/uploads/vehicle-inspections/`.
 * This resolves them against API_BASE_URL.
 */
export function resolveInspectionImageUrl(url) {
  if (!url) return null;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const base = (
    typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : API_BASE_URL || 'https://fastexpress.tryasp.net'
  ).replace(/\/+$/, '');

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${base}${cleanPath}`;
}

export class VehicleInspectionService {
  /**
   * POST /api/Member/vehicles/request-take
   * Form: RiderIqamaNo, VehiclePlate, optional Reason, Inspection.*
   */
  static async submitMemberRequestTake({ riderIqamaNo, vehiclePlate, reason, inspection }) {
    const inspectionCheck = validateInspection(inspection, 'Inspection');
    if (!inspectionCheck.valid) {
      const err = new Error('Inspection validation failed');
      err.validationErrors = inspectionCheck.errors;
      throw err;
    }

    const form = new FormData();
    form.append('RiderIqamaNo', String(riderIqamaNo).trim());
    form.append('VehiclePlate', String(vehiclePlate).trim());
    if (reason && reason.trim()) {
      form.append('Reason', reason.trim());
    }

    appendInspectionToFormData(form, inspection, 'Inspection');

    return ApiService.post(API_ENDPOINTS.MEMBER.VEHICLE_REQUEST_TAKE, form);
  }

  /**
   * POST /api/Member/vehicles/request-return
   * Form: RiderIqamaNo, VehiclePlate, optional Reason, Inspection.*
   */
  static async submitMemberRequestReturn({ riderIqamaNo, vehiclePlate, reason, inspection }) {
    const inspectionCheck = validateInspection(inspection, 'Inspection');
    if (!inspectionCheck.valid) {
      const err = new Error('Inspection validation failed');
      err.validationErrors = inspectionCheck.errors;
      throw err;
    }

    const form = new FormData();
    form.append('RiderIqamaNo', String(riderIqamaNo).trim());
    form.append('VehiclePlate', String(vehiclePlate).trim());
    if (reason && reason.trim()) {
      form.append('Reason', reason.trim());
    }

    appendInspectionToFormData(form, inspection, 'Inspection');

    return ApiService.post(API_ENDPOINTS.MEMBER.VEHICLE_REQUEST_RETURN, form);
  }

  /**
   * POST /api/Member/vehicles/request-switch-vehicel
   * Form: RiderIqamaNo, NewVehiclePlate, Reason
   * + Inspection.* (replacement vehicle)
   * + ReturnInspection.* (vehicle being returned)
   */
  static async submitMemberRequestSwitch({
    riderIqamaNo,
    newVehiclePlate,
    reason,
    inspection,
    returnInspection,
  }) {
    const newCheck = validateInspection(inspection, 'Inspection');
    const returnCheck = validateInspection(returnInspection, 'ReturnInspection');

    if (!newCheck.valid || !returnCheck.valid) {
      const err = new Error('Switch inspection validation failed');
      err.validationErrors = {
        inspection: newCheck.errors,
        returnInspection: returnCheck.errors,
      };
      throw err;
    }

    const form = new FormData();
    form.append('RiderIqamaNo', String(riderIqamaNo).trim());
    form.append('NewVehiclePlate', String(newVehiclePlate).trim());
    form.append('Reason', String(reason || '').trim());

    appendInspectionToFormData(form, inspection, 'Inspection');
    appendInspectionToFormData(form, returnInspection, 'ReturnInspection');

    return ApiService.post(API_ENDPOINTS.MEMBER.VEHICLE_REQUEST_SWITCH, form);
  }

  /**
   * POST /api/vehicles/take
   * Existing query: IqamaNo, vehicleNumber, reason, permission
   * Form body: Inspection.*
   */
  static async submitAdminTake({
    iqamaNo,
    vehicleNumber,
    reason,
    permission,
    permissionEndDate = '',
    inspection,
  }) {
    const inspectionCheck = validateInspection(inspection, 'Inspection');
    if (!inspectionCheck.valid) {
      const err = new Error('Inspection validation failed');
      err.validationErrors = inspectionCheck.errors;
      throw err;
    }

    const form = new FormData();
    appendInspectionToFormData(form, inspection, 'Inspection');

    const params = {
      iqamaNo: String(iqamaNo).trim(),
      vehicleNumber: String(vehicleNumber).trim(),
      reason: String(reason || '').trim(),
      permission: String(permission || '').trim(),
    };
    if (permissionEndDate) {
      params.permissionEndDate = permissionEndDate;
    }

    return ApiService.post(API_ENDPOINTS.VEHICLES.TAKE, form, params);
  }

  /**
   * POST /api/vehicles/return
   * Existing query: IqamaNo, vehicleNumber, reason
   * Form body: Inspection.*
   */
  static async submitAdminReturn({ iqamaNo, vehicleNumber, reason, inspection }) {
    const inspectionCheck = validateInspection(inspection, 'Inspection');
    if (!inspectionCheck.valid) {
      const err = new Error('Inspection validation failed');
      err.validationErrors = inspectionCheck.errors;
      throw err;
    }

    const form = new FormData();
    appendInspectionToFormData(form, inspection, 'Inspection');

    const params = {
      iqamaNo: String(iqamaNo).trim(),
      vehicleNumber: String(vehicleNumber).trim(),
      reason: String(reason || '').trim(),
    };

    return ApiService.post(API_ENDPOINTS.VEHICLES.RETURN, form, params);
  }

  /**
   * POST /api/vehicles/switch
   * Existing query: IqamaNo, newVehiclePlate, reason, permission
   * Form body: Inspection.* (replacement) + ReturnInspection.* (returned)
   */
  static async submitAdminSwitch({
    iqamaNo,
    newVehiclePlate,
    reason,
    permission,
    permissionEndDate = '',
    inspection,
    returnInspection,
  }) {
    const newCheck = validateInspection(inspection, 'Inspection');
    const returnCheck = validateInspection(returnInspection, 'ReturnInspection');

    if (!newCheck.valid || !returnCheck.valid) {
      const err = new Error('Switch inspection validation failed');
      err.validationErrors = {
        inspection: newCheck.errors,
        returnInspection: returnCheck.errors,
      };
      throw err;
    }

    const form = new FormData();
    appendInspectionToFormData(form, inspection, 'Inspection');
    appendInspectionToFormData(form, returnInspection, 'ReturnInspection');

    const params = {
      IqamaNo: String(iqamaNo).trim(),
      newVehiclePlate: String(newVehiclePlate).trim(),
      reason: String(reason || '').trim(),
      permission: String(permission || '').trim(),
    };
    if (permissionEndDate) {
      params.permissionEndDate = permissionEndDate;
    }

    const switchEndpoint = API_ENDPOINTS.VEHICLES.SWITCH || '/api/vehicles/switch';
    return ApiService.post(switchEndpoint, form, params);
  }

  /**
   * POST /api/Temp/vehicle-request-take
   * Form: RiderIqamaNo, Plate, ResolvedBy, Inspection.*
   * Query: reason
   */
  static async submitTempRequestTake({
    riderIqamaNo,
    plate,
    resolvedBy,
    reason,
    inspection,
  }) {
    const inspectionCheck = validateInspection(inspection, 'Inspection');
    if (!inspectionCheck.valid) {
      const err = new Error('Inspection validation failed');
      err.validationErrors = inspectionCheck.errors;
      throw err;
    }

    const form = new FormData();
    form.append('RiderIqamaNo', String(riderIqamaNo).trim());
    form.append('Plate', String(plate).trim());
    if (resolvedBy) {
      form.append('ResolvedBy', String(resolvedBy).trim());
    }
    appendInspectionToFormData(form, inspection, 'Inspection');

    const params = {};
    if (reason) params.reason = reason;

    return ApiService.post(API_ENDPOINTS.TEMP.VEHICLES.REQUEST_TAKE, form, params);
  }

  /**
   * POST /api/Temp/vehicle-request-return
   * Form: RiderIqamaNo, Plate, ResolvedBy, Inspection.*
   * Query: reason
   */
  static async submitTempRequestReturn({
    riderIqamaNo,
    plate,
    resolvedBy,
    reason,
    inspection,
  }) {
    const inspectionCheck = validateInspection(inspection, 'Inspection');
    if (!inspectionCheck.valid) {
      const err = new Error('Inspection validation failed');
      err.validationErrors = inspectionCheck.errors;
      throw err;
    }

    const form = new FormData();
    form.append('RiderIqamaNo', String(riderIqamaNo).trim());
    form.append('Plate', String(plate).trim());
    if (resolvedBy) {
      form.append('ResolvedBy', String(resolvedBy).trim());
    }
    appendInspectionToFormData(form, inspection, 'Inspection');

    const params = {};
    if (reason) params.reason = reason;

    return ApiService.post(API_ENDPOINTS.TEMP.VEHICLES.REQUEST_RETURN, form, params);
  }
}
