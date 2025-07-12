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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Star, Smile, Compass, MessageCircle, HelpCircle, Award, Gift, Bell, Bug, Crown, ArrowUpCircle, ArrowDownCircle, Home } from 'lucide-react-native';
import { HandHeart } from 'lucide-react-native';
import NegativeBadgeModal from '@/components/NegativeBadgeModal';
import DontPanicModal from '@/components/DontPanicModal';
import AppreciationModal from '@/components/AppreciationModal';
import RelationshipWisdomModal from '@/components/RelationshipWisdomModal';
import FavorsModal from '@/components/FavorsModal';
import QuickSendActions from '@/components/QuickSendActions';
import TodayTip from '@/components/TodayTip';
import PingModal from '@/components/PingModal';
import SadCatCard from '@/components/SadCatCard';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { router } from 'expo-router';

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
  { id: 'kindness', name: 'Kindness', icon: Heart, color: '#FF6B9D', description: 'Gentle caring actions' },
  { id: 'support', name: 'Support', icon: Star, color: '#4ECDC4', description: 'Being there when needed' },
  { id: 'humor', name: 'Humor', icon: Smile, color: '#FFD93D', description: 'Bringing joy with laughter' },
  { id: 'adventure', name: 'Adventure', icon: Compass, color: '#6BCF7F', description: 'Shared experiences' },
  { id: 'words', name: 'Love Notes', icon: MessageCircle, color: '#A8E6CF', description: 'Words of affirmation' },
];

const statsConfig = [
  { key: 'sent_today', name: 'Sent Today', icon: ArrowUpCircle, color: '#4ECDC4' },
  { key: 'received_today', name: 'Received Today', icon: ArrowDownCircle, color: '#FF6B9D' },
  { key: 'favor_points', name: 'Favor Points', icon: Gift, color: '#FFD93D' },
];

