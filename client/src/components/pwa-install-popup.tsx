import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has already dismissed the popup recently
    const dismissedRecently = localStorage.getItem('pwa-popup-dismissed');
    const lastDismissed = dismissedRecently ? parseInt(dismissedRecently) : 0;
    const hoursSinceDismissed = (Date.now() - lastDismissed) / (1000 * 60 * 60);

    if (hoursSinceDismissed < 24) {
      return; // Don't show popup if dismissed within last 24 hours
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show popup after 3 seconds
      setTimeout(() => {
        setShowPopup(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPopup(false);
      setDeferredPrompt(null);
      
      // Track PWA installation
      trackPWAInstall();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const trackPWAInstall = async () => {
    try {
      await fetch('/api/pwa-installs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.log('PWA install tracking failed:', error);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Track PWA installation in Firebase/Database
        try {
          const response = await fetch('/api/pwa-installs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString(),
              platform: navigator.platform,
              language: navigator.language,
            }),
          });
          
          if (response.ok) {
            console.log('PWA installation tracked successfully');
          }
        } catch (error) {
          console.error('Failed to track PWA installation:', error);
        }
      }
      
      setDeferredPrompt(null);
      setShowPopup(false);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem('pwa-popup-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPopup) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-pink-200 dark:border-pink-800 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Get Better Experience ⭐</h3>
                    <p className="text-pink-100 text-sm">Install Channel Market App Now</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-pink-600 dark:text-pink-400">⚡</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Faster access & offline support</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-pink-600 dark:text-pink-400">🔔</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Push notifications for new channels</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-pink-600 dark:text-pink-400">📱</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Native app experience</span>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button
                    onClick={handleInstallClick}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install Now
                  </Button>
                  
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="px-6 border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-900/20"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}