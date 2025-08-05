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
import { Heart, Star, Smile, Compass, MessageCircle, Award, Bug, X, CircleCheck as CheckCircle, Crown, Gift, Bell, HelpCircle } from 'lucide-react-native';
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

const categories = [
  { id: 'all', name: 'All Badges', icon: null }, // Trophy icon removed
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

const statsConfig = [
  { key: 'appreciations', name: 'Praises', icon: Award, color: Colors.info },
  { key: 'favors', name: 'Favors', icon: Gift, color: Colors.warning },
  { key: 'wisdom', name: 'Wisdom', icon: Crown, color: '#9B59B6' },
  { key: 'pings', name: 'Pings', icon: Bell, color: Colors.info },
  { key: 'dont_panic', name: "Don't Panic", icon: Heart, color: '#6366F1' },
  { key: 'hornets', name: 'Hornets', icon: Bug, color: Colors.error },
];


export default function BadgesScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    appreciations: 0,
    favors: 0,
    wisdom: 0,
    pings: 0,
    dont_panic: 0,
    hornets: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      fetchBadges();
    }, [])
  );

  const fetchBadges = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('event_type') // Only select the column we need for stats
      .eq('receiver_id', user.id);

    if (error) {
      console.error('Error fetching stats:', error);
    } else {
      const newStats = {
        appreciations: events.filter(e => e.event_type === 'APPRECIATION').length,
        favors: events.filter(e => e.event_type === 'FAVOR_REQUEST').length,
        wisdom: events.filter(e => e.event_type === 'WISDOM').length,
        pings: events.filter(e => e.event_type === 'PING').length,
        dont_panic: events.filter(e => e.event_type === 'DONT_PANIC').length,
        hornets: events.filter(e => e.event_type === 'HORNET').length,
      };
      setStats(newStats);
    }

    // This can be a separate call or could be combined if performance is a concern
    const { data: badgeEvents, error: badgeError } = await supabase
      .from('events')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (badgeError) {
      console.error('Error fetching badges:', badgeError);
      setBadges([]);
    } else {
      const transformedBadges = transformEventsToBadges(badgeEvents);
      setBadges(transformedBadges);
    }
    setLoading(false);
  };

  const transformEventsToBadges = (events: any[]): Badge[] => {
    const categoryMeta = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as { [key: string]: { name: string; icon: any } });
    
    // Add meta for specific wisdom/hornet types if not in main categories list
    if (!categoryMeta['hornet']) categoryMeta['hornet'] = { name: 'Hornet', icon: Bug };
    if (!categoryMeta['dont-panic']) categoryMeta['dont-panic'] = { name: 'Dont Panic', icon: Heart };
    if (!categoryMeta['im-sorry']) categoryMeta['im-sorry'] = { name: 'I\'m Sorry', icon: Heart };


    return events
      .filter(event => ['APPRECIATION', 'HORNET', 'WISDOM', 'DONT_PANIC', 'PING'].includes(event.event_type))
      .map(event => {
        const content = event.content || {};
        let categoryId = event.event_type.toLowerCase().replace('_', '-');
        
        // --- CORRECTED DYNAMIC DATA LOGIC ---
        let name = content.title;
        let description = content.description || content.message;
        let icon = content.icon;
        let color = content.color;
        let isEmojiIcon = !!icon; // Assume any dynamic icon is an emoji for now

        if (typeof name !== 'string' || !name) {
          name = event.event_type.toLowerCase().replace(/_/g, ' '); // Fallback
        }

        if (typeof description !== 'string') {
          description = ''; // Fallback to empty string
        }
        
        if (event.event_type === 'APPRECIATION' && content.category_id) {
          categoryId = content.category_id;
          const meta = categoryMeta[categoryId] || {};
          icon = meta.icon; // Use icon from category meta for appreciations
          isEmojiIcon = false;
        } else if (event.event_type === 'WISDOM') {
          categoryId = 'relationship-wisdom';
        }
        // --- END OF FIX ---

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
              {IconComponent && <IconComponent
                color={isSelected ? 'white' : '#666'}
                size={16}
                strokeWidth={isSelected ? 2.5 : 2}
              />}
              <Text
                style={[
                  styles.categoryFilterText,
                  isSelected && styles.selectedCategoryFilterText,
                  !IconComponent && { marginTop: 0 }
                ]}
                numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderBadge = (item: Badge) => {
    const BadgeIcon = item.icon;
    const isEmoji = typeof item.icon === 'string';
    return (
      <View key={item.id} style={[
        styles.badgeCard,
        item.isNegative && styles.negativeBadgeCard
      ]}>
        <View style={styles.badgeContent}>
          <View style={[
            styles.badgeIcon, 
            { backgroundColor: item.color },
            item.isNegative && styles.negativeBadgeIcon
          ]}>
            {isEmoji ? (
              <Text style={styles.emojiIcon}>{item.icon}</Text>
            ) : (
              <BadgeIcon color="white" size={24} />
            )}
          </View>
          <View style={styles.badgeTextContent}>
            <Text style={styles.badgeName}>{item.name}</Text>
            <Text style={styles.badgeDescription}>{item.description}</Text>
            {item.isNegative && item.cancelledBadges && (
              <View style={styles.cancelledInfo}>
                <X color="#FF4444" size={12} />
                <Text style={styles.cancelledText}>
                  Cancelled {item.cancelledBadges.length} badge{item.cancelledBadges.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            <Text style={styles.badgeDate}>
              {item.isNegative ? 'Sent' : 'Earned'} on {new Date(item.earnedDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
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
              <Text style={styles.statNumber}>{stats[stat.key as keyof typeof stats]}</Text>
              <Text style={styles.statLabel}>{stat.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
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
            <Award color={Colors.primary} size={28} />
            <Text style={styles.title}>Your Badges</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
            <HelpCircle color={Colors.textSecondary} size={Layout.iconSize.lg} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Beautiful moments you've shared together
        </Text>
        {renderStats()}
        {renderCategoryFilter()}
      </View>

      <ScrollView style={styles.badgesList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : filteredBadges.length > 0 ? (
          filteredBadges.map(renderBadge)
        ) : (
          <View style={styles.emptyState}>
            <Award color="#ccc" size={48} />
            <Text style={styles.emptyStateText}>
              Sorry, no badges yet :(
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try selecting different categories
            </Text>
          </View>
        )}
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
  },
  statsContainer: {
    ...ComponentStyles.card,
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: Colors.info + '30',
  },
  statsTitle: {
    ...ComponentStyles.text.h3,
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
    marginBottom: Spacing.sm,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  categoryFilter: {},
  categoryFilterContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xs,
  },
  categoryFilterContainer: {
    paddingTop: 20, // This provides space above the filters
    position: 'relative',
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
    minHeight: 44,
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
    lineHeight: 13,
    paddingHorizontal: 2,
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
    marginTop: Spacing.xs,
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
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  badgeDate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
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
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginTop: 8,
    textAlign: 'center',
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
  cancelledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cancelledText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.error,
    marginLeft: 4,
  },
  negativeStatNumber: {
    color: '#FF4444',
  },
  emojiIcon: {
    fontSize: 20,
  },
});