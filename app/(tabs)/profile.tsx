import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { User, Settings, Bell, Heart, Target, Calendar, Share2, CircleHelp as HelpCircle, Smartphone, LogOut } from 'lucide-react-native';
import { MockAuth } from '@/utils/mockAuth';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [nudgesEnabled, setNudgesEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [weeklyGoal, setWeeklyGoal] = useState(21);

  const handleConnectPartner = () => {
    Alert.alert(
      'Connect Partner',
      'Send an invitation link to your partner to start sharing appreciation badges together.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Invite', onPress: () => console.log('Sending invite...') },
      ]
    );
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
            MockAuth.signOut();
            router.replace('/(auth)/auth');
          }
        },
      ]
    );
  };

  const currentUser = MockAuth.getCurrentUser();

  const renderUserInfo = () => (
    <View style={styles.userInfoContainer}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <User color="#FF8C42" size={32} />
        </View>
        <View style={styles.partnerStatus}>
          <Heart color="#4ECDC4" size={16} />
        </View>
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{currentUser?.displayName || 'User'}</Text>
        <Text style={styles.userSubtitle}>
          {currentUser?.partnerName ? `Connected with ${currentUser.partnerName} ❤️` : 'No partner connected'}
        </Text>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Your Impact</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>61</Text>
          <Text style={styles.statLabel}>Badges Sent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>58</Text>
          <Text style={styles.statLabel}>Badges Received</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>86</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
      </View>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings color="#666" size={24} />
        </TouchableOpacity>
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
              HelpCircle,
              'Help & FAQs',
              'Get answers to common questions',
              () => console.log('Open help')
            )}
            {renderSettingsItem(
              LogOut,
              'Sign Out',
              'Sign out of your account',
              handleSignOut
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
});