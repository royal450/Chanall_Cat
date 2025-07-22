// Direct Firebase operations for Channel Market
import { ref, update, get, set, push, serverTimestamp, onValue, off } from 'firebase/database';
import { database } from './firebase';

// Create service in Firebase
export const createServiceInFirebase = async (serviceData: any) => {
  try {
    const servicesRef = ref(database, 'services');
    const newServiceRef = push(servicesRef);
    
    const serviceWithTimestamp = {
      ...serviceData,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    };

    await set(newServiceRef, serviceWithTimestamp);
    console.log('Service created in Firebase:', newServiceRef.key);
    return { id: newServiceRef.key, ...serviceWithTimestamp };
  } catch (error) {
    console.error('Error creating service in Firebase:', error);
    throw error;
  }
};

// Approve service in Firebase
export const approveServiceInFirebase = async (serviceId: string, adminNote?: string) => {
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
    return { success: true };
  } catch (error) {
    console.error('Error approving service:', error);
    throw error;
  }
};

// Reject service in Firebase
export const rejectServiceInFirebase = async (serviceId: string, reason: string, adminNote?: string) => {
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
    return { success: true };
  } catch (error) {
    console.error('Error rejecting service:', error);
    throw error;
  }
};

// Block/Unblock service
export const toggleServiceBlock = async (serviceId: string, blocked: boolean, reason?: string) => {
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
    return { success: true };
  } catch (error) {
    console.error(`Error ${blocked ? 'blocking' : 'unblocking'} service:`, error);
    throw error;
  }
};

// Update service marketing data
export const updateServiceMarketing = async (serviceId: string, marketingData: any) => {
  try {
    const serviceRef = ref(database, `services/${serviceId}`);
    const updates = {
      ...marketingData,
      lastUpdated: serverTimestamp()
    };
    
    await update(serviceRef, updates);
    console.log(`Service ${serviceId} marketing data updated`);
    return { success: true };
  } catch (error) {
    console.error('Error updating marketing data:', error);
    throw error;
  }
};

// Update user data
export const updateUserInFirebase = async (userId: string, updates: any) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const userUpdates = {
      ...updates,
      lastUpdated: serverTimestamp()
    };
    
    await update(userRef, userUpdates);
    console.log(`User ${userId} updated successfully`);
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};