import api from './api';
import { Inquiry } from '../types';

export interface InquiryFilters {
    search?: string;
    status?: 'Pending' | 'Approved' | 'Disapproved' | 'all';
    eventType?: string | 'all';
    subject?: string | 'all';
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
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

    getById: async (id: string) => {
        const response = await api.get<{ data: Inquiry }>(`/inquiries/${id}`);
        return response.data.data;
    },

    update: async (id: string, data: Partial<Inquiry>) => {
        const response = await api.patch<{ data: Inquiry }>(`/inquiries/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        const response = await api.delete<{ success: boolean }>(`/inquiries/${id}`);
        return response.data.success;
    }
};
