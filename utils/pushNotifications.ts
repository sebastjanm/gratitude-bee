// Push notifications utility for Gratitude Bee
// Handles permissions, token registration, and notification listeners

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // For backwards compatibility
    shouldShowBanner: true, // For iOS 14+
    shouldShowList: true, // For Android
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  eventId?: string;
  [key: string]: any;
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      console.log('📱 Push token obtained:', token);
    } catch (e) {
      console.error('Error getting push token:', e);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function savePushTokenToSupabase(token: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ expo_push_token: token })
      .eq('id', userId);

    if (error) {
      console.error('Error saving push token:', error);
      return false;
    }

    console.log('✅ Push token saved to Supabase');
    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
}

export function setupNotificationListeners() {
  // Listen for notifications received while app is running
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('🔔 Notification received:', notification);
  });

  // Listen for user tapping on notifications
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response);
    const data = response.notification.request.content.data as NotificationData;
    
    // Handle notification tap - could navigate to specific screen based on eventId
    if (data.eventId) {
      console.log('📍 Navigation to event:', data.eventId);
      // TODO: Add navigation logic here if needed
    }
  });

  return {
    notificationListener,
    responseListener,
  };
}

export function cleanupNotificationListeners(listeners: {
  notificationListener: Notifications.Subscription;
  responseListener: Notifications.Subscription;
}) {
  listeners.notificationListener.remove();
  listeners.responseListener.remove();
} 