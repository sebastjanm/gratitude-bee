import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame } from 'lucide-react-native';

interface StreakCardProps {
  currentStreak: number;
  totalBadges: number;
  encouragementMessage?: string;
}

export default function StreakCard({
  currentStreak,
  totalBadges,
  encouragementMessage = "Amazing! You're building a beautiful relationship together 💕",
}: StreakCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Flame color="#FF8C42" size={24} />
        <Text style={styles.title}>Daily Streak</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Days</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalBadges}</Text>
          <Text style={styles.statLabel}>Total Badges</Text>
        </View>
      </View>
      <Text style={styles.encouragement}>{encouragementMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
  },
  encouragement: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
});