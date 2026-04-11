import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
// import FAQManager from '@/components/cms/FAQManager';
import SiteSettingsManager from '@/components/cms/SiteSettingsManager';
import ProductCategoryManager from '@/components/cms/ProductCategoryManager';
import ContactDetailsManager from '@/components/cms/ContactDetailsManager';
import HomepageHeroManager from '@/components/cms/HomepageHeroManager';
import PaymentMethodsManager from '@/components/cms/PaymentMethodsManager';
import { Settings, Grid3x3, Home, Phone, CreditCard, Receipt } from 'lucide-react';
import GSTSettingsManager from '@/components/cms/GSTSettingsManager';

export default function CMS() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'settings' | 'categories' | 'homepage' | 'contact' | 'payments' | 'gst'>('homepage');

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location.state]);

  const tabs = [
    { id: 'homepage' as const, label: 'Homepage', icon: Home },
    { id: 'contact' as const, label: 'Contact Details', icon: Phone },
    { id: 'gst' as const, label: 'GST & Charges', icon: Receipt },
    { id: 'settings' as const, label: 'Site Settings', icon: Settings },
    { id: 'payments' as const, label: 'Payment & Fulfillment', icon: CreditCard },
    { id: 'categories' as const, label: 'Product Categories', icon: Grid3x3 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management System"
        description="Manage all your website content in one place"
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm ${isActive
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

      <div className="animate-fade-in">
        {activeTab === 'homepage' && <HomepageHeroManager />}
        {activeTab === 'contact' && <ContactDetailsManager />}
        {activeTab === 'gst' && <GSTSettingsManager />}
        {/* {activeTab === 'delivery' && <DeliveryChargesManager />} */}
        {activeTab === 'settings' && <SiteSettingsManager />}
        {activeTab === 'payments' && <PaymentMethodsManager />}
        {activeTab === 'categories' && <ProductCategoryManager />}
        {/* {activeTab === 'faqs' && <FAQManager />} */}
      </div>
    </div>
  );
}
