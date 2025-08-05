// Updated Profile screen with Legal section
// - Added Legal section with Terms & Conditions, Privacy Policy, and Impressum
// - Created separate pages for each legal document with comprehensive content
// - Fixed Help button navigation from both header and Support section
// - Reorganized settings into logical groups: Connection, Notifications, Goals, Support, Legal, Account

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Alert,
  Share,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { User, HelpCircle, Bell, Heart, Target, Calendar, Share2, CircleHelp as HelpCircleIcon, Smartphone, LogOut, FileText, Shield, Info, Camera } from 'lucide-react-native';
import { useSession } from '@/providers/SessionProvider';
import { supabase } from '@/utils/supabase';
import QRCodeModal from '@/components/QRCodeModal';
import ProfileAnalytics from '@/components/ProfileAnalytics';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

export default function ProfileScreen() {
  const { session, setSession } = useSession();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const insets = useSafeAreaInsets();
  const [nudgesEnabled, setNudgesEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [weeklyGoal, setWeeklyGoal] = useState(21);
  const [inviteCode, setInviteCode] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    badges_sent: 0,
    badges_received: 0,
    day_streak: 0,
    days_active: 0,
  });

  const appVersion = Constants.expoConfig?.version ?? 'N/A';
  const buildNumber = Constants.nativeBuildVersion ?? 'N/A';

  useEffect(() => {
    if (session) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('invite_code, partner_id, avatar_url')
          .eq('id', session.user.id)
          .single();
        if (error) {
            Alert.alert('Error', 'Could not fetch your profile data.');
        } else if (data) {
          setInviteCode(data.invite_code);
          setAvatarUrl(data.avatar_url);
          if (data.partner_id) {
            const { data: partnerData, error: partnerError } = await supabase
              .from('users')
              .select('display_name')
              .eq('id', data.partner_id)
              .single();
            if (partnerData) {
              setPartnerName(partnerData.display_name);
            } else if (partnerError) {
            }
          }
        }
      };

      const fetchStats = async () => {
        setLoadingStats(true);
        const { data, error } = await supabase.rpc('get_user_profile_stats', { p_user_id: session.user.id });
        if (error) {
          Alert.alert('Error', 'Could not fetch your stats.');
        } else {
          setStats(data);
        }
        setLoadingStats(false);
      };

      fetchProfile();
      fetchStats();
    }
  }, [session]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    if (!session?.user) return;
    setUploading(true);
    try {
      const fileExt = uri.split('.').pop();
      const filePath = `${session.user.id}/${new Date().getTime()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `photo.${fileExt}`,
        type: `image/${fileExt}`,
      } as any);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, formData, {
            upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;


      const { error: updateUserError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateUserError) {
        throw updateUserError;
      }

      setAvatarUrl(publicUrl);
       if(session) {
         const newSession = {...session};
         newSession.user.user_metadata.avatar_url = publicUrl;
         setSession(newSession);
       }
      
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleConnectPartner = async () => {
    router.push('/(modals)/connect-partner');
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Your Data',
      'Create a beautiful memory book of all your shared appreciations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting data...') },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: () => {
            supabase.auth.signOut();
            router.replace('/(auth)/auth');
          }
        },
      ]
    );
  };

  const currentUser = session?.user;

  const renderUserInfo = () => (
    <View style={styles.userInfoContainer}>
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <User color={Colors.primary} size={32} />
          </View>
        )}
        <View style={styles.partnerStatus}>
          <Camera color={Colors.info} size={16} />
        </View>
      </TouchableOpacity>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{currentUser?.user_metadata.display_name || 'User'}</Text>
        <Text style={styles.userSubtitle}>
          {partnerName ? `Connected with ${partnerName} ❤️` : 'No partner connected'}
        </Text>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Your Impact</Text>
      {loadingStats ? (
        <View style={styles.statsGrid}>
          <Text>Loading stats...</Text>
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.badges_sent}</Text>
            <Text style={styles.statLabel}>Badges Sent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.badges_received}</Text>
            <Text style={styles.statLabel}>Badges Received</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.day_streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.days_active}</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderSettingsSection = (title: string, children: React.ReactNode) => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingsItem = (
    icon: any,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => {
    const IconComponent = icon;
    return (
      <TouchableOpacity
        style={styles.settingsItem}
        onPress={onPress}
        disabled={!onPress}>
        <View style={styles.settingsItemLeft}>
          <View style={styles.settingsIcon}>
            <IconComponent color="#666" size={20} />
          </View>
          <View style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightElement}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <User color={Colors.primary} size={28} />
            <Text style={styles.title}>Profile</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
            <HelpCircleIcon color={Colors.textSecondary} size={Layout.iconSize.lg} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Manage your profile and settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderUserInfo()}
        {renderStats()}
        
        {session && <ProfileAnalytics userId={session.user.id} />}

        {renderSettingsSection(
          'Connection',
          <>
            {renderSettingsItem(
              Smartphone,
              'Invite Partner',
              'Send an invitation to connect',
              handleConnectPartner
            )}
            {renderSettingsItem(
              Share2,
              'Export Memory Book',
              'Create a shareable timeline',
              handleExportData
            )}
          </>
        )}

        {renderSettingsSection(
          'Notifications',
          <>
            {renderSettingsItem(
              Bell,
              'Daily Reminders',
              'Get gentle nudges to appreciate',
              undefined,
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
                thumbColor={notificationsEnabled ? '#FFF' : '#FFF'}
              />
            )}
            {renderSettingsItem(
              Heart,
              'Send a Nudge',
              'Random reminders to think about your partner (9 AM - 8 PM)',
              undefined,
              <Switch
                value={nudgesEnabled}
                onValueChange={setNudgesEnabled}
                trackColor={{ false: '#E0E0E0', true: '#FF8C42' }}
                thumbColor={nudgesEnabled ? '#FFF' : '#FFF'}
              />
            )}
            {renderSettingsItem(
              Calendar,
              'Reminder Time',
              `Currently set to ${reminderTime}`,
              () => console.log('Open time picker')
            )}
          </>
        )}

        {renderSettingsSection(
          'Goals',
          <>
            {renderSettingsItem(
              Target,
              'Weekly Goal',
              `Send ${weeklyGoal} badges per week`,
              () => console.log('Open goal setter')
            )}
            {renderSettingsItem(
              Calendar,
              'Challenge Participation',
              'Join weekly appreciation challenges',
              () => console.log('Open challenges')
            )}
          </>
        )}

        {renderSettingsSection(
          'Support',
          <>
            {renderSettingsItem(
              HelpCircleIcon,
              'Help & FAQs',
              'Get answers to common questions',
              () => router.push('/help')
            )}
          </>
        )}

        {renderSettingsSection(
          'Legal',
          <>
            {renderSettingsItem(
              FileText,
              'Terms & Conditions',
              'Our terms of service',
              () => router.push('/terms')
            )}
            {renderSettingsItem(
              Shield,
              'Privacy Policy',
              'How we protect your data',
              () => router.push('/privacy')
            )}
            {renderSettingsItem(
              Info,
              'Impressum',
              'Legal information and contact',
              () => router.push('/impressum')
            )}
          </>
        )}

        {renderSettingsSection(
          'Account',
          <>
            {renderSettingsItem(
              LogOut,
              'Sign Out',
              'Sign out of your account',
              handleSignOut
            )}
          </>
        )}
      </ScrollView>
      <QRCodeModal
        visible={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        inviteCode={inviteCode}
        inviteLink={`https://gratitudebee.app/invite/${inviteCode}`}
      />
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Spacing.sm) }]}>
        <Text style={styles.footerText}>Version: {appVersion} (Build {buildNumber})</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fixedHeaderContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...ComponentStyles.text.h2,
    marginLeft: Spacing.md,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  userInfoContainer: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  partnerStatus: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  statsContainer: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  statsTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...ComponentStyles.text.caption,
    textAlign: 'center',
  },
  settingsSection: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  settingsSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
  },
  footer: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
  },
});