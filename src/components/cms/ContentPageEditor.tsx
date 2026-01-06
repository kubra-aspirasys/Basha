import { useEffect, useState } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { FileText, Save, Eye } from 'lucide-react';

export default function ContentPageEditor() {
  const {
    contentPages,
    loading,
    fetchContentPages,
    updateContentPage,
  } = useCMSEnhancedStore();

  const [selectedPage, setSelectedPage] = useState<string>('about_us');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    is_published: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContentPages();
  }, []);

  useEffect(() => {
    const page = contentPages.find((p) => p.page_key === selectedPage);
    if (page) {
      setFormData({
        title: page.title,
        content: page.content,
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        is_published: page.is_published,
      });
    }
  }, [selectedPage, contentPages]);

  const handleSave = async () => {
    const page = contentPages.find((p) => p.page_key === selectedPage);
    if (!page) return;

    setSaving(true);
    await updateContentPage(page.id, {
      title: formData.title,
      content: formData.content,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      is_published: formData.is_published,
    });
    setSaving(false);
  };

  const pageOptions = [
    { key: 'about_us', label: 'About Us' },
    { key: 'terms_conditions', label: 'Terms & Conditions' },
    { key: 'privacy_policy', label: 'Privacy Policy' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Content Pages Editor
          </h3>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-500/80 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Page
            </label>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {pageOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Page Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
              rows={15}
              placeholder="Enter HTML content here..."
            />
            <p className="text-xs text-slate-500 mt-1">
              You can use HTML tags for formatting: &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Meta Title (SEO)
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Optional SEO title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Meta Description (SEO)
              </label>
              <input
                type="text"
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Optional SEO description"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_published" className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Published (visible to public)
            </label>
          </div>

          {formData.content && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preview</h4>
              <div
                className="prose dark:prose-invert max-w-none p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
