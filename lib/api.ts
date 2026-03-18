import axios from 'axios';

const DEV_API_URL = 'http://localhost:5001/api';
const PROD_API_URL = 'https://temporary-backend-vehiclean.vercel.app/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? PROD_API_URL : DEV_API_URL);

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/admin/login', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.post('/auth/change-password', data),
};

// Admin APIs
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  analytics: () => api.get('/admin/analytics'),

  // Users
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  toggleBlockUser: (id: string) => api.patch(`/admin/users/${id}/toggle-block`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Partners
  getPartners: (params?: Record<string, string>) => api.get('/admin/partners', { params }),
  getPartner: (id: string) => api.get(`/admin/partners/${id}`),
  updatePartnerStatus: (id: string, status: string) => api.patch(`/admin/partners/${id}/status`, { status }),
  updatePartnerCommission: (id: string, commission: number) => api.patch(`/admin/partners/${id}/commission`, { commission }),
  updatePartnerBookingLimits: (id: string, data: { minBookings: number; maxBookings: number }) => api.patch(`/admin/partners/${id}/booking-limits`, data),
  verifyPartnerDocument: (id: string, docType: string, data: { status: string; rejectionReason?: string }) => api.patch(`/admin/partners/${id}/documents/${docType}/verify`, data),

  // Services
  getServices: (params?: Record<string, string>) => api.get('/admin/services', { params }),
  createService: (data: any) => api.post('/admin/services', data),
  updateService: (id: string, data: any) => api.put(`/admin/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`),

  // Products
  getProducts: (params?: Record<string, string>) => api.get('/admin/products', { params }),
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  // Promos
  getPromos: (params?: Record<string, string>) => api.get('/admin/promos', { params }),
  createPromo: (data: any) => api.post('/admin/promos', data),
  updatePromo: (id: string, data: any) => api.put(`/admin/promos/${id}`, data),
  deletePromo: (id: string) => api.delete(`/admin/promos/${id}`),

  // Banners
  getBanners: (params?: Record<string, string>) => api.get('/admin/banners', { params }),
  createBanner: (data: FormData) => api.post('/admin/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateBanner: (id: string, data: any) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),

  // Bookings
  getBookings: (params?: Record<string, string>) => api.get('/admin/bookings', { params }),
  assignPartner: (id: string, partnerId: string) => api.patch(`/admin/bookings/${id}/assign`, { partnerId }),
  cancelBooking: (id: string, reason: string) => api.patch(`/admin/bookings/${id}/cancel`, { reason }),

  // Payments
  getPayments: (params?: Record<string, string>) => api.get('/admin/payments', { params }),

  // Withdrawals
  getWithdrawals: (params?: Record<string, string>) => api.get('/admin/withdrawals', { params }),
  updateWithdrawal: (id: string, data: any) => api.patch(`/admin/withdrawals/${id}`, data),

  // Notifications
  getNotifications: (params?: Record<string, string>) => api.get('/admin/notifications', { params }),
  sendNotification: (data: any) => api.post('/admin/notifications', data),

  // Reviews
  getReviews: (params?: Record<string, string>) => api.get('/admin/reviews', { params }),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),

  // Slots
  getSlots: (params?: Record<string, string>) => api.get('/admin/slots', { params }),
  updateSlot: (data: any) => api.post('/admin/slots', data),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.patch('/admin/settings', data),
};
