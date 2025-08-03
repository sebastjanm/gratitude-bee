// This file was created by the assistant.
// It sets up the root layout, session provider, and global navigation logic.

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SessionProvider, useSession } from '../providers/SessionProvider';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';
import * as Notifications from 'expo-notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { Alert } from 'react-native';

// This handler decides how foreground notifications are presented.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

function GlobalLogic() {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useSession();

  // Handles session-based navigation
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/welcome');
    }
  }, [session, loading, segments, router]);

  // Handles push notification registration and stored invite codes
  useEffect(() => {
    if (session) {
      registerForPushNotificationsAsync();
      checkStoredInviteCode();
    }
  }, [session]);

  const checkStoredInviteCode = async () => {
    try {
      const storedCode = await AsyncStorage.getItem('invite_code');
      if (storedCode) {
        // Remove the code first to prevent re-processing
        await AsyncStorage.removeItem('invite_code');
        
        // Attempt to connect with the stored code
        const { data, error } = await supabase.functions.invoke('connect-partner', {
          body: { inviteCode: storedCode },
        });

        if (error) throw error;

        Alert.alert(
          'Connected Successfully! 🎉',
          `You and ${data.partnerName} are now connected. Start sharing appreciation badges together!`,
          [
            { text: 'Start Appreciating', onPress: () => router.replace('/(tabs)') },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to process stored invite code:', error);
      // Don't show error to user as this is a background process
    }
  };

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <GlobalLogic />
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="(info)" options={{ headerShown: false }} />
        <Stack.Screen name="invite/[code]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  useReactQueryDevTools(queryClient);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  console.log('RootLayout: fontsLoaded', fontsLoaded, 'fontError', fontError);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SafeAreaProvider>
          <RootLayoutNav />
        </SafeAreaProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}