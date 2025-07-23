import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Star, 
  Zap, 
  Crown,
  TrendingUp,
  Play,
  Youtube,
  Instagram,
  Facebook,
  ShoppingBag,
  Globe,
  Rocket,
  Shield,
  Users,
  Activity,
  Award,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Generate particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 2 + 0.5,
    }));
    setParticles(newParticles);

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-black">
      {/* Dynamic Gradient Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(147, 51, 234, 0.3) 0%, 
              rgba(79, 70, 229, 0.2) 25%, 
              rgba(236, 72, 153, 0.1) 50%, 
              transparent 70%
            ),
            linear-gradient(135deg, 
              #0a0a0a 0%, 
              #1a1a2e 25%, 
              #16213e 50%, 
              #0f3460 75%, 
              #0a0a0a 100%
            )
          `
        }}
      />

      {/* Animated Mesh Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.1)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-float-particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animationDelay: `${particle.id * 0.1}s`,
              animationDuration: `${particle.speed + 3}s`,
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse-slow-delay"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse-slow-delay-2"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-20 h-full w-full flex">
        {/* Left Section - 404 Display */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="text-center max-w-2xl">
            {/* Glitch Effect 404 */}
            <div className="relative mb-12">
              <div className="text-[12rem] lg:text-[16rem] font-black leading-none select-none">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                  404
                </span>
              </div>
              <div className="absolute inset-0 text-[12rem] lg:text-[16rem] font-black leading-none text-red-500 opacity-20 animate-glitch-1">
                404
              </div>
              <div className="absolute inset-0 text-[12rem] lg:text-[16rem] font-black leading-none text-blue-500 opacity-20 animate-glitch-2">
                404
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-8">
              <Badge className="bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white border border-red-400/30 px-6 py-3 text-lg backdrop-blur-sm">
                <Zap className="w-5 h-5 mr-2 animate-pulse" />
                Connection Lost
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Lost in the
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Digital Void
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed">
              The page you're seeking has vanished beyond the event horizon.
              <br />
              <span className="text-purple-400 font-semibold">Let's navigate you back to safety.</span>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20 hover:border-white/40 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Home className="mr-3 h-6 w-6 relative z-10" />
                <span className="relative z-10">Return Home</span>
                <ChevronRight className="ml-2 h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={() => setLocation("/dashboard")}
                className="group bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 font-semibold text-lg px-10 py-5 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
              >
                <Search className="mr-3 h-6 w-6" />
                Explore Universe
                <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>

            {/* Quick Links */}
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <button className="hover:text-purple-400 transition-colors flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Support
              </button>
              <button className="hover:text-purple-400 transition-colors flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Status
              </button>
              <button className="hover:text-purple-400 transition-colors flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Community
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Stats & Features */}
        <div className="hidden lg:flex flex-1 items-center justify-center px-16">
          <div className="max-w-lg">
            {/* Logo Section */}
            <div className="flex items-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl mr-6 animate-pulse">
                <ShoppingBag className="text-white text-3xl" />
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ChannelMarket
                </div>
                <div className="text-gray-400 text-sm mt-1">Digital Marketplace</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-3xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 group">
                <TrendingUp className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-2">127K+</div>
                <div className="text-sm text-gray-400">Active Channels</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-3xl p-6 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 group">
                <Users className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-2">2M+</div>
                <div className="text-sm text-gray-400">Happy Users</div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-3xl p-6 border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 group">
                <Award className="w-10 h-10 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-2">15M+</div>
                <div className="text-sm text-gray-400">Transfers</div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl rounded-3xl p-6 border border-amber-400/20 hover:border-amber-400/40 transition-all duration-300 group">
                <Rocket className="w-10 h-10 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-white font-semibold text-lg">Trending Platforms</div>
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center">
                    <Youtube className="w-6 h-6 text-red-400 mr-3" />
                    <span className="text-white font-medium">YouTube</span>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">+24%</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center">
                    <Instagram className="w-6 h-6 text-pink-400 mr-3" />
                    <span className="text-white font-medium">Instagram</span>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">+18%</div>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center">
                    <Facebook className="w-6 h-6 text-blue-400 mr-3" />
                    <span className="text-white font-medium">Facebook</span>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">+12%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="text-gray-400 text-sm text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-6 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
          </div>
          Need assistance? Our support team is standing by
        </div>
      </div>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        
        @keyframes glitch-1 {
          0% { transform: translateX(0); }
          10% { transform: translateX(-5px); }
          20% { transform: translateX(5px); }
          30% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          50% { transform: translateX(0); }
          100% { transform: translateX(0); }
        }
        
        @keyframes glitch-2 {
          0% { transform: translateX(0); }
          15% { transform: translateX(3px); }
          25% { transform: translateX(-3px); }
          35% { transform: translateX(3px); }
          45% { transform: translateX(-3px); }
          55% { transform: translateX(0); }
          100% { transform: translateX(0); }
        }
        
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.1; }
          25% { transform: translateY(-20px) translateX(10px) rotate(90deg); opacity: 0.5; }
          50% { transform: translateY(-40px) translateX(-5px) rotate(180deg); opacity: 0.8; }
          75% { transform: translateY(-20px) translateX(-10px) rotate(270deg); opacity: 0.5; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        
        @keyframes pulse-slow-delay {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.05); }
        }
        
        @keyframes pulse-slow-delay-2 {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.28; transform: scale(1.08); }
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-glitch-1 {
          animation: glitch-1 2s infinite;
        }
        
        .animate-glitch-2 {
          animation: glitch-2 2s infinite reverse;
        }
        
        .animate-float-particle {
          animation: float-particle 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-pulse-slow-delay-2 {
          animation: pulse-slow-delay-2 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
