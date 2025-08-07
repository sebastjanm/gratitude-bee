import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import RealtimeDiagnostic from '@/components/RealtimeDiagnostic';
import { X } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '@/utils/design-system';

export default function RealtimeDiagnosticModal() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Realtime Connection Test</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color={Colors.textSecondary} size={24} />
        </TouchableOpacity>
      </View>
      <RealtimeDiagnostic />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
});