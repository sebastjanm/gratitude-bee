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
import { Heart, Star, Smile, Compass, MessageCircle, Filter, Calendar, Bug, X, CircleCheck as CheckCircle, Crown, Chrome as Home, Clock } from 'lucide-react-native';

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
    partnerName: 'Breda',
    icon: Heart,
    color: '#F87171',
  },
  {
    id: '2',
    type: 'received',
    badgeName: 'Workout Support',
    category: 'support',
    message: 'You believed in me when I wanted to quit!',
    timestamp: '2025-01-14T18:45:00Z',
    partnerName: 'Sebastjan',
    icon: Star,
    color: '#4ECDC4',
  },
  {
    id: '3',
    type: 'sent',
    badgeName: 'Silly Dance',
    category: 'humor',
    timestamp: '2025-01-13T20:15:00Z',
    partnerName: 'Breda',
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
    partnerName: 'Sebastjan',
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
    partnerName: 'Breda',
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
    partnerName: 'Breda',
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
    partnerName: 'Sebastjan',
    icon: CheckCircle,
    color: '#9B59B6',
  },
  {
    id: '8',
    type: 'sent',
    badgeName: 'Yes, Dear',
    category: 'yes-dear',
    timestamp: '2025-01-08T14:30:00Z',
    partnerName: 'Breda',
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
    partnerName: 'Sebastjan',
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
    partnerName: 'Breda',
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
    partnerName: 'Breda',
    icon: Heart,
    color: '#F87171',
  },
];

const filterOptions = [
  { id: 'all', name: 'All Events' },
  { id: 'sent', name: 'Sent' },
  { id: 'received', name: 'Received' },
];

export default function TimelineScreen() {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

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

  const renderSimpleFilters = () => (
    <View style={styles.simpleFilterContainer}>
      {filterOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.simpleFilterButton,
            filter === option.id && styles.selectedSimpleFilterButton,
          ]}
          onPress={() => setFilter(option.id as 'all' | 'sent' | 'received')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.simpleFilterText,
              filter === option.id && styles.selectedSimpleFilterText,
            ]}
          >
            {option.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Clock color="#FF8C42" size={28} />
          <Text style={styles.title}>Timeline</Text>
        </View>
        <Text style={styles.subtitle}>
          Your beautiful journey together
        </Text>
      </View>

      {renderSimpleFilters()}

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
  simpleFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  simpleFilterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedSimpleFilterButton: {
    backgroundColor: '#FF8C42',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  simpleFilterText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  selectedSimpleFilterText: {
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