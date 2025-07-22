// Firebase Admin Operations for Channel Market
import { ref, update, get, set, push, serverTimestamp } from 'firebase/database';
import { database } from './firebase';

export class FirebaseAdmin {
  
  // Approve a channel/service
  static async approveService(serviceId: string, adminNote?: string) {
    try {
      const serviceRef = ref(database, `services/${serviceId}`);
      const updates = {
        approvalStatus: 'approved',
        status: 'active',
        blocked: false,
        approvedAt: serverTimestamp(),
        approvedBy: 'admin',
        adminNote: adminNote || 'Approved by admin',
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updates);
      console.log(`Service ${serviceId} approved successfully`);
      return { success: true, message: 'Service approved successfully' };
    } catch (error) {
      console.error('Error approving service:', error);
      throw error;
    }
  }
  
  // Reject a channel/service
  static async rejectService(serviceId: string, reason: string, adminNote?: string) {
    try {
      const serviceRef = ref(database, `services/${serviceId}`);
      const updates = {
        approvalStatus: 'rejected',
        status: 'rejected',
        blocked: true,
        rejectedAt: serverTimestamp(),
        rejectedBy: 'admin',
        rejectionReason: reason,
        adminNote: adminNote || 'Rejected by admin',
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updates);
      console.log(`Service ${serviceId} rejected successfully`);
      return { success: true, message: 'Service rejected successfully' };
    } catch (error) {
      console.error('Error rejecting service:', error);
      throw error;
    }
  }
  
  // Block/Unblock a service
  static async toggleServiceBlock(serviceId: string, blocked: boolean, reason?: string) {
    try {
      const serviceRef = ref(database, `services/${serviceId}`);
      const updates = {
        blocked,
        blockReason: blocked ? reason : null,
        blockedAt: blocked ? serverTimestamp() : null,
        blockedBy: blocked ? 'admin' : null,
        unblockedAt: !blocked ? serverTimestamp() : null,
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updates);
      console.log(`Service ${serviceId} ${blocked ? 'blocked' : 'unblocked'} successfully`);
      return { success: true, message: `Service ${blocked ? 'blocked' : 'unblocked'} successfully` };
    } catch (error) {
      console.error(`Error ${blocked ? 'blocking' : 'unblocking'} service:`, error);
      throw error;
    }
  }
  
  // Update user status
  static async updateUserStatus(userId: string, updates: any) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userUpdates = {
        ...updates,
        lastUpdated: serverTimestamp()
      };
      
      await update(userRef, userUpdates);
      console.log(`User ${userId} updated successfully`);
      return { success: true, message: 'User updated successfully' };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Give bonus to user
  static async giveUserBonus(userId: string, amount: number, reason: string) {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userSnapshot.val();
      const currentBalance = userData.walletBalance || 0;
      const currentEarnings = userData.totalEarnings || 0;
      
      const updates = {
        walletBalance: currentBalance + amount,
        totalEarnings: currentEarnings + amount,
        lastUpdated: serverTimestamp()
      };
      
      await update(userRef, updates);
      
      // Log the bonus transaction
      const bonusRef = push(ref(database, 'adminBonuses'));
      await set(bonusRef, {
        userId,
        amount,
        reason,
        givenBy: 'admin',
        givenAt: serverTimestamp()
      });
      
      console.log(`Bonus of ₹${amount} given to user ${userId}`);
      return { success: true, message: `Bonus of ₹${amount} given successfully` };
    } catch (error) {
      console.error('Error giving bonus:', error);
      throw error;
    }
  }
  
  // Get admin statistics
  static async getAdminStats() {
    try {
      const [servicesSnapshot, usersSnapshot, referralsSnapshot, paymentsSnapshot] = await Promise.all([
        get(ref(database, 'services')),
        get(ref(database, 'users')),
        get(ref(database, 'referrals')),
        get(ref(database, 'payments'))
      ]);
      
      const services = servicesSnapshot.exists() ? Object.values(servicesSnapshot.val()) : [];
      const users = usersSnapshot.exists() ? Object.values(usersSnapshot.val()) : [];
      const referrals = referralsSnapshot.exists() ? Object.values(referralsSnapshot.val()) : [];
      const payments = paymentsSnapshot.exists() ? Object.values(paymentsSnapshot.val()) : [];
      
      const stats = {
        totalServices: services.length,
        activeServices: services.filter((s: any) => s.status === 'active').length,
        pendingServices: services.filter((s: any) => s.approvalStatus === 'pending').length,
        rejectedServices: services.filter((s: any) => s.approvalStatus === 'rejected').length,
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.isActive).length,
        totalReferrals: referrals.length,
        totalPayments: payments.length,
        totalEarnings: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        lastUpdated: new Date().toISOString()
      };
      
      // Update admin stats in Firebase
      await set(ref(database, 'adminStats'), {
        ...stats,
        lastUpdated: serverTimestamp()
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }
  
  // Update service marketing data (likes, views, etc.)
  static async updateServiceMarketing(serviceId: string, marketingData: any) {
    try {
      const serviceRef = ref(database, `services/${serviceId}`);
      const updates = {
        ...marketingData,
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updates);
      console.log(`Service ${serviceId} marketing data updated`);
      return { success: true, message: 'Marketing data updated successfully' };
    } catch (error) {
      console.error('Error updating marketing data:', error);
      throw error;
    }
  }
  
  // Process withdrawal request
  static async processWithdrawal(withdrawalId: string, status: 'approved' | 'rejected', adminNote?: string) {
    try {
      const withdrawalRef = ref(database, `withdrawals/${withdrawalId}`);
      const updates = {
        status,
        processedAt: serverTimestamp(),
        processedBy: 'admin',
        adminNote: adminNote || `Withdrawal ${status} by admin`,
        lastUpdated: serverTimestamp()
      };
      
      await update(withdrawalRef, updates);
      
      // If approved, deduct from user's wallet
      if (status === 'approved') {
        const withdrawalSnapshot = await get(withdrawalRef);
        if (withdrawalSnapshot.exists()) {
          const withdrawalData = withdrawalSnapshot.val();
          const userRef = ref(database, `users/${withdrawalData.userId}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            const currentBalance = userData.walletBalance || 0;
            
            if (currentBalance >= withdrawalData.amount) {
              await update(userRef, {
                walletBalance: currentBalance - withdrawalData.amount,
                lastUpdated: serverTimestamp()
              });
            }
          }
        }
      }
      
      console.log(`Withdrawal ${withdrawalId} ${status}`);
      return { success: true, message: `Withdrawal ${status} successfully` };
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw error;
    }
  }
}

export default FirebaseAdmin;