import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data, error.message);

    if (error.response?.status === 401) {
      // Token expired or invalid - but only redirect if we're not on login/register pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        Cookies.remove('auth-token');
        window.location.href = '/login';
      }
    }

    // Add more specific error handling
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error. Please check your connection.';
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    console.log('API: Sending login request to', `${API_BASE_URL}/auth/login`);
    try {
      const response = await api.post('/auth/login', data);
      console.log('API: Login response received', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: Login request failed', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Vocabulary API functions
export const vocabularyApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/vocabulary', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/vocabulary/${id}`);
    return response.data;
  },

  create: async (data: {
    word: string;
    definition: string;
    pronunciation?: string;
    example?: string;
    difficulty?: number;
  }) => {
    const response = await api.post('/vocabulary', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{
    word: string;
    definition: string;
    pronunciation: string;
    example: string;
    difficulty: number;
    mastery: number;
  }>) => {
    const response = await api.put(`/vocabulary/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/vocabulary/${id}`);
    return response.data;
  },
};
