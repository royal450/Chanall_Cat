import { useState, useEffect } from 'react';
import { ref, onValue, off, update, push, set, get, serverTimestamp } from 'firebase/database';
import { database } from '@/lib/firebase';

// Custom hook for Firebase realtime operations
export function useFirebaseRealtime() {
  
  // Services/Channels realtime hook
  const useServices = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      try {
        const servicesRef = ref(database, 'services');
        
        const unsubscribe = onValue(servicesRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const servicesArray = Object.entries(data).map(([id, service]: [string, any]) => {
                // Generate marketing elements with correct ranges
                const marketingElements = {
                  likes: service.likes || Math.floor(Math.random() * 401) + 100, // 100-500 range
                  comments: service.comments || Math.floor(Math.random() * 300) + 50,
                  rating: service.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
                  soldCount: service.soldCount || Math.floor(Math.random() * 5000) + 1000,
                  fakePrice: service.fakePrice || Math.floor(service.price * (3 + Math.random() * 2)),
                  followerCount: service.followerCount || Math.floor(Math.random() * 500000) + 50000,
                  engagementRate: service.engagementRate || (Math.random() * 12 + 3).toFixed(1),
                  views: service.views || Math.floor(Math.random() * 7001) + 2000, // 2000-9000 range
                  createdAt: service.createdAt || new Date().toISOString(),
                  lastUpdated: service.lastUpdated || new Date().toISOString()
                };
                
                // Update Firebase with marketing elements if they don't exist
                if (!service.likes || !service.views) {
                  const serviceRef = ref(database, `services/${id}`);
                  update(serviceRef, {
                    ...marketingElements,
                    lastUpdated: serverTimestamp()
                  }).catch(console.error);
                }
                
                return {
                  id,
                  ...service,
                  ...marketingElements
                };
              }).filter((service: any) => {
                // Dashboard shows ONLY approved and non-blocked services
                return (service.approvalStatus === 'approved' && service.status === 'active' && !service.blocked);
              });
              setServices(servicesArray);
            } else {
              setServices([]);
            }
            setError(null);
          } catch (err: any) {
            console.error('Error processing services data:', err);
            setError(err.message);
            setServices([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Firebase services listener error:', error);
          setError(error.message);
          setLoading(false);
        });

        return () => off(servicesRef, 'value', unsubscribe);
      } catch (err: any) {
        console.error('Error setting up services listener:', err);
        setError(err.message);
        setLoading(false);
      }
    }, []);

    const updateServiceInteraction = async (serviceId: string, field: 'likes' | 'comments' | 'views', increment: number = 1) => {
      try {
        const service = services.find(s => s.id === serviceId);
        if (service) {
          const serviceRef = ref(database, `services/${serviceId}`);
          await update(serviceRef, {
            [field]: (service[field] || 0) + increment,
            lastUpdated: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Error updating service interaction:', error);
        throw error;
      }
    };

    const createService = async (serviceData: any) => {
      try {
        console.log('Creating service with data:', serviceData);
        const servicesRef = ref(database, 'services');
        const newServiceRef = push(servicesRef);
        
        const serviceWithTimestamp = {
          ...serviceData,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          approvalStatus: 'pending',
          status: 'pending',
          blocked: false,
          likes: serviceData.likes || Math.floor(Math.random() * 50000) + 10000,
          comments: serviceData.comments || Math.floor(Math.random() * 5000) + 1000,
          views: serviceData.views || Math.floor(Math.random() * 900000) + 100000,
          rating: serviceData.rating || (Math.random() * 1 + 4).toFixed(1),
          soldCount: serviceData.soldCount || 0,
          engagementRate: serviceData.engagementRate || (Math.random() * 8 + 2).toFixed(1),
          followerCount: serviceData.followersCount || serviceData.followerCount || Math.floor(Math.random() * 500000) + 50000
        };

        await set(newServiceRef, serviceWithTimestamp);
        console.log('Service created successfully in Firebase:', newServiceRef.key);
        return { id: newServiceRef.key, ...serviceWithTimestamp };
      } catch (error) {
        console.error('Error creating service:', error);
        throw error;
      }
    };

    return {
      services,
      loading,
      error,
      updateServiceInteraction,
      createService
    };
  };

  // Users realtime hook  
  const useUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      try {
        const usersRef = ref(database, 'users');
        
        const unsubscribe = onValue(usersRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const usersArray = Object.entries(data).map(([id, user]: [string, any]) => ({
                id,
                ...user,
                lastActiveAt: user.lastActiveAt || new Date().toISOString()
              }));
              setUsers(usersArray);
            } else {
              setUsers([]);
            }
            setError(null);
          } catch (err: any) {
            console.error('Error processing users data:', err);
            setError(err.message);
            setUsers([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Firebase users listener error:', error);
          setError(error.message);
          setLoading(false);
        });

        return () => off(usersRef, 'value', unsubscribe);
      } catch (err: any) {
        console.error('Error setting up users listener:', err);
        setError(err.message);
        setLoading(false);
      }
    }, []);

    const updateUser = async (userId: string, updates: any) => {
      try {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, {
          ...updates,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    };

    const createUser = async (userId: string, userData: any) => {
      try {
        const userRef = ref(database, `users/${userId}`);
        const userWithTimestamp = {
          ...userData,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
          lastActiveAt: serverTimestamp(),
          walletBalance: 0,
          totalEarnings: 0,
          totalReferrals: 0,
          isActive: true
        };
        await set(userRef, userWithTimestamp);
        return { id: userId, ...userWithTimestamp };
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    };

    return {
      users,
      loading,
      error,
      updateUser,
      createUser
    };
  };

  // Referrals realtime hook
  const useReferrals = () => {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      try {
        const referralsRef = ref(database, 'referrals');
        
        const unsubscribe = onValue(referralsRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const referralsArray = Object.entries(data).map(([id, referral]: [string, any]) => ({
                id,
                ...referral
              }));
              setReferrals(referralsArray);
            } else {
              setReferrals([]);
            }
            setError(null);
          } catch (err: any) {
            console.error('Error processing referrals data:', err);
            setError(err.message);
            setReferrals([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Firebase referrals listener error:', error);
          setError(error.message);
          setLoading(false);
        });

        return () => off(referralsRef, 'value', unsubscribe);
      } catch (err: any) {
        console.error('Error setting up referrals listener:', err);
        setError(err.message);
        setLoading(false);
      }
    }, []);

    const createReferral = async (referrerUserId: string, referredUserId: string, referralCode: string) => {
      try {
        const referralsRef = ref(database, 'referrals');
        const newReferralRef = push(referralsRef);
        
        const referralData = {
          referrerUserId,
          referredUserId,
          referralCode,
          bonusAmount: 10, // ₹10 bonus
          status: 'completed',
          createdAt: serverTimestamp(),
          paidAt: serverTimestamp()
        };

        await set(newReferralRef, referralData);

        // Update both users' data
        const usersRef = ref(database, 'users');
        
        // Get current user data
        const referrerSnapshot = await get(ref(database, `users/${referrerUserId}`));
        const referredSnapshot = await get(ref(database, `users/${referredUserId}`));
        
        if (referrerSnapshot.exists()) {
          const referrerData = referrerSnapshot.val();
          await update(ref(database, `users/${referrerUserId}`), {
            walletBalance: (referrerData.walletBalance || 0) + 10,
            totalEarnings: (referrerData.totalEarnings || 0) + 10,
            totalReferrals: (referrerData.totalReferrals || 0) + 1,
            lastUpdated: serverTimestamp()
          });
        }

        if (referredSnapshot.exists()) {
          const referredData = referredSnapshot.val();
          await update(ref(database, `users/${referredUserId}`), {
            walletBalance: (referredData.walletBalance || 0) + 10,
            referredBy: referrerUserId,
            referralCode: referralCode,
            lastUpdated: serverTimestamp()
          });
        }

        return { id: newReferralRef.key, ...referralData };
      } catch (error) {
        console.error('Error creating referral:', error);
        throw error;
      }
    };

    return {
      referrals,
      loading,
      error,
      createReferral
    };
  };

  // Payments realtime hook
  const usePayments = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      try {
        const paymentsRef = ref(database, 'payments');
        
        const unsubscribe = onValue(paymentsRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const paymentsArray = Object.entries(data).map(([id, payment]: [string, any]) => ({
                id,
                ...payment
              }));
              setPayments(paymentsArray);
            } else {
              setPayments([]);
            }
            setError(null);
          } catch (err: any) {
            console.error('Error processing payments data:', err);
            setError(err.message);
            setPayments([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Firebase payments listener error:', error);
          setError(error.message);
          setLoading(false);
        });

        return () => off(paymentsRef, 'value', unsubscribe);
      } catch (err: any) {
        console.error('Error setting up payments listener:', err);
        setError(err.message);
        setLoading(false);
      }
    }, []);

    const createPayment = async (paymentData: any) => {
      try {
        const paymentsRef = ref(database, 'payments');
        const newPaymentRef = push(paymentsRef);
        
        const paymentWithTimestamp = {
          ...paymentData,
          createdAt: serverTimestamp(),
          status: 'pending',
          verificationStatus: 'pending'
        };

        await set(newPaymentRef, paymentWithTimestamp);
        return { id: newPaymentRef.key, ...paymentWithTimestamp };
      } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
      }
    };

    const updatePayment = async (paymentId: string, updates: any) => {
      try {
        const paymentRef = ref(database, `payments/${paymentId}`);
        await update(paymentRef, {
          ...updates,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
      }
    };

    return {
      payments,
      loading,
      error,
      createPayment,
      updatePayment
    };
  };

  // Withdrawals realtime hook
  const useWithdrawals = () => {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      try {
        const withdrawalsRef = ref(database, 'withdrawals');
        
        const unsubscribe = onValue(withdrawalsRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const withdrawalsArray = Object.entries(data).map(([id, withdrawal]: [string, any]) => ({
                id,
                ...withdrawal
              }));
              setWithdrawals(withdrawalsArray);
            } else {
              setWithdrawals([]);
            }
            setError(null);
          } catch (err: any) {
            console.error('Error processing withdrawals data:', err);
            setError(err.message);
            setWithdrawals([]);
          }
          setLoading(false);
        }, (error) => {
          console.error('Firebase withdrawals listener error:', error);
          setError(error.message);
          setLoading(false);
        });

        return () => off(withdrawalsRef, 'value', unsubscribe);
      } catch (err: any) {
        console.error('Error setting up withdrawals listener:', err);
        setError(err.message);
        setLoading(false);
      }
    }, []);

    const createWithdrawal = async (withdrawalData: any) => {
      try {
        const withdrawalsRef = ref(database, 'withdrawals');
        const newWithdrawalRef = push(withdrawalsRef);
        
        const withdrawalWithTimestamp = {
          ...withdrawalData,
          createdAt: serverTimestamp(),
          status: 'pending'
        };

        await set(newWithdrawalRef, withdrawalWithTimestamp);
        return { id: newWithdrawalRef.key, ...withdrawalWithTimestamp };
      } catch (error) {
        console.error('Error creating withdrawal:', error);
        throw error;
      }
    };

    const updateWithdrawal = async (withdrawalId: string, updates: any) => {
      try {
        const withdrawalRef = ref(database, `withdrawals/${withdrawalId}`);
        await update(withdrawalRef, {
          ...updates,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating withdrawal:', error);
        throw error;
      }
    };

    return {
      withdrawals,
      loading,
      error,
      createWithdrawal,
      updateWithdrawal
    };
  };

  // Admin stats realtime hook
  const useAdminStats = () => {
    const [adminStats, setAdminStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      try {
        const statsRef = ref(database, 'adminStats');
        
        const unsubscribe = onValue(statsRef, (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              setAdminStats(data);
            } else {
              // Create default admin stats
              const defaultStats = {
                totalUsers: 0,
                totalServices: 0,
                totalPayments: 0,
                totalEarnings: 0,
                pendingApprovals: 0,
                activeUsers: 0,
                lastUpdated: new Date().toISOString()
              };
              setAdminStats(defaultStats);
            }
            setError(null);
          } catch (err: any) {
            console.error('Error processing admin stats data:', err);
            setError(err.message);
          }
          setLoading(false);
        }, (error) => {
          console.error('Firebase admin stats listener error:', error);
          setError(error.message);
          setLoading(false);
        });

        return () => off(statsRef, 'value', unsubscribe);
      } catch (err: any) {
        console.error('Error setting up admin stats listener:', err);
        setError(err.message);
        setLoading(false);
      }
    }, []);

    const updateAdminStats = async (updates: any) => {
      try {
        const statsRef = ref(database, 'adminStats');
        await update(statsRef, {
          ...updates,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating admin stats:', error);
        throw error;
      }
    };

    return {
      adminStats,
      loading,
      error,
      updateAdminStats
    };
  };

  return {
    useServices,
    useUsers,
    useReferrals,
    usePayments,
    useWithdrawals,
    useAdminStats
  };
}

// Export individual hooks for convenience
export const useFirebaseServices = () => {
  const firebase = useFirebaseRealtime();
  return firebase.useServices();
};

export const useFirebaseUsers = () => {
  const firebase = useFirebaseRealtime();
  return firebase.useUsers();
};

export const useFirebaseReferrals = () => {
  const firebase = useFirebaseRealtime();
  return firebase.useReferrals();
};

export const useFirebasePayments = () => {
  const firebase = useFirebaseRealtime();
  return firebase.usePayments();
};

export const useFirebaseWithdrawals = () => {
  const firebase = useFirebaseRealtime();
  return firebase.useWithdrawals();
};

export const useFirebaseAdminStats = () => {
  const firebase = useFirebaseRealtime();
  return firebase.useAdminStats();
};