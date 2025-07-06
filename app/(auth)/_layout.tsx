import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="partner-link" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}