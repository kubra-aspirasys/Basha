import { useEffect, useState } from 'react';
import { useCMSEnhancedStore } from '@/store/cms-enhanced-store';
import { CreditCard, Save, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PaymentMethodsManager() {
    const {
        siteSettings,
        loading,
        fetchSiteSettings,
        updateSiteSetting,
    } = useCMSEnhancedStore();

    const { toast } = useToast();

    const [isInitialized, setIsInitialized] = useState(false);

    // Local state to track toggles before saving
    const [methodSettings, setMethodSettings] = useState({
        delivery_enabled: true,
        pickup_enabled: true,
        cod_enabled: true,
        online_enabled: false,
    });

    useEffect(() => {
        fetchSiteSettings();
    }, [fetchSiteSettings]);

    useEffect(() => {
        if (siteSettings.length > 0 && !isInitialized && !loading) {
            // Map existing settings to local state if they exist
            const newSettings = { ...methodSettings };
            let foundAny = false;

            siteSettings.forEach(s => {
                if (s.key === 'payment_method_delivery') {
                    newSettings.delivery_enabled = s.value === 'true';
                    foundAny = true;
                }
                if (s.key === 'payment_method_pickup') {
                    newSettings.pickup_enabled = s.value === 'true';
                    foundAny = true;
                }
                if (s.key === 'payment_method_cod') {
                    newSettings.cod_enabled = s.value === 'true';
                    foundAny = true;
                }
                if (s.key === 'payment_method_online') {
                    newSettings.online_enabled = s.value === 'true';
                    foundAny = true;
                }
            });

            if (foundAny) {
                setMethodSettings(newSettings);
            }
            setIsInitialized(true);
        }
    }, [siteSettings, isInitialized, loading]);

    const handleToggle = (key: keyof typeof methodSettings) => {
        setMethodSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSaveAll = async () => {
        try {
            const keys = [
                { key: 'payment_method_delivery', value: methodSettings.delivery_enabled, desc: 'Enable/Disable Delivery mode' },
                { key: 'payment_method_pickup', value: methodSettings.pickup_enabled, desc: 'Enable/Disable Pickup mode' },
                { key: 'payment_method_cod', value: methodSettings.cod_enabled, desc: 'Enable/Disable Cash on Delivery' },
                { key: 'payment_method_online', value: methodSettings.online_enabled, desc: 'Enable/Disable Online Payment' },
            ];

            const { addSiteSetting } = useCMSEnhancedStore.getState();

            for (const item of keys) {
                const setting = siteSettings.find(s => s.key === item.key);
                if (setting) {
                    await updateSiteSetting(setting.id, String(item.value));
                } else {
                    // If setting doesn't exist, create it
                    await addSiteSetting({
                        key: item.key,
                        value: String(item.value),
                        type: 'boolean' as any,
                        category: 'payment',
                        description: item.desc
                    });
                }
            }

            toast({
                title: 'Settings Saved',
                description: 'Payment and fulfillment methods have been updated.',
            });
            fetchSiteSettings(); // Refresh to get the new IDs
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save settings.',
                variant: 'destructive',
            });
        }
    };

    const methods = [
        { id: 'delivery_enabled', label: 'Delivery', description: 'Enable or disable home delivery option' },
        { id: 'pickup_enabled', label: 'Pickup', description: 'Enable or disable store pickup option' },
        { id: 'cod_enabled', label: 'Cash on Delivery', description: 'Allow customers to pay when they receive food' },
        { id: 'online_enabled', label: 'Online Payment', description: 'Allow customers to pay via UPI/Cards (Coming Soon)' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#e67e22]" />
                        Payment & Fulfillment Methods
                    </h3>
                    <button
                        onClick={handleSaveAll}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 font-bold uppercase tracking-wider text-sm"
                    >
                        <Save className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {methods.map((method) => {
                        const isEnabled = methodSettings[method.id as keyof typeof methodSettings];
                        return (
                            <div
                                key={method.id}
                                onClick={() => handleToggle(method.id as keyof typeof methodSettings)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between ${isEnabled
                                    ? 'border-[#e67e22]/50 bg-[#e67e22]/5 shadow-inner'
                                    : 'border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 opacity-70 grayscale-[0.5]'
                                    }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${isEnabled ? 'text-[#e67e22]' : 'text-slate-500'}`}>
                                            {method.label}
                                        </span>
                                        {isEnabled ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {method.description}
                                    </p>
                                </div>

                                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-[#e67e22]' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl">
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <span className="font-bold">Note:</span>
                    Disabling a fulfillment method (like Delivery) will hide the option for customers during checkout. If you disable Online Payment, the "Pay Now" button will be hidden.
                </p>
            </div>
        </div>
    );
}
