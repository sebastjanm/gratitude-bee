import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ChevronLeft,
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Award, 
  Heart, 
  Zap, 
  Clock, 
  CalendarDays, 
  CalendarRange, 
  Infinity 
} from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
}

interface CategoryStat {
  name: string;
  color: string;
  sent: number;
  received: number;
}

const periodFilters = [
  { id: 'today', name: 'Today', icon: Clock },
  { id: 'week', name: 'Week', icon: CalendarDays },
  { id: 'month', name: 'Month', icon: CalendarRange },
  { id: 'all', name: 'All Time', icon: Infinity },
];

export default function AnalyticsScreen() {
  const { session } = useSession();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [loading, setLoading] = useState(true);
  
  // State for analytics data
  const [mainStats, setMainStats] = useState<StatCard[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [selectedPeriod, session]);

  const fetchAnalytics = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_analytics', {
        p_user_id: session.user.id,
        p_period: selectedPeriod,
      });

      if (error) throw error;

      if (data) {
        const { main_stats, category_stats } = data;
        
        setMainStats([
          { 
            title: 'Total Sent', 
            value: main_stats.total_sent || 0, 
            icon: Heart, 
            color: Colors.primary 
          },
          { 
            title: 'Total Received', 
            value: main_stats.total_received || 0, 
            icon: Award, 
            color: Colors.info 
          },
          { 
            title: 'Current Streak', 
            value: `${main_stats.current_streak || 0} days`, 
            subtitle: `Best: ${main_stats.longest_streak || 0} days`, 
            icon: Zap, 
            color: Colors.warning 
          },
          { 
            title: 'Daily Average', 
            value: main_stats.daily_average || 0, 
            icon: TrendingUp, 
            color: Colors.success 
          },
        ]);
        
        setCategoryStats(category_stats || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      {periodFilters.map((period, index) => {
        const IconComponent = period.icon;
        const isSelected = selectedPeriod === period.id;
        return (
          <TouchableOpacity
            key={period.id}
            style={[
              styles.filterButton,
              isSelected && styles.selectedFilterButton,
              index === 0 && styles.firstFilterButton,
              index === periodFilters.length - 1 && styles.lastFilterButton,
            ]}
            onPress={() => setSelectedPeriod(period.id)}
            activeOpacity={0.7}
          >
            <IconComponent
              color={isSelected ? Colors.white : Colors.textSecondary}
              size={16}
              strokeWidth={isSelected ? 2.5 : 2}
            />
            <Text
              style={[
                styles.filterText,
                isSelected && styles.selectedFilterText,
              ]}
            >
              {period.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsGrid}>
      {mainStats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
              <IconComponent color={stat.color} size={24} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
            {stat.subtitle && <Text style={styles.statSubtitle}>{stat.subtitle}</Text>}
          </View>
        );
      })}
    </View>
  );

  const renderCategoryStats = () => {
    if (!categoryStats || categoryStats.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <View style={styles.categoryList}>
          {categoryStats.map((category, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryStat}>Sent: {category.sent}</Text>
                <Text style={styles.categoryStat}>Received: {category.received}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Relationship Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderFilters()}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {renderStats()}
          {renderCategoryStats()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    margin: -Spacing.sm,
  },
  title: {
    ...ComponentStyles.text.h2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 44,
  },
  firstFilterButton: {
    marginLeft: 0,
  },
  lastFilterButton: {
    marginRight: 0,
  },
  selectedFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  selectedFilterText: {
    color: Colors.white,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: (width - (Layout.screenPadding * 2) - Spacing.sm) / 2,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
  },
  statTitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  
  // Sections
  section: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md,
  },
  
  // Categories
  categoryList: {
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  categoryName: {
    ...ComponentStyles.text.body,
    flex: 1,
  },
  categoryStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  categoryStat: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
});