import axios from 'axios';

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api' 
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Events
export const getEvents = (params) => API.get('/events', { params });
export const getEventById = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const getVendorEvents = () => API.get('/events/vendor');
export const holdSeats = (id, seatNumbers) => API.post(`/events/${id}/hold-seats`, { seatNumbers });

// Bookings
export const createPaymentIntent = (data) => API.post('/bookings/payment-intent', data);
export const confirmBooking = (data) => API.post('/bookings/confirm', data);
export const getUserBookings = () => API.get('/bookings/my');
export const getBookingById = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id) => API.post(`/bookings/${id}/cancel`);
export const getAllBookings = (params) => API.get('/bookings/all', { params });
export const getVendorBookings = () => API.get('/bookings/vendor');

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/toggle`);
export const updateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const getAdminEvents = (params) => API.get('/admin/events', { params });

export default API;
