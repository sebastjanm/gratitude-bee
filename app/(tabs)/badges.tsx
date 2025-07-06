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
} from 'react-native';
import { Heart, Star, Smile, Compass, MessageCircle, Trophy, Award, Bug, X, CircleCheck as CheckCircle, Crown, Chrome as Home } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Badge {
  id: string;
  name: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold';
  earnedDate: string;
  description: string;
  icon: any;
  color: string;
  isNegative?: boolean;
  cancelledBadges?: string[];
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'Morning Coffee',
    category: 'kindness',
    tier: 'bronze',
    earnedDate: '2025-01-15',
    description: 'Made coffee without being asked',
    icon: Heart,
    color: '#FF6B9D',
  },
  {
    id: '2',
    name: 'Workout Support',
    category: 'support',
    tier: 'silver',
    earnedDate: '2025-01-14',
    description: 'Encouraged during tough workout',
    icon: Star,
    color: '#4ECDC4',
  },
  {
    id: '3',
    name: 'Silly Dance',
    category: 'humor',
    tier: 'gold',
    earnedDate: '2025-01-13',
    description: 'Made me laugh with random dancing',
    icon: Smile,
    color: '#FFD93D',
  },
  {
    id: '4',
    name: 'Sunset Walk',
    category: 'adventure',
    tier: 'bronze',
    earnedDate: '2025-01-12',
    description: 'Suggested a beautiful evening walk',
    icon: Compass,
    color: '#6BCF7F',
  },
  {
    id: '5',
    name: 'Sweet Message',
    category: 'words',
    tier: 'silver',
    earnedDate: '2025-01-11',
    description: 'Sent the sweetest good morning text',
    icon: MessageCircle,
    color: '#A8E6CF',
  },
  {
    id: '6',
    name: 'Accountability Hornet',
    category: 'hornet',
    tier: 'bronze',
    earnedDate: '2025-01-10',
    description: 'Cancelled 2 positive badges for accountability',
    icon: Bug,
    color: '#FF4444',
    isNegative: true,
    cancelledBadges: ['1', '2'],
  },
  {
    id: '7',
    name: 'Whatever You Say',
    category: 'whatever-you-say',
    tier: 'silver',
    earnedDate: '2025-01-09',
    description: 'Chose your movie pick without argument',
    icon: CheckCircle,
    color: '#9B59B6',
  },
  {
    id: '8',
    name: 'Yes, Dear',
    category: 'yes-dear',
    tier: 'bronze',
    earnedDate: '2025-01-08',
    description: 'Agreed to rearrange the living room',
    icon: Crown,
    color: '#E67E22',
  },
  {
    id: '9',
    name: 'Happy Wife, Happy Life',
    category: 'happy-wife',
    tier: 'gold',
    earnedDate: '2025-01-07',
    description: 'Remembered anniversary dinner plans',
    icon: Home,
    color: '#27AE60',
  },
  {
    id: '10',
    name: 'Don\'t Panic',
    category: 'dont-panic',
    tier: 'silver',
    earnedDate: '2025-01-06',
    description: 'Sent calming reassurance after stressful call',
    icon: Heart,
    color: '#6366F1',
  },
];

const categories = [
  { id: 'all', name: 'All Badges', icon: Trophy },
  { id: 'kindness', name: 'Kindness', icon: Heart },
  { id: 'support', name: 'Support', icon: Star },
  { id: 'humor', name: 'Humor', icon: Smile },
  { id: 'adventure', name: 'Adventure', icon: Compass },
  { id: 'words', name: 'Love Notes', icon: MessageCircle },
  { id: 'hornet', name: 'Hornets', icon: Bug },
  { id: 'whatever-you-say', name: 'Whatever You Say', icon: CheckCircle },
  { id: 'yes-dear', name: 'Yes Dear', icon: Crown },
  { id: 'happy-wife', name: 'Happy Wife', icon: Home },
  { id: 'dont-panic', name: 'Don\'t Panic', icon: Heart },
];

