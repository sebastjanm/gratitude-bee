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
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Star, Smile, Compass, MessageCircle, Filter, Calendar, Bug, X, CircleCheck as CheckCircle, Crown, Home as HomeIcon, Clock, HelpCircle } from 'lucide-react-native';
import { useSession } from '@/providers/SessionProvider';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';

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
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  content?: {
    title: string;
    category_id: string;
    message?: string;
    points?: number;
    points_icon?: string;
  };
}

const filterOptions = [
  { id: 'received', name: 'Received' },
  { id: 'sent', name: 'Sent' },
  { id: 'all', name: 'All Events' },
];

const categoryDetails: { [key: string]: { icon: any; color: string } } = {
  kindness: { icon: Heart, color: '#FF6B9D' },
  support: { icon: Star, color: '#4ECDC4' },
  humor: { icon: Smile, color: '#FFD93D' },
  adventure: { icon: Compass, color: '#6BCF7F' },
  words: { icon: MessageCircle, color: '#A8E6CF' },
  'whatever-you-say': { icon: CheckCircle, color: '#9B59B6' },
  'yes-dear': { icon: Crown, color: '#E67E22' },
  'happy-wife': { icon: HomeIcon, color: '#27AE60' },
  'dont-panic': { icon: Heart, color: '#6366F1' },
  'im-sorry': { icon: Heart, color: '#F87171' },
  hornet: { icon: Bug, color: '#FF4444' },
  favor: { icon: Heart, color: '#8B4513' }, // Placeholder, can be improved
  default: { icon: Heart, color: '#ccc' },
};

const getEventVisuals = (event: any) => {
  if (event.event_type === 'APPRECIATION' && event.content?.icon) {
    const category = categoryDetails[event.content.category_id] || categoryDetails.default;
    return { 
      IconComponent: () => <Text style={{fontSize: 16}}>{event.content.icon}</Text>, 
      color: category.color 
    };
  }

  const category = event.content?.category_id || event.event_type.toLowerCase();
  const details = categoryDetails[category] || categoryDetails.default;
  return { IconComponent: details.icon, color: details.color };
};

const transformEvent = (e: any, currentUserId: string, usersMap: Map<string, string>) => {
  const { IconComponent, color } = getEventVisuals(e);
  const partnerId = e.sender_id === currentUserId ? e.receiver_id : e.sender_id;
  
  return {
    id: e.id,
    type: (e.sender_id === currentUserId ? 'sent' : 'received') as 'sent' | 'received',
    badgeName: e.content.title,
    category: e.content.category_id || e.event_type.toLowerCase(),
    message: e.content.message,
    timestamp: e.created_at,
    partnerName: usersMap.get(partnerId) || 'Partner',
    icon: IconComponent,
    color: color,
    isNegative: e.event_type === 'HORNET',
    status: e.status,
    content: e.content,
  }
};


