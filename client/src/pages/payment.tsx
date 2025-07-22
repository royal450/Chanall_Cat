import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ref, push, update, onValue, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { 
  ArrowLeft, 
  QrCode, 
  Globe, 
  Flag, 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  CheckCircle, 
  Shield, 
  Zap, 
  Sparkles,
  Phone,
  Mail,
  Lock,
  Star,
  Clock,
  Heart,
  Award,
  Gift,
  Banknote,
  Coins,
  Wallet,
  Send,
  Copy,
  Check,
  Crown,
  Flame,
  Verified
} from "lucide-react";
import { QRCodeComponent } from "@/components/qr-code";

type PaymentRegion = "indian" | "international";

interface CourseDetails {
  title: string;
  price: number;
}

interface IndianForm {
  utrCode: string;
  phoneNumber: string;
}

interface InternationalForm {
  transactionId: string;
  email: string;
  fullName: string;
}

export default function Payment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentRegion, setPaymentRegion] = useState<PaymentRegion>("indian");
  const [courseDetails, setCourseDetails] = useState<CourseDetails>({
    title: "Course Title",
    price: 0,
  });
  const [courseId, setCourseId] = useState<string>("");
  const [upiCopied, setUpiCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [indianForm, setIndianForm] = useState<IndianForm>({
    utrCode: "",
    phoneNumber: "",
  });

  const [internationalForm, setInternationalForm] = useState<InternationalForm>({
    transactionId: "",
    email: "",
    fullName: "",
  });

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const title = urlParams.get("title");
      const price = urlParams.get("price");
      const course = urlParams.get("course");

      if (title && price) {
        const parsedPrice = parseInt(price, 10);
        if (!isNaN(parsedPrice)) {
          setCourseDetails({
            title: decodeURIComponent(title),
            price: parsedPrice,
          });
        }
      }
      
      if (course) {
        setCourseId(course);
      }
    } catch (error) {
      console.error("Error parsing URL parameters:", error);
      toast({
        title: "Error",
        description: "Could not load course details",
        variant: "destructive",
      });
    }
  }, [toast]);

  const processReferralCommission = async (userId: string, coursePrice: number) => {
    try {
      // Get user's referrer info
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const referredBy = userData.referredBy;
        
        if (referredBy) {
          // Calculate commission (30% of course price)
          const commission = Math.floor(coursePrice * 0.30);
          
          // Update referrer's wallet and stats
          const referrerRef = ref(database, `users/${referredBy}`);
          const referrerSnapshot = await get(referrerRef);
          
          if (referrerSnapshot.exists()) {
            const referrerData = referrerSnapshot.val();
            
            await update(referrerRef, {
              walletBalance: (referrerData.walletBalance || 0) + commission,
              totalEarnings: (referrerData.totalEarnings || 0) + commission,
              totalReferralEarnings: (referrerData.totalReferralEarnings || 0) + commission,
            });
            
            // Record the commission transaction
            const commissionRef = ref(database, 'referralCommissions');
            await push(commissionRef, {
              referrerId: referredBy,
              referredUserId: userId,
              coursePrice: coursePrice,
              commission: commission,
              timestamp: new Date().toISOString(),
              type: 'course_purchase',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing referral commission:', error);
    }
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText("CourseXx@yesg");
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
      toast({
        title: "UPI ID Copied",
        description: "UPI ID has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the UPI ID manually",
        variant: "destructive",
      });
    }
  };

  const handlePayNow = () => {
    const upiUrl = `upi://pay?pa=coursemarketdevils@yesg&pn=Course Market Payment&am=${courseDetails.price}&tn=Course Market Payment`;
    
    try {
      // Try to open UPI app directly
      window.location.href = upiUrl;
    } catch (error) {
      // Fallback to Google Pay web
      const googlePayUrl = `https://pay.google.com/gp/p/ui/pay?pa=coursemarketdevils@yesg&pn=Course Market Payment&am=${courseDetails.price}&tn=Course Market Payment`;
      window.open(googlePayUrl, '_blank');
    }
    
    toast({
      title: "Redirecting to Payment",
      description: "Opening payment app...",
    });
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `payment-qr-${courseDetails.title.replace(/[^a-z0-9]/gi, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast({
        title: "QR Code Downloaded!",
        description: "QR code has been saved to your device",
      });
    }
  };

  const handleIndianPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!indianForm.utrCode.trim() || !indianForm.phoneNumber.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(indianForm.phoneNumber.replace(/\D/g, ''))) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number",
          variant: "destructive",
        });
        return;
      }

      const message = encodeURIComponent(
        `🎯 RoyalDev Course Payment\n\n` +
        `📚 Course: ${courseDetails.title}\n` +
        `💰 Amount: ₹${courseDetails.price.toLocaleString()}\n` +
        `🔗 UTR/UPI Ref: ${indianForm.utrCode}\n` +
        `📱 Phone: ${indianForm.phoneNumber}\n\n` +
        `✅ Please verify this payment. Thank you!`
      );

      const whatsappNumber = "919104037184";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;

      toast({
        title: "Payment Submitted Successfully",
        description: "You'll be redirected to WhatsApp for verification",
      });
    } catch (error) {
      console.error("Error processing Indian payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInternationalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (!internationalForm.transactionId.trim() || 
          !internationalForm.email.trim() || 
          !internationalForm.fullName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(internationalForm.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      const message = encodeURIComponent(
        `🌍 RoyalDev International Payment\n\n` +
        `📚 Course: ${courseDetails.title}\n` +
        `💰 Amount: ₹${courseDetails.price.toLocaleString()}\n` +
        `🔗 Transaction ID: ${internationalForm.transactionId}\n` +
        `👤 Name: ${internationalForm.fullName}\n` +
        `📧 Email: ${internationalForm.email}\n\n` +
        `✅ Please verify this international payment. Thank you!`
      );

      const whatsappNumber = "919104037184";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (newWindow) newWindow.opener = null;

      toast({
        title: "Payment Submitted Successfully",
        description: "You'll be redirected to WhatsApp for verification",
      });
    } catch (error) {
      console.error("Error processing International payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getQrCodeValue = () => {
    try {
      return `upi://pay?pa=coursemarketdevils@yesg&pn=Course Market Payment&am=${courseDetails.price}&tn=Course Market Payment`;
    } catch (error) {
      console.error("Error generating QR code value:", error);
      return "";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full min-h-screen px-4 py-6">
        {/* Header */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 px-0"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Courses
          </Button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Secure Payment Gateway</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Join thousands of successful learners today
            </p>
          </div>
        </div>

        {/* Course Summary */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-1">{courseDetails.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-purple-100">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Lifetime Access</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        <span>4.9 Rating</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-1" />
                        <span>Verified Course</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">
                    {formatPrice(courseDetails.price)}
                  </div>
                  <div className="text-purple-100 text-sm">One-time payment</div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Instant Access</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Start learning immediately</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">Premium Content</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Expert-created curriculum</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">24/7 Support</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Always here to help</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method Selection */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-xl font-bold text-gray-900 dark:text-gray-100">
                Choose Your Payment Region
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setPaymentRegion("indian")}
                  variant={paymentRegion === "indian" ? "default" : "outline"}
                  className={`h-auto p-6 flex-col space-y-3 transition-all duration-300 ${
                    paymentRegion === "indian" 
                      ? "bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-xl border-0" 
                      : "bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Flag className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-bold text-lg">India</div>
                      <div className="text-sm opacity-75">UPI • Net Banking • Cards</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Instant Transfer</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setPaymentRegion("international")}
                  variant={paymentRegion === "international" ? "default" : "outline"}
                  className={`h-auto p-6 flex-col space-y-3 transition-all duration-300 ${
                    paymentRegion === "international" 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl border-0" 
                      : "bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-bold text-lg">International</div>
                      <div className="text-sm opacity-75">Payeer • Crypto • Cards</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">Secure Gateway</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Forms */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          {paymentRegion === "indian" ? (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
                  <Flag className="w-5 h-5 mr-2 text-green-600" />
                  Indian Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* QR Code Section */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 text-center">
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <QrCode className="w-4 h-4" />
                        <span>Scan & Pay</span>
                      </div>
                      
                      <div className="w-full max-w-xs mx-auto bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-2xl mb-6">
                        {courseDetails.price > 0 ? (
                          <QRCodeComponent 
                            value={getQrCodeValue()}
                            size={240}
                            className="rounded-lg w-full h-full"
                          />
                        ) : (
                          <div className="w-60 h-60 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                              <QrCode className="w-16 h-16 mx-auto mb-2" />
                              <p>QR Code loading...</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">UPI ID</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyUPI}
                                className="h-8 px-3"
                              >
                                {upiCopied ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              CourseXx@yesg
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                              {formatPrice(courseDetails.price)}
                            </div>
                          </CardContent>
                        </Card>

                        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg p-4">
                          <div className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Smartphone className="w-4 h-4" />
                            <span>Works with all UPI apps</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                            PhonePe • Google Pay • Paytm • BHIM
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div>
                    <form onSubmit={handleIndianPayment} className="space-y-6">
                      <div>
                        <Label htmlFor="utrCode" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          UPI Transaction ID / UTR Number *
                        </Label>
                        <Input
                          id="utrCode"
                          type="text"
                          value={indianForm.utrCode}
                          onChange={(e) => setIndianForm(prev => ({ ...prev, utrCode: e.target.value }))}
                          className="w-full px-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 focus:border-green-500 dark:focus:border-green-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          placeholder="Enter your UPI reference number"
                          required
                          minLength={8}
                        />
                        <div className="flex items-center mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            Use "CourseMarket payment" as transaction note
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          WhatsApp Number *
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={indianForm.phoneNumber}
                          onChange={(e) => setIndianForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="w-full px-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800 focus:border-green-500 dark:focus:border-green-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          placeholder="+91 XXXXX XXXXX"
                          required
                          pattern="[0-9]{10,15}"
                        />
                        <div className="flex items-center mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Phone className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                          <p className="text-sm text-green-700 dark:text-green-300">
                            We'll send course access details to this number
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button
                            type="button"
                            onClick={handleDownloadQR}
                            variant="outline"
                            className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download QR
                          </Button>
                          
                          <Button
                            type="button"
                            onClick={handlePayNow}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            <DollarSign className="w-5 h-5 mr-2" />
                            Pay Now
                          </Button>
                        </div>
                        
                        <Button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isProcessing ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                              Processing...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Send className="w-5 h-5 mr-3" />
                              Verify Payment via WhatsApp
                            </div>
                          )}
                        </Button>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Shield className="w-4 h-4" />
                          <span>Secure payment verification via WhatsApp</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Manual verification by our team • Usually takes 5-10 minutes
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
                  <Globe className="w-5 h-5 mr-2 text-purple-600" />
                  International Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Payment Options */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <CreditCard className="w-4 h-4" />
                        <span>Multiple Options</span>
                      </div>
                      
                      <div className="space-y-4">
                        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Payeer Account</span>
                              <Verified className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              P1234567890
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Crypto (USDT)</span>
                              <Coins className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              TRC20 Available
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {formatPrice(courseDetails.price)}
                            </div>
                          </CardContent>
                        </Card>

                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4">
                          <div className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Shield className="w-4 h-4" />
                            <span>Secure International Gateway</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                            Payeer • Crypto • Cards accepted
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* International Form */}
                  <div>
                    <form onSubmit={handleInternationalPayment} className="space-y-6">
                      <div>
                        <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Transaction ID *
                        </Label>
                        <Input
                          id="transactionId"
                          type="text"
                          value={internationalForm.transactionId}
                          onChange={(e) => setInternationalForm(prev => ({ ...prev, transactionId: e.target.value }))}
                          className="w-full px-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 focus:border-purple-500 dark:focus:border-purple-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          placeholder="Enter your transaction reference"
                          required
                          minLength={8}
                        />
                      </div>

                      <div>
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={internationalForm.fullName}
                          onChange={(e) => setInternationalForm(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 focus:border-purple-500 dark:focus:border-purple-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={internationalForm.email}
                          onChange={(e) => setInternationalForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-800 focus:border-purple-500 dark:focus:border-purple-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                          placeholder="john@example.com"
                          required
                        />
                        <div className="flex items-center mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Course access will be sent to this email
                          </p>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isProcessing ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Send className="w-5 h-5 mr-3" />
                            Verify International Payment
                          </div>
                        )}
                      </Button>

                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Shield className="w-4 h-4" />
                          <span>Secure international payment processing</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Manual verification by our team • Usually takes 10-30 minutes
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Security & Trust Section */}
        <div className="w-full max-w-4xl mx-auto">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Shield className="w-4 h-4" />
                  <span>100% Secure Payment</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Why Choose Our Platform?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Trusted by thousands of learners worldwide
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Instant Access</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get immediate access to your course after payment verification
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Expert Content</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn from industry experts with proven track records
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">24/7 Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Round-the-clock customer support for all your queries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}