export default function BadgesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const filteredBadges = mockBadges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const tierMatch = !selectedTier || badge.tier === selectedTier;
    return categoryMatch && tierMatch;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return '#CD7F32';
      case 'silver': return '#C0C0C0';
      case 'gold': return '#FFD700';
      default: return '#999';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      default: return '🏆';
    }
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}>
      {categories.map((category) => {
        const IconComponent = category.icon;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryFilterItem,
              selectedCategory === category.id && styles.selectedCategoryFilter,
            ]}
            onPress={() => setSelectedCategory(category.id)}>
            <IconComponent
              color={selectedCategory === category.id ? 'white' : '#666'}
              size={18}
            />
            <Text
              style={[
                styles.categoryFilterText,
                selectedCategory === category.id && styles.selectedCategoryFilterText,
              ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderTierFilter = () => (
    <View style={styles.tierFilter}>
      {['bronze', 'silver', 'gold'].map((tier) => (
        <TouchableOpacity
          key={tier}
          style={[
            styles.tierFilterItem,
            selectedTier === tier && styles.selectedTierFilter,
          ]}
          onPress={() => setSelectedTier(selectedTier === tier ? null : tier)}>
          <Text style={styles.tierEmoji}>{getTierIcon(tier)}</Text>
          <Text
            style={[
              styles.tierFilterText,
              selectedTier === tier && styles.selectedTierFilterText,
            ]}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBadge = (badge: Badge) => {
    const IconComponent = badge.icon;
    return (
      <View key={badge.id} style={[
        styles.badgeCard,
        badge.isNegative && styles.negativeBadgeCard
      ]}>
        <View style={styles.badgeHeader}>
          <View style={[
            styles.badgeIcon, 
            { backgroundColor: badge.color },
            badge.isNegative && styles.negativeBadgeIcon
          ]}>
            <IconComponent color="white" size={24} />
          </View>
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            {badge.isNegative && badge.cancelledBadges && (
              <View style={styles.cancelledInfo}>
                <X color="#FF4444" size={12} />
                <Text style={styles.cancelledText}>
                  Cancelled {badge.cancelledBadges.length} badge{badge.cancelledBadges.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.badgeTier}>
            <Text style={styles.tierEmoji}>{getTierIcon(badge.tier)}</Text>
          </View>
        </View>
        <Text style={styles.badgeDate}>
          {badge.isNegative ? 'Sent' : 'Earned'} on {new Date(badge.earnedDate).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  const renderStats = () => {
    const totalBadges = mockBadges.length;
    const positiveBadges = mockBadges.filter(b => !b.isNegative);
    const negativeBadges = mockBadges.filter(b => b.isNegative);
    const bronzeCount = positiveBadges.filter(b => b.tier === 'bronze').length;
    const silverCount = positiveBadges.filter(b => b.tier === 'silver').length;
    const goldCount = positiveBadges.filter(b => b.tier === 'gold').length;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Collection</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{positiveBadges.length}</Text>
            <Text style={styles.statLabel}>Positive</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.negativeStatNumber]}>{negativeBadges.length}</Text>
            <Text style={styles.statLabel}>Hornets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalBadges}</Text>
            <Text style={styles.statLabel}>Total Badges</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{goldCount}</Text>
            <Text style={styles.statLabel}>🥇 Gold</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Badge Collection</Text>
        <Text style={styles.subtitle}>
          Beautiful moments you've shared together
        </Text>
      </View>

      {renderStats()}
      {renderCategoryFilter()}
      {renderTierFilter()}

      <ScrollView style={styles.badgesList} showsVerticalScrollIndicator={false}>
        {filteredBadges.length > 0 ? (
          filteredBadges.map(renderBadge)
        ) : (
          <View style={styles.emptyState}>
            <Award color="#ccc" size={48} />
            <Text style={styles.emptyStateText}>
              No badges match your filter
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try selecting different categories or tiers
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
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
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 4,
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
  },
  categoryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryFilter: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  categoryFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
  },
  selectedCategoryFilterText: {
    color: 'white',
  },
  tierFilter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tierFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTierFilter: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFD93D',
  },
  tierEmoji: {
    fontSize: 16,
  },
  tierFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
  },
  selectedTierFilterText: {
    color: '#FF8C42',
  },
  badgesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
  },
  badgeTier: {
    marginLeft: 8,
  },
  badgeDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  negativeBadgeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    backgroundColor: '#FFFAFA',
  },
  negativeBadgeIcon: {
    borderWidth: 2,
    borderColor: '#FF6666',
  },
  cancelledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelledText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF4444',
    marginLeft: 4,
  },
  negativeStatNumber: {
    color: '#FF4444',
  },
});