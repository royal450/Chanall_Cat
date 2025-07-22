import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { 
  Gift, 
  Users, 
  DollarSign, 
  Award, 
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { useFirebaseRealtime } from '@/hooks/use-firebase-realtime';

interface UserBonus {
  id: number;
  userId: number;
  amount: number;
  reason: string;
  type: 'admin_bonus' | 'referral_bonus' | 'achievement' | 'promotion';
  adminId?: number;
  adminName?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  user?: {
    displayName: string;
    email: string;
    walletBalance: number;
  };
}

interface User {
  id: number;
  email: string;
  displayName: string;
  walletBalance: number;
  totalEarnings: number;
  totalReferrals: number;
  isActive: boolean;
}

export default function BonusProvide() {
  const [bonuses, setBonuses] = useState<UserBonus[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusReason, setBonusReason] = useState('');
  const [bonusType, setBonusType] = useState<'admin_bonus' | 'referral_bonus' | 'achievement' | 'promotion'>('admin_bonus');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin_bonus' | 'referral_bonus' | 'achievement' | 'promotion'>('all');

  // Real-time data fetching using Firebase
  const { data: realTimeUsers } = useFirebaseRealtime('/users');
  const { data: realTimeBonuses } = useFirebaseRealtime('/bonuses');

  useEffect(() => {
    if (realTimeUsers) {
      setUsers(Object.values(realTimeUsers));
    }
  }, [realTimeUsers]);

  useEffect(() => {
    if (realTimeBonuses) {
      setBonuses(Object.values(realTimeBonuses));
    }
  }, [realTimeBonuses]);

  // Fetch data from API as fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, bonusesResponse] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/bonuses')
        ]);
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }
        
        if (bonusesResponse.ok) {
          const bonusesData = await bonusesResponse.json();
          setBonuses(bonusesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGiveBonus = async () => {
    if (!selectedUserId || !bonusAmount || !bonusReason) {
      toast({
        title: "Incomplete Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseInt(bonusAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUserId}/bonus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          reason: bonusReason,
          type: bonusType,
          adminName: 'Super Admin'
        })
      });

      if (response.ok) {
        const selectedUser = users.find(u => u.id === parseInt(selectedUserId));
        toast({
          title: "🎁 Bonus Given Successfully",
          description: `₹${amount} ${bonusType} given to ${selectedUser?.displayName || 'User'}`,
        });
        
        // Reset form
        setSelectedUserId('');
        setBonusAmount('');
        setBonusReason('');
        setBonusType('admin_bonus');
        
        // Refresh data
        window.location.reload();
      } else {
        throw new Error('Failed to give bonus');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to give bonus. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkBonus = async () => {
    const amount = prompt("Enter bonus amount for all active users:");
    if (!amount || isNaN(Number(amount))) return;
    
    const reason = prompt("Enter reason for bulk bonus:") || "Bulk admin bonus";
    const confirm = window.confirm(`Give ₹${amount} bonus to ALL ${users.length} active users?`);
    if (!confirm) return;

    try {
      setLoading(true);
      let successful = 0;
      
      for (const user of users) {
        try {
          const response = await fetch(`/api/admin/users/${user.id}/bonus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: parseInt(amount),
              reason: `${reason} (Bulk)`,
              type: 'admin_bonus',
              adminName: 'Super Admin'
            })
          });
          if (response.ok) successful++;
        } catch (error) {
          console.error(`Failed to give bonus to user ${user.id}:`, error);
        }
      }

      toast({
        title: "🎉 Bulk Bonus Completed",
        description: `Successfully gave ₹${amount} bonus to ${successful}/${users.length} users`,
      });
      
      // Refresh data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bulk bonus",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBonuses = bonuses
    .filter(bonus => filterType === 'all' || bonus.type === filterType)
    .filter(bonus => 
      bonus.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bonus.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bonus.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalBonusesGiven = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
  const totalBonusRecipients = new Set(bonuses.map(bonus => bonus.userId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-yellow-300" />
              <div>
                <h1 className="text-3xl font-bold">Bonus Management System</h1>
                <p className="text-purple-100">Real-time bonus distribution & tracking</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100">Total Distributed</p>
              <p className="text-2xl font-bold">₹{totalBonusesGiven.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <DollarSign className="w-12 h-12 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Bonuses</p>
                  <p className="text-2xl font-bold text-green-800">₹{totalBonusesGiven.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="w-12 h-12 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Recipients</p>
                  <p className="text-2xl font-bold text-blue-800">{totalBonusRecipients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Award className="w-12 h-12 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Transactions</p>
                  <p className="text-2xl font-bold text-purple-800">{bonuses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-12 h-12 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600 font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-orange-800">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Give Bonus Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-green-500" />
              Give User Bonus
            </CardTitle>
            <CardDescription>
              Instantly reward users with bonus amounts and track all transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <Label htmlFor="user">Select User</Label>
                <select
                  id="user"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} - ₹{user.walletBalance} balance
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="type">Bonus Type</Label>
                <select
                  id="type"
                  value={bonusType}
                  onChange={(e) => setBonusType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="admin_bonus">Admin Bonus</option>
                  <option value="achievement">Achievement</option>
                  <option value="promotion">Promotion</option>
                  <option value="referral_bonus">Referral Bonus</option>
                </select>
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="Bonus reason..."
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleGiveBonus}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Gift className="w-4 h-4 mr-2" />}
                  Give Bonus
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleBulkBonus}
                disabled={loading}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Bonus All Users
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bonus History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  Real-time Bonus History
                </CardTitle>
                <CardDescription>
                  Live tracking of all bonus transactions
                </CardDescription>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search bonuses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-40"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="p-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Types</option>
                  <option value="admin_bonus">Admin Bonus</option>
                  <option value="achievement">Achievement</option>
                  <option value="promotion">Promotion</option>
                  <option value="referral_bonus">Referral Bonus</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBonuses.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No bonus transactions found</p>
                <p className="text-sm text-gray-400">Start giving bonuses to see them here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBonuses.map((bonus) => {
                  const user = users.find(u => u.id === bonus.userId);
                  return (
                    <motion.div
                      key={bonus.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{user?.displayName || 'Unknown User'}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(bonus.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">₹{bonus.amount}</div>
                        <Badge className={
                          bonus.type === 'admin_bonus' ? 'bg-blue-500' :
                          bonus.type === 'achievement' ? 'bg-purple-500' :
                          bonus.type === 'promotion' ? 'bg-orange-500' :
                          'bg-green-500'
                        }>
                          {bonus.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="text-right max-w-xs">
                        <p className="font-medium text-gray-800">{bonus.reason}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Completed</span>
                        </div>
                        {bonus.adminName && (
                          <p className="text-xs text-gray-500">by {bonus.adminName}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}