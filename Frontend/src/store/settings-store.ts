import { create } from 'zustand';
import api from '@/lib/api';

interface BusinessSettings {
  id?: string;
  gstRate: number;
  businessName: string;
  businessAddress: string;
  gstNumber: string;
  currency: string;
  deliveryCharges: number;
  serviceCharges: number;
}

interface SettingsState {
  settings: BusinessSettings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<void>;
  calculateGST: (amount: number) => { gstAmount: number; totalWithGST: number };
  calculateOrderTotal: (subtotal: number, deliveryCharges?: number, serviceCharges?: number) => {
    subtotal: number;
    gstAmount: number;
    deliveryCharges: number;
    serviceCharges: number;
    total: number;
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    gstRate: 18,
    businessName: 'SR FoodKraft',
    businessAddress: '123 Main Street',
    gstNumber: '29ABCDE1234F1Z5',
    currency: 'INR',
    deliveryCharges: 50,
    serviceCharges: 0,
  },
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      await api.get('/cms/site-settings?category=general');
      // Map SiteSetting model back to BusinessSettings object if needed
      // For now we assume they are fetched as specialized keys or we just use the default
      // Better to use fetchSiteSettings from CMSEnhancedStore for UI, but keeping this for compatibility
      set({ loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
    // In a real app, this would also hit the backend to update individual SiteSetting records
  },

  calculateGST: (amount) => {
    const { gstRate } = get().settings;
    const gstAmount = (amount * gstRate) / 100;
    return {
      gstAmount,
      totalWithGST: amount + gstAmount,
    };
  },

  calculateOrderTotal: (subtotal, deliveryCharges = 0, serviceCharges = 0) => {
    const { gstRate, deliveryCharges: defaultDelivery, serviceCharges: defaultService } = get().settings;
    const finalDeliveryCharges = deliveryCharges || defaultDelivery;
    const finalServiceCharges = serviceCharges || defaultService;

    const taxableAmount = subtotal + finalDeliveryCharges + finalServiceCharges;
    const gstAmount = (taxableAmount * gstRate) / 100;
    const total = taxableAmount + gstAmount;

    return {
      subtotal,
      gstAmount,
      deliveryCharges: finalDeliveryCharges,
      serviceCharges: finalServiceCharges,
      total,
    };
  },
}));
