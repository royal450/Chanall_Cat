// Direct Firebase Admin Operations for Channel Market
import { ref, update, get, push, set, serverTimestamp } from 'firebase/database';
import { database } from './firebase';

export const adminOperations = {
  // Approve service directly in Firebase
  approveService: async (serviceId: string) => {
    try {
      console.log('Approving service:', serviceId);
      const serviceRef = ref(database, `services/${serviceId}`);
      const updates = {
        approvalStatus: 'approved',
        status: 'active',
        blocked: false,
        approvedAt: serverTimestamp(),
        approvedBy: 'super_admin',
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updates);
      console.log('Service approved successfully');
      return { success: true };
    } catch (error) {
      console.error('Error approving service:', error);
      throw error;
    }
  },

  // Reject service directly in Firebase
  rejectService: async (serviceId: string, reason: string) => {
    try {
      console.log('Rejecting service:', serviceId, 'Reason:', reason);
      const serviceRef = ref(database, `services/${serviceId}`);
      const updates = {
        approvalStatus: 'rejected',
        status: 'rejected',
        blocked: true,
        rejectedAt: serverTimestamp(),
        rejectedBy: 'super_admin',
        rejectionReason: reason,
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updates);
      console.log('Service rejected successfully');
      return { success: true };
    } catch (error) {
      console.error('Error rejecting service:', error);
      throw error;
    }
  },

  // Block/Unblock service
  blockService: async (serviceId: string, blocked: boolean, reason?: string) => {
    try {
      console.log('Block/Unblock service:', serviceId, blocked);
      const serviceRef = ref(database, `services/${serviceId}`);
      const updates = {
        blocked,
        blockReason: blocked ? reason || 'Blocked by admin' : null,
        blockedAt: blocked ? serverTimestamp() : null,
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updates);
      console.log(`Service ${blocked ? 'blocked' : 'unblocked'} successfully`);
      return { success: true };
    } catch (error) {
      console.error('Error blocking/unblocking service:', error);
      throw error;
    }
  },

  // Update service with any data
  updateService: async (serviceId: string, updates: any) => {
    try {
      console.log('Updating service:', serviceId, 'Updates:', updates);
      const serviceRef = ref(database, `services/${serviceId}`);
      const updateData = {
        ...updates,
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, updateData);
      console.log('Service updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  // Delete service from Firebase
  deleteService: async (serviceId: string) => {
    try {
      console.log('Deleting service:', serviceId);
      const serviceRef = ref(database, `services/${serviceId}`);
      await set(serviceRef, null); // This deletes the node
      console.log('Service deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  },

  // Update service marketing data
  updateServiceMarketing: async (serviceId: string, updates: any) => {
    try {
      console.log('Updating service marketing:', serviceId, updates);
      const serviceRef = ref(database, `services/${serviceId}`);
      const marketingUpdates = {
        ...updates,
        lastUpdated: serverTimestamp()
      };
      
      await update(serviceRef, marketingUpdates);
      console.log('Service marketing updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error updating service marketing:', error);
      throw error;
    }
  }
};