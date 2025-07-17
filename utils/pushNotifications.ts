// This file was created by the assistant.
// It is used to register the device for push notifications and to handle incoming notifications.
//
// Changes:
// - Added setNotificationCategories to define interactive notification buttons.
// - Consolidated token saving logic into registerForPushNotificationsAsync.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { supabase } from './supabase';


export async function registerForPushNotificationsAsync(): Promise<string | null> {
  console.log('[PushNotifications] Starting registration...');
  let token = null;

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      console.log('[PushNotifications] Android notification channel set.');
    } catch (e) {
      console.error('[PushNotifications] Failed to set notification channel:', e);
      Alert.alert('Notification Setup Failed', 'Could not set notification channel.');
    }
  }

  if (Device.isDevice) {
    console.log('[PushNotifications] Device is a physical device.');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log(`[PushNotifications] Existing permission status: ${existingStatus}`);

    if (existingStatus !== 'granted') {
      console.log('[PushNotifications] Requesting new permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log(`[PushNotifications] New permission status: ${finalStatus}`);
    }
    
    if (finalStatus !== 'granted') {
      console.log('[PushNotifications] Permission not granted. Aborting.');
      Alert.alert('Permissions Required', 'You need to grant notification permissions to receive updates.');
      return null;
    }
    
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      console.log(`[PushNotifications] Using EAS Project ID: ${projectId}`);
      if (!projectId) {
        Alert.alert('Configuration Error', 'EAS Project ID is missing. Cannot get push token.');
        throw new Error('Project ID not found in eas.json. Please run "eas build:configure"');
      }
      
      console.log('[PushNotifications] Getting Expo push token...');
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      console.log('📱 Push token obtained:', token);
      
      // Save the token to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user && token) {
        console.log(`[PushNotifications] Saving token for user ${user.id}...`);
        const { error } = await supabase.from('users').update({ expo_push_token: token }).eq('id', user.id);
        if (error) {
          console.error('[PushNotifications] Failed to save token to Supabase:', error);
          Alert.alert('Sync Error', 'Could not save notification token to your profile.');
        } else {
          console.log('✅ Push token saved to Supabase');
        }
      } else {
        console.log('[PushNotifications] No user session or token, skipping save.');
      }

    } catch (e) {
      console.error('Error getting push token:', e);
      Alert.alert('Token Error', `Failed to get push token: ${e.message}`);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }
  
  // This must be called AFTER getting the token
  await setNotificationCategories();

  return token;
}

export async function setNotificationCategories() {
  // Category for Appreciation notifications
  await Notifications.setNotificationCategoryAsync('appreciation', [
    {
      identifier: 'thank-you-action',
      buttonTitle: '❤️ Say Thanks & Open', // More descriptive title
      options: {
        // This is the key change: ensure the app opens when the button is tapped.
        opensAppToForeground: true, 
      },
    },
  ]);
  
  // Category for Favor Request notifications
  await Notifications.setNotificationCategoryAsync('favor_request', [
    {
      identifier: 'accept-favor',
      buttonTitle: 'Accept',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'decline-favor',
      buttonTitle: 'Decline',
      options: {
        isDestructive: true,
        opensAppToForeground: false,
      },
    },
  ]);
  
  console.log('[PushNotifications] Notification categories set.');
}

export type NotificationData = {
  notification_id: string;
  event: {
    sender_id: string;
    receiver_id: string;
    event_type: string;
    content: any;
  }
};