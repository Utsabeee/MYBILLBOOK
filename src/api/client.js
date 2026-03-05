/**
 * API Client Configuration
 * Handles all HTTP requests to MyBillBook Backend
 * Automatically converts snake_case API responses to camelCase
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Token refresh state management
let isRefreshing = false;
let refreshPromise = null;

/**
 * Convert snake_case to camelCase
 * Recursively handles objects and arrays
 */
const snakeToCamel = (obj) => {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj === null || typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {});
};

/**
 * Convert camelCase to snake_case
 * Recursively handles objects and arrays
 */
const camelToSnake = (obj) => {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj === null || typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {});
};

// Get tokens from localStorage
const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };
};

/**
 * Generic API request handler
 */
export const apiCall = async (method, endpoint, data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: getAuthHeaders(),
  };

  if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
    // Convert camelCase request data to snake_case for API
    options.body = JSON.stringify(camelToSnake(data));
  }

  const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    const bodyText = await response.text();

    if (!bodyText) return null;

    if (contentType.includes('application/json')) {
      try {
        return JSON.parse(bodyText);
      } catch {
        throw new Error(`Invalid JSON response: ${bodyText.slice(0, 120)}`);
      }
    }

    try {
      return JSON.parse(bodyText);
    } catch {
      return { error: bodyText };
    }
  };

  try {
    const response = await fetch(url, options);

    // Handle 401/403 - Try refreshing token
    if (response.status === 401 || response.status === 403) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // No refresh token - redirect to login
        localStorage.removeItem('accessToken');
        setTimeout(() => {
          alert('Your session has expired. Please log in again.');
          window.location.href = '/auth';
        }, 100);
        throw new Error('Session expired - redirecting to login');
      }

      // Use lock mechanism to prevent parallel refresh attempts
      if (isRefreshing) {
        // Wait for ongoing refresh to complete
        await refreshPromise;
        // Retry with the new token
        options.headers = getAuthHeaders();
        const retryResponse = await fetch(url, options);
        const retryData = await parseResponse(retryResponse);
        
        if (!retryResponse.ok) {
          if (retryResponse.status === 401 || retryResponse.status === 403) {
            throw new Error('Session expired - redirecting to login');
          }
          throw new Error(retryData?.error || `Error: ${retryResponse.status}`);
        }
        
        return snakeToCamel(retryData);
      }

      // Start refresh process
      isRefreshing = true;
      refreshPromise = (async () => {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await parseResponse(refreshResponse);
            const accessToken = refreshData?.accessToken;
            if (!accessToken) {
              throw new Error('Invalid refresh response');
            }
            localStorage.setItem('accessToken', accessToken);
            return true;
          } else {
            // Refresh failed - clear tokens and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setTimeout(() => {
              alert('Your session has expired. Please log in again.');
              window.location.href = '/auth';
            }, 100);
            throw new Error('Session expired');
          }
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      await refreshPromise;

      // Retry original request with new token
      options.headers = getAuthHeaders();
      const retryResponse = await fetch(url, options);
      const retryData = await parseResponse(retryResponse);

      if (!retryResponse.ok) {
        throw new Error(retryData?.error || `Error: ${retryResponse.status}`);
      }

      return snakeToCamel(retryData);
    }

    const responseData = await parseResponse(response);

    if (!response.ok) {
      throw new Error(responseData?.error || `Error: ${response.status}`);
    }

    // Convert snake_case response to camelCase
    return snakeToCamel(responseData);
  } catch (error) {
    // Better error messaging
    if (error instanceof TypeError) {
      const errorMsg = error.message.includes('Failed to fetch') 
        ? `Network error - Unable to connect to API (${url}). Make sure the backend server is running.`
        : error.message;
      console.error(`API Error [${method} ${endpoint}]:`, errorMsg);
      throw new Error(errorMsg);
    }
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint) => apiCall('GET', endpoint);
export const apiPost = (endpoint, data) => apiCall('POST', endpoint, data);
export const apiPut = (endpoint, data) => apiCall('PUT', endpoint, data);
export const apiDelete = (endpoint) => apiCall('DELETE', endpoint);

// Auth endpoints
export const authApi = {
  register: (data) => apiCall('POST', '/auth/register', data),
  login: (email, password) => apiCall('POST', '/auth/login', { email, password }),
  refresh: (refreshToken) => apiCall('POST', '/auth/refresh', { refreshToken }),
};

// Products endpoints
export const productsApi = {
  getAll: () => apiGet('/products'),
  getOne: (id) => apiGet(`/products/${id}`),
  create: (data) => apiPost('/products', data),
  update: (id, data) => apiPut(`/products/${id}`, data),
  delete: (id) => apiDelete(`/products/${id}`),
};

// Customers endpoints
export const customersApi = {
  getAll: () => apiGet('/customers'),
  getOne: (id) => apiGet(`/customers/${id}`),
  create: (data) => apiPost('/customers', data),
  update: (id, data) => apiPut(`/customers/${id}`, data),
  delete: (id) => apiDelete(`/customers/${id}`),
};

// Invoices endpoints
export const invoicesApi = {
  getAll: () => apiGet('/invoices'),
  getOne: (id) => apiGet(`/invoices/${id}`),
  create: (data) => apiPost('/invoices', data),
  update: (id, data) => apiPut(`/invoices/${id}`, data),
  delete: (id) => apiDelete(`/invoices/${id}`),
  generatePDF: (id) => apiGet(`/invoices/${id}/pdf`), // Coming soon
};

// Payments endpoints
export const paymentsApi = {
    getAll: () => apiGet('/payments'),
  getForInvoice: (invoiceId) => apiGet(`/payments/invoice/${invoiceId}`),
  create: (data) => apiPost('/payments', data),
  delete: (id) => apiDelete(`/payments/${id}`),
};

// Expenses endpoints
export const expensesApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`/expenses?${params.toString()}`);
  },
  create: (data) => apiPost('/expenses', data),
  update: (id, data) => apiPut(`/expenses/${id}`, data),
  delete: (id) => apiDelete(`/expenses/${id}`),
};

// Business endpoints
export const businessApi = {
  getProfile: () => apiGet('/business'),
  updateProfile: (data) => apiPut('/business', data),
  getStats: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`/business/stats/overview?${params.toString()}`);
  },
};

// Reports endpoints
export const reportsApi = {
  getSales: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`/reports/sales?${params.toString()}`);
  },
  getProfitLoss: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiGet(`/reports/profitloss?${params.toString()}`);
  },
  getInventory: () => apiGet('/reports/inventory'),
  getCustomers: () => apiGet('/reports/customers'),
};

export default apiCall;
