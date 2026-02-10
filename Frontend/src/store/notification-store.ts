import { create } from 'zustand';
import api from '@/lib/api';

export interface Notification {
    id: string;
    type: 'new_order' | 'order_status' | 'order_cancelled' | 'new_payment' | 'payment_failed' | 'new_customer' | 'new_inquiry' | 'new_quote' | 'contact_message' | 'low_stock' | 'system' | 'info';
    title: string;
    message: string;
    is_read: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reference_id?: string;
    reference_type?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface NotificationStats {
    total: number;
    unread: number;
    read: number;
    todayCount: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
}

interface NotificationState {
    notifications: Notification[];
    latestUnread: Notification[];
    unreadCount: number;
    stats: NotificationStats | null;
    total: number;
    totalPages: number;
    currentPage: number;
    loading: boolean;
    error: string | null;

    fetchNotifications: (params?: Record<string, any>) => Promise<void>;
    fetchLatestUnread: () => Promise<void>;
    fetchStats: () => Promise<void>;
    createNotification: (data: Partial<Notification>) => Promise<boolean>;
    markAsRead: (id: string) => Promise<void>;
    markMultipleAsRead: (ids: string[]) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    deleteAllRead: () => Promise<void>;
    generateFromActivity: () => Promise<{ created: number }>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    latestUnread: [],
    unreadCount: 0,
    stats: null,
    total: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,

    fetchNotifications: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/notifications', { params });
            const data = response.data.data;
            set({
                notifications: data.notifications,
                total: data.total,
                totalPages: data.totalPages,
                currentPage: data.currentPage,
                loading: false,
            });
        } catch (error: any) {
            console.error('Failed to fetch notifications:', error);
            set({ loading: false, error: error.response?.data?.message || 'Failed to fetch notifications' });
        }
    },

    fetchLatestUnread: async () => {
        try {
            const response = await api.get('/notifications/latest');
            const data = response.data.data;
            set({
                latestUnread: data.notifications,
                unreadCount: data.unreadCount,
            });
        } catch (error) {
            console.error('Failed to fetch latest unread:', error);
        }
    },

    fetchStats: async () => {
        try {
            const response = await api.get('/notifications/stats');
            set({ stats: response.data.data });
        } catch (error) {
            console.error('Failed to fetch notification stats:', error);
        }
    },

    createNotification: async (data) => {
        try {
            await api.post('/notifications', data);
            await get().fetchNotifications();
            await get().fetchLatestUnread();
            return true;
        } catch (error) {
            console.error('Failed to create notification:', error);
            return false;
        }
    },

    markAsRead: async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            // Update local state
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                ),
                latestUnread: state.latestUnread.filter((n) => n.id !== id),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    },

    markMultipleAsRead: async (ids) => {
        try {
            await api.patch('/notifications/mark-read', { ids });
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    ids.includes(n.id) ? { ...n, is_read: true } : n
                ),
                latestUnread: state.latestUnread.filter((n) => !ids.includes(n.id)),
                unreadCount: Math.max(0, state.unreadCount - ids.length),
            }));
        } catch (error) {
            console.error('Failed to mark multiple as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.patch('/notifications/mark-all-read');
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
                latestUnread: [],
                unreadCount: 0,
            }));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    deleteNotification: async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id),
                latestUnread: state.latestUnread.filter((n) => n.id !== id),
                total: state.total - 1,
            }));
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    },

    deleteAllRead: async () => {
        try {
            await api.delete('/notifications/clear-read');
            set((state) => ({
                notifications: state.notifications.filter((n) => !n.is_read),
                total: state.notifications.filter((n) => !n.is_read).length,
            }));
        } catch (error) {
            console.error('Failed to delete read notifications:', error);
        }
    },

    generateFromActivity: async () => {
        try {
            const response = await api.post('/notifications/generate');
            const result = response.data.data;
            // Refresh data after generation
            await get().fetchNotifications();
            await get().fetchLatestUnread();
            await get().fetchStats();
            return result;
        } catch (error) {
            console.error('Failed to generate notifications:', error);
            return { created: 0 };
        }
    },
}));
