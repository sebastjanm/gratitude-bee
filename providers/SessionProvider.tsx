// This file was created by the assistant.
// It contains the session provider for managing user authentication state.
// Updated to include push notification registration.

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { 
  registerForPushNotificationsAsync, 
  savePushTokenToSupabase, 
  setupNotificationListeners,
  cleanupNotificationListeners
} from '@/utils/pushNotifications';

console.log('SessionProvider: initializing');

const SessionContext = createContext<{ 
  session: Session | null; 
  loading: boolean;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}>({
  session: null,
  loading: true,
  setSession: () => {},
});

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
      console.log('SessionProvider: session set', session, 'loading', false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      console.log('SessionProvider: auth state changed', session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Update last_seen timestamp on app state change
  useEffect(() => {
    const updateLastSeen = async () => {
      if (session?.user) {
        const { error } = await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', session.user.id);
        if (error) {
          console.error('Failed to update last_seen:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        updateLastSeen();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [session?.user]);


  // Setup push notifications when user signs in
  useEffect(() => {
    let notificationListeners: any = null;

    const setupPushNotifications = async () => {
      if (session?.user) {
        console.log('SessionProvider: Setting up push notifications for user:', session.user.id);
        
        // Register for push notifications and get token
        const token = await registerForPushNotificationsAsync();
        
        if (token) {
          // Save token to Supabase
          await savePushTokenToSupabase(token, session.user.id);
        }
        
        // Setup notification listeners
        notificationListeners = setupNotificationListeners();
      }
    };

    setupPushNotifications();

    return () => {
      // Clean up notification listeners
      if (notificationListeners) {
        cleanupNotificationListeners(notificationListeners);
      }
    };
  }, [session?.user?.id]);

  return (
    <SessionContext.Provider value={{ session, loading, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}; 