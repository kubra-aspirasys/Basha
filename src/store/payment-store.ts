import { create } from 'zustand';
import { Payment } from '@/types';
import { mockPayments } from '@/lib/mock-data';

interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'created_at'>) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: mockPayments,
  addPayment: (payment) =>
    set((state) => {
      const newPayment: Payment = {
        ...payment,
        id: `${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      return {
        payments: [newPayment, ...state.payments],
      };
    }),
}));
