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
      // Get real users from database, not mock data
      const users = await storage.getUsers();
      console.log(`Real users found: ${users.length}`);
      console.log("Users data:", users.map(u => ({ id: u.id, name: u.displayName, email: u.email })));
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  // User bonus system
  app.post("/api/admin/users/:userId/bonus", async (req, res) => {
    try {
      const { userId } = req.params;
      const { amount, reason } = req.body;

      await storage.updateUserWallet(parseInt(userId), amount);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to give bonus" });
    }
  });

  // User blocking system  
  app.put("/api/admin/users/:userId/block", async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      await storage.updateUser(userId, { 
        isActive: false, 
        blockReason: reason,
        blockedAt: new Date().toISOString() 
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to block user" });
    }
  });

  // Withdrawal management
  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      const withdrawals = await storage.getWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch withdrawals" });
    }
  });

  app.put("/api/admin/withdrawals/:withdrawalId/approve", async (req, res) => {
    try {
      const { withdrawalId } = req.params;
      await storage.updateWithdrawal(withdrawalId, { status: 'approved' });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve withdrawal" });
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

  const httpServer = createServer(app);
  return httpServer;
}