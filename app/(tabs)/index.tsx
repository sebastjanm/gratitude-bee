import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
  StatusBar as RNStatusBar,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Star, Smile, Compass, MessageCircle, HelpCircle, Award, Gift, Bell, Bug, Crown, ArrowUpCircle, ArrowDownCircle, Home, ChevronDown, ChevronUp, Users, ArrowRight } from 'lucide-react-native';
import { HandHeart } from 'lucide-react-native';
import NegativeBadgeModal from '@/components/NegativeBadgeModal';
import DontPanicModal, { DontPanicTemplate } from '@/components/DontPanicModal';
import AppreciationModal from '@/components/AppreciationModal';
import RelationshipWisdomModal from '@/components/RelationshipWisdomModal';
import FavorsModal from '@/components/FavorsModal';
import QuickSendActions from '@/components/QuickSendActions';
import TodayTip from '@/components/TodayTip';
import PingModal, { PingTemplate } from '@/components/PingModal';
import EngagementCard from '@/components/EngagementCard';
import BraveryBadge from '@/components/BraveryBadge';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

interface BadgeCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  count: number;
}

const badgeCategoryConfig: Omit<BadgeCategory, 'count'>[] = [
  { id: 'kindness', name: 'Kindness', icon: Heart, color: Colors.primary, description: 'Gentle caring actions' },
  { id: 'support', name: 'Support', icon: Star, color: Colors.info, description: 'Being there when needed' },
  { id: 'humor', name: 'Humor', icon: Smile, color: Colors.warning, description: 'Bringing joy with laughter' },
  { id: 'adventure', name: 'Adventure', icon: Compass, color: Colors.success, description: 'Shared experiences' },
  { id: 'words', name: 'Love Notes', icon: MessageCircle, color: Colors.gray600, description: 'Words of affirmation' },
];

