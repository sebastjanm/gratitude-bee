import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Sparkles } from 'lucide-react-native';
import UpdateChecker from '@/components/UpdateChecker';
import { Colors, Typography, Spacing, BorderRadius, Layout, ComponentStyles } from '@/utils/design-system';
import { getAppVersion } from '@/utils/app-version';

export default function CheckUpdatesModal() {
  const router = useRouter();
  const versionInfo = getAppVersion();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color={Colors.textSecondary} size={24} />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Sparkles color={Colors.primary} size={32} />
        </View>
        <Text style={styles.headerTitle}>App Updates</Text>
        <Text style={styles.headerSubtitle}>
          Keep your app up to date with the latest features and improvements
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <UpdateChecker />

        <View style={styles.currentVersionCard}>
          <Text style={styles.sectionTitle}>Current Version</Text>
          <View style={styles.versionDetails}>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>App Version:</Text>
              <Text style={styles.versionValue}>{versionInfo.version}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Build Number:</Text>
              <Text style={styles.versionValue}>{versionInfo.buildNumber}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Update Channel:</Text>
              <Text style={styles.versionValue}>{versionInfo.channel}</Text>
            </View>
            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>Runtime Version:</Text>
              <Text style={styles.versionValue}>{versionInfo.runtimeVersion}</Text>
            </View>
            {versionInfo.updateId !== 'No OTA' && (
              <>
                <View style={styles.divider} />
                <View style={styles.versionRow}>
                  <Text style={styles.versionLabel}>Update ID:</Text>
                  <Text style={[styles.versionValue, styles.updateId]}>
                    {versionInfo.updateId.slice(0, 12)}...
                  </Text>
                </View>
                {versionInfo.lastUpdated && (
                  <View style={styles.versionRow}>
                    <Text style={styles.versionLabel}>Last Updated:</Text>
                    <Text style={styles.versionValue}>
                      {new Date(versionInfo.lastUpdated).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About OTA Updates</Text>
          <Text style={styles.infoText}>
            Over-the-air (OTA) updates allow us to deliver bug fixes and improvements 
            directly to your app without requiring an app store update.
          </Text>
          <Text style={styles.infoText}>
            Updates are automatically checked when you open the app, but you can also 
            manually check for updates here.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: Layout.screenPadding,
    padding: Spacing.sm,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...ComponentStyles.modal.headerTitle,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...ComponentStyles.modal.headerSubtitle,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  currentVersionCard: {
    backgroundColor: Colors.backgroundElevated,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md,
  },
  versionDetails: {
    gap: Spacing.sm,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
  },
  versionValue: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
  },
  updateId: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  infoCard: {
    backgroundColor: Colors.info + '10',
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  infoTitle: {
    ...ComponentStyles.text.h4,
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.relaxed,
    marginBottom: Spacing.sm,
  },
});