export default function HomeScreen() {
  const [showNegativeModal, setShowNegativeModal] = useState(false);
  const [showDontPanicModal, setShowDontPanicModal] = useState(false);
  const [showAppreciationModal, setShowAppreciationModal] = useState(false);
  const [showRelationshipWisdomModal, setShowRelationshipWisdomModal] = useState(false);
  const [showFavorsModal, setShowFavorsModal] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [favorPoints, setFavorPoints] = useState(45);
  const [heartAnimation] = useState(new Animated.Value(1));
  const [stats, setStats] = useState({
    sent_today: 0,
    received_today: 0,
    favor_points: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useSession();
  const insets = useSafeAreaInsets();

  const userName = session?.user?.user_metadata?.display_name || 'Breda';

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);
  
  const fetchStats = async (isRefresh = false) => {
    if (!session?.user) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingStats(true);
    }
    
    const { data, error } = await supabase.rpc('get_daily_stats', {
      p_user_id: session.user.id
    });

    if (error) {
      console.error('Error fetching daily stats:', error);
      Alert.alert('Error', 'Could not fetch your daily stats.');
    } else if (data) {
      setStats({
        sent_today: data[0].sent_today,
        received_today: data[0].received_today,
        favor_points: data[0].favor_points,
      });
    }
    
    if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoadingStats(false);
    }
  };

  const onRefresh = () => {
    fetchStats(true);
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
      Alert.alert('Not Connected', 'You must be connected to a partner to send badges.');
      return;
    }

    const { error } = await supabase.from('events').insert([
      {
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
      },
    ]);

    if (error) {
      Alert.alert('Error', 'Could not send the badge. Please try again.');
      console.error(error);
    } else {
      Alert.alert(
        'Badge Sent! 🎉',
        `Your "${badgeTitle}" appreciation has been sent to your partner.`,
        [{ text: 'OK' }]
      );
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
      Alert.alert('Not Connected', 'You must be connected to a partner to request favors.');
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
      console.error(error);
    } else {
      Alert.alert(
        'Favor Requested! 🙏',
        `Your "${favorTitle}" request has been sent for ${points} points.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSendHornet = async (message: string, selectedOption: any) => {
    if (!session) {
      Alert.alert('Not authenticated', 'You must be logged in to send a hornet.');
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('partner_id')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData || !userData.partner_id) {
      Alert.alert('Not Connected', 'You must be connected to a partner to send a hornet.');
      return;
    }

    const { error } = await supabase.from('events').insert([
      {
        sender_id: session.user.id,
        receiver_id: userData.partner_id,
        event_type: 'HORNET',
        content: {
          hornet_id: selectedOption.id,
          title: selectedOption.title,
          points: selectedOption.count,
          message: message,
          severity: selectedOption.severity,
        },
      },
    ]);

    if (error) {
      Alert.alert('Error', 'Could not send the hornet. Please try again.');
    } else {
      Alert.alert(
        'Hornet Sent',
        `Your accountability hornet has been sent.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSendDontPanic = async (message: string, quickResponse?: string) => {
    if (!session) return;
    const { data: partnerData } = await supabase.from('users').select('partner_id').eq('id', session.user.id).single();
    if (!partnerData?.partner_id) return;

    const { error } = await supabase.from('events').insert([
      {
        sender_id: session.user.id,
        receiver_id: partnerData.partner_id,
        event_type: 'DONT_PANIC',
        content: { title: quickResponse, message, description: message },
      },
    ]);

    if (error) Alert.alert('Error', 'Could not send the message.');
    else Alert.alert('Message Sent', 'Your calming message has been sent.');
  };

  const handleSendWisdom = async (wisdomId: string, wisdomTitle: string, wisdomDescription: string) => {
    if (!session) return;
    const { data: partnerData } = await supabase.from('users').select('partner_id').eq('id', session.user.id).single();
    if (!partnerData?.partner_id) return;

    const { error } = await supabase.from('events').insert([
      {
        sender_id: session.user.id,
        receiver_id: partnerData.partner_id,
        event_type: 'WISDOM',
        content: { wisdom_id: wisdomId, title: wisdomTitle, description: wisdomDescription },
      },
    ]);
    if (error) Alert.alert('Error', 'Could not send the wisdom.');
    else Alert.alert('Wisdom Sent', 'Your wise words have been shared.');
  };

  const handleSendPing = async (pingId: string, pingTitle: string, description: string) => {
    if (!session) return;
    const { data: partnerData } = await supabase.from('users').select('partner_id').eq('id', session.user.id).single();
    if (!partnerData?.partner_id) return;

    const { error } = await supabase.from('events').insert([
      {
        sender_id: session.user.id,
        receiver_id: partnerData.partner_id,
        event_type: 'PING_SENT',
        content: { ping_id: pingId, title: pingTitle, description: description },
      },
    ]);

    if (error) {
      Alert.alert('Error', 'Could not send the ping.');
    } else {
      Alert.alert('Ping Sent!', `Your "${pingTitle}" ping has been sent.`);
    }
  };

  const shouldShowSadCat = () => {
    // Don't show after 10 sent messages
    if (stats.sent_today >= 10) return false;
    
    // Always show if no messages sent
    if (stats.sent_today === 0) return true;
    
    // Random chance decreases as messages increase
    // 0-2 messages: 80% chance
    // 3-5 messages: 60% chance  
    // 6-7 messages: 40% chance
    // 8-9 messages: 20% chance
    const chances = [1, 0.8, 0.8, 0.6, 0.6, 0.6, 0.4, 0.4, 0.2, 0.2];
    const chance = chances[stats.sent_today] || 0;
    
    // Use a deterministic random based on current date and stats for consistency
    const seed = new Date().toDateString() + stats.sent_today + stats.received_today;
    const hash = seed.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const random = Math.abs(hash % 100) / 100;
    
    return random < chance;
  };

  const renderStats = () => {
    // Show sad cat card randomly until 10 sent messages
    if (shouldShowSadCat()) {
      return <SadCatCard sentToday={stats.sent_today} />;
    }

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Today's Stats <Text style={styles.statsSubtitle}>(restarts every 24 hours)</Text></Text>
        <View style={styles.statsGrid}>
          {statsConfig.map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.key} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Icon color={stat.color} size={22} />
                </View>
                <Text style={styles.statNumber}>{stats[stat.key as keyof typeof stats]}</Text>
                <Text style={styles.statLabel}>{stat.name}</Text>
              </View>
            );
          })}
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
      <StatusBar style="dark" backgroundColor="#FFF8F0" translucent={false} />
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Home color="#FF8C42" size={28} />
            <Text style={styles.title}>Hi, <Text style={styles.headerName}>{userName}</Text></Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => {
            console.log('Help button pressed - navigating to /help');
            try {
              router.push('/help');
              console.log('Navigation completed successfully');
            } catch (error) {
              console.error('Navigation error:', error);
            }
          }}>
            <HelpCircle color="#666" size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>How are you doing today?</Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8C42']}
            tintColor="#FF8C42"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        {loadingStats ? <ActivityIndicator color="#FF8C42" size="large" /> : renderStats()}

        <QuickSendActions
          onShowAppreciationModal={() => setShowAppreciationModal(true)}
          onShowFavorsModal={() => setShowFavorsModal(true)}
          onShowRelationshipWisdomModal={() => setShowRelationshipWisdomModal(true)}
          onShowDontPanicModal={() => setShowDontPanicModal(true)}
          onShowNegativeModal={() => setShowNegativeModal(true)}
          onShowPingModal={() => setShowPingModal(true)}
          heartAnimation={heartAnimation}
        />

        <TodayTip />
      </ScrollView>
      
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
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow content to take up space
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginLeft: 12,
  },
  headerName: {
    color: '#FF8C42',
  },
  headerButton: {
    padding: 8,
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  streakCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 8,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
  },
  streakLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
  },
  streakEncouragement: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  categoryCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedCategory: {
    borderColor: '#FF8C42',
    transform: [{ scale: 1.02 }],
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF8C42',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  sendButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  collectionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginTop: 20, // Add space above this container
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  collectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 20,
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
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionCategoryCount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  collectionCategoryName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
});

/*
Added SadCatCard component that appears randomly until 10 sent messages.
Added pull-down refresh functionality to update stats.

CREATE OR REPLACE FUNCTION get_daily_stats(p_user_id uuid)
RETURNS TABLE(sent_today bigint, received_today bigint, favor_points integer) AS $$
BEGIN
    RETURN QUERY
    WITH daily_events AS (
        SELECT * FROM events
        WHERE created_at >= date_trunc('day', now()) AND created_at < date_trunc('day', now()) + interval '1 day'
    )
    SELECT
        (SELECT count(*) FROM daily_events WHERE sender_id = p_user_id) AS sent_today,
        (SELECT count(*) FROM daily_events WHERE receiver_id = p_user_id) AS received_today,
        (SELECT w.favor_points FROM wallets w WHERE w.user_id = p_user_id) AS favor_points;
END;
$$ LANGUAGE plpgsql;
*/