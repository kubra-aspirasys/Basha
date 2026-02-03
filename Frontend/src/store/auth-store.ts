import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Admin, Customer, UserRole } from '@/types';

interface AuthState {
  user: Admin | Customer | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (data: { name: string; email: string; phone: string; password: string; address?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Admin | Customer>) => void;
}

// Mock customer database
const mockCustomers: Customer[] = [
  {
    id: 'customer-demo',
    name: 'Demo Customer',
    email: 'customer@bashabiryani.com',
    phone: '+91 9876543210',
    address: '123 Main Street, Hyderabad',
    password: 'customer123',
    is_blocked: false,
    is_active: true,
    last_activity: new Date().toISOString(),
    created_at: new Date().toISOString(),
    role: 'customer',
  }
];

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    role: null,
    isAuthenticated: false,

    login: async (email: string, password: string, role: UserRole) => {
      // Admin login
      if (role === 'admin' && email === 'admin@bashabiryani.com' && password === 'admin123') {
        const admin: Admin = {
          id: 'admin-1',
          email: 'admin@bashabiryani.com',
          name: 'Admin User',
          phone: '+91 9876543200',
          avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          role: 'admin',
        };
        set({ user: admin, role: 'admin', isAuthenticated: true });
        return true;
      }

      // Customer login
      if (role === 'customer') {
        const customer = mockCustomers.find(
          (c) => c.email === email && c.password === password && !c.is_blocked
        );
        if (customer) {
          const { password: _, ...customerWithoutPassword } = customer;
          set({ user: { ...customerWithoutPassword, role: 'customer' }, role: 'customer', isAuthenticated: true });
          return true;
        }
      }

      return false;
    },

    signup: async (data) => {
      // Check if email already exists
      const exists = mockCustomers.find((c) => c.email === data.email);
      if (exists) {
        return false;
      }

      const newCustomer: Customer = {
        id: `customer-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        password: data.password,
        is_blocked: false,
        is_active: true,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        role: 'customer',
      };

      mockCustomers.push(newCustomer);

      // Auto login after signup
      const { password: _, ...customerWithoutPassword } = newCustomer;
      set({ user: { ...customerWithoutPassword, role: 'customer' }, role: 'customer', isAuthenticated: true });
      return true;
    },

    logout: () => set({ user: null, role: null, isAuthenticated: false }),

    updateProfile: (data) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
  }),
  {
    name: 'auth-storage',
  }
));
