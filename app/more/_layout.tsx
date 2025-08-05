import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="security" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="video-guides" />
      <Stack.Screen name="language" />
      <Stack.Screen name="nudges" />
      <Stack.Screen name="reminders" />
    </Stack>
  );
}