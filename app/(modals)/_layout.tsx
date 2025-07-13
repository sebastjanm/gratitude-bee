import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="appreciation" />
      <Stack.Screen name="favor" />
      <Stack.Screen name="wisdom" />
      <Stack.Screen name="ping" />
      <Stack.Screen name="dont-panic" />
      <Stack.Screen name="hornet" />
    </Stack>
  );
} 