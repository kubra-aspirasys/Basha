import { create } from 'zustand';
import { Order, OrderItem } from '@/types';
import { mockOrders } from '@/lib/mock-data';
import { supabase } from '@/lib/supabase';

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

const mapDbOrder = (row: any): Order => ({
  id: row.id,
  order_number: row.order_number,
  customer_id: row.customer_id || 'guest',
  customer_name: row.customer_name,
  total_amount: Number(row.total_amount ?? 0),
  subtotal: Number(row.subtotal ?? 0),
  gst_amount: Number(row.gst_amount ?? 0),
  delivery_charges: Number(row.delivery_charges ?? 0),
  service_charges: Number(row.service_charges ?? 0),
  status: row.status,
  order_type: row.order_type,
  delivery_address: row.delivery_address || '',
  items: (row.order_items || []).map((item: any): OrderItem => ({
    id: item.id,
    order_id: item.order_id,
    menu_item_id: item.menu_item_id,
    menu_item_name: item.menu_item_name,
    quantity: Number(item.quantity ?? 0),
    price: Number(item.price ?? 0),
  })),
  created_at: row.created_at,
});

const generateOrderNumber = () => `BB-${Date.now().toString().slice(-6)}`;

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    if (!supabase) {
      set({ orders: mockOrders, error: null });
      return;
    }

    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load orders', error);
      set({ orders: mockOrders, error: error.message, loading: false });
      return;
    }

    set({ orders: (data || []).map(mapDbOrder), loading: false });
  },

  createOrder: async (payload) => {
    if (!supabase) {
      const fallbackOrder: Order = {
        id: `${Date.now()}`,
        order_number: generateOrderNumber(),
        customer_id: payload.customer_id || 'guest',
        customer_name: payload.customer_name,
        total_amount: payload.totals.total_amount,
        subtotal: payload.totals.subtotal,
        gst_amount: payload.totals.gst_amount,
        delivery_charges: payload.totals.delivery_charges,
        service_charges: payload.totals.service_charges,
        status: payload.status || 'pending',
        order_type: payload.order_type,
        delivery_address: payload.delivery_address,
        items: payload.items.map((item, idx) => ({
          id: `${Date.now()}-${idx}`,
          order_id: `${Date.now()}`,
          menu_item_id: item.menu_item_id,
          menu_item_name: item.menu_item_name,
          quantity: item.quantity,
          price: item.price,
        })),
        created_at: new Date().toISOString(),
      };

      set((state) => ({ orders: [fallbackOrder, ...state.orders] }));
      return fallbackOrder;
    }

    const orderNumber = generateOrderNumber();

    console.log('Creating order with payload:', {
      order_number: orderNumber,
      customer_id: payload.customer_id,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      delivery_address: payload.delivery_address,
      order_type: payload.order_type,
      status: payload.status || 'pending',
      subtotal: payload.totals.subtotal,
      gst_amount: payload.totals.gst_amount,
      delivery_charges: payload.totals.delivery_charges,
      service_charges: payload.totals.service_charges,
      total_amount: payload.totals.total_amount,
    });

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: payload.customer_id,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        delivery_address: payload.delivery_address,
        order_type: payload.order_type,
        status: payload.status || 'pending',
        subtotal: payload.totals.subtotal,
        gst_amount: payload.totals.gst_amount,
        delivery_charges: payload.totals.delivery_charges,
        service_charges: payload.totals.service_charges,
        total_amount: payload.totals.total_amount,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Failed to create order:', orderError);
      console.error('Order error details:', JSON.stringify(orderError, null, 2));
      set({ error: orderError?.message || 'Failed to create order' });
      return null;
    }

    const itemsPayload = payload.items.map((item) => ({
      order_id: orderData.id,
      menu_item_id: item.menu_item_id,
      menu_item_name: item.menu_item_name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsPayload)
      .select();

    if (itemsError) {
      console.error('Failed to create order items:', itemsError);
      console.error('Items error details:', JSON.stringify(itemsError, null, 2));
      set({ error: itemsError.message });
      return null;
    }

    const newOrder = mapDbOrder({ ...orderData, order_items: insertedItems });
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },

  updateOrderStatus: async (id, status) => {
    if (!supabase) {
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? { ...order, status } : order
        ),
      }));
      return;
    }

    const { error, data } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, order_items(*)')
      .single();

    if (error || !data) {
      console.error('Failed to update order status', error);
      set({ error: error?.message || 'Failed to update status' });
      return;
    }

    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? mapDbOrder(data) : order
      ),
    }));
  },

  deleteOrder: async (id) => {
    if (!supabase) {
      set((state) => ({ orders: state.orders.filter((order) => order.id !== id) }));
      return;
    }

    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) {
      console.error('Failed to delete order', error);
      set({ error: error.message });
      return;
    }

    set((state) => ({ orders: state.orders.filter((order) => order.id !== id) }));
  },
}));
