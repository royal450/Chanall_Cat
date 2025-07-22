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

    // Save user data to Firebase Realtime Database for admin panel
    await saveUserToDatabase(user, referralCode);

    // Handle referral bonus
    if (referralCode) {
      await processReferralBonus(user.uid, referralCode);
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

          // Give bonus to both users
          const bonusAmount = 10;

          // Update referrer
          await update(ref(database, `users/${referrerId}`), {
            walletBalance: (referrerData?.walletBalance || 0) + bonusAmount,
            totalEarnings: (referrerData?.totalEarnings || 0) + bonusAmount,
            totalReferrals: (referrerData?.totalReferrals || 0) + 1
          });

          // Update new user
          await update(ref(database, `users/${newUserId}`), {
            walletBalance: bonusAmount,
            totalEarnings: bonusAmount,
            referredBy: referralCode
          });

          // Log referral bonus
          await push(ref(database, 'referralBonuses'), {
            referrerId,
            referredId: newUserId,
            bonusAmount,
            status: 'paid',
            createdAt: new Date().toISOString()
          });

          // Update referral stats
          const today = new Date().toISOString().split('T')[0];
          await update(ref(database, `referralStats/${referrerId}`), {
            totalReferrals: (referrerData.totalReferrals || 0) + 1,
            totalEarnings: (referrerData.totalEarnings || 0) + bonusAmount,
            todayReferrals: (referrerData.todayReferrals || 0) + 1,
            todayEarnings: (referrerData.todayEarnings || 0) + bonusAmount,
            lastReferralDate: today
          });

          console.log('Referral bonus processed successfully');
        }
      }
    } catch (error) {
      console.error('Error processing referral bonus:', error);
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