
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;


// =====================================================
// API INSTANCE
// =====================================================

export const api = axios.create({
  baseURL: BASE_URL,
});


// =====================================================
// AUTH INSTANCE
// Used for Login/Register/Logout/Refresh
// =====================================================

export const auth = axios.create({
  baseURL: BASE_URL,
});


// =====================================================
// REQUEST INTERCEPTOR
// Automatically attach Access Token
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// =====================================================
// RESPONSE INTERCEPTOR
// Automatically refresh expired Access Token
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      // No refresh token
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');

        window.location.href = '/login';

        return Promise.reject(error);
      }

      try {
        // Get new access token
        const response = await axios.post(
          `${BASE_URL}auth/refresh/`,
          {
            refresh: refreshToken,
          }
        );

        const newAccessToken = response.data.access;

        // Save new access token
        localStorage.setItem(
          'access_token',
          newAccessToken
        );

        // Add new token to original request
        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);

      } catch (refreshError) {

        // Refresh token is expired/invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// =====================================================
// CENTRAL API ERROR HANDLER
// =====================================================

export function getApiError(
  error,
  fallback = 'Something went wrong.'
) {

  // ---------------------------------------------------
  // Network / Backend unavailable
  // ---------------------------------------------------

  if (!error?.response) {
    return 'Unable to connect to the server. Please try again later.';
  }


  const status = error.response.status;
  const data = error.response.data;


  // ---------------------------------------------------
  // 400 - Bad Request / Validation Error
  // ---------------------------------------------------

  if (status === 400) {

    // Custom backend message
    if (
      data?.message &&
      typeof data.message === 'string'
    ) {
      return data.message;
    }

    const messages = [];

    if (data && typeof data === 'object') {
      Object.entries(data).forEach(([field, value]) => {

        if (Array.isArray(value)) {
          messages.push(
            `${field}: ${value.join(', ')}`
          );

        } else if (typeof value === 'string') {
          messages.push(
            `${field}: ${value}`
          );

        } else if (
          value &&
          typeof value === 'object'
        ) {
          messages.push(
            `${field}: ${JSON.stringify(value)}`
          );
        }

      });
    }

    if (messages.length > 0) {
      return messages.join('\n');
    }

    return 'Please check the information you entered.';
  }


  // ---------------------------------------------------
  // 401 - Unauthorized
  // ---------------------------------------------------

  if (status === 401) {
    return (
      data?.errors ||
      data?.detail ||
      data?.message ||
      'Your session has expired. Please login again.'
    );
  }


  // ---------------------------------------------------
  // 403 - Permission Denied
  // ---------------------------------------------------

  if (status === 403) {
    return (
      data?.detail ||
      data?.message ||
      "You don't have permission to perform this action."
    );
  }


  // ---------------------------------------------------
  // 404 - Not Found
  // ---------------------------------------------------

  if (status === 404) {
    return (
      data?.detail ||
      data?.message ||
      'The requested data was not found.'
    );
  }


  // ---------------------------------------------------
  // 409 - Conflict
  // ---------------------------------------------------

  if (status === 409) {
    return (
      data?.message ||
      data?.detail ||
      'This action conflicts with existing data.'
    );
  }


  // ---------------------------------------------------
  // 500+ - Server Error
  // ---------------------------------------------------

  if (status >= 500) {
    return 'Something went wrong on the server. Please try again later.';
  }


  // ---------------------------------------------------
  // Generic backend message
  // ---------------------------------------------------

  if (data && typeof data === 'object') {

    if (
      data.message &&
      typeof data.message === 'string'
    ) {
      return data.message;
    }

    if (
      data.detail &&
      typeof data.detail === 'string'
    ) {
      return data.detail;
    }

    if (
      data.error &&
      typeof data.error === 'string'
    ) {
      return data.error;
    }

    if (
      data.errors &&
      typeof data.errors === 'string'
    ) {
      return data.errors;
    }
  }


  return fallback;
}


// =====================================================
// DEFAULT EXPORT
// =====================================================

export default api;
