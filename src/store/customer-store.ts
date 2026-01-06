import { create } from 'zustand';
import { Customer } from '@/types';
import { mockCustomers } from '@/lib/mock-data';

interface CustomerState {
  customers: Customer[];
  updateCustomerStatus: (id: string, is_blocked: boolean) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at'>) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: mockCustomers,
  updateCustomerStatus: (id, is_blocked) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id ? { ...customer, is_blocked } : customer
      ),
    })),
  addCustomer: (customerData) =>
    set((state) => {
      const newCustomer: Customer = {
        ...customerData,
        id: (state.customers.length + 1).toString(),
        created_at: new Date().toISOString(),
      };
      return {
        customers: [...state.customers, newCustomer],
      };
    }),
}));
