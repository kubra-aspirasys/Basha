import { create } from 'zustand';
import { Inquiry } from '@/types';
import { mockInquiries } from '@/lib/mock-data';

interface InquiryState {
  inquiries: Inquiry[];
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => void;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => void;
  updateInquiryPriority: (id: string, priority: Inquiry['priority']) => void;
  updateInquiryNotes: (id: string, notes: string) => void;
  updateInquiryQuote: (id: string, quoteAmount: number) => void;
  assignInquiry: (id: string, assignedTo: string) => void;
  deleteInquiry: (id: string) => void;
}

export const useInquiryStore = create<InquiryState>((set) => ({
  inquiries: mockInquiries,
  addInquiry: (inquiry) =>
    set((state) => {
      const newInquiry: Inquiry = {
        ...inquiry,
        id: `${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return {
        inquiries: [newInquiry, ...state.inquiries],
      };
    }),
  updateInquiryStatus: (id, status) =>
    set((state) => ({
      inquiries: state.inquiries.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, status, updated_at: new Date().toISOString() } : inquiry
      ),
    })),
  updateInquiryPriority: (id, priority) =>
    set((state) => ({
      inquiries: state.inquiries.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, priority, updated_at: new Date().toISOString() } : inquiry
      ),
    })),
  updateInquiryNotes: (id, notes) =>
    set((state) => ({
      inquiries: state.inquiries.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, notes, updated_at: new Date().toISOString() } : inquiry
      ),
    })),
  updateInquiryQuote: (id, quoteAmount) =>
    set((state) => ({
      inquiries: state.inquiries.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, quote_amount: quoteAmount, updated_at: new Date().toISOString() } : inquiry
      ),
    })),
  assignInquiry: (id, assignedTo) =>
    set((state) => ({
      inquiries: state.inquiries.map((inquiry) =>
        inquiry.id === id ? { ...inquiry, assigned_to: assignedTo, updated_at: new Date().toISOString() } : inquiry
      ),
    })),
  deleteInquiry: (id) =>
    set((state) => ({
      inquiries: state.inquiries.filter((inquiry) => inquiry.id !== id),
    })),
}));


