import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ref, set, update, onValue, get } from "firebase/database";
import { database } from "@/lib/firebase";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaUserPlus } from "react-icons/fa";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { signup, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralCodeDisabled, setReferralCodeDisabled] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.fullName, referralCode);

      // If there's a referral code, process the referral
      // Referral processing is now handled in the auth hook
            // Just mark the user with referral info for tracking
            if (referralCode && referralCode.trim()) {
              await update(ref(database, `users/${user?.uid}`), {
                referralSource: 'direct_link',
                signupDate: now,
                phoneNumber: formData.phoneNumber
              });
              console.log('User marked with referral source');
            }

      toast({
        title: "Account Created!",
        description: referralCode ? "Welcome! You've been referred by a friend." : "Welcome to RoyalDev Learning Platform.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for referral code from multiple URL formats
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    let detectedReferralCode = null;

    // Check for ?ref= format
    if (urlParams.has('ref')) {
      detectedReferralCode = urlParams.get('ref');
    }

    // Check for #ref= format
    if (hash.includes('#ref=')) {
      detectedReferralCode = hash.split('#ref=')[1];
    }

    // Check for /#/ref= format
    if (hash.includes('/#/ref=')) {
      detectedReferralCode = hash.split('/#/ref=')[1];
    }

    // Check localStorage for previously stored referral code
    const storedReferralCode = localStorage.getItem('referralCode');
    if (storedReferralCode && !detectedReferralCode) {
      detectedReferralCode = storedReferralCode;
    }

    if (detectedReferralCode) {
      setReferralCode(detectedReferralCode.trim());
      setReferralCodeDisabled(true);

      // Store in localStorage for persistence
      localStorage.setItem('referralCode', detectedReferralCode.trim());

      toast({
        title: "Referral Code Detected! 🎉",
        description: `You're signing up with referral code: ${detectedReferralCode}`,
      });
    }
  }, []);

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-2.5 m-0">
      <Card className="w-full max-w-[95vw] sm:max-w-md shadow-2xl">
        <CardHeader className="text-center p-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-sm">Join RoyalDev Learning Platform</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-sm">Full Name</Label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="pl-8 py-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-8 py-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="phoneNumber" className="text-sm">Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400 text-xs">📱</span>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="pl-8 py-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-8 pr-8 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash className="h-3 w-3" /> : <FaEye className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="pl-8 pr-8 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-3 w-3" /> : <FaEye className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="referralCode" className="text-sm">Referral Code (Optional)</Label>
              <div className="relative">
                <FaUserPlus className="absolute left-3 top-3 h-3 w-3 text-gray-400" />
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="pl-8 py-2"
                  disabled={referralCodeDisabled}
                />
                {referralCodeDisabled && (
                  <div className="absolute right-3 top-3 text-xs text-green-600 font-medium">
                    Auto-filled
                  </div>
                )}
              </div>
              {referralCode && (
                <p className="text-sm text-green-600">
                  🎉 You'll earn ₹10 bonus after signup!
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-2.5"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-purple-600 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}