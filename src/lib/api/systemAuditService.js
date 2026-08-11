'use client';

import { ApiService } from './apiService';

export const SystemAuditService = {
  list: (params) => ApiService.get('/api/system-audit', params),
  getById: (id) => ApiService.get(`/api/system-audit/${encodeURIComponent(id)}`),
};
