import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, Heart, Calendar, Target, ChevronRight, AlertCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface SummaryData {
  weeklyStats: {
    sent: number;
    received: number;
    streak: number;
  };
  insights: string[];
  balance: {
    ratio: number;
    status: 'balanced' | 'giving_more' | 'receiving_more';
  };
}

interface ActivitySummaryProps {
  data: SummaryData;
  onInsightPress?: (insight: string) => void;
}

export default function ActivitySummary({ data, onInsightPress }: ActivitySummaryProps) {
  const getBalanceColor = () => {
    switch (data.balance.status) {
      case 'balanced': return Colors.success;
      case 'giving_more': return Colors.warning;
      case 'receiving_more': return Colors.info;
    }
  };

  const getBalanceText = () => {
    switch (data.balance.status) {
      case 'balanced': return 'Perfectly balanced relationship';
      case 'giving_more': return 'You\'re giving more than receiving';
      case 'receiving_more': return 'You\'re receiving more than giving';
    }
  };

  return (
    <View style={styles.container}>
      {/* Weekly Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Heart color={Colors.primary} size={20} />
            </View>
            <Text style={styles.statNumber}>{data.weeklyStats.sent}</Text>
            <Text style={styles.statLabel}>Sent</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: Colors.info + '20' }]}>
              <Heart color={Colors.info} size={20} />
            </View>
            <Text style={styles.statNumber}>{data.weeklyStats.received}</Text>
            <Text style={styles.statLabel}>Received</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: Colors.success + '20' }]}>
              <Target color={Colors.success} size={20} />
            </View>
            <Text style={styles.statNumber}>{data.weeklyStats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>
      </View>

      {/* Relationship Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.sectionTitle}>Relationship Balance</Text>
          <View style={[styles.balanceIndicator, { backgroundColor: getBalanceColor() }]} />
        </View>
        <Text style={styles.balanceText}>{getBalanceText()}</Text>
        <View style={styles.balanceBar}>
          <View 
            style={[
              styles.balanceFill, 
              { 
                width: `${Math.min(data.balance.ratio * 100, 100)}%`,
                backgroundColor: getBalanceColor()
              }
            ]} 
          />
        </View>
      </View>

      {/* Smart Insights */}
      {data.insights.length > 0 && (
        <View style={styles.insightsCard}>
          <Text style={styles.sectionTitle}>Insights for You</Text>
          {data.insights.map((insight, index) => (
            <TouchableOpacity
              key={index}
              style={styles.insightItem}
              onPress={() => onInsightPress?.(insight)}
              activeOpacity={0.7}>
              <AlertCircle color={Colors.primary} size={16} />
              <Text style={styles.insightText}>{insight}</Text>
              <ChevronRight color={Colors.textTertiary} size={16} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.lg,
  },
  
  // Stats Card
  statsCard: {
    ...ComponentStyles.card,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...ComponentStyles.text.h4,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  
  // Balance Card
  balanceCard: {
    ...ComponentStyles.card,
    marginBottom: Spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  balanceText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  balanceBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  balanceFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Insights Card
  insightsCard: {
    ...ComponentStyles.card,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  insightText: {
    ...ComponentStyles.text.body,
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
});