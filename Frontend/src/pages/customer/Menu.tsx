import { useEffect, useState, useMemo } from 'react';
import { useMenuStore } from '@/store/menu-store';
import { useCartStore } from '@/store/cart-store';
import { Search, ShoppingCart, Filter, X } from 'lucide-react';
import MenuItemDetailModal from '@/components/MenuItemDetailModal';
import { MenuItem } from '@/types';

// Helper to construct full image URL
const getImageUrl = (url?: string) => {
  if (!url) return '/banner.jpeg'; // Fallback
  if (url.startsWith('http')) return url;
  // Remove /api from base if present to get root
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  return `${baseUrl}${url}`;
};

export default function CustomerMenu() {
  const {
    menuItems,
    categories: storeCategories,
    productTypes,
    fetchAllMenuItems,
    fetchCategories,
    fetchProductTypes,
    loading
  } = useMenuStore();
  const { addItem } = useCartStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchAllMenuItems();
    fetchCategories();
    fetchProductTypes();
  }, [fetchAllMenuItems, fetchCategories, fetchProductTypes]);

  // Derive mappings from store data to replace mock objects
  const categoryNames = useMemo(() => {
    const map: Record<string, string> = {};
    storeCategories.forEach(c => {
      map[c.id] = c.name;
    });
    return map;
  }, [storeCategories]);

  const typeNames = useMemo(() => {
    const map: Record<string, { name: string; color: string }> = {};
    productTypes.forEach(t => {
      map[t.id] = { name: t.name, color: t.color || '#999' };
    });
    return map;
  }, [productTypes]);

  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category_id).filter(Boolean))];
  const types = ['all', ...new Set(menuItems.map(item => item.type_id).filter(Boolean))];

  // Filter items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesType = selectedType === 'all' || item.type_id === selectedType;
    return matchesSearch && matchesCategory && matchesType && item.is_available;
  });

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      unit_type: item.unit_type,
    });
    setAddedToCart(item.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const handleAddToCartFromModal = (item: MenuItem, quantity: number) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discounted_price || item.price,
      image_url: item.image_url,
      unit_type: item.unit_type,
      quantity: quantity,
    });
    setAddedToCart(item.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(circle_at_20%_20%,rgba(212,165,116,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(212,165,116,0.06),transparent_22%),radial-gradient(circle_at_60%_80%,rgba(212,165,116,0.05),transparent_30%)] pt-20 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 heading-glow">Our Menu</h1>
          <p className="text-xl text-gray-400">Explore our delicious selection of authentic Hyderabadi dishes</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 animate-fade-in animation-delay-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-[#F2A900]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#F2A900] transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-12 animate-fade-in animation-delay-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-semibold text-lg">Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 text-[#F2A900] hover:text-[#D99700] transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          <div className={`grid md:grid-cols-2 gap-8 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            {/* Category Filter */}
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#F2A900]/10">
              <h3 className="text-white font-semibold mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-4 h-4 accent-[#F2A900]"
                    />
                    <span className="text-gray-300 group-hover:text-[#F2A900] transition-colors">
                      {cat === 'all' ? 'All Categories' : (categoryNames[cat as keyof typeof categoryNames] || cat)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#F2A900]/10">
              <h3 className="text-white font-semibold mb-4">Type</h3>
              <div className="space-y-3">
                {types.map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={selectedType === type}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-4 h-4 accent-[#F2A900]"
                    />
                    <span className="text-gray-300 group-hover:text-[#F2A900] transition-colors flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: type === 'all' ? '#999' : typeNames[type as keyof typeof typeNames]?.color || '#999'
                        }}
                      />
                      {type === 'all' ? 'All Types' : (typeNames[type as keyof typeof typeNames]?.name || type)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#F2A900]/10 border border-[#F2A900]/30 rounded-lg text-[#F2A900] hover:bg-[#F2A900]/20 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-8 text-gray-400">
          <p>Found <span className="text-[#F2A900] font-semibold">{filteredItems.length}</span> items</p>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading menu...</div>
        ) : filteredItems.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#F2A900]/12 hover:border-[#F2A900]/35 transition-all duration-300 hover:shadow-2xl gold-ring animate-fade-in"
                style={{ animationDelay: `${(index % 8) * 50}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[#0a0a0a]">
                  <img
                    src={getImageUrl(item.image_url)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = '/banner.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                  {/* Type Badge */}
                  {item.type_id && (
                    <div className="absolute top-3 right-3 z-20">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: typeNames[item.type_id]?.color || '#666' }}
                      >
                        {typeNames[item.type_id]?.name || item.type_id}
                      </span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {item.is_featured && (
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold text-black bg-[#F2A900]">
                        ⭐ Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{item.name}</h3>

                  {item.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  )}

                  {/* Price and Unit */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-[#F2A900] font-bold text-2xl">₹{item.price}</p>
                      <p className="text-gray-500 text-xs">per {item.unit_type}</p>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${addedToCart === item.id
                      ? 'bg-green-600 text-white'
                      : 'bg-[#F2A900] hover:bg-[#D99700] text-black'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addedToCart === item.id ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No items found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="px-6 py-3 bg-[#F2A900] hover:bg-[#D99700] text-black font-semibold rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Menu Item Detail Modal */}
      {selectedItem && (
        <MenuItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={(quantity) => handleAddToCartFromModal(selectedItem, quantity)}
        />
      )}
    </div>
  );
}


