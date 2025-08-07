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
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Heart, Star, Smile, Compass, MessageCircle, Award, Bug, X, CircleCheck as CheckCircle, Crown, Gift, Bell, HelpCircle, TrendingUp, Target, Lock, ChevronRight, HelpCircle as Question, Shield, Sparkles, Zap } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';
import { useCategories } from '@/hooks/useCategories';
import { useAchievements, Achievement } from '@/hooks/useAchievements';

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

// Achievement interface is now imported from useAchievements hook
// Categories and achievements are fetched from database

export default function RewardsScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'points' | 'badges' | 'achievements'>('points');
  const [favorPoints, setFavorPoints] = useState(0);
  const [appreciationPoints, setAppreciationPoints] = useState(0);
  const [weeklyEarned, setWeeklyEarned] = useState(0);
  const [weeklySpent, setWeeklySpent] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  // Fetch categories from database
  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  
  // Fetch achievements from database
  const { data: achievements = [], isLoading: achievementsLoading, refetch: refetchAchievements } = useAchievements(userId);

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
    
    // Set userId for achievements hook
    setUserId(user.id);

    // Fetch points balance
    const { data: walletData } = await supabase
      .from('wallets')
      .select('favor_points, appreciation_points')
      .eq('user_id', user.id)
      .single();

    if (walletData) {
      setFavorPoints(walletData.favor_points);
      
      // Sum all appreciation points from the JSONB object
      const totalKarma = Object.values(walletData.appreciation_points || {})
        .reduce((sum: number, points: any) => sum + (parseInt(points) || 0), 0);
      setAppreciationPoints(totalKarma);
    }

    // Fetch weekly stats and total appreciation points
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [appreciationsReceivedWeekly, favorsRequested] = await Promise.all([
      supabase
        .from('events')
        .select('content')
        .eq('receiver_id', user.id)
        .eq('event_type', 'APPRECIATION')
        .gte('created_at', weekAgo.toISOString()),
      supabase
        .from('events')
        .select('content')
        .eq('sender_id', user.id)
        .eq('event_type', 'FAVOR_REQUEST')
        .gte('created_at', weekAgo.toISOString()),
    ]);

    if (appreciationsReceivedWeekly.data) {
      const earned = appreciationsReceivedWeekly.data.reduce((sum, event) => {
        return sum + (event.content?.points || 1); // Default to 1 if points not found
      }, 0);
      setWeeklyEarned(earned);
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

    // Achievements are now fetched via useAchievements hook
    // which will automatically update when userId is set

    setLoading(false);
  };


  const transformEventsToBadges = (events: any[]): Badge[] => {
    // Build category metadata from database categories
    const categoryMeta = (dbCategories || []).reduce((acc, cat) => {
      acc[cat.id] = { name: cat.name, icon: cat.icon };
      return acc;
    }, {} as { [key: string]: { name: string; icon: any } });

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
        // Get color from category or use default
        const categoryColor = dbCategories?.find(c => c.id === categoryId)?.color;

        return {
          id: event.id.toString(),
          name: name,
          category: categoryId,
          tier: 'bronze',
          earnedDate: event.created_at,
          description: description,
          icon: icon || meta.icon,
          color: color || categoryColor || '#6B7280',
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
            <Text style={styles.weeklyStatAmount}>+{weeklyEarned || 0}</Text>
            <Text style={styles.weeklyStatLabel}>Earned</Text>
          </View>
          <View style={styles.weeklyStat}>
            <TrendingUp color={Colors.error} size={20} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={[styles.weeklyStatAmount, { color: Colors.error }]}>-{weeklySpent || 0}</Text>
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
          {[
            { id: 'all', name: 'All Badges', icon: null },
            ...(dbCategories || [])
          ].map((category, index) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryFilterItem,
                  isSelected && styles.selectedCategoryFilter,
                  index === 0 && styles.firstCategoryItem,
                  index === (dbCategories?.length || 0) && styles.lastCategoryItem,
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

  const getAchievementStatus = () => {
    const unlocked = achievements.filter(a => a.unlocked).length;
    const total = achievements.length;
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;
    
    if (percentage === 100) return { title: 'Grand Master', color: '#FFD700', icon: 'Crown' };
    if (percentage >= 80) return { title: 'Master', color: '#B87333', icon: 'Award' };
    if (percentage >= 60) return { title: 'Expert', color: '#C0C0C0', icon: 'Star' };
    if (percentage >= 40) return { title: 'Apprentice', color: '#CD7F32', icon: 'TrendingUp' };
    if (percentage >= 20) return { title: 'Beginner', color: '#8B7355', icon: 'Target' };
    return { title: 'Novice', color: '#696969', icon: 'Circle' };
  };

  const renderAchievements = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {achievements.length === 0 ? (
        <View style={styles.emptyState}>
          <Trophy color={Colors.textSecondary} size={48} />
          <Text style={styles.emptyStateTitle}>No Achievements Yet</Text>
          <Text style={styles.emptyStateDescription}>
            Achievement definitions are being loaded...
          </Text>
        </View>
      ) : (
        <>
      {/* Achievement Status Card */}
      {(() => {
        const status = getAchievementStatus();
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        const totalCount = achievements.length;
        const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;
        const StatusIcon = status.icon === 'Crown' ? Crown : 
                          status.icon === 'Award' ? Award :
                          status.icon === 'Star' ? Star :
                          status.icon === 'TrendingUp' ? TrendingUp :
                          status.icon === 'Target' ? Target : Trophy;
        
        return (
          <LinearGradient
            colors={[status.color + '20', status.color + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <View style={styles.statusHeader}>
              <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                <StatusIcon color="white" size={32} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: status.color }]}>
                  {status.title}
                </Text>
                <Text style={styles.statusProgress}>
                  {unlockedCount} of {totalCount} achievements unlocked
                </Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%`, backgroundColor: status.color }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            
            {unlockedCount < totalCount && (
              <Text style={styles.statusMotivation}>
                {totalCount - unlockedCount === 1 
                  ? 'Just 1 more achievement to unlock!' 
                  : `${totalCount - unlockedCount} achievements remaining to unlock!`}
              </Text>
            )}
          </LinearGradient>
        );
      })()}
      
      <View style={styles.achievementsSection}>
        <View style={styles.achievementHeader}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.achievementCount}>
            {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
          </Text>
        </View>
        
        <View style={styles.achievementGrid}>
          {achievements.map(achievement => {
            const Icon = achievement.icon;
            const isUnlocked = achievement.unlocked;
            const progress = (achievement.progress / achievement.target) * 100;
            
            return (
              <View key={achievement.id} style={styles.badgeContainer}>
                <TouchableOpacity 
                  style={styles.achievementBadge}
                  activeOpacity={0.7}
                  onPress={() => isUnlocked && setSelectedAchievement(achievement)}
                  disabled={!isUnlocked}
                >
                  <View style={styles.badgeContent}>
                    <View style={{ position: 'relative' }}>
                    {isUnlocked ? (
                    <LinearGradient
                      colors={[achievement.color, achievement.color + 'DD']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.badgeCircle}
                    >
                      <Icon 
                        color="white" 
                        size={24} 
                      />
                    </LinearGradient>
                  ) : (
                    <LinearGradient
                      colors={['#F5F5F7', '#E8E8ED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.badgeCircle, styles.badgeLocked]}
                    >
                      {/* Simple Lock Icon */}
                      <View style={styles.lockedIconContainer}>
                        <Lock 
                          color="#9CA3AF" 
                          size={20} 
                          strokeWidth={2}
                        />
                      </View>
                      
                      {/* Subtle progress hint - just a faint colored border */}
                      {progress > 20 && (
                        <View style={[
                          styles.progressHint,
                          { 
                            borderColor: achievement.color + '40',
                            opacity: Math.min(progress / 100, 0.6)
                          }
                        ]} />
                      )}
                    </LinearGradient>
                  )}
                  
                  {/* Checkmark for Unlocked */}
                  {isUnlocked && (
                    <View style={styles.checkmarkBadge}>
                      <CheckCircle color="#fff" size={12} />
                    </View>
                  )}
                    </View>
                    
                    <Text style={[
                      styles.badgeName,
                      !isUnlocked && styles.badgeNameLocked,
                      isUnlocked && { color: achievement.color }
                    ]}>
                      {achievement.name}
                    </Text>
                  </View>
                  
                  {/* Points for unlocked, progress for locked */}
                  <View style={styles.badgeFooter}>
                    {isUnlocked ? (
                      <Text style={styles.badgePoints}>+{achievement.reward?.replace(' bonus points', '')}</Text>
                    ) : (
                      <Text style={styles.badgeProgress}>
                        {achievement.progress}/{achievement.target}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      </>
      )}
    </ScrollView>
  );

  // Achievement Detail Modal
  const AchievementModal = () => {
    if (!selectedAchievement) return null;
    
    const Icon = selectedAchievement.icon;
    const isUnlocked = selectedAchievement.unlocked;
    
    return (
      <Modal
        visible={!!selectedAchievement}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedAchievement(null)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalClose}
              onPress={() => setSelectedAchievement(null)}
            >
              <X color={Colors.textSecondary} size={24} />
            </TouchableOpacity>
            
            <View style={[
              styles.modalBadge,
              isUnlocked ? styles.modalBadgeUnlocked : styles.modalBadgeLocked
            ]}>
              <Icon 
                color={isUnlocked ? selectedAchievement.color : Colors.gray400} 
                size={48} 
              />
              {isUnlocked && (
                <View style={styles.modalCheckmark}>
                  <CheckCircle color="#fff" size={20} />
                </View>
              )}
            </View>
            
            <Text style={styles.modalTitle}>
              {selectedAchievement.name}
            </Text>
            
            <Text style={styles.modalDescription}>
              {selectedAchievement.description}
            </Text>
            
            {isUnlocked ? (
              <View style={styles.modalReward}>
                <Trophy color={Colors.success} size={20} />
                <Text style={styles.modalRewardText}>
                  Earned {selectedAchievement.reward}!
                </Text>
              </View>
            ) : (
              <View style={styles.modalProgress}>
                <View style={styles.modalProgressBar}>
                  <View 
                    style={[
                      styles.modalProgressFill,
                      { width: `${(selectedAchievement.progress / selectedAchievement.target) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.modalProgressText}>
                  Progress: {selectedAchievement.progress}/{selectedAchievement.target}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

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
            <Gift color={activeTab === 'points' ? Colors.primary : Colors.textSecondary} size={22} />
            <Text style={[styles.tabText, activeTab === 'points' && styles.activeTabText]}>
              Points
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'badges' && styles.activeTab]}
            onPress={() => setActiveTab('badges')}>
            <Award color={activeTab === 'badges' ? Colors.primary : Colors.textSecondary} size={22} />
            <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
              Badges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
            onPress={() => setActiveTab('achievements')}>
            <Target color={activeTab === 'achievements' ? Colors.primary : Colors.textSecondary} size={22} />
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}
              numberOfLines={1}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {(loading || categoriesLoading || achievementsLoading) ? (
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
      
      <AchievementModal />
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundElevated,
    minHeight: 56,
  },
  activeTab: {
    backgroundColor: Colors.primary + '15',
  },
  tabText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
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
    backgroundColor: Colors.gray100,
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
  sectionSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  achievementCount: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 12,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs / 2,
  },
  badgeContainer: {
    width: '33.33%',
    padding: Spacing.xs,
  },
  achievementBadge: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: Spacing.sm,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    height: 150,
    justifyContent: 'space-between',
  },
  badgeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeFooter: {
    height: 20,
    justifyContent: 'flex-end',
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeUnlocked: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary + '30',
  },
  badgeLocked: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  progressHint: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  lockedIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.success,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeName: {
    ...ComponentStyles.text.caption,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    marginTop: Spacing.xs,
    fontSize: 11,
    maxWidth: 80,
    lineHeight: 14,
  },
  badgeNameLocked: {
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  badgePoints: {
    fontSize: 10,
    color: Colors.success,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  badgeProgress: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  rewardBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  rewardBadgeText: {
    ...ComponentStyles.text.caption,
    color: Colors.success,
    fontFamily: 'Inter-SemiBold',
  },
  nearCompletionCard: {
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    backgroundColor: Colors.primary + '05',
  },
  progressTextHighlight: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  almostThereText: {
    ...ComponentStyles.text.caption,
    color: Colors.primary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  allUnlockedMessage: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  allUnlockedText: {
    ...ComponentStyles.text.body,
    color: Colors.success,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...Shadows.large,
  },
  modalClose: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.xs,
  },
  modalBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
    borderWidth: 3,
  },
  modalBadgeUnlocked: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary + '30',
  },
  modalBadgeLocked: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
  },
  modalCheckmark: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalTitle: {
    ...ComponentStyles.text.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  modalRewardText: {
    ...ComponentStyles.text.body,
    color: Colors.success,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Spacing.xs,
  },
  modalProgress: {
    width: '100%',
  },
  modalProgressBar: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  modalProgressText: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Status Card Styles
  statusCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs / 2,
  },
  statusProgress: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.gray100,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    ...ComponentStyles.text.caption,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    minWidth: 35,
  },
  statusMotivation: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});