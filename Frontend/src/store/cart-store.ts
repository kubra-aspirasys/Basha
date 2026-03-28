import { create } from 'zustand';
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
  reset: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  (set, get) => ({
    items: [],
    isLoading: false,

    fetchCart: async () => {
      const { user } = useAuthStore.getState();
      if (!user) {
        console.log('[CartStore] No user, skipping fetch');
        return;
      }

      set({ isLoading: true });
      try {
        console.log('[CartStore] Fetching cart for user:', user.id);
        const response = await api.get('/cart');
        
        console.log('[CartStore] API Response:', response.data);

        if (response.data.success && response.data.data) {
          const itemsFromApi = response.data.data.items || [];
          console.log('[CartStore] Raw items from API:', itemsFromApi);

          const rawItems = itemsFromApi.map((item: any) => {
            // Check where the data is. Based on screenshot, they are at the top level of the item object
            return {
              id: item.menu_item_id || item.id, 
              name: item.name,
              price: parseFloat(item.price),
              quantity: parseInt(item.quantity),
              image_url: item.image_url,
              unit_type: item.unit_type
            };
          });

          console.log('[CartStore] Mapped Items:', rawItems);

          // Aggregate duplicates
          const aggregatedItems: CartItem[] = [];
          rawItems.forEach((item: any) => {
            const existing = aggregatedItems.find(i => i.id === item.id);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              aggregatedItems.push(item);
            }
          });

          set({ items: aggregatedItems });
          console.log('[CartStore] Final items in state:', aggregatedItems);
        } else {
          console.warn('[CartStore] API returned success:false or no data');
        }
      } catch (error) {
        console.error('[CartStore] Fetch failed:', error);
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

      // Sync to DB if logged in
      if (user) {
        try {
          await api.post('/cart/add', {
            menu_item_id: item.id,
            quantity: quantityToAdd
          });
        } catch (error) {
          console.error('Failed to sync add item to server:', error);
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

    reset: () => set({ items: [] }),
  })
);
