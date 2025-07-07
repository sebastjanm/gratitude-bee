import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [heartAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    const animateHeart = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(heartAnimation, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(heartAnimation, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animateHeart();
  }, [heartAnimation]);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !displayName)) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            },
          },
        });

        if (error) {
          Alert.alert('Sign Up Failed', error.message);
        } else {
          Alert.alert(
            'Verification Email Sent',
            'Please check your email and click the verification link to complete your registration.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Optionally, you could navigate to a holding screen
                  // For now, we'll just clear the form
                  setEmail('');
                  setPassword('');
                  setDisplayName('');
                },
              },
            ]
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          Alert.alert('Sign In Failed', error.message);
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const animatedStyle = {
    transform: [{ scale: heartAnimation }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Animated.View style={[styles.logoContainer, animatedStyle]}>
              <Heart color="#FF8C42" size={32} fill="#FF8C42" />
            </Animated.View>
            <Text style={styles.title}>
              {isSignUp ? 'Join GratitudeBee' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Start building daily appreciation together'
                : 'Continue your appreciation journey'
              }
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <User color="#666" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Display Name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Mail color="#666" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#666" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#666" size={20} />
                ) : (
                  <Eye color="#666" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {!isSignUp && (
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}>
              <Text style={styles.authButtonText}>
                {loading
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                  : (isSignUp ? 'Create Account' : 'Sign In')
                }
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchModeText}>
              {isSignUp
                ? 'Already have an account? Sign in'
                : 'Create an account'
              }
            </Text>
          </TouchableOpacity>

          {isSignUp && (
            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF8C42',
    textAlign: 'right',
    marginBottom: 24,
  },
  authButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  switchModeText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FF8C42',
    textAlign: 'center',
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  testAccountButton: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  testAccountText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#3B82F6',
  },
});