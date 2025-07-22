export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  likes?: number;
  comments?: number;
  sales?: number;
  discount?: number;
  fakePrice?: number;
  finalPrice?: number;
  position?: number;
  hoverCount?: number;
  clickCount?: number;
  viewTime?: number;
  rating?: number;
  seller?: string;
  followerCount?: number;
  engagementRate?: number;
  verificationStatus?: string;
  platform?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  earnings?: number;
  popularity?: number;
  transferRate?: number;
  shares?: number;
  serviceType?: string;
  deliveryTime?: string;
  bundleContent?: string[];
  views?: number;
  blocked?: boolean;
  blockReason?: string;
  commission?: number;
  approvalStatus?: string;
  rejectionReason?: string;
  sellerId?: number;
  approvedAt?: string;
  approvedBy?: string;
}

export interface UserStats {
  wallet: number;
  totalSales: number;
  purchasedServices: number;
  todayEarnings: number;
  totalUsers: number;
  visitsToday: number;
}

export interface AdminStats {
  signupsToday: number;
  salesToday: number;
  trafficToday: number;
  monthlySales: number;
  organicTraffic: number;
  referralTraffic: number;
}

// Backward compatibility
export interface Channel extends Service {}
export interface Course extends Service {}
export type { Service as Channel };
export type { Service as Course };