import { create } from 'zustand';
import { Payment } from '@/types';
import api from '@/lib/api';

interface PaymentFilters {
  status?: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  payment_mode?: 'all' | 'cash' | 'upi' | 'card' | 'netbanking';
  customer_id?: string;
  order_id?: string;
  startDate?: string;
  endDate?: string;
  transaction_id?: string;
  customer_name?: string;
  page?: number;
  limit?: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  completedCount: number;
  pendingAmount: number;
  pendingCount: number;
  failedCount: number;
  paymentModeBreakdown: Array<{
    payment_mode: string;
    total: number;
    count: number;
  }>;
}

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  stats: PaymentStats | null;

  // Actions
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  fetchPaymentById: (id: string) => Promise<Payment | null>;
  fetchPaymentByTransactionId: (transactionId: string) => Promise<Payment | null>;
  fetchPaymentStats: (filters?: { startDate?: string; endDate?: string }) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => Promise<Payment | null>;
  updatePaymentStatus: (id: string, status: Payment['status']) => Promise<Payment | null>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<Payment | null>;
  deletePayment: (id: string) => Promise<boolean>;
  generateTransactionId: () => Promise<string | null>;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  loading: false,
  error: null,
  pagination: null,
  stats: null,

  fetchPayments: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();

      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.payment_mode && filters.payment_mode !== 'all') {
        params.append('payment_mode', filters.payment_mode);
      }
      if (filters.customer_id) params.append('customer_id', filters.customer_id);
      if (filters.order_id) params.append('order_id', filters.order_id);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.transaction_id) params.append('transaction_id', filters.transaction_id);
      if (filters.customer_name) params.append('customer_name', filters.customer_name);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/payments?${params.toString()}`);

      if (response.data.success) {
        set({
          payments: response.data.data,
          pagination: response.data.pagination,
          loading: false
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch payments');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch payments';
      set({ error: errorMessage, loading: false });
    }
  },

  fetchPaymentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/payments/${id}`);

      if (response.data.success) {
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch payment';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchPaymentByTransactionId: async (transactionId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/payments/transaction/${transactionId}`);

      if (response.data.success) {
        set({ loading: false });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch payment';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  fetchPaymentStats: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/payments/stats?${params.toString()}`);

      if (response.data.success) {
        set({ stats: response.data.data });
      }
    } catch (error: any) {
      console.error('Failed to fetch payment stats:', error);
    }
  },

  addPayment: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/payments', paymentData);

      if (response.data.success) {
        const newPayment = response.data.data;
        set((state) => ({
          payments: [newPayment, ...state.payments],
          loading: false
        }));
        return newPayment;
      } else {
        throw new Error(response.data.message || 'Failed to create payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updatePaymentStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/payments/${id}/status`, { status });

      if (response.data.success) {
        const updatedPayment = response.data.data;
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? updatedPayment : p
          ),
          loading: false
        }));
        return updatedPayment;
      } else {
        throw new Error(response.data.message || 'Failed to update payment status');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update payment status';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updatePayment: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/payments/${id}`, data);

      if (response.data.success) {
        const updatedPayment = response.data.data;
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === id ? updatedPayment : p
          ),
          loading: false
        }));
        return updatedPayment;
      } else {
        throw new Error(response.data.message || 'Failed to update payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update payment';
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deletePayment: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/payments/${id}`);

      if (response.data.success) {
        set((state) => ({
          payments: state.payments.filter((p) => p.id !== id),
          loading: false
        }));
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete payment');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete payment';
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  generateTransactionId: async () => {
    try {
      const response = await api.get('/payments/generate-txn-id');

      if (response.data.success) {
        return response.data.data.transaction_id;
      } else {
        throw new Error(response.data.message || 'Failed to generate transaction ID');
      }
    } catch (error: any) {
      // Fallback to local generation if API fails
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `TXN${timestamp}${random}`;
    }
  },

  clearError: () => set({ error: null })
}));
