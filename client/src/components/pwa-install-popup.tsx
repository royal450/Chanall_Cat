
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
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
        return;
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        try {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
          
          setTimeout(() => {
            if (!isInstalled) {
              setShowPopup(true);
            }
          }, 1000);
        } catch (error) {
          console.error('Error handling beforeinstallprompt:', error);
          setError('Failed to prepare installation');
        }
      };

      const handleAppInstalled = () => {
        try {
          setIsInstalled(true);
          setShowPopup(false);
          setDeferredPrompt(null);
          trackPWAInstall();
        } catch (error) {
          console.error('Error handling app installed:', error);
        }
      };

      // Show popup automatically for testing
      setTimeout(() => {
        if (!isInstalled) {
          setShowPopup(true);
        }
      }, 2000);

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } catch (error) {
      console.error('Error in PWA setup:', error);
      setError('Failed to initialize PWA installation');
    }
  }, [isInstalled]);

  const trackPWAInstall = async () => {
    try {
      const response = await fetch('/api/pwa-installs', {
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('PWA install tracking failed:', error);
      // Don't show error to user for tracking failures
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setError('Installation not available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        await trackPWAInstall();
      }
      
      setDeferredPrompt(null);
      setShowPopup(false);
    } catch (error) {
      console.error('Install failed:', error);
      setError('Installation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    try {
      setShowPopup(false);
      localStorage.setItem('pwa-popup-dismissed', Date.now().toString());
      setError(null);
    } catch (error) {
      console.error('Error closing popup:', error);
    }
  };

  if (isInstalled || !showPopup) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Full screen backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 2147483647 }}
            onClick={handleClose}
          />
          
          {/* Perfectly centered popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 2147483647 }}
            onClick={handleClose}
          >
            <div 
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-pink-300 dark:border-pink-600 overflow-hidden">
              {/* Error banner */}
              {error && (
                <div className="bg-red-50 border-b border-red-200 p-3">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white relative">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors disabled:opacity-50"
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
                    disabled={isLoading || !deferredPrompt}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Installing...' : 'Install Now'}
                  </Button>
                  
                  <Button
                    onClick={handleClose}
                    disabled={isLoading}
                    variant="outline"
                    className="px-6 border-pink-200 text-pink-600 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-400 dark:hover:bg-pink-900/20 disabled:opacity-50"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
