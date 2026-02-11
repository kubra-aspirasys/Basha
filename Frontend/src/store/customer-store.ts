import { create } from 'zustand';
import { Customer } from '@/types';
import api from '@/lib/api';

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  totalRevenue: number;
}

interface CustomerState {
  customers: Customer[];
  stats: CustomerStats | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalCount: number;

  // Actions
  fetchCustomers: (params?: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  updateCustomerStatus: (id: string, is_blocked: boolean) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<boolean>;
  sendNotification: (data: any) => Promise<boolean>;
  exportCustomers: (filters?: any) => Promise<Blob | null>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  stats: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  totalCount: 0,

  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/customers?${query}`);
      const result = response.data.data;
      set({
        customers: result.data,
        totalPages: result.pages,
        totalCount: result.total,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch customers'
      });
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get('/customers/stats');
      if (response.data.success) {
        const statsData = response.data.data;
        const stats = {
          ...statsData,
          totalRevenue: typeof statsData.totalRevenue === 'string' ? parseFloat(statsData.totalRevenue) : statsData.totalRevenue
        };
        set({ stats });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  updateCustomerStatus: async (id, is_blocked) => {
    try {
      const response = await api.patch(`/customers/${id}/status`, { is_blocked });
      if (response.data.success) {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, is_blocked } : c
          ),
          stats: state.stats ? {
            ...state.stats,
            activeCustomers: is_blocked ? state.stats.activeCustomers - 1 : state.stats.activeCustomers + 1,
            blockedCustomers: is_blocked ? state.stats.blockedCustomers + 1 : state.stats.blockedCustomers - 1,
          } : state.stats
        }));
      }
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to update status' });
      throw error;
    }
  },

  addCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/customers', customerData);
      if (response.data.success) {
        // We generally shouldn't trigger fetch here if we want to keep current page/filters, 
        // but for simplicity let's just let the UI decide when to refetch or just return success.
        // But updating stats is good.
        get().fetchStats();
        return true;
      }
      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to create customer'
      });
      return false;
    }
  },

  sendNotification: async (data) => {
    try {
      const response = await api.post('/customers/notifications/send', data);
      return response.data.success;
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      return false;
    }
  },

  exportCustomers: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await api.get(`/customers/export?${query}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  }
}));
