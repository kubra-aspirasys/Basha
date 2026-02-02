import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true) {
            setIsInstalled(true);
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallPrompt(true);
        };

        // Listen for the appinstalled event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Store dismissal in localStorage to avoid showing again for a while
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Don't show if already installed or if user recently dismissed
    if (isInstalled || !showInstallPrompt || !deferredPrompt) {
        return null;
    }

    // Check if user recently dismissed (within 24 hours)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:max-w-sm">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gold-100 dark:bg-gold-900/30 rounded-lg">
                        <Download className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                            Install FoodKraft Admin
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Install this app on your device for quick access and offline functionality.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={handleInstallClick}
                                className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                Install
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

