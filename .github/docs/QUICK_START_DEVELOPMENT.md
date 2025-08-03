# Quick Start Development Guide

## Setting up Development Environment

### 1. Add Fastlane to PATH (for iOS builds)
Add this to your ~/.zshrc or ~/.bash_profile:
```bash
export PATH="/Users/sebastjanm/.gem/bin:$PATH"
```

Then reload:
```bash
source ~/.zshrc
```

### 2. Build Options

#### Option A: Cloud Build (Recommended for first time)
```bash
# Build for both platforms
eas build --profile development --platform all

# Or just one platform
eas build --profile development --platform ios
eas build --profile development --platform android
```

#### Option B: Local Android Build (Fastest)
```bash
# Ensure Android Studio is installed
eas build --profile development --platform android --local
```

#### Option C: Simple Local Development (No EAS)
```bash
# iOS (Mac only)
npx expo prebuild --platform ios
npx expo run:ios

# Android
npx expo prebuild --platform android
npx expo run:android
```

### 3. Running the Development Build

After installing the development build:
```bash
# Start dev server
npx expo start --dev-client

# Or with cache clear
npx expo start --dev-client --clear
```

### 4. Testing Deep Links

```bash
# iOS Simulator
npx uri-scheme open "gratitudebee://invite/YOUR_CODE" --ios

# Android
npx uri-scheme open "gratitudebee://invite/YOUR_CODE" --android
```

## Troubleshooting

### Fastlane not found
```bash
# Install Fastlane
gem install fastlane -NV

# Add to PATH
export PATH="/Users/sebastjanm/.gem/bin:$PATH"
```

### Build fails with credentials error
- Use cloud builds: `eas build --profile development --platform ios`
- Or login first: `eas login`

### Metro bundler issues
```bash
# Clear all caches
npx expo start -c
rm -rf node_modules/.cache
```

### iOS Simulator issues
```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

## Next Steps

1. Install the development build on your device/simulator
2. Start the dev server with `npx expo start --dev-client`
3. Connect your device and start developing!

Remember: You only need to rebuild when adding new native dependencies.