// This file was created by the assistant.
// It is used to register the device for push notifications and to handle incoming notifications.
//
// Changes:
// - Added setNotificationCategories to define interactive notification buttons.
// - Consolidated token saving logic into registerForPushNotificationsAsync.

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';


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
        throw new Error('Project ID not found in eas.json. Please run "eas build:configure"');
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      
      console.log('📱 Push token obtained:', token);
      
      // Save the token to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user && token) {
        await supabase.from('users').update({ expo_push_token: token }).eq('id', user.id);
        console.log('✅ Push token saved to Supabase');
      }

    } catch (e) {
      console.error('Error getting push token:', e);
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