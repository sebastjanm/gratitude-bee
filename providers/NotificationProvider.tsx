// This file was created by the assistant to centralize notification logic.
//
// Changes:
// - Refactored to act as a central notification router.
// - Uses a category-to-route map for extensible navigation.
// - Standardizes payload passing to modal screens.
// - Encapsulates all state and logic for handling push notifications.
// - Provides a context to control the AppreciationDetailModal from anywhere.
// - Sets up listeners robustly, tied to the user's session.

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';
import { useSession } from './SessionProvider';
import { useRouter } from 'expo-router';

const NotificationContext = createContext<object | undefined>(undefined);

const categoryRouteMapping: Record<string, string> = {
  appreciation: '/(modals)/appreciation',
  favor_request: '/(modals)/favor',
  ping_sent: '/(modals)/ping',
  hornet: '/(modals)/hornet',
  wisdom: '/(modals)/wisdom',
  dont_panic: '/(modals)/dont-panic',
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const router = useRouter();
  const processedNotificationIds = useRef(new Set());
  const launchNotificationResponse = useRef<Notifications.NotificationResponse | null>(null);

  const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
    const notification = response.notification;
    const notificationId = notification.request.identifier;
    
    if (processedNotificationIds.current.has(notificationId)) {
      return; // Already processed
    }
    processedNotificationIds.current.add(notificationId);
    
    console.log(`--- Handling Notification [${notificationId}] ---`);
    
    const notificationDbId = notification.request.content.data?.id as string | undefined;
    if (notificationDbId) {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationDbId);
      if (error) console.error('Error marking notification as read:', error);
      else console.log(`Notification ${notificationDbId} marked as read.`);
    }

    const { actionIdentifier, categoryIdentifier } = notification.request.content;
    const payload = notification.request.content.data as any;

    if (actionIdentifier === 'thank-you-action') {
      console.log('[NotificationProvider] Handling THANK_YOU action');
      const { event } = payload;
      const sender_id = event?.receiver_id; // The one who received the original is now the sender
      const recipient_id = event?.sender_id; // The one who sent the original is now the recipient
      const original_appreciation_title = event?.content?.title;

      try {
        const { error } = await supabase.functions.invoke('send-thank-you', {
          body: { sender_id, recipient_id, original_appreciation_title },
        });
        if (error) throw error;
        Alert.alert("Success", "Thank you sent!");
      } catch (error) {
        console.error("Error sending thank you from action:", error);
        Alert.alert("Error", "Could not send thank you.");
      }
      return; // Stop further processing for this action
    }
    
    const category = categoryIdentifier?.split('.')[0];

    // Explicitly handle or ignore the 'default' category
    if (category === 'default') {
      console.log('[NotificationProvider] Ignoring "default" category notification tap.');
      return; // Do nothing further for 'default' category
    }

    const route = category ? categoryRouteMapping[category] : undefined;

    if (route && payload) {
      console.log(`[NotificationProvider] Navigating to ${route} for category ${category}`);
      router.push({
        pathname: route,
        params: {
          payload: JSON.stringify(payload),
        },
      });
    } else {
      console.log(`[NotificationProvider] No route found for category: ${category}`);
    }
  };
  
  // Effect to immediately capture the notification that launched the app
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        launchNotificationResponse.current = response;
      }
    });
  }, []); // Runs once on mount

  // Effect to set up listeners and process any stored launch notification once the session is available
  useEffect(() => {
    if (session) {
      if (launchNotificationResponse.current) {
        handleNotificationResponse(launchNotificationResponse.current);
        launchNotificationResponse.current = null;
      }
      const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
      return () => {
        subscription.remove();
      };
    }
  }, [session]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

// The hook is no longer needed as the provider doesn't expose any values.
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 