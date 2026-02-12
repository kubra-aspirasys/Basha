import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import {
  Save,
  Edit3,
  Star,
  BookOpen,
  Layout,
  MousePointer2,
  Clock,
  Phone,
  MapPin,
} from 'lucide-react';

export default function HomepageHeroManager() {
  const { fetchHomepageHero, updateHomepageHero, homepageHero: storeHero, loading } = useCMSEnhancedStore();
  const [config, setConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'heritage' | 'menu' | 'features' | 'cta'>('hero');
  const { toast } = useToast();

  useEffect(() => {
    fetchHomepageHero();
  }, [fetchHomepageHero]);

  useEffect(() => {
    if (storeHero) {
      setConfig(storeHero);
    }
  }, [storeHero]);

  const handleSave = async () => {
    try {
      await updateHomepageHero(config);
      toast({
        title: 'Success',
        description: 'Homepage sections updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateSection = (section: string, data: any) => {
    setConfig((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  if (!config) {
    return <div className="p-8 text-center text-slate-500">Loading homepage settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Homepage Content Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage all existing sections of the Customer Home Page</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-[#e67e22] hover:bg-[#d35400] text-white shadow-lg px-6 min-w-[140px]">
          <Save className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'hero', label: 'Hero', icon: Layout },
            { id: 'about', label: 'About', icon: Edit3 },
            { id: 'heritage', label: 'Heritage', icon: BookOpen },
            { id: 'menu', label: 'Menu Section', icon: Star },
            { id: 'features', label: 'Features', icon: Star },
            { id: 'cta', label: 'CTA', icon: MousePointer2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${isActive
                  ? 'bg-[#e67e22] text-white shadow-md transform scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900'
                  }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6">
        {/* HERO SECTION */}
        {activeTab === 'hero' && (
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Hero Background & Content</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider">{config?.hero?.enabled ? 'Section Enabled' : 'Section Disabled'}</Label>
                <Switch checked={config?.hero?.enabled} onCheckedChange={(val) => updateSection('hero', { enabled: val })} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Tagline (Gold Text)</Label>
                    <Input value={config.hero.tagline} onChange={(e) => updateSection('hero', { tagline: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Main Description</Label>
                    <Textarea value={config.hero.description} onChange={(e) => updateSection('hero', { description: e.target.value })} rows={4} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Video URL (Background)</Label>
                    <Input value={config.hero.video_url} onChange={(e) => updateSection('hero', { video_url: e.target.value })} placeholder="/Videos/hero.mp4" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Logo/Banner Image URL</Label>
                    <Input value={config.hero.logo_url} onChange={(e) => updateSection('hero', { logo_url: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Button Text</Label>
                    <Input value={config?.hero?.button_text} onChange={(e) => updateSection('hero', { button_text: e.target.value })} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ABOUT SECTION */}
        {activeTab === 'about' && (
          <Card className="border-t-4 border-t-gold-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">About Us Section</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider">{config?.about?.enabled ? 'Section Enabled' : 'Section Disabled'}</Label>
                <Switch checked={config?.about?.enabled} onCheckedChange={(val) => updateSection('about', { enabled: val })} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Badge Text (Top Small Text)</Label>
                    <Input value={config.about.badge} onChange={(e) => updateSection('about', { badge: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Title Line 1</Label>
                    <Input value={config.about.title_line1} onChange={(e) => updateSection('about', { title_line1: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Title Line 2 (Colored Gold)</Label>
                    <Input value={config.about.title_line2} onChange={(e) => updateSection('about', { title_line2: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Section Image URL</Label>
                    <Input value={config.about.image_url} onChange={(e) => updateSection('about', { image_url: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Description Paragraph</Label>
                    <Textarea value={config.about.description} onChange={(e) => updateSection('about', { description: e.target.value })} rows={5} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                      <Label className="text-xs">Feature 1 Title</Label>
                      <Input value={config.about.feature1_title} onChange={(e) => updateSection('about', { feature1_title: e.target.value })} />
                      <Label className="text-xs">Feature 1 Desc</Label>
                      <Input value={config.about.feature1_desc} onChange={(e) => updateSection('about', { feature1_desc: e.target.value })} />
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                      <Label className="text-xs">Feature 2 Title</Label>
                      <Input value={config.about.feature2_title} onChange={(e) => updateSection('about', { feature2_title: e.target.value })} />
                      <Label className="text-xs">Feature 2 Desc</Label>
                      <Input value={config.about.feature2_desc} onChange={(e) => updateSection('about', { feature2_desc: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Button Text</Label>
                    <Input value={config.about.button_text} onChange={(e) => updateSection('about', { button_text: e.target.value })} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HERITAGE SECTION */}
        {activeTab === 'heritage' && (
          <Card className="border-t-4 border-t-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Heritage (Story) Section</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider">{config?.heritage?.enabled ? 'Section Enabled' : 'Section Disabled'}</Label>
                <Switch checked={config?.heritage?.enabled} onCheckedChange={(val) => updateSection('heritage', { enabled: val })} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">Section Center Title</Label>
                <Input value={config.heritage.title} onChange={(e) => updateSection('heritage', { title: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="font-bold">Description Text Blocks</Label>
                  <Textarea placeholder="Block 1" value={config.heritage.text_block1} onChange={(e) => updateSection('heritage', { text_block1: e.target.value })} rows={2} />
                  <Textarea placeholder="Block 2" value={config.heritage.text_block2} onChange={(e) => updateSection('heritage', { text_block2: e.target.value })} rows={2} />
                  <Textarea placeholder="Block 3" value={config.heritage.text_block3} onChange={(e) => updateSection('heritage', { text_block3: e.target.value })} rows={2} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Video URL</Label>
                    <Input value={config.heritage.video_url} onChange={(e) => updateSection('heritage', { video_url: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Charminar Overlay Image</Label>
                    <Input value={config.heritage.charminar_image} onChange={(e) => updateSection('heritage', { charminar_image: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Nizam Overlay Image</Label>
                    <Input value={config.heritage.nizam_image} onChange={(e) => updateSection('heritage', { nizam_image: e.target.value })} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MENU SECTION */}
        {activeTab === 'menu' && (
          <Card className="border-t-4 border-t-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Menu Section Header</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider">{config?.menu?.enabled ? 'Section Enabled' : 'Section Disabled'}</Label>
                <Switch checked={config?.menu?.enabled} onCheckedChange={(val) => updateSection('menu', { enabled: val })} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">Badge Text</Label>
                <Input value={config.menu.badge} onChange={(e) => updateSection('menu', { badge: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Main Title</Label>
                <Input value={config.menu.title} onChange={(e) => updateSection('menu', { title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Description</Label>
                <Input value={config.menu.description} onChange={(e) => updateSection('menu', { description: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* FEATURES SECTION */}
        {activeTab === 'features' && (
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Bottom Feature Cards</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider">{config?.features?.enabled ? 'Section Enabled' : 'Section Disabled'}</Label>
                <Switch checked={config?.features?.enabled} onCheckedChange={(val) => updateSection('features', { enabled: val })} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {config.features.list.map((feature: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-xl space-y-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-all border-dashed">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <h4 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      {idx === 0 && <Clock className="w-4 h-4 text-emerald-500" />}
                      {idx === 1 && <Phone className="w-4 h-4 text-emerald-500" />}
                      {idx === 2 && <MapPin className="w-4 h-4 text-emerald-500" />}
                      Card {idx + 1} Configuration
                    </h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Card Title</Label>
                      <Input
                        value={feature.title}
                        onChange={(e) => {
                          const newList = [...config.features.list];
                          newList[idx] = { ...newList[idx], title: e.target.value };
                          updateSection('features', { list: newList });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">Card Description</Label>
                      <Input
                        value={feature.desc}
                        onChange={(e) => {
                          const newList = [...config.features.list];
                          newList[idx] = { ...newList[idx], desc: e.target.value };
                          updateSection('features', { list: newList });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* CTA SECTION */}
        {activeTab === 'cta' && (
          <Card className="border-t-4 border-t-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Call To Action (Final Banner)</CardTitle>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-bold uppercase tracking-wider">{config?.cta?.enabled ? 'Section Enabled' : 'Section Disabled'}</Label>
                <Switch checked={config?.cta?.enabled} onCheckedChange={(val) => updateSection('cta', { enabled: val })} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">Transparent Outline Title (e.g. Biryani @ Basha)</Label>
                <Input value={config.cta.stroke_title} onChange={(e) => updateSection('cta', { stroke_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Large Tagline</Label>
                <Input value={config.cta.tagline} onChange={(e) => updateSection('cta', { tagline: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Button Text</Label>
                <Input value={config.cta.button_text} onChange={(e) => updateSection('cta', { button_text: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
