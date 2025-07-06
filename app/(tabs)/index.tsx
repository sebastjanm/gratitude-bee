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
} from 'react-native';
import { Heart, Star, Smile, Compass, MessageCircle, Flame, Bug, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Crown, Chrome as Home } from 'lucide-react-native';
import NegativeBadgeModal from '@/components/NegativeBadgeModal';

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

  const handleSendBadge = (categoryId: string) => {
    // Mock badge sending - in real app this would sync with partner
    setTotalBadges(prev => prev + 1);
    console.log(`Sending ${categoryId} badge to partner`);
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

  const renderStreakCard = () => (
    <View style={styles.streakCard}>
      <View style={styles.streakHeader}>
        <Flame color="#FF8C42" size={24} />
        <Text style={styles.streakTitle}>Daily Streak</Text>
      </View>
      <View style={styles.streakStats}>
        <View style={styles.streakItem}>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>Days</Text>
        </View>
        <View style={styles.streakDivider} />
        <View style={styles.streakItem}>
          <Text style={styles.streakNumber}>{totalBadges}</Text>
          <Text style={styles.streakLabel}>Total Badges</Text>
        </View>
      </View>
      <Text style={styles.streakEncouragement}>
        Amazing work! You're building a beautiful habit together 💕
      </Text>
    </View>
  );

  const renderBadgeCategory = (category: BadgeCategory) => {
    const IconComponent = category.icon;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          { backgroundColor: category.color + '20' },
          selectedCategory === category.id && styles.selectedCategory,
        ]}
        onPress={() => setSelectedCategory(category.id)}
        activeOpacity={0.8}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <IconComponent color="white" size={24} />
        </View>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryDescription}>{category.description}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryCount}>{category.count}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNegativeBadgeButton = () => (
    <TouchableOpacity
      style={styles.negativeButton}
      onPress={() => setShowNegativeModal(true)}
      activeOpacity={0.8}>
      <View style={styles.negativeButtonContent}>
        <Bug color="#FF4444" size={20} />
        <Text style={styles.negativeButtonText}>Send Hornet</Text>
        <AlertTriangle color="#FF4444" size={16} />
      </View>
      <Text style={styles.negativeButtonSubtext}>
        Cancel positive badges for accountability
      </Text>
    </TouchableOpacity>
  );

  const renderQuickSend = () => (
    <View style={styles.quickSendContainer}>
      <Text style={styles.sectionTitle}>Send Appreciation</Text>
      <View style={styles.categoriesGrid}>
        {badgeCategories.map(renderBadgeCategory)}
      </View>
      {selectedCategory && (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => handleSendBadge(selectedCategory)}
          activeOpacity={0.8}>
          <Text style={styles.sendButtonText}>Send Badge to Partner</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.divider} />
      {renderNegativeBadgeButton()}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Good morning! 🌅</Text>
          <Text style={styles.headerSubtitle}>
            Ready to brighten your partner's day?
          </Text>
        </View>

        {renderStreakCard()}
        {renderQuickSend()}

        <View style={styles.todayTip}>
          <Text style={styles.tipTitle}>Today's Tip</Text>
          <Text style={styles.tipText}>
            Try sending a Support Star if your partner has been working hard lately. 
            Small acknowledgments make a big difference! ✨
          </Text>
        </View>
      </ScrollView>
      
      <NegativeBadgeModal
        visible={showNegativeModal}
        onClose={() => setShowNegativeModal(false)}
        onSend={handleSendHornet}
        recentPositiveBadges={mockRecentBadges}
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
    lineHeight: 20,
  },
  quickSendContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  todayTip: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6BCF7F',
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  negativeButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFE0E0',
  },
  negativeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  negativeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginHorizontal: 8,
  },
  negativeButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
});