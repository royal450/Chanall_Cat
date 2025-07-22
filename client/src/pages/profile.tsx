import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ref, onValue, update, push, get } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { QRCodeComponent } from '@/components/qr-code';
import { useToast } from '@/hooks/use-toast';
import { Copy, Share2, Users, Wallet, BookOpen, Star, TrendingUp, IndianRupee, CheckCircle, XCircle, Clock, Eye, UserPlus, Gift } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  walletBalance: number;
  totalEarnings: number;
  totalReferrals: number;
  referralCode: string;
  joinDate: string;
  totalCourses: number;
  coursesCreated: number;
  totalSales: number;
  averageRating: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  fakePrice: number;
  category: string;
  thumbnail: string;
  instructor: string;
  instructorId: string;
  likes: number;
  comments: number;
  sales: number;
  approvalStatus: string;
  rejectionReason?: string;
  blocked: boolean;
  blockReason?: string;
  createdAt: string;
  views: number;
}

interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  todayReferrals: number;
  todayEarnings: number;
  monthlyReferrals: number;
  monthlyEarnings: number;
  referralRate: number;
  conversionRate: number;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isUpdatingChannel, setIsUpdatingChannel] = useState<string | null>(null);

  // Generate referral code from user ID
  const generateReferralCode = (userId: string) => {
    const code = userId.substring(0, 8).toUpperCase();
    return code;
  };

  useEffect(() => {
    if (!user) return;

    // Load user profile
    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();

      // Create profile even if no data exists in Firebase
      const profileData = {
        id: user.uid,
        email: user.email || '',
        displayName: data?.displayName || user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: data?.photoURL || user.photoURL || '',
        walletBalance: data?.walletBalance || 0,
        totalEarnings: data?.totalEarnings || 0,
        totalReferrals: data?.totalReferrals || 0,
        referralCode: data?.referralCode || '',
        joinDate: data?.joinDate || new Date().toISOString(),
        totalCourses: data?.totalCourses || 0,
        coursesCreated: data?.coursesCreated || 0,
        totalSales: data?.totalSales || 0,
        averageRating: data?.averageRating || 4.5,
      };

      setProfile(profileData);

      // Create user profile in Firebase if it doesn't exist
      if (!data) {
        // Auto-generate PERMANENT referral code for new users (only once)
        const autoReferralCode = Math.random().toString(36).substring(2, 12).toUpperCase();

        update(userRef, {
          displayName: profileData.displayName,
          email: profileData.email,
          photoURL: profileData.photoURL,
          walletBalance: 0,
          totalEarnings: 0,
          totalReferrals: 0,
          referralCode: autoReferralCode,
          joinDate: new Date().toISOString(),
          totalCourses: 0,
          coursesCreated: 0,
          totalSales: 0,
          averageRating: 4.5,
          referralHistory: [],
        }).then(() => {
          // Update the profile state with the generated referral code
          setProfile(prev => prev ? { ...prev, referralCode: autoReferralCode } : null);
        }).catch(error => {
          console.error('Error creating user profile:', error);
        });
      }

      setLoading(false);
    });

    // Load user's channels from services (NOT courses)
    const servicesRef = ref(database, 'services');
    const unsubscribeServices = onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userChannels = Object.entries(data)
          .filter(([id, service]: [string, any]) => service.instructorId === user.uid)
          .map(([id, service]: [string, any]) => ({
            id,
            title: service.title,
            description: service.description,
            thumbnail: service.thumbnail,
            price: service.price,
            fakePrice: service.fakePrice,
            category: service.category,
            instructor: service.instructor,
            instructorId: service.instructorId,
            likes: service.likes || 0,
            comments: service.comments || 0,
            views: service.views || Math.floor(Math.random() * 50000) + 10000,
            sales: service.sales || service.soldCount || 0,
            approvalStatus: service.approvalStatus || 'pending',
            blocked: service.blocked || false,
            blockReason: service.blockReason,
            rejectionReason: service.rejectionReason,
            createdAt: service.createdAt,
          }));
        console.log('User channels loaded:', userChannels);
        setMyCourses(userChannels);
      } else {
        console.log('No services found for user');
        setMyCourses([]);
      }
    });

    // Load referral stats
    const referralStatsRef = ref(database, `referralStats/${user.uid}`);
    const unsubscribeStats = onValue(referralStatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setReferralStats(data);
      } else {
        setReferralStats({
          totalReferrals: 0,
          totalEarnings: 0,
          todayReferrals: 0,
          todayEarnings: 0,
          monthlyReferrals: 0,
          monthlyEarnings: 0,
          referralRate: 0,
          conversionRate: 0,
        });
      }
    });

    // Load withdrawal history
    const withdrawalRef = ref(database, 'withdrawalRequests');
    const unsubscribeWithdrawals = onValue(withdrawalRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userWithdrawals = Object.entries(data)
          .filter(([id, withdrawal]: [string, any]) => withdrawal.userId === user.uid)
          .map(([id, withdrawal]: [string, any]) => ({ id, ...withdrawal }));
        setWithdrawalHistory(userWithdrawals);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeServices();
      unsubscribeStats();
      unsubscribeWithdrawals();
    };
  }, [user]);

  // Remove regenerate function - code is permanent once generated

  const copyReferralLink = async () => {
    if (!profile?.referralCode) {
      toast({
        title: "No Referral Code",
        description: "Your referral code is being generated",
        variant: "destructive",
      });
      return;
    }

    const link = `${window.location.origin}/signup?ref=${profile.referralCode}`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      toast({
        title: "Link Copied! 📋",
        description: "Referral link has been copied to clipboard",
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = async () => {
    if (!profile?.referralCode) {
      toast({
        title: "No Referral Code",
        description: "Your referral code is being generated",
        variant: "destructive",
      });
      return;
    }

    const link = `${window.location.origin}/signup?ref=${profile.referralCode}`;
    const text = `🚀 Join this amazing course platform and get ₹10 bonus! Use my referral link: ${link}`;

    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: 'Course Platform Referral',
          text,
          url: link,
        });
        toast({
          title: "Link Shared! 🎉",
          description: "Thanks for sharing your referral link!",
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
          copyReferralLink();
        } else {
          toast({
            title: "Share Cancelled",
            description: "No worries! You can copy the link instead.",
          });
        }
      }
    } else {
      copyReferralLink();
    }
  };

  const requestWithdrawal = async () => {
    if (!user || !withdrawalAmount || !profile) return;

    const amount = parseInt(withdrawalAmount);
    if (amount < 100) {
      toast({
        title: "Minimum Withdrawal Error",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive",
      });
      return;
    }

    if (amount > profile.walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    try {
      // Deduct amount from user's wallet immediately
      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, {
        walletBalance: profile.walletBalance - amount
      });

      // Create withdrawal request
      const withdrawalRef = ref(database, 'withdrawalRequests');
      await push(withdrawalRef, {
        userId: user.uid,
        amount,
        method: withdrawalMethod,
        status: 'pending',
        requestDate: new Date().toISOString(),
        userEmail: user.email,
        userName: profile.displayName,
      });

      toast({
        title: "Withdrawal Requested! 💰",
        description: `₹${amount} has been deducted from your wallet. Request submitted for review.`,
      });

      setWithdrawalAmount('');
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, blocked: boolean) => {
    if (blocked) return <Badge variant="destructive">Blocked</Badge>;

    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <img
              src={profile.photoURL || '/api/placeholder/120/120'}
              alt={profile.displayName}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile.displayName}</h1>
          <p className="text-gray-600 mb-4">{profile.email}</p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>Joined: {new Date(profile.joinDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>Member ID: {profile.id.slice(0, 8)}</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="courses">My Channels</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Wallet Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{profile.walletBalance.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{profile.totalEarnings.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Total Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.totalReferrals}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Courses Created
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.coursesCreated}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-semibold">₹{profile.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{profile.averageRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Courses</span>
                    <span className="font-semibold">{profile.totalCourses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">95%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => window.location.href = '/create-channel'}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Create New Channel
                  </Button>
                  <Button variant="outline" className="w-full" onClick={shareReferralLink}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Referral Link
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/admin'}>
                    <Users className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Today's Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">₹{profile?.todayEarnings || 0}</div>
                  <p className="text-sm text-gray-600">Referrals: {profile?.todayReferrals || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₹{profile?.monthlyEarnings || 0}</div>
                  <p className="text-sm text-gray-600">Referrals: {profile?.monthlyReferrals || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">₹{profile?.totalEarnings || 0}</div>
                  <p className="text-sm text-gray-600">All time earnings</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Link</CardTitle>
                  <CardDescription>Share this link with friends to earn ₹10 for each signup</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Your Referral Code: <span className="font-mono font-bold text-purple-600">{profile.referralCode || 'Generating...'}</span></div>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={`https://coursemarket.web.app/signup?ref=${profile.referralCode || 'loading'}`} 
                        readOnly 
                        className="font-mono text-sm bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={copyReferralLink} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button onClick={shareReferralLink} variant="outline" className="flex-1 border-purple-300 hover:bg-purple-50">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                    <p><strong className="text-green-700">💰 How it works:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Share your referral link with friends</li>
                      <li>They sign up using your link</li>
                      <li>You both get ₹10 bonus instantly! 🎉</li>
                      <li>Earn ₹10 commission for each successful referral</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                  <CardDescription>Let people scan this to sign up with your referral</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {profile.referralCode && (
                    <div className="text-center">
                      <QRCodeComponent 
                        value={`https://coursemarket.web.app/signup?ref=${profile.referralCode}`}
                        size={200}
                        className="mb-4"
                        level="M"
                        includeMargin={true}
                      />

                    </div>
                  )}
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Have someone scan this QR code to automatically apply your referral code
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referral History Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Referral History</CardTitle>
                  <CardDescription>People who joined using your referral code</CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.referralHistory && profile.referralHistory.length > 0 ? (
                    <div className="space-y-3">
                      {profile.referralHistory.map((referral, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {referral.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{referral.name}</p>
                              <p className="text-sm text-gray-500">{referral.email}</p>
                              <p className="text-xs text-gray-400">{new Date(referral.joinDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">+₹{referral.commission}</p>
                            <p className="text-xs text-gray-500">{referral.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No referrals yet</p>
                      <p className="text-sm text-gray-400">Share your referral link to get started!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bonus History Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Bonus History 🎁</CardTitle>
                  <CardDescription>All bonuses received from admin and referrals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {profile.bonusHistory && profile.bonusHistory.length > 0 ? (
                      profile.bonusHistory.map((bonus, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                              <Gift className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{bonus.reason || 'Admin Bonus'}</p>
                              <p className="text-xs text-gray-500">{new Date(bonus.createdAt).toLocaleString()}</p>
                              <p className="text-xs text-green-600">From: {bonus.adminName || 'System Admin'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">+₹{bonus.amount}</p>
                            <p className="text-xs text-gray-500">{bonus.type || 'bonus'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No bonuses yet</p>
                        <p className="text-xs text-gray-400">Bonuses will appear here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Channels</h2>
              <Button onClick={() => window.location.href = '/create-channel'}>
                <BookOpen className="w-4 h-4 mr-2" />
                Create New Channel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    <img 
                      src={course.thumbnail || '/api/placeholder/300/200'} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(course.approvalStatus, course.blocked)}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{course.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{course.sales} sales</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" />
                        <span>₹{course.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>{course.likes} likes</span>
                      </div>
                    </div>

                    {/* Channel Edit Section */}
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Edit Channel Details</h4>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs text-blue-700">Title:</Label>
                          <Input 
                            id={`title-${course.id}`}
                            defaultValue={course.title} 
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-blue-700">Description:</Label>
                          <Textarea 
                            id={`desc-${course.id}`}
                            defaultValue={course.description} 
                            className="h-16 text-sm resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-blue-700">Price (₹):</Label>
                            <Input 
                              id={`price-${course.id}`}
                              type="number" 
                              defaultValue={course.price} 
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-blue-700">Fake Price (Auto-gen):</Label>
                            <Input 
                              value={`₹${course.fakePrice || (course.price * 4)}`}
                              disabled
                              className="h-8 text-sm bg-gray-100"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-blue-700">Thumbnail URL:</Label>
                          <Input 
                            id={`thumbnail-${course.id}`}
                            defaultValue={course.thumbnail} 
                            className="h-8 text-sm"
                            placeholder="https://example.com/thumbnail.jpg"
                          />
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={isUpdatingChannel === course.id}
                          onClick={async () => {
                            setIsUpdatingChannel(course.id);
                            try {
                              // Get the current values from the form inputs
                              const titleInput = document.querySelector(`#title-${course.id}`) as HTMLInputElement;
                              const descInput = document.querySelector(`#desc-${course.id}`) as HTMLTextAreaElement;
                              const priceInput = document.querySelector(`#price-${course.id}`) as HTMLInputElement;
                              const thumbnailInput = document.querySelector(`#thumbnail-${course.id}`) as HTMLInputElement;

                              const newPrice = parseInt(priceInput?.value) || course.price;
                              const newFakePrice = Math.floor(newPrice * (3 + Math.random() * 2));

                              const updates = {
                                title: titleInput?.value || course.title,
                                description: descInput?.value || course.description,
                                price: newPrice,
                                thumbnail: thumbnailInput?.value || course.thumbnail,
                                fakePrice: newFakePrice,
                                lastUpdated: new Date().toISOString(),
                                updatedBy: user?.uid || 'user'
                              };

                              // Update the existing service/channel
                              const serviceRef = ref(database, `services/${course.id}`);
                              await update(serviceRef, updates);

                              // Update local state immediately for instant UI update
                              setMyCourses(prevCourses => 
                                prevCourses.map(c => 
                                  c.id === course.id 
                                    ? { ...c, ...updates }
                                    : c
                                )
                              );

                              toast({
                                title: "✅ Channel Updated!",
                                description: `${updates.title} has been updated successfully`,
                              });

                            } catch (error) {
                              console.error('Error updating channel:', error);
                              toast({
                                title: "❌ Update Failed",
                                description: "Failed to update channel. Please try again.",
                                variant: "destructive",
                              });
                            } finally {
                              setIsUpdatingChannel(null);
                            }
                          }}
                        >
                          {isUpdatingChannel === course.id ? '⏳ Updating...' : '💾 Update Channel'}
                        </Button>
                      </div>
                    </div>

                    {course.approvalStatus === 'rejected' && course.rejectionReason && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {course.rejectionReason}
                      </div>
                    )}

                    {course.blocked && course.blockReason && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Blocked Reason:</strong> {course.blockReason}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {myCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No channels yet</h3>
                <p className="text-gray-500 mb-4">Start creating your first channel to share your content</p>
                <Button onClick={() => window.location.href = '/create-channel'}>
                  Create Your First Channel
                </Button>
              </div>
            )}
          </TabsContent>

<TabsContent value="wallet" className="space-y-6">
            {/* Wallet Balance Card */}
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-green-100">Available Balance</h3>
                    <p className="text-3xl font-bold">₹{profile.walletBalance.toLocaleString()}</p>
                    <p className="text-sm text-green-100 mt-1">Total Earnings: ₹{profile.totalEarnings.toLocaleString()}</p>
                  </div>
                  <Wallet className="w-12 h-12 text-green-100" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Withdrawal Button */}
            <Card>
              <CardContent className="p-6 text-center">
                <Button 
                  onClick={() => window.location.href = '/withdrawal'}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 text-lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Request Withdrawal
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Minimum withdrawal: ₹100 • Processing time: 1-3 business days
                </p>
              </CardContent>
            </Card>

            {/* Real-time Bonus & Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Bonus & Transaction History (Real-time)
                </CardTitle>
                <CardDescription>
                  All bonuses, withdrawals and transactions with live updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bonuses" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bonuses">🎁 Bonuses Received</TabsTrigger>
                    <TabsTrigger value="withdrawals">💸 Withdrawal Requests</TabsTrigger>
                  </TabsList>

                  {/* Bonuses Tab */}
                  <TabsContent value="bonuses" className="space-y-4 mt-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {profile.bonusHistory && profile.bonusHistory.length > 0 ? (
                        profile.bonusHistory.map((bonus, index) => (
                          <Card key={index} className="border-l-4 border-purple-500 bg-purple-50/50 hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Gift className="w-5 h-5 text-purple-600" />
                                    <span className="font-bold text-xl text-green-600">+₹{bonus.amount}</span>
                                    <Badge className="bg-purple-100 text-purple-800">
                                      🎁 {bonus.type === 'admin_bonus' ? 'Admin Bonus' : 'Referral Bonus'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-700 font-medium mb-1">
                                    {bonus.reason || 'Bonus reward'}
                                  </p>
                                  {bonus.adminName && (
                                    <p className="text-xs text-gray-600 mb-1">
                                      💼 Given by: {bonus.adminName}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    📅 Received: {new Date(bonus.createdAt).toLocaleDateString()} at {new Date(bonus.createdAt).toLocaleTimeString()}
                                  </p>
                                  {bonus.transactionId && (
                                    <p className="text-xs text-purple-600 font-mono mt-1">
                                      🆔 ID: {bonus.transactionId}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <Badge className="bg-green-100 text-green-800">
                                    ✅ Completed
                                  </Badge>
                                  <p className="text-xs text-gray-500 mt-1">Instant</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No bonuses received yet</p>
                          <p className="text-sm text-gray-400">Bonuses from admin and referrals will appear here</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Withdrawals Tab */}
                  <TabsContent value="withdrawals" className="space-y-4 mt-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {withdrawalHistory.length > 0 ? (
                        withdrawalHistory.map((withdrawal) => (
                          <Card key={withdrawal.id} className={`border-l-4 ${
                            withdrawal.status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
                            withdrawal.status === 'approved' ? 'border-green-500 bg-green-50' :
                            'border-red-500 bg-red-50'
                          } hover:shadow-md transition-shadow`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {withdrawal.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                                    {withdrawal.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    {withdrawal.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                                    <span className="font-bold text-xl">₹{withdrawal.amount}</span>
                                    <Badge className={`${
                                      withdrawal.status === 'pending' ? 'bg-yellow-500 text-white animate-pulse' :
                                      withdrawal.status === 'approved' ? 'bg-green-500 text-white' :
                                      'bg-red-500 text-white'
                                    }`}>
                                      {withdrawal.status === 'pending' ? '⏳ Processing' :
                                       withdrawal.status === 'approved' ? '✅ Completed' :
                                       '❌ Rejected'}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    <div>
                                      <span className="text-gray-600">💳 Method:</span>
                                      <p className="font-medium">{withdrawal.method.toUpperCase()}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">📱 Mobile:</span>
                                      <p className="font-mono text-sm">{withdrawal.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">🏦 Account:</span>
                                      <p className="font-mono text-xs break-all">{withdrawal.accountDetails || withdrawal.upiId || withdrawal.cryptoAddress || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">📅 Date:</span>
                                      <p className="text-xs">{new Date(withdrawal.requestDate || withdrawal.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>

                                  {withdrawal.bankName && withdrawal.ifscCode && (
                                    <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
                                      <span className="font-medium">🏦 Bank Details:</span>
                                      <p>Bank: {withdrawal.bankName} | IFSC: {withdrawal.ifscCode}</p>
                                      {withdrawal.accountNumber && <p>A/C: {withdrawal.accountNumber}</p>}
                                    </div>
                                  )}

                                  {withdrawal.transactionId && (
                                    <div className="mb-2 p-2 bg-green-100 rounded text-xs">
                                      <span className="text-green-700 font-medium">💸 Transaction ID:</span>
                                      <p className="font-mono text-green-800">{withdrawal.transactionId}</p>
                                    </div>
                                  )}

                                  {withdrawal.adminNotes && (
                                    <div className="mb-2 p-2 bg-blue-100 rounded text-xs">
                                      <span className="text-blue-700 font-medium">💬 Admin Notes:</span>
                                      <p className="text-blue-800">{withdrawal.adminNotes}</p>
                                    </div>
                                  )}

                                  {withdrawal.rejectionReason && (
                                    <div className="mb-2 p-2 bg-red-100 rounded text-xs">
                                      <span className="text-red-700 font-medium">❌ Rejection Reason:</span>
                                      <p className="text-red-800">{withdrawal.rejectionReason}</p>
                                    </div>
                                  )}

                                  {withdrawal.processedBy && withdrawal.processedAt && (
                                    <div className="text-xs text-gray-500">
                                      👤 Processed by {withdrawal.processedBy} on {new Date(withdrawal.processedAt).toLocaleString()}
                                    </div>
                                  )}

                                  <p className="text-xs text-gray-500 mt-1">
                                    🆔 Request ID: #{withdrawal.id}
                                  </p>
                                </div>

                                <div className="text-right ml-4">
                                  <div className={`text-2xl font-bold ${
                                    withdrawal.status === 'approved' ? 'text-green-600' :
                                    withdrawal.status === 'rejected' ? 'text-red-600' :
                                    'text-yellow-600'
                                  }`}>
                                    {withdrawal.status === 'pending' ? '⏳' :
                                     withdrawal.status === 'approved' ? '✅' : '❌'}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {withdrawal.status === 'pending' ? 'Under Review' :
                                     withdrawal.status === 'approved' ? 'Payment Sent' :
                                     'Request Declined'}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">No withdrawal requests yet</p>
                          <p className="text-sm text-gray-400">Your withdrawal requests will appear here with full tracking</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div> 

  );
}