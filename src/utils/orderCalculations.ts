import { useSettingsStore } from '@/store/settings-store';

export interface OrderCalculationResult {
  subtotal: number;
  gstAmount: number;
  deliveryCharges: number;
  serviceCharges: number;
  total: number;
  breakdown: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    charges: {
      delivery: number;
      service: number;
    };
    tax: {
      gstRate: number;
      gstAmount: number;
    };
  };
}

export const calculateOrderTotal = (
  items: Array<{ name: string; quantity: number; price: number }>,
  orderType: 'pickup' | 'delivery',
  customDeliveryCharges?: number,
  customServiceCharges?: number
): OrderCalculationResult => {
  const { calculateOrderTotal: calculateTotal } = useSettingsStore.getState();
  
  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  
  // Get delivery charges based on order type
  const deliveryCharges = orderType === 'delivery' ? (customDeliveryCharges ?? 0) : 0;
  const serviceCharges = customServiceCharges ?? 0;
  
  // Calculate total with GST
  const calculation = calculateTotal(subtotal, deliveryCharges, serviceCharges);
  
  return {
    subtotal: calculation.subtotal,
    gstAmount: calculation.gstAmount,
    deliveryCharges: calculation.deliveryCharges,
    serviceCharges: calculation.serviceCharges,
    total: calculation.total,
    breakdown: {
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.quantity * item.price,
      })),
      charges: {
        delivery: calculation.deliveryCharges,
        service: calculation.serviceCharges,
      },
      tax: {
        gstRate: useSettingsStore.getState().settings.gstRate,
        gstAmount: calculation.gstAmount,
      },
    },
  };
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const getGSTBreakdown = (amount: number) => {
  const { calculateGST } = useSettingsStore.getState();
  return calculateGST(amount);
};

