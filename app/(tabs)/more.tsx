import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  User, 
  BarChart3, 
  Bell, 
  Target, 
  Wrench,
  HelpCircle, 
  Info,
  ChevronRight,
  LogOut,
  Shield,
  FileText,
  Share2,
  Smartphone,
  Heart,
  Calendar,
  Mail,
  Video,
  Settings,
  CircleHelp as HelpCircleIcon,
  Lock
} from 'lucide-react-native';
import { useSession } from '@/providers/SessionProvider';
import { supabase } from '@/utils/supabase';
import Constants from 'expo-constants';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MenuSection {
  id: string;
  title: string;
  icon: any;
  color: string;
  items: MenuItem[];
}

interface MenuItem {
  title: string;
  subtitle?: string;
  icon?: any;
  route?: string;
  action?: () => void;
  rightElement?: React.ReactNode;
}

export default function MoreScreen() {
  const { session, setSession } = useSession();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('English');

  const appVersion = Constants.expoConfig?.version ?? 'N/A';
  const buildNumber = Constants.nativeBuildVersion ?? 'N/A';

  useEffect(() => {
    if (session) {
      fetchUserInfo();
    }
    loadCurrentLanguage();
  }, [session]);

  const fetchUserInfo = async () => {
    if (!session) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('display_name, avatar_url, partner_id')
      .eq('id', session.user.id)
      .single();
      
    if (data) {
      setDisplayName(data.display_name || 'User');
      setAvatarUrl(data.avatar_url);
      
      if (data.partner_id) {
        const { data: partnerData } = await supabase
          .from('users')
          .select('display_name')
          .eq('id', data.partner_id)
          .single();
          
        if (partnerData) {
          setPartnerName(partnerData.display_name);
        }
      }
    }
  };

  const loadCurrentLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        // Find the language object that matches the saved code
        const languageData = [
          { code: 'en', name: 'English' },
          { code: 'es', name: 'Spanish' },
          { code: 'fr', name: 'French' },
          { code: 'de', name: 'German' },
          { code: 'it', name: 'Italian' },
          { code: 'pt', name: 'Portuguese' },
          { code: 'nl', name: 'Dutch' },
          { code: 'pl', name: 'Polish' },
          { code: 'ru', name: 'Russian' },
          { code: 'ja', name: 'Japanese' },
          { code: 'zh', name: 'Chinese' },
          { code: 'ko', name: 'Korean' },
        ];
        const language = languageData.find(lang => lang.code === savedLanguage);
        if (language) {
          setCurrentLanguage(language.name);
        }
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            setSession(null);
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleContactUs = async () => {
    const email = 'info@gratitudebee.com';
    const subject = 'Support Request - Gratitude Bee App';
    const body = `Hi Gratitude Bee Team,\n\nI need help with:\n\n[Please describe your issue or question here]\n\nApp Version: ${appVersion}\nBuild: ${buildNumber}\nUser: ${displayName || 'Not set'}`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('No Email App', 'Please install an email app to contact support.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email app. Please email us at info@gratitudebee.com');
    }
  };

  const menuSections: MenuSection[] = [
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      color: Colors.info,
      items: [
        { title: 'Relationship Analytics', subtitle: 'View stats and insights', route: '/(more)/analytics' },
      ],
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      color: Colors.warning,
      items: [
        { title: 'Daily Reminders', subtitle: 'Set appreciation reminders', icon: Bell, route: '/(more)/reminders' },
        { title: 'Nudge Settings', subtitle: 'Random partner reminders', icon: Heart, route: '/(more)/nudges' },
        { title: 'Language Settings', subtitle: currentLanguage, icon: Target, route: '/(more)/language' },
        { title: 'Change Password', subtitle: 'Update your password', icon: Lock, route: '/(more)/security' },
      ],
    },
    {
      id: 'tools',
      title: 'Tools',
      icon: Wrench,
      color: '#8B5CF6',
      items: [
        { title: 'Invite Partner', subtitle: 'Send connection request', icon: Smartphone, action: () => router.push('/connect-partner') },
        { title: 'Realtime Diagnostic', subtitle: 'Test WebSocket connection', icon: Wrench, action: () => router.push('/realtime-diagnostic') },
      ],
    },
    {
      id: 'help',
      title: 'Help',
      icon: HelpCircle,
      color: Colors.gray600,
      items: [
        { title: 'FAQ', subtitle: 'Common questions', icon: HelpCircleIcon, action: () => router.push('/(more)/faq') },
        { title: 'Video Guides', subtitle: 'Watch how-to videos', icon: Video, route: '/(more)/video-guides' },
        { title: 'Contact Us', subtitle: 'Get help or report issues', icon: Mail, action: handleContactUs },
      ],
    },
    {
      id: 'about',
      title: 'Legal',
      icon: Info,
      color: Colors.gray500,
      items: [
        { title: 'Terms of Service', icon: FileText, action: () => router.push('/(more)/terms') },
        { title: 'Privacy Policy', icon: Shield, action: () => router.push('/(more)/privacy') },
        { title: 'Impressum', icon: Info, action: () => router.push('/(more)/impressum') },
        { title: 'Version', subtitle: `${appVersion} (Build ${buildNumber})`, icon: Info },
      ],
    },
  ];


  const renderMenuItem = (item: MenuItem, isLast: boolean) => {
    const hasAction = item.route || item.action;
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={item.title}
        style={[styles.menuItem, isLast && styles.lastMenuItem]}
        onPress={() => {
          if (item.route) {
            router.push(item.route as any);
          } else if (item.action) {
            item.action();
          }
        }}
        disabled={!hasAction}
        activeOpacity={hasAction ? 0.7 : 1}
      >
        {IconComponent && (
          <View style={styles.menuItemIcon}>
            <IconComponent color={Colors.textSecondary} size={20} />
          </View>
        )}
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          {item.subtitle && <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>}
        </View>
        {hasAction && (
          <ChevronRight color={Colors.textTertiary} size={20} />
        )}
        {item.rightElement}
      </TouchableOpacity>
    );
  };

  const renderSection = (section: MenuSection) => {
    const IconComponent = section.icon;
    
    return (
      <View key={section.id} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
            <IconComponent color={section.color} size={20} />
          </View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {section.items.map((item, index) => renderMenuItem(item, index === section.items.length - 1))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={[styles.fixedHeaderContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Settings color={Colors.primary} size={28} />
            <Text style={styles.title}>More</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/(more)/help')}>
            <HelpCircle color={Colors.textSecondary} size={Layout.iconSize.lg} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Settings, tools, and information
        </Text>
        
        <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/(more)/profile')}>
          <View style={styles.profileInfo}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <User color={Colors.textSecondary} size={24} />
              </View>
            )}
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileStatus}>View and edit profile</Text>
            </View>
          </View>
          <ChevronRight color={Colors.textTertiary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {menuSections.map(renderSection)}
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut color={Colors.error} size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version {appVersion} (Build {buildNumber})</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  title: {
    ...ComponentStyles.text.h2,
    marginLeft: Spacing.md,
  },
  helpButton: {
    padding: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  fixedHeaderContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileSection: {
    marginBottom: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    marginLeft: Spacing.md,
  },
  profileName: {
    ...ComponentStyles.text.h3,
  },
  profileStatus: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  securityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  securityText: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.medium,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    color: Colors.textSecondary,
  },
  sectionContent: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    marginRight: Spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.medium,
  },
  menuItemSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  signOutText: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  footerText: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
  },
});