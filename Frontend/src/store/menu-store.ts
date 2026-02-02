import { create } from 'zustand';
import { MenuItem } from '@/types';
import { mockMenuItems } from '@/lib/menu-mock-data';
import { supabase } from '@/lib/supabase';

interface MenuState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  updateFeaturedPriority: (items: MenuItem[]) => void;
}

const normalizeMenuItem = (item: any): MenuItem => ({
  ...item,
  price: Number(item.price ?? 0),
  min_order_qty: Number(item.min_order_qty ?? 0),
  max_order_qty: item.max_order_qty !== null && item.max_order_qty !== undefined ? Number(item.max_order_qty) : undefined,
  preparation_time: item.preparation_time !== null && item.preparation_time !== undefined ? Number(item.preparation_time) : undefined,
  stock_quantity: item.stock_quantity !== null && item.stock_quantity !== undefined ? Number(item.stock_quantity) : undefined,
  featured_priority: item.featured_priority ?? undefined,
  discounted_price: item.discounted_price !== null && item.discounted_price !== undefined ? Number(item.discounted_price) : undefined,
  offer_discount_value: item.offer_discount_value !== null && item.offer_discount_value !== undefined ? Number(item.offer_discount_value) : undefined,
});

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  loading: false,
  error: null,

  fetchMenuItems: async () => {
    // Fall back to mock data when Supabase isn't configured
    if (!supabase) {
      set({ menuItems: mockMenuItems, error: null });
      return;
    }

    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('featured_priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load menu items from Supabase', error);
      set({ menuItems: mockMenuItems, error: error.message, loading: false });
      return;
    }

    set({ menuItems: (data || []).map(normalizeMenuItem), loading: false });
  },

  addMenuItem: async (item) => {
    const featuredCount = useMenuStore.getState().menuItems.filter(menuItem => menuItem.is_featured).length;
    const newItem = {
      ...item,
      featured_priority: item.is_featured && !item.featured_priority ? featuredCount + 1 : item.featured_priority,
    };

    // Try Supabase first
    if (supabase) {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          ...newItem,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to add menu item to Supabase:', error);
        set({ error: error.message });
        // Fall back to local
        const fallbackItem = {
          ...newItem,
          id: `local-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({ menuItems: [fallbackItem as MenuItem, ...state.menuItems] }));
        return;
      }

      if (data) {
        set((state) => ({ menuItems: [normalizeMenuItem(data), ...state.menuItems], error: null }));
        return;
      }
    }

    // Fallback for no Supabase
    const fallbackItem = {
      ...newItem,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ menuItems: [fallbackItem as MenuItem, ...state.menuItems] }));
  },

  updateMenuItem: async (id, item) => {
    if (supabase) {
      const { data, error } = await supabase
        .from('menu_items')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update menu item:', error);
        set({ error: error.message });
        // Still update locally
        set((state) => ({
          menuItems: state.menuItems.map((menuItem) =>
            menuItem.id === id
              ? { ...menuItem, ...item, updated_at: new Date().toISOString() }
              : menuItem
          ),
        }));
        return;
      }

      if (data) {
        set((state) => ({
          menuItems: state.menuItems.map((menuItem) =>
            menuItem.id === id ? normalizeMenuItem(data) : menuItem
          ),
          error: null,
        }));
        return;
      }
    }

    // Fallback for no Supabase
    set((state) => ({
      menuItems: state.menuItems.map((menuItem) =>
        menuItem.id === id
          ? { ...menuItem, ...item, updated_at: new Date().toISOString() }
          : menuItem
      ),
    }));
  },

  deleteMenuItem: async (id) => {
    if (supabase) {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete menu item:', error);
        set({ error: error.message });
        return;
      }
    }

    // Update local state regardless
    set((state) => ({
      menuItems: state.menuItems.filter((item) => item.id !== id),
      error: null,
    }));
  },

  toggleFeatured: async (id) => {
    const item = get().menuItems.find(item => item.id === id);
    if (!item) return;

    const newFeaturedStatus = !item.is_featured;
    const featuredCount = get().menuItems.filter(menuItem => menuItem.is_featured).length;

    const updatedItem = {
      ...item,
      is_featured: newFeaturedStatus,
      featured_priority: newFeaturedStatus ? featuredCount + 1 : undefined,
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('menu_items')
        .update({
          is_featured: updatedItem.is_featured,
          featured_priority: updatedItem.featured_priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to toggle featured:', error);
        set({ error: error.message });
        // Still update locally for optimistic UI
      } else if (data) {
        set((state) => ({
          menuItems: state.menuItems.map((menuItem) =>
            menuItem.id === id ? normalizeMenuItem(data) : menuItem
          ),
          error: null,
        }));
        return;
      }
    }

    // Update local state if no Supabase or on error
    set((state) => ({
      menuItems: state.menuItems.map((menuItem) =>
        menuItem.id === id ? updatedItem : menuItem
      ),
      error: null,
    }));
  },

  updateFeaturedPriority: (items) =>
    set(() => {
      if (supabase) {
        const updates = items.map((item) => ({ id: item.id, featured_priority: item.featured_priority }));
        supabase
          .from('menu_items')
          .upsert(updates)
          .then(({ error }) => {
            if (error) {
              console.error('Failed to update featured priority', error);
              set({ error: error.message });
            }
          });
      }

      return { menuItems: items };
    }),
}));
