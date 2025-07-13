// This file was created by the assistant to display hornet message details.
//
// Changes:
// - Created to handle incoming 'hornet' notifications.
// - Parses the standardized `payload` object from route params.
// - Displays hornet details and provides a simple close button.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, TriangleAlert } from 'lucide-react-native';

export default function HornetDetailScreen() {
  const { payload } = useLocalSearchParams<{ payload: string }>();
  const router = useRouter();

  if (!payload) {
    return (
      <View style={styles.container}>
        <Text>No hornet details found.</Text>
      </View>
    );
  }

  const {
    event,
    senderName,
  } = JSON.parse(payload);
  
  const {
    content,
    created_at
  } = event;

  const {
    title,
    description,
    points,
  } = content;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
        <X size={28} color="#555" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <TriangleAlert size={40} color="#E74C3C" />
          </View>
          <Text style={styles.title}>{title || 'A Hornet has Arrived'}</Text>
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
          {points && (
            <View style={styles.pointsContainer}>
              <Text style={styles.points}>{points}</Text>
              <Text style={styles.pointsLabel}>Bees lost</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.closeButtonAction}
          onPress={() => router.back()}>
            <Text style={styles.closeButtonActionText}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>
          Hornets are for accountability. Take a moment to reflect.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF1F0',
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
    borderColor: '#FFDAD8'
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
    backgroundColor: '#FFEBEE',
    borderRadius: 15,
  },
  points: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#E74C3C',
    marginRight: 8,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#E74C3C',
  },
  closeButtonAction: {
    backgroundColor: '#A0A0A0',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonActionText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
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