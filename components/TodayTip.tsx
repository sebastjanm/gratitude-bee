// This file was created by the assistant.
// It contains the "Today's Tip" component for the home screen.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Layout } from '@/utils/design-system';

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
    backgroundColor: Colors.success + '10', // Light green background
    marginHorizontal: Layout.screenPadding,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  tipTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
  },
}); 