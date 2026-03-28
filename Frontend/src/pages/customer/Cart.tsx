import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart-store';
import { useOrderStore } from '@/store/order-store';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';

import { calculateOrderTotal, formatCurrency } from '@/utils/orderCalculations';
import { Plus, Minus, ShoppingBag, CheckCircle, MapPin, Home, Briefcase, ChevronRight, Phone, User as UserIcon, Clock } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { getImageUrl } from '@/utils/imageUtils';

import { useOfferStore } from '@/store/offer-store';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { Offer } from '@/types';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, fetchCart } = useCartStore();
  const { createOrder, storeActive, closeReason, fetchStoreStatus } = useOrderStore();
  const { user, fetchProfile, updateProfile } = useAuthStore();
  const { settings } = useSettingsStore();
  const { toast } = useToast();
  const { getPublicOffers } = useOfferStore();
  const { siteSettings, fetchSiteSettings } = useCMSEnhancedStore();

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchProfile(); // Refresh profile to get the latest address/phone
    }
    fetchSiteSettings();
    fetchStoreStatus();
  }, [user?.id, fetchCart, fetchProfile, fetchSiteSettings, fetchStoreStatus]);

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
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState<{ id: string, number: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    houseAddress: '',
    street: '',
    locality: '',
    city: 'Ambur',
    notes: '',
    addressType: 'Home' as 'Home' | 'Work' | 'Other',
  });

  const { addAddress } = useAuthStore();
  const [isAddressSaving, setIsAddressSaving] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    id: string;
    discount_type?: 'percentage' | 'fixed';
    discount_value?: number;
    max_discount_value?: number;
    item_applicability?: 'all' | 'specific';
    specific_items?: string[];
    valid_to?: string;
  } | null>(null);
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

    return [...availableCoupons].sort((a, b) => {
      // Calculate applicable total for coupon A
      let totalA = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      if (a.item_applicability === 'specific') {
        const specificItems = a.specific_items || [];
        totalA = items
          .filter(item => specificItems.includes(item.id))
          .reduce((sum, item) => sum + (item.quantity * item.price), 0);
      }

      // Calculate applicable total for coupon B
      let totalB = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      if (b.item_applicability === 'specific') {
        const specificItems = b.specific_items || [];
        totalB = items
          .filter(item => specificItems.includes(item.id))
          .reduce((sum, item) => sum + (item.quantity * item.price), 0);
      }

      if (totalA === 0 && totalB === 0) return 0;
      if (totalA === 0) return 1;
      if (totalB === 0) return -1;

      const valA = a.discount_type === 'percentage' ? (totalA * a.discount_value / 100) : a.discount_value;
      const valB = b.discount_type === 'percentage' ? (totalB * b.discount_value / 100) : b.discount_value;

      // Apply max discount cap if present
      const finalA = a.max_discount_value && valA > a.max_discount_value ? a.max_discount_value : valA;
      const finalB = b.max_discount_value && valB > b.max_discount_value ? b.max_discount_value : valB;

      return finalB - finalA;
    })[0];
  }, [availableCoupons, items]);

  const handleApplyCoupon = async () => {
    if (items.length === 0) {
      toast({ title: 'Error', description: 'Please add items to your cart first', variant: 'destructive' });
      return;
    }

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
        customer_id: user?.id,
        items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, price: i.price }))
      });

      if (response.data.success) {
        const { id, code, calculated_discount, discount_type, discount_value, max_discount_value, item_applicability, specific_items, valid_to } = response.data.data;
        setAppliedCoupon({
          id,
          code,
          discount: parseFloat(calculated_discount),
          discount_type,
          discount_value: parseFloat(discount_value),
          max_discount_value: max_discount_value ? parseFloat(max_discount_value) : undefined,
          item_applicability,
          specific_items,
          valid_to
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

  // Load saved customer info - Prioritizing Database Profile for True Dynamics
  useEffect(() => {
    // 1. First, try pulling from the live User Profile (Single Source of Truth)
    if (user) {
      const u = user as any;
      const profileName = u.name || '';
      const profilePhone = u.phone || '';
      
      // Handle multiple addresses
      if (u.addresses && u.addresses.length > 0) {
        const defaultAddr = u.addresses.find((a: any) => a.is_default) || u.addresses[0];
        setSelectedAddressId(defaultAddr.id);
        setForm(prev => ({
          ...prev,
          name: profileName,
          phone: profilePhone,
          houseAddress: defaultAddr.house_address,
          street: defaultAddr.street,
          locality: defaultAddr.locality,
          city: defaultAddr.city,
          addressType: defaultAddr.label,
        }));
        setIsEditing(false);
        return;
      }

      // Fallback to legacy profile fields if no multiple addresses saved
      const profileType = u.address_type || 'Home';
      const h = u.house_address || u.address || u.delivery_address || '';
      const s = u.street || '';
      const l = u.locality || '';
      const c = u.city || 'Ambur';

      if (profileName || profilePhone || h || s || l) {
        setForm(prev => ({
          ...prev,
          name: profileName,
          phone: profilePhone,
          houseAddress: h,
          street: s,
          locality: l,
          city: c,
          addressType: profileType as any,
        }));
        
        if (profileName && profilePhone && (h || s || l)) {
          setIsEditing(false);
          return;
        }
      }
    }

    // 2. Fallback to localStorage for Guests or partial profiles
    const savedInfo = localStorage.getItem('customerInfo');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        setForm(prev => ({ 
          ...prev, 
          name: prev.name || parsed.name || '',
          phone: prev.phone || parsed.phone || '',
          houseAddress: prev.houseAddress || parsed.houseAddress || '',
          street: prev.street || parsed.street || '',
          locality: prev.locality || parsed.locality || '',
          city: prev.city || parsed.city || 'Ambur',
          addressType: prev.addressType || parsed.addressType || 'Home'
        }));
        setIsEditing(false);
      } catch (e) {
        console.error('Failed to parse customerInfo:', e);
      }
    } else if (!user) {
      // 3. New Guest: Force Edit
      setIsEditing(true);
    }
  }, [user]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setForm(prev => ({
      ...prev,
      houseAddress: addr.house_address,
      street: addr.street,
      locality: addr.locality,
      city: addr.city,
      addressType: addr.label,
    }));
    setIsEditing(false);
    setShowAddressForm(false);
  };

  const handleAddNewAddress = async () => {
    if (!form.houseAddress || !form.street || !form.locality) {
      toast({ title: 'Error', description: 'Please fill address details', variant: 'destructive' });
      return;
    }

    setIsAddressSaving(true);
    try {
      const success = await addAddress({
        label: form.addressType,
        house_address: form.houseAddress,
        street: form.street,
        locality: form.locality,
        city: form.city,
        is_default: (user as any)?.addresses?.length === 0
      });

      if (success) {
        setShowAddressForm(false);
        setIsEditing(false);
        toast({ title: 'Success', description: 'Address saved!' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save address', variant: 'destructive' });
    } finally {
      setIsAddressSaving(false);
    }
  };

  // Save customer info to localStorage AND profile database
  const saveCustomerInfo = async () => {
    if (!form.name || !form.phone || (orderType === 'delivery' && (!form.houseAddress || !form.street || !form.locality))) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      // 1. Always save to localStorage for immediate UI persistence
      localStorage.setItem('customerInfo', JSON.stringify({
        name: form.name,
        phone: form.phone,
        houseAddress: form.houseAddress,
        street: form.street,
        locality: form.locality,
        city: form.city,
        addressType: form.addressType,
        notes: form.notes || ''
      }));

      // 2. If logged in, sync to the database profile permanently
      if (user) {
        await updateProfile({
          name: form.name,
          phone: form.phone,
          house_address: form.houseAddress,
          street: form.street,
          locality: form.locality,
          city: form.city,
          address_type: form.addressType, 
        });
      }

      setIsEditing(false);
      toast({
        title: 'Saved',
        description: user ? 'Details updated in your profile!' : 'Details saved for this order!'
      });
    } catch (error) {
      toast({
        title: 'Partial Error',
        description: 'Saved locally, but failed to sync to profile.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totals = useMemo(() => {
    let currentDiscount = appliedCoupon?.discount || 0;

    // Recalculate discount if we have the full offer data
    if (appliedCoupon?.discount_type) {
      const currentSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      let applicableSubtotal = currentSubtotal;

      if (appliedCoupon.item_applicability === 'specific') {
        const specificItems = appliedCoupon.specific_items || [];
        applicableSubtotal = items
          .filter(item => specificItems.includes(item.id))
          .reduce((sum, item) => sum + (item.quantity * item.price), 0);

        // If no items match anymore, the discount becomes 0
        if (applicableSubtotal === 0) {
          currentDiscount = 0;
        } else if (appliedCoupon.discount_type === 'percentage') {
          currentDiscount = (applicableSubtotal * (appliedCoupon.discount_value || 0)) / 100;
          if (appliedCoupon.max_discount_value && currentDiscount > appliedCoupon.max_discount_value) {
            currentDiscount = appliedCoupon.max_discount_value;
          }
        } else {
          currentDiscount = appliedCoupon.discount_value || 0;
        }
      } else if (appliedCoupon.discount_type === 'percentage') {
        currentDiscount = (currentSubtotal * (appliedCoupon.discount_value || 0)) / 100;
        if (appliedCoupon.max_discount_value && currentDiscount > appliedCoupon.max_discount_value) {
          currentDiscount = appliedCoupon.max_discount_value;
        }
      } else {
        currentDiscount = appliedCoupon.discount_value || 0;
      }

      // Ensure discount doesn't exceed applicable subtotal (for fixed discounts)
      if (currentDiscount > applicableSubtotal) {
        currentDiscount = applicableSubtotal;
      }
    }

    return calculateOrderTotal(
      items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
      orderType,
      orderType === 'delivery' ? settings?.deliveryCharges : 0,
      settings?.serviceCharges,
      currentDiscount
    );
  }, [items, orderType, settings?.deliveryCharges, settings?.serviceCharges, appliedCoupon]);

  // Re-validate coupon when total changes (optional but good for percentage discounts)
  useEffect(() => {
    if (appliedCoupon?.valid_to) {
      const expirationDate = new Date(appliedCoupon.valid_to);
      const now = new Date();

      if (now > expirationDate) {
        setAppliedCoupon(null);
        toast({
          title: 'Coupon Expired',
          description: `The coupon "${appliedCoupon.code}" has expired and was removed.`,
          variant: 'destructive'
        });
      }
    }
  }, [items, appliedCoupon, toast]);


  const handlePlaceOrder = async () => {
    setMessage(null);

    // Explicit check for coupon expiration at order point
    if (appliedCoupon?.valid_to && new Date() > new Date(appliedCoupon.valid_to)) {
      setAppliedCoupon(null);
      setMessage({ type: 'error', text: 'The applied coupon has just expired. Total has been updated.' });
      return;
    }

    if (!items.length) {
      setMessage({ type: 'error', text: 'Your cart is empty.' });
      return;
    }
    const isContactRequired = orderType === 'delivery';
    if ((isContactRequired && (!form.name || !form.phone)) || (orderType === 'delivery' && (!form.houseAddress || !form.street || !form.locality))) {
      setMessage({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    // Save customer info before placing order
    await saveCustomerInfo();

    setIsPlacing(true);
    const payload = {
      customer_id: user?.id || null,
      customer_name: form.name,
      customer_phone: form.phone,
      delivery_address: orderType === 'delivery' 
        ? `${form.houseAddress}, ${form.street}, ${form.locality}, ${form.city}`
        : 'Pickup at store',
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
    <div className="min-h-screen bg-[#0a0a0a] pt-40 pb-20">
      <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items */}
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

          {!items.length ? (
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
            </div>
          ) : (
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
          )}
        </div>

        {/* Right Column: Checkout & Summary */}
        <div className="space-y-6">
          {/* Main Checkout Header (Mobile Only) */}
          <div className="lg:hidden">
            <h2 className="text-xl font-display font-black text-white uppercase tracking-wider mb-4">Checkout</h2>
          </div>

          <div className="bg-[#111111] border border-[#F2A900]/20 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2A900]/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />

            {/* Delivery/Pickup Switcher - Top Row */}
            <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-[#F2A900]/10 mb-6">
              {isDeliveryEnabled && (
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${orderType === 'delivery'
                    ? 'bg-[#F2A900] text-black shadow-[0_4px_12px_rgba(242,169,0,0.3)]'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <MapPin className="w-4 h-4" />
                  Delivery
                </button>
              )}
              {isPickupEnabled && (
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${orderType === 'pickup'
                    ? 'bg-[#F2A900] text-black shadow-[0_4px_12px_rgba(242,169,0,0.3)]'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Pickup
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Address / Contact Section */}
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F2A900]/10 flex items-center justify-center">
                      {orderType === 'delivery' ? <MapPin className="w-4 h-4 text-[#F2A900]" /> : <ShoppingBag className="w-4 h-4 text-[#F2A900]" />}
                    </div>
                    <span className="text-sm font-bold text-[#F2A900] uppercase tracking-widest">
                      {orderType === 'delivery' ? 'Delivery Address' : 'Pickup at Store'}
                    </span>
                  </div>
                  {!isEditing && orderType === 'delivery' && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[10px] font-black uppercase tracking-wider bg-[#F2A900]/10 text-[#F2A900] hover:bg-[#F2A900]/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Change
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {user && (user as any).addresses?.length > 0 && !showAddressForm ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase">Select Saved Address</span>
                          <button 
                            onClick={() => {
                              setShowAddressForm(true);
                              setForm(prev => ({ ...prev, houseAddress: '', street: '', locality: '', addressType: 'Home' }));
                            }} 
                            className="text-[10px] font-bold text-[#F2A900] hover:underline"
                          >
                            + Add New Address
                          </button>
                        </div>
                        {(user as any).addresses.map((addr: any) => (
                          <div 
                            key={addr.id} 
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAddressId === addr.id ? 'bg-[#F2A900]/10 border-[#F2A900]' : 'bg-[#0a0a0a] border-[#F2A900]/20 hover:border-[#F2A900]/50'}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black uppercase text-[#F2A900]">{addr.label}</span>
                              {addr.is_default && <span className="text-[9px] font-bold text-green-400">Default</span>}
                            </div>
                            <p className="text-white text-xs font-bold truncate">{addr.house_address}, {addr.street}</p>
                            <p className="text-gray-500 text-[10px]">{addr.locality}, {addr.city}</p>
                          </div>
                        ))}
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="w-full py-3 text-xs font-bold text-gray-400 hover:text-white border border-dashed border-gray-700 rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orderType === 'delivery' && (
                          <>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black text-gray-500 uppercase">{showAddressForm ? 'Add New Address' : 'Contact Info'}</span>
                              {showAddressForm && (user as any)?.addresses?.length > 0 && (
                                <button onClick={() => setShowAddressForm(false)} className="text-[10px] font-bold text-gray-400 hover:text-white">Back to Saved</button>
                              )}
                            </div>
                            
                            {!showAddressForm && (
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-gray-500 uppercase ml-1">Your Name</span>
                                  <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="Name"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#F2A900]/10 text-white text-sm focus:border-[#F2A900]/50 outline-none transition-all placeholder:text-gray-700"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-gray-500 uppercase ml-1">Phone Number</span>
                                  <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                    placeholder="Phone"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#F2A900]/10 text-white text-sm focus:border-[#F2A900]/50 outline-none transition-all placeholder:text-gray-700"
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {orderType === 'delivery' && (
                          <>
                            <div className="flex gap-2">
                              {(['Home', 'Work', 'Other'] as const).map(type => (
                                <button
                                  key={type}
                                  onClick={() => setForm(prev => ({ ...prev, addressType: type }))}
                                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-bold transition-all ${form.addressType === type
                                      ? 'bg-[#F2A900] border-transparent text-black'
                                      : 'bg-[#0a0a0a] border-[#F2A900]/20 text-gray-500 hover:border-[#F2A900]/40'
                                    }`}
                                >
                                  {type === 'Home' && <Home className="w-3 h-3" />}
                                  {type === 'Work' && <Briefcase className="w-3 h-3" />}
                                  {type === 'Other' && <MapPin className="w-3 h-3" />}
                                  {type}
                                </button>
                              ))}
                            </div>

                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-gray-500 uppercase ml-1">Door / House No.</span>
                                  <input
                                    type="text"
                                    value={form.houseAddress}
                                    onChange={(e) => setForm((prev) => ({ ...prev, houseAddress: e.target.value }))}
                                    placeholder="e.g. 12/A"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#F2A900]/10 text-white text-sm focus:border-[#F2A900]/50 outline-none transition-all placeholder:text-gray-700"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-gray-500 uppercase ml-1">Street / Area</span>
                                  <input
                                    type="text"
                                    value={form.street}
                                    onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                                    placeholder="e.g. Main Road"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#F2A900]/10 text-white text-sm focus:border-[#F2A900]/50 outline-none transition-all placeholder:text-gray-700"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-gray-500 uppercase ml-1">Locality</span>
                                  <input
                                    type="text"
                                    value={form.locality}
                                    onChange={(e) => setForm((prev) => ({ ...prev, locality: e.target.value }))}
                                    placeholder="e.g. Town Hall"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#F2A900]/10 text-white text-sm focus:border-[#F2A900]/50 outline-none transition-all placeholder:text-gray-700"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black text-gray-500 uppercase ml-1">City</span>
                                  <select
                                    value={form.city}
                                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#F2A900]/10 text-white text-sm focus:border-[#F2A900]/50 outline-none transition-all"
                                  >
                                    <option value="Ambur">Ambur</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <button
                          onClick={showAddressForm ? handleAddNewAddress : saveCustomerInfo}
                          disabled={isSaving || isAddressSaving}
                          className="w-full py-3.5 bg-[#F2A900] text-black text-sm font-black uppercase tracking-widest rounded-xl hover:bg-[#ffbf00] transition-all active:scale-[0.98] shadow-lg shadow-[#F2A900]/20 disabled:opacity-50"
                        >
                          {isSaving || isAddressSaving ? 'Saving...' : 'Save & Proceed'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="group/card animate-in fade-in slide-in-from-left-2 duration-400">
                    <div 
                      className={`bg-[#0a0a0a]/50 p-4 rounded-2xl border border-[#F2A900]/10 hover:border-[#F2A900]/30 transition-all ${orderType === 'delivery' ? 'cursor-pointer' : ''}`} 
                      onClick={() => orderType === 'delivery' && setIsEditing(true)}
                    >
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#F2A900]/10 border border-[#F2A900]/20 flex items-center justify-center flex-shrink-0">
                          {orderType === 'delivery' ? (
                            <>
                              {form.addressType === 'Home' && <Home className="w-6 h-6 text-[#F2A900]" />}
                              {form.addressType === 'Work' && <Briefcase className="w-6 h-6 text-[#F2A900]" />}
                              {form.addressType === 'Other' && <MapPin className="w-6 h-6 text-[#F2A900]" />}
                            </>
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-[#F2A900]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-white font-bold text-base">
                              {orderType === 'delivery' ? form.addressType : 'Pickup at Store'}
                            </h4>
                            {orderType === 'delivery' && (
                              <span className="text-[9px] font-black bg-[#F2A900] text-black px-2 py-0.5 rounded-full uppercase">Selected</span>
                            )}
                          </div>

                          {orderType === 'delivery' ? (
                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                              {form.houseAddress ? `${form.houseAddress}, ${form.street}, ${form.locality}, ${form.city}` : 'Specify your address'}
                            </p>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-[#F2A900] text-[11px] leading-relaxed mb-1 italic">
                                Please collect your order from our counter. Show your order ID/Number upon arrival.
                              </p>
                              <p className="text-gray-400 text-sm leading-relaxed">
                                {siteSettings.find(s => s.key === 'contact_address')?.value || settings.businessAddress}
                              </p>
                            </div>
                          )}

                          {orderType === 'delivery' && (
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#F2A900]/5">
                              <div className="flex items-center gap-1.5">
                                <UserIcon className="w-3 h-3 text-gray-500" />
                                <span className="text-[11px] font-bold text-gray-300">{form.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span className="text-[11px] font-bold text-gray-300">{form.phone}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {orderType === 'delivery' && (
                          <ChevronRight className="w-5 h-5 text-gray-700 group-hover/card:text-[#F2A900] self-center transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method - Bottom Row */}
              <div className="space-y-4 pt-4 border-t border-[#F2A900]/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F2A900]/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#F2A900]" />
                  </div>
                  <span className="text-sm font-bold text-[#F2A900] uppercase tracking-widest">Payment Method</span>
                </div>

                <div className="flex gap-3">
                  {isCodEnabled && (
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${paymentMethod === 'cod'
                        ? 'bg-[#F2A900]/10 border-[#F2A900] shadow-[0_4px_15px_rgba(242,169,0,0.15)]'
                        : 'bg-[#0a0a0a] border-[#F2A900]/10 hover:border-[#F2A900]/30 text-gray-400 hover:text-white'
                        }`}
                    >
                      <span className={`text-base font-bold ${paymentMethod === 'cod' ? 'text-[#F2A900]' : ''}`}>CASH</span>
                      <span className="text-[10px] text-white opacity-60">ON DELIVERY</span>
                    </button>
                  )}
                  {isOnlineEnabled && (
                    <button
                      onClick={() => setPaymentMethod('online')}
                      className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${paymentMethod === 'online'
                        ? 'bg-[#F2A900]/10 border-[#F2A900] shadow-[0_4px_15px_rgba(242,169,0,0.15)]'
                        : 'bg-[#0a0a0a] border-[#F2A900]/10 hover:border-[#F2A900]/30 text-gray-400 hover:text-white'
                        }`}
                    >
                      <span className={`text-base font-bold ${paymentMethod === 'online' ? 'text-[#F2A900]' : ''}`}>ONLINE</span>
                      <span className="text-[10px] font-black opacity-60">PAYMENT</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Instructions / Notes */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-500 uppercase ml-1">Special Instructions</span>
                  <Clock className="w-3 h-3 text-gray-600" />
                </div>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Cooking notes, gate code, call before delivery..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0a] border border-[#F2A900]/10 text-white text-xs focus:border-[#F2A900]/50 outline-none transition-all placeholder:text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          {items.length > 0 && (
            <div className="bg-[#111111] border border-[#F2A900]/20 rounded-2xl p-5 sm:p-6 shadow-xl">
              <p className="text-[#F2A900] text-sm font-black uppercase tracking-widest mb-4">Offers & Benefits</p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="PROMO CODE"
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-[#0a0a0a] border border-[#F2A900]/10 rounded-xl px-4 py-3 text-white text-sm font-bold uppercase tracking-widest focus:border-[#F2A900]/50 outline-none disabled:opacity-50"
                />
                {!appliedCoupon ? (
                  <button
                    id="apply-coupon-btn"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon || !couponCode}
                    className="bg-[#F2A900] text-black px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-[#ffbf00] transition active:scale-95 disabled:opacity-50"
                  >
                    {isValidatingCoupon ? '...' : 'Apply'}
                  </button>
                ) : (
                  <button
                    onClick={removeCoupon}
                    className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/30 font-black text-xs uppercase hover:bg-red-500/30 transition"
                  >
                    Remove
                  </button>
                )}
              </div>

              {appliedCoupon && (
                <div className="flex flex-col gap-1 mb-4 bg-green-500/5 p-3 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Coupon "{appliedCoupon.code}" applied: -{formatCurrency(appliedCoupon.discount)}</span>
                  </div>
                  {appliedCoupon.discount_type === 'percentage' && 
                   appliedCoupon.max_discount_value && 
                   appliedCoupon.discount >= appliedCoupon.max_discount_value && (
                    <p className="text-[10px] text-green-400/70 ml-6 italic">
                      Maximum discount of {formatCurrency(appliedCoupon.max_discount_value)} reached.
                    </p>
                  )}
                </div>
              )}

              {!appliedCoupon && availableCoupons.length > 0 && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎟️</span>
                      <p className="text-[10px] font-black text-[#F2A900] uppercase tracking-widest">Available Offers</p>
                    </div>
                    <span className="text-[9px] bg-[#F2A900] text-black font-black px-2.5 py-0.5 rounded-full">
                      {availableCoupons.length}
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
                             <div className="flex items-center gap-2 mb-2">
                               <div className="flex items-end gap-1">
                                 <span className={`font-black leading-none ${coupon.discount_type === 'percentage' ? 'text-5xl' : 'text-4xl'} ${isBest ? 'text-[#F2A900]' : 'text-white group-hover:text-[#F2A900] transition-colors'}`}>
                                   {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                 </span>
                                 <span className="text-[#F2A900]/70 font-bold text-lg mb-1">OFF</span>
                               </div>
                               
                               {coupon.discount_type === 'percentage' && coupon.max_discount_value && coupon.max_discount_value > 0 && (
                                 <div className="px-2 py-0.5 rounded-md bg-[#F2A900]/10 border border-[#F2A900]/20 text-[10px] text-[#F2A900] font-black uppercase tracking-tighter">
                                   UP TO {formatCurrency(coupon.max_discount_value)}
                                 </div>
                               )}
                             </div>

                            {/* Description */}
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {coupon.description || (coupon.item_applicability === 'specific' ? 'Valid on select menu items' : 'Valid on all menu items')}
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
                                Valid till {new Date(coupon.valid_to).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
                                  ? 'bg-[#F2A900] text-black hover:bg-[#ffbf00] shadow-[0_4px_15_rgba(242,169,0,0.45)] hover:shadow-[0_6px_20px_rgba(242,169,0,0.6)] hover:-translate-y-0.5'
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
                </div>
              )}
            </div>
          )}

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
              className={`p-3 rounded text-sm mt-4 ${message.type === 'success'
                  ? 'bg-green-900/30 text-green-200 border border-green-700'
                  : 'bg-red-900/30 text-red-200 border border-red-700'
                }`}
            >
              {message.text}
            </div>
          )}

          <div className="pt-6">
            {!storeActive ? (
              <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-xl text-center space-y-2">
                <p className="text-red-400 font-bold">Store is Currently Closed</p>
                {closeReason ? (
                  <div className="bg-red-950/50 p-2 rounded border border-red-500/30">
                    <p className="text-red-300 text-sm font-medium">{closeReason}</p>
                  </div>
                ) : (
                  <p className="text-red-300 text-sm">We are unable to accept new orders at this time. Please try again later.</p>
                )}
              </div>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing || !items.length}
                className="w-full py-4 rounded-xl bg-[#F2A900] hover:bg-[#D99700] text-black font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isPlacing ? 'Placing order...' : `Place Order ${items.length > 0 ? `(${formatCurrency(totals.total)})` : ''}`}
              </button>
            )}
          </div>
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
                Your order <span className="text-[#F2A900] font-mono font-bold">#{orderPlaced?.number}</span> has been received.
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
