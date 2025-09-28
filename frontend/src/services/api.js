import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://student-mess-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          setAuthToken(accessToken);

          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAuthToken(null);
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }

    // Show error toast for non-auth errors
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const hotelAPI = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
  getStudents: (id, params) => api.get(`/hotels/${id}/students`, { params }),
  approveStudent: (hotelId, studentId) => api.post(`/hotels/${hotelId}/students/${studentId}/approve`),
  rejectStudent: (hotelId, studentId, data) => api.post(`/hotels/${hotelId}/students/${studentId}/reject`, data),
  addMenuItem: (id, data) => api.post(`/hotels/${id}/menu`, data),
  updateMenuItem: (hotelId, menuItemId, data) => api.put(`/hotels/${hotelId}/menu/${menuItemId}`, data),
  deleteMenuItem: (hotelId, menuItemId) => api.delete(`/hotels/${hotelId}/menu/${menuItemId}`),
};

export const studentAPI = {
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  linkHotel: (id, hotelId) => api.post(`/students/${id}/link-hotel`, { hotelId }),
  unlinkHotel: (id) => api.post(`/students/${id}/unlink-hotel`),
  verifyFace: (id, data) => api.post(`/students/${id}/verify-face`, data),
  getWallet: (id) => api.get(`/students/${id}/wallet`),
  getOrders: (id, params) => api.get(`/students/${id}/orders`, { params }),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  getByUser: (userId, params) => api.get(`/orders/user/${userId}`, { params }),
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  topup: (data) => api.post('/transactions/topup', data),
  getSummary: (studentId, params) => api.get(`/transactions/summary/${studentId}`, { params }),
};

export const roomAPI = {
  create: (data) => api.post('/rooms', data),
  getById: (id) => api.get(`/rooms/${id}`),
  update: (id, data) => api.put(`/rooms/${id}`, data),
};

export const uploadAPI = {
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;