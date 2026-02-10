import { create } from 'zustand';
import api from '@/lib/api';

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  type_id?: string;
  unit_type: string;
  min_order_qty: number;
  max_order_qty?: number;
  image_url?: string;
  is_vegetarian: boolean;
  is_available: boolean;
  is_featured: boolean;
  featured_priority: number;
  stock_quantity?: number;
  preparation_time?: number;
  pre_order_time?: number;
  offer_code?: string;
  offer_discount_type?: 'percentage' | 'fixed';
  offer_discount_value?: number;
  discounted_price?: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  image_url?: string;
  icon?: string;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
}

interface MenuState {
  menuItems: MenuItem[];
  categories: MenuCategory[];
  productTypes: ProductType[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;

  fetchMenuItems: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    type?: string;
    available?: boolean;
    featured?: boolean;
  }) => Promise<void>;

  fetchAllMenuItems: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductTypes: () => Promise<void>;

  addMenuItem: (formData: FormData) => Promise<void>;
  updateMenuItem: (id: string, formData: FormData) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  createCategory: (name: string) => Promise<any>;
  createProductType: (name: string) => Promise<any>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  categories: [],
  productTypes: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,

  fetchMenuItems: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.category && params.category !== 'all') queryParams.append('category', params.category);
      if (params.type && params.type !== 'all') queryParams.append('type', params.type);
      if (params.available !== undefined) queryParams.append('available', params.available.toString());
      if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());

      const response = await api.get(`/menu?${queryParams.toString()}`);
      // Based on controller response: { success: true, message, data: items, pagination }
      // Or if I copied exactly: { success: true, message: '...', data: result } where result is { items, total, ... }
      // Let's re-read the controller code I wrote.
      // Controller: "data: result.items, pagination: {...}"
      // Wait, in `menuController.js`: 
      // res.json({ success: true, data: result.items, pagination: { total: result.total, ... } });
      // So response.data.data is the array.

      const { data, pagination } = response.data;

      set({
        menuItems: data || [],
        totalItems: pagination?.total || 0,
        totalPages: pagination?.totalPages || 0,
        currentPage: pagination?.page || 1,
        loading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch menu items:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch menu items', loading: false });
    }
  },

  fetchAllMenuItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/menu/all');
      set({
        menuItems: response.data.data || [],
        totalItems: response.data.data?.length || 0,
        loading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch all menu items:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch menu items', loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await api.get('/menu/categories'); // I added this route
      set({ categories: response.data.data || [] });
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
    }
  },

  fetchProductTypes: async () => {
    try {
      const response = await api.get('/menu/types'); // I added this route
      set({ productTypes: response.data.data || [] });
    } catch (error: any) {
      console.error('Failed to fetch product types:', error);
    }
  },

  addMenuItem: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      await api.post('/menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchMenuItems({ page: get().currentPage });
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to add menu item:', error);
      set({ error: error.response?.data?.message || 'Failed to add menu item', loading: false });
      throw error;
    }
  },

  updateMenuItem: async (id: string, formData: FormData) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/menu/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchMenuItems({ page: get().currentPage });
      set({ loading: false });
    } catch (error: any) {
      console.error('Failed to update menu item:', error);
      set({ error: error.response?.data?.message || 'Failed to update menu item', loading: false });
      throw error;
    }
  },

  deleteMenuItem: async (id: string) => {
    try {
      await api.delete(`/menu/${id}`);
      set(state => ({
        menuItems: state.menuItems.filter(item => item.id !== id),
        totalItems: state.totalItems - 1
      }));
    } catch (error: any) {
      console.error('Failed to delete menu item:', error);
      set({ error: error.response?.data?.message || 'Failed to delete menu item' });
    }
  },

  toggleAvailability: async (id: string) => {
    try {
      const response = await api.patch(`/menu/${id}/availability`);
      const updatedStatus = response.data.data.is_available;
      set(state => ({
        menuItems: state.menuItems.map(item =>
          item.id === id ? { ...item, is_available: updatedStatus } : item
        )
      }));
    } catch (error: any) {
      console.error('Failed to toggle availability:', error);
    }
  },

  toggleFeatured: async (id: string) => {
    try {
      const response = await api.patch(`/menu/${id}/featured`);
      const updatedStatus = response.data.data.is_featured;
      set(state => ({
        menuItems: state.menuItems.map(item =>
          item.id === id ? { ...item, is_featured: updatedStatus } : item
        )
      }));
    } catch (error: any) {
      console.error('Failed to toggle featured status:', error);
      throw error;
    }
  },

  createCategory: async (name: string) => {
    try {
      const response = await api.post('/menu/categories', { name });
      set((state) => ({ categories: [...state.categories, response.data.data] }));
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create category:', error);
      throw error;
    }
  },

  createProductType: async (name: string) => {
    try {
      const response = await api.post('/menu/types', { name });
      set((state) => ({ productTypes: [...state.productTypes, response.data.data] }));
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to create product type:', error);
      throw error;
    }
  },
}));
