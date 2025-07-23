import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Services Management APIs
  app.get("/api/courses", async (req, res) => {
    try {
      // Get only active, approved, and non-blocked services for dashboard
      const services = await storage.getCourses();
      const activeServices = services.filter(service => 
        service.status === 'active' && 
        service.approvalStatus === 'approved' && 
        !service.blocked
      );
      res.json(activeServices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Channels API (alias for courses)
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getCourses();
      const activeChannels = channels.filter(channel => 
        channel.status === 'active' && 
        channel.approvalStatus === 'approved' && 
        !channel.blocked
      );
      res.json(activeChannels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  app.post("/api/channels", async (req, res) => {
    try {
      const channelData = {
        ...req.body,
        status: 'pending',
        approvalStatus: 'pending',
        createdAt: new Date()
      };

      const channel = await storage.createCourse(channelData);
      res.json(channel);
    } catch (error) {
      res.status(500).json({ error: "Failed to create channel" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const serviceData = {
        ...req.body,
        status: 'pending',
        approvalStatus: 'pending',
        createdAt: new Date()
      };

      const service = await storage.createCourse(serviceData);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // User Services Management
  app.get("/api/users/:userId/courses", async (req, res) => {
    try {
      const { userId } = req.params;
      const services = await storage.getUserCourses(userId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user services" });
    }
  });

  // Course Approval/Rejection
  app.put("/api/courses/:courseId/approve", async (req, res) => {
    try {
      const { courseId } = req.params;
      const updatedCourse = await storage.updateCourse(courseId, {
        status: 'active',
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: 'admin'
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve course" });
    }
  });

  app.put("/api/courses/:courseId/reject", async (req, res) => {
    try {
      const { courseId } = req.params;
      const { reason } = req.body;

      const updatedCourse = await storage.updateCourse(courseId, {
        status: 'rejected',
        approvalStatus: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: 'admin',
        rejectionReason: reason
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject course" });
    }
  });

  // Referral System APIs
  app.post("/api/referrals/track", async (req, res) => {
    try {
      const { referralCode, newUserId } = req.body;

      // Find referrer user
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      // Track referral
      await storage.trackReferral(referrer.id, newUserId);

      res.json({ success: true, referrer: referrer.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  app.post("/api/referrals/commission", async (req, res) => {
    try {
      const { purchaseAmount, buyerId } = req.body;

      // Find who referred this buyer
      const referral = await storage.getReferralByBuyer(buyerId);
      if (!referral) {
        return res.json({ success: true, commission: 0 });
      }

      // Calculate commission (10% of purchase)
      const commission = purchaseAmount * 0.1;

      // Update referrer's wallet
      if (referral.referrerId !== null) {
        await storage.updateUserWallet(referral.referrerId, commission);
      }

      res.json({ success: true, commission });
    } catch (error) {
      res.status(500).json({ error: "Failed to process commission" });
    }
  });

  // Channel submission endpoint
  app.post("/api/channels", async (req, res) => {
    try {
      const channelData = req.body;
      const newChannel = await storage.createCourse({
        ...channelData,
        status: "pending",
        approvalStatus: "pending",
        sellerId: 1, // Should come from auth
        seller: channelData.seller || "User"
      });
      res.json(newChannel);
    } catch (error) {
      res.status(500).json({ error: "Failed to create channel" });
    }
  });

  // Sold out badge injection
  app.put("/api/courses/:id/sold-out", async (req, res) => {
    try {
      const courseId = req.params.id;
      const updated = await storage.updateCourse(courseId, { 
        soldOut: true,
        soldOutAt: new Date().toISOString()
      });
      res.json(updated);
    } catch (error) {
      console.error('Sold out error:', error);
      res.status(500).json({ error: "Failed to mark as sold out" });
    }
  });

  // Remove sold out badge
  app.put("/api/courses/:id/remove-sold-out", async (req, res) => {
    try {
      const courseId = req.params.id;
      const updated = await storage.updateCourse(courseId, { 
        soldOut: false,
        soldOutAt: null
      });
      res.json(updated);
    } catch (error) {
      console.error('Remove sold out error:', error);
      res.status(500).json({ error: "Failed to remove sold out badge" });
    }
  });

  // Add bonus badge
  app.put("/api/courses/:id/bonus-badge", async (req, res) => {
    try {
      const courseId = req.params.id;
      const { badgeText, badgeType } = req.body;
      const updated = await storage.updateCourse(courseId, { 
        bonusBadge: true,
        badgeText: badgeText || "🔥 HOT",
        badgeType: badgeType || "custom",
        badgeAddedAt: new Date().toISOString()
      });
      res.json(updated);
    } catch (error) {
      console.error('Bonus badge error:', error);
      res.status(500).json({ error: "Failed to add bonus badge" });
    }
  });

  // Remove bonus badge
  app.put("/api/courses/:id/remove-bonus-badge", async (req, res) => {
    try {
      const courseId = req.params.id;
      const updated = await storage.updateCourse(courseId, { 
        bonusBadge: false,
        badgeText: null,
        badgeType: null,
        badgeAddedAt: null
      });
      res.json(updated);
    } catch (error) {
      console.error('Remove bonus badge error:', error);
      res.status(500).json({ error: "Failed to remove bonus badge" });
    }
  });

  // Bonus badge system
  app.put("/api/courses/:id/bonus-badge", async (req, res) => {
    try {
      const courseId = req.params.id;
      const { badgeType, badgeText } = req.body;
      const updated = await storage.updateCourse(courseId, { 
        bonusBadge: true,
        badgeType: badgeType || "hot",
        badgeText: badgeText || "🔥 HOT",
        badgeAddedAt: new Date()
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to add bonus badge" });
    }
  });

  // Remove bonus badge
  app.put("/api/courses/:id/remove-bonus-badge", async (req, res) => {
    try {
      const courseId = req.params.id;
      const updated = await storage.updateCourse(courseId, { 
        bonusBadge: false,
        badgeType: null,
        badgeText: null,
        badgeAddedAt: null
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove bonus badge" });
    }
  });

  // Payment Verification
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { courseId, userId, amount, paymentMethod, transactionId } = req.body;

      // Create payment record
      const payment = await storage.createPayment({
        courseId,
        userId,
        amount,
        paymentMethod,
        transactionId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/channels", async (req, res) => {
    try {
      const channels = await storage.getCourses();
      console.log("Admin channels found:", channels.length);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching admin channels:", error);
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  app.get("/api/admin/channels/pending", async (req, res) => {
    try {
      const allChannels = await storage.getCourses();
      const pendingChannels = allChannels.filter(
        (channel) => channel.status === 'pending' || channel.approvalStatus === 'pending'
      );
      console.log("Pending channels filtered:", pendingChannels.length);
      res.json(pendingChannels);
    } catch (error) {
      console.error("Error fetching pending channels:", error);
      res.status(500).json({ error: "Failed to fetch pending channels" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      console.log("🔍 Fetching users for admin panel...");
      
      // 🔥 GET REAL-TIME DATA FROM FIREBASE
      try {
        const { ref, get } = await import('firebase/database');
        const { database } = await import('./db');
        
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const firebaseUsers = usersSnapshot.val();
          const usersArray = Object.entries(firebaseUsers).map(([id, userData]: [string, any]) => ({
            id,
            ...userData,
            // Ensure all required fields exist
            walletBalance: userData.walletBalance || 0,
            totalEarnings: userData.totalEarnings || 0,
            totalReferrals: userData.totalReferrals || 0,
            totalPurchases: userData.totalPurchases || 0,
            totalChannels: userData.totalChannels || 0,
            isActive: userData.isActive !== false
          }));
          
          console.log(`✅ Firebase users loaded: ${usersArray.length}`);
          console.log("Real-time balances:", usersArray.map(u => ({ 
            id: u.id, 
            name: u.displayName, 
            email: u.email,
            wallet: u.walletBalance 
          })));
          
          res.json(usersArray);
          return;
        }
      } catch (firebaseError) {
        console.error('Firebase fetch error:', firebaseError);
      }
      
      // Fallback to memory storage if Firebase fails
      const users = await storage.getUsers();
      
      // Enhance each user with additional statistics
      const enhancedUsers = await Promise.all(users.map(async (user) => {
        try {
          const userChannels = await storage.getUserCourses(user.id.toString());
          const userBonuses = await storage.getUserBonuses(user.id);
          const userWithdrawals = await storage.getUserWithdrawals(user.id);
          
          return {
            ...user,
            totalChannels: userChannels.length,
            totalBonuses: userBonuses.length,
            totalWithdrawals: userWithdrawals.length,
            avgChannelPrice: userChannels.length > 0 ? Math.round(userChannels.reduce((sum, c) => sum + c.price, 0) / userChannels.length) : 0,
            channelEarnings: userChannels.reduce((sum, c) => sum + (c.price * (c.sales || 0)), 0),
            recentChannels: userChannels.slice(-3), // Last 3 channels
            loginCount: 0, // Default login count since this field doesn't exist in schema
            userLevel: (user.totalEarnings || 0) > 1000 ? 'Premium' : (user.totalEarnings || 0) > 500 ? 'Gold' : 'Silver'
          };
        } catch (error) {
          console.error(`Error enhancing user ${user.id}:`, error);
          return user;
        }
      }));

      console.log(`Fallback - Enhanced users found: ${enhancedUsers.length}`);
      res.json(enhancedUsers);
    } catch (error) {
      console.error("Error fetching enhanced users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Add bonus badge endpoint
  app.put("/api/courses/:id/bonus-badge", async (req, res) => {
    try {
      const courseId = req.params.id;
      const { badgeText, badgeType, addedBy } = req.body;

      const updates = {
        bonusBadge: true,
        badgeType: badgeType || 'admin_special',
        badgeText: badgeText || '🔥 HOT',
        badgeAddedAt: new Date().toISOString(),
        badgeAddedBy: addedBy || 'Admin'
      };

      const updatedChannel = await storage.updateCourse(courseId, updates);
      res.json(updatedChannel);
    } catch (error) {
      console.error("Error adding bonus badge:", error);
      res.status(500).json({ error: "Failed to add bonus badge" });
    }
  });

  // Remove bonus badge endpoint
  app.put("/api/courses/:id/remove-bonus-badge", async (req, res) => {
    try {
      const courseId = req.params.id;

      const updates = {
        bonusBadge: false,
        badgeType: null,
        badgeText: null,
        badgeAddedAt: null,
        badgeAddedBy: null
      };

      const updatedChannel = await storage.updateCourse(courseId, updates);
      res.json(updatedChannel);
    } catch (error) {
      console.error("Error removing bonus badge:", error);
      res.status(500).json({ error: "Failed to remove bonus badge" });
    }
  });

  // Edit channel endpoint
  app.put("/api/courses/:id", async (req, res) => {
    try {
      const courseId = req.params.id;
      const updates = req.body;

      const updatedChannel = await storage.updateCourse(courseId, updates);
      res.json(updatedChannel);
    } catch (error) {
      console.error("Error updating channel:", error);
      res.status(500).json({ error: "Failed to update channel" });
    }
  });

  // Enhanced User bonus system - Using EXACT same approach as referral bonus
  app.post("/api/admin/users/:userId/bonus", async (req, res) => {
    try {
      const userId = req.params.userId; // Firebase user ID string
      const { amount, reason, type = 'admin_bonus', adminName } = req.body;

      console.log(`🎁 Processing bonus for user ${userId}: ₹${amount} - ${reason}`);

      // 🔥 EXACT SAME FIREBASE OPERATIONS AS REFERRAL BONUS IN use-auth.tsx
      const { ref, get, update, push } = await import('firebase/database');
      
      // Import Firebase database only
      let database;
      try {
        const dbModule = await import('./db');
        database = dbModule.database;
        
        if (!database) {
          throw new Error('Firebase database not initialized');
        }
      } catch (error) {
        console.error('Error importing database:', error);
        return res.status(500).json({ 
          error: 'Database connection failed', 
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        const currentBalance = userData.walletBalance || 0;
        const currentEarnings = userData.totalEarnings || 0;
        
        console.log(`🔍 Current user data:`, {
          userId,
          displayName: userData.displayName,
          currentBalance,
          bonusAmount: amount
        });
        
        // EXACT same update method as referral bonus
        await update(userRef, {
          walletBalance: currentBalance + amount,
          totalEarnings: currentEarnings + amount,
          lastBonusReceived: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        
        console.log(`✅ Firebase updated: User ${userId} balance: ${currentBalance} → ${currentBalance + amount}`);
        
        // Create bonus record - same as referral bonuses  
        const bonusRef = ref(database, 'userBonuses');
        const bonusRecord = {
          userId,
          amount,
          reason,
          type,
          adminName: adminName || 'Super Admin',
          createdAt: new Date().toISOString(),
          status: 'completed',
          transactionId: `BONUS_${Date.now()}`
        };
        
        await push(bonusRef, bonusRecord);
        console.log(`✅ Bonus record created:`, bonusRecord);
        
        console.log(`✅ Admin bonus ₹${amount} successfully added to user ${userId}`);
        res.json({ 
          success: true, 
          message: `₹${amount} bonus added successfully to ${userData.displayName}`,
          newBalance: currentBalance + amount,
          userDetails: {
            userId,
            displayName: userData.displayName,
            email: userData.email,
            oldBalance: currentBalance,
            newBalance: currentBalance + amount,
            bonusAmount: amount,
            reason
          }
        });
        
      } else {
        console.log(`❌ User ${userId} not found in Firebase`);
        res.status(404).json({ error: `User ${userId} not found in Firebase database` });
      }
      
    } catch (error) {
      console.error('❌ Error processing admin bonus:', error);
      res.status(500).json({ 
        error: 'Failed to process bonus request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Enhanced User blocking/unblocking system  
  app.put("/api/admin/users/:userId/block", async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      await storage.updateUser(userId, { 
        isActive: false, 
        blockReason: reason,
        blockedAt: new Date().toISOString(),
        blockedBy: 'Super Admin'
      });
      res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
      console.error('Error blocking user:', error);
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  app.put("/api/admin/users/:userId/unblock", async (req, res) => {
    try {
      const { userId } = req.params;

      await storage.updateUser(userId, { 
        isActive: true, 
        blockReason: null,
        blockedAt: null,
        blockedBy: null,
        unblockedAt: new Date().toISOString(),
        unblockedBy: 'Super Admin'
      });
      res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
      console.error('Error unblocking user:', error);
      res.status(500).json({ error: "Failed to unblock user" });
    }
  });

  // Get detailed user information
  app.get("/api/admin/users/:userId/details", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserById(parseInt(userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's channels
      const userChannels = await storage.getUserCourses(userId);
      const userBonuses = await storage.getUserBonuses(parseInt(userId));
      const userWithdrawals = await storage.getUserWithdrawals(parseInt(userId));

      const detailedUser = {
        ...user,
        channels: userChannels,
        bonuses: userBonuses,
        withdrawals: userWithdrawals,
        totalChannels: userChannels.length,
        avgChannelPrice: userChannels.length > 0 ? Math.round(userChannels.reduce((sum, c) => sum + c.price, 0) / userChannels.length) : 0,
        channelEarnings: userChannels.reduce((sum, c) => sum + (c.price * (c.sales || 0)), 0)
      };

      res.json(detailedUser);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ error: "Failed to fetch user details" });
    }
  });

  // Give badge to user
  app.put("/api/admin/users/:userId/badge", async (req, res) => {
    try {
      const { userId } = req.params;
      const { badgeType, badgeName, badgeColor } = req.body;

      const user = await storage.getUserById(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userBadges: any[] = [];
      const newBadge = {
        id: Date.now(),
        type: badgeType,
        name: badgeName,
        color: badgeColor,
        givenBy: 'Super Admin',
        givenAt: new Date().toISOString()
      };

      await storage.updateUser(userId, {
        badges: [...userBadges, newBadge],
        lastBadgeReceived: new Date().toISOString()
      });

      res.json({ success: true, badge: newBadge });
    } catch (error) {
      console.error('Error giving badge:', error);
      res.status(500).json({ error: "Failed to give badge" });
    }
  });

  // Enhanced Withdrawal management
  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  app.put("/api/admin/withdrawals/:withdrawalId/approve", async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.withdrawalId);
      const { transactionId, adminNotes } = req.body;
      
      const updatedWithdrawal = await storage.approveWithdrawal(withdrawalId, {
        transactionId,
        adminNotes,
        processedBy: 'Super Admin',
        processedAt: new Date()
      });
      
      res.json(updatedWithdrawal);
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      res.status(500).json({ error: "Failed to approve withdrawal" });
    }
  });

  app.put("/api/admin/withdrawals/:withdrawalId/reject", async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.withdrawalId);
      const { adminNotes } = req.body;
      
      const updatedWithdrawal = await storage.rejectWithdrawal(withdrawalId, {
        adminNotes,
        processedBy: 'Super Admin',
        processedAt: new Date()
      });
      
      res.json(updatedWithdrawal);
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      res.status(500).json({ error: "Failed to reject withdrawal" });
    }
  });

  // Get all bonuses
  app.get("/api/admin/bonuses", async (req, res) => {
    try {
      const bonuses = await storage.getAllBonuses();
      res.json(bonuses);
    } catch (error) {
      console.error('Error fetching bonuses:', error);
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });

  // Get user bonuses
  app.get("/api/admin/users/:userId/bonuses", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bonuses = await storage.getUserBonuses(userId);
      res.json(bonuses);
    } catch (error) {
      console.error('Error fetching user bonuses:', error);
      res.status(500).json({ error: "Failed to fetch user bonuses" });
    }
  });

  // Dashboard filtering by status
  app.get("/api/dashboard/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      // Only return active courses for dashboard
      const activeCourses = courses.filter(course => course.status === 'active');
      res.json(activeCourses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard courses" });
    }
  });

  // Admin course management endpoints
  app.get("/api/admin/courses", async (req, res) => {
    try {
      const { status } = req.query;
      let courses = await storage.getCourses();

      if (status) {
        courses = courses.filter(course => course.status === status);
      }

      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin courses" });
    }
  });

  // Add channels alias for admin panel
  app.get("/api/admin/channels", async (req, res) => {
    try {
      const { status } = req.query;
      let courses = await storage.getCourses();

      if (status) {
        courses = courses.filter(course => course.status === status);
      }

      console.log(`Admin channels found: ${courses.length}`);
      res.json(courses);
    } catch (error) {
      console.error('Error fetching admin channels:', error);
      res.status(500).json({ error: "Failed to fetch admin channels" });
    }
  });

  app.get("/api/admin/courses/pending", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      const pendingCourses = courses.filter(course => course.status === 'pending' || course.status === 'pending_review');
      res.json(pendingCourses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending courses" });
    }
  });

  // Add channels/pending alias for admin panel
  app.get("/api/admin/channels/pending", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      console.log(`Total courses found: ${courses.length}`);
      const pendingCourses = courses.filter(course => {
        console.log(`Course ${course.id}: status=${course.status}, approvalStatus=${course.approvalStatus}`);
        return course.status === 'pending' && course.approvalStatus === 'pending';
      });
      console.log(`Pending courses filtered: ${pendingCourses.length}`);
      res.json(pendingCourses);
    } catch (error) {
      console.error('Error fetching pending channels:', error);
      res.status(500).json({ error: "Failed to fetch pending channels" });
    }
  });

  app.delete("/api/courses/:courseId", async (req, res) => {
    try {
      const { courseId } = req.params;
      await storage.deleteCourse(courseId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  app.put("/api/courses/:courseId/block", async (req, res) => {
    try {
      const { courseId } = req.params;
      const { reason } = req.body;

      const updatedCourse = await storage.updateCourse(courseId, {
        blocked: true,
        blockReason: reason,
        blockedAt: new Date().toISOString(),
        blockedBy: 'admin'
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to block course" });
    }
  });

  app.put("/api/courses/:courseId/unblock", async (req, res) => {
    try {
      const { courseId } = req.params;

      const updatedCourse = await storage.updateCourse(courseId, {
        blocked: false,
        blockReason: null,
        blockedAt: null,
        blockedBy: null
      });
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ error: "Failed to unblock course" });
    }
  });

  // ================================
  // WITHDRAWAL MANAGEMENT ENDPOINTS
  // ================================
  
  // Create withdrawal request
  app.post("/api/withdrawals", async (req, res) => {
    try {
      const withdrawalData = {
        ...req.body,
        status: 'pending',
        createdAt: new Date()
      };
      
      const withdrawal = await storage.createWithdrawalRequest(withdrawalData);
      res.json(withdrawal);
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      res.status(500).json({ error: "Failed to create withdrawal request" });
    }
  });

  // Get user's withdrawal history
  app.get("/api/users/:userId/withdrawals", async (req, res) => {
    try {
      const { userId } = req.params;
      const withdrawals = await storage.getUserWithdrawals(parseInt(userId));
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching user withdrawals:", error);
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  // Get all withdrawal requests (Admin)
  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching all withdrawals:", error);
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  // Approve withdrawal request (Admin)
  app.put("/api/admin/withdrawals/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { transactionId, adminNotes } = req.body;
      
      const withdrawal = await storage.approveWithdrawal(parseInt(id), {
        transactionId,
        adminNotes,
        processedBy: 'admin',
        processedAt: new Date()
      });
      
      res.json(withdrawal);
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      res.status(500).json({ error: "Failed to approve withdrawal" });
    }
  });

  // Reject withdrawal request (Admin)
  app.put("/api/admin/withdrawals/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;
      
      const withdrawal = await storage.rejectWithdrawal(parseInt(id), {
        adminNotes,
        processedBy: 'admin',
        processedAt: new Date()
      });
      
      res.json(withdrawal);
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      res.status(500).json({ error: "Failed to reject withdrawal" });
    }
  });

  // ================================
  // USER BONUS MANAGEMENT ENDPOINTS
  // ================================
  
  // Give user bonus (Admin)
  app.post("/api/admin/users/:userId/bonus", async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, reason, adminName } = req.body;
      
      // Create bonus record
      const bonus = await storage.createUserBonus({
        userId: parseInt(userId),
        amount,
        reason,
        adminId: 'super_admin',
        adminName: adminName || 'Super Admin',
        type: 'admin_bonus'
      });
      
      // Update user wallet balance
      await storage.updateUserWallet(parseInt(userId), amount);
      
      res.json({ success: true, bonus });
    } catch (error) {
      console.error("Error giving user bonus:", error);
      res.status(500).json({ error: "Failed to give bonus" });
    }
  });

  // Get user bonus history
  app.get("/api/users/:userId/bonuses", async (req, res) => {
    try {
      const { userId } = req.params;
      const bonuses = await storage.getUserBonuses(parseInt(userId));
      res.json(bonuses);
    } catch (error) {
      console.error("Error fetching user bonuses:", error);
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });

  // Get all bonuses (Admin)
  app.get("/api/admin/bonuses", async (req, res) => {
    try {
      const bonuses = await storage.getAllBonuses();
      res.json(bonuses);
    } catch (error) {
      console.error("Error fetching all bonuses:", error);
      res.status(500).json({ error: "Failed to fetch bonuses" });
    }
  });

  // ================================
  // USER CHANNEL MANAGEMENT ENDPOINTS
  // ================================
  
  // Get user's channels (My Channels section)
  app.get("/api/users/:userId/channels", async (req, res) => {
    try {
      const { userId } = req.params;
      const channels = await storage.getUserCourses(userId);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching user channels:", error);
      res.status(500).json({ error: "Failed to fetch user channels" });
    }
  });

  // Update user's channel (Limited editing)
  app.put("/api/users/:userId/channels/:channelId", async (req, res) => {
    try {
      const { userId, channelId } = req.params;
      const { title, description, price, thumbnail } = req.body;
      
      // Verify channel belongs to user
      const channel = await storage.getCourseById(channelId);
      if (!channel || channel.sellerId !== parseInt(userId)) {
        return res.status(403).json({ error: "Unauthorized to edit this channel" });
      }
      
      // Only allow limited fields to be edited
      const allowedUpdates = {
        title,
        description, 
        price,
        thumbnail
      };
      
      // Filter out undefined values
      const updates = Object.fromEntries(
        Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
      );
      
      const updatedChannel = await storage.updateCourse(channelId, updates);
      res.json(updatedChannel);
    } catch (error) {
      console.error("Error updating user channel:", error);
      res.status(500).json({ error: "Failed to update channel" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}