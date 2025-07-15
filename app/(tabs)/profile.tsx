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
import * as ImagePicker from 'expo-image-picker';

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
            console.error(error);
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
                console.error("Could not fetch partner's name", partnerError);
            }
          }
        }
      };

      const fetchStats = async () => {
        setLoadingStats(true);
        const { data, error } = await supabase.rpc('get_user_profile_stats', { p_user_id: session.user.id });
        if (error) {
          Alert.alert('Error', 'Could not fetch your stats.');
          console.error(error);
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
    console.log('[AVATAR UPLOAD] Starting upload for URI:', uri);
    try {
      const fileExt = uri.split('.').pop();
      const filePath = `${session.user.id}/${new Date().getTime()}.${fileExt}`;
      console.log('[AVATAR UPLOAD] Uploading to path:', filePath);

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
        console.error('[AVATAR UPLOAD] Supabase storage error:', uploadError);
        throw uploadError;
      }
      console.log('[AVATAR UPLOAD] Upload successful.');

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      console.log('[AVATAR UPLOAD] Public URL:', publicUrl);


      const { error: updateUserError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateUserError) {
        console.error('[AVATAR UPLOAD] Error updating user profile:', updateUserError);
        throw updateUserError;
      }
      console.log('[AVATAR UPLOAD] User profile updated.');

      setAvatarUrl(publicUrl);
       if(session) {
         const newSession = {...session};
         newSession.user.user_metadata.avatar_url = publicUrl;
         setSession(newSession);
       }
      
    } catch (error) {
      console.error('[AVATAR UPLOAD] General error:', error);
      Alert.alert('Error', 'Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleConnectPartner = async () => {
    if (!inviteCode) {
      Alert.alert('Could not find your invite code.');
      return;
    }
    setIsQrModalVisible(true);
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
            <User color="#FF8C42" size={32} />
          </View>
        )}
        <View style={styles.partnerStatus}>
          <Camera color="#4ECDC4" size={16} />
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
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <User color="#FF8C42" size={28} />
            <Text style={styles.title}>Profile</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
            <HelpCircleIcon color="#666" size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Manage your profile and settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderUserInfo()}
        {renderStats()}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  fixedHeaderContainer: {
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginLeft: 12,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 20, // Add space at the top of the scrollable content
  },
  userInfoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF8C42',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FF8C42',
  },
  partnerStatus: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    textAlign: 'center',
  },
  settingsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});