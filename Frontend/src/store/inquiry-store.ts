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
  stats: {
    total: number;
    newCount: number;
    quotedCount: number;
    convertedCount: number;
    totalQuoteValue: number;
  };

  fetchInquiries: (filters?: InquiryFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => Promise<void>;
  updateInquiryPriority: (id: string, priority: Inquiry['priority']) => Promise<void>;
  updateInquiryNotes: (id: string, notes: string) => Promise<void>;
  updateInquiryQuote: (id: string, quoteAmount: number) => Promise<void>;
  assignInquiry: (id: string, assignedTo: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: [],
  isLoading: false,
  error: null,
  total: 0,
  totalPages: 0,
  currentPage: 1,
  stats: {
    total: 0,
    newCount: 0,
    quotedCount: 0,
    convertedCount: 0,
    totalQuoteValue: 0
  },

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

  fetchStats: async () => {
    try {
      const stats = await inquiryService.getStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  addInquiry: async (inquiryData) => {
    set({ isLoading: true, error: null });
    try {
      await inquiryService.create(inquiryData);
      await get().fetchInquiries(); // Refresh list
      toast({ title: 'Success', description: 'Inquiry created successfully' });
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to create inquiry:', error);
      set({ error: 'Failed to create inquiry', isLoading: false });
      toast({ title: 'Error', description: 'Failed to create inquiry', variant: 'destructive' });
    }
  },

  updateInquiryStatus: async (id, status) => {
    try {
      // Optimistic update
      set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, status } : i)),
      }));
      await inquiryService.updateStatus(id, status);
      toast({ title: 'Success', description: 'Status updated successfully' });
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert on failure (could be improved with a backup of previous state)
      // For now, re-fetching is safer
      await get().fetchInquiries();
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  },

  updateInquiryPriority: async (id, priority) => {
    try {
      set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, priority } : i)),
      }));
      await inquiryService.updatePriority(id, priority);
      toast({ title: 'Success', description: 'Priority updated successfully' });
    } catch (error) {
      console.error('Failed to update priority:', error);
      await get().fetchInquiries();
      toast({ title: 'Error', description: 'Failed to update priority', variant: 'destructive' });
    }
  },

  updateInquiryNotes: async (id, notes) => {
    try {
      set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, notes } : i)),
      }));
      await inquiryService.update(id, { notes });
      toast({ title: 'Success', description: 'Notes updated successfully' });
    } catch (error) {
      console.error('Failed to update notes:', error);
      await get().fetchInquiries();
      toast({ title: 'Error', description: 'Failed to update notes', variant: 'destructive' });
    }
  },

  updateInquiryQuote: async (id, quoteAmount) => {
    try {
      set({ isLoading: true });
      // Assuming we are just creating a quote here. 
      // If we want detailed quote creation, we might need a separate method.
      // For inline edit, we use the simple update or createQuote.
      // Let's use createQuote to properly log it
      await inquiryService.createQuote(id, quoteAmount);

      set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, quote_amount: quoteAmount, status: 'quoted' } : i)),
        isLoading: false
      }));

      toast({ title: 'Success', description: 'Quote updated successfully' });
    } catch (error) {
      console.error('Failed to update quote:', error);
      set({ isLoading: false });
      toast({ title: 'Error', description: 'Failed to update quote', variant: 'destructive' });
    }
  },

  assignInquiry: async (id, assignedTo) => {
    try {
      set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, assigned_to: assignedTo } : i)),
      }));
      await inquiryService.update(id, { assigned_to: assignedTo });
      toast({ title: 'Success', description: 'Inquiry assigned' });
    } catch (error) {
      console.error('Failed to assign inquiry:', error);
      await get().fetchInquiries();
      toast({ title: 'Error', description: 'Failed to assign inquiry', variant: 'destructive' });
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
