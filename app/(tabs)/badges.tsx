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
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Star, Smile, Compass, MessageCircle, Award, Bug, X, CircleCheck as CheckCircle, Crown, Gift, Bell, HelpCircle } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';

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

const categories = [
  { id: 'all', name: 'All Badges', icon: null }, // Trophy icon removed
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

const statsConfig = [
  { key: 'appreciations', name: 'Praises', icon: Award, color: '#4ECDC4' },
  { key: 'favors', name: 'Favors', icon: Gift, color: '#FFD93D' },
  { key: 'wisdom', name: 'Wisdom', icon: Crown, color: '#9B59B6' },
  { key: 'pings', name: 'Pings', icon: Bell, color: '#6366F1' },
  { key: 'hornets', name: 'Hornets', icon: Bug, color: '#FF4444' },
];


export default function BadgesScreen() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    appreciations: 0,
    favors: 0,
    wisdom: 0,
    pings: 0,
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
        pings: 0, // Pings are not yet implemented as events
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
      .filter(event => ['APPRECIATION', 'HORNET', 'WISDOM', 'DONT_PANIC'].includes(event.event_type))
      .map(event => {
        const content = event.content || {};
        let categoryId = event.event_type.toLowerCase();
        let name = content.title;
        let description = content.description || content.message;
        
        if (event.event_type === 'APPRECIATION') {
            categoryId = content.category_id;
        } else if (event.event_type === 'WISDOM') {
            categoryId = 'relationship-wisdom';
        }

        const meta = categoryMeta[categoryId] || { name: 'Badge', icon: Award }; // Use Award icon as fallback
        const colorMap: { [key: string]: string } = {
          support: '#4ECDC4',
          kindness: '#FF6B9D',
          humor: '#FFD93D',
          adventure: '#6BCF7F',
          words: '#A8E6CF',
          hornet: '#FF4444',
          'relationship-wisdom': '#9B59B6',
          'dont-panic': '#6366F1',
        };

        return {
          id: event.id.toString(),
          name: name,
          category: categoryId,
          tier: 'bronze', // Tier is not in the DB, providing default
          earnedDate: event.created_at,
          description: description,
          icon: meta.icon,
          color: colorMap[categoryId] || '#6B7280',
          isNegative: event.event_type === 'HORNET',
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
            <Award color="#FF8C42" size={28} />
            <Text style={styles.title}>Your Badges</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <HelpCircle color="#666" size={24} />
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
          <ActivityIndicator size="large" color="#FF8C42" style={{ marginTop: 50 }} />
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
    paddingBottom: 20, // This will create the space
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 12, // Adjusted padding
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginLeft: 12,
  },
  headerButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 20, // Added padding
  },
  statsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20, // Added space from header
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
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
  categoryFilter: {},
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryFilterContainer: {
    paddingTop: 20, // This provides space above the filters
    position: 'relative',
  },
  categoryFilterItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    width: 88,
    height: 52, // Increased height for better touch target (44pt minimum)
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    // Minimum 44pt touch target as per Apple HIG
    minHeight: 44,
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
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginTop: 3,
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 2,
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
    width: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  rightScrollIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  badgesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // Add space at the top of the list
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16, // Add space between cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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