import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CourseCard } from "@/components/course-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Target, 
  Youtube, 
  Instagram, 
  Megaphone, 
  Heart, 
  Users, 
  Bot, 
  User,
  TrendingUp,
  Star,
  Play,
  Clock,
  BookOpen,
  Award,
  Zap,
  Flame,
  Crown,
  Sparkles
} from "lucide-react";
import { Service } from "@/types/course";
import { useAuth } from "@/hooks/use-auth";
import { useFirebaseServices } from "@/hooks/use-firebase-realtime";

// Services Marketplace Dashboard

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Fetch active services from Firebase realtime database (only approved ones)
  const { services, loading, updateServiceInteraction } = useFirebaseServices();
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [userInteractions, setUserInteractions] = useState<{[key: string]: number}>({});
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [shuffledServices, setShuffledServices] = useState<Service[]>([]);

  const categories = [
    { id: "all", label: "All Services", icon: Target, color: "from-purple-500 to-pink-500" },
    { id: "youtube", label: "YouTube Channels", icon: Youtube, color: "from-red-500 to-orange-500" },
    { id: "instagram", label: "Instagram Profiles", icon: Instagram, color: "from-pink-500 to-purple-500" },
    { id: "reels", label: "Reels & Videos", icon: Play, color: "from-blue-500 to-cyan-500" },
    { id: "discord", label: "Discord Servers", icon: Users, color: "from-green-500 to-emerald-500" },
    { id: "telegram", label: "Telegram Channels", icon: Megaphone, color: "from-indigo-500 to-blue-500" },
    { id: "bundles", label: "Video Bundles", icon: BookOpen, color: "from-orange-500 to-red-500" },
    { id: "tutorials", label: "Tutorials", icon: Award, color: "from-violet-500 to-purple-500" },
  ];

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array: Service[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    // Update filtered services when services change
    if (services.length > 0) {
      const shuffled = shuffleArray(services);
      setShuffledServices(shuffled);
      setFilteredServices(shuffled);
    }
  }, [services]);

  useEffect(() => {
    let filtered = shuffledServices;

    // Apply category filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(service => service.category === activeFilter);
    }

    // Advanced Smart Search Filter
    if (searchTerm) {
      const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
      
      filtered = filtered.filter(service => {
        // Create searchable content array
        const searchableContent = [
          service.title,
          service.description,
          service.seller || '',
          service.category,
          service.serviceType || '',
          service.platform || '',
          // Add price range search
          `₹${service.price}`,
          service.price.toString(),
          // Add follower count search if available
          service.followerCount ? service.followerCount.toString() : '',
          // Add verification status
          service.verificationStatus || '',
          // Add monetization status
          service.monetizationStatus || '',
          // Common keywords mapping
          service.serviceType === 'youtube' ? 'youtube channel video subscriber' : '',
          service.serviceType === 'instagram' ? 'instagram insta profile follower' : '',
          service.serviceType === 'telegram' ? 'telegram channel member' : '',
          service.serviceType === 'discord' ? 'discord server gaming' : '',
          service.serviceType === 'reels' ? 'reels short video viral' : '',
          service.serviceType === 'video' ? 'video content creator' : '',
          service.serviceType === 'tools' ? 'tools software digital' : '',
        ].join(' ').toLowerCase();

        // Check if all search words match
        return searchWords.every(word => {
          // Direct match
          if (searchableContent.includes(word)) return true;
          
          // Smart keyword mapping
          const keywordMap: { [key: string]: string[] } = {
            'youtube': ['yt', 'video', 'channel', 'subscriber'],
            'instagram': ['insta', 'ig', 'photo', 'follower', 'profile'],
            'telegram': ['tg', 'channel', 'group', 'member'],
            'discord': ['disc', 'server', 'gaming', 'community'],
            'reels': ['reel', 'short', 'viral', 'video'],
            'video': ['vid', 'content', 'creator'],
            'tools': ['tool', 'software', 'app', 'digital'],
            'cheap': ['low', 'affordable', 'budget'],
            'expensive': ['premium', 'high', 'costly'],
            'verified': ['blue', 'tick', 'authentic'],
            'monetized': ['earning', 'revenue', 'money']
          };

          // Check keyword mappings
          for (const [key, synonyms] of Object.entries(keywordMap)) {
            if (word === key || synonyms.includes(word)) {
              if (searchableContent.includes(key)) return true;
            }
          }

          // Price range search
          if (word.match(/^\d+$/)) {
            const searchPrice = parseInt(word);
            const servicePrice = service.price;
            // Allow ±20% price range matching
            return servicePrice >= searchPrice * 0.8 && servicePrice <= searchPrice * 1.2;
          }

          // Partial matching for titles (minimum 3 characters)
          if (word.length >= 3) {
            return service.title.toLowerCase().includes(word) ||
                   service.description.toLowerCase().includes(word);
          }

          return false;
        });
      });
    }

    setFilteredServices(filtered);
  }, [shuffledServices, activeFilter, searchTerm]);

  const handleBuyNow = (service: Service) => {
    // Track user interaction
    setUserInteractions(prev => ({
      ...prev,
      [service.id]: (prev[service.id] || 0) + 3 // Buy now gets high weight
    }));

    setLocation(`/payment?service=${service.id}&title=${encodeURIComponent(service.title)}&price=${service.price}`);
  };

  const handleServiceHover = (serviceId: string) => {
    setHoveredService(serviceId);
    setUserInteractions(prev => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + 1
    }));
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-0 m-0">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  const getRandomGradient = () => {
    const gradients = [
      "from-purple-400 via-pink-500 to-red-500",
      "from-blue-400 via-purple-500 to-pink-500",
      "from-green-400 via-blue-500 to-purple-500",
      "from-yellow-400 via-orange-500 to-red-500",
      "from-pink-400 via-red-500 to-orange-500",
      "from-cyan-400 via-blue-500 to-purple-500",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-cyan-900 select-none p-0 m-0">
      <Navbar />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Profile Icon */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setLocation("/profile")}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-purple-500/30 transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
        >
          <User className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative w-full max-w-[95vw] mx-auto px-2.5 py-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-4 shadow-lg">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
            <span>Premium Digital Services</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-4 leading-tight">
            Digital Marketplace
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-full px-2 font-medium">
            Premium YouTube channels, Instagram profiles, Discord servers, video bundles & digital services
          </p>

          {/* Compact Stats Counter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 w-full px-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-blue-200 dark:border-blue-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Youtube className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">500+</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Channels</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-green-200 dark:border-green-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Instagram className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">300+</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Profiles</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-yellow-200 dark:border-yellow-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Star className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">4.9</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Rating</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-purple-200 dark:border-purple-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Award className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">95%</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Success</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg border border-red-200 dark:border-red-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-1.5">
                <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">24/7</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Support</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-cyan-200 dark:border-cyan-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">∞</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar with Real-time Indicators */}
        <div className="mb-4 animate-fadeIn">
          <div className="relative w-full max-w-full mx-auto px-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Search className="h-3 w-3 text-white" />
              </div>
            </div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-20 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 text-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 placeholder:text-gray-400 text-gray-900 dark:text-white"
              placeholder="🔍 Smart Search: Try 'youtube gaming', 'cheap instagram', 'verified telegram', prices like '500'..."
            />
            {/* Search Results Counter */}
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  {filteredServices.length} found
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Tips & Quick Filters */}
        {searchTerm && (
          <div className="mb-4 px-2 animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Smart search active - Found {filteredServices.length} results for "{searchTerm}"
                  </span>
                </div>
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                >
                  Clear
                </Button>
              </div>
              
              {/* Quick Search Suggestions */}
              <div className="flex flex-wrap gap-2">
                {['youtube', 'instagram', 'telegram', 'cheap', 'verified'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    onClick={() => setSearchTerm(suggestion)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2 bg-white/50 dark:bg-gray-800/50 hover:bg-purple-100 dark:hover:bg-purple-900/50"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filter Buttons - Horizontal Scrollable */}
        <div className="mb-6 animate-fadeIn">
          <div className="px-2 w-full">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                const isActive = activeFilter === category.id;
                return (
                  <Button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    variant={isActive ? "default" : "outline"}
                    className={`flex-shrink-0 px-3 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap transform hover:scale-105 group relative overflow-hidden text-xs ${
                      isActive
                        ? `bg-gradient-to-r ${category.color} text-white hover:shadow-lg border-0`
                        : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center space-x-2 relative z-10">
                      <IconComponent className="w-4 h-4" />
                      <span>{category.label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Featured Services */}
        <div className="mb-6 animate-fadeIn">
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {activeFilter === "all" ? "Featured Services" : `${categories.find(c => c.id === activeFilter)?.label || activeFilter} Services`}
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 px-2">
              Premium digital services including channels, profiles, servers & content bundles
            </p>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-16 h-16 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No services found</div>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group services by service type */}
              {(() => {
                const groupedByServiceType = filteredServices.reduce((acc, service) => {
                  const serviceType = service.serviceType || 'other';
                  if (!acc[serviceType]) {
                    acc[serviceType] = [];
                  }
                  acc[serviceType].push(service);
                  return acc;
                }, {} as Record<string, typeof filteredServices>);

                return Object.entries(groupedByServiceType).map(([serviceType, services], groupIndex) => (
                  <div key={serviceType} className="space-y-4">
                    {/* Modern Service Type Label with Glassmorphism */}
                    <div className="relative bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-cyan-50/80 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-cyan-900/30 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl mb-6 overflow-hidden">
                      {/* Animated Background Particles */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                      </div>
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Enhanced Icon with Animation */}
                          <div className="relative group">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300 animate-pulse">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              {serviceType === 'youtube' && <Youtube className="w-6 h-6 text-white relative z-10" />}
                              {serviceType === 'instagram' && <Instagram className="w-6 h-6 text-white relative z-10" />}
                              {serviceType === 'telegram' && <Megaphone className="w-6 h-6 text-white relative z-10" />}
                              {serviceType === 'discord' && <Users className="w-6 h-6 text-white relative z-10" />}
                              {serviceType === 'reels' && <Play className="w-6 h-6 text-white relative z-10" />}
                              {serviceType === 'video' && <Play className="w-6 h-6 text-white relative z-10" />}
                              {serviceType === 'tools' && <Bot className="w-6 h-6 text-white relative z-10" />}
                              {serviceType === 'other' && <Target className="w-6 h-6 text-white relative z-10" />}
                            </div>
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
                          </div>
                          
                          <div>
                            {/* Modern Typography with Gradient */}
                            <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                              {serviceType === 'youtube' ? '🔴 YouTube Channels' :
                               serviceType === 'instagram' ? '📸 Instagram Profiles' :
                               serviceType === 'telegram' ? '💬 Telegram Channels' :
                               serviceType === 'discord' ? '🎮 Discord Servers' :
                               serviceType === 'reels' ? '🎬 Reels & Videos' :
                               serviceType === 'video' ? '🎥 Video Services' :
                               serviceType === 'tools' ? '🛠️ Digital Tools' :
                               '🌐 Other Services'}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                ✨ Premium channels curated by experts
                              </p>
                              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Live</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Badge with Animation */}
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg px-4 py-2 text-sm font-bold transform hover:scale-105 transition-all duration-300 animate-bounce">
                            <Crown className="w-3 h-3 mr-1" />
                            {services.length} Premium {services.length === 1 ? 'Service' : 'Services'}
                          </Badge>
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cards Grid with proper gaps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 w-full">
                      {services.map((service, index) => (
                        <div
                          key={service.id}
                          className="animate-fadeIn"
                          style={{ animationDelay: `${(groupIndex * services.length + index) * 0.1}s` }}
                          onMouseEnter={() => handleServiceHover(service.id)}
                          onMouseLeave={() => setHoveredService(null)}
                        >
                          {/* Modern Floating Card Label */}
                          <div className="mb-3 text-center relative">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/90 via-pink-500/90 to-cyan-500/90 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-300 group">
                              {/* Shimmer Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl transform skew-x-12 translate-x-full group-hover:translate-x-[-200%] duration-1000"></div>
                              
                              {/* Icon with Glow */}
                              <div className="relative">
                                <div className="w-5 h-5 flex items-center justify-center">
                                  {service.serviceType === 'youtube' && <span className="text-red-300 animate-pulse">🔴</span>}
                                  {service.serviceType === 'instagram' && <span className="text-pink-300 animate-pulse">📸</span>}
                                  {service.serviceType === 'telegram' && <span className="text-blue-300 animate-pulse">💬</span>}
                                  {service.serviceType === 'discord' && <span className="text-indigo-300 animate-pulse">🎮</span>}
                                  {service.serviceType === 'reels' && <span className="text-purple-300 animate-pulse">🎬</span>}
                                  {service.serviceType === 'video' && <span className="text-green-300 animate-pulse">🎥</span>}
                                  {service.serviceType === 'tools' && <span className="text-orange-300 animate-pulse">🛠️</span>}
                                  {!service.serviceType && <span className="text-gray-300 animate-pulse">🌐</span>}
                                </div>
                              </div>
                              
                              {/* Text with Gradient */}
                              <span className="text-sm font-bold relative z-10 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                                {service.serviceType === 'youtube' ? 'YouTube Channel' :
                                 service.serviceType === 'instagram' ? 'Instagram Profile' :
                                 service.serviceType === 'telegram' ? 'Telegram Channel' :
                                 service.serviceType === 'discord' ? 'Discord Server' :
                                 service.serviceType === 'reels' ? 'Reels Bundle' :
                                 service.serviceType === 'video' ? 'Video Service' :
                                 service.serviceType === 'tools' ? 'Digital Tool' :
                                 'Premium Service'}
                              </span>
                              
                              {/* Sparkle Effect */}
                              <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
                            </div>
                            
                            {/* Floating Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-60 animate-pulse -z-10"></div>
                          </div>
                          <CourseCard
                            channel={service}
                            onBuyNow={handleBuyNow}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Divider between service type groups */}
                    {groupIndex < Object.keys(groupedByServiceType).length - 1 && (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                        <div className="mx-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>

        {/* Success Stories Section */}
        <div className="mb-16 animate-fadeIn">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Real results from students who transformed their careers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                       alt="Student" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Rahul Sharma</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">YouTube Creator</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "Bought a monetized YouTube channel and grew it to 500K subscribers. Amazing quality!"
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">5.0 rating</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b9c20e57?w=100&h=100&fit=crop&crop=face" 
                       alt="Student" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Priya Patel</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Instagram Influencer</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "Instagram profile with 100K followers transformed my business completely. Perfect!"
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">5.0 rating</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                       alt="Student" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Arjun Singh</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Digital Marketer</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  "Discord server bundle package helped me build a 10K member community. Amazing!"
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">5.0 rating</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 animate-fadeIn">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to succeed with premium digital services
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Instant Transfer</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get immediate access to your purchased digital services and channels.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verified Sellers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All services verified by professionals with proven track records.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Full Ownership</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete ownership transfer. Channels and services become fully yours.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Support Included</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Full setup assistance and ongoing support for your digital assets.
              </p>
            </div>
          </div>
        </div>

        {/* Popular Categories Section */}
        <div className="mb-16 animate-fadeIn">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore top-performing digital services across all platforms
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {categories.slice(1, 9).map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                      onClick={() => setActiveFilter(category.id)}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${category.color} rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{category.label}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Premium quality</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-16 animate-fadeIn">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Platform Statistics
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join thousands of successful digital entrepreneurs
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">2K+</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">800+</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Digital Services</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">98%</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">24/7</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Support Available</p>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center mb-16">
          <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 border-0 shadow-2xl max-w-4xl mx-auto">
            <CardContent className="p-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Ready to Build Your Digital Empire?
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of entrepreneurs who've grown their business with premium digital services
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/create-channel")}
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Flame className="w-5 h-5 mr-2" />
                  List Your Service
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Browse All Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
