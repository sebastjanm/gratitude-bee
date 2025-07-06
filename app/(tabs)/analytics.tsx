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
import { ChartBar as BarChart3, TrendingUp, Calendar, Award, Heart, Bug, Target, Zap, Clock, Users } from 'lucide-react-native';

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
  week: string;
  positive: number;
  negative: number;
  total: number;
}

const mockWeeklyData: WeeklyData[] = [
  { week: 'This Week', positive: 18, negative: 2, total: 20 },
  { week: 'Last Week', positive: 15, negative: 1, total: 16 },
  { week: '2 Weeks Ago', positive: 22, negative: 3, total: 25 },
  { week: '3 Weeks Ago', positive: 12, negative: 0, total: 12 },
];

const mockMonthlyStats = {
  totalBadgesSent: 67,
  totalBadgesReceived: 63,
  currentStreak: 12,
  longestStreak: 18,
  averageDaily: 2.3,
  mostActiveDay: 'Tuesday',
  favoriteCategory: 'Humor',
  partnerFavoriteCategory: 'Kindness',
};

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  const mainStats: StatCard[] = [
    {
      title: 'Total Sent',
      value: mockMonthlyStats.totalBadgesSent,
      subtitle: 'This month',
      icon: Heart,
      color: '#FF8C42',
      trend: { direction: 'up', percentage: 12 },
    },
    {
      title: 'Total Received',
      value: mockMonthlyStats.totalBadgesReceived,
      subtitle: 'This month',
      icon: Award,
      color: '#4ECDC4',
      trend: { direction: 'up', percentage: 8 },
    },
    {
      title: 'Current Streak',
      value: `${mockMonthlyStats.currentStreak} days`,
      subtitle: `Best: ${mockMonthlyStats.longestStreak} days`,
      icon: Zap,
      color: '#FFD93D',
    },
    {
      title: 'Daily Average',
      value: mockMonthlyStats.averageDaily,
      subtitle: 'Badges per day',
      icon: TrendingUp,
      color: '#6BCF7F',
      trend: { direction: 'up', percentage: 15 },
    },
  ];

  const categoryStats = [
    { name: 'Humor', sent: 15, received: 12, color: '#FFD93D' },
    { name: 'Kindness', sent: 12, received: 18, color: '#FF6B9D' },
    { name: 'Support', sent: 8, received: 10, color: '#4ECDC4' },
    { name: 'Love Notes', sent: 20, received: 15, color: '#A8E6CF' },
    { name: 'Adventure', sent: 6, received: 4, color: '#6BCF7F' },
    { name: 'Hornets', sent: 2, received: 1, color: '#FF4444' },
  ];

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'all'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.selectedPeriodButton,
          ]}
          onPress={() => setSelectedPeriod(period)}>
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.selectedPeriodButtonText,
            ]}>
            {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
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

  const renderWeeklyBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
      <View style={styles.weeklyChart}>
        {mockWeeklyData.map((week, index) => (
          <View key={index} style={styles.weeklyBar}>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  styles.positiveBar,
                  { height: Math.max((week.positive / 25) * 80, 8) }
                ]} 
              />
              <View 
                style={[
                  styles.bar, 
                  styles.negativeBar,
                  { height: Math.max((week.negative / 25) * 80, 4) }
                ]} 
              />
            </View>
            <Text style={styles.weekLabel}>{week.week}</Text>
            <Text style={styles.weekTotal}>{week.total}</Text>
          </View>
        ))}
      </View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
          <Text style={styles.legendText}>Positive</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF4444' }]} />
          <Text style={styles.legendText}>Hornets</Text>
        </View>
      </View>
    </View>
  );

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

  const renderInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Insights & Patterns</Text>
      
      <View style={styles.insightsList}>
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Calendar color="#8B5CF6" size={20} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Most Active Day</Text>
            <Text style={styles.insightValue}>{mockMonthlyStats.mostActiveDay}</Text>
            <Text style={styles.insightDescription}>You send the most badges on Tuesdays</Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Heart color="#FF6B9D" size={20} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Your Favorite</Text>
            <Text style={styles.insightValue}>{mockMonthlyStats.favoriteCategory}</Text>
            <Text style={styles.insightDescription}>Your most sent category</Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Users color="#4ECDC4" size={20} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Partner's Favorite</Text>
            <Text style={styles.insightValue}>{mockMonthlyStats.partnerFavoriteCategory}</Text>
            <Text style={styles.insightDescription}>What they appreciate most</Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Target color="#6BCF7F" size={20} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Balance Score</Text>
            <Text style={styles.insightValue}>94%</Text>
            <Text style={styles.insightDescription}>Great give-and-take balance</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <BarChart3 color="#FF8C42" size={28} />
          <Text style={styles.title}>Analytics</Text>
        </View>
        <Text style={styles.subtitle}>
          Insights into your appreciation journey
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPeriodSelector()}
        {renderMainStats()}
        {renderWeeklyBreakdown()}
        {renderCategoryBreakdown()}
        {renderInsights()}
        
        <View style={styles.bottomSpacing} />
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: '#FF8C42',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
  },
  weeklyChart: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weeklyBar: {
    alignItems: 'center',
    flex: 1,
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
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  weekTotal: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#333',
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
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  categoryList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
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
    color: '#333',
    flex: 1,
  },
  categoryTotal: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
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
    color: '#666',
  },
  insightsList: {
    gap: 16,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
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
    color: '#666',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  bottomSpacing: {
    height: 40,
  },
});