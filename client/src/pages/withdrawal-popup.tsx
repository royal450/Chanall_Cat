import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  DollarSign, CreditCard, Building, Smartphone, Check, Clock, 
  AlertTriangle, ArrowRight, Loader2, CheckCircle, Star, 
  Gift, History, RefreshCw, Copy
} from "lucide-react";

const withdrawalSchema = z.object({
  amount: z.number().min(100, "Minimum withdrawal amount is ₹100").max(50000, "Maximum withdrawal amount is ₹50,000"),
  method: z.string().min(1, "Please select a withdrawal method"),
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  bankName: z.string().optional(),
  paytmNumber: z.string().optional()
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalHistory {
  id: number;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
  transactionId?: string;
  rejectionReason?: string;
}

interface WithdrawalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const withdrawalMethods = [
  { value: "bank", label: "Bank Transfer", icon: <Building className="w-4 h-4" />, minAmount: 100 },
  { value: "upi", label: "UPI", icon: <Smartphone className="w-4 h-4" />, minAmount: 50 },
  { value: "paytm", label: "Paytm Wallet", icon: <CreditCard className="w-4 h-4" />, minAmount: 50 },
  { value: "phonepe", label: "PhonePe", icon: <Smartphone className="w-4 h-4" />, minAmount: 50 }
];

export default function WithdrawalPopup({ isOpen, onClose }: WithdrawalPopupProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      method: ""
    }
  });

  const selectedMethod = withdrawalMethods.find(m => m.value === form.watch("method"));
  const userBalance = user?.walletBalance || 0;

  // Fetch user balance
  const { data: userProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: isOpen && !!user
  });

  // Fetch withdrawal history
  const { data: withdrawalHistory = [], refetch: refetchHistory } = useQuery<WithdrawalHistory[]>({
    queryKey: ['/api/user/withdrawals'],
    enabled: isOpen && !!user
  });

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: (data: WithdrawalFormData) => apiRequest("/api/withdrawals", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: (response: any) => {
      setWithdrawalId(response.id);
      setShowSuccess(true);
      form.reset();
      refetchProfile();
      refetchHistory();
      
      // Real-time status simulation
      setTimeout(() => {
        toast({
          title: "Withdrawal Submitted!",
          description: "Your withdrawal request has been sent for processing.",
        });
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleWithdrawal = async (data: WithdrawalFormData) => {
    try {
      setIsSubmitting(true);

      // Validation
      if (data.amount > userBalance) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance for this withdrawal.",
          variant: "destructive",
        });
        return;
      }

      await withdrawalMutation.mutateAsync(data);
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Success Animation Component
  const SuccessAnimation = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0">
        <CardContent className="p-8 text-center">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="absolute inset-0 bg-green-400 rounded-full mx-auto w-20 h-20 animate-ping opacity-25"></div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Withdrawal Successful!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your withdrawal request has been submitted successfully and is now being processed by our team.
          </p>

          {withdrawalId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">#{withdrawalId}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(`#${withdrawalId}`)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm">
              <div className="flex items-center gap-2 text-yellow-600 flex-1">
                <Clock className="w-4 h-4" />
                <span>Submitted</span>
              </div>
              <Badge className="bg-yellow-500 text-white animate-pulse">Processing</Badge>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <div className="flex items-center gap-2 flex-1">
                <Loader2 className="w-4 h-4" />
                <span>Admin Review (1-2 hours)</span>
              </div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="flex items-center text-sm text-gray-400">
              <div className="flex items-center gap-2 flex-1">
                <CheckCircle className="w-4 h-4" />
                <span>Payment Processing (2-24 hours)</span>
              </div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>

          <Button
            onClick={() => {
              setShowSuccess(false);
              onClose();
            }}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <Check className="w-4 h-4 mr-2" />
            Got it!
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Withdraw Funds
            </DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Withdrawal Form */}
            <div className="space-y-6">
              {/* Balance Card */}
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Available Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-green-800 mb-2">
                    ₹{userBalance.toLocaleString()}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetchProfile()}
                    className="text-green-700 border-green-300"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>

              <form onSubmit={form.handleSubmit(handleWithdrawal)} className="space-y-4">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold">
                    Withdrawal Amount (₹)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    {...form.register("amount", { valueAsNumber: true })}
                    placeholder="Enter amount"
                    className="h-12 text-lg font-semibold"
                    max={userBalance}
                  />
                  {form.formState.errors.amount && (
                    <p className="text-red-500 text-sm">{form.formState.errors.amount.message}</p>
                  )}
                  <div className="flex gap-2">
                    {[500, 1000, 2000, 5000].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => form.setValue("amount", amount)}
                        disabled={amount > userBalance}
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Withdrawal Method */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Withdrawal Method</Label>
                  <Select value={form.watch("method")} onValueChange={(value) => form.setValue("method", value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select withdrawal method">
                        {selectedMethod && (
                          <div className="flex items-center gap-2">
                            {selectedMethod.icon}
                            <span>{selectedMethod.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {withdrawalMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            {method.icon}
                            <span>{method.label}</span>
                            <Badge variant="outline" className="ml-auto">
                              Min ₹{method.minAmount}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dynamic Fields Based on Method */}
                {form.watch("method") === "bank" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          {...form.register("accountNumber")}
                          placeholder="Enter account number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          {...form.register("ifscCode")}
                          placeholder="Enter IFSC code"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                        <Input
                          id="accountHolderName"
                          {...form.register("accountHolderName")}
                          placeholder="Enter account holder name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          {...form.register("bankName")}
                          placeholder="Enter bank name"
                        />
                      </div>
                    </div>
                  </>
                )}

                {form.watch("method") === "upi" && (
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      {...form.register("upiId")}
                      placeholder="yourname@paytm"
                    />
                  </div>
                )}

                {form.watch("method") === "paytm" && (
                  <div className="space-y-2">
                    <Label htmlFor="paytmNumber">Paytm Mobile Number</Label>
                    <Input
                      id="paytmNumber"
                      {...form.register("paytmNumber")}
                      placeholder="Enter Paytm mobile number"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !form.watch("method") || !form.watch("amount")}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Withdrawal...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Submit Withdrawal Request
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Withdrawal History */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Withdrawal History</h3>
                <Badge variant="outline">{withdrawalHistory.length}</Badge>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawalHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No withdrawal history yet</p>
                  </div>
                ) : (
                  withdrawalHistory.map((withdrawal) => (
                    <Card key={withdrawal.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">
                              ₹{withdrawal.amount.toLocaleString()}
                            </span>
                            <Badge className={getStatusColor(withdrawal.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(withdrawal.status)}
                                {withdrawal.status}
                              </div>
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            #{withdrawal.id}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          Method: {withdrawal.method.toUpperCase()}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Requested: {new Date(withdrawal.createdAt).toLocaleString()}
                          {withdrawal.completedAt && (
                            <span className="block">
                              Completed: {new Date(withdrawal.completedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {withdrawal.transactionId && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                            <span className="text-green-700">
                              Transaction ID: {withdrawal.transactionId}
                            </span>
                          </div>
                        )}
                        
                        {withdrawal.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                            <span className="text-red-700">
                              Reason: {withdrawal.rejectionReason}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Animation Overlay */}
      {showSuccess && <SuccessAnimation />}
    </>
  );
}