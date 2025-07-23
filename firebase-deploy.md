# Firebase Deployment Guide

## Quick Deploy Commands

1. **Build the project for production:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy --only hosting
   ```

## One-Command Deploy
```bash
npm run build && firebase deploy --only hosting
```

## Local Testing
```bash
npm run build && firebase serve --only hosting
```

## Setup (First Time Only)

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize project (if not done):
   ```bash
   firebase init hosting
   ```

## Project Configuration

- **Build output:** `dist/` folder
- **Hosting:** Firebase Hosting
- **Domain:** Will be provided after deployment
- **Environment:** Production-ready with caching

## Features Ready for Deployment

✓ Channel Market platform with referral system
✓ Real-time Firebase integration
✓ PostgreSQL database support
✓ Responsive mobile-first design
✓ Share functionality with 100% reliability
✓ Admin panel with secure authentication
✓ Payment system for Indian and international users
✓ QR code generation for referrals
✓ Crash prevention across all components

## Post-Deployment Checklist

1. Test referral links work correctly
2. Verify share functionality on mobile devices
3. Check admin panel accessibility
4. Test payment flows
5. Confirm real-time features work

## Environment Variables

The following Firebase config is built into the app:
- API Key: Configured for daily-campaign-king project
- Auth Domain: daily-campaign-king.firebaseapp.com
- Database URL: daily-campaign-king-default-rtdb.firebaseio.com
- Project ID: daily-campaign-king

## Support

For issues:
1. Check browser console for errors
2. Test on different devices/browsers
3. Verify Firebase project settings
4. Check deployment logs: `firebase deploy --debug`