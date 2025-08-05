import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Heart, Star, Smile, Compass, MessageCircle, Award, Bug, X, CircleCheck as CheckCircle, Crown, Gift, Bell, HelpCircle, TrendingUp, Target, Lock, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

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
  isEmojiIcon?: boolean;
}

interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: any;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  color: string;
  reward?: string;
}

const categories = [
  { id: 'all', name: 'All Badges', icon: null },
  { id: 'kindness', name: 'Kindness', icon: Heart },
  { id: 'support', name: 'Support', icon: Star },
  { id: 'humor', name: 'Humor', icon: Smile },
  { id: 'adventure', name: 'Adventure', icon: Compass },
  { id: 'words', name: 'Love Notes', icon: MessageCircle },
  { id: 'hornet', name: 'Hornets', icon: Bug },
  { id: 'dont-panic', name: "Don't Panic", icon: Heart },
  { id: 'ping', name: 'Pings', icon: Bell },
  { id: 'relationship-wisdom', name: 'Relationship Wisdom', icon: Crown },
];

const achievementTypes = [
  {
    type: 'first_week',
    name: 'Week One Wonder',
    description: 'Complete your first week of appreciation',
    icon: Star,
    target: 7,
    color: Colors.success,
    reward: '50 bonus points',
  },
  {
    type: 'appreciation_10',
    name: 'Appreciation Starter',
    description: 'Send 10 appreciations',
    icon: Heart,
    target: 10,
    color: Colors.primary,
    reward: '20 bonus points',
  },
  {
    type: 'appreciation_100',
    name: 'Appreciation Master',
    description: 'Send 100 appreciations',
    icon: Trophy,
    target: 100,
    color: Colors.warning,
    reward: '100 bonus points',
  },
  {
    type: 'streak_7',
    name: 'Week Streak',
    description: 'Maintain a 7-day streak',
    icon: TrendingUp,
    target: 7,
    color: Colors.info,
    reward: '30 bonus points',
  },
  {
    type: 'streak_30',
    name: 'Monthly Streak',
    description: 'Maintain a 30-day streak',
    icon: Target,
    target: 30,
    color: Colors.error,
    reward: '150 bonus points',
  },
];

