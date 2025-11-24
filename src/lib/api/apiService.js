// File: src/lib/api/apiService.js
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
      if (response.status === 401) {
        TokenManager.clearToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('انتهت صلاحية الجلسة');
      }

      // Parse response
      const data = await response.json().catch(() => null);

      // Handle error responses with your format
      if (!response.ok) {
        const errorMessage = data?.title || 
                           data?.error?.code || 
                           data?.detail || 
                           `HTTP error! status: ${response.status}`;
        
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

  static get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put(endpoint, data) {
    return this.request(endpoint, {
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

  static delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}