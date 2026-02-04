import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart-store';
import { useOrderStore } from '@/store/order-store';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';

import { calculateOrderTotal, formatCurrency } from '@/utils/orderCalculations';
import { Pencil, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, fetchCart, isLoading } = useCartStore();
  const { createOrder } = useOrderStore();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('delivery');
  const [isPlacing, setIsPlacing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Load saved customer info from localStorage
  useEffect(() => {
    const savedInfo = localStorage.getItem('customerInfo');
    if (savedInfo) {
      const parsed = JSON.parse(savedInfo);
      setForm(parsed);
      setIsEditing(false); // Show confirmation view if info exists
    } else {
      setIsEditing(true); // Show form if no saved info
    }
  }, []);

  // Save customer info to localStorage
  const saveCustomerInfo = () => {
    localStorage.setItem('customerInfo', JSON.stringify({
      name: form.name,
      phone: form.phone,
      address: form.address,
      notes: ''
    }));
    setIsEditing(false);
  };

  const totals = useMemo(() => {
    return calculateOrderTotal(
      items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
      orderType,
      orderType === 'delivery' ? settings.deliveryCharges : 0,
      settings.serviceCharges
    );
  }, [items, orderType, settings.deliveryCharges, settings.serviceCharges]);

  const handlePlaceOrder = async () => {
    setMessage(null);
    if (!items.length) {
      setMessage({ type: 'error', text: 'Your cart is empty.' });
      return;
    }
    if (!form.name || !form.phone || (orderType === 'delivery' && !form.address)) {
      setMessage({ type: 'error', text: 'Please add your name, phone, and delivery address.' });
      return;
    }

    // Save customer info before placing order
    saveCustomerInfo();

    setIsPlacing(true);
    const payload = {
      customer_id: user?.id || null,
      customer_name: form.name,
      customer_phone: form.phone,
      delivery_address: orderType === 'delivery' ? form.address : 'Pickup at store',
      order_type: orderType,
      status: 'pending' as const,
      totals: {
        subtotal: totals.subtotal || 0,
        gst_amount: totals.gstAmount || 0,
        delivery_charges: totals.deliveryCharges || 0,
        service_charges: totals.serviceCharges || 0,
        total_amount: totals.total || 0,
      },
      items: items.map((item) => ({
        menu_item_id: item.id,
        menu_item_name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    console.log('Order payload:', payload);

    try {
      const newOrder = await createOrder(payload);
      setIsPlacing(false);

      if (!newOrder) {
        setMessage({ type: 'error', text: 'Failed to place the order. Please try again.' });
        return;
      }

      clearCart();
      setMessage({ type: 'success', text: `Order ${newOrder.order_number} placed! We will contact you soon.` });
      // Keep saved customer info, only clear notes
      setForm(prev => ({ ...prev, notes: '' }));
      navigate('/');
    } catch (error) {
      console.error('Order creation error:', error);
      setIsPlacing(false);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to place the order. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-20">
      <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-2 gap-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-[#F2A900]" />
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white uppercase tracking-wider">Your Cart</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-4 py-2 bg-[#0f0f0f] border border-[#F2A900]/30 text-[#F2A900] hover:bg-[#F2A900]/10 hover:border-[#F2A900] rounded-lg transition-all font-semibold text-sm sm:text-base text-center"
            >
              Continue Shopping
            </button>
          </div>
          {items.length > 0 && (
            <p className="text-gray-400 mb-4 text-sm sm:text-base">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
          )}

          {!items.length && (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#F2A900]/30 rounded-xl p-8 sm:p-12 text-center">
              <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-[#F2A900]/50 mx-auto mb-4" />
              <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-6 text-sm sm:text-base">Add some delicious items to get started!</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-[#F2A900] hover:bg-[#D99700] text-black font-semibold rounded-lg transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Menu
              </button>
            </div>
          )}

          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#F2A900]/30 rounded-xl p-4 sm:p-5 shadow-lg hover:shadow-[#F2A900]/20 transition-all duration-300 group"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  {item.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-[#F2A900]/30 group-hover:border-[#F2A900] transition-colors"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base sm:text-lg mb-1 leading-tight line-clamp-2">{item.name}</h3>
                        <p className="text-[#F2A900] text-xs sm:text-sm font-semibold">{formatCurrency(item.price)} / {item.unit_type}</p>
                      </div>
                      <p className="text-white font-bold text-lg sm:text-xl whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 gap-2">
                      <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-lg border border-[#F2A900]/30 p-0.5 sm:p-1 h-8 sm:h-auto">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#F2A900] hover:bg-[#F2A900]/20 rounded transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <span className="w-8 sm:w-12 text-center text-white font-semibold text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[#F2A900] hover:bg-[#F2A900]/20 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 text-xs sm:text-sm font-medium transition-colors px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Checkout</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-[#F2A900] hover:text-[#D99700] transition-colors text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Details
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-gray-400 text-sm">Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded bg-[#0f0f0f] border border-[#F2A900]/30 text-white"
                  />
                </label>
                <label className="block">
                  <span className="text-gray-400 text-sm">Phone</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 rounded bg-[#0f0f0f] border border-[#F2A900]/30 text-white"
                  />
                </label>
                {orderType === 'delivery' && (
                  <label className="block">
                    <span className="text-gray-400 text-sm">Delivery Address</span>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 rounded bg-[#0f0f0f] border border-[#F2A900]/30 text-white"
                      rows={3}
                    />
                  </label>
                )}
                <button
                  onClick={saveCustomerInfo}
                  className="w-full py-2 bg-[#F2A900] text-black font-semibold rounded hover:bg-[#D99700] transition-colors"
                >
                  Save Details
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-[#0a0a0a] rounded p-3 border border-[#F2A900]/20">
                  <p className="text-gray-400 text-sm mb-1">Name</p>
                  <p className="text-white">{form.name}</p>
                </div>
                <div className="bg-[#0a0a0a] rounded p-3 border border-[#F2A900]/20">
                  <p className="text-gray-400 text-sm mb-1">Phone</p>
                  <p className="text-white">{form.phone}</p>
                </div>
                {orderType === 'delivery' && (
                  <div className="bg-[#0a0a0a] rounded p-3 border border-[#F2A900]/20">
                    <p className="text-gray-400 text-sm mb-1">Delivery Address</p>
                    <p className="text-white">{form.address}</p>
                  </div>
                )}
              </div>
            )}

            <label className="block mt-4">
              <span className="text-gray-400 text-sm">Notes (optional)</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded bg-[#0f0f0f] border border-[#F2A900]/30 text-white"
                rows={2}
                placeholder="Any special instructions..."
              />
            </label>

            <div className="flex gap-3 text-sm">
              {(['delivery', 'pickup'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`flex-1 px-3 py-2 rounded border transition-colors ${orderType === type
                    ? 'border-[#F2A900] bg-[#F2A900]/10 text-[#F2A900]'
                    : 'border-[#F2A900]/20 text-gray-300 hover:border-[#F2A900]/40'
                    }`}
                >
                  {type === 'delivery' ? 'Delivery' : 'Pickup'}
                </button>
              ))}
            </div>

            <div className="border-t border-[#F2A900]/20 pt-4 space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.deliveryCharges > 0 && (
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{formatCurrency(totals.deliveryCharges)}</span>
                </div>
              )}
              {totals.serviceCharges > 0 && (
                <div className="flex justify-between">
                  <span>Service</span>
                  <span>{formatCurrency(totals.serviceCharges)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST</span>
                <span>{formatCurrency(totals.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-lg pt-2">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded text-sm ${message.type === 'success'
                  ? 'bg-green-900/30 text-green-200 border border-green-700'
                  : 'bg-red-900/30 text-red-200 border border-red-700'
                  }`}
              >
                {message.text}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || !items.length}
              className="w-full py-3 rounded bg-[#F2A900] hover:bg-[#D99700] text-black font-semibold transition-colors disabled:opacity-50"
            >
              {isPlacing ? 'Placing order...' : `Place Order (${formatCurrency(totals.total)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
