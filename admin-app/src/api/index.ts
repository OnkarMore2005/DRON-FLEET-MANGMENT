import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  adminLogin: (email: string, password: string) =>
    api.post('/auth/admin-login', { email, password }),
};

export const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (role?: string, search?: string) =>
    api.get('/admin/users', { params: { role, search } }),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  
  getProviders: (status?: string) =>
    api.get('/admin/providers', { params: { status } }),
  updateProviderStatus: (id: number, status: string) =>
    api.patch(`/admin/providers/${id}/status`, { status }),
  
  getBookings: (status?: string, from_date?: string, to_date?: string) =>
    api.get('/admin/bookings', { params: { status, from_date, to_date } }),
  
  getBookingAnalytics: () => api.get('/admin/analytics/bookings'),
  getServiceAnalytics: () => api.get('/admin/analytics/services'),
};

export default api;
