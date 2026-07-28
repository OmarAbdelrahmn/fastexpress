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
export const displayStatus = (value) => {
  const normalized = String(value ?? '').toLowerCase();
  const labels = {
    pendingoperation: 'بانتظار مراجعة العمليات', pendingaccountant: 'بانتظار مراجعة المحاسب', pendingadministration: 'بانتظار مراجعة الإدارة',
    approved: 'معتمد', active: 'إجازة نشطة', completed: 'مكتمل', rejected: 'مرفوض', cancelled: 'ملغي', expired: 'منتهي الصلاحية',
    1: 'بانتظار مراجعة العمليات', 2: 'بانتظار مراجعة المحاسب', 3: 'بانتظار مراجعة الإدارة',
    4: 'معتمد', 5: 'إجازة نشطة', 6: 'مكتمل', 7: 'مرفوض', 8: 'ملغي', 9: 'منتهي الصلاحية',
  };
  return labels[normalized] || value || '—';
};

export const displayStage = (value) => {
  const normalized = String(value ?? '').toLowerCase();
  const labels = {
    operation: 'مراجعة العمليات', accountant: 'مراجعة المحاسب', administration: 'مراجعة الإدارة', completed: 'مكتمل',
    1: 'مراجعة العمليات', 2: 'مراجعة المحاسب', 3: 'مراجعة الإدارة',
  };
  return labels[normalized] || value || '—';
};

export const displayAmendmentStatus = (value) => {
  const normalized = String(value ?? '').toLowerCase();
  const labels = {
    pending: 'قيد المراجعة', approved: 'معتمد', rejected: 'مرفوض', superseded: 'تم استبداله',
    1: 'قيد المراجعة', 2: 'معتمد', 3: 'مرفوض', 4: 'تم استبداله',
  };
  return labels[normalized] || value || '—';
};

export const displayHrStatus = (value) => {
  const labels = {
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

export const documentTypeLabel = (value) => Number(value) === 1 ? 'تذكرة السفر' : Number(value) === 2 ? 'تأشيرة خروج وعودة' : 'مستند';
