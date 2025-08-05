import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Star, Smile, Compass, MessageCircle, Filter, Calendar, Bug, X, CircleCheck as CheckCircle, Crown, Home as HomeIcon, Clock, HelpCircle, ThumbsUp, ThumbsDown, ArrowDownLeft, ArrowUpRight, List, Send, Download } from 'lucide-react-native';
import { useSession } from '@/providers/SessionProvider';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import ReactionModal from '@/components/ReactionModal';
import ActivitySummary from '@/components/ActivitySummary';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

interface TimelineEvent {
  id: string;
  type: 'sent' | 'received';
  badgeName: string;
  category: string;
  eventType: string;
  message?: string;
  description?: string;
  timestamp: string;
  partnerName: string;
  icon: any;
  color: string;
  isNegative?: boolean;
  cancelledBadges?: string[];
  status?: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED';
  reaction?: string; // Add reaction field
  content?: {
    title: string;
    description?: string;
    category_id: string;
    message?: string;
    points?: number;
    points_icon?: string;
    icon?: string; // Added for dynamic icons
    color?: string; // Added for dynamic colors
  };
  isEmojiIcon?: boolean;
}

const filterOptions = [
  { id: 'all', name: 'All', icon: List },
  { id: 'received', name: 'Received', icon: Download },
  { id: 'sent', name: 'Sent', icon: Send },
];

const categoryDetails: { [key: string]: { icon: any; color: string } } = {
  // Appreciation categories are still used as fallbacks for older events
  kindness: { icon: Heart, color: Colors.primary },
  support: { icon: Star, color: Colors.info },
  humor: { icon: Smile, color: Colors.warning },
  adventure: { icon: Compass, color: Colors.success },
  words: { icon: MessageCircle, color: Colors.gray600 },
  // Event type fallbacks for events without dynamic content
  hornet: { icon: Bug, color: Colors.error },
  favor: { icon: Heart, color: Colors.gray700 },
  wisdom: { icon: HelpCircle, color: '#8B5CF6' },
  ping: { icon: MessageCircle, color: Colors.info },
  dont_panic: { icon: Heart, color: '#6366F1' },
  default: { icon: Heart, color: Colors.gray400 },
};

const reactionIcons: { [key: string]: string } = {
  love: '❤️',
  thumbs_up: '👍',
  smile: '😊',
  sad: '😢',
  pray: '🙏',
  why: '🤔',
};

const getEventVisuals = (event: any) => {
  const content = event.content || {};
  if (content.icon && content.color) {
    return { icon: content.icon, color: content.color, isEmojiIcon: true };
  }

  // Fallback logic for older events or events without dynamic visuals (like favors).
  const category = content?.category_id || event.event_type.toLowerCase();
  const details = categoryDetails[category] || categoryDetails.default;
  return { icon: details.icon, color: details.color, isEmojiIcon: false };
};

const transformEvent = (event: any, currentUserId: string, usersMap: Map<string, string>) => {
  const content = event.content || {};
  let { icon, color, isEmojiIcon } = getEventVisuals(event);

  let badgeName = content.title;
  if (typeof badgeName !== 'string') {
    badgeName = event.event_type.toLowerCase().replace(/_/g, ' ');
  }

  let description = content.description || content.message;
  if (typeof description !== 'string') {
    description = '';
  }

  const isSender = event.sender_id === currentUserId;
  const partnerId = isSender ? event.receiver_id : event.sender_id;
  
  if (event.event_type === 'APPRECIATION') {
      const category = content.category_id || 'default';
      const details = categoryDetails[category] || categoryDetails.default;
      icon = details.icon;
      isEmojiIcon = false;
  }

  return {
    id: event.id,
    type: (isSender ? 'sent' : 'received') as 'sent' | 'received',
    badgeName: badgeName,
    category: content.category_id || event.event_type.toLowerCase(),
    eventType: event.event_type,
    message: content.message,
    timestamp: event.created_at,
    partnerName: usersMap.get(partnerId) || 'Partner',
    icon: icon,
    color: color,
    isNegative: event.event_type === 'HORNET',
    status: event.status,
    reaction: event.reaction, // Pass reaction
    content: content,
    description: description,
    isEmojiIcon: isEmojiIcon,
  }
};


