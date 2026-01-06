import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricsCard from '@/components/MetricsCard';
import { useOrderStore } from '@/store/order-store';
import { useCustomerStore } from '@/store/customer-store';
import { usePaymentStore } from '@/store/payment-store';
import { useMenuStore } from '@/store/menu-store';
import { useInquiryStore } from '@/store/inquiry-store';
import { Users, ShoppingBag, DollarSign, UtensilsCrossed, TrendingUp, Clock, CheckCircle, Package, Truck, AlertCircle, Plus, Calendar, ChefHat, MessageSquare, Phone, Mail } from 'lucide-react';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const orders = useOrderStore((state) => state.orders);
  const customers = useCustomerStore((state) => state.customers);
  const payments = usePaymentStore((state) => state.payments);
  const menuItems = useMenuStore((state) => state.menuItems);
  const inquiries = useInquiryStore((state) => state.inquiries);

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const recentOrders = useMemo(() =>
    orders
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [orders]
  );

  const recentInquiries = useMemo(() =>
    inquiries
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5),
    [inquiries]
  );

  const salesData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const dayOrders = orders.filter((o) => {
        const orderDate = o.created_at.split('T')[0];
        return orderDate === date;
      });
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total_amount, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length,
      };
    });
  }, [orders]);

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1);

  const ordersByStatus = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    preparing: orders.filter((o) => o.status === 'preparing').length,
    out_for_delivery: orders.filter((o) => o.status === 'out_for_delivery').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const ordersByType = {
    pickup: orders.filter((o) => o.order_type === 'pickup').length,
    delivery: orders.filter((o) => o.order_type === 'delivery').length,
  };

  // Today's metrics - Using 2025-10-01 for demo purposes
  const today = '2025-10-01';
  const todayOrders = orders.filter(order => order.created_at.startsWith(today));
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const newCustomersToday = customers.filter(customer =>
    customer.created_at.startsWith(today)
  ).length;

  // Top selling items
  const itemSales = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      acc[item.menu_item_id] = (acc[item.menu_item_id] || 0) + item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topSellingItems = Object.entries(itemSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([itemId, quantity]) => {
      const item = menuItems.find(m => m.id === itemId);
      return { ...item, totalSold: quantity };
    })
    .filter(Boolean);

  // Delivery vs Pickup ratio
  const totalOrders = orders.length;
  const deliveryRatio = totalOrders > 0 ? (ordersByType.delivery / totalOrders * 100).toFixed(1) : '0';
  const pickupRatio = totalOrders > 0 ? (ordersByType.pickup / totalOrders * 100).toFixed(1) : '0';

  // Pending payments (assuming failed payments)
  const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

  // Expired offers (assuming we have offers with expiry dates)
  // const todayDate = new Date();
  // const expiredOffers = []; // This would come from an offers store if available

  const getOrderItemImages = (orderItems: typeof orders[0]['items']) => {
    return orderItems
      .slice(0, 3)
      .map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
        return menuItem?.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100';
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Overview of your restaurant management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Customers"
          value={customers.length}
          icon={Users}
          trend={{ value: '8% from last month', positive: true }}
          onClick={() => navigate('/admin/users')}
        />
        <MetricsCard
          title="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          trend={{ value: '12% from last month', positive: true }}
          onClick={() => navigate('/admin/orders')}
        />
        <MetricsCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: '15% from last month', positive: true }}
          onClick={() => navigate('/admin/payments')}
        />
        <MetricsCard
          title="Menu Items"
          value={menuItems.length}
          icon={UtensilsCrossed}
          onClick={() => navigate('/admin/menu')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="p-3 bg-blue-500 text-white rounded-lg group-hover:bg-blue-600 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 dark:text-white">Create New Order</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Direct order creation</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/menu')}
            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="p-3 bg-green-500 text-white rounded-lg group-hover:bg-green-600 transition-colors">
              <ChefHat className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 dark:text-white">Add Menu Item</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Quick menu addition</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/orders')}
            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            <div className="p-3 bg-purple-500 text-white rounded-lg group-hover:bg-purple-600 transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-slate-900 dark:text-white">View Today's Schedule</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Daily operations</p>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Today's Schedule</h3>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {todayOrders.length} orders today
          </span>
        </div>

        {todayOrders.length > 0 ? (
          <div className="space-y-3">
            {todayOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              const customer = customers.find(c => c.id === order.customer_id);
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/admin/orders?openOrder=${order.id}`)}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${statusConfig[order.status].color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{order.order_number}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{order.customer_name}</p>
                      {customer && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            📞 {customer.phone}
                          </span>
                          {customer.email && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ✉️ {customer.email}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">₹{order.total_amount}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Click to view details
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No orders scheduled for today</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gold-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sales Overview (Last 7 Days)</h3>
          </div>
          <div className="space-y-4">
            {salesData.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{day.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 dark:text-slate-400">{day.orders} orders</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{day.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-500/80 rounded-full transition-all duration-500"
                    style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">7-Day Total</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                ₹{salesData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(ordersByStatus).map(([status, count]) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              const IconComponent = config.icon;

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${config.color}`}>
                      <IconComponent className="w-3 h-3" />
                      <span>{config.label}</span>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Orders by Type</h3>
          <div className="space-y-3">
            {Object.entries(ordersByType).map(([type, count]) => {
              const isDelivery = type === 'delivery';
              const color = isDelivery
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
              const IconComponent = isDelivery ? Truck : Package;

              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${color}`}>
                      <IconComponent className="w-3 h-3" />
                      <span className="capitalize">{type}</span>
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{todayRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingOrders}</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">New Customers</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{newCustomersToday}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Payments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingPayments}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Business Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Top Selling Items</h3>
          <div className="space-y-4">
            {topSellingItems.length > 0 ? (
              topSellingItems.map((item, index) => (
                <div key={item?.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gold-100 dark:bg-gold-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gold-600 dark:text-gold-400">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item?.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">₹{item?.price}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">{item?.totalSold} sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Service Preference */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Service Preference</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Delivery</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{ordersByType.delivery} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{deliveryRatio}%</p>
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${deliveryRatio}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Pickup</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{ordersByType.pickup} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{pickupRatio}%</p>
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pickupRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Recent Orders</h3>
        <div className="space-y-4">
          {recentOrders.map((order) => {
            const itemImages = getOrderItemImages(order.items);
            const customer = customers.find(c => c.id === order.customer_id);
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/admin/orders?openOrder=${order.id}`)}
                className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer hover:shadow-md"
              >
                <div className="flex -space-x-2">
                  {itemImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Order item"
                      className="w-12 h-12 rounded-lg object-cover border-2 border-white dark:border-slate-800"
                    />
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-12 h-12 rounded-lg bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      #{order.order_number}
                    </h4>
                    {(() => {
                      const config = statusConfig[order.status];
                      const IconComponent = config.icon;
                      return (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}>
                          <IconComponent className="w-3 h-3" />
                          <span>{config.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {order.customer_name} • {order.items.length} items
                  </p>
                  {customer && (
                    <div className="flex items-center gap-3 mt-1">
                      {customer.phone && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          📞 {customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ✉️ {customer.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    ₹{order.total_amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Click to view
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Inquiries & Quotes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Inquiries & Quotes</h3>
          <button
            onClick={() => navigate('/admin/inquiries')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentInquiries.length > 0 ? (
            recentInquiries.map((inquiry) => {
              const priorityColors = {
                low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
                medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
              };

              const statusColors = {
                new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                quoted: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                converted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
                lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
              };

              return (
                <div
                  key={inquiry.id}
                  onClick={() => navigate(`/admin/inquiries?openInquiry=${inquiry.id}`)}
                  className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer hover:shadow-md"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {inquiry.full_name}
                      </h4>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${statusColors[inquiry.status]}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[inquiry.priority]}`}>
                        {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {inquiry.event_type} • {inquiry.guest_count} guests
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{inquiry.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{inquiry.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{inquiry.event_date ? new Date(inquiry.event_date).toLocaleDateString() : 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {inquiry.quote_amount && (
                      <div className="text-lg font-bold text-slate-900 dark:text-white">
                        ₹{inquiry.quote_amount.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Click to view
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No recent inquiries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
