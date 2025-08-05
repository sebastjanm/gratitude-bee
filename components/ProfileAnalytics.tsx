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
import { BarChart3, TrendingUp, Calendar, Award, Heart, Bug, Target, Zap, Clock, Users, CalendarDays, CalendarRange, Infinity } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

interface StatCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

interface WeeklyData {
  label: string;
  positive: number;
  negative: number;
  total: number;
}

interface CategoryStat {
  name: string;
  color: string;
  sent: number;
  received: number;
}

interface InsightCategoryBreakdown {
  category: string;
  count: number;
}

interface Insights {
  streak_status?: string;
  first_event_time?: string;
  last_event_time?: string;
  most_active_hour?: string;
  category_breakdown?: InsightCategoryBreakdown[];
  most_active_day?: string;
  favorite_category?: string;
  partner_favorite_category?: string;
  balance_score?: string;
}

const periodFilters = [
  { id: 'today', name: 'Today', icon: Clock },
  { id: 'week', name: 'Week', icon: CalendarDays },
  { id: 'month', name: 'Month', icon: CalendarRange },
  { id: 'all', name: 'All Time', icon: Infinity },
];

interface ProfileAnalyticsProps {
  userId: string;
}

export default function ProfileAnalytics({ userId }: ProfileAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  // State for all dynamic data
  const [mainStats, setMainStats] = useState<StatCard[]>([]);
  const [breakdownTitle, setBreakdownTitle] = useState('');
  const [breakdownData, setBreakdownData] = useState<WeeklyData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [insights, setInsights] = useState<Insights>({});

  useEffect(() => {
    if (expanded) {
      fetchAnalytics();
    }
  }, [selectedPeriod, expanded]);

  const fetchAnalytics = async () => {
    setLoading(true);

    const { data, error } = await supabase.rpc('get_user_analytics', {
      p_user_id: userId,
      p_period: selectedPeriod,
    });

    if (error) {
      setLoading(false);
      return;
    }

    if (data) {
      const { main_stats, breakdown_title, breakdown_data, category_stats, insights } = data;
      
      setMainStats([
        { title: 'Total Sent', value: main_stats.total_sent || 0, icon: Heart, color: Colors.primary },
        { title: 'Total Received', value: main_stats.total_received || 0, icon: Award, color: Colors.info },
        { title: 'Current Streak', value: `${main_stats.current_streak || 0} days`, subtitle: `Best: ${main_stats.longest_streak || 0} days`, icon: Zap, color: Colors.warning },
        { title: 'Daily Average', value: main_stats.daily_average || 0, icon: TrendingUp, color: Colors.success },
      ]);
      
      setBreakdownTitle(breakdown_title || '');
      setBreakdownData(breakdown_data || []);
      setCategoryStats(category_stats || []);
      setInsights(insights || {});
    }

    setLoading(false);
  };

  const renderSimpleFilters = () => (
    <View style={styles.filterWrapper}>
      <View style={styles.simpleFilterContainer}>
        {periodFilters.map((period, index) => {
          const IconComponent = period.icon;
          const isSelected = selectedPeriod === period.id;
          return (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.simpleFilterButton,
                isSelected && styles.selectedSimpleFilterButton,
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
                  styles.simpleFilterText,
                  isSelected && styles.selectedSimpleFilterText,
                ]}
              >
                {period.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
                <Text style={styles.categoryStat}>↑ {category.sent}</Text>
                <Text style={styles.categoryStat}>↓ {category.received}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderInsights = () => {
    if (!insights) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightsList}>
          {insights.most_active_day && (
            <View style={styles.insightCard}>
              <Calendar color={Colors.primary} size={16} />
              <Text style={styles.insightText}>
                Most active on <Text style={styles.insightHighlight}>{insights.most_active_day}</Text>
              </Text>
            </View>
          )}
          {insights.favorite_category && (
            <View style={styles.insightCard}>
              <Heart color={Colors.warning} size={16} />
              <Text style={styles.insightText}>
                You love sending <Text style={styles.insightHighlight}>{insights.favorite_category}</Text>
              </Text>
            </View>
          )}
          {insights.partner_favorite_category && (
            <View style={styles.insightCard}>
              <Users color={Colors.info} size={16} />
              <Text style={styles.insightText}>
                Partner appreciates <Text style={styles.insightHighlight}>{insights.partner_favorite_category}</Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!expanded) {
    return (
      <TouchableOpacity 
        style={styles.collapsedContainer}
        onPress={() => setExpanded(true)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedContent}>
          <BarChart3 color={Colors.primary} size={24} />
          <Text style={styles.collapsedTitle}>Relationship Analytics</Text>
          <Text style={styles.expandText}>Tap to view</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(false)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <BarChart3 color={Colors.primary} size={24} />
          <Text style={styles.title}>Relationship Analytics</Text>
        </View>
        <Text style={styles.collapseText}>Tap to hide</Text>
      </TouchableOpacity>

      {renderSimpleFilters()}

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStats()}
          {renderCategoryStats()}
          {renderInsights()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  collapsedContainer: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  collapsedContent: {
    alignItems: 'center',
  },
  collapsedTitle: {
    ...ComponentStyles.text.h3,
    marginTop: Spacing.sm,
  },
  expandText: {
    ...ComponentStyles.text.caption,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...ComponentStyles.text.h3,
    marginLeft: Spacing.sm,
  },
  collapseText: {
    ...ComponentStyles.text.caption,
    color: Colors.primary,
  },
  content: {
    maxHeight: 600,
  },
  loader: {
    marginVertical: Spacing.xl,
  },
  
  // Filters
  filterWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  simpleFilterContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  simpleFilterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
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
  selectedSimpleFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  simpleFilterText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  selectedSimpleFilterText: {
    color: Colors.white,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: (width - (Layout.screenPadding * 2) - Spacing.lg * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
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
  },
  
  // Sections
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...ComponentStyles.text.h4,
    marginBottom: Spacing.md,
  },
  
  // Categories
  categoryList: {
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
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
    gap: Spacing.md,
  },
  categoryStat: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  
  // Insights
  insightsList: {
    gap: Spacing.sm,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  insightText: {
    ...ComponentStyles.text.body,
    flex: 1,
  },
  insightHighlight: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
});