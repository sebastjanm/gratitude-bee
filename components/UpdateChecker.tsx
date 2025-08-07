import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Updates from 'expo-updates';
import { RefreshCw, CheckCircle, AlertCircle, Download } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, ComponentStyles } from '@/utils/design-system';
import { getAppVersion } from '@/utils/app-version';

export default function UpdateChecker() {
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    const versionInfo = getAppVersion();
    // Show more details about the current state
    const updateStatus = versionInfo.updateId !== 'No OTA' 
      ? `OTA: ${versionInfo.updateId.slice(0, 8)}...` 
      : 'Base Build (No OTA)';
    setCurrentVersion(`v${versionInfo.version} • ${updateStatus}`);
  }, []);

  const checkForUpdates = async () => {
    if (!Updates.isEnabled) {
      Alert.alert(
        'Updates Not Available',
        'This is a development build. OTA updates only work in production builds.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsChecking(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      setUpdateAvailable(update.isAvailable);
      setLastChecked(new Date());

      if (update.isAvailable) {
        Alert.alert(
          'Update Available',
          'A new update is available. Would you like to download and apply it?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Update Now', onPress: downloadUpdate }
          ]
        );
      } else {
        Alert.alert(
          'No Updates',
          'Your app is up to date!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      Alert.alert(
        'Error',
        'Failed to check for updates. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  const downloadUpdate = async () => {
    setIsDownloading(true);
    try {
      await Updates.fetchUpdateAsync();
      
      Alert.alert(
        'Update Downloaded',
        'The update has been downloaded. The app will now restart to apply the update.',
        [
          {
            text: 'Restart Now',
            onPress: async () => {
              await Updates.reloadAsync();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error downloading update:', error);
      Alert.alert(
        'Download Failed',
        'Failed to download the update. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
      setUpdateAvailable(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking || isDownloading) {
      return <ActivityIndicator size="small" color={Colors.primary} />;
    }
    if (updateAvailable) {
      return <Download color={Colors.warning} size={20} />;
    }
    if (lastChecked) {
      return <CheckCircle color={Colors.success} size={20} />;
    }
    return <RefreshCw color={Colors.textSecondary} size={20} />;
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking for updates...';
    if (isDownloading) return 'Downloading update...';
    if (updateAvailable) return 'Update available!';
    if (lastChecked) {
      const minutes = Math.floor((Date.now() - lastChecked.getTime()) / 60000);
      if (minutes < 1) return 'Checked just now';
      if (minutes === 1) return 'Checked 1 minute ago';
      return `Checked ${minutes} minutes ago`;
    }
    return 'Check for updates';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.updateButton,
          updateAvailable && styles.updateAvailableButton,
          (isChecking || isDownloading) && styles.disabledButton
        ]}
        onPress={checkForUpdates}
        disabled={isChecking || isDownloading}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {getStatusIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>{getStatusText()}</Text>
          <Text style={styles.versionText}>{currentVersion}</Text>
        </View>
      </TouchableOpacity>

      {Updates.isEnabled && (
        <View style={styles.infoContainer}>
          <AlertCircle color={Colors.textTertiary} size={14} />
          <Text style={styles.infoText}>
            Updates are checked automatically when you open the app
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  updateAvailableButton: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warning + '10',
  },
  disabledButton: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  versionText: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  infoText: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
    flex: 1,
  },
});