import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin, Customer, UserRole } from '@/types';
import api, { setAuthTokenGetter } from '@/lib/api';

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
  // Multiple Addresses
  addAddress: (data: any) => Promise<boolean>;
  updateAddress: (id: string, data: any) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
  setDefaultAddress: (id: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(persist(
  (set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    login: async (email: string, password: string, role: UserRole) => {
      try {
        const response = await api.post('/auth/login', { email, password, role });
        if (response.data.success) {
          const { token, user } = response.data.data;
          const { useCartStore } = await import('./cart-store');
          // Clear any in-memory cart, then load this user's cart from the DB
          useCartStore.getState().reset();
          set({ user, token, isAuthenticated: true });
          await useCartStore.getState().fetchCart();
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
          const { useCartStore } = await import('./cart-store');
          useCartStore.getState().reset();
          set({ user, token, isAuthenticated: true });
          await useCartStore.getState().fetchCart();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Signup error:', error);
        return false;
      }
    },

    logout: () => {
      import('./cart-store').then(({ useCartStore }) => {
        // Clear in-memory cart. The DB still holds the user's items safely.
        // When they log back in, fetchCart() will restore them.
        useCartStore.getState().reset();
      });
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
          const profileData = response.data.data;
          set((state) => ({
            user: state.user ? { ...state.user, ...profileData } : null,
          }));
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
      }
    },

    addAddress: async (data: any) => {
      try {
        const response = await api.post('/addresses', data);
        if (response.data.success) {
          await get().fetchProfile();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Add address error:', error);
        return false;
      }
    },

    updateAddress: async (id: string, data: any) => {
      try {
        const response = await api.put(`/addresses/${id}`, data);
        if (response.data.success) {
          await get().fetchProfile();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Update address error:', error);
        return false;
      }
    },

    deleteAddress: async (id: string) => {
      try {
        const response = await api.delete(`/addresses/${id}`);
        if (response.data.success) {
          await get().fetchProfile();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Delete address error:', error);
        return false;
      }
    },

    setDefaultAddress: async (id: string) => {
      try {
        const response = await api.patch(`/addresses/${id}/default`);
        if (response.data.success) {
          await get().fetchProfile();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Set default address error:', error);
        return false;
      }
    }
  }),
  {
    name: 'auth-storage',
  }
));

// Register the token getter so API interceptor can read token directly from store memory
// This avoids the race condition where persist hasn't flushed to localStorage yet
setAuthTokenGetter(() => useAuthStore.getState().token);