export default function TimelineScreen() {
  const { session } = useSession();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('received');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        fetchEvents(true);
      }
    }, [session, filter])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEvents(true).then(() => setRefreshing(false));
  }, []);

  const fetchEvents = async (isInitialFetch = false) => {
    if (!session || (!isInitialFetch && (loadingMore || !hasMore))) return;

    if (isInitialFetch) {
      setLoading(true);
      setPage(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const currentPage = isInitialFetch ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from('events').select('*').range(from, to);

    if (filter === 'sent') {
      query = query.eq('sender_id', session.user.id);
    } else if (filter === 'received') {
      query = query.eq('receiver_id', session.user.id);
    } else {
      query = query.or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', 'Could not fetch your timeline.');
      console.error(error);
    } else if (data) {
      const { data: usersData, error: usersError } = await supabase.from('users').select('id, display_name');
      if (usersError) {
        console.error("Could not fetch user names for timeline");
      }
      const usersMap = new Map(usersData?.map(u => [u.id, u.display_name]));

      const mappedEvents = data.map((e: any) => transformEvent(e, session.user.id, usersMap));

      if (isInitialFetch) {
        setEvents(mappedEvents);
      } else {
        setEvents(prevEvents => [...prevEvents, ...mappedEvents]);
      }

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setPage(currentPage + 1);
    }
    
    if (isInitialFetch) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  };
  
  const handleFavorResponse = async (eventId: string, newStatus: 'ACCEPTED' | 'DECLINED') => {
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus, event_type: 'FAVOR_RESPONSE' })
      .eq('id', eventId);
    
    if (error) {
      Alert.alert('Error', 'Could not update the favor status.');
    } else {
      Alert.alert('Response Sent', `You have ${newStatus.toLowerCase()} the favor request.`);
      fetchEvents(true);
    }
  };

  const handleFavorCompletion = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .update({ status: 'COMPLETED', event_type: 'FAVOR_COMPLETED' })
      .eq('id', eventId);

    if (error) {
      Alert.alert('Error', 'Could not complete the favor.');
    } else {
      Alert.alert('Favor Completed!', 'You have marked the favor as complete. Points have been awarded!');
      fetchEvents(true);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    if (seconds < 60) return 'just now';
    if (seconds < intervals.hour) {
      const minutes = Math.floor(seconds / intervals.minute);
      return `${minutes}m ago`;
    }
    if (seconds < intervals.day) {
      const hours = Math.floor(seconds / intervals.hour);
      return `${hours}h ago`;
    }
    if (seconds < intervals.week * 2) {
      const days = Math.floor(seconds / intervals.day);
      if (days === 1) return 'yesterday';
      return `${days}d ago`;
    }

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
                {event.badgeName}
              </Text>
              {event.content?.points && (
                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsText}>{event.content.points} {event.content.points_icon}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.eventTime}>
              {formatTimestamp(event.timestamp)}
            </Text>
            
            <Text style={styles.eventPartner}>
              {event.type === 'sent' ? `To: ${event.partnerName}` : `From: ${event.partnerName}`}
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

            {/* Action Buttons for Favors */}
            {event.category === 'favor' && event.type === 'received' && (
              <View style={styles.actionsContainer}>
                {event.status === 'PENDING' && (
                  <>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleFavorResponse(event.id, 'ACCEPTED')}>
                      <CheckCircle color="white" size={16} />
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={() => handleFavorResponse(event.id, 'DECLINED')}>
                      <X color="white" size={16} />
                      <Text style={styles.actionButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </>
                )}
                {event.status === 'ACCEPTED' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleFavorCompletion(event.id)}>
                    <CheckCircle color="white" size={16} />
                    <Text style={styles.actionButtonText}>Mark as Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Clock color="#FF8C42" size={28} />
            <Text style={styles.title}>Timeline</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
            <HelpCircle color="#666" size={24} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Your beautiful journey together
        </Text>
        {renderSimpleFilters()}
      </View>

      <ScrollView 
        style={styles.timeline} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF8C42" />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FF8C42" style={{ marginTop: 50 }} />
        ) : filteredEvents.length > 0 ? (
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
        
        {loadingMore && <ActivityIndicator size="small" color="#FF8C42" style={{ marginVertical: 20 }} />}
        
        {!loading && hasMore && (
          <TouchableOpacity style={styles.loadMoreButton} onPress={() => fetchEvents()}>
            <Text style={styles.loadMoreButtonText}>Load More</Text>
          </TouchableOpacity>
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
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    paddingHorizontal: 20,
    paddingBottom: 20, // Add more space
  },
  simpleFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
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
    paddingTop: 20, // Add space at the top of the timeline
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
    marginBottom: 4, // Adjusted
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  pointsContainer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
  },
  eventTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginBottom: 8, // Moved from eventHeader
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
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50', // Green
  },
  declineButton: {
    backgroundColor: '#F44336', // Red
  },
  completeButton: {
    backgroundColor: '#2196F3', // Blue
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
  loadMoreButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadMoreButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF8C42',
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