const statsConfig = [
  { key: 'sent_today', name: 'Sent Today', icon: ArrowUpCircle, color: Colors.success, description: 'Appreciations you sent today.' },
  { key: 'received_today', name: 'Received Today', icon: ArrowDownCircle, color: Colors.primary, description: 'Appreciations you received today.' },
  { key: 'favor_points', name: 'Favor Points', icon: Gift, color: Colors.warning, description: 'Use these to ask for special favors.' },
  { key: 'appreciation_points', name: 'Appreciation', icon: Award, color: Colors.info, description: 'Your total positive karma.' },
];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [showNegativeModal, setShowNegativeModal] = useState(false);
  const [showDontPanicModal, setShowDontPanicModal] = useState(false);
  const [showAppreciationModal, setShowAppreciationModal] = useState(false);
  const [showRelationshipWisdomModal, setShowRelationshipWisdomModal] = useState(false);
  const [showFavorsModal, setShowFavorsModal] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [favorPoints, setFavorPoints] = useState(45);
  const [heartAnimation] = useState(new Animated.Value(1));
  const [stats, setStats] = useState({ sent_today: 0, received_today: 0, favor_points: 0, appreciation_points: 0 });
  const [engagementStage, setEngagementStage] = useState<'boring' | 'demanding' | 'sad' | 'spark' | 'love' | 'none'>('boring');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [hasPartner, setHasPartner] = useState<boolean | null>(null);
  const { session } = useSession();
  const insets = useSafeAreaInsets();

  const userName = session?.user?.user_metadata?.display_name || 'Breda';

  useEffect(() => {
    if (session?.user) {
      fetchStats();
      checkPartnerStatus();
    }
  }, [session]);
  
  const checkPartnerStatus = async () => {
    if (!session?.user) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();
      
    if (!error && data) {
      setHasPartner(!!data.partner_id);
    }
  };
  
  const fetchStats = async (isRefresh = false) => {
    if (!session?.user) return;
    
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      // setLoadingStats(true); // This state variable is no longer used
    }
    
    const { data, error } = await supabase.rpc('get_daily_stats', {
      p_user_id: session.user.id
    });

    if (error) {
      Alert.alert('Error', 'Could not fetch your daily stats.');
    } else if (data && data.length > 0) {
      const newStats = { ...data[0] };
      setStats(newStats);
      calculateEngagementStage(newStats.sent_today, newStats.received_today);
    }
    
    if (isRefresh) {
      setIsRefreshing(false);
    } else {
      // setLoadingStats(false); // This state variable is no longer used
    }
  };

  const onRefresh = () => {
    fetchStats();
  };

  const toggleStatsExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsStatsExpanded(!isStatsExpanded);
  };

  const getDailyDeterministicRandom = () => {
    const seed = new Date().toDateString();
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 100) / 100;
  };

  const calculateEngagementStage = (sent: number, received: number) => {
    // Favors and Hornets have a higher weight in the interaction score
    const interactionScore = sent * 1 + received * 1.5;

    if (interactionScore > 20) {
      setEngagementStage('none'); // Goal achieved, no card needed
    } else if (interactionScore > 15) {
      setEngagementStage('love');
    } else if (interactionScore > 10) {
      setEngagementStage('spark');
    } else if (interactionScore > 5) {
      setEngagementStage('sad');
    } else if (interactionScore > 0) {
      setEngagementStage('demanding');
    } else {
      setEngagementStage('boring');
    }
  };

  React.useEffect(() => {
    const animateHeart = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(heartAnimation, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(heartAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateHeart();
  }, [heartAnimation]);

  const handleSendBadge = async (
    categoryId: string, 
    badgeId: string, 
    badgeTitle: string, 
    badgeIcon: string, 
    points: number, 
    pointsIcon: string,
    description?: string,
    notificationText?: string
  ) => {
    if (!session) {
      Alert.alert('Not authenticated', 'You must be logged in to send a badge.');
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData || !userData.partner_id) {
      Alert.alert(
        'Not Connected', 
        'You must be connected to a partner to send badges.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Now', onPress: () => router.push('/(modals)/connect-partner') }
        ]
      );
      return;
    }

    const eventPayload = {
      sender_id: session.user.id,
      receiver_id: userData.partner_id,
      event_type: 'APPRECIATION',
      content: {
        category_id: categoryId,
        badge_id: badgeId,
        title: badgeTitle,
        icon: badgeIcon,
        points: points,
        points_icon: pointsIcon,
        description: description,
        notification_text: notificationText,
      },
    };

    const { data: eventData, error } = await supabase.from('events').insert(eventPayload).select().single();

    if (error) {
      Alert.alert('Error', 'Could not send the badge. Please try again.');
    } else {
      Alert.alert(
        'Badge Sent! 🎉',
        `Your "${badgeTitle}" appreciation has been sent to your partner.`,
        [{ text: 'OK' }]
      );
      
      // Now, invoke the notification function
      const { error: notificationError } = await supabase.functions.invoke('send-notification', {
        body: { record: eventData }, // Pass the newly created event record
      });

      if (notificationError) {
        // Log the error but don't show another alert to the user,
        // as the main action (sending the badge) was successful.
      } else {
      }
    }
  };

  const handleSendFavor = async (favorId: string, favorTitle: string, points: number, description: string, customMessage?: string) => {
    if (!session) {
      Alert.alert('Not authenticated', 'You must be logged in to request a favor.');
      return;
    }
  
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();
  
    if (userError || !userData) {
      Alert.alert('Error', 'Could not find your profile.');
      return;
    }
  
    if (!userData.partner_id) {
      Alert.alert(
        'Not Connected', 
        'You must be connected to a partner to request favors.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Connect Now', onPress: () => router.push('/(modals)/connect-partner') }
        ]
      );
      return;
    }
  
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('favor_points')
      .eq('user_id', session.user.id)
      .single();
  
    if (walletError || !walletData) {
      Alert.alert('Error', 'Could not find your favor points balance.');
      return;
    }
  
    if (walletData.favor_points < points) {
      Alert.alert('Not Enough Points', `You need ${points} favor points, but you only have ${walletData.favor_points}.`);
      return;
    }
  
    const { error } = await supabase.from('events').insert([
      {
        sender_id: session.user.id,
        receiver_id: userData.partner_id,
        event_type: 'FAVOR_REQUEST',
        status: 'PENDING',
        content: {
          favor_id: favorId,
          title: favorTitle,
          points,
          description,
          message: customMessage,
        },
      },
    ]);
  
    if (error) {
      Alert.alert('Error', 'Could not send the favor request. Please try again.');
    } else {
      Alert.alert(
        'Favor Requested! 🙏',
        `Your "${favorTitle}" request has been sent for ${points} points.`,
        [{ text: 'OK' }]
      );
      
      // Manually invoke the notification function
      const { data: eventData, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('sender_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (fetchError) {
      } else {
        const { error: notificationError } = await supabase.functions.invoke('send-notification', {
          body: { record: eventData },
        });
        if (notificationError) {
        }
      }
    }
  };

  const handleSendHornet = async (message: string, selectedOption: any) => {
    if (!session?.user?.id || !selectedOption) return;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData?.partner_id) {
      Alert.alert('Error', 'Could not find your partner to send a hornet.');
      return;
    }

    const eventPayload = {
      sender_id: session.user.id,
      receiver_id: userData.partner_id,
      event_type: 'HORNET',
      content: {
        template_id: selectedOption.id,
        title: selectedOption.name,
        description: message,
        points: selectedOption.points,
      },
    };

    const { data: eventData, error } = await supabase.from('events').insert(eventPayload).select().single();

    if (error) {
      Alert.alert('Error', 'Could not send the hornet. Please try again.');
    } else {
      Alert.alert('Hornet Sent', 'Your message has been delivered.');
    }
  };

  const handleSendDontPanic = async (template: DontPanicTemplate) => {
    if (!session?.user?.id) return;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData?.partner_id) {
      Alert.alert('Error', 'Could not find your partner to send this message.');
      return;
    }

    const eventPayload = {
      sender_id: session.user.id,
      receiver_id: userData.partner_id,
      event_type: 'DONT_PANIC',
      content: {
        template_id: template.id,
        title: template.title,
        description: template.description,
        points: template.points,
        icon: template.icon,
        color: template.color,
      },
    };

    const { data: eventData, error } = await supabase.from('events').insert(eventPayload).select().single();

    if (error) {
      Alert.alert('Error', 'Could not send the message. Please try again.');
    } else {
      Alert.alert('Message Sent', 'Your partner has been notified.');
      const { error: notificationError } = await supabase.functions.invoke('send-notification', {
        body: { record: eventData },
      });
      if (notificationError) {
      }
    }
  };

  const handleSendWisdom = async (wisdom: any) => {
    if (!session?.user?.id) return;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();
    
    if (userError || !userData?.partner_id) {
      Alert.alert('Error', 'Could not find your partner to send wisdom.');
      return;
    }

    const eventPayload = {
      sender_id: session.user.id,
      receiver_id: userData.partner_id,
      event_type: 'WISDOM',
      content: {
        template_id: wisdom.id,
        title: wisdom.title,
        description: wisdom.description,
      },
    };
    
    const { data: eventData, error } = await supabase.from('events').insert(eventPayload).select().single();

    if (error) {
      Alert.alert('Error', 'Could not send wisdom. Please try again.');
    } else {
      Alert.alert('Wisdom Sent!', 'Your partner has received your wise words.');
      
      // FIX: Manually invoke the notification function
      const { error: notificationError } = await supabase.functions.invoke('send-notification', {
        body: { record: eventData },
      });

      if (notificationError) {
      }
    }
  };

  const handleSendPing = async (template: PingTemplate) => {
    if (!session?.user?.id) return;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData?.partner_id) {
      Alert.alert('Error', 'Could not find your partner to send a ping.');
      return;
    }

    const eventPayload = {
      sender_id: session.user.id,
      receiver_id: userData.partner_id,
      event_type: 'PING',
      content: {
        title: template.title,
        description: template.description,
        points: template.points,
        icon: template.icon,
        color: template.color,
      },
    };

    const { data: eventData, error } = await supabase.from('events').insert(eventPayload).select().single();

    if (error) {
      Alert.alert('Error', 'Could not send the ping. Please try again.');
    } else {
      Alert.alert('Ping Sent!', 'Your partner has been notified.');
      const { error: notificationError } = await supabase.functions.invoke('send-notification', {
        body: { record: eventData },
      });
      if (notificationError) {
      }
    }
  };

  const renderStats = () => {
    if (isStatsExpanded) {
      // Expanded list view
      return (
        <View style={{ paddingTop: 16 }}>
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            const value = stats[stat.key as keyof typeof stats] ?? 0;
            return (
              <View key={stat.key} style={[styles.statItemExpanded, index === 0 && { paddingTop: 0 }]}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20', alignSelf: 'flex-start' }]}>
                  <Icon color={stat.color} size={22} />
                </View>
                <View style={styles.statTextExpanded}>
                  <View style={styles.statHeaderExpanded}>
                    <Text style={styles.statLabel}>{stat.name}</Text>
                    <Text style={styles.statNumber}>{value}</Text>
                  </View>
                  <Text style={styles.statDescriptionExpanded}>{stat.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      );
    }
    return (
      <View style={styles.statsGrid}>
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          const value = stats[stat.key as keyof typeof stats] ?? 0;
          return (
            <View key={stat.key} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Icon color={stat.color} size={22} />
              </View>
              <Text style={styles.statNumber}>{value}</Text>
              <Text style={styles.statLabel}>{stat.name}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      // paddingBottom: insets.bottom, // This is likely causing the extra space on iOS
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <StatusBar style="dark" backgroundColor="#FFF8F0" translucent={false} />
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Home color={Colors.primary} size={28} />
            <Text style={styles.title}>Hi, <Text style={styles.headerName}>{userName}</Text></Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => {
            try {
              router.push('/help');
            } catch (error) {
            }
          }}>
            <HelpCircle color={Colors.textSecondary} size={Layout.iconSize.lg} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>How are you doing today?</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            title="Pull to refresh"
            titleColor={Colors.textSecondary}
          />
        }
      >
        <View style={{ height: 20 }} />

        {hasPartner === false && (
          <TouchableOpacity 
            style={styles.partnerConnectBanner}
            onPress={() => router.push('/(modals)/connect-partner')}
            activeOpacity={0.8}>
            <View style={styles.partnerConnectIcon}>
              <Users color={Colors.primary} size={Layout.iconSize.lg} />
            </View>
            <View style={styles.partnerConnectText}>
              <Text style={styles.partnerConnectTitle}>Connect with Your Partner</Text>
              <Text style={styles.partnerConnectSubtitle}>
                Start sharing appreciation badges together
              </Text>
            </View>
            <ArrowRight color={Colors.primary} size={Layout.iconSize.md} />
          </TouchableOpacity>
        )}

        {engagementStage !== 'none' && hasPartner && (
          <EngagementCard stage={engagementStage} />
        )}



        <TouchableOpacity activeOpacity={0.8} onPress={toggleStatsExpansion}>
          <View style={styles.statsContainer}>
            <View style={styles.statsHeaderRow}>
              <Text style={styles.statsTitle}>Today's Snapshot</Text>
              {isStatsExpanded ? <ChevronUp color={Colors.textSecondary} size={Layout.iconSize.md} /> : <ChevronDown color={Colors.textSecondary} size={Layout.iconSize.md} />}
            </View>
            {renderStats()}
          </View>
        </TouchableOpacity>

        <View style={{ height: 8 }} />

        <QuickSendActions
          onShowAppreciationModal={() => setShowAppreciationModal(true)}
          onShowFavorsModal={() => setShowFavorsModal(true)}
          onShowPingModal={() => setShowPingModal(true)}
          onShowDontPanicModal={() => setShowDontPanicModal(true)}
          onShowNegativeModal={() => setShowNegativeModal(true)}
          onShowRelationshipWisdomModal={() => setShowRelationshipWisdomModal(true)}
          heartAnimation={heartAnimation}
        />
        
        <View style={{ height: 24 }} />
        
        <TodayTip />

        <View style={{ height: 24 }} />

        <View style={styles.specialActions}>
          <NegativeBadgeModal
            visible={showNegativeModal}
            onClose={() => setShowNegativeModal(false)}
            onSend={handleSendHornet}
          />
          
          <DontPanicModal
            visible={showDontPanicModal}
            onClose={() => setShowDontPanicModal(false)}
            onSend={handleSendDontPanic}
          />
          
          <AppreciationModal
            visible={showAppreciationModal}
            onClose={() => setShowAppreciationModal(false)}
            onSendBadge={handleSendBadge}
          />
          
          <RelationshipWisdomModal
            visible={showRelationshipWisdomModal}
            onClose={() => setShowRelationshipWisdomModal(false)}
            onSendWisdom={handleSendWisdom}
          />
          
          <FavorsModal
            visible={showFavorsModal}
            onClose={() => setShowFavorsModal(false)}
            onSendFavor={handleSendFavor}
            currentFavorPoints={favorPoints}
          />

          <PingModal
            visible={showPingModal}
            onClose={() => setShowPingModal(false)}
            onSendPing={handleSendPing}
          />
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
    flex: 1,
  },
  title: {
    ...ComponentStyles.text.h2,
    marginLeft: Spacing.md,
  },
  headerName: {
    color: Colors.primary,
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.md,
  },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
  },
  scrollView: {
    flex: 1,
  },
  streakCard: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  streakTitle: {
    ...ComponentStyles.text.h3,
    marginLeft: Spacing.sm,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  streakLabel: {
    ...ComponentStyles.text.caption,
    marginTop: Spacing.xs,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },
  streakEncouragement: {
    ...ComponentStyles.text.caption,
    textAlign: 'center',
  },
  categoryCard: {
    width: (width - (Layout.screenPadding * 2) - Spacing.md) / 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    backgroundColor: Colors.backgroundElevated,
    ...Shadows.sm,
  },
  selectedCategory: {
    borderColor: Colors.primary,
    transform: [{ scale: 1.02 }],
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    ...ComponentStyles.text.caption,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  sendButton: {
    ...ComponentStyles.button.primary,
    paddingVertical: Spacing.md,
    ...Shadows.md,
  },
  sendButtonText: {
    ...ComponentStyles.button.text.primary,
  },
  collectionContainer: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  collectionTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  categoryItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 20,
  },
  collectionCategoryIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  collectionCategoryCount: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  collectionCategoryName: {
    ...ComponentStyles.text.caption,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  statsContainer: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  statsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statsTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  statsSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  statItemExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statTextExpanded: {
    flex: 1,
    marginLeft: 12,
  },
  statHeaderExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statDescriptionExpanded: {
    ...ComponentStyles.text.caption,
  },
  statsHeader: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialActions: {
    marginTop: 20,
    marginBottom: 24,
  },
  partnerConnectBanner: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  partnerConnectIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  partnerConnectText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  partnerConnectTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  partnerConnectSubtitle: {
    ...ComponentStyles.text.caption,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
});

