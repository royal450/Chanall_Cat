import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, Monitor, Tablet, Globe, Users, Calendar, TrendingUp } from 'lucide-react';

interface PwaInstall {
  id: number;
  userId: number | null;
  userAgent: string;
  platform: string;
  language: string;
  deviceType: string | null;
  browserName: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  country: string | null;
  city: string | null;
  installMethod: string;
  isOnline: boolean;
  createdAt: string;
}

export function PWAUsersSection() {
  const [pwaInstalls, setPwaInstalls] = useState<PwaInstall[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInstalls: 0,
    mobileInstalls: 0,
    desktopInstalls: 0,
    tabletInstalls: 0,
    todayInstalls: 0,
    thisWeekInstalls: 0,
  });

  useEffect(() => {
    fetchPwaInstalls();
  }, []);

  const fetchPwaInstalls = async () => {
    try {
      const response = await fetch('/api/pwa-installs');
      if (response.ok) {
        const installs = await response.json();
        setPwaInstalls(installs);
        calculateStats(installs);
      }
    } catch (error) {
      console.error('Failed to fetch PWA installs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (installs: PwaInstall[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalInstalls = installs.length;
    const mobileInstalls = installs.filter(i => i.deviceType === 'mobile').length;
    const desktopInstalls = installs.filter(i => i.deviceType === 'desktop').length;
    const tabletInstalls = installs.filter(i => i.deviceType === 'tablet').length;
    
    const todayInstalls = installs.filter(i => 
      new Date(i.createdAt) >= today
    ).length;
    
    const thisWeekInstalls = installs.filter(i => 
      new Date(i.createdAt) >= weekAgo
    ).length;

    setStats({
      totalInstalls,
      mobileInstalls,
      desktopInstalls,
      tabletInstalls,
      todayInstalls,
      thisWeekInstalls,
    });
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getDeviceColor = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'tablet':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'desktop':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-pink-500" />
            <span>PWA Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* PWA Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Total Installs</p>
                <p className="text-2xl font-bold">{stats.totalInstalls}</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Mobile</p>
                <p className="text-2xl font-bold">{stats.mobileInstalls}</p>
              </div>
              <Smartphone className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Desktop</p>
                <p className="text-2xl font-bold">{stats.desktopInstalls}</p>
              </div>
              <Monitor className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Tablet</p>
                <p className="text-2xl font-bold">{stats.tabletInstalls}</p>
              </div>
              <Tablet className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">Today</p>
                <p className="text-2xl font-bold">{stats.todayInstalls}</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-90">This Week</p>
                <p className="text-2xl font-bold">{stats.thisWeekInstalls}</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PWA Install Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-pink-500" />
            <span>PWA Install Details</span>
          </CardTitle>
          <Button onClick={fetchPwaInstalls} variant="outline" size="sm">
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {pwaInstalls.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No PWA installations yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pwaInstalls.map((install) => (
                <div
                  key={install.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getDeviceIcon(install.deviceType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <Badge className={getDeviceColor(install.deviceType)}>
                          {install.deviceType || 'Unknown'}
                        </Badge>
                        <Badge variant="outline">
                          {install.browserName || 'Unknown Browser'}
                        </Badge>
                        <Badge variant="secondary">
                          {install.platform}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {install.language} • {install.installMethod}
                        {install.ipAddress && ` • IP: ${install.ipAddress}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    {new Date(install.createdAt).toLocaleDateString()} <br />
                    {new Date(install.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}