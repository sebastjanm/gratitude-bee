# QR Code Invitation - Implementation

This document describes the QR code-based partner connection feature in Gratitude Bee.

## Overview

The QR code feature provides an easy way for partners to connect. Users can display their QR code and use deep links to connect automatically when scanned.

## Implementation

### Components

1. **QRCodeModal** (`/components/QRCodeModal.tsx`)
   - Displays user's invite code as a QR code
   - Uses `react-native-qrcode-svg` library
   - QR code contains deep link: `https://gratitudebee.app/invite/{code}`
   - Shows invite code below QR for manual entry fallback
   - Includes share functionality for both QR image and text link

2. **QRScannerModal** (`/components/QRScannerModal.tsx`)
   - Currently **commented out** in partner-link.tsx
   - Instructs users to use their phone's native camera
   - No in-app camera functionality implemented
   - Would provide step-by-step instructions if enabled

3. **Partner Link Screen** (`/app/(auth)/partner-link.tsx`)
   - Main screen for partner connection during onboarding
   - Shows "Connected!" state if already connected
   - Two connection methods:
     - "Show My QR Code" button opens QRCodeModal
     - Manual code entry field with "Connect" button
   - "I'll do this later" skip option
   - Shows loading state while fetching profile

4. **Invite Route** (`/app/invite/[code].tsx`)
   - Dynamic route that handles deep links
   - If logged in: Automatically connects partners
   - If not logged in: Stores code in AsyncStorage and redirects to auth
   - Shows processing indicator while connecting

### Data Flow

1. **Generating QR Code**:
   - User's 8-character invite code is fetched from `users` table
   - QR code contains deep link URL: `https://gratitudebee.app/invite/{code}`
   - Invite link is shareable via native share sheet

2. **Connecting via QR/Deep Link**:
   - Partner scans QR with native camera app
   - Deep link opens app at `/invite/[code]`
   - If logged in: Calls `connect-partner` Edge Function immediately
   - If not: Stores code for connection after authentication
   - Shows success alert with partner name when connected

3. **Manual Connection**:
   - User types partner's code in text field
   - Calls `connect-partner` Edge Function
   - Updates both users' `partner_id` fields
   - Shows success state with both names

### Current State

- **QR Code Generation**: ✅ Fully implemented
- **Deep Link Handling**: ✅ Fully implemented
- **Manual Code Entry**: ✅ Fully implemented
- **QR Scanner Modal**: ❌ Commented out (not in use)
- **Connection Status**: ✅ Shows partner names when connected

### Libraries Used

- `react-native-qrcode-svg` - QR code generation
- `expo-router` - Deep link routing
- `@react-native-async-storage/async-storage` - Storing invite codes
- Native share API for sharing codes
- No camera libraries or permissions needed