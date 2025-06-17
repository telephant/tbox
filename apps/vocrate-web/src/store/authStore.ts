import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('Auth store: Starting login request');
          const response = await authApi.login({ email, password });
          console.log('Auth store: Login response received', response);

          if (!response || !response.user || !response.token) {
            throw new Error('Invalid response from server');
          }

          const { user, token } = response;

          // Store token in cookie
          Cookies.set('auth-token', token, { expires: 7 });

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('Auth store: Login successful, state updated');
        } catch (error: any) {
          console.error('Auth store: Login failed', error);
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(data);
          const { user, token } = response;
          
          // Store token in cookie
          Cookies.set('auth-token', token, { expires: 7 });
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('auth-token');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const token = Cookies.get('auth-token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid
          Cookies.remove('auth-token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
