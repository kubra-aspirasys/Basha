import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useOrderStore } from '@/store/order-store';
import { useMenuStore } from '@/store/menu-store';
import { useCustomerStore } from '@/store/customer-store';
import { Search, Eye, Pencil, Trash2, X, Check, Clock, CheckCircle, Truck, Package, AlertCircle, MapPin, Store, Phone, Mail, User, Calendar, FileText, Activity } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Order } from '@/types';

const statusConfig = {
  pending: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock,
    label: 'Pending'
  },
  confirmed: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: CheckCircle,
    label: 'Confirmed'
  },
  preparing: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    icon: Package,
    label: 'Preparing'
  },
  out_for_delivery: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    icon: Truck,
    label: 'Out for Delivery'
  },
  delivered: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    icon: CheckCircle,
    label: 'Delivered'
  },
  cancelled: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    icon: AlertCircle,
    label: 'Cancelled'
  },
};

export default function Orders() {
  const { orders, updateOrderStatus, deleteOrder, fetchOrders, loading } = useOrderStore();
  const { menuItems } = useMenuStore();
  const { customers } = useCustomerStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);
  const [editStatus, setEditStatus] = useState<Order['status']>('pending');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();

    // 15s Polling for live updates
    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Handle URL parameter to open specific order
  useEffect(() => {
    const openOrderId = searchParams.get('openOrder');
    if (openOrderId) {
      const order = orders.find(o => o.id === openOrderId);
      if (order) {
        setSelectedOrder(order);
        setViewMode('view');
        // Remove the parameter from URL after opening
        setSearchParams({});
      }
    }
  }, [searchParams, orders, setSearchParams]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<Order['order_type'] | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [tempStatus, setTempStatus] = useState<Order['status']>('pending');

  // Date filtering helper
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return { from: today, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { from: weekStart, to: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { from: monthStart, to: monthEnd };
      case 'custom':
        return {
          from: customDateFrom ? new Date(customDateFrom) : null,
          to: customDateTo ? new Date(customDateTo) : null
        };
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Type filter
    const matchesType = typeFilter === 'all' || order.order_type === typeFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const dateStr = order.created_at || order.createdAt;
        if (dateStr) {
          const orderDate = new Date(dateStr);
          if (dateRange.from && orderDate < dateRange.from) matchesDate = false;
          if (dateRange.to && orderDate >= dateRange.to) matchesDate = false;
        } else {
          matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getMenuItemDetails = (menuItemId: string) => {
    return menuItems.find((item) => item.id === menuItemId);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    setViewMode(null);
    setSelectedOrder(null);
  };

  const handleInlineStatusEdit = (order: Order) => {
    setEditingStatus(order.id);
    setTempStatus(order.status);
  };

  const handleInlineStatusSave = (orderId: string) => {
    updateOrderStatus(orderId, tempStatus);
    setEditingStatus(null);
  };

  const handleInlineStatusCancel = () => {
    setEditingStatus(null);
    setTempStatus('pending');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const clearAllFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setDateFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const StatusBadge = ({ status, onClick, isEditable = false }: { status: Order['status'], onClick?: () => void, isEditable?: boolean }) => {
    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-300 ${config.color} ${isEditable ? 'cursor-pointer hover:scale-105 hover:shadow-lg hover:border-opacity-80 group' : ''
          }`}
        onClick={onClick}
        title={isEditable ? "Click to edit status" : ""}
      >
        <IconComponent className="w-4 h-4" />
        <span>{config.label}</span>
        {isEditable && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Pencil className="w-3 h-3" />
          </div>
        )}
      </div>
    );
  };

  const OrderTypeBadge = ({ orderType }: { orderType: Order['order_type'] }) => {
    const isDelivery = orderType === 'delivery';
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isDelivery
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
        }`}>
        {isDelivery ? <MapPin className="w-3 h-3" /> : <Store className="w-3 h-3" />}
        <span className="capitalize">{orderType}</span>
      </div>
    );
  };

  const handleDelete = (orderId: string, orderNumber: string) => {
    if (confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
      deleteOrder(orderId);
    }
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setViewMode('view');
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setViewMode('edit');
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setViewMode(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Orders</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Manage and track customer orders
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex-1 sm:flex-none"
              >
                Filters
              </button>
              {(statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-1 sm:flex-none"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Order Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as Order['order_type'] | 'all')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>
          )}

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
              {(statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
                <span className="text-slate-500 dark:text-slate-500"> (filtered)</span>
              )}
            </span>
          </div>

          {/* Active Filters Summary */}
          {(statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all') && (
            <div className="flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                  Status: {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm">
                  Type: {typeFilter === 'pickup' ? 'Pickup' : 'Delivery'}
                  <button
                    onClick={() => setTypeFilter('all')}
                    className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {dateFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm">
                  Date: {dateFilter === 'custom' ? 'Custom Range' : dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                  <button
                    onClick={() => setDateFilter('all')}
                    className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {loading && !orders.length ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-300">Loading orders...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                      Status
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">(Click to edit)</span>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 border-b border-slate-200 dark:border-slate-700">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{order.order_number}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{order.customer_name}</td>
                      <td className="px-6 py-4">
                        <OrderTypeBadge orderType={order.order_type} />
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {(order.items || []).map((item, idx) => {
                          const menuItem = getMenuItemDetails(item.menu_item_id);
                          return (
                            <div key={idx} className="text-sm">
                              {item.quantity} {menuItem?.unit_type || 'x'} {item.menu_item_name}
                            </div>
                          );
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">₹{order.total_amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {editingStatus === order.id ? (
                          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-md">
                            <div className="relative">
                              <select
                                value={tempStatus}
                                onChange={(e) => setTempStatus(e.target.value as Order['status'])}
                                className="appearance-none px-4 py-2.5 pr-10 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleInlineStatusSave(order.id)}
                                className="p-2.5 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                                title="Save Changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleInlineStatusCancel}
                                className="p-2.5 text-white bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 rounded-xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <StatusBadge
                            status={order.status}
                            onClick={() => handleInlineStatusEdit(order)}
                            isEditable={true}
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(order)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(order)}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                            title="Edit Order"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id, order.order_number)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Header with Order Number and Type */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{order.order_number}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{order.customer_name}</p>
                      </div>
                      <OrderTypeBadge orderType={order.order_type} />
                    </div>

                    {/* Items List */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Items:</h4>
                      <div className="space-y-1">
                        {(order.items || []).map((item, idx) => {
                          const menuItem = getMenuItemDetails(item.menu_item_id);
                          return (
                            <div key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                              {item.quantity} {menuItem?.unit_type || 'x'} {item.menu_item_name}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Amount and Date */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">₹{order.total_amount.toLocaleString()}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Status Section */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status:</h4>
                      {editingStatus === order.id ? (
                        <div className="space-y-3">
                          <select
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value as Order['status'])}
                            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleInlineStatusSave(order.id)}
                              className="flex-1 px-3 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={handleInlineStatusCancel}
                              className="flex-1 px-3 py-2 text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleInlineStatusEdit(order)}
                          className="cursor-pointer"
                        >
                          <StatusBadge status={order.status} isEditable={true} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleView(order)}
                        className="flex-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(order)}
                        className="flex-1 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(order.id, order.order_number)}
                        className="flex-1 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}

        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="orders"
          />
        )}
      </div>

      {selectedOrder && viewMode && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">

            {/* Modal Header */}
            <div className="px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {viewMode === 'view' ? 'Order Details' : 'Edit Order'}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {selectedOrder.order_number}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Placed on {new Date(selectedOrder.created_at || selectedOrder.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Customer Info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl shadow-sm">
                        {selectedOrder.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-lg">{selectedOrder.customer_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {selectedOrder.customer_id ? selectedOrder.customer_id.substring(0, 8) : 'N/A'}</p>
                      </div>
                    </div>

                    {(() => {
                      const customer = customers.find(c => c.id === selectedOrder.customer_id);
                      return customer ? (
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                          {customer.phone && (
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                              <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span className="font-medium">{customer.phone}</span>
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                              <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-900/50 transition-colors">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {selectedOrder.order_type === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <OrderTypeBadge orderType={selectedOrder.order_type} />
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm mt-0.5">
                        {selectedOrder.order_type === 'delivery' ? (
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {selectedOrder.delivery_address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col hover:border-amber-200 dark:hover:border-amber-900/50 transition-colors">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Order Status
                  </h3>
                  <div className="flex-1 flex flex-col justify-center items-center gap-6">
                    <div className="scale-125">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                    {viewMode !== 'edit' && (
                      <div className="text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">Last Updated</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {new Date(selectedOrder.updated_at || selectedOrder.updatedAt || Date.now()).toLocaleString()}
                        </p>
                        <button onClick={() => setViewMode('edit')} className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto">
                          <Pencil className="w-3 h-3" /> Change Status
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-400" /> Order Items
                </h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Details</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {(selectedOrder.items || []).map((item, idx) => {
                        const menuItem = getMenuItemDetails(item.menu_item_id);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                  <Store className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-white">{item.menu_item_name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{menuItem?.category_id || 'Main Course'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                {item.quantity} {menuItem?.unit_type || 'units'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                              ₹{item.price.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                              ₹{(item.quantity * item.price).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Section */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Status Update (Left side) */}
                <div className="w-full lg:flex-1">
                  {viewMode === 'edit' ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Update Order Status</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-6 opacity-80 max-w-md">
                        Change the status of this order to keep the customer informed. Notification will be sent automatically.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 relative w-full sm:w-auto">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                            className="w-full appearance-none pl-4 pr-10 py-3 border border-blue-200 dark:border-blue-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-sm font-medium"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleStatusChange(selectedOrder.id, editStatus)}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={closeModal}
                            className="sm:hidden flex-1 px-4 py-3 bg-white border border-blue-200 text-blue-900 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-start sm:justify-end">
                        <button onClick={closeModal} className="hidden sm:block text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline">
                          Cancel changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-6 border border-slate-100 dark:border-slate-700 h-full flex items-center justify-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic text-center">
                        "Customer satisfaction is our priority. Ensure timely delivery."
                      </p>
                    </div>
                  )}
                </div>

                {/* Bill Summary (Right side) */}
                <div className="w-full lg:w-96 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <FileText className="w-5 h-5 text-slate-400" /> Bill Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-medium">₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                    </div>
                    {selectedOrder.delivery_charges > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Delivery Charges</span>
                        <span className="font-medium">₹{selectedOrder.delivery_charges.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.gst_amount > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>GST (18%)</span>
                        <span className="font-medium">₹{selectedOrder.gst_amount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedOrder.service_charges > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Service Charges</span>
                        <span className="font-medium">₹{selectedOrder.service_charges.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-slate-200 dark:border-slate-700 my-2 pt-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">Total Amount</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        ₹{selectedOrder.total_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-xs text-slate-400">Including all taxes</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        , document.body)}
    </div>
  );
}
