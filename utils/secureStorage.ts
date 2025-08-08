/**
 * Secure Storage Utility
 * Provides encrypted storage for sensitive authentication data
 * Uses expo-secure-store for enhanced security on iOS and Android
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storing different types of data
const STORAGE_KEYS = {
  REFRESH_TOKEN: 'gratitude_bee_refresh_token',
  REMEMBER_ME: 'gratitude_bee_remember_me',
  USER_EMAIL: 'gratitude_bee_user_email', // Only stored if "Remember Me" is checked
} as const;

/**
 * Store a value securely using expo-secure-store
 * Falls back to AsyncStorage if SecureStore is not available (e.g., in Expo Go)
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    // Try to use SecureStore first (most secure)
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    // Fallback to AsyncStorage if SecureStore is not available
    console.warn('SecureStore not available, falling back to AsyncStorage:', error);
    await AsyncStorage.setItem(key, value);
  }
}

/**
 * Retrieve a value from secure storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    // Try SecureStore first
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) return value;
    
    // Fallback to check AsyncStorage
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('Error reading from secure storage:', error);
    // Try AsyncStorage as last resort
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

/**
 * Delete a value from secure storage
 */
export async function deleteSecureItem(key: string): Promise<void> {
  try {
    // Delete from both storages to ensure cleanup
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn('Error deleting from SecureStore:', error);
  }
  
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn('Error deleting from AsyncStorage:', error);
  }
}

/**
 * Store refresh token securely
 */
export async function storeRefreshToken(token: string): Promise<void> {
  await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Get stored refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  return await getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Clear refresh token
 */
export async function clearRefreshToken(): Promise<void> {
  await deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Store "Remember Me" preference
 */
export async function setRememberMe(remember: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember ? 'true' : 'false');
}

/**
 * Get "Remember Me" preference
 */
export async function getRememberMe(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  return value === 'true';
}

/**
 * Store user email for "Remember Me" feature
 */
export async function storeUserEmail(email: string): Promise<void> {
  const rememberMe = await getRememberMe();
  if (rememberMe) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
  }
}

/**
 * Get stored user email
 */
export async function getStoredUserEmail(): Promise<string | null> {
  return await AsyncStorage.getItem(STORAGE_KEYS.USER_EMAIL);
}

/**
 * Clear all auth-related storage
 * Called on logout
 */
export async function clearAuthStorage(): Promise<void> {
  await Promise.all([
    clearRefreshToken(),
    AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_ME),
    AsyncStorage.removeItem(STORAGE_KEYS.USER_EMAIL),
  ]);
}

/**
 * Check if secure storage is available
 * Useful for determining if we're in Expo Go or a standalone app
 */
export async function isSecureStorageAvailable(): Promise<boolean> {
  try {
    const testKey = 'test_secure_storage';
    await SecureStore.setItemAsync(testKey, 'test');
    await SecureStore.deleteItemAsync(testKey);
    return true;
  } catch {
    return false;
  }
}