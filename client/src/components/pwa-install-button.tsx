import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.navigator && 'standalone' in window.navigator) {
      // iOS Safari
      setIsInstalled((window.navigator as any).standalone);
    } else if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      // Desktop and Android
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
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
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        trackPWAInstall();
      }
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  if (isInstalled) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-default"
      >
        <Smartphone className="w-4 h-4 mr-2" />
        App Installed
      </Button>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      size="sm"
      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
    >
      <Download className="w-4 h-4 mr-2" />
      Install App
    </Button>
  );
}