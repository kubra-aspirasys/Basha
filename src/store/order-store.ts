import { create } from 'zustand';
import { Order } from '@/types';
import { mockOrders } from '@/lib/mock-data';

interface OrderState {
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: mockOrders,
  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, status } : order
      ),
    })),
  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    })),
}));
