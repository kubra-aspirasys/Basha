import { useState, useEffect } from 'react';
import { useMenuStore } from '@/store/menu-store';
import { useOfferStore } from '@/store/offer-store';
import { Plus, Pencil, Trash2, Search, Upload, Link as LinkIcon, X, Star, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { categoryNames, typeNames } from '@/lib/menu-mock-data';

const UNIT_TYPES = ['piece', 'kg', 'gram', 'plate', 'bowl', 'liter', 'ml', 'dozen', 'box', 'packet'];

export default function Menu() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, loading } = useMenuStore();
  const { offers } = useOfferStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [isListViewOpen, setIsListViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    type_id: '',
    image_url: '',
    unit_type: 'kg',
    min_order_qty: '1',
    max_order_qty: '',
    pre_order_time: '',
    is_available: true,
    is_featured: false,
    offer_code: '',
  });

  const [offerValidation, setOfferValidation] = useState({
    isValid: false,
    offer: null as any,
    discountedPrice: 0,
    message: '',
  });

  const filteredItems = menuItems.filter((item) => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter;

    // Type filter
    const matchesType = typeFilter === 'all' || item.type_id === typeFilter;

    // Availability filter
    const matchesAvailability = availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && item.is_available) ||
      (availabilityFilter === 'unavailable' && !item.is_available);

    // Featured filter
    const matchesFeatured = featuredFilter === 'all' ||
      (featuredFilter === 'featured' && item.is_featured) ||
      (featuredFilter === 'regular' && !item.is_featured);

    return matchesSearch && matchesCategory && matchesType && matchesAvailability && matchesFeatured;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const getCategoryName = (categoryId?: string) => {
    return categoryNames[categoryId || ''] || 'Uncategorized';
  };

  const getTypeName = (typeId?: string) => {
    return typeNames[typeId || '']?.name || '';
  };

  const getTypeColor = (typeId?: string) => {
    return typeNames[typeId || '']?.color || '#6B7280';
  };

  // Offer validation logic
  const validateOfferCode = (code: string, price: number) => {
    if (!code.trim()) {
      setOfferValidation({
        isValid: false,
        offer: null,
        discountedPrice: 0,
        message: '',
      });
      return;
    }

    const offer = offers.find(o => o.code.toUpperCase() === code.toUpperCase());

    if (!offer) {
      setOfferValidation({
        isValid: false,
        offer: null,
        discountedPrice: 0,
        message: 'Invalid offer code',
      });
      return;
    }

    // Check if offer is active
    if (!offer.is_active) {
      setOfferValidation({
        isValid: false,
        offer: null,
        discountedPrice: 0,
        message: 'Offer is not active',
      });
      return;
    }

    // Check if offer is within valid date range
    const now = new Date();
    const validFrom = new Date(offer.valid_from);
    const validTo = new Date(offer.valid_to);

    if (now < validFrom || now > validTo) {
      setOfferValidation({
        isValid: false,
        offer: null,
        discountedPrice: 0,
        message: 'Offer has expired or not yet active',
      });
      return;
    }

    // Calculate discounted price
    let discountedPrice = price;
    if (offer.discount_type === 'percentage') {
      discountedPrice = price * (1 - offer.discount_value / 100);
    } else if (offer.discount_type === 'fixed') {
      discountedPrice = Math.max(0, price - offer.discount_value);
    }

    setOfferValidation({
      isValid: true,
      offer: offer,
      discountedPrice: Math.round(discountedPrice * 100) / 100, // Round to 2 decimal places
      message: `Valid offer! ${offer.discount_type === 'percentage' ? `${offer.discount_value}% off` : `₹${offer.discount_value} off`}`,
    });
  };

  // Effect to validate offer when code or price changes
  useEffect(() => {
    if (formData.offer_code && formData.price) {
      validateOfferCode(formData.offer_code, parseFloat(formData.price));
    } else {
      setOfferValidation({
        isValid: false,
        offer: null,
        discountedPrice: 0,
        message: '',
      });
    }
  }, [formData.offer_code, formData.price, offers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemData: any = {
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      category_id: formData.category_id || undefined,
      type_id: formData.type_id || undefined,
      image_url: formData.image_url || undefined,
      unit_type: formData.unit_type,
      min_order_qty: parseFloat(formData.min_order_qty),
      max_order_qty: formData.max_order_qty ? parseFloat(formData.max_order_qty) : undefined,
      pre_order_time: formData.pre_order_time ? parseInt(formData.pre_order_time) : undefined,
      is_available: formData.is_available,
      is_featured: formData.is_featured,
      featured_priority: formData.is_featured ? (menuItems.filter(item => item.is_featured).length + 1) : undefined,
      offer_code: formData.offer_code || undefined,
      offer_discount_type: offerValidation.isValid ? offerValidation.offer?.discount_type : undefined,
      offer_discount_value: offerValidation.isValid ? offerValidation.offer?.discount_value : undefined,
      discounted_price: offerValidation.isValid ? offerValidation.discountedPrice : undefined,
    };

    if (editingItem) {
      updateMenuItem(editingItem, itemData);
    } else {
      addMenuItem(itemData);
    }
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      type_id: '',
      image_url: '',
      unit_type: 'kg',
      min_order_qty: '1',
      max_order_qty: '',
      pre_order_time: '',
      is_available: true,
      is_featured: false,
      offer_code: '',
    });
    setEditingItem(null);
    setImageMode('url');
    setOfferValidation({
      isValid: false,
      offer: null,
      discountedPrice: 0,
      message: '',
    });
  };

  const handleEdit = (item: typeof menuItems[0]) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category_id: item.category_id || '',
      type_id: item.type_id || '',
      image_url: item.image_url || '',
      unit_type: item.unit_type,
      min_order_qty: item.min_order_qty.toString(),
      max_order_qty: item.max_order_qty?.toString() || '',
      pre_order_time: item.pre_order_time?.toString() || '',
      is_available: item.is_available,
      is_featured: item.is_featured || false,
      offer_code: item.offer_code || '',
    });
    setEditingItem(item.id);
    setIsOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMenuItem(id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setTypeFilter('all');
    setAvailabilityFilter('all');
    setFeaturedFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleToggleAvailability = (id: string, isAvailable: boolean) => {
    updateMenuItem(id, { is_available: !isAvailable });
  };

  const handleToggleFeatured = (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      const newFeaturedStatus = !item.is_featured;
      const featuredCount = menuItems.filter(menuItem => menuItem.is_featured).length;

      updateMenuItem(id, {
        is_featured: newFeaturedStatus,
        featured_priority: newFeaturedStatus ? featuredCount + 1 : undefined
      });
    }
  };

  const handleDoubleClick = (item: typeof menuItems[0]) => {
    setSelectedItem(item);
    setIsListViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Menu Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your restaurant menu items
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Menu Item
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search menu items..."
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
              {(categoryFilter !== 'all' || typeFilter !== 'all' || availabilityFilter !== 'all' || featuredFilter !== 'all' || searchTerm) && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryNames).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  {Object.entries(typeNames).map(([id, type]) => (
                    <option key={id} value={id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Availability
                </label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Items</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              {/* Featured Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Featured
                </label>
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Items</option>
                  <option value="featured">Featured</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>
              Showing {filteredItems.length} of {menuItems.length} menu items
              {(categoryFilter !== 'all' || typeFilter !== 'all' || availabilityFilter !== 'all' || featuredFilter !== 'all' || searchTerm) && (
                <span className="text-slate-500 dark:text-slate-500"> (filtered)</span>
              )}
            </span>
          </div>

          {/* Active Filters Summary */}
          {(categoryFilter !== 'all' || typeFilter !== 'all' || availabilityFilter !== 'all' || featuredFilter !== 'all') && (
            <div className="flex flex-wrap gap-2">
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-sm">
                  Category: {categoryNames[categoryFilter as keyof typeof categoryNames]}
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {typeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm">
                  Type: {typeNames[typeFilter as keyof typeof typeNames]?.name}
                  <button
                    onClick={() => setTypeFilter('all')}
                    className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {availabilityFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-sm">
                  Availability: {availabilityFilter.charAt(0).toUpperCase() + availabilityFilter.slice(1)}
                  <button
                    onClick={() => setAvailabilityFilter('all')}
                    className="ml-1 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {featuredFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full text-sm">
                  Featured: {featuredFilter.charAt(0).toUpperCase() + featuredFilter.slice(1)}
                  <button
                    onClick={() => setFeaturedFilter('all')}
                    className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Min Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Pre-order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  onDoubleClick={() => handleDoubleClick(item)}
                >
                  <td className="px-6 py-4">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-xs text-slate-500">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                      {item.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      {item.offer_code && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <Tag className="w-3 h-3" />
                          {item.offer_code}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">{item.description}</div>
                    )}
                    {item.offer_code && item.discounted_price && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Offer Price: ₹{item.discounted_price}
                        <span className="text-slate-500 dark:text-slate-400 ml-1">
                          (Save ₹{(item.price - item.discounted_price).toFixed(2)})
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{getCategoryName(item.category_id)}</td>
                  <td className="px-6 py-4">
                    {item.type_id && (
                      <span
                        className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                        style={{ backgroundColor: getTypeColor(item.type_id) }}
                      >
                        {getTypeName(item.type_id)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {item.offer_code && item.discounted_price ? (
                      <div className="flex flex-col">
                        <span className="text-slate-500 dark:text-slate-400 line-through text-sm">₹{item.price}</span>
                        <span className="text-green-600 dark:text-green-400 font-bold">₹{item.discounted_price}</span>
                      </div>
                    ) : (
                      <span>₹{item.price}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {item.min_order_qty} {item.unit_type}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {item.pre_order_time ? `${item.pre_order_time} hrs` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.is_available)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.is_available ? 'bg-gold-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`p-2 rounded-lg transition-colors ${item.is_featured
                        ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        }`}
                    >
                      <Star className={`w-4 h-4 ${item.is_featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-info hover:bg-info/10 dark:hover:bg-info/20 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 text-error hover:bg-error/10 dark:hover:bg-error/20 rounded-lg"
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
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
              onDoubleClick={() => handleDoubleClick(item)}
            >
              <div className="space-y-4">
                {/* Header with Image and Basic Info */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="text-xs text-slate-500">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">{item.name}</h3>
                      {item.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300">
                          <Star className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                      {item.offer_code && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <Tag className="w-3 h-3" />
                          {item.offer_code}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{item.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span>{getCategoryName(item.category_id)}</span>
                      {item.type_id && (
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getTypeColor(item.type_id) }}
                        >
                          {getTypeName(item.type_id)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Offer Info */}
                <div className="flex items-center justify-between">
                  <div>
                    {item.offer_code && item.discounted_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400 line-through text-sm">₹{item.price}</span>
                        <span className="text-green-600 dark:text-green-400 font-bold text-lg">₹{item.discounted_price}</span>
                        <span className="text-xs text-green-600 dark:text-green-400">
                          (Save ₹{(item.price - item.discounted_price).toFixed(2)})
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-slate-900 dark:text-white">₹{item.price}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item.id, item.is_available)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.is_available ? 'bg-gold-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.is_available ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(item.id)}
                      className={`p-2 rounded-lg transition-colors ${item.is_featured
                        ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        }`}
                    >
                      <Star className={`w-4 h-4 ${item.is_featured ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="font-medium">Min Order:</span>
                    <span className="ml-1">{item.min_order_qty} {item.unit_type}</span>
                  </div>
                  <div>
                    <span className="font-medium">Pre-order:</span>
                    <span className="ml-1">{item.pre_order_time ? `${item.pre_order_time} hrs` : '-'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
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

        {filteredItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="menu items"
          />
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Offer Code Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Offer Code (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.offer_code}
                    onChange={(e) => setFormData({ ...formData, offer_code: e.target.value.toUpperCase() })}
                    placeholder="Enter offer code (e.g., WELCOME50)"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white pr-10"
                  />
                  <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>

                {/* Offer Validation Message */}
                {formData.offer_code && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${offerValidation.isValid
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : offerValidation.message
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                    {offerValidation.isValid ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : offerValidation.message ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Tag className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="flex-1">
                      {offerValidation.message || 'Enter a valid offer code to see discount'}
                    </span>
                  </div>
                )}

                {/* Discounted Price Display */}
                {offerValidation.isValid && offerValidation.discountedPrice > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Discounted Price</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Original: ₹{formData.price} → Final: ₹{offerValidation.discountedPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                          ₹{offerValidation.discountedPrice}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Save ₹{(parseFloat(formData.price) - offerValidation.discountedPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(categoryNames).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Type (Veg/Non-Veg)
                  </label>
                  <select
                    value={formData.type_id}
                    onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Type</option>
                    {Object.entries(typeNames).map(([key, { name }]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Unit Type *
                  </label>
                  <select
                    value={formData.unit_type}
                    onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    {UNIT_TYPES.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Min Order Qty *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.min_order_qty}
                    onChange={(e) => setFormData({ ...formData, min_order_qty: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Max Order Qty
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_order_qty}
                    onChange={(e) => setFormData({ ...formData, max_order_qty: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pre-order Time (hrs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g., 2"
                  value={formData.pre_order_time}
                  onChange={(e) => setFormData({ ...formData, pre_order_time: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Image
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${imageMode === 'url'
                      ? 'bg-gold-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`px-3 py-1.5 rounded-lg text-sm ${imageMode === 'upload'
                      ? 'bg-gold-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    <Upload className="w-4 h-4 inline mr-1" />
                    Upload
                  </button>
                </div>
                {imageMode === 'url' ? (
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                ) : (
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Image upload coming soon. Please use URL for now.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-700 dark:text-slate-300">Available for ordering</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Featured item
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {editingItem ? 'Update' : 'Add'} Menu Item
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List View Modal */}
      {isListViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
                Menu Item Details
              </h2>
              <button
                onClick={() => setIsListViewOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  {selectedItem.image_url ? (
                    <img
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="text-slate-500 dark:text-slate-400 text-sm">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-center sm:text-left">
                      {selectedItem.name}
                    </h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                      {selectedItem.is_featured && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300">
                          <Star className="w-4 h-4" />
                          Featured
                        </span>
                      )}
                      {selectedItem.offer_code && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <Tag className="w-4 h-4" />
                          {selectedItem.offer_code}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedItem.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-center sm:text-left">
                      {selectedItem.description}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center sm:text-left">
                      {selectedItem.offer_code && selectedItem.discounted_price ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="text-slate-500 dark:text-slate-400 line-through text-lg sm:text-xl">₹{selectedItem.price}</span>
                            <span className="text-green-600 dark:text-green-400 text-xl sm:text-2xl">₹{selectedItem.discounted_price}</span>
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400 font-medium text-center sm:text-left">
                            Save ₹{(selectedItem.price - selectedItem.discounted_price).toFixed(2)}
                          </div>
                        </div>
                      ) : (
                        <span>₹{selectedItem.price}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Category:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {getCategoryName(selectedItem.category_id)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Type:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {selectedItem.type_id ? (
                          <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getTypeColor(selectedItem.type_id) }}
                          >
                            {getTypeName(selectedItem.type_id)}
                          </span>
                        ) : (
                          'Not specified'
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Unit Type:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {selectedItem.unit_type}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Min Order Qty:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {selectedItem.min_order_qty} {selectedItem.unit_type}
                      </span>
                    </div>

                    {selectedItem.max_order_qty && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Max Order Qty:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {selectedItem.max_order_qty} {selectedItem.unit_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Status & Timing</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Availability:</span>
                      <span className={`font-medium ${selectedItem.is_available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedItem.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>

                    {selectedItem.pre_order_time && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Pre-order Time:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {selectedItem.pre_order_time} hours
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Created:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(selectedItem.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {new Date(selectedItem.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              {selectedItem.offer_code && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Offer Details</h4>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">Offer Code:</span>
                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                          {selectedItem.offer_code}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">Discount Type:</span>
                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                          {selectedItem.offer_discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">Discount Value:</span>
                        <p className="text-lg font-bold text-green-800 dark:text-green-200">
                          {selectedItem.offer_discount_type === 'percentage'
                            ? `${selectedItem.offer_discount_value}%`
                            : `₹${selectedItem.offer_discount_value}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setIsListViewOpen(false);
                    handleEdit(selectedItem);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Item
                </button>
                <button
                  onClick={() => setIsListViewOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
