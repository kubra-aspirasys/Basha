import { create } from 'zustand';
import { CMSPage } from '@/types';
import { mockCMSPages } from '@/lib/mock-data';

interface CMSState {
  pages: CMSPage[];
  updatePage: (id: string, page: Partial<CMSPage>) => void;
}

export const useCMSStore = create<CMSState>((set) => ({
  pages: mockCMSPages,
  updatePage: (id, page) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, ...page, updated_at: new Date().toISOString() } : p
      ),
    })),
}));
