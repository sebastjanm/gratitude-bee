import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  Alert,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Heart, Star, Smile, Compass, MessageCircle, HelpCircle, Award, Gift, Bell, Bug, Crown, Chrome as Home } from 'lucide-react-native';
import { HandHeart } from 'lucide-react-native';
import NegativeBadgeModal from '@/components/NegativeBadgeModal';
import DontPanicModal from '@/components/DontPanicModal';
import AppreciationModal from '@/components/AppreciationModal';
import RelationshipWisdomModal from '@/components/RelationshipWisdomModal';
import FavorsModal from '@/components/FavorsModal';
import QuickSendActions from '@/components/QuickSendActions';
import TodayTip from '@/components/TodayTip';
import PingModal from '@/components/PingModal';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';

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
  { key: 'appreciations', name: 'Praises', icon: Award, color: '#4ECDC4' },
  { key: 'favors', name: 'Favors', icon: Gift, color: '#FFD93D' },
  { key: 'wisdom', name: 'Wisdom', icon: Crown, color: '#9B59B6' },
  { key: 'pings', name: 'Pings', icon: Bell, color: '#6366F1' },
  { key: 'hornets', name: 'Hornets', icon: Bug, color: '#FF4444' },
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
    appreciations: 0,
    favors: 0,
    wisdom: 0,
    pings: 0,
    hornets: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const { session } = useSession();

  const userName = session?.user?.user_metadata?.display_name || 'Breda';

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);
  
  const fetchStats = async () => {
    if (!session?.user) return;
    setLoadingStats(true);
    
    const { data, error } = await supabase
      .from('events')
      .select('event_type')
      .eq('receiver_id', session.user.id);

    if (error) {
      console.error('Error fetching stats:', error);
      Alert.alert('Error', 'Could not fetch your stats.');
    } else {
      const newStats = {
        appreciations: data.filter(e => e.event_type === 'APPRECIATION').length,
        favors: data.filter(e => e.event_type === 'FAVOR_REQUEST').length,
        wisdom: data.filter(e => e.event_type === 'WISDOM').length,
        pings: 0, // Pings not implemented yet
        hornets: data.filter(e => e.event_type === 'HORNET').length,
      };
      setStats(newStats);
    }
    setLoadingStats(false);
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

  const handleSendBadge = async (categoryId: string, badgeId: string, badgeTitle: string, badgeIcon: string, points: number, pointsIcon: string) => {
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

  const handleSendFavor = async (favorId: string, favorTitle: string, points: number, customMessage?: string) => {
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
        content: { title: quickResponse, message },
      },
    ]);

    if (error) Alert.alert('Error', 'Could not send the message.');
    else Alert.alert('Message Sent', 'Your calming message has been sent.');
  };

  const handleSendWisdom = async (wisdomId: string, wisdomTitle: string) => {
    if (!session) return;
    const { data: partnerData } = await supabase.from('users').select('partner_id').eq('id', session.user.id).single();
    if (!partnerData?.partner_id) return;

    const { error } = await supabase.from('events').insert([
      {
        sender_id: session.user.id,
        receiver_id: partnerData.partner_id,
        event_type: 'WISDOM',
        content: { wisdom_id: wisdomId, title: wisdomTitle },
      },
    ]);
    if (error) Alert.alert('Error', 'Could not send the wisdom.');
    else Alert.alert('Wisdom Sent', 'Your wise words have been shared.');
  };

  const handleSendPing = (pingId: string, pingTitle: string) => {
    // Mock ping sending
    console.log(`Sending ${pingTitle} ping to partner`);
    Alert.alert(
      'Ping Sent!',
      `Your "${pingTitle}" ping has been sent to your partner.`,
      [{ text: 'OK' }]
    );
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        {statsConfig.map((stat) => {
          const Icon = stat.icon;
          return (
            <View key={stat.key} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Icon color={stat.color} size={22} />
              </View>
              <Text style={styles.statNumber}>{stats[stat.key]}</Text>
              <Text style={styles.statLabel}>{stat.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Home color="#FF8C42" size={28} />
            <Text style={styles.title}>Hi, <Text style={styles.headerName}>{userName}</Text></Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <HelpCircle color="#666" size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>How are you doing today?</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
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
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  categoryName: {
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
});

// New Database Function to be created in Supabase SQL editor:
/*
CREATE OR REPLACE FUNCTION get_user_badge_collection(user_id_param uuid)
RETURNS TABLE(category_id TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (jsonb_array_elements(data.appreciation_points)->>'category_id')::text AS category_id,
        (jsonb_array_elements(data.appreciation_points)->>'count')::bigint AS count
    FROM
        (SELECT appreciation_points FROM wallets WHERE user_id = user_id_param) AS data;
END;
$$ LANGUAGE plpgsql;
*/