'use client';

import { ApiService } from './apiService';
import { API_ENDPOINTS } from './endpoints';

export const VacationService = {
  memberRequests: () => ApiService.get(API_ENDPOINTS.MEMBER.VACATION.REQUESTS),
  memberVacationRiders: (fromDate, toDate) => ApiService.get(API_ENDPOINTS.MEMBER.VACATION.RIDERS, { fromDate, toDate }),
  createMemberRequest: (payload) => ApiService.post(API_ENDPOINTS.MEMBER.VACATION.REQUESTS, payload),
  requestDateChange: (id, payload) => ApiService.post(API_ENDPOINTS.MEMBER.VACATION.REQUEST_DATE_CHANGE(id), payload),
  requestCancellation: (id, payload) => ApiService.post(API_ENDPOINTS.MEMBER.VACATION.REQUEST_CANCELLATION(id), payload),

  requests: (filters = {}) => ApiService.get(
    API_ENDPOINTS.VACATION.REQUESTS,
    Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined && value !== null)),
  ),
  request: (id) => ApiService.get(API_ENDPOINTS.VACATION.REQUEST(id)),
  inbox: () => ApiService.get(API_ENDPOINTS.VACATION.INBOX),
  decide: (id, payload) => ApiService.post(API_ENDPOINTS.VACATION.DECISION(id), payload),
  cancel: (id, payload) => ApiService.post(API_ENDPOINTS.VACATION.CANCEL(id), payload),
  dateChanges: () => ApiService.get(API_ENDPOINTS.VACATION.DATE_CHANGES),
  decideDateChange: (id, payload) => ApiService.post(API_ENDPOINTS.VACATION.DATE_CHANGE_DECISION(id), payload),
  cancellations: () => ApiService.get(API_ENDPOINTS.VACATION.CANCELLATIONS),
  decideCancellation: (id, payload) => ApiService.post(API_ENDPOINTS.VACATION.CANCELLATION_DECISION(id), payload),
  access: () => ApiService.get(API_ENDPOINTS.VACATION.ACCESS),
  updateAccess: (userId, roles) => ApiService.put(
    API_ENDPOINTS.VACATION.USER_ACCESS(userId),
    { roles: (Array.isArray(roles) ? roles : [roles]).filter((role) => role !== undefined && role !== null && role !== '').map(Number) },
  ),
  hrInbox: () => ApiService.get(API_ENDPOINTS.VACATION.HR.INBOX),
  uploadHrTicket: (requestId, formData) => ApiService.uploadFormData(API_ENDPOINTS.VACATION.HR.TICKET(requestId), formData),
  uploadHrVisa: (requestId, formData) => ApiService.uploadFormData(API_ENDPOINTS.VACATION.HR.EXIT_REENTRY_VISA(requestId), formData),
};

export const listFromResponse = (response) =>
  Array.isArray(response) ? response : response?.items || response?.data || response?.results || [];

export const itemId = (item) => item?.id ?? item?.requestId ?? item?.vacationRequestId;
export const displayRider = (item) => item?.riderName || item?.rider?.nameAR || item?.rider?.name || item?.riderNameAR || item?.riderId || '—';
const vacationLabels = {
  ar: {
    pendingoperation: 'بانتظار مراجعة العمليات', pendingaccountant: 'بانتظار مراجعة المحاسب', pendingadministration: 'بانتظار مراجعة الإدارة',
    approved: 'معتمد', active: 'إجازة نشطة', completed: 'مكتمل', rejected: 'مرفوض', cancelled: 'ملغي', expired: 'منتهي الصلاحية',
    1: 'بانتظار مراجعة العمليات', 2: 'بانتظار مراجعة المحاسب', 3: 'بانتظار مراجعة الإدارة', 4: 'معتمد', 5: 'إجازة نشطة', 6: 'مكتمل', 7: 'مرفوض', 8: 'ملغي', 9: 'منتهي الصلاحية',
  },
  en: {
    pendingoperation: 'Pending operations review', pendingaccountant: 'Pending accountant review', pendingadministration: 'Pending administration review',
    approved: 'Approved', active: 'Active vacation', completed: 'Completed', rejected: 'Rejected', cancelled: 'Cancelled', expired: 'Expired',
    1: 'Pending operations review', 2: 'Pending accountant review', 3: 'Pending administration review', 4: 'Approved', 5: 'Active vacation', 6: 'Completed', 7: 'Rejected', 8: 'Cancelled', 9: 'Expired',
  },
};

