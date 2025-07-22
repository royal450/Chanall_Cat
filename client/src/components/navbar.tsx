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
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="text-white text-lg" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Channel Market</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/create-channel")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Submit Channel
            </Button>
            

            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-gray-500" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setLocation("/profile")}
              className="flex items-center space-x-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
