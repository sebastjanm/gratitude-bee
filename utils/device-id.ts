import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';

const DEVICE_ID_KEY = '@gratitude_bee_device_id';

/**
 * Gets or creates a unique device ID for this installation
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate new device ID using device info and random UUID
      const deviceInfo = `${Device.brand}_${Device.modelName}_${Device.osName}`;
      const randomPart = Crypto.randomUUID();
      deviceId = `${deviceInfo}_${randomPart}`.replace(/\s+/g, '_');
      
      // Store it for future use
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    // Fallback to a simple random ID
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Gets a short device identifier for display purposes
 */
export function getDeviceDisplayName(): string {
  const deviceName = Device.deviceName || 'Unknown Device';
  const osName = Device.osName || 'Unknown';
  return `${deviceName} (${osName})`;
}