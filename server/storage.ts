import { users, channels, payments, referralBonuses, withdrawalRequests, userBonuses, type User, type InsertUser, type Channel, type InsertChannel, type Payment, type InsertPayment, type ReferralBonus, type WithdrawalRequest, type InsertWithdrawalRequest, type UserBonus, type InsertUserBonus } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(userId: number, amount: number): Promise<void>;
  getUsers(): Promise<User[]>;
  updateUser(userId: string, updates: any): Promise<User>;

  // Course/Channel methods
  getCourses(): Promise<Channel[]>;
  getUserCourses(userId: string): Promise<Channel[]>;
  createCourse(course: any): Promise<Channel>;
  updateCourse(courseId: string, updates: any): Promise<Channel>;
  deleteCourse(courseId: string): Promise<void>;
  getCourseById(courseId: string): Promise<Channel | undefined>;

  // Payment methods
  createPayment(payment: any): Promise<Payment>;

  // Referral methods
  trackReferral(referrerId: number, referredId: number): Promise<void>;
  getReferralByBuyer(buyerId: number): Promise<ReferralBonus | undefined>;

  // Withdrawal methods
  getWithdrawals(): Promise<WithdrawalRequest[]>;
  updateWithdrawal(withdrawalId: string, updates: any): Promise<WithdrawalRequest>;
  createWithdrawalRequest(withdrawal: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getUserWithdrawals(userId: number): Promise<WithdrawalRequest[]>;
  getAllWithdrawals(): Promise<WithdrawalRequest[]>;
  approveWithdrawal(withdrawalId: number, data: any): Promise<WithdrawalRequest>;
  rejectWithdrawal(withdrawalId: number, data: any): Promise<WithdrawalRequest>;

  // Bonus methods
  createUserBonus(bonus: InsertUserBonus): Promise<UserBonus>;
  getUserBonuses(userId: number): Promise<UserBonus[]>;
  getAllBonuses(): Promise<UserBonus[]>;

  // User methods
  getUserById(userId: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserWallet(userId: number, amount: number): Promise<void>;

  // Admin methods
  getAdminStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<string, Channel>;
  private payments: Map<number, Payment>;
  private referrals: Map<number, ReferralBonus>;
  private withdrawals: Map<number, WithdrawalRequest>;
  private bonuses: Map<number, UserBonus>;
  currentUserId: number;
  currentCourseId: number;
  currentPaymentId: number;
  currentReferralId: number;
  currentWithdrawalId: number;
  currentBonusId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.payments = new Map();
    this.referrals = new Map();
    this.withdrawals = new Map();
    this.bonuses = new Map();
    this.currentUserId = 1;
    this.currentCourseId = 1;
    this.currentPaymentId = 1;
    this.currentReferralId = 1;
    this.currentWithdrawalId = 1;
    this.currentBonusId = 1;

    // Add some sample data for testing
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample real users
    const sampleUsers: User[] = [
      {
        id: 1,
        email: "admin@channelmarket.com",
        displayName: "Super Admin",
        photoURL: null,
        location: "India",
        referralCode: "ADMIN123",
        referredBy: null,
        walletBalance: 5000,
        totalEarnings: 15000,
        totalReferrals: 25,
        isActive: true,
        lastActiveAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 2,
        email: "rahul.kumar@gmail.com",
        displayName: "Rahul Kumar",
        photoURL: null,
        location: "Delhi, India",
        referralCode: "RK2024",
        referredBy: null,
        walletBalance: 1500,
        totalEarnings: 3200,
        totalReferrals: 8,
        isActive: true,
        lastActiveAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 3,
        email: "priya.sharma@gmail.com",
        displayName: "Priya Sharma",
        photoURL: null,
        location: "Mumbai, India",
        referralCode: "PRIYA001",
        referredBy: 1,
        walletBalance: 2300,
        totalEarnings: 4500,
        totalReferrals: 12,
        isActive: true,
        lastActiveAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 4,
        email: "ankit.verma@outlook.com",
        displayName: "Ankit Verma",
        photoURL: null,
        location: "Bangalore, India",
        referralCode: "ANKIT99",
        referredBy: 2,
        walletBalance: 850,
        totalEarnings: 1200,
        totalReferrals: 5,
        isActive: true,
        lastActiveAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 5,
        email: "neha.singh@yahoo.com",
        displayName: "Neha Singh",
        photoURL: null,
        location: "Pune, India",
        referralCode: "NEHA456",
        referredBy: 1,
        walletBalance: 3200,
        totalEarnings: 7800,
        totalReferrals: 18,
        isActive: true,
        lastActiveAt: new Date(),
        createdAt: new Date()
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
    this.currentUserId = 6;

    // Add sample services for testing
    const sampleServices: Channel[] = [
      {
        id: 1,
        title: "Monetized YouTube Channel - Tech Reviews",
        description: "Established tech review channel with 250K subscribers, monetized, verified, and earning $2K/month",
        price: 45000,
        fakePrice: 75000,
        discount: 40,
        category: "youtube",
        thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=300&fit=crop",
        seller: "TechChannelPro",
        sellerId: 1,
        likes: 125,
        comments: 28,
        sales: 0,
        blocked: false,
        blockReason: null,
        commission: 30,
        status: "active",
        approvalStatus: "approved",
        rejectionReason: null,
        followerCount: 250000,
        engagementRate: 8.5,
        verificationStatus: "verified",
        platform: "youtube",
        serviceType: "youtube",
        reputation: "new",
        monetizationStatus: "monetized",
        createdAt: new Date(),
        approvedAt: new Date(),
        approvedBy: "admin",
        rejectedAt: null,
        rejectedBy: null,
        blockedAt: null,
        blockedBy: null,
        soldOut: false,
        soldOutAt: null,
        bonusBadge: false,
        badgeType: null,
        badgeText: null,
        badgeAddedAt: null,
        badgeAddedBy: null
      },
      {
        id: 2,
        title: "Instagram Profile - Fashion & Lifestyle",
        description: "Instagram account with 150K followers, high engagement, perfect for fashion brands",
        price: 25000,
        fakePrice: 40000,
        discount: 37,
        category: "instagram",
        thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop",
        seller: "SocialGrowth",
        sellerId: 2,
        likes: 89,
        comments: 15,
        sales: 0,
        blocked: false,
        blockReason: null,
        commission: 30,
        status: "active",
        approvalStatus: "approved",
        rejectionReason: null,
        followerCount: 150000,
        engagementRate: 6.2,
        verificationStatus: "verified",
        platform: "instagram",
        serviceType: "instagram", 
        reputation: "new",
        monetizationStatus: "non_monetized",
        createdAt: new Date(),
        approvedAt: new Date(),
        approvedBy: "admin",
        rejectedAt: null,
        rejectedBy: null,
        blockedAt: null,
        blockedBy: null,
        soldOut: false,
        soldOutAt: null,
        bonusBadge: false,
        badgeType: null,
        badgeText: null,
        badgeAddedAt: null,
        badgeAddedBy: null
      },
      {
        id: 3,
        title: "Discord Server Bundle - Gaming Community",
        description: "Active gaming Discord server with 50K members, multiple channels, bots configured",
        price: 15000,
        fakePrice: 25000,
        discount: 40,
        category: "discord",
        thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
        seller: "GameMaster",
        sellerId: 3,
        likes: 67,
        comments: 12,
        sales: 0,
        blocked: false,
        blockReason: null,
        commission: 30,
        status: "active",
        approvalStatus: "approved",
        rejectionReason: null,
        followerCount: 50000,
        engagementRate: 15.0,
        verificationStatus: "verified",
        platform: "discord",
        serviceType: "other",
        reputation: "new", 
        monetizationStatus: "non_monetized",
        createdAt: new Date(),
        approvedAt: new Date(),
        approvedBy: "admin",
        rejectedAt: null,
        rejectedBy: null,
        blockedAt: null,
        blockedBy: null,
        soldOut: false,
        soldOutAt: null,
        bonusBadge: false,
        badgeType: null,
        badgeText: null,
        badgeAddedAt: null,
        badgeAddedBy: null
      }
    ];

    sampleServices.forEach(service => {
      this.courses.set(service.id.toString(), service);
    });
    this.currentCourseId = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id, 
      email: insertUser.email,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null,
      location: insertUser.location ?? null,
      referralCode: insertUser.referralCode ?? null,
      referredBy: insertUser.referredBy ?? null,
      walletBalance: insertUser.walletBalance ?? 0,
      totalEarnings: 0,
      totalReferrals: 0,
      isActive: true,
      lastActiveAt: new Date(),
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === code,
    );
  }

  async updateUserWallet(userId: number, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + amount;
      user.totalEarnings = (user.totalEarnings || 0) + amount;
      this.users.set(userId, user);
    }
  }

  // Course/Channel methods
  async getCourses(): Promise<Channel[]> {
    return Array.from(this.courses.values());
  }

  async getUserCourses(userId: string): Promise<Channel[]> {
    return Array.from(this.courses.values()).filter(
      (course) => course.sellerId?.toString() === userId,
    );
  }

  async createCourse(courseData: any): Promise<Channel> {
    const id = this.currentCourseId++;
    const course: Channel = {
      id,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      fakePrice: courseData.fakePrice || null,
      discount: courseData.discount || 0,
      category: courseData.category,
      thumbnail: courseData.thumbnail || null,
      seller: courseData.seller || null,
      sellerId: courseData.sellerId || null,
      likes: courseData.likes || 0,
      comments: courseData.comments || 0,
      sales: courseData.sales || 0,
      blocked: false,
      blockReason: null,
      commission: 30,
      status: courseData.status || "pending",
      approvalStatus: courseData.approvalStatus || "pending",
      rejectionReason: null,
      followerCount: courseData.followerCount || 0,
      engagementRate: courseData.engagementRate || 0,
      verificationStatus: "unverified",
      platform: courseData.platform || "youtube",
      serviceType: courseData.serviceType || "youtube",
      reputation: courseData.reputation || "new",
      monetizationStatus: courseData.monetizationStatus || "non_monetized",
      createdAt: new Date(),
      approvedAt: null,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      blockedAt: null,
      blockedBy: null,
      soldOut: false,
      soldOutAt: null,
      bonusBadge: false,
      badgeType: null,
      badgeText: null,
      badgeAddedAt: null,
      badgeAddedBy: null
    };
    this.courses.set(id.toString(), course);
    return course;
  }

  async updateCourse(courseId: string, updates: any): Promise<Channel> {
    // Handle both string and numeric IDs
    const course = this.courses.get(courseId) || this.courses.get(parseInt(courseId).toString());
    if (!course) {
      console.log(`Course not found with ID: ${courseId}`);
      console.log('Available courses:', Array.from(this.courses.keys()));
      throw new Error("Course not found");
    }

    const updated = { ...course, ...updates };
    this.courses.set(courseId, updated);
    return updated;
  }

  async deleteCourse(courseId: string): Promise<void> {
    this.courses.delete(courseId);
  }

  // Users management methods
  async getUsers(): Promise<User[]> {
    // Always return real users from storage
    return Array.from(this.users.values());
  }

  // Alias method for getRealUsers
  async getRealUsers(): Promise<User[]> {
    return this.getUsers();
  }

  async updateUser(userId: string, updates: any): Promise<User> {
    const user = this.users.get(parseInt(userId));
    if (!user) {
      throw new Error("User not found");
    }

    const updated = { ...user, ...updates };
    this.users.set(parseInt(userId), updated);
    return updated;
  }

  // Withdrawal methods
  async getWithdrawals(): Promise<any[]> {
    // Mock withdrawal data - in real implementation, this would come from database
    return [
      {
        id: "1",
        userId: "1",
        userName: "John Doe",
        amount: 500,
        method: "UPI",
        accountDetails: "john@paytm",
        status: "pending",
        createdAt: new Date().toISOString()
      }
    ];
  }

  async updateWithdrawal(withdrawalId: string, updates: any): Promise<any> {
    // Mock implementation - in real app, this would update database
    return { success: true, withdrawalId, updates };
  }

  // Payment methods
  async createPayment(paymentData: any): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = {
      id,
      userId: paymentData.userId,
      channelId: paymentData.courseId,
      amount: paymentData.amount,
      paymentType: paymentData.paymentMethod,
      transactionId: paymentData.transactionId || null,
      status: paymentData.status || "pending",
      createdAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  // Referral methods
  async trackReferral(referrerId: number, referredId: number): Promise<void> {
    const id = this.currentReferralId++;
    const referral: ReferralBonus = {
      id,
      referrerId,
      referredId,
      bonusAmount: 10,
      status: "pending",
      transactionId: null,
      createdAt: new Date()
    };
    this.referrals.set(id, referral);

    // Update referrer's total referrals
    const referrer = this.users.get(referrerId);
    if (referrer) {
      referrer.totalReferrals = (referrer.totalReferrals || 0) + 1;
      this.users.set(referrerId, referrer);
    }
  }

  async getReferralByBuyer(buyerId: number): Promise<ReferralBonus | undefined> {
    return Array.from(this.referrals.values()).find(
      (referral) => referral.referredId === buyerId,
    );
  }

  // Withdrawal methods
  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    return Array.from(this.withdrawals.values());
  }

  async getAllWithdrawals(): Promise<WithdrawalRequest[]> {
    return Array.from(this.withdrawals.values());
  }

  async getUserWithdrawals(userId: number): Promise<WithdrawalRequest[]> {
    return Array.from(this.withdrawals.values()).filter(
      (withdrawal) => withdrawal.userId === userId,
    );
  }

  async createWithdrawalRequest(withdrawalData: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const id = this.currentWithdrawalId++;
    const withdrawal: WithdrawalRequest = {
      id,
      userId: withdrawalData.userId,
      amount: withdrawalData.amount,
      method: withdrawalData.method,
      accountDetails: withdrawalData.accountDetails,
      bankName: withdrawalData.bankName || null,
      ifscCode: withdrawalData.ifscCode || null,
      accountNumber: withdrawalData.accountNumber || null,
      accountHolderName: withdrawalData.accountHolderName || null,
      status: "pending",
      adminNotes: null,
      transactionId: null,
      processedAt: null,
      processedBy: null,
      createdAt: new Date()
    };
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async updateWithdrawal(withdrawalId: string, updates: any): Promise<WithdrawalRequest> {
    const id = parseInt(withdrawalId);
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    const updatedWithdrawal = { ...withdrawal, ...updates };
    this.withdrawals.set(id, updatedWithdrawal);
    return updatedWithdrawal;
  }

  async approveWithdrawal(withdrawalId: number, data: any): Promise<WithdrawalRequest> {
    const withdrawal = this.withdrawals.get(withdrawalId);
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    const updatedWithdrawal = {
      ...withdrawal,
      status: "approved" as const,
      transactionId: data.transactionId,
      adminNotes: data.adminNotes,
      processedBy: data.processedBy,
      processedAt: data.processedAt
    };
    this.withdrawals.set(withdrawalId, updatedWithdrawal);
    return updatedWithdrawal;
  }

  async rejectWithdrawal(withdrawalId: number, data: any): Promise<WithdrawalRequest> {
    const withdrawal = this.withdrawals.get(withdrawalId);
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }

    // Return money to user wallet when withdrawal is rejected
    if (withdrawal.userId) {
      const user = this.users.get(withdrawal.userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + withdrawal.amount;
        this.users.set(withdrawal.userId, user);
      }
    }

    const updatedWithdrawal = {
      ...withdrawal,
      status: "rejected" as const,
      adminNotes: data.adminNotes,
      processedBy: data.processedBy,
      processedAt: data.processedAt
    };
    this.withdrawals.set(withdrawalId, updatedWithdrawal);
    return updatedWithdrawal;
  }

  // Bonus methods
  async createUserBonus(bonusData: InsertUserBonus): Promise<UserBonus> {
    const id = this.currentBonusId++;
    const bonus: UserBonus = {
      id,
      userId: bonusData.userId,
      amount: bonusData.amount,
      reason: bonusData.reason,
      type: bonusData.type || "admin_bonus",
      adminId: bonusData.adminId || null,
      adminName: bonusData.adminName || null,
      status: "completed",
      createdAt: new Date()
    };
    this.bonuses.set(id, bonus);
    return bonus;
  }

  async getUserBonuses(userId: number): Promise<UserBonus[]> {
    return Array.from(this.bonuses.values()).filter(
      (bonus) => bonus.userId === userId,
    );
  }

  async getAllBonuses(): Promise<UserBonus[]> {
    return Array.from(this.bonuses.values());
  }

  // Get course by ID method
  async getCourseById(courseId: string): Promise<Channel | undefined> {
    return this.courses.get(courseId);
  }

  // User management methods
  async getUserById(userId: number): Promise<User | undefined> {
    return this.users.get(userId);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserWallet(userId: number, amount: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + amount;
      user.totalEarnings = (user.totalEarnings || 0) + amount;
      this.users.set(userId, user);
    }
  }

  // Admin methods
  async getAdminStats(): Promise<any> {
    const totalUsers = this.users.size;
    const totalCourses = this.courses.size;
    const activeCourses = Array.from(this.courses.values()).filter(c => c.status === 'active').length;
    const pendingCourses = Array.from(this.courses.values()).filter(c => c.status === 'pending').length;
    const totalPayments = this.payments.size;
    const totalReferrals = this.referrals.size;

    return {
      totalUsers,
      totalCourses,
      approvedCourses: activeCourses,
      pendingCourses,
      rejectedCourses: Array.from(this.courses.values()).filter(c => c.status === 'rejected').length,
      totalSales: totalPayments,
      totalRevenue: Array.from(this.payments.values()).reduce((sum, p) => sum + p.amount, 0),
      avgRating: 4.5
    };
  }
}

export const storage = new MemStorage();