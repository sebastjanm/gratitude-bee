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
  
  // --- Start Debugging Log ---
  console.log('Appreciation modal received params:', JSON.stringify(params, null, 2));
  // --- End Debugging Log ---
  
  const { 
    alreadyThanked: alreadyThankedStr,
    body, 
    created_at,
    icon,
    points,
    recipient_id, 
    sender_id, 
    senderName,
    title, 
  } = params;

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

  const formattedDate = created_at && typeof created_at === 'string' 
    ? new Date(created_at).toLocaleString(undefined, { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }) 
    : 'Just now';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appreciation Received</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close-circle" size={30} color="#ccc" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.icon}>{typeof icon === 'string' ? icon : '💌'}</Text>
        <Text style={styles.title}>{typeof title === 'string' ? title : 'Appreciation'}</Text>
        <Text style={styles.body}>{typeof body === 'string' ? body : 'Your partner sent you some love!'}</Text>
        <Text style={styles.senderName}>- {senderName || 'Your partner'}</Text>
      </View>

      <View style={styles.metadataContainer}>
        <View style={styles.metadataRow}>
          <Ionicons name="calendar-outline" size={16} color="#ccc" />
          <Text style={styles.metadataText}>{formattedDate}</Text>
        </View>
        <View style={styles.metadataRow}>
          <Ionicons name="star-outline" size={16} color="#ccc" />
          <Text style={styles.metadataText}>+{points || '0'} points</Text>
        </View>
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
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  senderName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#ccc',
    textAlign: 'right',
    marginTop: 15,
    paddingRight: 10,
  },
  metadataContainer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metadataText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 8,
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