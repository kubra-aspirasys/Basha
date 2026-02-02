import { create } from 'zustand';

interface BusinessSettings {
  gstRate: number; // GST rate as percentage (e.g., 18 for 18%)
  businessName: string;
  businessAddress: string;
  gstNumber: string;
  currency: string;
  deliveryCharges: number;
  serviceCharges: number;
}

interface SettingsState {
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
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
    gstRate: 18, // 18% GST for restaurants
    businessName: 'SR FoodKraft',
    businessAddress: '123 Main Street, New Delhi',
    gstNumber: '29ABCDE1234F1Z5',
    currency: 'INR',
    deliveryCharges: 50,
    serviceCharges: 0,
  },
  
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
    
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

