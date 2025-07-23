import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Payment from "@/pages/payment";
import Profile from "@/pages/profile";
import Referral from "@/pages/referral";
import NotFound from "@/pages/not-found";
import Withdrawal from "@/pages/withdrawal";
import WithdrawalPopup from "@/pages/withdrawal-popup";

// Lazy loaded admin and channel pages
const SuperAdmin = lazy(() => import("@/pages/Super_Admin"));
const ChannelCreation = lazy(() => import("@/pages/Channel_Creation"));

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-0 m-0">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Component /> : null;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-0 m-0">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !user ? <Component /> : null;
}

// Auto-redirect for authenticated users
function AutoRedirectRoute() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        setLocation("/dashboard");
      } else {
        setLocation("/login");
      }
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-0 m-0">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}

// Enhanced Referral Detection Component  
function ReferralDetector() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Extract referral code from multiple URL formats
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    let referralCode = null;

    // Check for ?ref= format (primary)
    if (urlParams.has('ref')) {
      referralCode = urlParams.get('ref');
    }
    // Check for #/inviteCode= format  
    else if (hash.includes('inviteCode=')) {
      const inviteMatch = hash.match(/inviteCode=([^&/#]+)/);
      if (inviteMatch) {
        referralCode = inviteMatch[1];
      }
    }
    // Check for /r/ format
    else if (window.location.pathname.includes('/r/')) {
      const pathMatch = window.location.pathname.match(/\/r\/([^\/]+)/);
      if (pathMatch) {
        referralCode = pathMatch[1];
      }
    }

    // Store referral code if found
    if (referralCode && referralCode.trim()) {
      localStorage.setItem('referralCode', referralCode.trim());
      localStorage.setItem('referralDetected', 'true');
      console.log('✅ Referral code detected and stored:', referralCode.trim());

      // Show success notification
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('referralDetected', { 
          detail: { code: referralCode.trim() } 
        }));
      }, 500);

      // If user is already logged in, redirect to dashboard
      if (user) {
        setLocation("/dashboard");
      } else {
        // Clear URL parameters but keep referral in localStorage
        window.history.replaceState({}, document.title, window.location.pathname);
        setLocation("/signup");
      }
    }
  }, [user, setLocation]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ReferralDetector />
        <Switch>
          {/* Root redirect */}
          <Route path="/" component={AutoRedirectRoute} />
          
          {/* Public routes */}
          <Route path="/login" component={() => <PublicRoute component={Login} />} />
          <Route path="/signup" component={() => <PublicRoute component={Signup} />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/payment" component={() => <ProtectedRoute component={Payment} />} />
          <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
          <Route path="/referral" component={() => <ProtectedRoute component={Referral} />} />
          <Route path="/withdrawal" component={() => <ProtectedRoute component={Withdrawal} />} />
          <Route path="/withdrawal-popup" component={() => <ProtectedRoute component={WithdrawalPopup} />} />
          
          {/* Lazy loaded protected routes */}
          <Route path="/create-channel" component={() => 
            <ProtectedRoute component={() => 
              <Suspense fallback={<div className="w-full h-screen flex items-center justify-center p-0 m-0"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
                <ChannelCreation />
              </Suspense>
            } />
          } />
          
          <Route path="/super-admin" component={() => 
            <Suspense fallback={<div className="w-full h-screen flex items-center justify-center p-0 m-0"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
              <SuperAdmin />
            </Suspense>
          } />
          
          {/* 404 route */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;