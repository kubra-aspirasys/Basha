import api from './api';
import { Inquiry } from '../types';

export interface InquiryFilters {
    search?: string;
    status?: string | 'all';
    priority?: string | 'all';
    sort?: 'created_at_asc' | 'created_at_desc' | 'full_name' | 'status' | 'priority';
    page?: number;
    limit?: number;
}

export interface InquiryStats {
    total: number;
    newCount: number;
    quotedCount: number;
    convertedCount: number;
    totalQuoteValue: number;
}

export const inquiryService = {
    getAll: async (filters: InquiryFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== 'all') {
                params.append(key, value.toString());
            }
        });
        const response = await api.get<{ data: { inquiries: Inquiry[], total: number, totalPages: number } }>(`/inquiries?${params.toString()}`);
        return response.data.data;
    },

    getStats: async () => {
        const response = await api.get<{ data: InquiryStats }>('/inquiries/stats');
        return response.data.data;
    },

    create: async (data: Partial<Inquiry>) => {
        const response = await api.post<{ data: Inquiry }>('/inquiries', data);
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<{ data: Inquiry }>(`/inquiries/${id}`);
        return response.data.data;
    },

    update: async (id: string, data: Partial<Inquiry>) => {
        const response = await api.patch<{ data: Inquiry }>(`/inquiries/${id}`, data);
        return response.data.data;
    },

    updateStatus: async (id: string, status: string) => {
        const response = await api.patch<{ data: Inquiry }>(`/inquiries/${id}/status`, { status });
        return response.data.data;
    },

    updatePriority: async (id: string, priority: string) => {
        const response = await api.patch<{ data: Inquiry }>(`/inquiries/${id}/priority`, { priority });
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<{ success: boolean }>(`/inquiries/${id}`);
        return response.data.success;
    },

    // Quotes
    createQuote: async (inquiryId: string, amount: number, details?: string, validUntil?: string, status: string = 'sent') => {
        const response = await api.post('/inquiries/quotes', { inquiry_id: inquiryId, amount, details, valid_until: validUntil, status });
        return response.data.data;
    },

    getQuotes: async (inquiryId: string) => {
        const response = await api.get(`/inquiries/quotes?inquiryId=${inquiryId}`);
        return response.data.data;
    },

    export: async (filters: InquiryFilters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== 'all') {
                params.append(key, value.toString());
            }
        });
        const response = await api.get(`/inquiries/export?${params.toString()}`, { responseType: 'blob' });
        return response.data;
    }
};
