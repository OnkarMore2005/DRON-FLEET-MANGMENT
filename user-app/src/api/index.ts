import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
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
  register: (data: any) =>
    api.post('/auth/register-user', data),
};

export const services = {
  getAll: (category?: string) =>
    api.get('/services', { params: { category } }),
  getById: (id: number) =>
    api.get(`/services/${id}`),
};

export const providers = {
  search: (lat?: number, lng?: number, radius?: number) =>
    api.get('/providers', { params: { lat, lng, radius } }),
  getById: (id: number) =>
    api.get(`/providers/${id}`),
};

export const bookings = {
  create: (data: any) =>
    api.post('/bookings', data),
  getMine: () =>
    api.get('/bookings/mine'),
};

export const payments = {
  createOrder: (booking_id: number, amount: number) =>
    api.post('/payments/create-order', { booking_id, amount }),
  verify: (order_id: string, booking_id: number) =>
    api.post('/payments/verify', { order_id, booking_id }),
  getByBooking: (booking_id: number) =>
    api.get(`/payments/${booking_id}`),
};

export default api;
