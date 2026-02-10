import { create } from 'zustand';
import { Inquiry } from '@/types';
import { inquiryService, InquiryFilters } from '@/lib/inquiry-service';
import { toast } from '@/hooks/use-toast';

interface InquiryState {
  inquiries: Inquiry[];
  isLoading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;

  fetchInquiries: (filters?: InquiryFilters) => Promise<void>;
  updateInquiry: (id: string, data: Partial<Inquiry>) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: [],
  isLoading: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,

  fetchInquiries: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const { inquiries, total, totalPages } = await inquiryService.getAll(filters);
      set({ inquiries, total, totalPages, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      set({ error: 'Failed to fetch inquiries', isLoading: false });
    }
  },

  updateInquiry: async (id, data) => {
    try {
      set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, ...data } : i)),
      }));
      await inquiryService.update(id, data);
      toast({ title: 'Success', description: 'Inquiry updated successfully' });
      await get().fetchInquiries(); // Refresh to ensure sync
    } catch (error) {
      console.error('Failed to update inquiry:', error);
      await get().fetchInquiries();
      toast({ title: 'Error', description: 'Failed to update inquiry', variant: 'destructive' });
    }
  },

  deleteInquiry: async (id) => {
    try {
      await inquiryService.delete(id);
      set((state) => ({
        inquiries: state.inquiries.filter((i) => i.id !== id),
      }));
      toast({ title: 'Success', description: 'Inquiry deleted successfully' });
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      toast({ title: 'Error', description: 'Failed to delete inquiry', variant: 'destructive' });
    }
  },
}));
