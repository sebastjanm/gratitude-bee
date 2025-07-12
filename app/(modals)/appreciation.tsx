// This file was created by the assistant to serve as a proper modal screen.
//
// Changes:
// - Created as a route-based modal screen within the app/(modals) group.
// - Uses `useLocalSearchParams` to get data from navigation.
// - UI and logic are self-contained for displaying appreciation details.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

const AppreciationModalScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { title, body, sender_id, recipient_id, alreadyThanked: alreadyThankedStr } = params;

  // Params from navigation are strings, so we parse it.
  const alreadyThanked = alreadyThankedStr === 'true';

  const handleSendThankYou = async () => {
    console.log('--- Sending Thank You from Modal Screen ---');
    if (!sender_id || !recipient_id) {
      Alert.alert("Error", "Could not send thank you. Missing information.");
      return;
    }
    
    try {
      const { error } = await supabase.functions.invoke('send-thank-you', {
        body: {
          sender_id: recipient_id, // Current user (the recipient of the badge) sends the thank you
          recipient_id: sender_id, // To the original sender of the badge
          original_appreciation_title: title,
        },
      });

      if (error) throw error;

      Alert.alert("Success", "Thank you sent!");
      router.back(); // Go back from the modal
    } catch (error) {
      console.error("Error sending thank you:", error);
      Alert.alert("Error", "Could not send thank you.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appreciation Received</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close-circle" size={30} color="#ccc" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{typeof title === 'string' ? title : 'Appreciation'}</Text>
        <Text style={styles.body}>{typeof body === 'string' ? body : 'Your partner sent you some love!'}</Text>
      </View>
      
      {!alreadyThanked && (
        <TouchableOpacity style={styles.thankYouButton} onPress={handleSendThankYou}>
          <Text style={styles.thankYouButtonText}>❤️ Send Thanks</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  body: {
    fontSize: 18,
    color: '#aeaeae',
    textAlign: 'center',
    lineHeight: 25,
  },
  thankYouButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  thankYouButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AppreciationModalScreen; 