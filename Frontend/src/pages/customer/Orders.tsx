
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/store/order-store';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrency } from '@/utils/orderCalculations';
import { ShoppingBag, Clock, MapPin, Package } from 'lucide-react';

export default function Orders() {
    const navigate = useNavigate();
    const { orders, fetchOrders, loading } = useOrderStore();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const myOrders = orders.filter(order => {
        // If user is authenticated, filter by user ID
        // If order has no customer_id (guest), we currently don't track it here properly for guests
        // unless we save order IDs in localStorage. For now, strictly match user ID.
        if (isAuthenticated && user?.id) {
            return order.customer_id === user.id;
        }
        return false;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-2xl text-center">
                    <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-2xl p-12 shadow-2xl">
                        <div className="w-20 h-20 bg-[#F2A900]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-[#F2A900]" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Login to View Orders</h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Please log in to your account to view your order history and track current orders.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 bg-[#F2A900] hover:bg-[#D99700] text-black font-bold uppercase tracking-wider rounded-lg transition-colors"
                        >
                            Login Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#F2A900]/10 rounded-xl">
                        <Package className="w-8 h-8 text-[#F2A900]" />
                    </div>
                    <h1 className="text-4xl font-display font-extrabold text-white uppercase tracking-wider">
                        My Orders
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F2A900]"></div>
                    </div>
                ) : myOrders.length === 0 ? (
                    <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-2xl p-12 text-center shadow-xl">
                        <div className="w-20 h-20 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Past Orders</h3>
                        <p className="text-gray-400 mb-8">You haven't placed any orders yet. Time to order something delicious!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-[#F2A900] hover:bg-[#D99700] text-black font-bold uppercase tracking-wider rounded-lg transition-all hover:scale-105 shadow-lg shadow-[#F2A900]/20"
                        >
                            Browse Menu
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {myOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-[#1a1a1a] border border-[#F2A900]/20 rounded-2xl overflow-hidden hover:border-[#F2A900]/50 transition-all duration-300 group shadow-lg"
                            >
                                {/* Header */}
                                <div className="p-6 border-b border-[#2a2a2a] bg-[#1f1f1f]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[#F2A900] font-mono font-bold text-lg">#{order.order_number}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${order.status === 'delivered' ? 'bg-green-900/20 text-green-400 border-green-900/50' :
                                                order.status === 'cancelled' ? 'bg-red-900/20 text-red-400 border-red-900/50' :
                                                    'bg-blue-900/20 text-blue-400 border-blue-900/50'
                                                }`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-400 text-sm gap-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {order.order_type === 'delivery' ? 'Delivery' : 'Pickup'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-2xl font-bold text-white">{formatCurrency(order.total_amount)}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm border-b border-[#2a2a2a] last:border-0 pb-3 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 flex items-center justify-center bg-[#2a2a2a] text-[#F2A900] rounded font-bold text-xs">
                                                        {item.quantity}x
                                                    </span>
                                                    <span className="text-gray-200 font-medium">{item.menu_item_name}</span>
                                                </div>
                                                <span className="text-gray-400 font-mono">{formatCurrency(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Delivery Address if applicable */}
                                    {order.order_type === 'delivery' && order.delivery_address && (
                                        <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Delivery Address</p>
                                            <p className="text-gray-300 text-sm">{order.delivery_address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
