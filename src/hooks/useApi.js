// File: src/hooks/useApi.js
'use client';

import { useState, useCallback } from 'react';
import { ApiService } from '@/lib/api/apiService';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiCall();
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message || 'حدث خطأ');
      setLoading(false);
      return { data: null, error: err.message };
    }
  }, []);

  const get = useCallback((endpoint) => {
    return request(() => ApiService.get(endpoint));
  }, [request]);

  const post = useCallback((endpoint, data) => {
    return request(() => ApiService.post(endpoint, data));
  }, [request]);

  const put = useCallback((endpoint, data) => {
    return request(() => ApiService.put(endpoint, data));
  }, [request]);

  const patch = useCallback((endpoint, data) => {
    return request(() => ApiService.patch(endpoint, data));
  }, [request]);

  const del = useCallback((endpoint) => {
    return request(() => ApiService.delete(endpoint));
  }, [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}