export const displayStatus = (value, locale = 'ar') => {
  const normalized = String(value ?? '').toLowerCase();
  return vacationLabels[locale === 'en' ? 'en' : 'ar'][normalized] || value || '—';
};

export const displayStage = (value, locale = 'ar') => {
  const normalized = String(value ?? '').toLowerCase();
  const labels = locale === 'en' ? {
    operation: 'Operations review', accountant: 'Accountant review', administration: 'Administration review', completed: 'Completed',
    1: 'Operations review', 2: 'Accountant review', 3: 'Administration review',
  } : {
    operation: 'مراجعة العمليات', accountant: 'مراجعة المحاسب', administration: 'مراجعة الإدارة', completed: 'مكتمل',
    1: 'مراجعة العمليات', 2: 'مراجعة المحاسب', 3: 'مراجعة الإدارة',
  };
  return labels[normalized] || value || '—';
};

export const displayAmendmentStatus = (value, locale = 'ar') => {
  const normalized = String(value ?? '').toLowerCase();
  const labels = locale === 'en' ? { pending: 'Under review', approved: 'Approved', rejected: 'Rejected', superseded: 'Superseded', 1: 'Under review', 2: 'Approved', 3: 'Rejected', 4: 'Superseded' } : {
    pending: 'قيد المراجعة', approved: 'معتمد', rejected: 'مرفوض', superseded: 'تم استبداله',
    1: 'قيد المراجعة', 2: 'معتمد', 3: 'مرفوض', 4: 'تم استبداله',
  };
  return labels[normalized] || value || '—';
};

export const displayHrStatus = (value, locale = 'ar') => {
  const labels = locale === 'en' ? {
    0: 'Pending approval completion', 1: 'Approved — awaiting ticket booking', 2: 'Ticket booked — awaiting exit/re-entry visa', 3: 'Ticket booked and visa issued', 4: 'Closed',
    pendingapproval: 'Pending approval completion', awaitingticket: 'Approved — awaiting ticket booking', awaitingexitreentryvisa: 'Ticket booked — awaiting exit/re-entry visa', completed: 'Ticket booked and visa issued', closed: 'Closed',
  } : {
    0: 'بانتظار اكتمال الموافقات',
    1: 'تمت الموافقة - بانتظار حجز التذكرة',
    2: 'تم حجز التذكرة - بانتظار تأشيرة خروج وعودة',
    3: 'تم حجز التذكرة وإصدار التأشيرة',
    4: 'مغلق',
    pendingapproval: 'بانتظار اكتمال الموافقات',
    awaitingticket: 'تمت الموافقة - بانتظار حجز التذكرة',
    awaitingexitreentryvisa: 'تم حجز التذكرة - بانتظار تأشيرة خروج وعودة',
    completed: 'تم حجز التذكرة وإصدار التأشيرة',
    closed: 'مغلق',
  };
  return labels[String(value ?? '').toLowerCase()] || '—';
};

export const documentTypeLabel = (value, locale = 'ar') => locale === 'en'
  ? (Number(value) === 1 ? 'Travel ticket' : Number(value) === 2 ? 'Exit/re-entry visa' : 'Document')
  : (Number(value) === 1 ? 'تذكرة السفر' : Number(value) === 2 ? 'تأشيرة خروج وعودة' : 'مستند');
