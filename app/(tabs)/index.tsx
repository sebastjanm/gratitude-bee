import React, { useState } from 'react';
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
} from 'react-native';
import { Heart, Star, Smile, Compass, MessageCircle, Flame, Bug, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Crown, Chrome as Home } from 'lucide-react-native';
import { HandHeart } from 'lucide-react-native';
import NegativeBadgeModal from '@/components/NegativeBadgeModal';
import DontPanicModal from '@/components/DontPanicModal';
import UserWelcome from '@/components/UserWelcome';
import AppreciationModal from '@/components/AppreciationModal';
import RelationshipWisdomModal from '@/components/RelationshipWisdomModal';
import FavorsModal from '@/components/FavorsModal';
import StreakCard from '@/components/StreakCard';
import QuickSendActions from '@/components/QuickSendActions';
import TodayTip from '@/components/TodayTip';
import PingModal from '@/components/PingModal';

const { width } = Dimensions.get('window');

interface BadgeCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  count: number;
}

const badgeCategories: BadgeCategory[] = [
  {
    id: 'kindness',
    name: 'Kindness',
    icon: Heart,
    color: '#FF6B9D',
    description: 'Gentle caring actions',
    count: 12,
  },
  {
    id: 'support',
    name: 'Support',
    icon: Star,
    color: '#4ECDC4',
    description: 'Being there when needed',
    count: 8,
  },
  {
    id: 'humor',
    name: 'Humor',
    icon: Smile,
    color: '#FFD93D',
    description: 'Bringing joy with laughter',
    count: 15,
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: Compass,
    color: '#6BCF7F',
    description: 'Shared experiences',
    count: 6,
  },
  {
    id: 'words',
    name: 'Love Notes',
    icon: MessageCircle,
    color: '#A8E6CF',
    description: 'Words of affirmation',
    count: 20,
  },
  {
    id: 'whatever-you-say',
    name: 'Whatever You Say',
    icon: CheckCircle,
    color: '#9B59B6',
    description: 'So be it moments',
    count: 3,
  },
  {
    id: 'yes-dear',
    name: 'Yes, Dear',
    icon: Crown,
    color: '#E67E22',
    description: 'Agreeable responses',
    count: 7,
  },
  {
    id: 'happy-wife',
    name: 'Happy Wife, Happy Life',
    icon: Home,
    color: '#27AE60',
    description: 'Relationship wisdom',
    count: 4,
  },
  {
    id: 'dont-panic',
    name: 'Don\'t Panic',
    icon: Heart,
    color: '#6366F1',
    description: 'Calm reassurance after stress',
    count: 2,
  },
  {
    id: 'im-sorry',
    name: 'I\'m Sorry',
    icon: Heart,
    color: '#F87171',
    description: 'Heartfelt apologies and making amends',
    count: 1,
  },
];

const mockRecentBadges = [
  { id: '1', name: 'Morning Coffee', category: 'kindness', earnedDate: '2025-01-15' },
  { id: '2', name: 'Workout Support', category: 'support', earnedDate: '2025-01-14' },
  { id: '3', name: 'Silly Dance', category: 'humor', earnedDate: '2025-01-13' },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(12);
  const [totalBadges, setTotalBadges] = useState(61);
  const [showNegativeModal, setShowNegativeModal] = useState(false);
  const [showDontPanicModal, setShowDontPanicModal] = useState(false);
  const [showAppreciationModal, setShowAppreciationModal] = useState(false);
  const [showRelationshipWisdomModal, setShowRelationshipWisdomModal] = useState(false);
  const [showFavorsModal, setShowFavorsModal] = useState(false);
  const [showPingModal, setShowPingModal] = useState(false);
  const [favorPoints, setFavorPoints] = useState(45); // Mock favor points
  const [heartAnimation] = useState(new Animated.Value(1));

  React.useEffect(() => {
    const animateHeart = () => {
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Repeat animation after a pause
        setTimeout(animateHeart, 2000);
      });
    };

    animateHeart();
  }, [heartAnimation]);

  const handleSendBadge = (categoryId: string, badgeId?: string, badgeTitle?: string) => {
    // Mock badge sending - in real app this would sync with partner
    setTotalBadges(prev => prev + 1);
    console.log(`Sending ${badgeTitle || categoryId} badge to partner`);
    
    Alert.alert(
      'Badge Sent! 🎉',
      `Your "${badgeTitle || categoryId}" appreciation has been sent to your partner.`,
      [{ text: 'OK' }]
    );
  };

  const handleSendHornet = (message: string, cancelledBadges: string[]) => {
    // Mock hornet sending - in real app this would sync with partner
    setTotalBadges(prev => Math.max(0, prev - cancelledBadges.length));
    console.log(`Sending hornet, cancelling ${cancelledBadges.length} badges:`, cancelledBadges);
    if (message) {
      console.log('Hornet message:', message);
    }
    
    Alert.alert(
      'Hornet Sent',
      `Successfully cancelled ${cancelledBadges.length} positive badge${cancelledBadges.length > 1 ? 's' : ''}.`,
      [{ text: 'OK' }]
    );
  };

  const handleSendDontPanic = (message: string, quickResponse?: string) => {
    // Mock don't panic sending - in real app this would sync with partner
    console.log('Sending Don\'t Panic message:', quickResponse || message);
    
    Alert.alert(
      'Don\'t Panic Sent',
      'Your calming message has been sent to your partner.',
      [{ text: 'OK' }]
    );
  };

  const handleSendWisdom = (wisdomId: string, wisdomTitle: string) => {
    // Mock wisdom sending - in real app this would sync with partner
    console.log(`Sending ${wisdomTitle} wisdom to partner`);
    
    Alert.alert(
      'Wisdom Sent',
      `Your "${wisdomTitle}" response has been sent to your partner.`,
      [{ text: 'OK' }]
    );
  };

  const handleSendFavor = (favorId: string, favorTitle: string, points: number, customMessage?: string) => {
    // Mock favor sending - in real app this would sync with partner
    console.log(`Sending favor request: ${favorTitle} for ${points} points`);
    if (customMessage) {
      console.log('Custom message:', customMessage);
    }
    
    Alert.alert(
      'Favor Requested! 🙏',
      `Your "${favorTitle}" request has been sent to your partner for ${points} favor points.`,
      [{ text: 'OK' }]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <UserWelcome />
        </View>

        <StreakCard currentStreak={currentStreak} totalBadges={totalBadges} />
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
        recentPositiveBadges={mockRecentBadges}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
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
});