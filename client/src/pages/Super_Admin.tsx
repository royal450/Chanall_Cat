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
  Zap, Heart, MessageSquare, Share2, ThumbsUp, Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { useFirebaseServices, useFirebaseUsers, useFirebaseAdminStats } from "@/hooks/use-firebase-realtime";
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';
import { adminOperations } from "@/lib/admin-firebase";
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

  // Mock withdrawal requests (should come from API)
  const [withdrawalRequests] = useState<WithdrawalRequest[]>([
    {
      id: "1",
      userId: "user1",
      userName: "John Doe",
      amount: 500,
      method: "UPI",
      accountDetails: "john@paytm",
      status: "pending",
      createdAt: new Date().toISOString()
    }
  ]);

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

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-auto">
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
            <TabsTrigger value="referrals" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm hidden md:flex">
              <Share2 className="w-3 h-3 md:w-4 md:h-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:p-3 text-xs md:text-sm hidden md:flex">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
              Withdrawals
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
                                  onClick={() => {
                                    if (editingChannel) {
                                      fetch(`/api/courses/${channel.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(editingChannel)
                                      }).then(() => {
                                        toast({ title: "✅ Channel Updated Successfully" });
                                        queryClient.invalidateQueries({ queryKey: ['/api/admin/channels'] });
                                        setEditingChannel(null);
                                      });
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

          {/* Users Management Tab - Enhanced */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management - Real-time Data 😎</h2>
              <div className="flex gap-2">
                <Button>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button>
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
                            <Badge className="bg-green-500 text-white">
                              {user.status || 'Active'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 font-medium">{user.email}</p>
                          {user.phoneNumber && (
                            <p className="text-blue-600 dark:text-blue-400 text-sm flex items-center gap-1">
                              📱 {user.phoneNumber}
                            </p>
                          )}
                          
                          {/* Real-time Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
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
                          </div>

                          {/* User Activity Timeline */}
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
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                          <Gift className="w-4 h-4 mr-1" />
                          Give Bonus
                        </Button>
                        <Button size="sm" variant="outline" className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300">
                          <Award className="w-4 h-4 mr-1" />
                          Give Badge
                        </Button>
                        <Button size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300">
                          <Ban className="w-4 h-4 mr-1" />
                          Block User
                        </Button>
                      </div>
                    </div>

                    {/* Purchase History Preview */}
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

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Withdrawal Management</h2>
              <Badge className="bg-green-500">
                {withdrawalRequests.filter(w => w.status === 'pending').length} Pending
              </Badge>
            </div>

            <div className="grid gap-4">
              {withdrawalRequests.map((withdrawal) => (
                <Card key={withdrawal.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{withdrawal.userName}</h3>
                      <p className="text-gray-600">₹{withdrawal.amount} via {withdrawal.method}</p>
                      <p className="text-sm text-gray-500">{withdrawal.accountDetails}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
        </Tabs>
      </div>
    </div>
  );
}