export default function TimelineScreen() {
  const { session } = useSession();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const [refreshing, setRefreshing] = useState(false);
  const [isReactionModalVisible, setReactionModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentReactionOptions, setCurrentReactionOptions] = useState({});
  const [summaryData, setSummaryData] = useState({
    weeklyStats: { sent: 0, received: 0, streak: 0 },
    insights: [] as string[],
    balance: { ratio: 0.5, status: 'balanced' as const }
  });

  const formatEventType = (type: string) => {
    if (!type) return '';
    const lower = type.toLowerCase();
    if (lower.includes('favor')) return 'Favor';
    if (lower === 'dont_panic') return "Don't Panic";
    
    return lower.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

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

  const handleCardPress = (event: TimelineEvent) => {
    if (event.type === 'received' && !event.reaction) {
      if (event.eventType === 'FAVOR' && event.status === 'COMPLETED') {
        Alert.alert(
          "Send 'Thank You'",
          `Would you like to send a "Thank You" for this completed favor?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Send", onPress: () => sendThankYouForFavor(event.id) }
          ]
        );
        return;
      }
      
      const positiveReactions = { 'love': '❤️', 'thumbs_up': '👍', 'smile': '😊' };
      const negativeReactions = { 'sad': '😢', 'pray': '🙏', 'why': '🤔' };
      
      setCurrentReactionOptions(event.isNegative ? negativeReactions : positiveReactions);
      setSelectedEventId(event.id);
      setReactionModalVisible(true);
    }
  };

  const sendThankYouForFavor = async (eventId: string) => {
    if (!session) return;
    try {
      const { error } = await supabase.functions.invoke('send-thank-you', {
        body: { original_event_id: eventId, user_id: session.user.id },
      });
      if (error) throw error;
      Alert.alert('Success', 'A thank you has been sent!');
      fetchEvents(true);
    } catch (err) {
      Alert.alert('Error', 'Could not send thank you message.');
    }
  }

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

    let query = supabase.from('events').select('*, reaction').range(from, to);

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
      calculateSummaryData();
    } else {
      setLoadingMore(false);
    }
  };

  const calculateSummaryData = async () => {
    if (!session) return;

    try {
      // Calculate weekly stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const [sentEvents, receivedEvents] = await Promise.all([
        supabase
          .from('events')
          .select('id, created_at')
          .eq('sender_id', session.user.id)
          .eq('event_type', 'APPRECIATION')
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('events')
          .select('id, created_at')
          .eq('receiver_id', session.user.id)
          .eq('event_type', 'APPRECIATION')
          .gte('created_at', weekAgo.toISOString())
      ]);

      const sent = sentEvents.data?.length || 0;
      const received = receivedEvents.data?.length || 0;
      
      // Calculate streak (simplified)
      const { data: recentEvents } = await supabase
        .from('events')
        .select('created_at')
        .eq('sender_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      
      let streak = 0;
      if (recentEvents && recentEvents.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const hasEvent = recentEvents.some(event => {
            const eventDate = new Date(event.created_at);
            return eventDate.toDateString() === checkDate.toDateString();
          });
          
          if (hasEvent) {
            streak++;
          } else if (i > 0) {
            break;
          }
        }
      }
      
      // Calculate balance
      const balance = sent > 0 ? received / sent : received > 0 ? 0 : 0.5;
      let status: 'balanced' | 'giving_more' | 'receiving_more' = 'balanced';
      if (balance < 0.7) status = 'giving_more';
      else if (balance > 1.3) status = 'receiving_more';
      
      // Generate insights
      const insights: string[] = [];
      if (streak >= 7) {
        insights.push(`Amazing! You're on a ${streak}-day streak 🔥`);
      } else if (streak === 0) {
        insights.push("Start your appreciation streak today!");
      }
      
      if (status === 'giving_more') {
        insights.push("You're very generous! Consider asking for some favors too");
      } else if (status === 'receiving_more') {
        insights.push("Your partner is showering you with love! Time to give back?");
      }
      
      if (sent === 0 && received === 0) {
        insights.push("Break the ice with a simple appreciation!");
      }
      
      setSummaryData({
        weeklyStats: { sent, received, streak },
        insights,
        balance: { ratio: balance, status }
      });
    } catch (error) {
      console.error('Error calculating summary:', error);
    }
  };
  
  const handleFavorResponse = async (eventId: string, newStatus: 'ACCEPTED' | 'DECLINED') => {
    if (!session) return;
    const functionName = newStatus === 'ACCEPTED' ? 'accept-favor' : 'decline-favor';

    try {
      const { error } = await supabase.functions.invoke(functionName, {
        body: { event_id: eventId, user_id: session.user.id },
      });

      if (error) throw error;

      Alert.alert('Response Sent', `You have ${newStatus.toLowerCase()} the favor request.`);
      fetchEvents(true);

    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()}ing favor:`, error);
      Alert.alert('Error', `Could not ${newStatus.toLowerCase()} the favor. Please try again.`);
    }
  };

  const handleFavorCompletion = async (eventId: string) => {
    if (!session) return;
    try {
      const { error } = await supabase.functions.invoke('complete-favor', {
        body: { event_id: eventId, user_id: session.user.id },
      });

      if (error) throw error;

      Alert.alert('Favor Completed!', 'You have marked the favor as complete. Points have been awarded!');
      fetchEvents(true);

    } catch (error) {
      console.error('Error completing favor:', error);
      Alert.alert('Error', 'Could not complete the favor.');
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
      {filterOptions.map((option) => {
        const IconComponent = option.icon;
        const isSelected = filter === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.simpleFilterButton,
              isSelected && styles.selectedSimpleFilterButton,
            ]}
            onPress={() => setFilter(option.id as 'all' | 'sent' | 'received')}
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
              {option.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStatusBadge = (status: TimelineEvent['status']) => {
    if (!status) return null;

    let Icon = HelpCircle;
    let text = 'Unknown';
    let color = '#888';
    let backgroundColor = '#F0F0F0';

    switch(status) {
      case 'ACCEPTED':
        Icon = ThumbsUp;
        text = 'Accepted';
        color = '#2E7D32';
        backgroundColor = '#E8F5E9';
        break;
      case 'DECLINED':
        Icon = ThumbsDown;
        text = 'Declined';
        color = '#C62828';
        backgroundColor = '#FFEBEE';
        break;
      case 'COMPLETED':
        Icon = CheckCircle;
        text = 'Favor completed';
        color = '#1565C0';
        backgroundColor = '#E3F2FD';
        break;
      case 'PENDING':
        Icon = Clock;
        text = 'Pending';
        color = '#F57C00';
        backgroundColor = '#FFF3E0';
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Icon color={color} size={14} />
        <Text style={[styles.statusBadgeText, { color }]}>{text}</Text>
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
            <Clock color={Colors.primary} size={28} />
            <Text style={styles.title}>Activity</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
            <HelpCircle color={Colors.textSecondary} size={Layout.iconSize.lg} />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            if (!loadingMore && hasMore && !loading) {
              fetchEvents();
            }
          }
        }}
        scrollEventThrottle={400}
      >
        {!loading && filter === 'all' && (
          <ActivitySummary 
            data={summaryData}
            onInsightPress={(insight) => {
              // Handle insight tap - could navigate or show tips
              console.log('Insight tapped:', insight);
            }}
          />
        )}
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => {
            const { partnerName, badgeName, description, timestamp, icon: Icon, color, type, status, eventType, isEmojiIcon, reaction } = event;
            const isLast = index === filteredEvents.length - 1;
        
            return (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timelineMarker}>
                  <View style={[
                    styles.timelineIcon,
                    { backgroundColor: color },
                    event.isNegative && styles.negativeTimelineIcon
                  ]}>
                    {isEmojiIcon ? (
                      <Text style={styles.emojiIcon}>{Icon}</Text>
                    ) : (
                      <Icon color="white" size={20} />
                    )}
                  </View>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>
                <TouchableOpacity 
                  style={styles.timelineContent}
                  onPress={() => handleCardPress(event)}
                  activeOpacity={event.type === 'received' && !event.reaction ? 0.7 : 1}
                >
                  <View style={[
                    styles.eventCard,
                    event.isNegative && styles.negativeEventCard
                  ]}>
                    <View style={styles.cardContent}>
                      <Text style={styles.eventTypeTag}>{formatEventType(event.eventType)}</Text>
                      <View style={styles.cardHeader}>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.badgeName}
                        </Text>
                      </View>
                      {event.description && (
                        <Text style={styles.eventDescription}>{event.description}</Text>
                      )}
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
                      {event.category.includes('favor') && (
                        <View style={styles.favorStatusContainer}>
                          {renderStatusBadge(event.status)}
                        </View>
                      )}
                      {event.category.includes('favor') && event.status === 'PENDING' && event.type === 'received' && (
                        <View style={styles.actionsContainer}>
                          <>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.acceptButton]}
                              onPress={() => handleFavorResponse(event.id, 'ACCEPTED')}>
                              <ThumbsUp color="white" size={16} />
                              <Text style={styles.actionButtonText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.actionButton, styles.declineButton]}
                              onPress={() => handleFavorResponse(event.id, 'DECLINED')}>
                              <ThumbsDown color="white" size={16} />
                              <Text style={styles.actionButtonText}>Decline</Text>
                            </TouchableOpacity>
                          </>
                        </View>
                      )}
                      {event.category.includes('favor') && event.status === 'ACCEPTED' && event.type === 'sent' && (
                        <View style={styles.actionsContainer}>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={() => handleFavorCompletion(event.id)}>
                            <CheckCircle color="white" size={16} />
                            <Text style={styles.actionButtonText}>Mark as Complete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.cardFooter}>
                      <View style={styles.directionContainer}>
                        {event.type === 'sent'
                          ? <ArrowUpRight color={styles.sentColor.color} size={14} />
                          : <ArrowDownLeft color={styles.receivedColor.color} size={14} />
                        }
                        <Text style={[styles.eventPartner, event.type === 'sent' ? styles.sentColor : styles.receivedColor]}>
                          {event.type === 'sent' ? `${event.partnerName}` : `${event.partnerName}`}
                        </Text>
                      </View>
                      <View style={styles.footerRight}>
                        <Text style={styles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
                        {reaction && <Text style={styles.reactionIcon}>{reactionIcons[reaction]}</Text>}
                        {event.content?.points && (
                          <View style={styles.pointsContainer}>
                            <Text style={styles.pointsText}>{event.content.points} {event.content.points_icon}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
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
        
        {loadingMore && <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />}
      </ScrollView>
      <ReactionModal 
        isVisible={isReactionModalVisible}
        onClose={() => {
          setReactionModalVisible(false);
          fetchEvents(true);
        }}
        eventId={selectedEventId}
        reactionOptions={currentReactionOptions}
      />
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
  simpleFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
  },
  simpleFilterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 52,
    ...Shadows.sm,
  },
  selectedSimpleFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  simpleFilterText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 2,
    marginTop: Spacing.xs,
  },
  selectedSimpleFilterText: {
    color: Colors.white,
  },
  timeline: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  eventCard: {
    ...ComponentStyles.card,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardContent: {
    padding: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.xs,
  },
  eventTypeTag: {

    color: Colors.textSecondary,
    paddingHorizontal: 0,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  eventDescription: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  messageContainer: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8C42',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray200,
    marginHorizontal: 5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  directionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  eventPartner: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 6,
    flexShrink: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsContainer: {
    backgroundColor: Colors.backgroundAlt,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pointsText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  eventTime: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
  },
  eventSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageText: {
    ...ComponentStyles.text.body,
    color: Colors.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  favorStatusContainer: {
    marginTop: 12,
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
  },
  statusBadgeText: {
    marginLeft: 6,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
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
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    ...Shadows.sm,
  },
  actionButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    marginLeft: 6,
  },
  acceptButton: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  declineButton: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  completeButton: {
    backgroundColor: Colors.info,
    borderColor: Colors.info,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    textAlign: 'center',
  },
  sentColor: {
    color: Colors.success,
  },
  receivedColor: {
    color: Colors.primary,
  },
  negativeTimelineIcon: {
    borderWidth: 2,
    borderColor: Colors.error + '40',
  },
  negativeEventCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    backgroundColor: Colors.error + '05',
  },
  cancelledBadgesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  cancelledBadgesText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.error,
    marginLeft: 6,
  },
  negativeMessageContainer: {
    backgroundColor: Colors.error + '10',
    borderLeftColor: Colors.error,
  },
  negativeStatNumber: {
    color: Colors.error,
  },
  emojiIcon: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
  },
  reactionIcon: {
    fontSize: Typography.fontSize.base,
    marginLeft: 8,
  }
});