import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore, Notification } from '@/store/notification-store';
import { useToast } from '@/hooks/use-toast';
import {
    Bell, BellRing, Check, CheckCheck, Trash2, RefreshCw,
    Search, Filter, ChevronLeft, ChevronRight, Eye,
    ShoppingBag, CreditCard, Users, MessageSquare,
    AlertTriangle, Info, Package, X, Sparkles,
    Clock, CheckCircle2, XCircle, Zap
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const typeConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    new_order: { icon: ShoppingBag, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'New Order' },
    order_status: { icon: Package, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Order Status' },
    order_cancelled: { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Order Cancelled' },
    new_payment: { icon: CreditCard, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Payment' },
    payment_failed: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Payment Failed' },
    new_customer: { icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'New Customer' },
    new_inquiry: { icon: MessageSquare, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'New Inquiry' },
    low_stock: { icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Low Stock' },
    system: { icon: Zap, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', label: 'System' },
    info: { icon: Info, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/30', label: 'Info' },
};

const priorityConfig: Record<string, { color: string; bg: string; dot: string }> = {
    low: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' },
    medium: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', dot: 'bg-blue-500' },
    high: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', dot: 'bg-amber-500' },
    urgent: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', dot: 'bg-red-500 animate-pulse' },
};

function timeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Notifications() {
    const {
        notifications, total, totalPages, currentPage, loading, stats,
        fetchNotifications, fetchStats, markAsRead, markMultipleAsRead,
        markAllAsRead, deleteNotification, deleteAllRead, generateFromActivity,
    } = useNotificationStore();
    const { toast } = useToast();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [readFilter, setReadFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [detailId, setDetailId] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const limit = 15;

    const loadData = useCallback(() => {
        fetchNotifications({
            search: search || undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            priority: priorityFilter !== 'all' ? priorityFilter : undefined,
            is_read: readFilter !== 'all' ? readFilter : undefined,
            page,
            limit,
        });
        fetchStats();
    }, [search, typeFilter, priorityFilter, readFilter, page, fetchNotifications, fetchStats]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-generate on first load
    useEffect(() => {
        generateFromActivity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGenerate = async () => {
        setGenerating(true);
        const result = await generateFromActivity();
        setGenerating(false);
        toast({
            title: 'Notifications Generated',
            description: `Created ${result.created} new notifications from recent activity`,
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.length === notifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map((n) => n.id));
        }
    };

    const handleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleBatchRead = async () => {
        if (selectedIds.length === 0) return;
        await markMultipleAsRead(selectedIds);
        setSelectedIds([]);
        toast({ title: 'Done', description: `Marked ${selectedIds.length} notifications as read` });
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        toast({ title: 'Done', description: 'All notifications marked as read' });
    };

    const handleClearRead = async () => {
        await deleteAllRead();
        toast({ title: 'Cleared', description: 'All read notifications removed' });
        loadData();
    };

    const handleDelete = async (id: string) => {
        await deleteNotification(id);
        toast({ title: 'Deleted', description: 'Notification removed' });
        if (detailId === id) setDetailId(null);
    };

    const handleRead = async (id: string) => {
        await markAsRead(id);
    };

    const navigate = useNavigate();
    const detailNotification = notifications.find((n) => n.id === detailId);

    const handleNavigate = (notification: Notification) => {
        // Smart redirection based on notification type
        switch (notification.type) {
            case 'new_order':
            case 'order_status':
            case 'order_cancelled':
                navigate(`/admin/orders`);
                break;
            case 'new_payment':
            case 'payment_failed':
                navigate('/admin/payments');
                break;
            case 'new_customer':
                navigate('/admin/users');
                break;
            case 'new_inquiry':
            case 'new_quote':
            case 'contact_message':
                navigate('/admin/inquiries');
                break;
            case 'low_stock':
                navigate('/admin/menu');
                break;
            default:
                // No specific page
                toast({ title: 'Info', description: 'This is a general notification' });
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                            <Bell className="w-6 h-6" />
                        </div>
                        Notifications
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Stay updated with orders, payments, customers & more
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                    >
                        <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                        {generating ? 'Scanning...' : 'Scan Activity'}
                    </button>
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark All Read
                    </button>
                    <button
                        onClick={handleClearRead}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Read
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                                <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Unread</p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.unread}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Read</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.read}</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Today</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.todayCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search notifications..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${showFilters
                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {showFilters && (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 animate-fade-in">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        >
                            <option value="all">All Types</option>
                            <option value="new_order">New Order</option>
                            <option value="order_status">Order Status</option>
                            <option value="order_cancelled">Order Cancelled</option>
                            <option value="new_payment">Payment</option>
                            <option value="payment_failed">Payment Failed</option>
                            <option value="new_customer">New Customer</option>
                            <option value="new_inquiry">New Inquiry</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="system">System</option>
                            <option value="info">Info</option>
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                        <select
                            value={readFilter}
                            onChange={(e) => { setReadFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        >
                            <option value="all">All Status</option>
                            <option value="false">Unread</option>
                            <option value="true">Read</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Batch Actions */}
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 animate-fade-in">
                    <CheckCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        {selectedIds.length} selected
                    </span>
                    <div className="flex-1" />
                    <button
                        onClick={handleBatchRead}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
                    >
                        Mark Read
                    </button>
                    <button
                        onClick={() => setSelectedIds([])}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Notifications List + Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* List */}
                <div className="lg:col-span-2 space-y-1">
                    {/* Select all row */}
                    <div className="flex items-center gap-3 px-4 py-2">
                        <input
                            type="checkbox"
                            checked={notifications.length > 0 && selectedIds.length === notifications.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Select All ({notifications.length})
                        </span>
                        <div className="flex-1" />
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            Showing {notifications.length} of {total}
                        </span>
                    </div>

                    {loading && notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                                <Bell className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No notifications</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Click "Scan Activity" to generate notifications from recent orders & activity
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notification) => {
                                const tc = typeConfig[notification.type] || typeConfig.info;
                                const pc = priorityConfig[notification.priority] || priorityConfig.medium;
                                const Icon = tc.icon;
                                const isSelected = selectedIds.includes(notification.id);
                                const isActive = detailId === notification.id;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`group relative flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer
                      ${isActive
                                                ? 'bg-amber-50/80 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700 shadow-md'
                                                : notification.is_read
                                                    ? 'bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-amber-50/50 dark:hover:bg-amber-900/5 shadow-sm hover:shadow-md'
                                            }
                    `}
                                        onClick={() => {
                                            setDetailId(notification.id);
                                            if (!notification.is_read) handleRead(notification.id);
                                        }}
                                    >
                                        {/* Unread indicator */}
                                        {!notification.is_read && (
                                            <div className="absolute top-4 left-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        )}

                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => { e.stopPropagation(); handleSelect(notification.id); }}
                                            className="mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500 flex-shrink-0"
                                        />

                                        <div className={`p-2 rounded-xl ${tc.bg} flex-shrink-0`}>
                                            <Icon className={`w-5 h-5 ${tc.color}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`text-sm font-semibold truncate ${notification.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                                                    {timeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className={`text-xs mt-0.5 line-clamp-1 ${notification.is_read ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tc.bg} ${tc.color}`}>
                                                    {tc.label}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${pc.bg} ${pc.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                                                    {notification.priority}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quick actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRead(notification.id); }}
                                                    className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 px-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                                    const pageNum = start + i;
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${pageNum === page
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="hidden lg:block">
                    {detailNotification ? (
                        <div className="sticky top-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden animate-fade-in">
                            {/* Header */}
                            <div className={`p-5 ${typeConfig[detailNotification.type]?.bg || 'bg-slate-100 dark:bg-slate-800'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeConfig[detailNotification.type]?.bg} ${typeConfig[detailNotification.type]?.color}`}>
                                        {(() => { const Icon = typeConfig[detailNotification.type]?.icon || Info; return <Icon className="w-3.5 h-3.5" />; })()}
                                        {typeConfig[detailNotification.type]?.label || 'Info'}
                                    </span>
                                    <button
                                        onClick={() => setDetailId(null)}
                                        className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {detailNotification.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(detailNotification.created_at).toLocaleString('en-IN', {
                                        dateStyle: 'medium', timeStyle: 'short'
                                    })}
                                </p>
                            </div>

                            {/* Body */}
                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Message</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{detailNotification.message}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Priority</p>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${priorityConfig[detailNotification.priority]?.bg} ${priorityConfig[detailNotification.priority]?.color}`}>
                                            <span className={`w-2 h-2 rounded-full ${priorityConfig[detailNotification.priority]?.dot}`} />
                                            {detailNotification.priority.charAt(0).toUpperCase() + detailNotification.priority.slice(1)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${detailNotification.is_read
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                            }`}>
                                            {detailNotification.is_read ? <CheckCircle2 className="w-3 h-3" /> : <BellRing className="w-3 h-3" />}
                                            {detailNotification.is_read ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                </div>

                                {/* Metadata */}
                                {detailNotification.metadata && Object.keys(detailNotification.metadata).length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Details</p>
                                        <div className="space-y-1.5">
                                            {Object.entries(detailNotification.metadata).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-500 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-slate-800 dark:text-slate-200 font-medium">{String(value ?? 'N/A')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                                    <button
                                        onClick={() => handleNavigate(detailNotification)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Related
                                    </button>
                                    <div className="flex gap-2">
                                        {!detailNotification.is_read && (
                                            <button
                                                onClick={() => handleRead(detailNotification.id)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                                Mark Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(detailNotification.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="sticky top-24 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm p-10 flex flex-col items-center justify-center text-center">
                            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
                                <Eye className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select a notification</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click any notification to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
