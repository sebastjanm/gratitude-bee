// This file was created by the assistant to display "Don't Panic" messages.
//
// Changes:
// - Created to handle incoming 'dont_panic' notifications.
// - Parses the standardized `payload` object from route params.
// - Displays message details and provides an acknowledgement button.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Heart, MessageSquare } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';

export default function DontPanicDetailScreen() {
  const { payload } = useLocalSearchParams<{ payload: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  
  if (!payload) {
    return (
      <View style={styles.container}>
        <Text>No message details found.</Text>
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

  const [isAcknowledged, setIsAcknowledged] = useState(alreadyThanked === 'true' || alreadyThanked === true);

  const handleAcknowledge = async () => {
    if (isAcknowledged) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-thank-you', {
        body: {
          sender_id: receiver_id,
          recipient_id: sender_id,
          original_appreciation_title: title,
        },
      });
      if (error) throw error;
      setIsAcknowledged(true);
      Alert.alert('Success', 'You have acknowledged the message.');
    } catch (error) {
      console.error('Error acknowledging message:', error);
      Alert.alert('Error', 'Could not acknowledge the message.');
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
            <Heart size={40} color="#2ECC71" />
          </View>
          <Text style={styles.title}>{title || "A Message of Calm"}</Text>
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
          style={[styles.acknowledgeButton, isAcknowledged && styles.acknowledgedButton]}
          onPress={handleAcknowledge}
          disabled={isAcknowledged || loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MessageSquare size={22} color={isAcknowledged ? '#888' : 'white'} />
              <Text style={[styles.acknowledgeButtonText, isAcknowledged && styles.acknowledgedButtonText]}>
                {isAcknowledged ? 'Acknowledged' : 'Send ❤️ Back'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.footerText}>
          A little reassurance goes a long way.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
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
    borderColor: '#C8E6C9'
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
  acknowledgeButton: {
    backgroundColor: '#2ECC71',
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  acknowledgedButton: {
    backgroundColor: '#F0F0F0',
    shadowColor: '#BDBDBD',
  },
  acknowledgeButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  acknowledgedButtonText: {
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