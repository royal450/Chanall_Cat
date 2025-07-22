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
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Building,
  Smartphone,
  RefreshCw,
  Search,
  Filter,
  Award,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useFirebaseRealtime } from '@/hooks/use-firebase-realtime';

interface WithdrawalRequest {
  id: number;
  userId: number;
  amount: number;
  method: 'bank_transfer' | 'upi' | 'paypal';
  accountDetails: string;
  bankName?: string;
  ifscCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  transactionId?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  user?: {
    id: number;
    displayName: string;
    email: string;
    walletBalance: number;
    totalEarnings: number;
  };
}

export default function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'bank_transfer' | 'upi' | 'paypal'>('all');

  // Real-time data from Firebase
  const { data: realTimeWithdrawals } = useFirebaseRealtime('/withdrawalRequests');

  useEffect(() => {
    if (realTimeWithdrawals) {
      setWithdrawals(Object.values(realTimeWithdrawals));
    }
  }, [realTimeWithdrawals]);

  // Fetch data from API as fallback
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/withdrawals');
        const data = await response.json();
        setWithdrawals(data);
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
        toast({
          title: "Error",
          description: "Failed to fetch withdrawal requests",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
    // Auto refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchWithdrawals, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveWithdrawal = async (withdrawalId: number, userName: string, amount: number) => {
    const transactionId = prompt(`Enter transaction ID for ${userName}'s ₹${amount} withdrawal:`);
    if (!transactionId || transactionId.trim() === '') {
      toast({
        title: "Transaction ID Required",
        description: "Please provide a valid transaction ID",
        variant: "destructive"
      });
      return;
    }
    
    const adminNotes = prompt("Add admin notes (optional):") || '';
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transactionId: transactionId.trim(), 
          adminNotes,
          processedBy: 'Super Admin',
          processedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        toast({
          title: "✅ Withdrawal Approved",
          description: `₹${amount} approved for ${userName} | TXN: ${transactionId}`,
        });
        
        // Refresh data immediately
        const updatedResponse = await fetch('/api/admin/withdrawals');
        const updatedData = await updatedResponse.json();
        setWithdrawals(updatedData);
      } else {
        throw new Error('Failed to approve withdrawal');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId: number, userName: string, amount: number) => {
    const adminNotes = prompt(`Enter reason for rejecting ${userName}'s ₹${amount} withdrawal:`);
    if (!adminNotes || adminNotes.trim() === '') {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }
    
    const confirm = window.confirm(`Reject withdrawal and return ₹${amount} to ${userName}'s wallet?`);
    if (!confirm) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminNotes: adminNotes.trim(),
          processedBy: 'Super Admin',
          processedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        toast({
          title: "❌ Withdrawal Rejected",
          description: `${userName}'s withdrawal rejected. ₹${amount} returned to wallet.`,
        });
        
        // Refresh data immediately
        const updatedResponse = await fetch('/api/admin/withdrawals');
        const updatedData = await updatedResponse.json();
        setWithdrawals(updatedData);
      } else {
        throw new Error('Failed to reject withdrawal');
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to reject withdrawal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredWithdrawals = withdrawals
    .filter(w => statusFilter === 'all' || w.status === statusFilter)
    .filter(w => methodFilter === 'all' || w.method === methodFilter)
    .filter(w => 
      w.user?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.accountDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.transactionId && w.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const totalPending = withdrawals.filter(w => w.status === 'pending').length;
  const totalApproved = withdrawals.filter(w => w.status === 'approved').length;
  const totalRejected = withdrawals.filter(w => w.status === 'rejected').length;
  const totalAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const approvedAmount = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Building className="w-5 h-5 text-blue-600" />;
      case 'upi': return <Smartphone className="w-5 h-5 text-green-600" />;
      case 'paypal': return <CreditCard className="w-5 h-5 text-purple-600" />;
      default: return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white animate-pulse">🔄 PENDING</Badge>;
      case 'approved':
        return <Badge className="bg-green-500 text-white">✅ APPROVED</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">❌ REJECTED</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">UNKNOWN</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-yellow-300" />
              <div>
                <h1 className="text-3xl font-bold">Withdrawal Management</h1>
                <p className="text-blue-100">Real-time processing & approval system</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Total Requests</p>
              <p className="text-2xl font-bold">{withdrawals.length}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Clock className="w-12 h-12 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{totalPending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-800">{totalApproved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <XCircle className="w-12 h-12 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Rejected</p>
                  <p className="text-2xl font-bold text-red-800">{totalRejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-12 h-12 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-800">₹{totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Award className="w-12 h-12 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Approved Amount</p>
                  <p className="text-2xl font-bold text-purple-800">₹{approvedAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-60"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
              </select>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="paypal">PayPal</option>
              </select>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-gray-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-500" />
              Real-time Withdrawal Requests
              {totalPending > 0 && (
                <Badge className="bg-red-500 text-white animate-bounce">
                  {totalPending} Awaiting Action
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Live processing system with instant approval/rejection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg">Loading withdrawal requests...</span>
              </div>
            ) : filteredWithdrawals.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No withdrawal requests found</p>
                <p className="text-sm text-gray-400">Matching your current filters</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredWithdrawals.map((withdrawal) => (
                  <motion.div
                    key={withdrawal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 border-l-4 rounded-lg shadow-sm hover:shadow-md transition-all ${
                      withdrawal.status === 'pending' ? 'border-yellow-500 bg-yellow-50' :
                      withdrawal.status === 'approved' ? 'border-green-500 bg-green-50' :
                      'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {withdrawal.user?.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {withdrawal.user?.displayName || 'Unknown User'}
                            </h3>
                            <p className="text-gray-600">{withdrawal.user?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusBadge(withdrawal.status)}
                              <Badge variant="outline" className="text-xs">
                                ID: {withdrawal.id}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Withdrawal Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">Amount</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">₹{withdrawal.amount.toLocaleString()}</p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              {getMethodIcon(withdrawal.method)}
                              <span className="text-sm text-gray-600">Method</span>
                            </div>
                            <p className="font-semibold capitalize">{withdrawal.method.replace('_', ' ')}</p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-600">Requested</span>
                            </div>
                            <p className="text-sm font-medium">{new Date(withdrawal.createdAt).toLocaleString()}</p>
                          </div>

                          <div className="bg-white p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-600">Wallet Balance</span>
                            </div>
                            <p className="text-lg font-bold text-purple-600">₹{withdrawal.user?.walletBalance || 0}</p>
                          </div>
                        </div>

                        {/* Account Details */}
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Account Details:</h4>
                          <p className="font-mono text-sm">{withdrawal.accountDetails}</p>
                          
                          {withdrawal.method === 'bank_transfer' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                              {withdrawal.bankName && <span><strong>Bank:</strong> {withdrawal.bankName}</span>}
                              {withdrawal.ifscCode && <span><strong>IFSC:</strong> {withdrawal.ifscCode}</span>}
                              {withdrawal.accountNumber && <span><strong>A/C:</strong> {withdrawal.accountNumber}</span>}
                              {withdrawal.accountHolderName && <span><strong>Holder:</strong> {withdrawal.accountHolderName}</span>}
                            </div>
                          )}
                        </div>

                        {/* Admin Notes */}
                        {withdrawal.adminNotes && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-blue-800">Admin Notes:</span>
                            </div>
                            <p className="text-blue-700">{withdrawal.adminNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="lg:ml-6">
                        {withdrawal.status === 'pending' && (
                          <div className="flex flex-col gap-3">
                            <Button
                              onClick={() => handleApproveWithdrawal(withdrawal.id, withdrawal.user?.displayName || 'User', withdrawal.amount)}
                              disabled={loading}
                              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
                            >
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Approve ₹{withdrawal.amount}
                            </Button>
                            <Button
                              onClick={() => handleRejectWithdrawal(withdrawal.id, withdrawal.user?.displayName || 'User', withdrawal.amount)}
                              disabled={loading}
                              variant="destructive"
                              className="px-6 py-3"
                            >
                              <XCircle className="w-5 h-5 mr-2" />
                              Reject & Return
                            </Button>
                          </div>
                        )}

                        {withdrawal.status === 'approved' && (
                          <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="font-semibold text-green-800">APPROVED</p>
                            <p className="text-sm text-green-600">by {withdrawal.processedBy}</p>
                            {withdrawal.transactionId && (
                              <p className="text-xs font-mono mt-1 bg-white px-2 py-1 rounded">
                                TXN: {withdrawal.transactionId}
                              </p>
                            )}
                            {withdrawal.processedAt && (
                              <p className="text-xs text-green-500 mt-1">
                                {new Date(withdrawal.processedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}

                        {withdrawal.status === 'rejected' && (
                          <div className="text-center p-4 bg-red-100 border border-red-300 rounded-lg">
                            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <p className="font-semibold text-red-800">REJECTED</p>
                            <p className="text-sm text-red-600">by {withdrawal.processedBy}</p>
                            <p className="text-xs text-red-500">Funds returned to wallet</p>
                            {withdrawal.processedAt && (
                              <p className="text-xs text-red-500 mt-1">
                                {new Date(withdrawal.processedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
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
    </div>
  );
}