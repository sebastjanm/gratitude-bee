// This file was created by the assistant to centralize notification logic.
//
// Changes:
// - Encapsulates all state and logic for handling push notifications.
// - Provides a context to control the AppreciationDetailModal from anywhere.
// - Sets up listeners robustly, tied to the user's session.

import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/utils/supabase';
import { Alert } from 'react-native';
import { useSession } from './SessionProvider';
import { useRouter } from 'expo-router'; // Import useRouter

// This context is now much simpler. It just sets up listeners.
const NotificationContext = createContext<object | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const router = useRouter(); // Use the router hook
  const processedNotificationIds = useRef(new Set());
  const launchNotificationResponse = useRef<Notifications.NotificationResponse | null>(null);

  const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
    const notification = response.notification;
    const notificationId = notification.request.identifier;

    console.log('[NotificationProvider] Full notification response:', JSON.stringify(response, null, 2));
    console.log('[NotificationProvider] Category identifier:', notification.request.content.categoryIdentifier);
    console.log('[NotificationProvider] Notification data:', JSON.stringify(notification.request.content.data, null, 2));
    
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

    const { actionIdentifier } = response;
    const { categoryIdentifier } = notification.request.content;
    const { sender_id, recipient_id, title, body, alreadyThanked } = notification.request.content.data as any;

    console.log('[NotificationProvider] Checking category:', categoryIdentifier);
    if (categoryIdentifier?.toLowerCase().startsWith('appreciation')) {
      console.log('[NotificationProvider] Category check passed. Action:', actionIdentifier);
      // If user presses the "Thank You" button directly from the notification
      if (actionIdentifier === 'thank-you-action') {
        console.log('[NotificationProvider] Handling THANK_YOU action');
        try {
          const { error } = await supabase.functions.invoke('send-thank-you', {
            body: { sender_id: recipient_id, recipient_id: sender_id, original_appreciation_title: title },
          });
          if (error) throw error;
          Alert.alert("Success", "Thank you sent!");
        } catch (error) {
          console.error("Error sending thank you from action:", error);
          Alert.alert("Error", "Could not send thank you.");
        }
      } else {
        // When the notification itself is tapped, open the modal screen
        console.log('[NotificationProvider] Navigating to appreciation modal screen');
        router.push({
          pathname: '/(modals)/appreciation',
          params: {
            title,
            body,
            sender_id,
            recipient_id,
            alreadyThanked: (alreadyThanked === 'true' || alreadyThanked === true).toString(),
          },
        });
      }
    } else {
      console.log('[NotificationProvider] Category check failed - no action taken');
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