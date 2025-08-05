import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Shield,
  Key,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react-native';
import { useSession } from '@/providers/SessionProvider';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

export default function SecurityScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwords.new.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      // Verify current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session?.user.email || '',
        password: passwords.current
      });

      if (signInError) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your password has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setPasswords({ current: '', new: '', confirm: '' });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
      console.error('Password update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordStrength = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strength === 5) return { level: 'Strong', color: Colors.success };
    if (strength >= 3) return { level: 'Medium', color: Colors.warning };
    return { level: 'Weak', color: Colors.error };
  };

  const passwordStrength = passwords.new ? validatePasswordStrength(passwords.new) : null;

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Shield color={Colors.primary} size={24} />
          </View>
          <Text style={styles.infoTitle}>Keep Your Account Secure</Text>
          <Text style={styles.infoText}>
            Regularly updating your password helps protect your account and personal information.
          </Text>
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key color={Colors.textSecondary} size={20} />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textTertiary}
                value={passwords.current}
                onChangeText={(text) => setPasswords({ ...passwords, current: text })}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                {showCurrentPassword ? (
                  <EyeOff color={Colors.textSecondary} size={20} />
                ) : (
                  <Eye color={Colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor={Colors.textTertiary}
                value={passwords.new}
                onChangeText={(text) => setPasswords({ ...passwords, new: text })}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                {showNewPassword ? (
                  <EyeOff color={Colors.textSecondary} size={20} />
                ) : (
                  <Eye color={Colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>
            </View>
            {passwordStrength && passwords.new && (
              <View style={styles.strengthIndicator}>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  Password Strength: {passwordStrength.level}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.textTertiary}
                value={passwords.confirm}
                onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                {showConfirmPassword ? (
                  <EyeOff color={Colors.textSecondary} size={20} />
                ) : (
                  <Eye color={Colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>
            </View>
            {passwords.new && passwords.confirm && (
              <View style={styles.matchIndicator}>
                {passwords.new === passwords.confirm ? (
                  <View style={styles.matchRow}>
                    <CheckCircle color={Colors.success} size={16} />
                    <Text style={[styles.matchText, { color: Colors.success }]}>
                      Passwords match
                    </Text>
                  </View>
                ) : (
                  <View style={styles.matchRow}>
                    <AlertTriangle color={Colors.error} size={16} />
                    <Text style={[styles.matchText, { color: Colors.error }]}>
                      Passwords do not match
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handlePasswordChange}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Lock color={Colors.white} size={20} />
                <Text style={styles.updateButtonText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Password Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Password Tips</Text>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Use at least 8 characters</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Mix uppercase and lowercase letters</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Include numbers and special characters</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>Avoid common words or personal information</Text>
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{session?.user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account ID:</Text>
            <Text style={styles.infoValue}>{session?.user.id.slice(0, 8)}...</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    margin: -Spacing.sm,
  },
  title: {
    ...ComponentStyles.text.h2,
  },
  content: {
    flex: 1,
  },

  // Info Card
  infoCard: {
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  infoTitle: {
    ...ComponentStyles.text.h3,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.5,
  },

  // Section
  section: {
    marginTop: Spacing.xl,
    marginHorizontal: Layout.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginLeft: Spacing.sm,
  },

  // Input Group
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.sm,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: Spacing.md,
  },

  // Strength Indicator
  strengthIndicator: {
    marginTop: Spacing.xs,
  },
  strengthText: {
    ...ComponentStyles.text.caption,
    fontFamily: Typography.fontFamily.medium,
  },

  // Match Indicator
  matchIndicator: {
    marginTop: Spacing.xs,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchText: {
    ...ComponentStyles.text.caption,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: Spacing.xs,
  },

  // Update Button
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  disabledButton: {
    backgroundColor: Colors.gray400,
  },
  updateButtonText: {
    ...ComponentStyles.text.button,
    color: Colors.white,
  },

  // Tips Section
  tipsSection: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  tipsTitle: {
    ...ComponentStyles.text.h4,
    marginBottom: Spacing.md,
  },
  tip: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  tipText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    flex: 1,
  },

  // Account Info
  accountInfo: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  accountInfoTitle: {
    ...ComponentStyles.text.h4,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.medium,
  },
});