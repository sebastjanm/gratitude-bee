// This file was created by the assistant to display favor request details.
//
// Changes:
// - Created to handle incoming 'favor_request' notifications.
// - Parses the standardized `payload` object from route params.
// - Displays favor details and provides action buttons.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ThumbsUp, ThumbsDown, Handshake } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';

export default function FavorDetailScreen() {
  const { payload } = useLocalSearchParams<{ payload: string }>();
  const router = useRouter();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  if (!payload) {
    return (
      <View style={styles.container}>
        <Text>No favor details found.</Text>
      </View>
    );
  }

  const { event, senderName } = JSON.parse(payload);
  const { id: event_id, content, created_at } = event;
  const { title, description, points } = content;

  const handleAccept = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('accept-favor', {
        body: { event_id, user_id: session.user.id },
      });
      if (error) throw error;
      Alert.alert('Favor Accepted', 'You have agreed to help your partner.');
      router.back();
    } catch (error) {
      console.error('Error accepting favor:', error);
      Alert.alert('Error', 'Could not accept the favor.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDecline = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('decline-favor', {
        body: { event_id, user_id: session.user.id },
      });
      if (error) throw error;
      Alert.alert('Favor Declined', 'You have declined the favor request.');
      router.back();
    } catch (error) {
      console.error('Error declining favor:', error);
      Alert.alert('Error', 'Could not decline the favor.');
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
            <Handshake size={40} color="#3498db" />
          </View>
          <Text style={styles.title}>{title || 'Favor Request'}</Text>
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
          <Text style={styles.description}>{description || 'Your partner has asked for a favor.'}</Text>
          {points && (
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>{points}</Text>
              <Text style={styles.pointsLabel}>Bees on completion</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.declineButton]} onPress={handleDecline} disabled={loading}>
            {loading ? <ActivityIndicator color="#c0392b" /> : <ThumbsDown size={22} color="#c0392b" />}
            <Text style={[styles.actionButtonText, styles.declineButtonText]}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAccept} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <ThumbsUp size={22} color="white" />}
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>
          Responding to favors helps maintain a healthy give-and-take in your relationship.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F5F9',
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
    borderColor: '#D6EAF8'
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
    marginBottom: 25,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#EBF5FB',
    borderRadius: 15,
  },
  points: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#3498db',
    marginRight: 8,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3498db',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  acceptButton: {
    backgroundColor: '#3498db',
    marginLeft: 10,
    shadowColor: '#3498db',
  },
  declineButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E6E6E6',
    marginRight: 10,
    shadowColor: '#BDBDBD',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  declineButtonText: {
    color: '#c0392b',
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