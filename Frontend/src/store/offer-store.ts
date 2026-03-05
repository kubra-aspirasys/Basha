import { create } from 'zustand';
import { Offer } from '@/types';
import api from '@/lib/api';

interface OfferState {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  fetchOffers: () => Promise<void>;
  addOffer: (offer: Omit<Offer, 'id' | 'created_at'>) => Promise<void>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  bulkDeleteOffers: (ids: string[]) => Promise<void>;
  getPublicOffers: (customerId?: string) => Promise<Offer[]>;
  markOfferAsUsed: (id: string, userIds: string[]) => Promise<void>;
}

export const useOfferStore = create<OfferState>((set, get) => ({
  offers: [],
  loading: false,
  error: null,

  fetchOffers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/offers');
      if (response.data.success) {
        set({ offers: response.data.data, loading: false });
      } else {
        set({ error: 'Failed to fetch offers', loading: false });
      }
    } catch (error: any) {
      console.error('Failed to fetch offers:', error);
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  addOffer: async (offerData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/offers', offerData);
      if (response.data.success) {
        set((state) => ({
          offers: [response.data.data, ...state.offers],
          loading: false
        }));
      }
    } catch (error: any) {
      console.error('Failed to add offer:', error);
      set({ error: error.response?.data?.message || 'Failed to add offer', loading: false });
      throw error;
    }
  },

  updateOffer: async (id, offerData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/offers/${id}`, offerData);
      if (response.data.success) {
        set((state) => ({
          offers: state.offers.map((o) => (o.id === id ? response.data.data : o)),
          loading: false
        }));
      }
    } catch (error: any) {
      console.error('Failed to update offer:', error);
      set({ error: error.response?.data?.message || 'Failed to update offer', loading: false });
      throw error;
    }
  },

  deleteOffer: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/offers/${id}`);
      if (response.data.success) {
        set((state) => ({
          offers: state.offers.filter((offer) => offer.id !== id),
          loading: false
        }));
        await get().fetchOffers();
      }
    } catch (error: any) {
      console.error('Failed to delete offer:', error);
      set({ error: error.response?.data?.message || 'Failed to delete offer', loading: false });
      throw error;
    }
  },

  bulkDeleteOffers: async (ids) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/offers/bulk-delete', { ids });
      if (response.data.success) {
        set((state) => ({
          offers: state.offers.filter((offer) => !ids.includes(offer.id)),
          loading: false
        }));
        await get().fetchOffers();
      }
    } catch (error: any) {
      console.error('Failed to bulk delete offers:', error);
      set({ error: error.response?.data?.message || 'Failed to bulk delete offers', loading: false });
      throw error;
    }
  },

  getPublicOffers: async (customerId?: string) => {
    try {
      const url = customerId ? `/offers/available?customer_id=${customerId}` : '/offers/available';
      const response = await api.get(url);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch public offers:', error);
      return [];
    }
  },

  markOfferAsUsed: async (id, userIds) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/offers/${id}/mark-used`, { user_ids: userIds });
      if (response.data.success) {
        set({ loading: false });
      }
    } catch (error: any) {
      console.error('Failed to mark offer as used:', error);
      set({ error: error.response?.data?.message || 'Failed to mark offer as used', loading: false });
      throw error;
    }
  },
}));
