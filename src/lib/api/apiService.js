// File: src/lib/api/apiService.js
'use client';

import { TokenManager } from '../auth/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiService {
  static async request(endpoint, options = {}) {
    const token = TokenManager.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle 401 Unauthorized
      // if (response.status === 401) {
      //   TokenManager.clearToken();
      //   if (typeof window !== 'undefined') {
      //     window.location.href = '/login';
      //   }
      //   throw new Error('انتهت صلاحية الجلسة');
      // }

      // Parse response
      const data = await response.json().catch(() => null);

      // Handle error responses with backend format
      if (!response.ok) {
        // Backend error format: { title, status, detail, error: { code, description } }
        const errorMessage = data?.title || 
                           data?.error?.code || 
                           data?.detail || 
                           `خطأ في الطلب: ${response.status}`;
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.detail = data?.detail;
        error.errorCode = data?.error?.code;
        error.errorDescription = data?.error?.description;
        error.fullError = data;
        
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  static post(endpoint, data, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put(endpoint, data, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static delete(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'DELETE' });
  }

  static async uploadFile(endpoint, file, additionalData = {}) {
    const token = TokenManager.getToken();
    const formData = new FormData();
    formData.append('excelFile', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      // if (response.status === 401) {
      //   TokenManager.clearToken();
      //   if (typeof window !== 'undefined') {
      //     window.location.href = '/login';
      //   }
      //   throw new Error('انتهت صلاحية الجلسة');
      // }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = data?.title || 
                           data?.error?.code || 
                           data?.detail || 
                           'حدث خطأ في رفع الملف';
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.fullError = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }
}