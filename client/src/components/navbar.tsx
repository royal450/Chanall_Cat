import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { Smartphone, Bell, ChevronDown, User, Megaphone, Moon, Sun, Settings, LogOut } from "lucide-react";
import { FaStore, FaPlus } from "react-icons/fa";

interface UserStats {
  wallet: number;
  totalSales: number;
  purchasedChannels: number;
  todayEarnings: number;
  totalUsers: number;
  visitsToday: number;
}

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [userStats] = useState<UserStats>({
    wallet: 2450,
    totalSales: 15680,
    purchasedChannels: 12,
    todayEarnings: 890,
    totalUsers: 1284,
    visitsToday: 347
  });

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-purple-100 dark:border-purple-800 w-full">
      <div className="w-full max-w-[95vw] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaStore className="text-white text-lg" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Channel Market</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/create-channel")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 font-bold text-sm px-6 py-2.5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-white/20"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">List Your Channel</span>
              <span className="sm:hidden">List</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
