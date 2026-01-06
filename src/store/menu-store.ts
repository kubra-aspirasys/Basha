import { create } from 'zustand';
import { MenuItem } from '@/types';
import { mockMenuItems } from '@/lib/menu-mock-data';

interface MenuState {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleFeatured: (id: string) => void;
  updateFeaturedPriority: (items: MenuItem[]) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menuItems: mockMenuItems,
  loading: false,
  error: null,

  addMenuItem: (item) =>
    set((state) => {
      const newItem = {
        ...item,
        id: `${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // If the item is featured and doesn't have a priority, set it to the end
      if (newItem.is_featured && !newItem.featured_priority) {
        const featuredCount = state.menuItems.filter(item => item.is_featured).length;
        newItem.featured_priority = featuredCount + 1;
      }

      return {
        menuItems: [newItem, ...state.menuItems],
      };
    }),

  updateMenuItem: (id, item) =>
    set((state) => ({
      menuItems: state.menuItems.map((menuItem) =>
        menuItem.id === id
          ? { ...menuItem, ...item, updated_at: new Date().toISOString() }
          : menuItem
      ),
    })),

  deleteMenuItem: (id) =>
    set((state) => ({
      menuItems: state.menuItems.filter((item) => item.id !== id),
    })),

  toggleFeatured: (id) =>
    set((state) => {
      const item = state.menuItems.find(item => item.id === id);
      if (!item) return state;

      const newFeaturedStatus = !item.is_featured;
      const featuredCount = state.menuItems.filter(menuItem => menuItem.is_featured).length;

      return {
        menuItems: state.menuItems.map((menuItem) =>
          menuItem.id === id 
            ? { 
                ...menuItem, 
                is_featured: newFeaturedStatus,
                featured_priority: newFeaturedStatus ? featuredCount + 1 : undefined
              } 
            : menuItem
        ),
      };
    }),

  updateFeaturedPriority: (items) =>
    set(() => ({
      menuItems: items,
    })),
}));
