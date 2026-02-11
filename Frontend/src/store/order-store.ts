import { create } from 'zustand';
import { Order } from '@/types';
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
        // Parse decimal strings to numbers
        const orders = response.data.data.map((order: any) => ({
          ...order,
          total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
          subtotal: typeof order.subtotal === 'string' ? parseFloat(order.subtotal) : order.subtotal,
          gst_amount: typeof order.gst_amount === 'string' ? parseFloat(order.gst_amount) : order.gst_amount,
          delivery_charges: typeof order.delivery_charges === 'string' ? parseFloat(order.delivery_charges) : order.delivery_charges,
          service_charges: typeof order.service_charges === 'string' ? parseFloat(order.service_charges) : order.service_charges,
          items: order.items?.map((item: any) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
          })) || []
        }));
        set({ orders, loading: false });
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
        const newOrderData = response.data.data;
        // Parse decimal strings to numbers
        const newOrder = {
          ...newOrderData,
          total_amount: typeof newOrderData.total_amount === 'string' ? parseFloat(newOrderData.total_amount) : newOrderData.total_amount,
          subtotal: typeof newOrderData.subtotal === 'string' ? parseFloat(newOrderData.subtotal) : newOrderData.subtotal,
          gst_amount: typeof newOrderData.gst_amount === 'string' ? parseFloat(newOrderData.gst_amount) : newOrderData.gst_amount,
          delivery_charges: typeof newOrderData.delivery_charges === 'string' ? parseFloat(newOrderData.delivery_charges) : newOrderData.delivery_charges,
          service_charges: typeof newOrderData.service_charges === 'string' ? parseFloat(newOrderData.service_charges) : newOrderData.service_charges,
          items: newOrderData.items?.map((item: any) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
          })) || []
        };
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
        const updatedOrderData = response.data.data;
        const updatedOrder = {
          ...updatedOrderData,
          total_amount: typeof updatedOrderData.total_amount === 'string' ? parseFloat(updatedOrderData.total_amount) : updatedOrderData.total_amount,
          subtotal: typeof updatedOrderData.subtotal === 'string' ? parseFloat(updatedOrderData.subtotal) : updatedOrderData.subtotal,
          gst_amount: typeof updatedOrderData.gst_amount === 'string' ? parseFloat(updatedOrderData.gst_amount) : updatedOrderData.gst_amount,
          delivery_charges: typeof updatedOrderData.delivery_charges === 'string' ? parseFloat(updatedOrderData.delivery_charges) : updatedOrderData.delivery_charges,
          service_charges: typeof updatedOrderData.service_charges === 'string' ? parseFloat(updatedOrderData.service_charges) : updatedOrderData.service_charges,
          items: updatedOrderData.items?.map((item: any) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
          })) || []
        };
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
