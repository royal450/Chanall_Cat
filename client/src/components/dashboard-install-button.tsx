import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function DashboardInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-user-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: Show manual install instructions
      alert('To install Channel Market App:\n1. Click on browser menu (3 dots)\n2. Select "Add to Home Screen" or "Install App"\n3. Follow the prompts');
      return;
    }

    try {
      setIsLoading(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        localStorage.setItem('pwa-user-installed', 'true');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInstalled) {
    return (
      <Button
        disabled
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
      >
        <Check className="w-4 h-4 mr-2" />
        App Installed
      </Button>
    );
  }

  return (
    <Button
      onClick={handleInstallClick}
      disabled={isLoading}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
    >
      {isLoading ? (
        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        <Download className="w-3 h-3 mr-1" />
      )}
      {isLoading ? 'Installing...' : 'Install App'}
    </Button>
  );
}