# GratitudeBee Development Build Guide

## Why You Need a Development Build

GratitudeBee requires a custom development build (not Expo Go) because it uses:
- Push notifications (expo-notifications)
- Image picker with camera access
- QR code generation
- Deep linking for partner invites
- Native keyboard handling

## Creating Development Builds

### Prerequisites
1. Install EAS CLI: `npm install -g eas-cli`
2. Login to Expo: `eas login`
3. Configure your project: `eas build:configure`

### Local Development Builds

#### iOS (Mac only)
```bash
# Install iOS dependencies
npx pod-install

# Create development build
npx expo run:ios
```

#### Android
```bash
# Create development build
npx expo run:android
```

### Cloud Development Builds (Recommended)

#### Configure EAS
```bash
# Initialize EAS if not done
eas build:configure
```

#### Build for iOS Simulator
```bash
eas build --profile development-simulator --platform ios
```

#### Build for Android Emulator/Device
```bash
eas build --profile development --platform android
```

#### Build for Physical iOS Device
```bash
# Register your device first
eas device:create

# Then build
eas build --profile development --platform ios
```

## Installing Development Builds

### iOS Simulator
1. Download the build from Expo dashboard
2. Drag and drop the .app file onto the simulator

### Android
1. Download the APK from Expo dashboard
2. Install using: `adb install path/to/app.apk`
3. Or drag and drop onto emulator

### Physical Devices
- iOS: Use TestFlight or ad-hoc distribution
- Android: Download and install APK directly

## Running the App

After installing the development build:

```bash
# Start the development server
npx expo start --dev-client

# Or with cache clear
npx expo start --dev-client --clear
```

## Troubleshooting

### Build Failures
- Check `eas.json` configuration
- Verify all native dependencies are compatible
- Run `npx expo-doctor` before building

### Runtime Issues
- Clear metro cache: `npx expo start -c`
- Reinstall node_modules: `rm -rf node_modules && npm install`
- Clean build folders:
  - iOS: `cd ios && rm -rf Pods Podfile.lock && pod install`
  - Android: `cd android && ./gradlew clean`

### Deep Linking Not Working
- Verify scheme in `app.json`
- Check `expo.scheme` matches your deep link URLs
- Test with: `npx uri-scheme open gratitudebee://invite/CODE --ios`

## When to Rebuild

You need to create a new development build when:
- Adding new native dependencies
- Updating Expo SDK version
- Changing app.json native configuration
- Modifying iOS Info.plist or Android permissions

## Best Practices

1. **Use EAS Update** for JavaScript-only changes
2. **Version your builds** to track native changes
3. **Test on real devices** before production
4. **Keep builds updated** with security patches
5. **Document native changes** in commit messages