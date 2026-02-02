import { useEffect, useState } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { Settings, Upload, Save } from 'lucide-react';
import { SiteSetting } from '@/types/cms';

export default function SiteSettingsManager() {
  const {
    siteSettings,
    loading,
    fetchSiteSettings,
    updateSiteSetting,
    uploadImage,
  } = useCMSEnhancedStore();

  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const handleChange = (id: string, value: string) => {
    setEditingValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (setting: SiteSetting) => {
    const newValue = editingValues[setting.id];
    if (newValue !== undefined && newValue !== setting.value) {
      await updateSiteSetting(setting.id, newValue);
      setEditingValues((prev) => {
        const updated = { ...prev };
        delete updated[setting.id];
        return updated;
      });
    }
  };

  const handleImageUpload = async (setting: SiteSetting, file: File) => {
    setUploadingKey(setting.key);
    try {
      const bucket = setting.key.includes('admin') ? 'admin' : 'branding';
      const imageUrl = await uploadImage(file, bucket);
      await updateSiteSetting(setting.id, imageUrl);
      setEditingValues((prev) => {
        const updated = { ...prev };
        delete updated[setting.id];
        return updated;
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingKey(null);
    }
  };

  const getValue = (setting: SiteSetting) => {
    return editingValues[setting.id] !== undefined ? editingValues[setting.id] : setting.value;
  };

  const hasChanges = (setting: SiteSetting) => {
    return editingValues[setting.id] !== undefined && editingValues[setting.id] !== setting.value;
  };

  const settingsByCategory = siteSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  const categoryLabels: Record<string, string> = {
    branding: 'Branding & Logos',
    contact: 'Contact Information',
    social: 'Social Media',
    general: 'General Settings',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Site Settings
        </h3>

        {loading && siteSettings.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Loading settings...</div>
        ) : (
          <div className="space-y-8">
            {Object.entries(settingsByCategory).map(([category, settings]) => (
              <div key={category}>
                <h4 className="text-sm sm:text-md font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                  {categoryLabels[category] || category}
                </h4>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="flex-1">
                          <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </label>
                          {setting.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        {hasChanges(setting) && (
                          <button
                            onClick={() => handleSave(setting)}
                            className="px-3 py-1 gradient-primary text-white rounded text-xs sm:text-sm flex items-center gap-1 hover:shadow-lg transition-all w-full sm:w-auto justify-center sm:justify-start"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        )}
                      </div>

                      {setting.type === 'image' ? (
                        <div className="space-y-2">
                          {getValue(setting) && (
                            <img
                              src={getValue(setting)}
                              alt={setting.key}
                              className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-2"
                            />
                          )}
                          <label className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-all w-full sm:w-fit text-xs sm:text-sm">
                            <Upload className="w-4 h-4" />
                            {uploadingKey === setting.key ? 'Uploading...' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(setting, file);
                              }}
                              disabled={uploadingKey === setting.key}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : setting.type === 'email' ? (
                        <input
                          type="email"
                          value={getValue(setting)}
                          onChange={(e) => handleChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      ) : setting.type === 'phone' ? (
                        <input
                          type="tel"
                          value={getValue(setting)}
                          onChange={(e) => handleChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      ) : setting.type === 'url' ? (
                        <input
                          type="url"
                          value={getValue(setting)}
                          onChange={(e) => handleChange(setting.id, e.target.value)}
                          placeholder="https://..."
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={getValue(setting)}
                          onChange={(e) => handleChange(setting.id, e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
