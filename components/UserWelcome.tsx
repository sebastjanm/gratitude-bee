import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MockAuth } from '@/utils/mockAuth';

export default function UserWelcome() {
  const currentUser = MockAuth.getCurrentUser();
  
  if (!currentUser) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}, {currentUser.displayName}! 🌅</Text>
      <Text style={styles.subtitle}>
        {currentUser.partnerName 
          ? `Ready to brighten ${currentUser.partnerName}'s day?`
          : 'Ready to start your appreciation journey?'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
});