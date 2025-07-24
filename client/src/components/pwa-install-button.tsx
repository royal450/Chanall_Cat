
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
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

      const handleBeforeInstallPrompt = (e: Event) => {
        try {
          e.preventDefault();
          setDeferredPrompt(e as BeforeInstallPromptEvent);
        } catch (error) {
          console.error('Error handling beforeinstallprompt:', error);
          setError('Failed to prepare installation');
        }
      };

      const handleAppInstalled = () => {
        try {
          setIsInstalled(true);
          setDeferredPrompt(null);
          trackPWAInstall();
        } catch (error) {
          console.error('Error handling app installed:', error);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } catch (error) {
      console.error('Error in PWAInstallButton setup:', error);
      setError('Failed to initialize PWA installation');
    }
  }, []);

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
    } catch (error) {
      console.error('Install failed:', error);
      setError('Installation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      {error && (
        <p className="text-red-600 text-xs text-center">{error}</p>
      )}
      <Button
        onClick={handleInstallClick}
        disabled={isLoading}
        className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        size="sm"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {isLoading ? 'Installing...' : 'Install App'}
      </Button>
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <Smartphone className="w-3 h-3" />
        <span>Get native app experience</span>
      </div>
    </div>
  );
}
