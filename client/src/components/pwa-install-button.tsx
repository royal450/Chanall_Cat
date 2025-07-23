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
    if (deferredPrompt) {
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
    } else {
      // Show manual install instructions
      alert('To install this app:\n\n• Chrome/Edge: Click the install icon in the address bar\n• Safari: Tap Share → Add to Home Screen\n• Firefox: Look for the install prompt or add to home screen option');
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

  // Always show button for testing - remove the installable check
  return (
    <Button
      onClick={handleInstallClick}
      size="sm"
      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse active:scale-95"
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.95)';
        setTimeout(() => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }, 100);
      }}
    >
      <Download className="w-4 h-4 mr-2" />
      Install App ⭐
    </Button>
  );
}