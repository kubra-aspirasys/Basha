import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { Save, Phone, Mail, MapPin, Clock, Globe } from 'lucide-react';

export default function ContactDetailsManager() {
  const { siteSettings, fetchSiteSettings, updateSiteSetting, loading } = useCMSEnhancedStore();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSiteSettings();
  }, [fetchSiteSettings]);

  useEffect(() => {
    if (siteSettings.length) {
      const settingsMap: Record<string, string> = {};
      siteSettings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      setLocalSettings(settingsMap);
    }
  }, [siteSettings]);

  const handleSave = async (key: string) => {
    try {
      const setting = siteSettings.find(s => s.key === key);
      if (setting) {
        await updateSiteSetting(setting.id, localSettings[key]);
        toast({
          title: 'Update Successful',
          description: `Setting "${key}" has been updated.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveAll = async () => {
    try {
      const keysToSave = [
        'contact_title',
        'contact_description',
        'contact_address',
        'contact_phone',
        'contact_email',
        'contact_opening_hours'
      ];

      for (const key of keysToSave) {
        const setting = siteSettings.find(s => s.key === key);
        if (setting && localSettings[key] !== setting.value) {
          await updateSiteSetting(setting.id, localSettings[key]);
        }
      }

      toast({
        title: 'Success',
        description: 'All contact details updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Some updates might have failed: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading && !siteSettings.length) {
    return <div className="p-8 text-center text-slate-500">Loading contact settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Page Content</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage the information displayed on your customer-facing contact page</p>
        </div>
        <Button onClick={handleSaveAll} className="gradient-primary text-white shadow-lg">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Header Section
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input
                value={localSettings.contact_title || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, contact_title: e.target.value }))}
                placeholder="Get in Touch"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={localSettings.contact_description || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, contact_description: e.target.value }))}
                rows={3}
                placeholder="Tell customers how they can reach you..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gold-600">
                <Phone className="w-5 h-5" />
                Phone & Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={localSettings.contact_phone || ''}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={localSettings.contact_email || ''}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Clock className="w-5 h-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Opening Hours Display Text</Label>
                <Input
                  value={localSettings.contact_opening_hours || ''}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, contact_opening_hours: e.target.value }))}
                  placeholder="e.g. 11:00 AM - 10:00 PM"
                />
                <p className="text-xs text-slate-500">This will be displayed next to "Monday - Sunday" in the contact page.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <MapPin className="w-5 h-5" />
              Physical Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Address (Multi-line supported)</Label>
              <Textarea
                value={localSettings.contact_address || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, contact_address: e.target.value }))}
                rows={4}
                placeholder="Enter the full address as it should appear on the site..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
