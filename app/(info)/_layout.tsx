import { Stack } from 'expo-router';

export default function InfoLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        contentStyle: {
          backgroundColor: '#FFF8F0',
        },
      }}
    />
  );
}