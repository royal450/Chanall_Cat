import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Crown, Shield, Users, TrendingUp, DollarSign, Eye, EyeOff, 
  CheckCircle, XCircle, Edit3, Trash2, Image, Award, Ban, 
  Gift, Settings, Download, Upload, Star, AlertTriangle,
  RefreshCw, Clock, Calendar, BarChart3, Activity, Target,
  Zap, Heart, MessageSquare, Share2, ThumbsUp, Lock, Wallet,
  Smartphone
} from "lucide-react";
import { motion } from "framer-motion";
import { useFirebaseServices, useFirebaseUsers, useFirebaseAdminStats } from "@/hooks/use-firebase-realtime";
import { ref, onValue, off, update, push, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { adminOperations } from "@/lib/admin-firebase";
import { PWAUsersSection } from "@/components/pwa-users-section";
import type { Channel, User, AdminStats } from "@shared/schema";

// Complex admin password
const SUPER_ADMIN_PASSWORD = "SuperAdmin@2025#ChannelMarket$Pro";

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function SuperAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication state
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dialog states
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [bonusBadgeText, setBonusBadgeText] = useState("🔥 HOT DEAL");
  const [newThumbnail, setNewThumbnail] = useState("");
  const [withdrawalToProcess, setWithdrawalToProcess] = useState<WithdrawalRequest | null>(null);

  // Tab states
  const [activeTab, setActiveTab] = useState("overview");

  // Authentication
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SUPER_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "👑 Welcome Super Admin!",
        description: "Full administrative access granted. Handle with care!",
      });
    } else {
      toast({
        title: "🚫 Access Denied",
        description: "Invalid super admin credentials",
        variant: "destructive",
      });
    }
  };

  // Admin actions using Firebase - FIXED
  const handleApproveService = async (serviceId: string) => {
    try {
      console.log('🔥 Admin approving service:', serviceId);
      await adminOperations.approveService(serviceId);
      toast({
        title: "✅ Channel Approved!",
        description: "Channel is now live and visible on dashboard.",
      });
    } catch (error: any) {
      console.error('❌ Approval failed:', error);
      toast({
        title: "❌ Approval Failed",
        description: error?.message || "Failed to approve channel",
        variant: "destructive",
      });
    }
  };

  const handleRejectService = async (serviceId: string, reason: string) => {
    try {
      await adminOperations.rejectService(serviceId, reason);
      toast({
        title: "❌ Service Rejected",
        description: "Service has been rejected with the provided reason.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Rejection Failed", 
        description: error?.message || "Failed to reject service",
        variant: "destructive",
      });
    }
  };

  const handleBlockService = async (serviceId: string, blocked: boolean, reason?: string) => {
    try {
      console.log('🚫 Admin blocking/unblocking service:', serviceId, blocked);
      await adminOperations.blockService(serviceId, blocked, reason);
      toast({
        title: blocked ? "🚫 Channel Blocked" : "✅ Channel Unblocked",
        description: blocked ? `Channel blocked and removed from dashboard` : "Channel is now visible on dashboard",
      });
    } catch (error: any) {
      console.error('❌ Block/unblock failed:', error);
      toast({
        title: "❌ Action Failed",
        description: error?.message || `Failed to ${blocked ? 'block' : 'unblock'} channel`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to permanently delete this channel?")) return;

    try {
      console.log('🗑️ Admin deleting service:', serviceId);
      await adminOperations.deleteService(serviceId);
      toast({
        title: "🗑️ Channel Deleted",
        description: "Channel has been permanently removed from platform.",
      });
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      toast({
        title: "❌ Delete Failed",
        description: error?.message || "Failed to delete channel",
        variant: "destructive",
      });
    }
  };

  // Data fetching - Admin-specific that shows ALL services
  const { adminStats, loading: loadingStats } = useFirebaseAdminStats();
  const { users = [] } = useFirebaseUsers();

  // Admin-specific services hook that shows ALL services (pending, approved, rejected)
  const [allChannels, setAllChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  useEffect(() => {
    const servicesRef = ref(database, 'services');

    const unsubscribe = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const servicesArray = Object.entries(data).map(([id, service]: [string, any]) => ({
          id,
          ...service,
          approvalStatus: service.approvalStatus || 'pending',
          status: service.status || 'pending',
          blocked: service.blocked || false,
          soldOut: service.soldOut || false,
          bonusBadge: service.bonusBadge || null
        }));
        setAllChannels(servicesArray);
        console.log('🔥 Admin Panel - Total channels loaded:', servicesArray.length);
        console.log('📝 Pending channels:', servicesArray.filter(s => s.approvalStatus === 'pending').length);
      } else {
        setAllChannels([]);
      }
      setLoadingChannels(false);
    });

    return () => off(servicesRef, 'value', unsubscribe);
  }, []);

  // Filter pending channels
  const pendingChannels = allChannels.filter((channel: any) => 
    channel.approvalStatus === 'pending' || channel.status === 'pending'
  );

  // Real-time withdrawal requests from Firebase
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true);

  // Real-time Firebase withdrawal listener
  useEffect(() => {
    const withdrawalsRef = ref(database, 'withdrawalRequests');

    const unsubscribe = onValue(withdrawalsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const withdrawalsArray = Object.entries(data).map(([id, withdrawal]: [string, any]) => ({
          id,
          ...withdrawal
        })).sort((a, b) => new Date(b.createdAt || b.requestDate).getTime() - new Date(a.createdAt || a.requestDate).getTime());

        setWithdrawalRequests(withdrawalsArray);
        console.log('🔥 Real-time withdrawals loaded:', withdrawalsArray.length);
      } else {
        setWithdrawalRequests([]);
      }
      setLoadingWithdrawals(false);
    });

    return () => off(withdrawalsRef, 'value', unsubscribe);
  }, []);

  // Approve withdrawal
  const handleApproveWithdrawal = async (withdrawalId: number, userName: string) => {
    const transactionId = prompt(`Enter transaction ID for ${userName}'s withdrawal:`);
    if (!transactionId) return;

    const adminNotes = prompt("Add admin notes (optional):");

    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, adminNotes })
      });

      if (response.ok) {
        toast({
          title: "✅ Withdrawal Approved",
          description: `₹${withdrawalRequests.find(w => w.id === withdrawalId)?.amount} approved for ${userName}`,
        });
        // Refresh data
        const updatedResponse = await fetch('/api/admin/withdrawals');
        const updatedData = await updatedResponse.json();
        setWithdrawalRequests(updatedData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve withdrawal",
        variant: "destructive"
      });
    }
  };

  // Reject withdrawal  
  const handleRejectWithdrawal = async (withdrawalId: number, userName: string) => {
    const adminNotes = prompt(`Reason for rejecting ${userName}'s withdrawal:`);
    if (!adminNotes) return;

    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes })
      });

      if (response.ok) {
        toast({
          title: "❌ Withdrawal Rejected",
          description: `${userName}'s withdrawal rejected. Funds returned to wallet.`,
        });
        // Refresh data
        const updatedResponse = await fetch('/api/admin/withdrawals');
        const updatedData = await updatedResponse.json();
        setWithdrawalRequests(updatedData);
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to reject withdrawal",
        variant: "destructive"
      });
    }
  };

  // User Bonus Management Functions - Fixed for Firebase User ID
  const handleGiveUserBonus = async (userId: string, amount: number, reason: string) => {
    if (!userId || amount <= 0 || !reason.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please provide valid user ID, amount, and reason",
        variant: "destructive"
      });
      return;
    }

    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        toast({
          title: "User Not Found",
          description: "User ID does not exist",
          variant: "destructive"
        });
        return;
      }

      const userData = userSnapshot.val();
      const currentBalance = userData.walletBalance || 0;
      const currentEarnings = userData.totalEarnings || 0;
      const currentBonusHistory = userData.bonusHistory || [];

      // Create bonus record
      const bonusRecord = {
        amount,
        reason,
        type: 'admin_bonus',
        adminName: 'Super Admin',
        createdAt: new Date().toISOString(),
        transactionId: `BONUS_${Date.now()}`
      };

      // Update user's wallet, earnings, and bonus history
      await update(userRef, {
        walletBalance: currentBalance + amount,
        totalEarnings: currentEarnings + amount,
        bonusHistory: [...currentBonusHistory, bonusRecord],
        lastBonusReceived: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

      // Also create a separate bonus record for admin tracking
      const bonusRef = ref(database, 'userBonuses');
      await push(bonusRef, {
        userId,
        userName: userData.displayName || 'User',
        userEmail: userData.email || 'No email',
        ...bonusRecord
      });

      toast({
        title: "✅ Bonus Given Successfully!",
        description: `₹${amount} bonus given to ${userData.displayName || 'User'} - ${reason}`,
      });

      // Refresh data
      setTimeout(() => {
        fetchUsers();
      }, 1000);

    } catch (error) {
      console.error('Error giving bonus:', error);
      toast({
        title: "Error",
        description: "Failed to give bonus. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Bulk bonus for REAL AUTHENTICATED users only - NO MOCK DATA
  const handleBulkBonus = async (amount: number) => {
    // Filter out admin users and only include real authenticated users
    const realUsers = users.filter(user => 
      user.email !== 'admin@channelmarket.com' && 
      user.id !== 1 && 
      user.displayName && 
      user.email && 
      user.email.includes('@') // Ensure it's a real email
    );

    if (realUsers.length === 0) {
      toast({
        title: "❌ No Real Users Found",
        description: "No real authenticated users available for bulk bonus",
        variant: "destructive"
      });
      return;
    }

    const confirmBulk = confirm(`Give ₹${amount} bonus to ${realUsers.length} REAL authenticated users?\n\nUsers: ${realUsers.map(u => u.displayName).join(', ')}\n\nThis cannot be undone.`);
    if (!confirmBulk) return;

    const reason = prompt("Enter reason for bulk bonus:") || "Bulk admin bonus";

    try {
      let successful = 0;
      for (const user of realUsers) {
        try {
          const response = await fetch(`/api/admin/users/${user.id}/bonus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              amount, 
              reason: `${reason} (Bulk to real users)`, 
              adminName: 'Super Admin',
              type: 'admin_bonus'
            })
          });
          if (response.ok) successful++;
        } catch (error) {
          console.error(`Failed to give bonus to ${user.displayName}:`, error);
        }
      }

      toast({
        title: "🎉 Bulk Bonus Completed",
        description: `Successfully gave ₹${amount} bonus to ${successful}/${realUsers.length} real authenticated users`,
      });

      // Refresh for real-time update
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bulk bonus",
        variant: "destructive"
      });
    }
  };

  // REMOVED DUPLICATE - Using existing functions below

  // Sold Out Handler - Fixed for Firebase
  const handleSoldOut = async (channelId: string, soldOut: boolean) => {
    try {
      await adminOperations.updateServiceMarketing(channelId, { soldOut });
      toast({
        title: soldOut ? "Channel marked as sold out" : "Sold out removed",
        description: soldOut ? "🔴 Channel is now sold out" : "✅ Channel is available again"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to update sold out status",
        variant: "destructive"
      });
    }
  };

  // Bonus Badge Handler
  const handleBonusBadge = async (channelId: string, badgeText?: string) => {
    try {
      if (badgeText) {
        await adminOperations.updateService(channelId, { 
          bonusBadge: badgeText,
          badgeText: badgeText,
          badgeType: 'admin_special',
          addedBy: 'Super Admin',
          badgeAddedAt: new Date().toISOString()
        });
      } else {
        await adminOperations.updateService(channelId, { 
          bonusBadge: null,
          badgeText: null,
          badgeType: null,
          addedBy: null,
          badgeAddedAt: null
        });
      }
      toast({
        title: badgeText ? "🏆 Badge Added" : "✅ Badge Removed", 
        description: badgeText ? `Added: ${badgeText}` : "Badge removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update badge",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    queryClient.invalidateQueries(['users']);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-black/40 backdrop-blur-xl">
            <CardHeader className="text-center">
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto mb-4"
              >
                <Crown className="w-16 h-16 text-yellow-400" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-white">
                🛡️ Super Admin Portal
              </CardTitle>
              <CardDescription className="text-gray-300">
                Restricted access - Authorization required
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-white">Master Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter super admin password"
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Access Control Panel
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header - Mobile Responsive */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 md:p-6 shadow-lg">
        <div className="w-full max-w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-0">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
              <div>
                <h1 className="text-lg md:text-3xl font-bold">Super Admin Dashboard</h1>
                <p className="text-sm md:text-base text-purple-100">Complete control & management system</p>
              </div>
            </div>
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Lock className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-[90%]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full h-auto">
            <TabsTrigger value="overview" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Overview</span>
              <span className="md:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Channels</span>
              <span className="md:hidden">Ch.</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Users className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Users</span>
              <span className="md:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="pwa-users" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <Smartphone className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">PWA Users</span>
              <span className="md:hidden">PWA</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Withdrawals</span>
              <span className="md:hidden">W.</span>
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm hidden md:flex">
              <Share2 className="w-3 h-3 md:w-4 md:h-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="bonuses" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm hidden md:flex">
              <Gift className="w-3 h-3 md:w-4 md:h-4" />
              Bonuses
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm hidden md:flex">
              <Settings className="w-3 h-3 md:w-4 md:h-4" />
              Controls
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Users</p>
                    <p className="text-3xl font-bold">{adminStats?.totalUsers || 0}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Total Channels</p>
                    <p className="text-3xl font-bold">{adminStats?.totalCourses || 0}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-yellow-500 to-orange-600 p-6 rounded-xl text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Pending Approval</p>
                    <p className="text-3xl font-bold">{pendingChannels?.length || 0}</p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-200" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-xl text-white shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Total Revenue</p>
                    <p className="text-3xl font-bold">₹{adminStats?.totalRevenue || 0}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-red-200" />
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button className="h-20 flex flex-col gap-2 bg-blue-500 hover:bg-blue-600">
                    <CheckCircle className="w-6 h-6" />
                    Approve All Pending
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-green-500 hover:bg-green-600">
                    <Gift className="w-6 h-6" />
                    Send Bonus
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-purple-500 hover:bg-purple-600">
                    <Award className="w-6 h-6" />
                    Grant Badges
                  </Button>
                  <Button className="h-20 flex flex-col gap-2 bg-orange-500 hover:bg-orange-600">
                    <RefreshCw className="w-6 h-6" />
                    Sync Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Channels Management Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Channel Management</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Actions
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:gap-6">
              {allChannels.map((channel) => (
                <Card key={channel.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-3 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                      <img
                        src={channel.thumbnail || '/placeholder-thumbnail.jpg'}
                        alt={channel.title}
                        className="w-full h-32 md:w-24 md:h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-0">
                          <div>
                            <h3 className="font-semibold text-lg">{channel.title}</h3>
                            <p className="text-gray-600 text-sm">{channel.description}</p>

                            {/* Show Category and Monetization */}
                            <div className="flex items-center gap-2 mt-2 mb-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                📱 {channel.category || 'General'}
                              </Badge>
                              {channel.monetized && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  💰 Monetized
                                </Badge>
                              )}
                              {channel.seller && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                  👤 {channel.seller}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {channel.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {channel.comments || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ₹{channel.price}
                              </span>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge 
                              className={
                                channel.status === 'active' && channel.approvalStatus === 'approved'
                                  ? 'bg-green-500'
                                  : channel.status === 'pending'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }
                            >
                              {channel.approvalStatus || channel.status}
                            </Badge>

                            {/* Show additional status badges */}
                            {channel.soldOut && (
                              <Badge className="bg-red-600 text-white block">
                                🔴 SOLD OUT
                              </Badge>
                            )}

                            {channel.bonusBadge && (
                              <Badge className="bg-yellow-500 text-white block">
                                🏆 {channel.badgeText || "FEATURED"}
                              </Badge>
                            )}

                            {channel.blocked && (
                              <Badge className="bg-gray-600 text-white block">
                                🚫 BLOCKED
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 md:gap-2 mt-3 md:mt-4">
                          {(channel.status === 'pending' || channel.approvalStatus === 'pending') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveService(channel.id)}
                                className="bg-green-500 hover:bg-green-600 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                              >
                                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                Approve
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive" className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-2">
                                    <XCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Channel</DialogTitle>
                                    <DialogDescription>
                                      Provide a reason for rejecting this channel
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                  />
                                  <DialogFooter>
                                    <Button
                                      onClick={() => {
                                        handleRejectService(channel.id, rejectionReason);
                                        setRejectionReason("");
                                      }}
                                    >
                                      Confirm Rejection
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Edit3 className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Channel</DialogTitle>
                                <DialogDescription>
                                  Update channel information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Channel Title</Label>
                                  <Input
                                    defaultValue={channel.title}
                                    onChange={(e) => setEditingChannel({...channel, title: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    defaultValue={channel.description}
                                    onChange={(e) => setEditingChannel({...channel, description: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label>Price (₹)</Label>
                                  <Input
                                    type="number"
                                    defaultValue={channel.price}
                                    onChange={(e) => setEditingChannel({...channel, price: parseFloat(e.target.value)})}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={async () => {
                                    if (editingChannel) {
                                      try {
                                        const serviceRef = ref(database, `services/${channel.id}`);
                                        await update(serviceRef, {
                                          title: editingChannel.title,
                                          description: editingChannel.description,
                                          price: editingChannel.price,
                                          lastUpdated: new Date().toISOString(),
                                          updatedBy: 'Super Admin'
                                        });

                                        // Update local state to reflect changes immediately
                                        setAllChannels(prevChannels =>
                                          prevChannels.map(c =>
                                            c.id === channel.id
                                              ? { ...c, ...editingChannel, lastUpdated: new Date().toISOString() }
                                              : c
                                          )
                                        );

                                        setEditingChannel(null);

                                        toast({
                                          title: "✅ Channel Updated Successfully!",
                                          description: `${editingChannel.title} has been updated`
                                        });

                                        // Refresh data after a short delay
                                        setTimeout(() => {
                                          window.location.reload();
                                        }, 1000);
                                      } catch (error) {
                                        console.error('Error updating channel:', error);
                                        toast({ 
                                          title: "❌ Update Failed",
                                          description: "Failed to update channel. Please try again.",
                                          variant: "destructive"
                                        });
                                      }
                                    }
                                  }}
                                >
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBlockService(channel.id, !channel.blocked, 'Admin action')}
                          >
                            {channel.blocked ? <Eye className="w-4 h-4 mr-1" /> : <EyeOff className="w-4 h-4 mr-1" />}
                            {channel.blocked ? 'Unblock' : 'Block'}
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleSoldOut(channel.id, !channel.soldOut)}
                            className={channel.soldOut ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                          >
                            {channel.soldOut ? '✅ Remove Sold Out' : '🔴 Mark Sold Out'}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                                🏆 Bonus Badge
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Bonus Badge</DialogTitle>
                                <DialogDescription>
                                  Add a special bonus badge to this channel
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Badge Text</Label>
                                  <Input
                                    value={bonusBadgeText}
                                    onChange={(e) => setBonusBadgeText(e.target.value)}
                                    placeholder="Badge text (e.g., 🔥 HOT DEAL)"
                                  />
                                </div>
                                <div>
                                  <Label>Added by: Super Admin</Label>
                                  <p className="text-sm text-gray-600">This badge will be added by authenticated admin user</p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={() => {
                                    fetch(`/api/courses/${channel.id}/bonus-badge`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ 
                                        badgeText: bonusBadgeText,
                                        badgeType: 'admin_special',
                                        addedBy: 'Super Admin',
                                        addedAt: new Date().toISOString()
                                      })
                                    }).then(() => {
                                      toast({ 
                                        title: "🏆 Badge Added Successfully",
                                        description: `Badge "${bonusBadgeText}" added by Super Admin`
                                      });
                                      queryClient.invalidateQueries({ queryKey: ['/api/admin/channels'] });
                                      setBonusBadgeText("🔥 HOT DEAL");
                                    });
                                  }}
                                >
                                  Add Badge
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteService(channel.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const newThumbnail = prompt("Enter new thumbnail URL:");
                              if (newThumbnail) {
                                // Update thumbnail API call
                                fetch(`/api/courses/${channel.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ thumbnail: newThumbnail })
                                }).then(() => {
                                  toast({ title: "✅ Thumbnail Updated" });
                                  queryClient.invalidateQueries({ queryKey: ['/api/admin/channels'] });
                                });
                              }
                            }}
                          >
                            <Image className="w-4 h-4 mr-1" />
                            Change Thumbnail
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline"
                            className={channel.soldOut ? "bg-red-100" : ""}
                            onClick={() => handleSoldOut(channel.id, !channel.soldOut)}
                          >
                            <Award className="w-4 h-4 mr-1" />
                            {channel.soldOut ? 'Remove Sold Out' : 'Mark Sold Out'}
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline"
                            className={channel.bonusBadge ? "bg-yellow-100" : ""}
                            onClick={() => {
                              if (channel.bonusBadge) {
                                handleBonusBadge(channel.id);
                              } else {
                                const badgeText = prompt("Enter badge text:", "🔥 HOT");
                                if (badgeText) {
                                  handleBonusBadge(channel.id, badgeText);
                                }
                              }
                            }}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            {channel.bonusBadge ? 'Remove Badge' : 'Add Bonus Badge'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Users Management Tab with Working Functionality */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management - Real-time Data 😎</h2>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button onClick={() => {
                  const amount = prompt("Enter bonus amount for all users:");
                  if (amount) handleBulkBonus(parseInt(amount));
                }}>
                  <Gift className="w-4 h-4 mr-2" />
                  Bulk Bonus
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {users.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No users data available</p>
                </Card>
              ) : (
                users.map((user) => (
                  <Card key={user.id} className="p-6 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/30 border-l-4 border-blue-500">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                              {user.displayName || 'Unknown User'}
                            </h3>
                            <Badge className={user.isActive !== false ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                              {user.isActive !== false ? 'Active' : 'Blocked'}
                            </Badge>
                            {user.userLevel && (
                              <Badge className="bg-purple-500 text-white">
                                {user.userLevel}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 font-medium">{user.email}</p>
                          {user.phoneNumber && (
                            <p className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1">
                              📱 {user.phoneNumber}
                            </p>
                          )}

                          {/* Enhanced Real-time Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-center">
                              <div className="text-lg font-bold text-green-700 dark:text-green-400">
                                ₹{user.walletBalance || 0}
                              </div>
                              <div className="text-xs text-green-600 dark:text-green-500">Wallet</div>
                            </div>

                            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-center">
                              <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                {user.totalReferrals || 0}
                              </div>
                              <div className="text-xs text-purple-600 dark:text-purple-500">Referrals</div>
                            </div>

                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                {user.totalPurchases || 0}
                              </div>
                              <div className="text-xs text-blue-600 dark:text-blue-500">Purchases</div>
                            </div>

                            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-center">
                              <div className="text-lg font-bold text-orange-700 dark:text-orange-400">
                                ₹{user.totalSpent || 0}
                              </div>
                              <div className="text-xs text-orange-600 dark:text-orange-500">Total Spent</div>
                            </div>

                            <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2 rounded-lg text-center">
                              <div className="text-lg font-bold text-cyan-700 dark:text-cyan-400">
                                {user.totalChannels || 0}
                              </div>
                              <div className="text-xs text-cyan-600 dark:text-cyan-500">Channels</div>
                            </div>
                          </div>

                          {/* Enhanced User Activity Timeline */}
                          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Last Active: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                              </span>
                              {user.referredBy && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <Share2 className="w-3 h-3" />
                                  Referred by: {user.referredBy}
                                </span>
                              )}
                              {user.totalEarnings && (
                                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                  <DollarSign className="w-3 h-3" />
                                  Total Earned: ₹{user.totalEarnings}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons with Working Functionality */}
                      <div className="flex flex-wrap gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                              <Gift className="w-4 h-4 mr-1" />
                              Give Bonus
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Give Bonus to {user.displayName}</DialogTitle>
                              <DialogDescription>
                                Add bonus amount and reason for {user.email}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="bonusAmount">Bonus Amount (₹)</Label>
                                <Input
                                  id="bonusAmount"
                                  type="number"
                                  value={bonusAmount}
                                  onChange={(e) => setBonusAmount(parseInt(e.target.value) || 0)}
                                  placeholder="Enter amount"
                                  min="1"
                                />
                              </div>
                              <div>
                                <Label htmlFor="bonusReason">Reason</Label>
                                <Textarea
                                  id="bonusReason"
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Enter reason for bonus..."
                                />
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <strong>Current Balance:</strong> ₹{user.walletBalance || 0}
                                </p>
                                <p className="text-sm text-blue-700">
                                  <strong>New Balance:</strong> ₹{(user.walletBalance || 0) + bonusAmount}
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => {
                                  if (bonusAmount > 0 && rejectionReason.trim()) {
                                    handleGiveUserBonus(user.id.toString(), bonusAmount, rejectionReason);
                                    setBonusAmount(0);
                                    setRejectionReason("");
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Please enter valid amount and reason",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Gift className="w-4 h-4 mr-2" />
                                Give ₹{bonusAmount} Bonus
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300">
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                </div>
                                Full Details - {user.displayName}
                              </DialogTitle>
                              <DialogDescription>
                                Complete user profile and activity history
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 max-h-96 overflow-y-auto">
                              {/* User Info Section */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4">
                                  <h4 className="font-semibold mb-2">Personal Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Name:</strong> {user.displayName || 'Not provided'}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
                                    <p><strong>Status:</strong> 
                                      <Badge className={user.isActive !== false ? "bg-green-500 ml-2" : "bg-red-500 ml-2"}>
                                        {user.isActive !== false ? 'Active' : 'Blocked'}
                                      </Badge>
                                    </p>
                                  </div>
                                </Card>

                                <Card className="p-4">
                                  <h4 className="font-semibold mb-2">Financial Summary</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Wallet Balance:</strong> ₹{user.walletBalance || 0}</p>
                                    <p><strong>Total Earnings:</strong> ₹{user.totalEarnings || 0}</p>
                                    <p><strong>Total Spent:</strong> ₹{user.totalSpent || 0}</p>
                                    <p><strong>Referral Earnings:</strong> ₹{(user.totalReferrals || 0) * 10}</p>
                                  </div>
                                </Card>
                              </div>

                              {/* Activity Stats */}
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2">Activity Statistics</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                  <div className="bg-blue-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-blue-600">{user.totalChannels || 0}</div>
                                    <div className="text-xs text-blue-500">Channels Added</div>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-green-600">{user.totalPurchases || 0}</div>
                                    <div className="text-xs text-green-500">Purchases</div>
                                  </div>
                                  <div className="bg-purple-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-purple-600">{user.totalReferrals || 0}</div>
                                    <div className="text-xs text-purple-500">Referrals</div>
                                  </div>
                                  <div className="bg-orange-50 p-3 rounded">
                                    <div className="text-2xl font-bold text-orange-600">{user.loginCount || 0}</div>
                                    <div className="text-xs text-orange-500">Total Logins</div>
                                  </div>
                                </div>
                              </Card>

                              {/* Recent Activity */}
                              <Card className="p-4">
                                <h4 className="font-semibold mb-2">Account Timeline</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Account Created:</span>
                                    <span className="text-gray-600">{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Last Login:</span>
                                    <span className="text-gray-600">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Last Updated:</span>
                                    <span className="text-gray-600">{user.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : 'N/A'}</span>
                                  </div>
                                  {user.referredBy && (
                                    <div className="flex justify-between">
                                      <span>Referred By:</span>
                                      <span className="text-green-600">{user.referredBy}</span>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant="outline" 
                          className={user.isActive !== false ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-300" : "bg-green-50 hover:bg-green-100 text-green-700 border-green-300"}
                          onClick={() => {
                            const action = user.isActive !== false ? 'block' : 'unblock';
                            const reason = action === 'block' ? prompt(`Enter reason for blocking ${user.displayName}:`) : null;
                            if (action === 'unblock' || (action === 'block' && reason)) {
                              fetch(`/api/admin/users/${user.id}/${action}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reason })
                              }).then(() => {
                                toast({
                                  title: `User ${action}ed successfully`,
                                  description: `${user.displayName} has been ${action}ed.`
                                });
                                window.location.reload();
                              });
                            }
                          }}
                        >
                          {user.isActive !== false ? <Ban className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                          {user.isActive !== false ? 'Block User' : 'Unblock User'}
                        </Button>

                        <Button size="sm" variant="outline" className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300">
                          <Award className="w-4 h-4 mr-1" />
                          Give Badge
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Purchase History Preview */}
                    {user.recentPurchases && user.recentPurchases.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Recent Purchases:</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.recentPurchases.slice(0, 3).map((purchase: any, index: number) => (
                            <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                              {purchase.title} - ₹{purchase.price}
                            </Badge>
                          ))}
                          {user.recentPurchases.length > 3 && (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700">
                              +{user.recentPurchases.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* User's Channels Summary */}
                    {user.totalChannels && user.totalChannels > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Channels Summary:</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-blue-50 p-2 rounded text-center">
                            <div className="font-semibold text-blue-600">{user.totalChannels}</div>
                            <div className="text-blue-500">Total Channels</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded text-center">
                            <div className="font-semibold text-green-600">₹{user.avgChannelPrice || 0}</div>
                            <div className="text-green-500">Avg Price</div>
                          </div>
                          <div className="bg-purple-50 p-2 rounded text-center">
                            <div className="font-semibold text-purple-600">₹{user.channelEarnings || 0}</div>
                            <div className="text-purple-500">Total Value</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  Referral System Management
                </CardTitle>
                <CardDescription>
                  ₹10 per referral bonus system - Real-time tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-600">₹10</h3>
                    <p className="text-green-700">Per Referral Bonus</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-600">Real-time</h3>
                    <p className="text-blue-700">Instant Processing</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-purple-600">Active</h3>
                    <p className="text-purple-700">System Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Real-time Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold">Real-time Withdrawal Management 💸</h2>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-yellow-500 text-white animate-pulse">
                  {withdrawalRequests.filter(w => w.status === 'pending').length} Pending
                </Badge>
                <Badge className="bg-green-500 text-white">
                  {withdrawalRequests.filter(w => w.status === 'approved').length} Approved
                </Badge>
                <Badge className="bg-red-500 text-white">
                  {withdrawalRequests.filter(w => w.status === 'rejected').length} Rejected
                </Badge>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="ml-2"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>

            {loadingWithdrawals ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-sm md:text-base">Loading withdrawals...</span>
              </div>
            ) : withdrawalRequests.length === 0 ? (
              <Card className="p-4 md:p-8 text-center">
                <DollarSign className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm md:text-base">No withdrawal requests found</p>
                <p className="text-xs text-gray-400 mt-2">Withdrawal requests from users will appear here</p>
              </Card>
            ) : (
              <div className="grid gap-3 md:gap-4">
                {withdrawalRequests.map((withdrawal) => {
                  const user = users.find(u => u.id === withdrawal.userId);
                  return (
                    <Card key={withdrawal.id} className={`relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-0 ${
                      withdrawal.status === 'pending' ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50' :
                      withdrawal.status === 'approved' ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50' :
                      'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50'
                    }`}>
                      {/* Status Bar */}
                      <div className={`h-2 w-full ${
                        withdrawal.status === 'pending' ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500' :
                        withdrawal.status === 'approved' ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500' :
                        'bg-gradient-to-r from-red-400 via-pink-500 to-rose-500'
                      }`}></div>

                      <div className="space-y-4 p-6">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                              withdrawal.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                              withdrawal.status === 'approved' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                              'bg-gradient-to-r from-red-500 to-pink-500'
                            }`}>
                              {withdrawal.userName?.charAt(0) || withdrawal.userEmail?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-gray-900 mb-1">
                                {withdrawal.userName || user?.displayName || 'Unknown User'}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">{withdrawal.userEmail || user?.email}</p>
                              <Badge className={`text-sm font-semibold ${
                                withdrawal.status === 'pending' ? 'bg-amber-500 text-white' :
                                withdrawal.status === 'approved' ? 'bg-emerald-500 text-white' :
                                'bg-red-500 text-white'
                              }`}>
                                {withdrawal.status === 'pending' ? 'PROCESSING' :
                                 withdrawal.status === 'approved' ? 'COMPLETED' :
                                 'REJECTED'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-bold text-gray-800 mb-1">₹{withdrawal.amount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 mb-1">Request #{withdrawal.requestId || withdrawal.id}</p>
                            <p className="text-sm text-blue-600">{new Date(withdrawal.createdAt || withdrawal.requestDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                            <Wallet className="w-5 h-5 text-blue-600" />
                            Payment Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 block">Method:</span>
                              <p className="font-bold text-lg text-blue-600">{withdrawal.method}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Account:</span>
                              <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
                                {withdrawal.accountDetails || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600 block">Requested:</span>
                              <p className="text-sm">{new Date(withdrawal.createdAt || withdrawal.requestDate).toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Method-specific details */}
                          {withdrawal.method === 'UPI' && withdrawal.phoneNumber && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-blue-800 mb-2">🔹 UPI Details</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-blue-600">UPI ID:</span>
                                  <p className="font-mono">{withdrawal.upiId}</p>
                                </div>
                                <div>
                                  <span className="text-blue-600">Mobile:</span>
                                  <p className="font-mono">{withdrawal.phoneNumber}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {withdrawal.method === 'BANK' && withdrawal.bankName && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <h5 className="font-medium text-green-800 mb-2">🏦 Bank Details</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-green-600">Bank:</span>
                                  <p className="font-bold">{withdrawal.bankName}</p>
                                </div>
                                <div>
                                  <span className="text-green-600">Account:</span>
                                  <p className="font-mono">{withdrawal.accountNumber}</p>
                                </div>
                                <div>
                                  <span className="text-green-600">IFSC:</span>
                                  <p className="font-mono">{withdrawal.ifscCode}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {withdrawal.method === 'CRYPTO' && withdrawal.cryptoAddress && (
                            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                              <h5 className="font-medium text-orange-800 mb-2">₿ Crypto Details</h5>
                              <div>
                                <span className="text-orange-600">USD Wallet Address:</span>
                                <p className="font-mono text-xs break-all bg-white p-2 rounded mt-1">{withdrawal.cryptoAddress}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Admin Actions & Status */}
                        <div className="flex flex-col md:flex-row gap-3">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600 text-white flex-1"
                                onClick={async () => {
                                  const transactionId = prompt(`Enter transaction ID for ${withdrawal.userName}'s ₹${withdrawal.amount} withdrawal:`);
                                  if (!transactionId) return;

                                  const adminNotes = prompt("Add admin notes (optional):");

                                  try {
                                    // Update Firebase withdrawal status
                                    const withdrawalRef = ref(database, `withdrawalRequests/${withdrawal.id}`);
                                    await update(withdrawalRef, {
                                      status: 'approved',
                                      transactionId,
                                      adminNotes: adminNotes || 'Approved by Super Admin',
                                      processedBy: 'Super Admin',
                                      processedAt: new Date().toISOString()
                                    });

                                    toast({
                                      title: "✅ Withdrawal Approved!",
                                      description: `₹${withdrawal.amount} approved for ${withdrawal.userName}`,
                                    });

                                    setTimeout(() => window.location.reload(), 1000);
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to approve withdrawal",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Send Payment
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="flex-1"
                                onClick={async () => {
                                  const rejectionReason = prompt(`Enter reason for rejecting ${withdrawal.userName}'s withdrawal:`);
                                  if (!rejectionReason) return;

                                  try {
                                    // Update Firebase withdrawal status
                                    const withdrawalRef = ref(database, `withdrawalRequests/${withdrawal.id}`);
                                    await update(withdrawalRef, {
                                      status: 'rejected',
                                      rejectionReason,
                                      adminNotes: rejectionReason,
                                      processedBy: 'Super Admin',
                                      processedAt: new Date().toISOString()
                                    });

                                    // Return money to user's wallet
                                    const userRef = ref(database, `users/${withdrawal.userId}`);
                                    const userSnapshot = await get(userRef);
                                    if (userSnapshot.exists()) {
                                      const currentBalance = userSnapshot.val().walletBalance || 0;
                                      await update(userRef, {
                                        walletBalance: currentBalance + withdrawal.amount
                                      });
                                    }

                                    toast({
                                      title: "❌ Withdrawal Rejected",
                                      description: `${withdrawal.userName}'s withdrawal rejected. ₹${withdrawal.amount} returned to wallet.`,
                                    });

                                    setTimeout(() => window.location.reload(), 1000);
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to reject withdrawal",
                                      variant: "destructive"
                                    });
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject & Return Money
                              </Button>
                            </>
                          )}

                          {withdrawal.status === 'approved' && (
                            <div className="bg-green-100 border border-green-300 rounded-lg p-4 w-full">
                              <div className="flex items-center gap-3 text-green-800">
                                <CheckCircle className="w-6 h-6" />
                                <div>
                                  <p className="font-bold">✅ Payment Completed</p>
                                  <p className="text-sm">Processed by {withdrawal.processedBy} on {new Date(withdrawal.processedAt).toLocaleString()}</p>
                                  {withdrawal.transactionId && (
                                    <p className="text-xs font-mono bg-green-200 px-2 py-1 rounded mt-1">
                                      TXN: {withdrawal.transactionId}
                                    </p>
                                  )}
                                  {withdrawal.adminNotes && (
                                    <p className="text-xs mt-1">Notes: {withdrawal.adminNotes}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {withdrawal.status === 'rejected' && (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-4 w-full">
                              <div className="flex items-center gap-3 text-red-800">
                                <XCircle className="w-6 h-6" />
                                <div>
                                  <p className="font-bold">❌ Withdrawal Rejected</p>
                                  <p className="text-sm">Processed by {withdrawal.processedBy} on {new Date(withdrawal.processedAt).toLocaleString()}</p>
                                  {withdrawal.rejectionReason && (
                                    <p className="text-xs bg-red-200 px-2 py-1 rounded mt-1">
                                      Reason: {withdrawal.rejectionReason}
                                    </p>
                                  )}
                                  <p className="text-xs mt-1 text-green-600">✅ ₹{withdrawal.amount} returned to user's wallet</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* User Bonuses Management Tab */}
          <TabsContent value="bonuses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Bonus System 🎁</h2>
              <Button
                onClick={() => {
                  const userId = prompt("Enter User ID to give bonus:");
                  if (!userId) return;

                  const amount = prompt("Enter bonus amount (₹):");
                  if (!amount || isNaN(Number(amount))) return;

                  const reason = prompt("Enter reason for bonus:");
                  if (!reason) return;

                  handleGiveUserBonus(userId, parseInt(amount), reason);
                }}
                className="bg-green-500 hover:bg-green-600"
              >
                <Gift className="w-4 h-4 mr-2" />
                Give User Bonus
              </Button>
            </div>

            {/* Quick Bonus Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="text-center">
                  <Gift className="w-8 h-8 mx-auto text-green-600 mb-2" />
                  <h3 className="font-semibold text-green-800">Quick Bonus</h3>
                  <p className="text-sm text-green-600">Instant reward system</p>
                  <div className="flex gap-1 mt-2">
                    {[50, 100, 200].map(amount => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="text-green-700 border-green-300 hover:bg-green-100"
                        onClick={() => {
                          const userId = prompt(`Give ₹${amount} bonus to User ID:`);
                          if (userId) handleGiveUserBonus(userId, amount, `Quick ₹${amount} bonus`);
                        }}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                  <h3 className="font-semibold text-blue-800">Bulk Bonus</h3>
                  <p className="text-sm text-blue-600">Reward multiple users</p>
                  <Button
                    size="sm"
                    className="mt-2 bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      const amount = prompt("Enter bonus amount for all active users:");
                      if (amount) handleBulkBonus(parseInt(amount));
                    }}
                  >
                    Bulk Reward
                  </Button>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="text-center">
                  <Award className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                  <h3 className="font-semibold text-purple-800">Achievement</h3>
                  <p className="text-sm text-purple-600">Special rewards</p>
                  <div className="flex gap-1 mt-2">
                    {[500, 1000].map(amount => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        className="text-purple-700 border-purple-300 hover:bg-purple-100"
                        onClick={() => {
                          const userId = prompt(`Give ₹${amount} achievement bonus to User ID:`);
                          if (userId) handleGiveUserBonus(userId, amount, `Achievement bonus ₹${amount}`);
                        }}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Bonuses */}
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Recent User Bonuses
                </CardTitle>
                <CardDescription>
                  Real-time bonus transactions and rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold">{user.displayName}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-green-600">Balance: ₹{user.walletBalance || 0}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGiveUserBonus(user.id, 100, "Admin appreciation bonus")}
                        >
                          <Gift className="w-3 h-3 mr-1" />
                          ₹100
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => {
                            const amount = prompt(`Enter bonus amount for ${user.displayName}:`);
                            const reason = prompt("Enter bonus reason:");
                            if (amount && reason) {
                              handleGiveUserBonus(user.id, parseInt(amount), reason);
                            }
                          }}
                        >
                          <Gift className="w-3 h-3 mr-1" />
                          Custom
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {users.length === 0 && (
                  <div className="text-center py-8">
                    <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No users available for bonuses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh All Data
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Analytics
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Award className="w-4 h-4 mr-2" />
                    Manage Badges
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" variant="destructive">
                    <Ban className="w-4 h-4 mr-2" />
                    Emergency Block All
                  </Button>
                  <Button className="w-full" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Pending Queue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PWA Users Tab */}
          <TabsContent value="pwa-users" className="space-y-6">
            <PWAUsersSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}