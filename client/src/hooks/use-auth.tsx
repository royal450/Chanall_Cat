import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, displayName: string, referralCode?: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });

    // Get referral code from localStorage if not provided
    const storedReferralCode = referralCode || localStorage.getItem('referralCode');
    
    console.log(`👤 New user signup: ${email}, Referral code: ${storedReferralCode}`);

    // Save user data to Firebase Realtime Database for admin panel
    await saveUserToDatabase(user, storedReferralCode);

    // Handle referral bonus immediately after user creation
    if (storedReferralCode && storedReferralCode.trim()) {
      console.log(`🎁 Processing referral bonus for new user...`);
      await processReferralBonus(user.uid, storedReferralCode.trim());
      
      // Clear referral code from localStorage after processing
      localStorage.removeItem('referralCode');
      localStorage.removeItem('referralDetected');
    }
  };

  const saveUserToDatabase = async (user: User, referralCode?: string) => {
    try {
      const { ref, set, serverTimestamp } = await import('firebase/database');
      const { database } = await import('@/lib/firebase');

      // Generate unique referral code for new user
      const newReferralCode = Math.random().toString(36).substr(2, 9).toUpperCase();

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        referralCode: newReferralCode,
        usedReferralCode: referralCode || null,
        walletBalance: 0,
        totalEarnings: 0,
        totalReferrals: 0,
        totalPurchases: 0,
        isActive: true,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
        signupDate: new Date().toISOString()
      };

      await set(ref(database, `users/${user.uid}`), userData);
      console.log('✅ User data saved to Firebase:', userData);
    } catch (error) {
      console.error('❌ Failed to save user data:', error);
    }
  };

  const processReferralBonus = async (newUserId: string, referralCode: string) => {
    try {
      console.log(`🎁 Processing referral bonus: User ${newUserId} with code ${referralCode}`);
      
      const { ref, get, update, push } = await import('firebase/database');
      const { database } = await import('@/lib/firebase');

      // Find referrer by code
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();
        const referrer = Object.entries(users).find(([id, user]: [string, any]) => 
          user.referralCode === referralCode
        );

        if (referrer) {
          const [referrerId, referrerData] = referrer as [string, any];
          console.log(`✅ Referrer found: ${referrerId}`);

          // Give bonus to both users - ₹10 each
          const bonusAmount = 10;

          // Update referrer's wallet
          const referrerUpdates = {
            walletBalance: (referrerData.walletBalance || 0) + bonusAmount,
            totalEarnings: (referrerData.totalEarnings || 0) + bonusAmount,
            totalReferrals: (referrerData.totalReferrals || 0) + 1,
            lastUpdated: new Date().toISOString()
          };

          await update(ref(database, `users/${referrerId}`), referrerUpdates);
          console.log(`✅ Referrer bonus added: ₹${bonusAmount} to ${referrerId}`);

          // Update new user's wallet
          const newUserUpdates = {
            walletBalance: bonusAmount,
            totalEarnings: bonusAmount,
            referredBy: referrerId,
            usedReferralCode: referralCode,
            signupBonus: bonusAmount,
            lastUpdated: new Date().toISOString()
          };

          await update(ref(database, `users/${newUserId}`), newUserUpdates);
          console.log(`✅ New user bonus added: ₹${bonusAmount} to ${newUserId}`);

          // Log referral bonus transaction
          await push(ref(database, 'referralBonuses'), {
            referrerId,
            referredId: newUserId,
            referralCode,
            bonusAmount,
            referrerBonus: bonusAmount,
            referredBonus: bonusAmount,
            status: 'completed',
            type: 'signup_referral',
            createdAt: new Date().toISOString(),
            transactionId: `REF_${Date.now()}`
          });

          // Update referral stats for referrer
          const today = new Date().toISOString().split('T')[0];
          const statsRef = ref(database, `referralStats/${referrerId}`);
          const statsSnapshot = await get(statsRef);
          const currentStats = statsSnapshot.val() || {};

          await update(statsRef, {
            totalReferrals: (currentStats.totalReferrals || 0) + 1,
            totalEarnings: (currentStats.totalEarnings || 0) + bonusAmount,
            thisMonth: (currentStats.thisMonth || 0) + 1,
            todaySignups: currentStats.lastReferralDate === today ? (currentStats.todaySignups || 0) + 1 : 1,
            lastReferralDate: today,
            lastUpdated: new Date().toISOString()
          });

          console.log(`🎉 Referral bonus complete! Both users received ₹${bonusAmount}`);

          // Show success notification
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('referralBonusSuccess', {
              detail: {
                amount: bonusAmount,
                referrer: referrerData.displayName || 'User',
                code: referralCode
              }
            }));
          }, 1000);

        } else {
          console.log(`❌ Referrer not found for code: ${referralCode}`);
        }
      }
    } catch (error) {
      console.error('❌ Error processing referral bonus:', error);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}