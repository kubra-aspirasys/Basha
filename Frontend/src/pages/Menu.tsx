import { useState, useEffect } from 'react';
import { useMenuStore } from '@/store/menu-store';
import { useOfferStore } from '@/store/offer-store';
import { Plus, Pencil, Trash2, Search, Upload, Link as LinkIcon, X, Star, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
// Removed mock import
// import { categoryNames, typeNames } from '@/lib/menu-mock-data';

const UNIT_TYPES = ['piece', 'kg', 'gram', 'plate', 'bowl', 'liter', 'ml', 'dozen', 'box', 'packet'];

export default function Menu() {
  const {
    menuItems,
    categories,
    productTypes,
    totalItems,
    totalPages,
    currentPage,

    fetchMenuItems,
    fetchCategories,
    fetchProductTypes,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleFeatured,
    createCategory,
    createProductType
  } = useMenuStore();
  const { offers, fetchOffers } = useOfferStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    unit_type: 'plate',
    min_order_qty: '1',
    max_order_qty: '1',
    image_url: '',
    is_available: true,
    is_featured: false,
    preparation_time: '',
    pre_order_time: '1',
    offer_code: ''
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');

  const [offerValidation, setOfferValidation] = useState({
    isValid: false,
    offer: null as any,
    discountedPrice: 0,
    message: '',
  });

  // Initial Data Fetch
  useEffect(() => {
    fetchCategories();
    fetchProductTypes();
    fetchOffers();
  }, [fetchCategories, fetchProductTypes, fetchOffers]);

  // Debugging logs
  console.log('Menu Store State:', { categories, productTypes, menuItems, offers });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, typeFilter, availabilityFilter, featuredFilter, itemsPerPage, currentPage]);

  const fetchData = () => {
    fetchMenuItems({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      available: availabilityFilter !== 'all' ? availabilityFilter === 'available' : undefined,
      featured: featuredFilter !== 'all' ? featuredFilter === 'featured' : undefined,
    });
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Uncategorized';
  };

  const getTypeName = (typeId?: string) => {
    if (!typeId) return '';
    const type = productTypes.find(t => t.id === typeId);
    return type ? type.name : '';
  };

  const getTypeColor = (typeId?: string) => {
    if (!typeId) return '#6B7280';
    const type = productTypes.find(t => t.id === typeId);
    return type ? type.color : '#6B7280';
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    // Clean up the path
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;

    // Use the API URL to determine the base URL for images
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

    return `${baseUrl}/${cleanPath}`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Handle "Other" category
      let finalCategoryId = formData.category_id;
      if (formData.category_id === 'other') {
        const newCategory = await createCategory(newCategoryName);
        finalCategoryId = newCategory.id;
      }

      // Handle "Other" type
      let finalTypeId = formData.type_id;
      if (formData.type_id === 'other') {
        const newType = await createProductType(newTypeName);
        finalTypeId = newType.id;
      }

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('category_id', finalCategoryId);
      if (finalTypeId) submitData.append('type_id', finalTypeId);
      submitData.append('unit_type', formData.unit_type);
      submitData.append('min_order_qty', formData.min_order_qty);
      if (formData.max_order_qty) submitData.append('max_order_qty', formData.max_order_qty);
      if (formData.image_url && imageMode === 'url') submitData.append('image_url', formData.image_url);
      submitData.append('is_available', String(formData.is_available));
      submitData.append('is_featured', String(formData.is_featured));
      if (formData.preparation_time) submitData.append('preparation_time', formData.preparation_time);
      if (formData.pre_order_time) submitData.append('pre_order_time', formData.pre_order_time);
      if (formData.offer_code) submitData.append('offer_code', formData.offer_code);

      if (imageMode === 'upload' && imageFile) {
        submitData.append('image', imageFile);
      }

      if (editingItem) {
        await updateMenuItem(editingItem, submitData);
      } else {
        await addMenuItem(submitData);
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save menu item', error);
      // Ideally show toast here
    }
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
      preparation_time: '',
      pre_order_time: '',
      is_available: true,
      is_featured: false,
      offer_code: '',
    });
    setEditingItem(null);
    setImageMode('url');
    setImageFile(null);
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
      preparation_time: item.preparation_time?.toString() || '',
      pre_order_time: item.pre_order_time?.toString() || '',
      is_available: item.is_available,
      is_featured: item.is_featured || false,
      offer_code: item.offer_code || '',
    });
    setEditingItem(item.id);
    setImageMode('url'); // Default to URL, user can switch to upload if they want to replace it
    setIsOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteMenuItem(id);
    }
  };

  const handlePageChange = (page: number) => {
    fetchMenuItems({ page: page, limit: itemsPerPage });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    fetchMenuItems({ page: 1, limit: newItemsPerPage });
  };

  const clearAllFilters = () => {
    setCategoryFilter('all');
    setTypeFilter('all');
    setAvailabilityFilter('all');
    setFeaturedFilter('all');
    setSearchTerm('');
    fetchMenuItems({ page: 1, limit: itemsPerPage });
  };

  const handleToggleAvailability = async (id: string) => {
    await toggleAvailability(id);
  };

  const handleToggleFeatured = async (id: string) => {
    await toggleFeatured(id);
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
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
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
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
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
              Showing {menuItems.length} of {totalItems} menu items
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
                  Category: {categories.find(c => c.id === categoryFilter)?.name || 'Unknown'}
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
                  Type: {productTypes.find(t => t.id === typeFilter)?.name || 'Unknown'}
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
              {menuItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                  onDoubleClick={() => handleDoubleClick(item)}
                >
                  <td className="px-6 py-4">
                    {item.image_url ? (
                      <img src={getImageUrl(item.image_url)} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
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
                    {item.pre_order_time ? (`${item.pre_order_time} hrs`) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
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
          {menuItems.map((item) => (
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
                      <img src={getImageUrl(item.image_url)} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
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
                      onClick={() => handleToggleAvailability(item.id)}
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
                    <span className="ml-1">{item.pre_order_time ? (`${item.pre_order_time} hrs`) : '-'}</span>
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

        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemName="menu items"
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        <option value="other">Other (Add New)</option>
                      </select>
                      {formData.category_id === 'other' && (
                        <input
                          type="text"
                          required
                          placeholder="Enter new category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type_id}
                        onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="">Select Type</option>
                        {productTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                        <option value="other">Other (Add New)</option>
                      </select>
                      {formData.type_id === 'other' && (
                        <input
                          type="text"
                          required
                          placeholder="Enter new type name"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Offer Code Section */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Apply Offer Code (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.offer_code}
                        onChange={(e) => setFormData({ ...formData, offer_code: e.target.value.toUpperCase() })}
                        placeholder="e.g. SUMMER20"
                        className={`w-full pl-10 px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${offerValidation.isValid
                          ? 'border-green-500 focus:ring-green-500'
                          : formData.offer_code && !offerValidation.isValid
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-slate-300 dark:border-slate-600'
                          }`}
                      />
                      {formData.offer_code && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          {offerValidation.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {formData.offer_code && (
                      <div className={`mt-2 text-sm flex items-center gap-1 ${offerValidation.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                        <span>{offerValidation.message}</span>
                      </div>
                    )}
                    {offerValidation.isValid && (
                      <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        New Price: <span className="font-bold text-green-600 dark:text-green-400">₹{offerValidation.discountedPrice}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Item Image
                    </label>

                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${imageMode === 'url'
                          ? 'bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        <LinkIcon className="w-4 h-4" />
                        Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${imageMode === 'upload'
                          ? 'bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </button>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px] bg-slate-50 dark:bg-slate-800/50">
                      {imageMode === 'url' ? (
                        <div className="w-full space-y-4">
                          <input
                            type="url"
                            placeholder="Enter image URL..."
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                          {formData.image_url && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                              <img
                                src={formData.image_url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+URL')}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full text-center space-y-4">
                          {imageFile ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                              <img
                                src={URL.createObjectURL(imageFile)}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setImageFile(null)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-8 h-8 mx-auto text-slate-400" />
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                <label className="cursor-pointer text-gold-600 hover:text-gold-500">
                                  Upload a file
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) setImageFile(file);
                                    }}
                                  />
                                </label>
                                <p>or drag and drop</p>
                              </div>
                              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Unit Type
                      </label>
                      <select
                        value={formData.unit_type}
                        onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        {UNIT_TYPES.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Min Order Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.min_order_qty}
                        onChange={(e) => setFormData({ ...formData, min_order_qty: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Max Order Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.max_order_qty}
                        onChange={(e) => setFormData({ ...formData, max_order_qty: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Pre-order Time (hrs)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={formData.pre_order_time}
                        onChange={(e) => setFormData({ ...formData, pre_order_time: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Available</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List View Details Modal */}
      {isListViewOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Item Details</h2>
              <button
                type="button"
                onClick={() => setIsListViewOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
                {selectedItem.image_url ? (
                  <img
                    src={getImageUrl(selectedItem.image_url)}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    No Image Available
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedItem.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300">
                        {getCategoryName(selectedItem.category_id)}
                      </span>
                      {selectedItem.type_id && (
                        <span
                          className="px-2 py-1 rounded-lg text-sm text-white"
                          style={{ backgroundColor: getTypeColor(selectedItem.type_id) }}
                        >
                          {getTypeName(selectedItem.type_id)}
                        </span>
                      )}
                      {selectedItem.is_featured && (
                        <span className="px-2 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 rounded-lg text-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedItem.offer_code && selectedItem.discounted_price ? (
                      <>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{selectedItem.discounted_price}</div>
                        <div className="text-sm text-slate-500 line-through">₹{selectedItem.price}</div>
                      </>
                    ) : (
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{selectedItem.price}</div>
                    )}
                    <div className="text-sm text-slate-500">per {selectedItem.unit_type}</div>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">Description</h4>
                  <p className="text-slate-600 dark:text-slate-400">
                    {selectedItem.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">Min Order</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedItem.min_order_qty} {selectedItem.unit_type}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">Max Order</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedItem.max_order_qty || 'Unlimited'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">Pre-order</span>
                    <span className="font-medium text-slate-900 dark:text-white">{selectedItem.pre_order_time ? `${selectedItem.pre_order_time}h` : 'None'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 uppercase">Status</span>
                    <span className={`font-medium ${selectedItem.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedItem.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                {selectedItem.offer_code && (
                  <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-1">
                      <Tag className="w-4 h-4" />
                      Active Offer: {selectedItem.offer_code}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {selectedItem.offer_discount_type === 'percentage'
                        ? `${selectedItem.offer_discount_value}% off`
                        : `₹${selectedItem.offer_discount_value} off`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => {
                  setIsListViewOpen(false);
                  handleEdit(selectedItem);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" /> Edit Item
              </button>
              <button
                type="button"
                onClick={() => setIsListViewOpen(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
