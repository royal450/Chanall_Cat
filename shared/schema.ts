import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  location: text("location").default("India"),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"),
  walletBalance: integer("wallet_balance").default(0),
  totalEarnings: integer("total_earnings").default(0),
  totalReferrals: integer("total_referrals").default(0),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const channels = pgTable("channels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  fakePrice: integer("fake_price"),
  discount: integer("discount").default(0),
  category: text("category").notNull(),
  thumbnail: text("thumbnail"),
  seller: text("seller"),
  sellerId: integer("seller_id").references(() => users.id),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  sales: integer("sales").default(0),
  blocked: boolean("blocked").default(false),
  blockReason: text("block_reason"),
  commission: integer("commission").default(30),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  approvalStatus: text("approval_status").default("pending"), // 'pending' | 'approved' | 'rejected'
  rejectionReason: text("rejection_reason"),
  followerCount: integer("follower_count").default(0),
  engagementRate: real("engagement_rate").default(0),
  verificationStatus: text("verification_status").default("unverified"), // 'verified' | 'unverified' | 'pending'
  platform: text("platform").notNull(), // 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'twitter' | 'linkedin' | 'telegram'
  serviceType: text("service_type"), // 'youtube', 'instagram', 'facebook', 'telegram', 'reels', 'video', 'tools', 'other'
  reputation: text("reputation").default("new"), // 'new', '1_strike', '2_strikes', '3_strikes'
  monetizationStatus: text("monetization_status").default("non_monetized"), // 'monetized', 'non_monetized'
  createdAt: timestamp("created_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: text("rejected_by"),
  blockedAt: timestamp("blocked_at"),
  blockedBy: text("blocked_by"),
  soldOut: boolean("sold_out").default(false),
  soldOutAt: timestamp("sold_out_at"),
  bonusBadge: boolean("bonus_badge").default(false),
  badgeType: text("badge_type"),
  badgeText: text("badge_text"),
  badgeAddedAt: timestamp("badge_added_at"),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  channelId: integer("channel_id").references(() => channels.id),
  amount: integer("amount").notNull(),
  paymentType: text("payment_type").notNull(), // 'indian' | 'international'
  transactionId: text("transaction_id"),
  status: text("status").default("pending"), // 'pending' | 'verified' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  channelTitle: text("channel_title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  fakePrice: integer("fake_price"),
  category: text("category").notNull(),
  sellerName: text("seller_name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  signups: integer("signups").default(0),
  sales: integer("sales").default(0),
  traffic: integer("traffic").default(0),
  revenue: integer("revenue").default(0),
});

export const referralBonuses = pgTable("referral_bonuses", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").references(() => users.id),
  referredId: integer("referred_id").references(() => users.id),
  bonusAmount: integer("bonus_amount").default(10),
  status: text("status").default("pending"), // 'pending' | 'paid' | 'failed'
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: integer("amount").notNull(),
  method: text("method").notNull(), // 'bank' | 'upi' | 'paytm'
  accountDetails: text("account_details").notNull(),
  bankName: text("bank_name"),
  ifscCode: text("ifsc_code"),
  accountNumber: text("account_number"),
  accountHolderName: text("account_holder_name"),
  status: text("status").default("pending"), // 'pending' | 'approved' | 'rejected' | 'completed'
  adminNotes: text("admin_notes"),
  transactionId: text("transaction_id"),
  processedAt: timestamp("processed_at"),
  processedBy: text("processed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBonuses = pgTable("user_bonuses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  type: text("type").default("admin_bonus"), // 'admin_bonus' | 'referral_bonus' | 'achievement_bonus'
  adminId: text("admin_id"),
  adminName: text("admin_name"),
  status: text("status").default("completed"), // 'completed' | 'pending' | 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  likes: true,
  comments: true,
  sales: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertReferralBonusSchema = createInsertSchema(referralBonuses).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  status: true,
  processedAt: true,
  processedBy: true,
  createdAt: true,
});

export const insertUserBonusSchema = createInsertSchema(userBonuses).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type ReferralBonus = typeof referralBonuses.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type UserBonus = typeof userBonuses.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type InsertReferralBonus = z.infer<typeof insertReferralBonusSchema>;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type InsertUserBonus = z.infer<typeof insertUserBonusSchema>;

// For backward compatibility (to be removed after full migration)
export const courses = channels;
export const insertCourseSchema = insertChannelSchema;
export const insertPromotionSchema = insertListingSchema;
export type Course = Channel;
export type Promotion = Listing;
export type InsertCourse = InsertChannel;
export type InsertPromotion = InsertListing;

// Admin stats interface
export interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  approvedCourses: number;
  pendingCourses: number;
  rejectedCourses: number;
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
}
