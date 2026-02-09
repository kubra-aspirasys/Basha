import { useEffect, useState, useMemo } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Grid3x3,
  Search,
  // Filter,
  // Upload,
  Eye,
  EyeOff,
  // GripVertical,
  BarChart3,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { ProductCategory, ProductType } from '@/types/cms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeleteModal } from './DeleteModal';

export default function ProductCategoryManager() {
  const {
    productCategories,
    productTypes,
    loading,
    error,
    fetchProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    fetchProductTypes,
    addProductType,
    updateProductType,
    deleteProductType,
    uploadImage,
  } = useCMSEnhancedStore();

  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingType, setIsAddingType] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Delete modal state
  const [deleteData, setDeleteData] = useState<{
    id: string | null;
    type: 'category' | 'type' | 'bulk' | null;
    name: string;
  }>({ id: null, type: null, name: '' });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: null as string | null,
    image_url: null as string | null,
    display_order: 0,
    is_active: true,
  });

  const [typeForm, setTypeForm] = useState({
    name: '',
    slug: '',
    icon: null as string | null,
    color: '#6B7280',
    display_order: 0,
    is_active: true,
  });

  // Computed values
  const filteredCategories = useMemo(() => {
    let filtered = productCategories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Active/Inactive filter
    if (filterActive !== 'all') {
      filtered = filtered.filter(category =>
        filterActive === 'active' ? category.is_active : !category.is_active
      );
    }

    return filtered.sort((a, b) => a.display_order - b.display_order);
  }, [productCategories, searchTerm, filterActive]);

  const stats = useMemo(() => ({
    total: productCategories.length,
    active: productCategories.filter(c => c.is_active).length,
    inactive: productCategories.filter(c => !c.is_active).length,
    withImages: productCategories.filter(c => c.image_url).length,
  }), [productCategories]);

  useEffect(() => {
    fetchProductCategories();
    fetchProductTypes();
  }, []);

  const handleAddCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          variant: 'destructive',
        });
        return;
      }

      await addProductCategory(categoryForm);
      setCategoryForm({ name: '', slug: '', description: '', icon: null, image_url: null, display_order: 0, is_active: true });
      setIsAddingCategory(false);
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add category',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Category name is required',
          variant: 'destructive',
        });
        return;
      }

      if (editingCategory) {
        await updateProductCategory(editingCategory.id, categoryForm);
        setEditingCategory(null);
        setCategoryForm({ name: '', slug: '', description: '', icon: null, image_url: null, display_order: 0, is_active: true });
        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = productCategories.find(c => c.id === id);
    setDeleteData({
      id,
      type: 'category',
      name: category?.name || 'this category'
    });
  };

  const confirmDelete = async () => {
    if (!deleteData.id && deleteData.type !== 'bulk') return;

    try {
      if (deleteData.type === 'category') {
        await deleteProductCategory(deleteData.id!);
        toast({
          title: 'Category deleted',
          description: 'The category has been removed successfully.',
        });
      } else if (deleteData.type === 'type') {
        await deleteProductType(deleteData.id!);
        toast({
          title: 'Product type deleted',
          description: 'The product type has been removed successfully.',
        });
      } else if (deleteData.type === 'bulk') {
        const promises = selectedCategories.map(id => deleteProductCategory(id));
        await Promise.all(promises);
        setSelectedCategories([]);
        toast({
          title: 'Categories deleted',
          description: `${selectedCategories.length} categories have been removed successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteData({ id: null, type: null, name: '' });
    }
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon,
      image_url: category.image_url,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setIsAddingCategory(false);
  };

  const handleCancelCategory = () => {
    setEditingCategory(null);
    setIsAddingCategory(false);
    setCategoryForm({ name: '', slug: '', description: '', icon: '', image_url: null, display_order: 0, is_active: true });
  };

  const handleAddType = async () => {
    try {
      await addProductType(typeForm);
      setTypeForm({ name: '', slug: '', icon: null, color: '#6B7280', display_order: 0, is_active: true });
      setIsAddingType(false);
      toast({
        title: 'Product type added',
        description: 'New product type has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product type',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateType = async () => {
    if (editingType) {
      try {
        await updateProductType(editingType.id, typeForm);
        setEditingType(null);
        setTypeForm({ name: '', slug: '', icon: null, color: '#6B7280', display_order: 0, is_active: true });
        toast({
          title: 'Product type updated',
          description: 'Product type has been updated successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update product type',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteType = async (id: string) => {
    const type = productTypes.find(t => t.id === id);
    setDeleteData({
      id,
      type: 'type',
      name: type?.name || 'this product type'
    });
  };

  const handleEditType = (type: ProductType) => {
    setEditingType(type);
    setTypeForm({
      name: type.name,
      slug: type.slug,
      icon: type.icon,
      color: type.color,
      display_order: type.display_order,
      is_active: type.is_active,
    });
    setIsAddingType(false);
  };

  const handleCancelType = () => {
    setEditingType(null);
    setIsAddingType(false);
    setTypeForm({ name: '', slug: '', icon: null, color: '#6B7280', display_order: 0, is_active: true });
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'category-images');
      setCategoryForm(prev => ({ ...prev, image_url: imageUrl }));
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkToggle = async (active: boolean) => {
    try {
      const promises = selectedCategories.map(id =>
        updateProductCategory(id, { is_active: active })
      );
      await Promise.all(promises);
      setSelectedCategories([]);
      toast({
        title: 'Success',
        description: `${selectedCategories.length} categories ${active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update categories',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    setDeleteData({
      id: null,
      type: 'bulk',
      name: `${selectedCategories.length} categories`
    });
  };

  const toggleCategorySelection = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(catId => catId !== id)
        : [...prev, id]
    );
  };

  // const selectAllCategories = () => {
  //   setSelectedCategories(filteredCategories.map(cat => cat.id));
  // };

  const clearSelection = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Categories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <EyeOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Inactive</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">With Images</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.withImages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Grid3x3 className="w-5 h-5" />
              Product Categories
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full sm:w-auto"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline ml-2">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                <span className="sm:hidden ml-2">{showPreview ? 'Hide' : 'Preview'}</span>
              </Button>
              <Button
                onClick={() => {
                  setIsAddingCategory(true);
                  setEditingCategory(null);
                }}
                className="bg-[#e67e22] hover:bg-[#d35400] text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterActive === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('all')}
                  className={`flex-1 sm:flex-none ${filterActive === 'all' ? 'bg-[#e67e22] hover:bg-[#d35400] text-white border-transparent' : ''}`}
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={filterActive === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('active')}
                  className={`flex-1 sm:flex-none ${filterActive === 'active' ? 'bg-[#e67e22] hover:bg-[#d35400] text-white border-transparent' : ''}`}
                >
                  Active ({stats.active})
                </Button>
                <Button
                  variant={filterActive === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterActive('inactive')}
                  className={`flex-1 sm:flex-none ${filterActive === 'inactive' ? 'bg-[#e67e22] hover:bg-[#d35400] text-white border-transparent' : ''}`}
                >
                  Inactive ({stats.inactive})
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedCategories.length} selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkToggle(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkToggle(false)}
                    className="flex-1 sm:flex-none"
                  >
                    <EyeOff className="w-4 h-4 mr-1" />
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearSelection}
                    className="flex-1 sm:flex-none"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {(isAddingCategory || editingCategory) && (
            <div className="mb-4 sm:mb-6 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-lg space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h4 className="text-base sm:text-lg font-semibold">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCategory}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Name *</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="e.g., Main Course"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-slug">Slug</Label>
                    <Input
                      id="category-slug"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      placeholder="e.g., main-course"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Brief description of the category"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-order">Display Order</Label>
                    <Input
                      id="category-order"
                      type="number"
                      value={categoryForm.display_order}
                      onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Category Image</Label>
                    <div className="mt-2 space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        disabled={isUploading}
                        className="mt-1"
                      />
                      {categoryForm.image_url && (
                        <div className="relative">
                          <img
                            src={categoryForm.image_url}
                            alt="Category preview"
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCategoryForm(prev => ({ ...prev, image_url: null }))}
                            className="absolute -top-2 -right-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Uploading...
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="category-active"
                      checked={categoryForm.is_active}
                      onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
                    />
                    <Label htmlFor="category-active">Active</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  disabled={loading || isUploading}
                  className="bg-[#e67e22] hover:bg-[#d35400] text-white w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelCategory}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Grid3x3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No categories found</p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border transition-all gap-4 ${selectedCategories.includes(category.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategorySelection(category.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">{category.name}</h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400">({category.slug})</span>
                          {category.is_active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Order: {category.display_order}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCategory(category)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="ml-1 sm:hidden">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="ml-1 sm:hidden">Delete</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Types Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Grid3x3 className="w-5 h-5" />
              Product Types (Veg/Non-Veg)
            </CardTitle>
            <Button
              onClick={() => {
                setIsAddingType(true);
                setEditingType(null);
              }}
              className="bg-[#e67e22] hover:bg-[#d35400] text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Type Form */}
          {(isAddingType || editingType) && (
            <div className="mb-4 sm:mb-6 bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-lg space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h4 className="text-base sm:text-lg font-semibold">
                  {editingType ? 'Edit Product Type' : 'Add New Product Type'}
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelType}
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type-name">Name *</Label>
                    <Input
                      id="type-name"
                      value={typeForm.name}
                      onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                      placeholder="e.g., Veg"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type-slug">Slug</Label>
                    <Input
                      id="type-slug"
                      value={typeForm.slug}
                      onChange={(e) => setTypeForm({ ...typeForm, slug: e.target.value })}
                      placeholder="e.g., veg"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type-order">Display Order</Label>
                    <Input
                      id="type-order"
                      type="number"
                      value={typeForm.display_order}
                      onChange={(e) => setTypeForm({ ...typeForm, display_order: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="type-active"
                      checked={typeForm.is_active}
                      onCheckedChange={(checked) => setTypeForm({ ...typeForm, is_active: checked })}
                    />
                    <Label htmlFor="type-active">Active</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={editingType ? handleUpdateType : handleAddType}
                  disabled={loading}
                  className="bg-[#e67e22] hover:bg-[#d35400] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingType ? 'Update Type' : 'Add Type'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelType}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Types List */}
          <div className="space-y-3">
            {productTypes.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Grid3x3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No product types found</p>
              </div>
            ) : (
              productTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">{type.name}</h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">({type.slug})</span>
                        {type.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Order: {type.display_order}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditType(type)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteType(type.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <DeleteModal
        isOpen={deleteData.type !== null}
        onClose={() => setDeleteData({ id: null, type: null, name: '' })}
        onConfirm={confirmDelete}
        itemName={deleteData.name}
        loading={loading}
      />
    </div>
  );
}
