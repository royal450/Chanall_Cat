
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Users, Gift, TrendingUp, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";
import QRCodeComponent from "@/components/qr-code";

interface ReferralStats {
  totalReferrals: number;
  thisMonth: number;
  todaySignups: number;
  totalEarnings: number;
  pendingWithdrawals: number;
}

export default function Referral() {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalReferrals: 0,
    thisMonth: 0,
    todaySignups: 0,
    totalEarnings: 0,
    pendingWithdrawals: 0
  });
  const [showQR, setShowQR] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const referralCode = user?.referralCode || user?.uid?.slice(0, 8) || "REF123";
  const referralUrl = `${window.location.origin}/signup?ref=${referralCode}`;

  useEffect(() => {
    if (!user?.uid) return;

    // Load referral stats
    const statsRef = ref(database, `referralStats/${user.uid}`);
    const unsubscribe = onValue(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        setReferralStats(snapshot.val());
      }
    });

    return () => off(statsRef, 'value', unsubscribe);
  }, [user?.uid]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setCopiedIndex(index);
      toast({
        title: "Copied! 📋",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareOnWhatsApp = (url: string) => {
    try {
      const message = `🎓 Join RoyalDev Learning Platform and get ₹10 signup bonus! Use my referral link: ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
      toast({
        title: "Opening WhatsApp 📱",
        description: "Share your referral link with friends!",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to open WhatsApp. Please try copying the link instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Referral Program</h1>
          <p className="text-lg text-gray-600">Share your link and earn rewards for every referral!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-green-100 text-sm">Total Referrals</p>
                  <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-blue-100 text-sm">This Month</p>
                  <p className="text-2xl font-bold">{referralStats.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Gift className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-purple-100 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold">₹{referralStats.totalEarnings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 mr-3" />
                <div>
                  <p className="text-orange-100 text-sm">Today</p>
                  <p className="text-2xl font-bold">{referralStats.todaySignups}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>Share this link to earn ₹10 for each successful referral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={referralUrl}
                  disabled
                  className="flex-1 bg-white"
                />
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(referralUrl, 1)}
                  >
                    {copiedIndex === 1 ? <span className="text-green-600">✓</span> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setShowQR(!showQR)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {showQR && (
                <div className="mt-4 text-center">
                  <QRCodeComponent value={referralUrl} size={200} />
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => shareOnWhatsApp(referralUrl)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share on WhatsApp
              </Button>
              <Button
                onClick={() => window.open(`https://t.me/share/url?url=${referralUrl}`, "_blank")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share on Telegram
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Others can also use this code during signup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                disabled
                className="bg-gray-50 font-mono text-lg"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(referralCode, 2)}
              >
                {copiedIndex === 2 ? <span className="text-green-600">✓</span> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle>How Referral Program Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Share Your Link</h3>
                <p className="text-gray-600 text-sm">Share your unique referral link with friends and family</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Friend Signs Up</h3>
                <p className="text-gray-600 text-sm">Your friend creates an account using your referral link</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
                <p className="text-gray-600 text-sm">Both you and your friend get ₹10 bonus instantly!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
