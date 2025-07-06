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
import { Heart, Star, Smile, Compass, MessageCircle, Filter, Calendar, Bug, X, CircleCheck as CheckCircle, Crown, Chrome as Home } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface TimelineEvent {
  id: string;
  type: 'sent' | 'received';
  badgeName: string;
  category: string;
  message?: string;
  timestamp: string;
  partnerName: string;
  icon: any;
  color: string;
  isNegative?: boolean;
  cancelledBadges?: string[];
}

const mockEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'sent',
    badgeName: 'Morning Coffee',
    category: 'kindness',
    message: 'Thank you for always making my coffee just right ☕',
    timestamp: '2025-01-15T08:30:00Z',
    partnerName: 'Sarah',
    icon: Heart,
    color: '#FF6B9D',
  },
  {
    id: '2',
    type: 'received',
    badgeName: 'Workout Support',
    category: 'support',
    message: 'You believed in me when I wanted to quit!',
    timestamp: '2025-01-14T18:45:00Z',
    partnerName: 'Alex',
    icon: Star,
    color: '#4ECDC4',
  },
  {
    id: '3',
    type: 'sent',
    badgeName: 'Silly Dance',
    category: 'humor',
    timestamp: '2025-01-13T20:15:00Z',
    partnerName: 'Sarah',
    icon: Smile,
    color: '#FFD93D',
  },
  {
    id: '4',
    type: 'received',
    badgeName: 'Sunset Walk',
    category: 'adventure',
    message: 'Perfect timing for that beautiful sunset 🌅',
    timestamp: '2025-01-12T19:30:00Z',
    partnerName: 'Alex',
    icon: Compass,
    color: '#6BCF7F',
  },
  {
    id: '5',
    type: 'sent',
    badgeName: 'Sweet Message',
    category: 'words',
    message: 'Your good morning texts always make my day brighter',
    timestamp: '2025-01-11T07:20:00Z',
    partnerName: 'Sarah',
    icon: MessageCircle,
    color: '#A8E6CF',
  },
  {
    id: '6',
    type: 'sent',
    badgeName: 'Accountability Hornet',
    category: 'hornet',
    message: 'Need to address some issues we discussed',
    timestamp: '2025-01-10T16:30:00Z',
    partnerName: 'Sarah',
    icon: Bug,
    color: '#FF4444',
    isNegative: true,
    cancelledBadges: ['1', '2'],
  },
  {
    id: '7',
    type: 'received',
    badgeName: 'Whatever You Say',
    category: 'whatever-you-say',
    message: 'Thanks for letting me pick the restaurant without debate',
    timestamp: '2025-01-09T19:15:00Z',
    partnerName: 'Alex',
    icon: CheckCircle,
    color: '#9B59B6',
  },
  {
    id: '8',
    type: 'sent',
    badgeName: 'Yes, Dear',
    category: 'yes-dear',
    timestamp: '2025-01-08T14:30:00Z',
    partnerName: 'Sarah',
    icon: Crown,
    color: '#E67E22',
  },
  {
    id: '9',
    type: 'received',
    badgeName: 'Happy Wife, Happy Life',
    category: 'happy-wife',
    message: 'You remembered to pick up my favorite dessert! 🍰',
    timestamp: '2025-01-07T20:45:00Z',
    partnerName: 'Alex',
    icon: Home,
    color: '#27AE60',
  },
  {
    id: '10',
    type: 'sent',
    badgeName: 'Don\'t Panic',
    category: 'dont-panic',
    message: 'Everything will be okay ❤️ Take a deep breath',
    timestamp: '2025-01-06T15:20:00Z',
    partnerName: 'Sarah',
    icon: Heart,
    color: '#6366F1',
  },
  {
    id: '11',
    type: 'sent',
    badgeName: 'I\'m Sorry',
    category: 'im-sorry',
    message: 'I\'m truly sorry for being late. You deserve better ❤️',
    timestamp: '2025-01-05T18:30:00Z',
    partnerName: 'Sarah',
    icon: Heart,
    color: '#F87171',
  },
  { id: 'dont-panic', name: 'Don\'t Panic', icon: Heart },
];

