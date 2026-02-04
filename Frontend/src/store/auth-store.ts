import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin, Customer, UserRole } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: ((Admin | Customer) & { role: UserRole }) | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: { name: string; email: string; phone: string; password: string; address?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Admin | Customer>) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (password: string, token: string) => Promise<boolean>;
  changePassword: (data: any) => Promise<boolean>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    login: async (email: string, password: string, role: UserRole) => {
      try {
        const response = await api.post('/auth/login', { email, password, role });
        if (response.data.success) {
          const { token, user } = response.data.data;
          set({ user, token, isAuthenticated: true });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },

    signup: async (data) => {
      try {
        const response = await api.post('/auth/register', data);
        if (response.data.success) {
          const { token, user } = response.data.data;
          set({ user, token, isAuthenticated: true });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Signup error:', error);
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('auth-storage');
      set({ user: null, token: null, isAuthenticated: false });
    },

    updateProfile: async (data) => {
      try {
        const response = await api.put('/profile', data);
        if (response.data.success) {
          const updatedUser = response.data.data;
          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Update profile error:', error);
        return false;
      }
    },

    forgotPassword: async (email) => {
      try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data.success;
      } catch (error) {
        console.error('Forgot password error:', error);
        return false;
      }
    },

    resetPassword: async (password, token) => {
      try {
        const response = await api.post('/auth/reset-password', { password, token });
        return response.data.success;
      } catch (error) {
        console.error('Reset password error:', error);
        return false;
      }
    },

    changePassword: async (data) => {
      try {
        const response = await api.post('/profile/change-password', data);
        return response.data.success;
      } catch (error) {
        console.error('Change password error:', error);
        return false;
      }
    },

    fetchProfile: async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.success) {
          set((state) => ({
            user: { ...state.user, ...response.data.data } as any,
          }));
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
      }
    }
  }),
  {
    name: 'auth-storage',
  }
));
