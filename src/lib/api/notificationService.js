// File: src/lib/api/notificationService.js
'use client';

import { API_BASE_URL } from './apiService';
import { API_ENDPOINTS } from './endpoints';
import { TokenManager } from '../auth/tokenManager';

/**
 * Custom error class for notification API failures.
 * Captures HTTP status, ProblemDetails, and Retry-After header.
 */
export class NotificationApiError extends Error {
  constructor(status, problem, retryAfter = null) {
    const detail =
      problem?.detail ||
      problem?.error?.description ||
      problem?.title ||
      `Notification request failed with status ${status}`;
    super(detail);
    this.name = 'NotificationApiError';
    this.status = status;
    this.problem = problem;
    this.retryAfter = retryAfter;
  }
}

/**
 * Generates a standard RFC 4122 v4 UUID string.
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validates and normalizes notification content according to backend contract.
 * - English is required.
 * - Max lengths: Title <= 120 chars, Body <= 500 chars.
 * - Omit unused locales completely.
 * - Action types: home, profile, performance_report.
 */
export function normalizeNotificationPayload({
  content = {},
  data = { type: 'home' },
  expiresInSeconds = 86400,
}) {
  const enTitle = content.en?.title?.trim();
  const enBody = content.en?.body?.trim();

  if (!enTitle || !enBody) {
    throw new Error('English title and body are required.');
  }
  if (enTitle.length > 120) {
    throw new Error('English title must not exceed 120 characters.');
  }
  if (enBody.length > 500) {
    throw new Error('English body must not exceed 500 characters.');
  }

  const normalizedContent = {
    en: {
      title: enTitle,
      body: enBody,
    },
  };

  // Optional Arabic content
  const arTitle = content.ar?.title?.trim();
  const arBody = content.ar?.body?.trim();
  if (arTitle || arBody) {
    if (!arTitle || !arBody) {
      throw new Error('Both Arabic title and body must be provided if Arabic is enabled.');
    }
    if (arTitle.length > 120) {
      throw new Error('Arabic title must not exceed 120 characters.');
    }
    if (arBody.length > 500) {
      throw new Error('Arabic body must not exceed 500 characters.');
    }
    normalizedContent.ar = {
      title: arTitle,
      body: arBody,
    };
  }

  // Optional Bengali content
  const bnTitle = content.bn?.title?.trim();
  const bnBody = content.bn?.body?.trim();
  if (bnTitle || bnBody) {
    if (!bnTitle || !bnBody) {
      throw new Error('Both Bengali title and body must be provided if Bengali is enabled.');
    }
    if (bnTitle.length > 120) {
      throw new Error('Bengali title must not exceed 120 characters.');
    }
    if (bnBody.length > 500) {
      throw new Error('Bengali body must not exceed 500 characters.');
    }
    normalizedContent.bn = {
      title: bnTitle,
      body: bnBody,
    };
  }

  // Validate Action Data
  let normalizedData;
  if (data?.type === 'home') {
    normalizedData = { type: 'home' };
  } else if (data?.type === 'profile') {
    normalizedData = { type: 'profile' };
  } else if (data?.type === 'performance_report') {
    const yearStr = String(data.year || '').trim();
    const monthNum = parseInt(data.month, 10);

    if (!/^\d+$/.test(yearStr) || !Number.isSafeInteger(Number(yearStr)) || Number(yearStr) < 2000) {
      throw new Error('Report year must be a valid year (>= 2000).');
    }
    if (!/^\d+$/.test(String(data.month)) || monthNum < 1 || monthNum > 12) {
      throw new Error('Report month must be between 1 and 12.');
    }

    const saudiNow = new Date(Date.now() + 10800000);
    if (Number(yearStr) > saudiNow.getUTCFullYear() || (Number(yearStr) === saudiNow.getUTCFullYear() && monthNum > saudiNow.getUTCMonth() + 1)) {
      throw new Error('Report period cannot be in the future.');
    }

    normalizedData = {
      type: 'performance_report',
      year: yearStr,
      month: String(monthNum),
    };
  } else {
    throw new Error('Invalid destination action type. Must be home, profile, or performance_report.');
  }

  // Validate TTL
  const ttl = Number(expiresInSeconds);
  if (!Number.isInteger(ttl) || ttl < 60 || ttl > 604800) {
    throw new Error('Expiration must be between 60 seconds (1 minute) and 604800 seconds (7 days).');
  }

  return {
    content: normalizedContent,
    data: normalizedData,
    expiresInSeconds: ttl,
  };
}

