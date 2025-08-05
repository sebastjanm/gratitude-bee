import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="security" options={{ title: 'Change Password' }} />
      <Stack.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Stack.Screen name="faq" options={{ title: 'FAQ' }} />
      <Stack.Screen name="video-guides" options={{ title: 'Video Guides' }} />
      <Stack.Screen name="language" options={{ title: 'Language Settings' }} />
      <Stack.Screen name="nudges" options={{ title: 'Nudge Settings' }} />
      <Stack.Screen name="reminders" options={{ title: 'Daily Reminders' }} />
      <Stack.Screen name="help" options={{ title: 'Help' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms & Conditions' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="impressum" options={{ title: 'Impressum' }} />
    </Stack>
  );
}