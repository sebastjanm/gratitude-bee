import { Stack } from 'expo-router';
import { Colors } from '@/utils/design-system';

export default function InfoLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    />
  );
}