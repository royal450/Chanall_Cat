# Course Platform

## Overview

This is a comprehensive full-stack course selling platform built with React + Vite + TailwindCSS and Firebase backend. The application features advanced user authentication, dual payment systems for Indian and international customers, course promotion capabilities, and a secure admin panel for course management.

## User Preferences

```
Preferred communication style: Simple, everyday language.
Platform type: Advanced course selling website with colorful, professional design
Target features: Complete authentication flow, dual payment processing, promotion system, admin panel
```

## Recent Changes (January 15, 2025)

✓ Successfully migrated project from Replit Agent to Replit environment
✓ Completely redesigned dashboard with modern, attractive UI and animations
✓ Created comprehensive admin panel with full tracking, analytics, and course management
✓ Implemented advanced course upload system with real-time sync to dashboard
✓ Made payment page 100% mobile-friendly with full-width responsive design
✓ Added modern gradient designs, animations, and professional styling
✓ Enhanced user experience with intuitive navigation and visual feedback
✓ Maintained all existing functionality while improving design and responsiveness
✓ Redesigned stats cards to compact counter boxes for better space utilization
✓ Added Success Stories and Features sections to make dashboard longer and more attractive
✓ Implemented auto-redirect feature: authenticated users go directly to dashboard, unauthenticated users to login
✓ **NEW**: Fixed referral system with hash URL detection (/#/inviteCode=XDRY57YG6)
✓ **NEW**: Made referral codes read-only when auto-filled from links
✓ **NEW**: Added withdrawal security to prevent unlimited withdrawals with balance verification
✓ **NEW**: Implemented real-time earnings tracking and Firebase data synchronization
✓ **NEW**: Created Firebase deployment configuration for instant hosting
✓ **NEW**: Added deployment scripts for super easy Firebase hosting (just 2 commands!)
✓ **NEW**: Added complete SEO optimization with Open Graph tags, Twitter cards, and meta descriptions
✓ **NEW**: Implemented proper website sharing with preview images for WhatsApp, Facebook, etc.
✓ **NEW**: Verified referral system is fully working with real commission tracking and instant payments
✓ **NEW**: Confirmed admin panel shows real data for users, courses, referrals, and earnings
✓ **NEW**: Enhanced referral system with auto-detection and loading animations
✓ **NEW**: Added comprehensive course creation system for users
✓ **NEW**: Implemented user course management dashboard
✓ **NEW**: Added 30% platform commission model with terms and conditions
✓ **NEW**: Created PostgreSQL database integration for better data management
✓ **NEW**: Added real-time course blocking system for admin control
✓ **NEW**: Merged promotion and referral routes with unified profile page
✓ **NEW**: Changed promotion route to course creation route throughout application
✓ **NEW**: Standardized URL format to proper domain (https://coursemarket.web.app/signup?ref=CODE)
✓ **NEW**: Added complete crash prevention across all pages with zero tolerance for application crashes
✓ **NEW**: Enhanced profile page with tabs for profile, referral system, courses, and wallet management
✓ **NEW**: Implemented proper error handling with fallback systems for all user interactions
✓ **NEW**: Added default category-based images for course creation when users don't upload images
✓ **NEW**: Fixed price display to show original price only, added fake views (100K-1M) for marketing
✓ **NEW**: Added comprehensive form validation and crash prevention across all pages
✓ **NEW**: Production-ready system with complete error handling and user feedback
✓ **NEW**: Removed unused files and optimized codebase for production deployment
✓ **NEW**: Fixed course approval system - courses only appear on dashboard after admin approval
✓ **NEW**: Enhanced referral system with real-time hash URL detection and instant bonus payments  
✓ **NEW**: Created professional profile page with full referral, course, and wallet management
✓ **NEW**: Implemented automatic referral detection with Firebase real-time listeners
✓ **NEW**: Added course rejection system with detailed reasons for user feedback
✓ **NEW**: Integrated PostgreSQL database schema with proper approval workflow
✓ **NEW**: Successfully migrated from Replit Agent to Replit environment
✓ **NEW**: Fixed approval system to use backend API instead of Firebase conflicts
✓ **NEW**: Rebuilt admin panel with proper course approval/rejection workflows
✓ **NEW**: Updated dashboard to display approved courses from backend API
✓ **NEW**: Added QueryClient provider for React Query integration
✓ **NEW**: Separated frontend and backend concerns for better security
✓ **NEW**: Created comprehensive channel promotion platform with all requested features
✓ **NEW**: Built Full-Featured Admin Panel with complex password (SuperAdmin@2025#ChannelMarket$Pro)
✓ **NEW**: Added Enhanced Channel Submission page with 20+ categories and auto-thumbnail
✓ **NEW**: Implemented real-time referral system with ₹10 instant bonus
✓ **NEW**: Created withdrawal system with animated success page
✓ **NEW**: Added comprehensive admin controls: block/unblock, badge system, sold-out injection
✓ **NEW**: Integrated reputation system with strikes and trusted levels
✓ **NEW**: Added automatic marketing price generation and category-based thumbnails
✓ **NEW**: Migrated successfully to Replit environment with production-ready Firebase integration
✓ **NEW**: Created comprehensive Firebase realtime database system with onValue listeners
✓ **NEW**: Added production-ready realtime data sync for all features (services, users, referrals, payments)
✓ **NEW**: Enhanced Channel Market with full Firebase integration and crash prevention
✓ **NEW**: Optimized all pages with proper error handling and realtime Firebase listeners

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and build processes
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state, React Context for auth
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-based session store
- **API Pattern**: RESTful API with `/api` prefix
- **Development**: Hot reload with Vite integration

### Authentication System
- **Provider**: Firebase Authentication
- **Features**: Email/password authentication, user profiles with display names and photos
- **State Management**: React Context with Firebase auth state persistence
- **Route Protection**: Protected and public route wrappers

## Key Components

### Database Schema
- **Users**: Basic user information (email, display name, photo URL)
- **Courses**: Course catalog with pricing, categories, engagement metrics
- **Payments**: Transaction tracking for Indian and international payments
- **Promotions**: Course promotion requests with approval workflow

### Course Management
- **Course Display**: Grid layout with thumbnail images, pricing, and engagement metrics
- **Interaction Tracking**: Like and comment functionality with real-time updates
- **Categories**: Organized course categories (YouTube Growth, Instagram Growth, Marketing, etc.)
- **Pricing**: Support for discounts and promotional pricing

### Payment System
- **Dual Payment Flow**: Separate workflows for Indian (UTR-based) and international (transaction ID-based) payments
- **Payment Verification**: Manual verification system with status tracking
- **Regional Detection**: Automatic payment method suggestion based on user region

### Admin Dashboard
- **Password Protection**: Simple password-based admin access
- **Analytics**: User signups, sales tracking, traffic monitoring
- **Course Management**: CRUD operations for course catalog
- **Payment Oversight**: Payment verification and management tools

## Data Flow

1. **User Registration/Login**: Firebase handles authentication, user data synced to local database
2. **Course Browsing**: Courses loaded from database via API, displayed with real-time interaction data
3. **Course Purchase**: Users select payment method, submit payment details, admin verifies transactions
4. **Course Promotion**: Content creators submit promotion requests, admin reviews and approves
5. **Admin Operations**: Protected admin interface for managing all aspects of the platform

## External Dependencies

### Firebase Services
- **Authentication**: User management and session handling
- **Realtime Database**: Course data storage and real-time updates
- **Storage**: File uploads for course thumbnails and user avatars

### Database
- **Neon Database**: Serverless PostgreSQL for production data
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection Pooling**: Built-in connection management for serverless environments

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library for UI elements
- **React Icons**: Additional icon sets for social media and payment providers

### Payment Integration
- **Manual Verification**: WhatsApp-based payment confirmation workflow
- **Multi-Currency**: Support for Indian Rupees and international payments
- **Payment Providers**: Integration placeholder for PayPal, Payeer, and cryptocurrency

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend integration
- **Hot Reload**: Full-stack hot reload with Vite middleware
- **Environment Variables**: Firebase configuration and database credentials

### Production Build
- **Frontend**: Vite builds React app to static files
- **Backend**: esbuild bundles Express server for Node.js deployment
- **Static Serving**: Express serves built frontend files in production
- **Database Migrations**: Drizzle Kit handles schema migrations

### Hosting Requirements
- **Node.js Environment**: For Express server execution
- **PostgreSQL Database**: Neon Database or compatible PostgreSQL instance
- **Environment Variables**: Firebase config, database URL, session secrets
- **File Storage**: Optional CDN integration for course thumbnails

### Security Considerations
- **Authentication**: Firebase handles secure user authentication
- **Session Management**: Secure session storage with PostgreSQL
- **Admin Access**: Password-protected admin routes
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Zod schemas for all user inputs