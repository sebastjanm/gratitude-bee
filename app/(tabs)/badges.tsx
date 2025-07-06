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
import { LinearGradient } from 'expo-linear-gradient';
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
  {
    id: '11',
    name: 'I\'m Sorry',
    category: 'im-sorry',
    tier: 'bronze',
    earnedDate: '2025-01-05',
    description: 'Sincere apology for being late to dinner',
    icon: Heart,
    color: '#F87171',
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
  { id: 'dont-panic', name: 'Don\'t Panic', icon: Heart },
  { id: 'im-sorry', name: 'I\'m Sorry', icon: Heart },
  { id: 'relationship-wisdom', name: 'Relationship Wisdom', icon: Crown },
];

export default function BadgesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredBadges = mockBadges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    return categoryMatch;
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
    <View style={styles.categoryFilterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
        decelerationRate="fast"
        snapToInterval={88} // Width of button + margin
        snapToAlignment="start">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryFilterItem,
                isSelected && styles.selectedCategoryFilter,
                index === 0 && styles.firstCategoryItem,
                index === categories.length - 1 && styles.lastCategoryItem,
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}>
              <IconComponent
                color={isSelected ? 'white' : '#666'}
                size={16}
                strokeWidth={isSelected ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.categoryFilterText,
                  isSelected && styles.selectedCategoryFilterText,
                ]}
                numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Scroll indicators */}
      <View style={styles.scrollIndicators}>
        <LinearGradient
          colors={['rgba(255,248,240,0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.leftScrollIndicator}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,248,240,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.rightScrollIndicator}
          pointerEvents="none"
        />
      </View>
    </View>
  );

  const renderBadge = (badge: Badge) => {
    const IconComponent = badge.icon;
    return (
      <View key={badge.id} style={[
        styles.badgeCard,
        badge.isNegative && styles.negativeBadgeCard
      ]}>
        <View style={styles.badgeContent}>
          <View style={[
            styles.badgeIcon, 
            { backgroundColor: badge.color },
            badge.isNegative && styles.negativeBadgeIcon
          ]}>
            <IconComponent color="white" size={24} />
          </View>
          <View style={styles.badgeTextContent}>
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
            <Text style={styles.badgeDate}>
              {badge.isNegative ? 'Sent' : 'Earned'} on {new Date(badge.earnedDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
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
        <Text style={styles.title}>Your's Badge collection </Text>
        <Text style={styles.subtitle}>
          Beautiful moments you've shared together
        </Text>
      </View>

      {renderStats()}
      {renderCategoryFilter()}

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
    flex: 1,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryFilterContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  categoryFilterItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    width: 80,
    height: 45, // 16:9 aspect ratio (80:45)
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  firstCategoryItem: {
    marginLeft: 0,
  },
  lastCategoryItem: {
    marginRight: 20,
  },
  selectedCategoryFilter: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  categoryFilterText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 12,
  },
  selectedCategoryFilterText: {
    color: 'white',
  },
  scrollIndicators: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  leftScrollIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  rightScrollIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
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
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    alignItems: 'flex-start',
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  badgeTextContent: {
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
    lineHeight: 20,
    marginBottom: 8,
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