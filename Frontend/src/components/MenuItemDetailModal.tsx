import { X, Plus, Minus, ShoppingCart, Clock, Leaf } from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/orderCalculations';

interface MenuItemDetailModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (quantity: number) => void;
}

export default function MenuItemDetailModal({ item, isOpen, onClose, onAddToCart }: MenuItemDetailModalProps) {
  const [quantity, setQuantity] = useState(item.min_order_qty || 1);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    onAddToCart(quantity);
    onClose();
  };

  const incrementQty = () => {
    if (!item.max_order_qty || quantity < item.max_order_qty) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > (item.min_order_qty || 1)) {
      setQuantity(quantity - 1);
    }
  };

  const finalPrice = item.discounted_price || item.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#F2A900]/30 shadow-2xl">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#F2A900]/20 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">{item.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F2A900]/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden aspect-square">
              <img
                src={item.image_url || '/banner.jpeg'}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.is_featured && (
                <div className="absolute top-4 left-4 bg-[#F2A900] text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                  Featured
                </div>
              )}
              {item.offer_discount_value && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {item.offer_discount_type === 'percentage' ? `${item.offer_discount_value}% OFF` : `₹${item.offer_discount_value} OFF`}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#F2A900]/20">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#F2A900]">{formatCurrency(finalPrice)}</span>
                {item.discounted_price && (
                  <span className="text-lg text-gray-500 line-through">{formatCurrency(item.price)}</span>
                )}
                <span className="text-sm text-gray-400">/ {item.unit_type}</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Description */}
            {item.description && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {item.preparation_time && (
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#F2A900]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-[#F2A900]" />
                    <span className="text-sm text-gray-400">Prep Time</span>
                  </div>
                  <p className="text-white font-semibold">{item.preparation_time} mins</p>
                </div>
              )}

              <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#F2A900]/20">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-[#F2A900]" />
                  <span className="text-sm text-gray-400">Unit Type</span>
                </div>
                <p className="text-white font-semibold capitalize">{item.unit_type}</p>
              </div>

              {item.stock_quantity !== undefined && (
                <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#F2A900]/20">
                  <span className="text-sm text-gray-400 block mb-2">Stock</span>
                  <p className="text-white font-semibold">{item.stock_quantity} available</p>
                </div>
              )}

              <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#F2A900]/20">
                <span className="text-sm text-gray-400 block mb-2">Min Order</span>
                <p className="text-white font-semibold">{item.min_order_qty} {item.unit_type}</p>
              </div>
            </div>

            {/* Availability Status */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`font-semibold ${item.is_available ? 'text-green-400' : 'text-red-400'}`}>
                {item.is_available ? 'Available Now' : 'Currently Unavailable'}
              </span>
            </div>

            {/* Quantity Selector */}
            {item.is_available && (
              <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#F2A900]/20">
                <label className="text-sm text-gray-400 block mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementQty}
                    disabled={quantity <= (item.min_order_qty || 1)}
                    className="w-10 h-10 rounded-full bg-[#F2A900]/10 hover:bg-[#F2A900]/20 border border-[#F2A900]/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5 text-[#F2A900]" />
                  </button>
                  <span className="text-2xl font-bold text-white min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={incrementQty}
                    disabled={item.max_order_qty ? quantity >= item.max_order_qty : false}
                    className="w-10 h-10 rounded-full bg-[#F2A900]/10 hover:bg-[#F2A900]/20 border border-[#F2A900]/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5 text-[#F2A900]" />
                  </button>
                </div>
                {item.max_order_qty && (
                  <p className="text-xs text-gray-500 mt-2">Max order: {item.max_order_qty} {item.unit_type}</p>
                )}
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!item.is_available}
              className="w-full bg-[#F2A900] hover:bg-[#D99700] text-black font-bold py-6 text-lg uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart - {formatCurrency(finalPrice * quantity)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