export default function TimelineScreen() {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEvents = mockEvents.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderFilterButton = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => setShowFilters(!showFilters)}>
      <Filter color="#666" size={20} />
      <Text style={styles.filterButtonText}>
        {filter === 'all' ? 'All Events' : filter === 'sent' ? 'Sent' : 'Received'}
      </Text>
    </TouchableOpacity>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        {['all', 'sent', 'received'].map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterOption,
              filter === filterOption && styles.selectedFilterOption,
            ]}
            onPress={() => {
              setFilter(filterOption as typeof filter);
              setShowFilters(false);
            }}>
            <Text
              style={[
                styles.filterOptionText,
                filter === filterOption && styles.selectedFilterOptionText,
              ]}>
              {filterOption === 'all' ? 'All Events' : filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTimelineEvent = (event: TimelineEvent, index: number) => {
    const IconComponent = event.icon;
    const isLast = index === filteredEvents.length - 1;

    return (
      <View key={event.id} style={styles.timelineItem}>
        <View style={styles.timelineMarker}>
          <View style={[
            styles.timelineIcon, 
            { backgroundColor: event.color },
            event.isNegative && styles.negativeTimelineIcon
          ]}>
            <IconComponent color="white" size={16} />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        
        <View style={styles.timelineContent}>
          <View style={[
            styles.eventCard,
            event.isNegative && styles.negativeEventCard
          ]}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>
                {event.isNegative 
                  ? (event.type === 'sent' ? 'You sent' : 'You received')
                  : (event.type === 'sent' ? 'You sent' : 'You received')
                } {event.badgeName}
              </Text>
              <Text style={styles.eventTime}>
                {formatTimestamp(event.timestamp)}
              </Text>
            </View>
            
            <Text style={styles.eventPartner}>
              {event.type === 'sent' ? `To ${event.partnerName}` : `From ${event.partnerName}`}
            </Text>
            
            {event.isNegative && event.cancelledBadges && (
              <View style={styles.cancelledBadgesInfo}>
                <X color="#FF4444" size={14} />
                <Text style={styles.cancelledBadgesText}>
                  Cancelled {event.cancelledBadges.length} positive badge{event.cancelledBadges.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            
            {event.message && (
              <View style={[
                styles.messageContainer,
                event.isNegative && styles.negativeMessageContainer
              ]}>
                <Text style={styles.messageText}>"{event.message}"</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    const totalEvents = mockEvents.length;
    const positiveEvents = mockEvents.filter(e => !e.isNegative);
    const negativeEvents = mockEvents.filter(e => e.isNegative);
    const sentCount = positiveEvents.filter(e => e.type === 'sent').length;
    const receivedCount = positiveEvents.filter(e => e.type === 'received').length;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>This Week's Appreciation</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{positiveEvents.length}</Text>
            <Text style={styles.statLabel}>Positive</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, styles.negativeStatNumber]}>{negativeEvents.length}</Text>
            <Text style={styles.statLabel}>Hornets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalEvents}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{sentCount}</Text>
            <Text style={styles.statLabel}>Sent</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appreciation Timeline</Text>
        <Text style={styles.subtitle}>
          Your beautiful journey together
        </Text>
      </View>

      {renderStats()}
      
      <View style={styles.filterContainer}>
        {renderFilterButton()}
        {renderFilters()}
      </View>

      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(renderTimelineEvent)
        ) : (
          <View style={styles.emptyState}>
            <Calendar color="#ccc" size={48} />
            <Text style={styles.emptyStateText}>
              No events match your filter
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try selecting different filters or start sending badges!
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedFilterOption: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  filterOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  selectedFilterOptionText: {
    color: 'white',
  },
  timeline: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  eventTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  eventPartner: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginBottom: 8,
  },
  messageContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8C42',
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
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
  negativeTimelineIcon: {
    borderWidth: 2,
    borderColor: '#FF6666',
  },
  negativeEventCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    backgroundColor: '#FFFAFA',
  },
  cancelledBadgesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  cancelledBadgesText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#FF4444',
    marginLeft: 6,
  },
  negativeMessageContainer: {
    backgroundColor: '#FFF5F5',
    borderLeftColor: '#FF4444',
  },
  negativeStatNumber: {
    color: '#FF4444',
  },
});