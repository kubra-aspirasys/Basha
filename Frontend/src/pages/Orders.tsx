import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import CloseStoreModal from '@/components/CloseStoreModal';
import { useOrderStore } from '@/store/order-store';
import { useMenuStore } from '@/store/menu-store';
import { useCustomerStore } from '@/store/customer-store';
import { Search, Eye, Pencil, Trash2, X, Check, Clock, CheckCircle, Truck, Package, AlertCircle, MapPin, Store, Phone, Mail, User, Calendar, FileText, Activity, Plus, Minus, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Order } from '@/types';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { getImageUrl } from '@/utils/imageUtils';

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
  ready_for_pickup: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: Store,
    label: 'Ready for Pickup'
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
  const { orders, updateOrderStatus, deleteOrder, fetchOrders, createManualOrder, loading, storeActive, fetchStoreStatus, setStoreStatus } = useOrderStore();
  const { menuItems, fetchAllMenuItems } = useMenuStore();
  const { customers } = useCustomerStore();
  const [searchParams, setSearchParams] = useSearchParams();
  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get('limit') || '10'));

  const isManualType = (type: string) => ['takeaway', 'swiggy', 'zomato'].includes(type);

  const getVisibleStatuses = (type: string) => {
    if (isManualType(type)) {
      return ['confirmed', 'preparing', 'delivered', 'cancelled'];
    }
    return ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'];
  };

  // Filter states from URL
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>((searchParams.get('status') as Order['status'] | 'all') || 'all');
  const [typeFilter, setTypeFilter] = useState<Order['order_type'] | 'all'>((searchParams.get('type') as Order['order_type'] | 'all') || 'all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>((searchParams.get('date') as any) || 'all');
  const [customDateFrom, setCustomDateFrom] = useState(searchParams.get('from') || '');
  const [customDateTo, setCustomDateTo] = useState(searchParams.get('to') || '');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);
  const [editStatus, setEditStatus] = useState<Order['status']>('pending');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editOrderType, setEditOrderType] = useState<Order['order_type']>('takeaway');
  const [editItems, setEditItems] = useState<Array<{ menu_item_id: string; menu_item_name: string; quantity: number; price: number }>>([]);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [tempStatus, setTempStatus] = useState<Order['status']>('pending');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Manual Order Modal states
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [manualOrderType, setManualOrderType] = useState<Order['order_type']>('takeaway');
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualDeliveryAddress, setManualDeliveryAddress] = useState('');
  const [manualItems, setManualItems] = useState<Array<{ menu_item_id: string; menu_item_name: string; quantity: number; price: number }>>([]);
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [manualPlatformOrderId, setManualPlatformOrderId] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Sync state to URL params
  useEffect(() => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (currentPage > 1) params.page = currentPage.toString();
    if (itemsPerPage !== 10) params.limit = itemsPerPage.toString();
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (dateFilter !== 'all') params.date = dateFilter;
    if (customDateFrom) params.from = customDateFrom;
    if (customDateTo) params.to = customDateTo;

    setSearchParams(params);
  }, [searchTerm, currentPage, itemsPerPage, statusFilter, typeFilter, dateFilter, customDateFrom, customDateTo, setSearchParams]);

  useEffect(() => {
    fetchOrders();
    fetchStoreStatus();

    // 15s Polling for live updates
    const interval = setInterval(() => {
      fetchOrders();
      fetchStoreStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchOrders, fetchStoreStatus]);

  // Handle URL parameter to open specific order
  useEffect(() => {
    const openOrderId = searchParams.get('openOrder');
    if (openOrderId) {
      const order = orders.find(o => o.id === openOrderId);
      if (order) {
        setSelectedOrder(order);
        setViewMode('view');
        // Remove the parameter from URL after opening
        // Note: We should preserves other params!
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('openOrder');
        setSearchParams(newParams);
      }
    }
  }, [searchParams, orders, setSearchParams]);

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

  const handleInlineStatusEdit = (order: Order) => {
    setEditingStatus(order.id);
    setTempStatus(order.status);
  };

  const handleInlineStatusSave = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, tempStatus);
      setEditingStatus(null);
      toast.success('Order status updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update status');
      setEditingStatus(null);
    }
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

  const orderTypeConfig: Record<string, { bg: string; icon: React.ReactNode; label: string }> = {
    delivery: {
      bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
      icon: <MapPin className="w-3 h-3" />,
      label: 'Online'
    },
    pickup: {
      bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800',
      icon: <Store className="w-3 h-3" />,
      label: 'Pickup'
    },
    swiggy: {
      bg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
      icon: <ShoppingBag className="w-3 h-3" />,
      label: 'Swiggy'
    },
    zomato: {
      bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
      icon: <ShoppingBag className="w-3 h-3" />,
      label: 'Zomato'
    },
    takeaway: {
      bg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
      icon: <Package className="w-3 h-3" />,
      label: 'Walk in'
    }
  };

  const OrderTypeBadge = ({ orderType }: { orderType: Order['order_type'] }) => {
    const config = orderTypeConfig[orderType] || orderTypeConfig.delivery;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${config.bg}`}>
        {config.icon}
        <span>{config.label}</span>
      </div>
    );
  };

  const handleOpenManualOrder = () => {
    setShowManualOrder(true);
    setManualOrderType('takeaway');
    setManualCustomerName('');
    setManualCustomerPhone('');
    setManualDeliveryAddress('');
    setManualPlatformOrderId('');
    setManualItems([]);
    setMenuSearchTerm('');
    fetchAllMenuItems();
  };

  const handleAddMenuItem = (item: typeof menuItems[0]) => {
    setManualItems(prev => {
      const existing = prev.find(i => i.menu_item_id === item.id);
      if (existing) {
        return prev.map(i => i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menu_item_id: item.id, menu_item_name: item.name, quantity: 1, price: parseFloat(String(item.discounted_price || item.price)) }];
    });
  };

  const handleRemoveMenuItem = (menuItemId: string) => {
    setManualItems(prev => prev.filter(i => i.menu_item_id !== menuItemId));
  };

  const handleUpdateItemQty = (menuItemId: string, delta: number) => {
    setManualItems(prev => prev.map(i => {
      if (i.menu_item_id === menuItemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  const manualOrderSubtotal = manualItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const isManualFormValid = () => {
    if (manualItems.length === 0) return false;
    if (manualOrderType === 'takeaway') return !!manualCustomerPhone.trim();
    if (['swiggy', 'zomato'].includes(manualOrderType)) return !!manualPlatformOrderId.trim();
    return !!manualCustomerName.trim();
  };

  const handleSubmitManualOrder = async () => {
    if (!isManualFormValid()) return;
    setCreatingOrder(true);
    try {
      const finalCustomerName = manualCustomerName.trim() || (
        manualOrderType === 'takeaway' ? 'Walk in Customer' :
        manualOrderType === 'swiggy' ? 'Swiggy Customer' :
        manualOrderType === 'zomato' ? 'Zomato Customer' : 'Customer'
      );

      const result = await createManualOrder({
        customer_name: finalCustomerName,
        customer_phone: manualCustomerPhone.trim() || 'N/A',
        delivery_address: (['swiggy', 'zomato'].includes(manualOrderType) && manualPlatformOrderId.trim())
          ? `Platform Order ID: ${manualPlatformOrderId.trim()}`
          : manualDeliveryAddress.trim() || 'N/A',
        order_type: manualOrderType,
        items: manualItems,
        totals: {
          subtotal: manualOrderSubtotal,
          gst_amount: 0,
          delivery_charges: 0,
          service_charges: 0,
          total_amount: manualOrderSubtotal
        }
      });
      if (result) {
        setShowManualOrder(false);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingOrder(false);
    }
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
    setEditCustomerName(order.customer_name);
    setEditOrderType(order.order_type);
    
    // Convert current order items into editable format
    const editableItems = (order.items || []).map(item => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return {
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item_name,
        quantity: item.quantity,
        price: price
      };
    });
    setEditItems(editableItems);
    
    setViewMode('edit');
    fetchAllMenuItems(); // Ensure menu items are loaded so we can edit items
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    if (!editCustomerName.trim() || editItems.length === 0) {
        toast.error('Customer name and at least one item are required');
        return;
    }
    
    setIsUpdatingOrder(true);
    try {
      const payload = {
        customer_name: editCustomerName.trim(),
        order_type: editOrderType,
        status: editStatus,
        items: editItems
      };
      
      const { useOrderStore } = await import('@/store/order-store'); // or direct call depending on how it's destructured
      await useOrderStore.getState().updateOrder(selectedOrder.id, payload);
      
      toast.success('Order updated successfully');
      fetchOrders();
      setViewMode(null);
      setSelectedOrder(null);
    } catch (error: any) {
      // Error handled by store
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleEditUpdateItemQty = (menuItemId: string, delta: number) => {
    setEditItems(prev => prev.map(i => {
      if (i.menu_item_id === menuItemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }));
  };

  const handleEditRemoveMenuItem = (menuItemId: string) => {
    setEditItems(prev => prev.filter(i => i.menu_item_id !== menuItemId));
  };
  
  const handleEditAddMenuItem = (item: typeof menuItems[0]) => {
    setEditItems(prev => {
      const existing = prev.find(i => i.menu_item_id === item.id);
      if (existing) {
        return prev.map(i => i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menu_item_id: item.id, menu_item_name: item.name, quantity: 1, price: parseFloat(String(item.discounted_price || item.price)) }];
    });
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setViewMode(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Orders</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage and track customer orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
          <div
            className={`flex items-center justify-between sm:justify-start gap-3 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border-2 transition-all duration-300 shadow-sm backdrop-blur-sm w-full sm:w-auto ${storeActive
                ? 'bg-green-50/80 border-green-200 dark:bg-green-900/20 dark:border-green-800/50'
                : 'bg-red-50/80 border-red-200 dark:bg-red-900/20 dark:border-red-800/50'
              }`}
          >
            <div className={`relative flex items-center justify-center w-2.5 h-2.5 rounded-full flex-shrink-0 ${storeActive ? 'bg-green-500' : 'bg-red-500'}`}>
              {storeActive && <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75 duration-1000" />}
            </div>
            <span className={`text-sm font-bold tracking-wide uppercase whitespace-nowrap ${storeActive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {storeActive ? 'Accepting Orders' : 'Store Closed'}
            </span>
            <div className="pl-2 ml-auto sm:ml-1 border-l border-slate-300 dark:border-slate-600 flex items-center">
              <Switch
                checked={storeActive}
                onCheckedChange={async (checked) => {
                  try {
                    if (checked) {
                      await setStoreStatus(true, '');
                      toast.success('Store is now open for orders');
                    } else {
                      setIsCloseModalOpen(true);
                    }
                  } catch {
                    toast.error('Failed to change store status');
                  }
                }}
                className={storeActive ? '!bg-green-500' : '!bg-red-500'}
              />
            </div>
          </div>
          <CloseStoreModal
            isOpen={isCloseModalOpen}
            onClose={() => setIsCloseModalOpen(false)}
            onConfirm={async (reason) => {
              try {
                await setStoreStatus(false, reason);
                toast.success('Store is now closed');
              } catch {
                toast.error('Failed to change store status');
              } finally {
                setIsCloseModalOpen(false);
              }
            }}
          />

          <button
            onClick={handleOpenManualOrder}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Manual Order</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
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
                  <option value="ready_for_pickup">Ready for Pickup</option>
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
                  <option value="delivery">Online</option>
                  <option value="swiggy">Swiggy</option>
                  <option value="zomato">Zomato</option>
                  <option value="takeaway">Walk in</option>
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
                  Type: {orderTypeConfig[typeFilter]?.label || typeFilter}
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
                                {getVisibleStatuses(order.order_type).map(status => (
                                  <option key={status} value={status}>
                                    {statusConfig[status as keyof typeof statusConfig]?.label || status}
                                  </option>
                                ))}
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
                            {getVisibleStatuses(order.order_type).map(status => (
                              <option key={status} value={status}>
                                {statusConfig[status as keyof typeof statusConfig]?.label || status}
                              </option>
                            ))}
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
                          {(viewMode === 'edit' ? editCustomerName : selectedOrder.customer_name).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          {viewMode === 'edit' ? (
                            <input
                              type="text"
                              value={editCustomerName}
                              onChange={(e) => setEditCustomerName(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-1"
                              placeholder="Customer Name"
                            />
                          ) : (
                            <p className="font-semibold text-slate-900 dark:text-white text-lg">{selectedOrder.customer_name}</p>
                          )}
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
                      {viewMode === 'edit' ? (
                        <select
                          value={editOrderType}
                          onChange={(e) => setEditOrderType(e.target.value as Order['order_type'])}
                          className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-1"
                        >
                          <option value="pickup">Pickup</option>
                          <option value="delivery">Online</option>
                          <option value="swiggy">Swiggy</option>
                          <option value="zomato">Zomato</option>
                          <option value="takeaway">Walk in</option>
                        </select>
                      ) : (
                        <OrderTypeBadge orderType={selectedOrder.order_type} />
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm mt-0.5">
                        {(viewMode === 'edit' ? editOrderType : selectedOrder.order_type) === 'delivery' ? (
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
                      {(viewMode === 'edit' ? editItems : (selectedOrder.items || [])).map((item, idx) => {
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
                              {viewMode === 'edit' ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleEditUpdateItemQty(item.menu_item_id, -1)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                                  <button
                                    onClick={() => handleEditUpdateItemQty(item.menu_item_id, 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleEditRemoveMenuItem(item.menu_item_id)}
                                    className="w-6 h-6 ml-1 flex items-center justify-center rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                  {item.quantity} {menuItem?.unit_type || 'units'}
                                </span>
                              )}
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
                {viewMode === 'edit' && (
                  <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Search & Add Items</h4>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={menuSearchTerm}
                        onChange={e => setMenuSearchTerm(e.target.value)}
                        placeholder="Search to add items..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {menuSearchTerm && (
                      <div className="max-h-40 overflow-y-auto pr-1">
                        {menuItems.filter(item => item.is_available && item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())).slice(0, 10).map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg border-b border-slate-100 dark:border-slate-700 last:border-0 border-x-0 border-t-0 border-solid">
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                              <p className="text-xs text-amber-600 dark:text-amber-400">₹{parseFloat(String(item.discounted_price || item.price)).toLocaleString()}</p>
                            </div>
                            <button
                              onClick={() => { handleEditAddMenuItem(item); setMenuSearchTerm(''); }}
                              className="px-3 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Status Update (Left side) */}
                <div className="w-full lg:flex-1">
                  {viewMode === 'edit' ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Update Order</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-6 opacity-80 max-w-md">
                        Review customer details, items, and status. Save changes to update the order. Notification will be sent automatically.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 relative w-full sm:w-auto">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as Order['status'])}
                            className="w-full appearance-none pl-4 pr-10 py-3 border border-blue-200 dark:border-blue-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-sm font-medium"
                          >
                            {selectedOrder && getVisibleStatuses(editOrderType).map(status => (
                              <option key={status} value={status}>
                                {statusConfig[status as keyof typeof statusConfig]?.label || status}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                          </div>
                        </div>
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
                  {(() => {
                    const subtotal = viewMode === 'edit' 
                      ? editItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
                      : (selectedOrder.subtotal || 0);
                    const deliveryCharges = viewMode === 'edit'
                      ? (editOrderType === 'delivery' ? 50 : 0)
                      : (selectedOrder.delivery_charges || 0);
                    const serviceCharges = viewMode === 'edit'
                      ? 0
                      : (selectedOrder.service_charges || 0);
                    const gstAmount = viewMode === 'edit'
                      ? (subtotal + deliveryCharges + serviceCharges) * 0.18
                      : (selectedOrder.gst_amount || 0);

                    const oldTaxable = parseFloat(String(selectedOrder.subtotal || 0)) + parseFloat(String(selectedOrder.delivery_charges || 0)) + parseFloat(String(selectedOrder.service_charges || 0));
                    const oldGst = parseFloat(String(selectedOrder.gst_amount || 0));
                    const oldExpectedTotal = oldTaxable + oldGst;
                    const existingDiscount = oldExpectedTotal > parseFloat(String(selectedOrder.total_amount || 0)) ? oldExpectedTotal - parseFloat(String(selectedOrder.total_amount || 0)) : 0;

                    let totalAmount = viewMode === 'edit'
                      ? (subtotal + deliveryCharges + serviceCharges + gstAmount - existingDiscount)
                      : selectedOrder.total_amount;
                      
                    if (totalAmount < 0) totalAmount = 0;

                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Subtotal</span>
                          <span className="font-medium">₹{subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                        {deliveryCharges > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Delivery Charges</span>
                            <span className="font-medium">₹{deliveryCharges.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {gstAmount > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>GST (18%)</span>
                            <span className="font-medium">₹{gstAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {serviceCharges > 0 && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Service Charges</span>
                            <span className="font-medium">₹{serviceCharges.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {existingDiscount > 0 && viewMode === 'edit' && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>Discount</span>
                            <span className="font-medium">-₹{existingDiscount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="border-t-2 border-slate-200 dark:border-slate-700 my-2 pt-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-slate-900 dark:text-white">Total Amount</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            ₹{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-xs text-slate-400">Including all taxes</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>

            {/* Sticky Action Footer for Edit Mode */}
            {viewMode === 'edit' && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 sticky bottom-0 z-10 w-full">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-300 dark:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  disabled={isUpdatingOrder}
                  onClick={handleUpdateOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-lg shadow-md transition-all flex items-center justify-center min-w-[140px]"
                >
                  {isUpdatingOrder ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        , document.body)}

      {/* Manual Order Modal */}
      {showManualOrder && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">

            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add Manual Order
                </h2>
                <p className="text-amber-100 text-sm mt-0.5">Create a new order for Swiggy, Zomato, or Walk in</p>
              </div>
              <button
                onClick={() => setShowManualOrder(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Order Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Order Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['swiggy', 'zomato', 'takeaway'] as Order['order_type'][]).map(type => {
                    const config = orderTypeConfig[type];
                    const isSelected = manualOrderType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setManualOrderType(type)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                          ? type === 'swiggy' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md scale-105'
                            : type === 'zomato' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md scale-105'
                              : type === 'takeaway' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-md scale-105'
                                : type === 'pickup' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md scale-105'
                                  : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md scale-105'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-700'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${type === 'swiggy' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : type === 'zomato' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            : type === 'takeaway' ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                              : type === 'pickup' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                          {config.icon}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Customer Name {!['takeaway', 'swiggy', 'zomato'].includes(manualOrderType) && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={manualCustomerName}
                      onChange={e => setManualCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone {manualOrderType === 'takeaway' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={manualCustomerPhone}
                      onChange={e => setManualCustomerPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Platform Order ID — Swiggy / Zomato only */}
              {(['swiggy', 'zomato'] as Order['order_type'][]).includes(manualOrderType) && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Platform Order ID <span className="text-red-500">*</span>
                    <span className="ml-1.5 text-xs font-normal text-slate-400">(from Swiggy / Zomato app)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={manualPlatformOrderId}
                      onChange={e => setManualPlatformOrderId(e.target.value)}
                      placeholder={`Enter ${manualOrderType === 'swiggy' ? 'Swiggy' : 'Zomato'} order ID`}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Menu Items Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Add Items <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={menuSearchTerm}
                    onChange={e => setMenuSearchTerm(e.target.value)}
                    placeholder="Search menu items..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                </div>

                {/* Card grid */}
                <div className="max-h-64 overflow-y-auto pr-1">
                  {(() => {
                    const filtered = menuItems.filter(
                      item => item.is_available && item.name.toLowerCase().includes(menuSearchTerm.toLowerCase())
                    ).slice(0, 100);
                    if (filtered.length === 0) return (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
                        <Search className="w-8 h-8 mb-2 opacity-40" />
                        <p className="text-sm">No items found</p>
                      </div>
                    );
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {filtered.map(item => {
                          const cartItem = manualItems.find(i => i.menu_item_id === item.id);
                          const qty = cartItem?.quantity ?? 0;
                          const imgUrl = getImageUrl(item.image_url);
                          return (
                            <div
                              key={item.id}
                              className={`relative group rounded-xl border-2 overflow-hidden transition-all duration-200 bg-white dark:bg-slate-800 ${qty > 0
                                ? 'border-amber-400 dark:border-amber-500 shadow-md shadow-amber-100 dark:shadow-amber-900/20'
                                : 'border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-600'
                                }`}
                            >
                              {/* Image */}
                              <div className="relative h-24 bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={e => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <UtensilsCrossed className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                  </div>
                                )}
                                {/* Veg / Non-veg dot */}
                                <div className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.is_vegetarian ? 'border-green-600 bg-white' : 'border-red-600 bg-white'}`}>
                                  <div className={`w-2 h-2 rounded-full ${item.is_vegetarian ? 'bg-green-600' : 'bg-red-600'}`} />
                                </div>
                                {/* Qty badge */}
                                {qty > 0 && (
                                  <div className="absolute top-1.5 right-1.5 min-w-[20px] h-5 px-1 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow">
                                    {qty}
                                  </div>
                                )}
                              </div>

                              {/* Info + controls */}
                              <div className="p-2">
                                <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight line-clamp-2 mb-1" title={item.name}>
                                  {item.name}
                                </p>
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                                  ₹{parseFloat(String(item.discounted_price || item.price)).toLocaleString()}
                                </p>

                                {qty === 0 ? (
                                  <button
                                    onClick={() => handleAddMenuItem(item)}
                                    className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-between gap-1">
                                    <button
                                      onClick={() => handleUpdateItemQty(item.id, -1)}
                                      className="flex-1 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center justify-center"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-7 text-center text-sm font-black text-slate-900 dark:text-white">{qty}</span>
                                    <button
                                      onClick={() => handleAddMenuItem(item)}
                                      className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Selected Items Cart */}
              {manualItems.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Order Summary
                    <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-bold">
                      {manualItems.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </label>
                  <div className="space-y-2">
                    {manualItems.map(item => {
                      const menuItem = menuItems.find(m => m.id === item.menu_item_id);
                      const imgUrl = getImageUrl(menuItem?.image_url);
                      return (
                        <div key={item.menu_item_id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-600">
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-600">
                            {imgUrl ? (
                              <img src={imgUrl} alt={item.menu_item_name} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                              </div>
                            )}
                          </div>
                          {/* Name & price */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.menu_item_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">₹{item.price.toLocaleString()} × {item.quantity}</p>
                          </div>
                          {/* Qty controls */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateItemQty(item.menu_item_id, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-sm font-black text-slate-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => handleAddMenuItem(menuItems.find(m => m.id === item.menu_item_id)!)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveMenuItem(item.menu_item_id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {/* Line total */}
                          <div className="text-right min-w-[52px]">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-between items-center px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subtotal</span>
                    <span className="text-xl font-black text-amber-700 dark:text-amber-400">₹{manualOrderSubtotal.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <button
                onClick={() => setShowManualOrder(false)}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitManualOrder}
                disabled={!isManualFormValid() || creatingOrder}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {creatingOrder ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><Check className="w-4 h-4" /> Create Order</>
                )}
              </button>
            </div>
          </div>
        </div>
        , document.body)}
    </div>
  );
}
