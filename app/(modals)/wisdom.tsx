// This file was created by the assistant to display wisdom message details.
//
// Changes:
// - Created to handle incoming 'wisdom' notifications.
// - Parses the standardized `payload` object from route params.
// - Displays wisdom message details and provides a "thank you" button.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, MessageSquare, BookOpen } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';

export default function WisdomDetailScreen() {
  const { payload } = useLocalSearchParams<{ payload: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  
  if (!payload) {
    return (
      <View style={styles.container}>
        <Text>No wisdom details found.</Text>
      </View>
    );
  }

  const {
    event,
    alreadyThanked,
    senderName,
  } = JSON.parse(payload);
  
  const {
    content,
    sender_id,
    receiver_id,
    created_at
  } = event;

  const {
    title,
    description,
  } = content;

  const [isThanked, setIsThanked] = useState(alreadyThanked === 'true' || alreadyThanked === true);

  const handleSendThankYou = async () => {
    if (isThanked) return;
    setLoading(true);
    try {
      // Re-using the generic 'send-thank-you' function
      const { error } = await supabase.functions.invoke('send-thank-you', {
        body: {
          sender_id: receiver_id,
          recipient_id: sender_id,
          original_appreciation_title: title, // Pass wisdom title here
        },
      });
      if (error) throw error;
      setIsThanked(true);
      Alert.alert('Success', 'A thank you has been sent for the wisdom!');
    } catch (error) {
      console.error('Error sending thank you:', error);
      Alert.alert('Error', 'Could not send the thank you message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
        <X size={28} color="#555" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <BookOpen size={40} color="#8E44AD" />
          </View>
          <Text style={styles.title}>{title || 'A Piece of Wisdom'}</Text>
          <Text style={styles.sender}>From {senderName || 'your partner'}</Text>
          <Text style={styles.date}>
            {new Date(created_at).toLocaleString([], {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>{description}</Text>
        </View>

        <TouchableOpacity
          style={[styles.thankYouButton, isThanked && styles.thankedButton]}
          onPress={handleSendThankYou}
          disabled={isThanked || loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MessageSquare size={22} color={isThanked ? '#888' : 'white'} />
              <Text style={[styles.thankYouButtonText, isThanked && styles.thankedButtonText]}>
                {isThanked ? 'Already Thanked' : 'Thanks for the Wisdom'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Acknowledge the wisdom your partner shared with you.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3F7',
    paddingTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#E8DDEF'
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  sender: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  description: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#555',
    textAlign: 'center',
    lineHeight: 25,
  },
  thankYouButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  thankedButton: {
    backgroundColor: '#F0F0F0',
    shadowColor: '#BDBDBD',
  },
  thankYouButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  thankedButtonText: {
    color: '#888',
  },
  footerText: {
    marginTop: 20,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
}); 