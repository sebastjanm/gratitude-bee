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
import { ChartBar as BarChart3, TrendingUp, Calendar, Award, Heart, Bug, Target, Zap, Clock, Users, Filter, ChevronDown, HelpCircle } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
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
  { id: 'today', name: 'Today' },
  { id: 'week', name: 'This Week' },
  { id: 'month', name: 'This Month' },
  { id: 'all', name: 'All Time' },
];

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  
  // State for all dynamic data
  const [mainStats, setMainStats] = useState<StatCard[]>([]);
  const [breakdownTitle, setBreakdownTitle] = useState('');
  const [breakdownData, setBreakdownData] = useState<WeeklyData[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [insights, setInsights] = useState<Insights>({});

  useFocusEffect(
    React.useCallback(() => {
      fetchAnalytics();
    }, [selectedPeriod])
  );

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('get_user_analytics', {
      p_user_id: user.id,
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
    <View style={styles.simpleFilterContainer}>
      {periodFilters.map((period) => (
        <TouchableOpacity
          key={period.id}
          style={[
            styles.simpleFilterButton,
            selectedPeriod === period.id && styles.selectedSimpleFilterButton,
          ]}
          onPress={() => setSelectedPeriod(period.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.simpleFilterText,
              selectedPeriod === period.id && styles.selectedSimpleFilterText,
            ]}
          >
            {period.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMainStats = () => (
    <View style={styles.statsGrid}>
      {mainStats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <View key={index} style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <IconComponent color={stat.color} size={20} />
              </View>
              {stat.trend && (
                <View style={[styles.trendIndicator, { backgroundColor: stat.trend.direction === 'up' ? '#E8F5E8' : '#FFF5F5' }]}>
                  <TrendingUp 
                    color={stat.trend.direction === 'up' ? '#4CAF50' : '#F44336'} 
                    size={12}
                    style={stat.trend.direction === 'down' ? { transform: [{ rotate: '180deg' }] } : {}}
                  />
                  <Text style={[styles.trendText, { color: stat.trend.direction === 'up' ? '#4CAF50' : '#F44336' }]}>
                    {stat.trend.percentage}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
            {stat.subtitle && <Text style={styles.statSubtitle}>{stat.subtitle}</Text>}
          </View>
        );
      })}
    </View>
  );

  const renderBreakdownChart = () => {
    // Prevent rendering if data is empty
    if (!breakdownData || breakdownData.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{breakdownTitle}</Text>
          <View style={styles.weeklyChart}>
            <Text style={styles.noDataText}>No activity in this period.</Text>
          </View>
        </View>
      );
    }
    
    // Find max total for scaling bars
    const maxTotal = Math.max(...breakdownData.map(d => d.total), 1);
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{breakdownTitle}</Text>
        <View style={styles.weeklyChart}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weeklyChartContent}
            style={styles.weeklyChartScroll}
          >
            {breakdownData.map((item, index) => (
              <View key={index} style={styles.weeklyBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      styles.positiveBar,
                      { height: (item.positive / maxTotal) * 80 }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.bar, 
                      styles.negativeBar,
                      { height: (item.negative / maxTotal) * 80 }
                    ]} 
                  />
                </View>
                <Text style={styles.weekLabel}>{item.label}</Text>
                <Text style={styles.weekTotal}>{item.total}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
            <Text style={styles.legendText}>Positive</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
            <Text style={styles.legendText}>Hornets</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category Breakdown</Text>
      <Text style={styles.sectionSubtitle}>Your appreciation patterns by category</Text>
      
      <View style={styles.categoryList}>
        {categoryStats.map((category, index) => {
          const total = category.sent + category.received;
          const maxTotal = Math.max(...categoryStats.map(c => c.sent + c.received));
          const percentage = (total / maxTotal) * 100;
          
          return (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryTotal}>{total}</Text>
              </View>
              
              <View style={styles.categoryBar}>
                <View 
                  style={[
                    styles.categoryProgress,
                    { backgroundColor: category.color, width: `${percentage}%` }
                  ]} 
                />
              </View>
              
              <View style={styles.categoryDetails}>
                <Text style={styles.categoryDetail}>Sent: {category.sent}</Text>
                <Text style={styles.categoryDetail}>Received: {category.received}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderInsights = () => {
    if (!insights) return null;
    // Context-aware insights rendering
    if (selectedPeriod === 'today') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights & Patterns</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Zap color="#FFD93D" size={20} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Streak Status</Text>
                <Text style={styles.insightValue}>{insights.streak_status || '-'}</Text>
                <Text style={styles.insightDescription}>Your appreciation streak for today</Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Clock color="#8B5CF6" size={20} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>First Event Time</Text>
                <Text style={styles.insightValue}>{insights.first_event_time || '-'}</Text>
                <Text style={styles.insightDescription}>First badge sent today</Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Clock color="#4ECDC4" size={20} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Last Event Time</Text>
                <Text style={styles.insightValue}>{insights.last_event_time || '-'}</Text>
                <Text style={styles.insightDescription}>Last badge sent today</Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <View style={styles.insightIcon}>
                <Calendar color="#FF8C42" size={20} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Most Active Hour</Text>
                <Text style={styles.insightValue}>{insights.most_active_hour || '-'}</Text>
                <Text style={styles.insightDescription}>Hour with most activity today</Text>
              </View>
            </View>
            {Array.isArray(insights.category_breakdown) && insights.category_breakdown.length > 0 && (
              <View style={styles.insightCard}>
                <View style={styles.insightIcon}>
                  <Heart color="#FF6B9D" size={20} />
                </View>
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>Category Breakdown</Text>
                  {insights.category_breakdown.map((cat: InsightCategoryBreakdown, idx: number) => (
                    <Text key={idx} style={styles.insightValue}>{cat.category}: {cat.count}</Text>
                  ))}
                  <Text style={styles.insightDescription}>Badges sent by category today</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      );
    }
    // Default: week, month, all
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights & Patterns</Text>
        <View style={styles.insightsList}>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Calendar color="#8B5CF6" size={20} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Most Active Day</Text>
              <Text style={styles.insightValue}>{insights.most_active_day || '-'}</Text>
              <Text style={styles.insightDescription}>You send the most badges on this day</Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Heart color="#FF6B9D" size={20} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Your Favorite</Text>
              <Text style={styles.insightValue}>{insights.favorite_category || '-'}</Text>
              <Text style={styles.insightDescription}>Your most sent category</Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Users color="#4ECDC4" size={20} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Partner's Favorite</Text>
              <Text style={styles.insightValue}>{insights.partner_favorite_category || '-'}</Text>
              <Text style={styles.insightDescription}>What they appreciate most</Text>
            </View>
          </View>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Target color="#6BCF7F" size={20} />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Balance Score</Text>
              <Text style={styles.insightValue}>{insights.balance_score || '-'}</Text>
              <Text style={styles.insightDescription}>Great give-and-take balance</Text>
            </View>
          </View>
        </View>
      </View>
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
            <BarChart3 color={Colors.primary} size={28} />
            <Text style={styles.title}>Analytics</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
            <HelpCircle color={Colors.textSecondary} size={Layout.iconSize.lg} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Insights into your appreciation journey
        </Text>
        {renderSimpleFilters()}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1, marginTop: 100 }} />
        ) : (
          <>
            {renderMainStats()}
            {renderBreakdownChart()}
            {renderCategoryBreakdown()}
            {renderInsights()}
          </>
        )}
        
        <View style={styles.bottomSpacing} />
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
    paddingBottom: Spacing.lg,
  },
  content: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  simpleFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: Layout.screenPadding,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  simpleFilterButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSimpleFilterButton: {
    backgroundColor: Colors.primary,
    ...Shadows.md,
  },
  simpleFilterText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
  },
  selectedSimpleFilterText: {
    color: Colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing['2xl'],
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: (width - (Layout.screenPadding * 2) - Spacing.md) / 2,
    ...Shadows.sm,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    marginLeft: 2,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  section: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  weeklyChart: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    height: 140,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  noDataText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.textTertiary,
  },
  weeklyChartScroll: {
    flex: 1,
  },
  weeklyChartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },
  weeklyBar: {
    alignItems: 'center',
    width: 50,
    marginHorizontal: 8,
  },
  barContainer: {
    height: 80,
    width: 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 2,
  },
  positiveBar: {
    backgroundColor: '#4ECDC4',
  },
  negativeBar: {
    backgroundColor: '#FF4444',
  },
  weekLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  weekTotal: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  legendText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  categoryList: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    flex: 1,
  },
  categoryTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
  },
  categoryBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 8,
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 3,
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryDetail: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
  },
  insightsList: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
  },
  bottomSpacing: {
    height: 40,
  },
});