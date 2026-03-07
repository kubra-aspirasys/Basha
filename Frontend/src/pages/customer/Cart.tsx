import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart-store';
import { useOrderStore } from '@/store/order-store';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';

import { calculateOrderTotal, formatCurrency } from '@/utils/orderCalculations';
import { Pencil, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const getImageUrl = (url?: string) => {
  if (!url) return '/banner.jpeg'; // Fallback
  if (url.startsWith('http')) return url;
  // Remove /api from base if present to get root
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${baseUrl}${url}`;
};

import { useOfferStore } from '@/store/offer-store';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { Offer } from '@/types';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, fetchCart } = useCartStore();
  const { createOrder, storeActive, fetchStoreStatus } = useOrderStore();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();
  const { getPublicOffers } = useOfferStore();
  const { siteSettings, fetchSiteSettings } = useCMSEnhancedStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
    fetchSiteSettings();
    fetchStoreStatus();
  }, [user, fetchCart, fetchSiteSettings, fetchStoreStatus]);

  // CMS-controlled toggles with safe fallbacks (default to true if not specified)
  const isDeliveryEnabled = siteSettings.find(s => s.key === 'payment_method_delivery')?.value !== 'false';
  const isPickupEnabled = siteSettings.find(s => s.key === 'payment_method_pickup')?.value !== 'false';
  const isCodEnabled = siteSettings.find(s => s.key === 'payment_method_cod')?.value !== 'false';
  const isOnlineEnabled = siteSettings.find(s => s.key === 'payment_method_online')?.value === 'true'; // Default offline to false 

  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  // Set initial state based on available options
  useEffect(() => {
    if (siteSettings.length > 0) {
      if (!isDeliveryEnabled && isPickupEnabled) {
        setOrderType('pickup');
      } else if (isDeliveryEnabled && !isPickupEnabled) {
        setOrderType('delivery');
      }

      if (!isCodEnabled && isOnlineEnabled) {
        setPaymentMethod('online');
      } else if (isCodEnabled && !isOnlineEnabled) {
        setPaymentMethod('cod');
      }
    }
  }, [siteSettings, isDeliveryEnabled, isPickupEnabled, isCodEnabled, isOnlineEnabled]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{ id: string, number: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; id: string } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Offer[]>([]);

  useEffect(() => {
    const loadCoupons = async () => {
      const coupons = await getPublicOffers(user?.id);
      setAvailableCoupons(coupons);
    };
    loadCoupons();
  }, [getPublicOffers, user?.id]);

  const bestOffer = useMemo(() => {
    if (!availableCoupons.length) return null;
    const currentTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return [...availableCoupons].sort((a, b) => {
      const valA = a.discount_type === 'percentage' ? (currentTotal * a.discount_value / 100) : a.discount_value;
      const valB = b.discount_type === 'percentage' ? (currentTotal * b.discount_value / 100) : b.discount_value;
      return valB - valA;
    })[0];
  }, [availableCoupons, items]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a coupon code', variant: 'destructive' });
      return;
    }

    setIsValidatingCoupon(true);
    try {
      // Calculate total before discount for validation reference
      const currentTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      const response = await api.post('/offers/validate', {
        code: couponCode,
        order_total: currentTotal,
        customer_id: user?.id
      });

      if (response.data.success) {
        const { id, code, calculated_discount } = response.data.data;
        setAppliedCoupon({
          id,
          code,
          discount: parseFloat(calculated_discount)
        });
        toast({ title: 'Success', description: 'Coupon applied successfully!' });
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Invalid coupon code',
        variant: 'destructive'
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

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
      settings.serviceCharges,
      appliedCoupon?.discount || 0
    );
  }, [items, orderType, settings.deliveryCharges, settings.serviceCharges, appliedCoupon]);

  // Re-validate coupon when total changes (optional but good for percentage discounts)
  useEffect(() => {
    if (appliedCoupon) {
      // Logic to re-validate or re-calculate discount if cart items change
      // For now we might just remove coupon if cart changes significantly or just keep it simple
      // Ideally, we'd recall validate API with new total
    }
  }, [items]);

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
      payment_method: paymentMethod,
      status: 'pending' as const,
      totals: {
        subtotal: totals.subtotal || 0,
        gst_amount: totals.gstAmount || 0,
        delivery_charges: totals.deliveryCharges || 0,
        service_charges: totals.serviceCharges || 0,
        total_amount: totals.total || 0,
        discount_amount: totals.discount || 0,
        coupon_id: appliedCoupon?.id
      },
      discount_amount: totals.discount || 0,
      coupon_id: appliedCoupon?.id,
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

      // Wait to clear cart until user clicks a navigation button
      setOrderPlaced({ id: newOrder.id, number: newOrder.order_number });
      setMessage({ type: 'success', text: `Order ${newOrder.order_number} placed! We will contact you soon.` });
      // Keep saved customer info, only clear notes
      setForm(prev => ({ ...prev, notes: '' }));
      // navigate('/'); // Removed immediate navigation
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
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const menuSection = document.getElementById('menu');
                    if (menuSection) {
                      menuSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="px-6 py-3 bg-[#F2A900] hover:bg-[#D99700] text-black font-semibold rounded-lg transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Menu
              </button>
              ```
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
                        src={getImageUrl(item.image_url)}
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
                      <div className="flex items-center gap-3 bg-[#0a0a0a] rounded-full border border-[#F2A900]/30 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#F2A900] bg-[#1a1a1a] hover:bg-[#222] border border-[#F2A900]/10 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center text-white font-bold text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#F2A900] bg-[#1a1a1a] hover:bg-[#222] border border-[#F2A900]/10 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
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

            {orderType === 'pickup' && (
              <div className="bg-[#F2A900]/10 border border-[#F2A900]/30 rounded-lg p-3 flex items-start gap-3 mt-4">
                <div className="bg-[#F2A900] rounded-full p-1 mt-0.5">
                  <ShoppingBag className="w-3 h-3 text-black" />
                </div>
                <div>
                  <p className="text-[#F2A900] font-semibold text-sm">Pickup at Store</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Please collect your order from our counter. Show your order ID/Number upon arrival.
                  </p>
                  <p className="text-gray-300 text-xs mt-2 font-medium">
                    {settings.businessAddress}
                  </p>
                </div>
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
              {isDeliveryEnabled && (
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 px-3 py-2 rounded border transition-colors ${orderType === 'delivery'
                    ? 'border-[#F2A900] bg-[#F2A900]/10 text-[#F2A900]'
                    : 'border-[#F2A900]/20 text-gray-300 hover:border-[#F2A900]/40'
                    }`}
                >
                  Delivery
                </button>
              )}
              {isPickupEnabled && (
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`flex-1 px-3 py-2 rounded border transition-colors ${orderType === 'pickup'
                    ? 'border-[#F2A900] bg-[#F2A900]/10 text-[#F2A900]'
                    : 'border-[#F2A900]/20 text-gray-300 hover:border-[#F2A900]/40'
                    }`}
                >
                  Pickup
                </button>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Payment Method</p>
              <div className="flex gap-3 text-sm">
                {isCodEnabled && (
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex-1 px-3 py-2 rounded border transition-colors ${paymentMethod === 'cod'
                      ? 'border-[#F2A900] bg-[#F2A900]/10 text-[#F2A900]'
                      : 'border-[#F2A900]/20 text-gray-300 hover:border-[#F2A900]/40'
                      }`}
                  >
                    Cash on Delivery
                  </button>
                )}
                {isOnlineEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`flex-1 px-3 py-2 rounded border transition-colors ${paymentMethod === 'online'
                      ? 'border-[#F2A900] bg-[#F2A900]/10 text-[#F2A900]'
                      : 'border-[#F2A900]/20 text-gray-300 hover:border-[#F2A900]/40'
                      }`}
                  >
                    Online Payment
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Coupon Code</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                disabled={!!appliedCoupon}
                className="flex-1 bg-[#0f0f0f] border border-[#F2A900]/30 rounded px-3 py-2 text-white disabled:opacity-50"
              />
              {!appliedCoupon ? (
                <button
                  id="apply-coupon-btn"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode}
                  className="bg-[#F2A900]/20 text-[#F2A900] px-4 py-2 rounded hover:bg-[#F2A900]/30 transition disabled:opacity-50"
                >
                  {isValidatingCoupon ? '...' : 'Apply'}
                </button>
              ) : (
                <button
                  onClick={removeCoupon}
                  className="bg-red-500/20 text-red-400 px-4 py-2 rounded hover:bg-red-500/30 transition"
                >
                  Remove
                </button>
              )}
            </div>
            {appliedCoupon && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Coupon applied: -{formatCurrency(appliedCoupon.discount)}</span>
              </div>
            )}

            {/* Suggested Coupons */}
            {!appliedCoupon && availableCoupons.length > 0 && (
              <div className="mt-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎟️</span>
                    <p className="text-sm font-bold text-[#F2A900] uppercase tracking-widest">Available Coupons</p>
                  </div>
                  <span className="text-[10px] bg-[#F2A900] text-black font-black px-2.5 py-0.5 rounded-full">
                    {availableCoupons.length} offer{availableCoupons.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Horizontal scroll carousel */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                  {availableCoupons.map((coupon) => {
                    const isBest = bestOffer?.id === coupon.id;
                    const daysLeft = Math.ceil((new Date(coupon.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysLeft <= 3;
                    return (
                      <div
                        key={coupon.id}
                        className={`relative flex-shrink-0 snap-center w-[260px] rounded-2xl overflow-hidden transition-all duration-300 group
                          ${isBest
                            ? 'shadow-[0_0_30px_rgba(242,169,0,0.35)] ring-1 ring-[#F2A900]/70'
                            : 'shadow-[0_0_12px_rgba(242,169,0,0.08)] hover:shadow-[0_0_20px_rgba(242,169,0,0.2)]'
                          }`}
                        style={{
                          background: isBest
                            ? 'linear-gradient(135deg, #1c1600 0%, #2a1f00 40%, #1a1200 100%)'
                            : 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
                          border: isBest ? '1px solid rgba(242,169,0,0.6)' : '1px solid rgba(242,169,0,0.2)',
                        }}
                      >
                        {/* Shimmer sweep on best offer */}
                        {isBest && (
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-in-out"
                              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(242,169,0,0.08) 50%, transparent 60%)' }}
                            />
                          </div>
                        )}

                        {/* Top section */}
                        <div className="p-4 pb-3">
                          {/* Best badge row */}
                          <div className="flex items-start justify-between mb-3">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                              ${isBest ? 'bg-[#F2A900] text-black' : 'bg-[#F2A900]/10 text-[#F2A900]/80 border border-[#F2A900]/20'}`}>
                              {isBest ? 'BEST VALUE' : 'OFFER'}
                            </div>
                            {isExpiringSoon && (
                              <span className="text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                                Expires in {daysLeft}d
                              </span>
                            )}
                          </div>

                          {/* Discount callout */}
                          <div className="flex items-end gap-1 mb-2">
                            <span className={`font-black leading-none ${coupon.discount_type === 'percentage' ? 'text-5xl' : 'text-4xl'} ${isBest ? 'text-[#F2A900]' : 'text-white group-hover:text-[#F2A900] transition-colors'}`}>
                              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                            </span>
                            <span className="text-[#F2A900]/70 font-bold text-lg mb-1">OFF</span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {coupon.description || 'Valid on all menu items'}
                          </p>
                        </div>

                        {/* Perforation divider */}
                        <div className="relative flex items-center px-0 my-0">
                          {/* Left notch */}
                          <div className={`absolute -left-3 w-6 h-6 rounded-full z-10
                            ${isBest ? 'bg-[#0d0b00] border border-[#F2A900]/60' : 'bg-[#0a0a0a] border border-[#F2A900]/20'}`} />
                          {/* Dashed line */}
                          <div className="w-full border-t-2 border-dashed border-[#F2A900]/20 mx-3" />
                          {/* Right notch */}
                          <div className={`absolute -right-3 w-6 h-6 rounded-full z-10
                            ${isBest ? 'bg-[#0d0b00] border border-[#F2A900]/60' : 'bg-[#0a0a0a] border border-[#F2A900]/20'}`} />
                        </div>

                        {/* Bottom section */}
                        <div className="px-4 pt-3 pb-4 flex items-center justify-between gap-3">
                          {/* Code + expiry */}
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Code</span>
                            </div>
                            <span className={`font-mono font-black text-base tracking-widest ${isBest ? 'text-[#F2A900]' : 'text-white'}`}>
                              {coupon.code}
                            </span>
                            <span className="text-[10px] text-gray-500 mt-0.5">
                              Valid till {new Date(coupon.valid_to).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          {/* Apply button */}
                          <button
                            onClick={() => {
                              setCouponCode(coupon.code);
                              setTimeout(() => {
                                const applyBtn = document.getElementById('apply-coupon-btn');
                                if (applyBtn) applyBtn.click();
                              }, 50);
                            }}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95
                              ${isBest
                                ? 'bg-[#F2A900] text-black hover:bg-[#ffbf00] shadow-[0_4px_15px_rgba(242,169,0,0.45)] hover:shadow-[0_6px_20px_rgba(242,169,0,0.6)] hover:-translate-y-0.5'
                                : 'bg-[#F2A900]/10 text-[#F2A900] border border-[#F2A900]/30 hover:bg-[#F2A900] hover:text-black hover:border-transparent hover:shadow-[0_4px_12px_rgba(242,169,0,0.35)] hover:-translate-y-0.5'
                              }`}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scroll hint if more than 1 coupon */}
                {availableCoupons.length > 1 && (
                  <p className="text-center text-[10px] text-gray-600 mt-2 tracking-wider">← swipe to see more →</p>
                )}
              </div>
            )}
          </div>

          {items.length > 0 && (
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
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(totals.discount)}</span>
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
          )}

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


          {!storeActive ? (
            <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-center space-y-1">
              <p className="text-red-400 font-bold">Store is Currently Closed</p>
              <p className="text-red-300 text-sm">We are unable to accept new orders at this time. Please try again later.</p>
            </div>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing || !items.length}
              className="w-full py-3 rounded bg-[#F2A900] hover:bg-[#D99700] text-black font-semibold transition-colors disabled:opacity-50"
            >
              {isPlacing ? 'Placing order...' : `Place Order ${items.length > 0 ? `(${formatCurrency(totals.total)})` : ''}`}
            </button>
          )}
        </div>
      </div>

      {orderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-[#F2A900]/30 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-[#F2A900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-[#F2A900]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Order Placed Successfully!</h2>
              <p className="text-gray-400">
                Your order <span className="text-[#F2A900] font-mono font-bold">#{orderPlaced.number}</span> has been received.
              </p>
              <p className="text-sm text-gray-500">
                We'll contact you shortly to confirm your order details.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => {
                  clearCart();
                  navigate('/orders');
                }}
                className="w-full py-3 bg-[#F2A900] text-black font-bold rounded-lg hover:bg-[#D99700] transition-colors"
              >
                View My Orders
              </button>
              <button
                onClick={() => {
                  clearCart();
                  navigate('/');
                }}
                className="w-full py-3 bg-transparent border border-[#F2A900]/30 text-[#F2A900] font-semibold rounded-lg hover:bg-[#F2A900]/10 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
