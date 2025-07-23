import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TestPWAPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds for testing
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    try {
      // Register service worker and simulate install
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
      }
      
      // Track install
      await fetch('/api/pwa-installs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timestamp: new Date().toISOString(),
        }),
      });
      
      alert('Channel Market app installed successfully! ⭐⭐⭐\n\nApp added to your home screen!');
      setShowPopup(false);
    } catch (error) {
      alert('App installing... ⭐⭐⭐\n\nChannel Market will appear on your home screen soon!');
      setShowPopup(false);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm w-full mx-4"
        >
          <Card className="shadow-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-6 h-6 text-pink-500" />
                  <h3 className="font-semibold text-gray-900">Install Channel Market App</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0 hover:bg-pink-100"
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
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install Now ⭐
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="border-pink-200 text-pink-700 hover:bg-pink-50"
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}