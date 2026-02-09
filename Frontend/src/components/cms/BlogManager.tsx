import { useEffect, useState } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { Newspaper, Plus, Trash2, CreditCard as Edit2, Eye, EyeOff, X, Upload, Calendar } from 'lucide-react';
import { BlogPost } from '@/types/cms';
import { useToast } from '@/hooks/use-toast';
import { DeleteModal } from './DeleteModal';

export default function BlogManager() {
  const {
    blogPosts,
    loading,
    fetchBlogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    uploadImage,
  } = useCMSEnhancedStore();

  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author: 'SR FoodKraft',
    category: 'news',
    tags: [] as string[],
    is_published: false,
    published_at: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      author: 'SR FoodKraft',
      category: 'news',
      tags: [],
      is_published: false,
      published_at: '',
    });
    setEditingPost(null);
    setShowForm(false);
    setTagInput('');
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featured_image_url: post.featured_image_url || '',
      author: post.author,
      category: post.category,
      tags: post.tags || [],
      is_published: post.is_published,
      published_at: post.published_at ? post.published_at.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'blog');
      setFormData({ ...formData, featured_image_url: imageUrl });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      featured_image_url: formData.featured_image_url || null,
      author: formData.author,
      category: formData.category,
      tags: formData.tags,
      is_published: formData.is_published,
      published_at: formData.published_at || null,
      views_count: 0,
    };

    if (editingPost) {
      await updateBlogPost(editingPost.id, postData);
      toast({
        title: 'Blog post updated',
        description: 'Your blog post has been updated successfully.',
      });
    } else {
      await addBlogPost(postData);
      toast({
        title: 'Blog post created',
        description: 'Your new blog post has been created and saved.',
      });
    }
    resetForm();
  };

  const handleTogglePublished = async (id: string, isPublished: boolean) => {
    await updateBlogPost(id, {
      is_published: !isPublished,
      published_at: !isPublished ? new Date().toISOString() : null,
    });
  };

  const handleDelete = (id: string) => {
    const post = blogPosts.find(p => p.id === id);
    if (post) {
      setPostToDelete(post);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      await deleteBlogPost(postToDelete.id);
      toast({
        title: 'Post deleted',
        description: 'The blog post has been removed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete the post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  const categories = ['news', 'recipes', 'updates', 'events', 'tips', 'announcements'];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Blog & News Management
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 gradient-primary text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'New Post'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Excerpt (Short Description)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Brief summary..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={10}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                placeholder="Enter HTML content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Featured Image
              </label>
              {formData.featured_image_url && (
                <img src={formData.featured_image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-all w-fit">
                <Upload className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Type tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-info/10 dark:bg-info/20 text-info dark:text-info rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-info dark:hover:text-info"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="blog_is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="blog_is_published" className="text-sm text-slate-700 dark:text-slate-300">
                Published
              </label>
            </div>

            <button
              type="submit"
              disabled={!formData.title || !formData.slug || !formData.content}
              className="px-6 py-2 gradient-primary text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingPost ? 'Update Post' : 'Create Post'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading blog posts...</div>
        ) : (
          <div className="space-y-4">
            {blogPosts.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No blog posts yet. Create your first post!</p>
            ) : (
              blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{post.title}</h4>
                      {post.excerpt && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{post.excerpt}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {post.category}
                        </span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not set'}
                        </span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {post.views_count} views
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${post.is_published ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs bg-info/10 dark:bg-info/20 text-info dark:text-info px-2 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-3 py-1.5 bg-info text-white rounded text-sm hover:bg-info/90 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleTogglePublished(post.id, post.is_published)}
                        className="px-3 py-1.5 bg-slate-500 text-white rounded text-sm hover:bg-slate-600 flex items-center gap-1"
                      >
                        {post.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1.5 bg-error text-white rounded text-sm hover:bg-error/90 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={confirmDelete}
        itemName={postToDelete?.title}
        loading={isDeleting}
      />
    </div>
  );
}
