import { useEffect, useState } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { Image, Upload, Trash2, Eye, EyeOff } from 'lucide-react';

export default function ImageGalleryManager() {
  const {
    galleryImages,
    loading,
    fetchGalleryImages,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    uploadImage,
  } = useCMSEnhancedStore();

  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    alt_text: '',
    category: 'general',
    display_order: 0,
  });

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'gallery');
      await addGalleryImage({
        title: formData.title || file.name,
        description: formData.description || null,
        image_url: imageUrl,
        alt_text: formData.alt_text || formData.title || file.name,
        category: formData.category,
        is_active: true,
        display_order: formData.display_order,
      });
      setFormData({
        title: '',
        description: '',
        alt_text: '',
        category: 'general',
        display_order: 0,
      });
      e.target.value = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateGalleryImage(id, { is_active: !isActive });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await deleteGalleryImage(id);
    }
  };

  const categories = ['general', 'food', 'restaurant', 'events', 'specials', 'team'];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Image className="w-5 h-5" />
          Image Gallery Manager
        </h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Image title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              rows={2}
              placeholder="Image description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Alt Text
            </label>
            <input
              type="text"
              value={formData.alt_text}
              onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Alt text for accessibility"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload Image
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-lg cursor-pointer hover:shadow-lg transition-all">
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Choose File'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {loading && !isUploading && (
          <div className="text-center py-8 text-slate-500">Loading images...</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <img
                src={image.image_url}
                alt={image.alt_text}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div>
                  <h4 className="text-white font-semibold text-sm mb-1">{image.title}</h4>
                  {image.description && (
                    <p className="text-white/80 text-xs line-clamp-2">{image.description}</p>
                  )}
                  <span className="inline-block mt-2 text-xs bg-white/20 text-white px-2 py-1 rounded">
                    {image.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(image.id, image.is_active)}
                    className="flex-1 px-3 py-1.5 bg-white/20 text-white rounded text-xs flex items-center justify-center gap-1 hover:bg-white/30"
                  >
                    {image.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {image.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="px-3 py-1.5 bg-error text-white rounded text-xs flex items-center gap-1 hover:bg-error/90"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
