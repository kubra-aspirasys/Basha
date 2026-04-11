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
      const response = await api.get('/cms/site-settings');
      if (response.data.success) {
        const dbSettings = response.data.data;
        const mappedSettings: Partial<BusinessSettings> = {};
        
        dbSettings.forEach((s: any) => {
          if (s.key === 'gst_rate') mappedSettings.gstRate = parseFloat(s.value);
          if (s.key === 'business_name') mappedSettings.businessName = s.value;
          if (s.key === 'business_address') mappedSettings.businessAddress = s.value;
          if (s.key === 'gst_number') mappedSettings.gstNumber = s.value;
          if (s.key === 'delivery_charges') mappedSettings.deliveryCharges = parseFloat(s.value);
          if (s.key === 'service_charges') mappedSettings.serviceCharges = parseFloat(s.value);
        });

        set({ settings: { ...get().settings, ...mappedSettings }, loading: false });
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      set({ loading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
      loading: true
    }));
    
    try {
      // Fetch all site settings first to find the IDs
      const response = await api.get('/cms/site-settings');
      if (response.data.success) {
        const dbSettings = response.data.data;
        
        // Map of store keys to DB keys
        const keyMap: Record<string, string> = {
          gstRate: 'gst_rate',
          businessName: 'business_name',
          businessAddress: 'business_address',
          gstNumber: 'gst_number',
          deliveryCharges: 'delivery_charges',
          serviceCharges: 'service_charges'
        };

        // Update each modified setting in the backend
        for (const [storeKey, newValue] of Object.entries(newSettings)) {
          const dbKey = keyMap[storeKey as keyof typeof keyMap];
          if (dbKey) {
            const dbSetting = dbSettings.find((s: any) => s.key === dbKey);
            if (dbSetting) {
              await api.put(`/cms/site-settings/${dbSetting.id}`, { value: newValue.toString() });
            }
          }
        }
      }
    } catch (error) {
      console.error('Update settings error:', error);
    } finally {
      set({ loading: false });
    }
  },

  calculateGST: (amount) => {
    const { gstRate } = get().settings;
    const gstAmount = (amount * gstRate) / 100;
    return {
      gstAmount,
      totalWithGST: amount + gstAmount,
    };
  },

  calculateOrderTotal: (subtotal, deliveryCharges, serviceCharges) => {
    const { gstRate, deliveryCharges: defaultDelivery, serviceCharges: defaultService } = get().settings;

    const finalDeliveryCharges = deliveryCharges !== undefined ? deliveryCharges : defaultDelivery;
    const finalServiceCharges = serviceCharges !== undefined ? serviceCharges : defaultService;

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
