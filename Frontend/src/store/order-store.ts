import { create } from 'zustand';
import { Order, OrderItem } from '@/types';
import api from '@/lib/api';
// We need to access auth store state to determine which fetch endpoint to use (admin vs customer)
// But to avoid circular dependency issues during initialization, we can import the store hook 
// and access getState() inside the methods.
import { useAuthStore } from './auth-store';

export interface CreateOrderPayload {
  customer_id?: string | null;
  customer_name: string;
  delivery_address: string;
  customer_phone?: string;
  order_type: Order['order_type'];
  status?: Order['status'];
  totals: {
    subtotal: number;
    gst_amount: number;
    delivery_charges: number;
    service_charges: number;
    total_amount: number;
  };
  items: Array<{
    menu_item_id: string;
    menu_item_name: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      // Determine if we should call admin or customer endpoint
      const role = useAuthStore.getState().user?.role;
      const endpoint = role === 'admin' ? '/admin/orders' : '/customer/orders';

      const response = await api.get(endpoint);

      if (response.data.success) {
        set({ orders: response.data.data, loading: false });
      } else {
        set({ error: 'Failed to fetch orders', loading: false });
      }
    } catch (error: any) {
      console.error('Failed to load orders', error);
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  createOrder: async (payload) => {
    try {
      // Prepare payload to match backend expectation
      // Backend expects: customer_name, customer_phone, delivery_address, items: [{ menu_item_id, quantity }]
      // Backend calculates totals, so we don't strictly need to send them, BUT we can send them for validation or reference if backend supports.
      // My backend implementation calculates totals on server side.
      // So I will just send the necessary fields.

      const requestData = {
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        delivery_address: payload.delivery_address,
        order_type: payload.order_type,
        items: payload.items.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity
        }))
      };

      const response = await api.post('/customer/orders', requestData);

      if (response.data.success) {
        const newOrder = response.data.data;
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newOrder;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to create order:', error);
      set({ error: error.response?.data?.message || 'Failed to create order' });
      return null;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/admin/orders/${id}/status`, { status });

      if (response.data.success) {
        // Update local state
        const updatedOrder = response.data.data;
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? updatedOrder : order
          ),
        }));
      }
    } catch (error: any) {
      console.error('Failed to update order status', error);
      set({ error: error.response?.data?.message || 'Failed to update status' });
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/admin/orders/${id}`);

      if (response.data.success) {
        set((state) => ({ orders: state.orders.filter((order) => order.id !== id) }));
      }
    } catch (error: any) {
      console.error('Failed to delete order', error);
      set({ error: error.response?.data?.message });
    }
  },

}));
