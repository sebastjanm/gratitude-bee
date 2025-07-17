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
  { key: 'appreciation_points', name: 'Appreciation', icon: Award, color: '#A8E6CF' },
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
  const [stats, setStats] = useState({ sent_today: 0, received_today: 0, favor_points: 0, appreciation_points: 0 });
  const [engagementStage, setEngagementStage] = useState<'boring' | 'demanding' | 'sad' | 'spark' | 'love' | 'none'>('boring');
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      Alert.alert('Not Connected', 'You must be connected to a partner to send badges.');
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
            <Home color="#FF8C42" size={28} />
            <Text style={styles.title}>Hi, <Text style={styles.headerName}>{userName}</Text></Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => {
            try {
              router.push('/help');
            } catch (error) {
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
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#FF8C42']}
            tintColor="#FF8C42"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        <View style={{ height: 32 }} />


        {engagementStage !== 'none' && (
          <EngagementCard stage={engagementStage} />
        )}



        <View style={styles.statsContainer}>
          {renderStats()}
        </View>

        <View style={{ height: 32 }} />

        <QuickSendActions
          onShowAppreciationModal={() => setShowAppreciationModal(true)}
          onShowFavorsModal={() => setShowFavorsModal(true)}
          onShowPingModal={() => setShowPingModal(true)}
          onShowDontPanicModal={() => setShowDontPanicModal(true)}
          onShowNegativeModal={() => setShowNegativeModal(true)}
          onShowRelationshipWisdomModal={() => setShowRelationshipWisdomModal(true)}
          heartAnimation={heartAnimation}
        />
        
        <TodayTip />

        <View style={{ height: 32 }} />

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
  statsHeader: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialActions: {
    marginTop: 20,
    marginBottom: 24,
  },
});

