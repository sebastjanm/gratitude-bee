import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  User,
} from 'lucide-react-native';
import { useSession } from '@/providers/SessionProvider';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface Section {
  title: string;
  items: SectionItem[];
}

interface SectionItem {
  label: string;
  value?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  editable?: boolean;
  onPress?: () => void;
  icon?: any;
  secure?: boolean;
}

export default function ProfileScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Profile data
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('display_name, avatar_url, email')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url);
        setEmail(data.email || session.user.email || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!session) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          display_name: displayName
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };


  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!session) return;

    setSaving(true);
    try {
      const fileName = `${session.user.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, { uri } as any, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Profile photo updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo');
      console.error('Error uploading avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color={Colors.textSecondary} size={Layout.iconSize.lg} />
            </TouchableOpacity>
            <User color={Colors.primary} size={Layout.iconSize.xl} />
            <Text style={styles.title}>Profile</Text>
          </View>
          <View />
        </View>
        <Text style={styles.subtitle}>Manage your account details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.photoContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User color={Colors.textTertiary} size={40} />
              </View>
            )}
            <View style={styles.cameraButton}>
              <Camera color={Colors.white} size={16} />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoText}>Tap to change photo</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your display name"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{email}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>



        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedHeaderContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: Spacing.sm,
    margin: -Spacing.sm,
    marginRight: Spacing.md,
  },
  title: {
    ...ComponentStyles.text.h2,
    marginLeft: Spacing.md,
  },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  photoContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  photoText: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  section: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...ComponentStyles.text.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    padding: Spacing.md,
  },
  disabledInput: {
    backgroundColor: Colors.gray100,
  },
  disabledText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    ...ComponentStyles.text.body,
    marginLeft: Spacing.md,
  },
});