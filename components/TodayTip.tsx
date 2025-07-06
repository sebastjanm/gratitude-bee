// This file was created by the assistant.
// It contains the "Today's Tip" component for the home screen.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TodayTip() {
  return (
    <View style={styles.todayTip}>
      <Text style={styles.tipTitle}>Today's Tip</Text>
      <Text style={styles.tipText}>
        Try sending a Support Star if your partner has been working hard lately.
        Small acknowledgments make a big difference! ✨
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  todayTip: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6BCF7F',
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
}); 