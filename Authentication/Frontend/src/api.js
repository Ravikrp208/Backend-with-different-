import axios from 'axios';

// Base API setup pointing to Express Backend
const API_BASE_URL = 'http://localhost:3000/api/auth';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies across requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach stored bearer token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API Methods
export const authService = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // Ignore network error on logout
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  checkServerHealth: async () => {
    try {
      const res = await axios.get('http://localhost:3000/', { timeout: 3000 });
      return res.status === 200;
    } catch (err) {
      return false;
    }
  }
};
