import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Bitcoin,
  CreditCard as Paypal,
  Gift,
  TrendingUp,
  History,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ref, push, update, onValue, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { motion } from "framer-motion";

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'paypal' | 'crypto' | 'bank';
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function Withdrawal() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableBalance, setAvailableBalance] = useState(1250);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<'paypal' | 'crypto' | 'bank'>('paypal');
  const [address, setAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [bonusHistory, setBonusHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    fetchTransactionHistory();
  }, [user, setLocation]);

  const fetchTransactionHistory = async () => {
    try {
      console.log('🚀 Starting fetchTransactionHistory for user:', user?.uid);
      
      // Fetch withdrawal history
      const mockWithdrawals = [
        {
          id: 1,
          amount: 500,
          status: 'completed',
          type: 'withdrawal',
          createdAt: '2024-01-15T10:30:00Z',
          processedAt: '2024-01-15T15:45:00Z',
          transactionId: 'WD123456789',
          method: 'Bank Transfer'
        },
        {
          id: 2,
          amount: 200,
          status: 'pending',
          type: 'withdrawal',
          createdAt: '2024-01-20T14:20:00Z',
          method: 'UPI'
        }
      ];

      // Fetch bonus history from Firebase - Multiple paths check
      console.log('🔍 Fetching bonus history for user:', user?.uid);
      let userBonuses = [];
      
      try {
        // Check multiple Firebase paths for bonuses
        const bonusPaths = ['userBonuses', 'bonuses', `users/${user?.uid}/bonuses`];
        
        for (const path of bonusPaths) {
          const bonusRef = ref(database, path);
          const bonusSnapshot = await get(bonusRef);
          
          console.log(`🔍 Checking path: ${path}`, bonusSnapshot.exists());
          
          if (bonusSnapshot.exists()) {
            const allBonuses = bonusSnapshot.val();
            console.log(`📊 Data from ${path}:`, allBonuses);
            
            if (path === `users/${user?.uid}/bonuses`) {
              // Direct user bonuses path
              userBonuses = Object.entries(allBonuses).map(([id, bonus]: [string, any]) => ({
                id,
                ...bonus,
                type: bonus.type || 'admin_bonus',
                reason: bonus.reason || 'Admin bonus reward',
                adminName: bonus.adminName || 'System Admin',
                transactionId: bonus.transactionId || `BONUS_${id.slice(-8)}`
              }));
              break; // Found direct path, use this
            } else {
              // Filter from global bonuses
              const filteredBonuses = Object.entries(allBonuses)
                .filter(([id, bonus]: [string, any]) => {
                  return bonus.userId === user?.uid || bonus.uid === user?.uid;
                })
                .map(([id, bonus]: [string, any]) => ({
                  id,
                  ...bonus,
                  type: bonus.type || 'admin_bonus',
                  reason: bonus.reason || 'Admin bonus reward',
                  adminName: bonus.adminName || 'System Admin',
                  transactionId: bonus.transactionId || `BONUS_${id.slice(-8)}`
                }));
              
              if (filteredBonuses.length > 0) {
                userBonuses = filteredBonuses;
                break; // Found bonuses, use these
              }
            }
          }
        }
        
        // Sort by creation date
        userBonuses = userBonuses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('✅ Final user bonuses:', userBonuses);
      } catch (error) {
        console.error('❌ Error fetching bonus history:', error);
      }

      setWithdrawalHistory(mockWithdrawals);
      setBonusHistory(userBonuses);
      console.log('Bonus history loaded:', userBonuses);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!user) return;

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0 || amount > availableBalance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      });
      return;
    }

    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your withdrawal address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const withdrawalData = {
        userId: user.uid,
        amount,
        method: withdrawalMethod,
        address: address.trim(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        userEmail: user.email,
        userName: user.displayName || user.email
      };

      // Add to Firebase
      const withdrawalsRef = ref(database, `withdrawals/${user.uid}`);
      await push(withdrawalsRef, withdrawalData);

      // Add to admin queue
      const adminWithdrawalsRef = ref(database, 'admin/withdrawals');
      await push(adminWithdrawalsRef, withdrawalData);

      toast({
        title: "Withdrawal Requested! 🚀",
        description: "Your withdrawal request has been submitted for admin approval. You'll receive payment within 1 hour of approval.",
      });

      setWithdrawalAmount("");
      setAddress("");
      setShowConfirmation(false);
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0 || amount > availableBalance) return;
    setShowConfirmation(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Withdrawal Center
          </h1>
          <p className="text-gray-600">Withdraw your earnings securely</p>
        </div>

        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-green-100">Available Balance</h3>
                <p className="text-3xl font-bold">₹{availableBalance.toLocaleString()}</p>
              </div>
              <Wallet className="w-12 h-12 text-green-100" />
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Request Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Method Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Withdrawal Method</label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={withdrawalMethod === 'paypal' ? 'default' : 'outline'}
                  onClick={() => setWithdrawalMethod('paypal')}
                  className="flex items-center justify-center p-4"
                >
                  <Paypal className="w-5 h-5 mr-2" />
                  PayPal
                </Button>
                <Button
                  variant={withdrawalMethod === 'crypto' ? 'default' : 'outline'}
                  onClick={() => setWithdrawalMethod('crypto')}
                  className="flex items-center justify-center p-4"
                >
                  <Bitcoin className="w-5 h-5 mr-2" />
                  Crypto (USD)
                </Button>
                <Button
                  variant={withdrawalMethod === 'bank' ? 'default' : 'outline'}
                  onClick={() => setWithdrawalMethod('bank')}
                  className="flex items-center justify-center p-4"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Bank Transfer
                </Button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Withdrawal Amount (₹)</label>
              <Input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount"
                max={availableBalance}
                className="text-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum: ₹{availableBalance.toLocaleString()}
              </p>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {withdrawalMethod === 'paypal' && 'PayPal Email'}
                {withdrawalMethod === 'crypto' && 'Crypto Wallet Address (USD)'}
                {withdrawalMethod === 'bank' && 'Bank Account Details'}
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  withdrawalMethod === 'paypal' ? 'your-email@paypal.com' :
                  withdrawalMethod === 'crypto' ? 'Your USD crypto wallet address' :
                  'Account number and IFSC code'
                }
                className="text-lg"
              />
            </div>

            <Button
              onClick={confirmWithdrawal}
              disabled={!withdrawalAmount || !address || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 text-lg"
            >
              Request Withdrawal
            </Button>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-center">Confirm Withdrawal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{parseFloat(withdrawalAmount).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    via {withdrawalMethod.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-600">
                    to: {address}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Are you sure you want to withdraw this amount? 
                    Payment will be processed within 1 hour after admin approval.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWithdrawal}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Processing..." : "Confirm"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
                  {/* Bonus History */}
                  <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Bonus History ({bonusHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
                  ))}
                </div>
              ) : bonusHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No Bonus History</p>
                  <p className="text-sm">You haven't received any bonuses yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bonusHistory.map((bonus) => (
                    <motion.div
                      key={bonus.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-purple-200 rounded-lg p-4 bg-purple-50/50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Gift className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-lg text-green-600">+₹{bonus.amount}</span>
                            <Badge className="bg-purple-100 text-purple-800">
                              🎁 {bonus.type === 'admin_bonus' ? 'Admin Bonus' : 'Referral Bonus'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 font-medium">
                            {bonus.reason || 'Bonus reward'}
                          </p>
                          {bonus.adminName && (
                            <p className="text-xs text-gray-600">
                              Given by: {bonus.adminName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Received: {new Date(bonus.createdAt).toLocaleDateString()} at {new Date(bonus.createdAt).toLocaleTimeString()}
                          </p>
                          {bonus.transactionId && (
                            <p className="text-xs text-purple-600 font-mono">
                              ID: {bonus.transactionId}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800">
                            ✅ Completed
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Withdrawal History ({withdrawalHistory.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
                  ))}
                </div>
              ) : withdrawalHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No Withdrawal History</p>
                  <p className="text-sm">You haven't made any withdrawals yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalHistory.map((withdrawal) => (
                    <motion.div
                      key={withdrawal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-lg">₹{withdrawal.amount}</span>
                            <Badge className={getStatusColor(withdrawal.status)}>
                              {getStatusIcon(withdrawal.status)}
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Method: {withdrawal.method}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requested: {new Date(withdrawal.createdAt).toLocaleDateString()} at {new Date(withdrawal.createdAt).toLocaleTimeString()}
                          </p>
                          {withdrawal.processedAt && (
                            <p className="text-xs text-gray-500">
                              Processed: {new Date(withdrawal.processedAt).toLocaleDateString()} at {new Date(withdrawal.processedAt).toLocaleTimeString()}
                            </p>
                          )}
                          {withdrawal.transactionId && (
                            <p className="text-xs text-blue-600 font-mono">
                              Transaction ID: {withdrawal.transactionId}
                            </p>
                          )}
                          {withdrawal.rejectionReason && (
                            <p className="text-xs text-red-600 mt-1">
                              Reason: {withdrawal.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      <Footer />
    </div>
  );
}