/**
 * Notification Service
 */
export const NotificationService = {
  /**
   * Prepares an immutable PendingCommand with a unique idempotency key.
   */
  prepareCommand(riderId, rawPayload) {
    if (riderId != null && (!Number.isSafeInteger(Number(riderId)) || Number(riderId) <= 0)) {
      throw new Error('A valid rider is required.');
    }
    const normalized = normalizeNotificationPayload(rawPayload);
    return {
      key: generateUUID(),
      riderId: riderId != null ? Number(riderId) : null,
      payload: normalized,
      bodyJson: JSON.stringify(normalized),
    };
  },

  /**
   * Submits a pending command to the backend.
   * If riderId is null, it submits to the broadcast endpoint.
   * Otherwise, submits to /api/admin/riders/{riderId}/notifications.
   */
  async submitCommand(command, signal) {
    const token = TokenManager.getToken();
    if (!token) {
      throw new NotificationApiError(401, { detail: 'Staff session required.' });
    }

    const path = command.riderId == null
      ? API_ENDPOINTS.NOTIFICATIONS.BROADCAST
      : API_ENDPOINTS.NOTIFICATIONS.SEND(command.riderId);

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Idempotency-Key': command.key,
    };

    let response;
    let text;
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    if (signal?.aborted) controller.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers,
        body: command.bodyJson,
        cache: 'no-store',
        signal: controller.signal,
      });
      text = await response.text();
    } catch (err) {
      // Network timeout / connection drop
      const netError = new Error('Could not confirm whether the request was queued. Check network or retry this request.');
      netError.isNetworkError = true;
      netError.originalError = err;
      throw netError;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    }

    let body;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      body = undefined;
    }

    if (!response.ok) {
      throw new NotificationApiError(
        response.status,
        body,
        response.headers.get('Retry-After')
      );
    }

    if (![202, 200].includes(response.status) || typeof body?.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.requestId)) {
      const uncertainError = new Error('Could not confirm whether the notification was queued.');
      uncertainError.isNetworkError = true;
      throw uncertainError;
    }

    return body; // { requestId, status: 'queued' }
  },

  /**
   * Retrieves aggregate delivery status for a notification requestId.
   * GET /api/admin/notifications/{requestId}
   */
  async getStatus(requestId, signal) {
    const token = TokenManager.getToken();
    if (!token) {
      throw new NotificationApiError(401, { detail: 'Staff session required.' });
    }

    const path = API_ENDPOINTS.NOTIFICATIONS.STATUS(encodeURIComponent(requestId));
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal,
    });

    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      body = undefined;
    }

    if (!response.ok) {
      throw new NotificationApiError(
        response.status,
        body,
        response.headers.get('Retry-After')
      );
    }

    if (!body || typeof body.status !== 'string') throw new Error('Unexpected notification status response.');
    return body;
  },

  /**
   * Helper to format UTC timestamps from status responses into local formatted strings.
   */
  formatUtcTimestamp(utcString, locale = 'en') {
    if (!utcString) return '-';
    try {
      // Make sure string is treated strictly as UTC if it lacks a Z suffix
      const normalized = /(?:Z|[+-]\d{2}:\d{2})$/i.test(utcString) ? utcString : `${utcString}Z`;
      const date = new Date(normalized);
      if (isNaN(date.getTime())) return '—';
      return date.toLocaleString(locale, {
        timeZoneName: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  },
};
