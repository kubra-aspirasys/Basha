import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { useAuthStore } from './auth-store';

export interface CartItem {
  id: string; // This corresponds to menu_item_id
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  unit_type: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addItem: (item: Omit<CartItem, 'quantity' | 'unit_type'> & { unit_type?: string; quantity?: number }) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      fetchCart: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        set({ isLoading: true });
        try {
          const response = await api.get('/cart');
          if (response.data.success) {
            const rawItems = response.data.data.items.map((item: any) => ({
              id: item.menu_item_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image_url: item.image_url,
              unit_type: item.unit_type
            }));

            // Aggregate duplicates if any exist in the database
            const aggregatedItems = rawItems.reduce((acc: CartItem[], current: CartItem) => {
              const existing = acc.find(item => item.id === current.id);
              if (existing) {
                existing.quantity += current.quantity;
              } else {
                acc.push(current);
              }
              return acc;
            }, []);

            set({ items: aggregatedItems });
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (item) => {
        const { user } = useAuthStore.getState();
        const quantityToAdd = item.quantity || 1;

        // Optimistic update
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, unit_type: item.unit_type || 'piece', quantity: quantityToAdd }],
          };
        });

        // Sync with server if logged in
        if (user) {
          try {
            await api.post('/cart/add', {
              menu_item_id: item.id,
              quantity: quantityToAdd
            });
          } catch (error) {
            console.error('Failed to sync add item to server:', error);
            // Revert or handle error? For now, we keep optimistic state but log error.
          }
        }
      },

      removeItem: async (id) => {
        const { user } = useAuthStore.getState();

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        if (user) {
          try {
            await api.delete(`/cart/${id}`);
          } catch (error) {
            console.error('Failed to sync remove item to server:', error);
          }
        }
      },

      updateQuantity: async (id, quantity) => {
        const { user } = useAuthStore.getState();

        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));

        if (user) {
          try {
            await api.put(`/cart/${id}`, { quantity });
          } catch (error) {
            console.error('Failed to sync update quantity to server:', error);
          }
        }
      },

      clearCart: async () => {
        const { user } = useAuthStore.getState();

        set({ items: [] });

        if (user) {
          try {
            await api.delete('/cart');
          } catch (error) {
            console.error('Failed to clear server cart:', error);
          }
        }
      },

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