export default function RewardsScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'points' | 'badges' | 'achievements'>('points');
  const [favorPoints, setFavorPoints] = useState(0);
  const [appreciationPoints, setAppreciationPoints] = useState(0);
  const [weeklyEarned, setWeeklyEarned] = useState(0);
  const [weeklySpent, setWeeklySpent] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch points balance
    const { data: walletData } = await supabase
      .from('wallets')
      .select('favor_points')
      .eq('user_id', user.id)
      .single();

    if (walletData) {
      setFavorPoints(walletData.favor_points);
    }

    // Fetch weekly stats and total appreciation points
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [appreciationsReceived, appreciationsSent, favorsRequested] = await Promise.all([
      supabase
        .from('events')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('event_type', 'APPRECIATION')
        .gte('created_at', weekAgo.toISOString()),
      supabase
        .from('events')
        .select('id')
        .eq('receiver_id', user.id)
        .eq('event_type', 'APPRECIATION'),
      supabase
        .from('events')
        .select('content')
        .eq('sender_id', user.id)
        .eq('event_type', 'FAVOR_REQUEST')
        .gte('created_at', weekAgo.toISOString()),
    ]);

    if (appreciationsReceived.data) {
      setWeeklyEarned(appreciationsReceived.data.length * 5); // Assuming 5 points per appreciation
    }
    
    if (appreciationsSent.data) {
      setAppreciationPoints(appreciationsSent.data.length * 5);
    }

    if (favorsRequested.data) {
      const spent = favorsRequested.data.reduce((sum, event) => {
        return sum + (event.content?.points || 0);
      }, 0);
      setWeeklySpent(spent);
    }

    // Fetch badges
    const { data: badgeEvents } = await supabase
      .from('events')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (badgeEvents) {
      const transformedBadges = transformEventsToBadges(badgeEvents);
      setBadges(transformedBadges);
    }

    // Fetch/calculate achievements
    const userAchievements = await calculateAchievements(user.id);
    setAchievements(userAchievements);

    setLoading(false);
  };

  const calculateAchievements = async (userId: string): Promise<Achievement[]> => {
    // This would typically fetch from a database, but for now we'll calculate
    const { data: events } = await supabase
      .from('events')
      .select('event_type, created_at')
      .eq('sender_id', userId)
      .order('created_at', { ascending: true });

    if (!events) return [];

    const appreciationCount = events.filter(e => e.event_type === 'APPRECIATION').length;
    
    // Calculate streak
    let currentStreak = 0;
    let maxStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // This is simplified - in production you'd want more sophisticated streak calculation
    
    return achievementTypes.map(achievementType => {
      let progress = 0;
      let unlocked = false;
      let unlockedAt = undefined;

      switch (achievementType.type) {
        case 'appreciation_10':
          progress = Math.min(appreciationCount, achievementType.target);
          unlocked = appreciationCount >= achievementType.target;
          break;
        case 'appreciation_100':
          progress = Math.min(appreciationCount, achievementType.target);
          unlocked = appreciationCount >= achievementType.target;
          break;
        case 'first_week':
          // Check if user has been active for 7 days
          if (events.length > 0) {
            const firstEvent = new Date(events[0].created_at);
            const daysSinceFirst = Math.floor((today.getTime() - firstEvent.getTime()) / (1000 * 60 * 60 * 24));
            progress = Math.min(daysSinceFirst, achievementType.target);
            unlocked = daysSinceFirst >= achievementType.target;
          }
          break;
        // Add more achievement logic as needed
      }

      return {
        id: achievementType.type,
        type: achievementType.type,
        name: achievementType.name,
        description: achievementType.description,
        icon: achievementType.icon,
        progress,
        target: achievementType.target,
        unlocked,
        unlockedAt: unlocked ? new Date().toISOString() : undefined,
        color: achievementType.color,
        reward: achievementType.reward,
      };
    });
  };

  const transformEventsToBadges = (events: any[]): Badge[] => {
    const categoryMeta = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as { [key: string]: { name: string; icon: any } });
    
    if (!categoryMeta['hornet']) categoryMeta['hornet'] = { name: 'Hornet', icon: Bug };
    if (!categoryMeta['dont-panic']) categoryMeta['dont-panic'] = { name: 'Dont Panic', icon: Heart };

    return events
      .filter(event => ['APPRECIATION', 'HORNET', 'WISDOM', 'DONT_PANIC', 'PING'].includes(event.event_type))
      .map(event => {
        const content = event.content || {};
        let categoryId = event.event_type.toLowerCase().replace('_', '-');
        
        let name = content.title;
        let description = content.description || content.message;
        let icon = content.icon;
        let color = content.color;
        let isEmojiIcon = !!icon;

        if (typeof name !== 'string' || !name) {
          name = event.event_type.toLowerCase().replace(/_/g, ' ');
        }

        if (typeof description !== 'string') {
          description = '';
        }
        
        if (event.event_type === 'APPRECIATION' && content.category_id) {
          categoryId = content.category_id;
          const meta = categoryMeta[categoryId] || {};
          icon = meta.icon;
          isEmojiIcon = false;
        } else if (event.event_type === 'WISDOM') {
          categoryId = 'relationship-wisdom';
        }

        const meta = categoryMeta[categoryId] || { name: 'Badge', icon: Award };
        const colorMap: { [key: string]: string } = {
          support: '#4ECDC4',
          kindness: '#FF6B9D',
          humor: '#FFD93D',
          adventure: '#6BCF7F',
          words: '#A8E6CF',
          hornet: '#FF4444',
          'relationship-wisdom': '#9B59B6',
          'dont-panic': '#6366F1',
          ping: '#3B82F6',
        };

        return {
          id: event.id.toString(),
          name: name,
          category: categoryId,
          tier: 'bronze',
          earnedDate: event.created_at,
          description: description,
          icon: icon || meta.icon,
          color: color || colorMap[categoryId] || '#6B7280',
          isNegative: event.event_type === 'HORNET',
          isEmojiIcon: isEmojiIcon,
        };
      });
  };

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    return categoryMatch;
  });

  const renderPointsBalance = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.balanceCard}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <View style={[styles.balanceIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Gift color={Colors.warning} size={32} />
            </View>
            <Text style={styles.balanceAmount}>{favorPoints}</Text>
            <Text style={styles.balanceLabel}>Favor Points</Text>
            <Text style={styles.balanceDescription}>Use these to request favors</Text>
          </View>
          <View style={styles.balanceDivider} />
          <View style={styles.balanceItem}>
            <View style={[styles.balanceIcon, { backgroundColor: Colors.info + '20' }]}>
              <Award color={Colors.info} size={32} />
            </View>
            <Text style={styles.balanceAmount}>{appreciationPoints}</Text>
            <Text style={styles.balanceLabel}>Total Karma</Text>
            <Text style={styles.balanceDescription}>Your appreciation score</Text>
          </View>
        </View>
      </View>

      <View style={styles.weeklyCard}>
        <Text style={styles.weeklyTitle}>This Week</Text>
        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStat}>
            <TrendingUp color={Colors.success} size={20} />
            <Text style={styles.weeklyStatAmount}>+{weeklyEarned}</Text>
            <Text style={styles.weeklyStatLabel}>Earned</Text>
          </View>
          <View style={styles.weeklyStat}>
            <TrendingUp color={Colors.error} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={[styles.weeklyStatAmount, { color: Colors.error }]}>-{weeklySpent}</Text>
            <Text style={styles.weeklyStatLabel}>Spent</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.infoCard} onPress={() => router.push('/help')}>
        <HelpCircle color={Colors.primary} size={24} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>How Points Work</Text>
          <Text style={styles.infoDescription}>
            Earn favor points when your partner appreciates you. Spend them to request favors.
          </Text>
        </View>
        <ChevronRight color={Colors.textSecondary} size={20} />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBadges = () => (
    <>
      <View style={styles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}>
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
                {IconComponent && <IconComponent
                  color={isSelected ? 'white' : '#666'}
                  size={16}
                  strokeWidth={isSelected ? 2.5 : 2}
                />}
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
      </View>

      <ScrollView style={styles.badgesList} showsVerticalScrollIndicator={false}>
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge) => {
            const BadgeIcon = badge.icon;
            const isEmoji = typeof badge.icon === 'string';
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
                    {isEmoji ? (
                      <Text style={styles.emojiIcon}>{badge.icon}</Text>
                    ) : (
                      <BadgeIcon color="white" size={24} />
                    )}
                  </View>
                  <View style={styles.badgeTextContent}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                    <Text style={styles.badgeDate}>
                      {badge.isNegative ? 'Sent' : 'Earned'} on {new Date(badge.earnedDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Award color="#ccc" size={48} />
            <Text style={styles.emptyStateText}>No badges yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start appreciating to earn badges!
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );

  const renderAchievements = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Unlocked</Text>
        {achievements.filter(a => a.unlocked).map(achievement => {
          const Icon = achievement.icon;
          return (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color + '20' }]}>
                <Icon color={achievement.color} size={24} />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                {achievement.reward && (
                  <Text style={styles.achievementReward}>Reward: {achievement.reward}</Text>
                )}
              </View>
              <CheckCircle color={Colors.success} size={24} />
            </View>
          );
        })}
      </View>

      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>In Progress</Text>
        {achievements.filter(a => !a.unlocked).map(achievement => {
          const Icon = achievement.icon;
          const progress = (achievement.progress / achievement.target) * 100;
          return (
            <View key={achievement.id} style={[styles.achievementCard, styles.lockedAchievement]}>
              <View style={[styles.achievementIcon, { backgroundColor: Colors.gray200 }]}>
                <Icon color={Colors.gray400} size={24} />
              </View>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementName, { color: Colors.textSecondary }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementDescription, { color: Colors.textTertiary }]}>
                  {achievement.description}
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: achievement.color }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress}/{achievement.target}
                  </Text>
                </View>
              </View>
              <Lock color={Colors.gray400} size={20} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Trophy color={Colors.primary} size={28} />
            <Text style={styles.title}>Rewards</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
            <HelpCircle color={Colors.textSecondary} size={Layout.iconSize.lg} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Your points, badges, and achievements
        </Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'points' && styles.activeTab]}
            onPress={() => setActiveTab('points')}>
            <Gift color={activeTab === 'points' ? Colors.primary : Colors.textSecondary} size={20} />
            <Text style={[styles.tabText, activeTab === 'points' && styles.activeTabText]}>
              Points
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
            onPress={() => setActiveTab('badges')}>
            <Award color={activeTab === 'badges' ? Colors.primary : Colors.textSecondary} size={20} />
            <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
              Badges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
            onPress={() => setActiveTab('achievements')}>
            <Target color={activeTab === 'achievements' ? Colors.primary : Colors.textSecondary} size={20} />
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <>
          {activeTab === 'points' && renderPointsBalance()}
          {activeTab === 'badges' && renderBadges()}
          {activeTab === 'achievements' && renderAchievements()}
        </>
      )}
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
  },
  title: {
    ...ComponentStyles.text.h2,
    marginLeft: Spacing.md,
  },
  headerButton: {
    padding: Spacing.sm,
  },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: Spacing.lg,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundElevated,
  },
  activeTab: {
    backgroundColor: Colors.primary + '15',
  },
  tabText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  activeTabText: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.semiBold,
  },

  // Points Balance
  balanceCard: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  balanceAmount: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  balanceLabel: {
    ...ComponentStyles.text.h3,
    marginTop: Spacing.xs,
  },
  balanceDescription: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  balanceDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.border,
    alignSelf: 'center',
  },

  // Weekly Stats
  weeklyCard: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  weeklyTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatAmount: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.success,
    marginTop: Spacing.sm,
  },
  weeklyStatLabel: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Info Card
  infoCard: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  infoTitle: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  infoDescription: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Badges
  categoryFilterContainer: {
    paddingTop: Spacing.md,
  },
  categoryFilter: {},
  categoryFilterContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xs,
  },
  categoryFilterItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    width: 88,
    height: 52,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  firstCategoryItem: {
    marginLeft: 0,
  },
  lastCategoryItem: {
    marginRight: 20,
  },
  selectedCategoryFilter: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  categoryFilterText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  selectedCategoryFilterText: {
    color: 'white',
  },
  badgesList: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  badgeCard: {
    ...ComponentStyles.card,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeTextContent: {
    flex: 1,
  },
  badgeName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  badgeDescription: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  badgeDate: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
  },
  negativeBadgeCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    backgroundColor: Colors.error + '05',
  },
  negativeBadgeIcon: {
    borderWidth: 2,
    borderColor: Colors.error + '40',
  },
  emojiIcon: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyStateText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptyStateSubtext: {
    ...ComponentStyles.text.body,
    color: Colors.textTertiary,
    marginTop: 8,
  },

  // Achievements
  achievementsSection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md,
  },
  achievementCard: {
    ...ComponentStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  lockedAchievement: {
    backgroundColor: Colors.gray50,
    borderColor: Colors.gray200,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  achievementDescription: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  achievementReward: {
    ...ComponentStyles.text.caption,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    minWidth: 40,
  },
});