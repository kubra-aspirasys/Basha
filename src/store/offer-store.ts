import { create } from 'zustand';
import { Offer } from '@/types';
import { mockOffers } from '@/lib/mock-data';

interface OfferState {
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id' | 'created_at'>) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
}

export const useOfferStore = create<OfferState>((set) => ({
  offers: mockOffers,
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
