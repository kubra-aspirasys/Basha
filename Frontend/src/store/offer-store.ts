import { create } from 'zustand';
import { Offer } from '@/types';
import { mockOffers } from '@/lib/mock-data';

interface OfferState {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  fetchOffers: () => Promise<void>;
  addOffer: (offer: Omit<Offer, 'id' | 'created_at'>) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
}

export const useOfferStore = create<OfferState>((set) => ({
  offers: mockOffers,
  loading: false,
  error: null,

  fetchOffers: async () => {
    // Mock fetch - in real app would call API
    set({ loading: true });
    // Simulate delay if needed, or just set mock data
    // For now, we reuse mockOffers as the initial state already has them,
    // but to satisfy the interface we just toggle loading.
    setTimeout(() => set({ loading: false }), 500);
  },

  addOffer: (offer) =>
    set((state) => ({
      offers: [
        ...state.offers,
        {
          ...offer,
          id: `${Date.now()}`,
          created_at: new Date().toISOString(),
        },
      ],
    })),
  updateOffer: (id, offer) =>
    set((state) => ({
      offers: state.offers.map((o) => (o.id === id ? { ...o, ...offer } : o)),
    })),
  deleteOffer: (id) =>
    set((state) => ({
      offers: state.offers.filter((offer) => offer.id !== id),
    })),
}));
