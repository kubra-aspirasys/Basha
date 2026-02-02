import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import FAQManager from '@/components/cms/FAQManager';
import SiteSettingsManager from '@/components/cms/SiteSettingsManager';
import ProductCategoryManager from '@/components/cms/ProductCategoryManager';
import ContactDetailsManager from '@/components/cms/ContactDetailsManager';
import HomepageHeroManager from '@/components/cms/HomepageHeroManager';
import GSTSettingsManager from '@/components/cms/GSTSettingsManager';
import DeliveryChargesManager from '@/components/cms/DeliveryChargesManager';
import { CircleHelp as HelpCircle, Settings, Grid3x3, Home, Phone, Receipt, Truck } from 'lucide-react';

export default function CMS() {
  const [activeTab, setActiveTab] = useState<'faqs' | 'settings' | 'categories' | 'homepage' | 'contact' | 'gst' | 'delivery'>('homepage');

  const tabs = [
    { id: 'homepage' as const, label: 'Homepage', icon: Home },
    { id: 'contact' as const, label: 'Contact Details', icon: Phone },
    { id: 'gst' as const, label: 'GST Settings', icon: Receipt },
    { id: 'delivery' as const, label: 'Delivery Charges', icon: Truck },
    { id: 'settings' as const, label: 'Site Settings', icon: Settings },
    { id: 'categories' as const, label: 'Product Categories', icon: Grid3x3 },
    { id: 'faqs' as const, label: 'FAQs', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management System"
        description="Manage all your website content in one place"
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${activeTab === tab.id
                  ? 'gradient-primary text-white shadow-lg scale-[1.02]'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'homepage' && <HomepageHeroManager />}
        {activeTab === 'contact' && <ContactDetailsManager />}
        {activeTab === 'gst' && <GSTSettingsManager />}
        {activeTab === 'delivery' && <DeliveryChargesManager />}
        {activeTab === 'settings' && <SiteSettingsManager />}
        {activeTab === 'categories' && <ProductCategoryManager />}
        {activeTab === 'faqs' && <FAQManager />}
      </div>
    </div>
  );
}
