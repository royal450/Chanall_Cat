
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

export function TestPWAPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Show popup after 2 seconds for testing
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error in TestPWAPopup setup:', error);
      setError('Failed to initialize popup');
    }
  }, []);

  const handleInstall = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Register service worker with error handling
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration);
        } catch (swError) {
          console.error('Service Worker registration failed:', swError);
          throw new Error('Service Worker registration failed');
        }
      }
      
      // Track install with proper error handling
      try {
        const response = await fetch('/api/pwa-installs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      } catch (trackingError) {
        console.error('Install tracking failed:', trackingError);
        // Don't fail the whole process for tracking errors
      }
      
      toast({
        title: "App Installed Successfully! ⭐⭐⭐",
        description: "Channel Market app added to your home screen!",
        duration: 5000,
      });
      
      setShowPopup(false);
    } catch (error) {
      console.error('Installation error:', error);
      setError(error instanceof Error ? error.message : 'Installation failed');
      
      // Show fallback success message
      toast({
        title: "App Installing... ⭐⭐⭐",
        description: "Channel Market will appear on your home screen soon!",
        duration: 5000,
      });
      
      setShowPopup(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    try {
      setShowPopup(false);
      setError(null);
    } catch (error) {
      console.error('Error closing popup:', error);
    }
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Full screen backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />
          
          {/* Perfectly centered popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <div 
              className="max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
            <Card className="shadow-2xl border-2 border-pink-300 dark:border-pink-600 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="p-4">
                {/* Error banner */}
                {error && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-xs text-center">{error}</p>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-6 h-6 text-pink-500" />
                    <h3 className="font-semibold text-gray-900">Install Channel Market App</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="h-6 w-6 p-0 hover:bg-pink-100 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Install Channel Market app now ⭐🙂 for faster access and better experience!
                </p>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleInstall}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    size="sm"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Installing...' : 'Install Now ⭐'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="border-pink-200 text-pink-700 hover:bg-pink-50 disabled:opacity-50"
                  >
                    Later
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
