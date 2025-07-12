import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/providers/SessionProvider';
import { Text } from 'react-native';

export default function AuthLayout() {
  const { session, loading } = useSession();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

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