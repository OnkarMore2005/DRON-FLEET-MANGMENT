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
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  registerProvider: (data: any) =>
    api.post('/auth/register-provider', data),
};

export const drones = {
  getAll: () => api.get('/drones'),
  create: (data: any) => api.post('/drones', data),
  update: (id: number, data: any) => api.put(`/drones/${id}`, data),
  delete: (id: number) => api.delete(`/drones/${id}`),
};

export const bookings = {
  getProviderBookings: () => api.get('/bookings/provider'),
  updateStatus: (id: number, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),
};

export default api;
