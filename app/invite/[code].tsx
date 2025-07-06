// This file was created by the assistant.
// It handles incoming invite links and connects the user to their partner.

import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { session } = useSession();

  useEffect(() => {
    const handleInvite = async () => {
      if (!code) {
        Alert.alert('Invalid Link', 'This invite link is missing a code.', [
          { text: 'OK', onPress: () => router.replace('/') },
        ]);
        return;
      }

      if (session) {
        // User is logged in, attempt to connect
        try {
          const { error } = await supabase.functions.invoke('connect-partner', {
            body: { inviteCode: code },
          });

          if (error) throw error;

          Alert.alert('Connected!', 'You are now connected with your partner.', [
            { text: 'Awesome!', onPress: () => router.replace('/(tabs)') },
          ]);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not connect with this invite code.';
          Alert.alert('Connection Failed', message, [
            { text: 'OK', onPress: () => router.replace('/(tabs)/profile') },
          ]);
        }
      } else {
        // User is not logged in, store code and redirect to auth
        await AsyncStorage.setItem('invite_code', code);
        router.replace('/(auth)/auth');
      }
    };

    handleInvite();
  }, [code, session]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF8C42" />
      <Text style={styles.text}>Processing your invite...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F0',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
}); 