import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MockAuth } from '@/utils/mockAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSendReset = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address');
      return;
    }

    setLoading(true);
    
    try {
      const result = await MockAuth.sendPasswordReset(email);
      
      if (result.success) {
        setEmailSent(true);
      } else {
        Alert.alert('Error', result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, styles.successContainer]}>
        <View>
          <View style={styles.successIcon}>
            <CheckCircle color="#4ECDC4" size={64} />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successSubtitle}>
            We've sent a password reset link to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <Text style={styles.instructionText}>
            Click the link in the email to reset your password. If you don't see it, check your spam folder.
          </Text>
          
          <TouchableOpacity style={styles.backButton} onPress={handleBackToSignIn}>
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={[styles.backIcon, { top: insets.top }]} onPress={handleBackToSignIn}>
        <ArrowLeft color={Colors.textSecondary} size={Layout.iconSize.lg} />
      </TouchableOpacity>
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail color={Colors.textSecondary} size={Layout.iconSize.md} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.resetButton, loading && styles.disabledButton]}
              onPress={handleSendReset}
              disabled={loading}>
              <Text style={styles.resetButtonText}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <TouchableOpacity onPress={handleBackToSignIn}>
              <Text style={styles.footerLink}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backIcon: {
    position: 'absolute',
    top: 0, // This will be overridden by the inline style
    left: 24,
    padding: 8,
    zIndex: 1,
  },
  content: {},
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    height: Layout.buttonHeight.md,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    ...ComponentStyles.text.body,
    height: '100%',
    paddingVertical: 0,
  },
  resetButton: {
    ...ComponentStyles.button.primary,
    ...Shadows.md,
  },
  disabledButton: {
    backgroundColor: Colors.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    ...ComponentStyles.button.text.primary,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  footerLink: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    ...ComponentStyles.text.h2,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  successSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: Typography.fontSize.base * 1.4,
  },
  emailText: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  instructionText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.sm * 1.4,
    marginBottom: Spacing['2xl'],
  },
  backButton: {
    ...ComponentStyles.button.primary,
    paddingHorizontal: Spacing.xl,
    ...Shadows.md,
  },
  backButtonText: {
    ...ComponentStyles.button.text.primary,
  },
});