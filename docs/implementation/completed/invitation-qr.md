# QR Code Invitation - Implementation

This document describes the QR code-based partner connection feature in Gratitude Bee.

## Overview

The QR code feature provides an alternative to manual invite code entry for connecting partners. Users can display their QR code and scan their partner's code using their phone's native camera app.

## Implementation

### Components

1. **QRCodeModal** (`/components/QRCodeModal.tsx`)
   - Displays user's invite code as a QR code
   - Uses `react-native-qrcode-svg` library
   - Shows invite code below QR for manual entry fallback
   - Includes share functionality

2. **QRScannerModal** (`/components/QRScannerModal.tsx`)
   - Instructs users to use their phone's native camera
   - No in-app camera functionality
   - Provides step-by-step instructions
   - Users scan QR with native camera, then manually enter the code

3. **Partner Link Screen** (`/app/(auth)/partner-link.tsx`)
   - Main screen for partner connection
   - "Show My QR Code" button opens QRCodeModal
   - Manual code entry field for partner's code
   - Displays connection status

### Data Flow

1. **Generating QR Code**:
   - User's invite code is fetched from `users` table
   - QR code contains the plain invite code
   - Code is displayed visually for easy sharing

2. **Connecting Partners**:
   - User enters partner's code manually (after scanning with native camera)
   - Calls Supabase Edge Function `connect-partner`
   - Updates both users' `partner_id` fields
   - Shows success state when connected

### Features

- **No Camera Permissions Required** - Uses phone's native camera app
- **Manual Entry Fallback** - Code visible below QR
- **Share Functionality** - Can share QR image or code text
- **Connection Status** - Shows partner name when connected

### Libraries Used

- `react-native-qrcode-svg` - QR code generation
- Native share API for sharing codes
- No camera libraries or permissions needed