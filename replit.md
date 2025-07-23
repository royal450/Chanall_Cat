# Channel Market - Social Media Channel Marketplace

## Project Overview
This is a full-stack JavaScript application that serves as a marketplace for social media channels. Originally a course marketplace, it has been migrated to facilitate buying and selling of social media channels across various platforms like Instagram, YouTube, TikTok, etc.

## Architecture
- **Frontend**: React with Vite, Tailwind CSS, and shadcn/ui components
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **Real-time**: WebSocket integration
- **Storage**: In-memory and database persistence
- **Payments**: Integrated payment processing system

## Recent Changes
- January 23, 2025: Started migration from Replit Agent to standard Replit environment
- July 23, 2025: Migration from Replit Agent to standard Replit environment completed successfully
- Converting from Course Market to Channel Market theme throughout the application
- Adapting all course-related terminology to channel marketplace terminology

## Key Features
- Social media channel listings and browsing
- User authentication and profiles
- Purchase and transfer systems
- Admin panel for platform management
- Real-time notifications
- Referral system
- Withdrawal management
- QR code integration

## User Preferences
- Focus on security and robust client/server separation
- Maintain all existing functionality during migration
- Prioritize data integrity and authentic data sources
- Use modern React patterns and TypeScript
- Prefers Hindi communication for development discussions
- Focus on styling and UI improvements

## Project Status
✓ Migration from Replit Agent environment to standard Replit deployment completed successfully
✓ Application is running and functional with user authentication working
✓ Dashboard UI improvements completed (July 23, 2025):
  - Font sizes increased for better readability
  - Advanced smart search with keyword mapping and price search
  - Cards grouped by service type with clean minimal headers
  - Small cute labels above each card with background & icons (no emojis)
  - Working quick search buttons with visual feedback and icons
  - Real-time search counter and suggestions
  - Service categories updated to match Channel Creation (YouTube, Instagram, TikTok, Telegram, Discord, Reels, Video, Tools, Others)
  - Enhanced card scaling with hover effects and better spacing
  - Larger search bar with improved fonts and visual appeal
  - Search filter buttons now properly working (YouTube, Instagram, TikTok, etc.)
  - All emojis removed from sharing and notifications
  - Custom brand image (https://cdn.jsdelivr.net/gh/royal450/Ai_Video_Gen@main/file_0000000068d8622fb0c9568dfe1b5d55.png) set for:
    - Website favicon (tab icon)
    - Open Graph meta tags (social media sharing)
    - Twitter Card meta tags
    - PWA app icons
  - Production-ready features added:
    - Sticky navigation bar with backdrop blur
    - PWA (Progressive Web App) support with install button
    - Service Worker for offline functionality
    - Advanced SEO meta tags and structured data
    - Bot protection (anti-scraping, dev tools detection)
    - Browser theme color matching website design
  - Clean modern design without excessive animations
→ Production ready for deployment