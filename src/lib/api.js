import axios from 'axios';

/**
 * Aarohan Agri — Frontend API Service Layer
 * Connects to the Express backend at /api/*
 * 
 * Implements a Centralized Axios instance with:
 * - Authorization: Bearer <token> interceptor
 * - Auto-refresh token on 401
 * - Request/response logging in development
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/* ─── Token helpers ─── */
export const getToken = () => localStorage.getItem('aarohan-token');
export const setTokens = (access, refresh) => {
  if (access)  localStorage.setItem('aarohan-token', access);
  if (refresh) localStorage.setItem('aarohan-refresh', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('aarohan-token');
  localStorage.removeItem('aarohan-refresh');
};

/* ─── Axios Instance ─── */
const apiConfig = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/* ─── Interceptors ─── */
apiConfig.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiConfig.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Token expired — auto-refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('aarohan-refresh');
      
      if (refresh) {
        try {
          // Send manual fetch/axios to avoid circular interceptor lock
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
          if (res.data.success || res.status === 200) {
            setTokens(res.data.accessToken, null);
            originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
            return apiConfig(originalRequest);
          }
        } catch (refreshError) {
          console.error('[API Refresh Failed]', refreshError.message);
        }
      }
      
      // If refresh failed or no refresh token
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

/* ─── Core wrappers ─── */
const get   = (path, params) => apiConfig.get(path, { params });
const post  = (path, body)   => apiConfig.post(path, body);
const put   = (path, body)   => apiConfig.put(path, body);
const patch = (path, body)   => apiConfig.patch(path, body);
const del   = (path)         => apiConfig.delete(path);

/* ═══════════════════════════════════════════════
   AUTH API
═══════════════════════════════════════════════ */
export const authAPI = {
  sendOtp:    (mobile, purpose = 'login') => post('/auth/send-otp', { mobile, purpose }),
  verifyOtp:  (mobile, otp, role) => post('/auth/verify-otp', { mobile, otp, role }),
  loginEmail: (email, password, role) => post('/auth/login', { email, password, role }),
  register:   (data) => post('/auth/register', data),
  refresh:    (refreshToken) => post('/auth/refresh', { refreshToken }),
  logout:     (refreshToken) => post('/auth/logout', { refreshToken }),
  getMe:      () => get('/auth/me'),
};

/* ═══════════════════════════════════════════════
   MANDI / PRICES API
═══════════════════════════════════════════════ */
export const mandiAPI = {
  getPrices:       (params) => get('/mandi/prices', params),
  getPriceHistory: (crop, params) => get(`/mandi/price-history/${crop}`, params),
  getForecast:     (crop, days = 30) => get(`/mandi/forecast/${crop}`, { days }),
  getMandis:       () => get('/mandi/mandis'),
  getBestCrops:    () => get('/mandi/best-crops'),
  getMarketSummary:() => get('/insights/market-summary'),
};

/* ═══════════════════════════════════════════════
   MARKETPLACE API
═══════════════════════════════════════════════ */
export const marketplaceAPI = {
  getListings:    (params) => get('/marketplace/listings', params),
  getListing:     (id) => get(`/marketplace/listings/${id}`),
  createListing:  (data) => post('/marketplace/listings', data),
  placeoffer:     (listingId, data) => post(`/marketplace/listings/${listingId}/offer`, data),
  getOffers:      (listingId) => get(`/marketplace/listings/${listingId}/offers`),
  getBuyerOffers: () => get('/marketplace/buyer-offers'),
  myListings:     () => get('/marketplace/my-listings'),
  updateStatus:   (id, status) => put(`/marketplace/listings/${id}/status`, { status }),
  updateOffer:    (offerId, status) => put(`/marketplace/offers/${offerId}/status`, { status }),
};

/* ═══════════════════════════════════════════════
   COLD STORAGE API
═══════════════════════════════════════════════ */
export const coldStorageAPI = {
  list:        (params) => get('/cold-storage', params),
  getById:     (id) => get(`/cold-storage/${id}`),
  book:        (id, data) => post(`/cold-storage/${id}/book`, data),
  myBookings:  () => get('/cold-storage/bookings/my'),
  cancel:      (bookingId) => post(`/cold-storage/${bookingId}/cancel`, {}),
};

/* ═══════════════════════════════════════════════
   TRANSPORT API
═══════════════════════════════════════════════ */
export const transportAPI = {
  calculate:   (data) => post('/transport/calculate', data),
  getProviders:() => get('/transport/providers'),
  book:        (data) => post('/transport/book', data),
  myBookings:  () => get('/transport/bookings/my'),
  track:       (id) => get(`/transport/bookings/${id}/track`),
};

/* ═══════════════════════════════════════════════
   LAB API
═══════════════════════════════════════════════ */
export const labAPI = {
  list:    (params) => get('/lab', params),
  book:    (data) => post('/lab/book', data),
  history: () => get('/lab/history'),
  uploadCertificate: (data) => post('/lab/upload-certificate', data),
};

/* ═══════════════════════════════════════════════
   AI API
═══════════════════════════════════════════════ */
export const aiAPI = {
  priceInsight:    (data) => post('/ai/price-insight', data),
  demandForecast:  (data) => post('/ai/demand-forecast', data),
  weatherAlert:    (data) => post('/ai/weather-alert', data),
  qualityGrade:    (data) => post('/ai/quality-grade', data),
  negotiate:       (data) => post('/ai/negotiate', data),
  chat:            (data) => post('/ai/chat', data),
  listProviders:   () => get('/ai/providers'),
};

/* ═══════════════════════════════════════════════
   PROFILE API
═══════════════════════════════════════════════ */
export const profileAPI = {
  get:     () => get('/profile'),
  update:  (data) => put('/profile', data),
  kyc:     (data) => post('/profile/kyc', data),
  photo:   (data) => post('/profile/photo', data),
};

/* ═══════════════════════════════════════════════
   INSIGHTS API
═══════════════════════════════════════════════ */
export const insightsAPI = {
  demand:          () => get('/insights/demand'),
  alerts:          (params) => get('/insights/alerts', params),
  seasonalHeatmap: () => get('/insights/seasonal-heatmap'),
  bestTimeToSell:  () => get('/insights/best-time-to-sell'),
  marketSummary:   () => get('/insights/market-summary'),
};

