import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
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
  Search,
  ChevronRight,
  LogOut,
  Shield,
  FileText,
  Share2,
  Smartphone,
  Heart,
  Calendar,
  CircleHelp as HelpCircleIcon
} from 'lucide-react-native';
import { useSession } from '@/providers/SessionProvider';
import { supabase } from '@/utils/supabase';
import Constants from 'expo-constants';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const appVersion = Constants.expoConfig?.version ?? 'N/A';
  const buildNumber = Constants.nativeBuildVersion ?? 'N/A';

  useEffect(() => {
    if (session) {
      fetchUserInfo();
    }
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

  const menuSections: MenuSection[] = [
    {
      id: 'account',
      title: 'Account & Profile',
      icon: User,
      color: Colors.primary,
      items: [
        { title: 'Edit Profile', subtitle: 'Update your information', route: '/more/profile' },
        { title: 'Partner Connection', subtitle: partnerName || 'Not connected', route: '/more/partner' },
        { title: 'Security Settings', subtitle: 'Password and privacy', route: '/more/security' },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics & Progress',
      icon: BarChart3,
      color: Colors.info,
      items: [
        { title: 'Relationship Analytics', subtitle: 'View detailed stats', route: '/more/analytics' },
        { title: 'Activity Insights', subtitle: 'Your patterns and trends', route: '/more/insights' },
        { title: 'Achievement Progress', subtitle: 'Track your milestones', route: '/more/achievements' },
        { title: 'Export Reports', subtitle: 'Download your data', route: '/more/export' },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications & Reminders',
      icon: Bell,
      color: Colors.warning,
      items: [
        { title: 'Push Notifications', subtitle: 'Manage alerts', route: '/more/notifications' },
        { title: 'Daily Reminders', subtitle: 'Set appreciation reminders', route: '/more/reminders' },
        { title: 'Nudge Settings', subtitle: 'Random partner reminders', route: '/more/nudges' },
        { title: 'Quiet Hours', subtitle: 'Do not disturb times', route: '/more/quiet-hours' },
      ],
    },
    {
      id: 'goals',
      title: 'Goals & Preferences',
      icon: Target,
      color: Colors.success,
      items: [
        { title: 'Weekly Goals', subtitle: 'Set your targets', route: '/more/goals' },
        { title: 'Favorite Categories', subtitle: 'Customize quick actions', route: '/more/categories' },
        { title: 'Display Preferences', subtitle: 'Theme and appearance', route: '/more/display' },
        { title: 'Language Settings', subtitle: 'English', route: '/more/language' },
      ],
    },
    {
      id: 'tools',
      title: 'Tools & Features',
      icon: Wrench,
      color: '#8B5CF6',
      items: [
        { title: 'Invite Partner', subtitle: 'Send connection request', icon: Smartphone, action: () => router.push('/connect-partner') },
        { title: 'Export Memory Book', subtitle: 'Create shareable timeline', icon: Share2, route: '/more/export-book' },
        { title: 'Share Achievements', subtitle: 'Show your progress', route: '/more/share' },
        { title: 'Backup Data', subtitle: 'Save your memories', route: '/more/backup' },
      ],
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      color: Colors.gray600,
      items: [
        { title: 'FAQ & Tutorials', subtitle: 'Common questions', icon: HelpCircleIcon, action: () => router.push('/help') },
        { title: 'Video Guides', subtitle: 'Watch how-to videos', route: '/more/videos' },
        { title: 'Contact Support', subtitle: 'Get help from team', route: '/more/contact' },
        { title: 'Report Issue', subtitle: 'Help us improve', route: '/more/report' },
      ],
    },
    {
      id: 'about',
      title: 'About & Legal',
      icon: Info,
      color: Colors.gray500,
      items: [
        { title: 'Terms of Service', icon: FileText, action: () => router.push('/terms') },
        { title: 'Privacy Policy', icon: Shield, action: () => router.push('/privacy') },
        { title: 'Impressum', icon: Info, action: () => router.push('/impressum') },
        { title: 'Version', subtitle: `${appVersion} (Build ${buildNumber})`, icon: Info },
      ],
    },
  ];

  const filteredSections = searchQuery
    ? menuSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      })).filter(section => section.items.length > 0)
    : menuSections;

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
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
        <TouchableOpacity onPress={() => router.push('/help')} style={styles.helpButton}>
          <HelpCircle color={Colors.textSecondary} size={Layout.iconSize.lg} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.textTertiary} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search settings..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/more/profile')}>
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
            <Text style={styles.profileStatus}>
              {partnerName ? `Connected to ${partnerName} ❤️` : 'Not connected'}
            </Text>
          </View>
        </View>
        <ChevronRight color={Colors.textTertiary} size={20} />
      </TouchableOpacity>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredSections.map(renderSection)}
        
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
    paddingBottom: Spacing.md,
  },
  title: {
    ...ComponentStyles.text.h1,
  },
  helpButton: {
    padding: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...ComponentStyles.text.body,
    color: Colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
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
  content: {
    flex: 1,
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