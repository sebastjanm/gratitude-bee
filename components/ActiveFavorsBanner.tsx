import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ChevronDown, ChevronUp, CheckSquare, Coins, X, Clock } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/utils/design-system';

interface Favor {
  id: string;
  title: string;
  description: string;
  points: number;
  sender_name: string;
  receiver_name?: string;
  created_at: string;
  custom_message?: string;
  type: 'to_do' | 'in_progress';
}

interface ActiveFavorsBannerProps {
  userId: string;
  onFavorComplete?: () => void;
}

export default function ActiveFavorsBanner({ userId, onFavorComplete }: ActiveFavorsBannerProps) {
  const [favorsToDo, setFavorsToDo] = useState<Favor[]>([]);
  const [favorsInProgress, setFavorsInProgress] = useState<Favor[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveFavors();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('active-favors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchActiveFavors();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchActiveFavors = async () => {
    try {
      setLoading(true);
      
      // Fetch favors I need to do (I accepted from partner)
      const { data: toDoData, error: toDoError } = await supabase
        .from('events')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'ACCEPTED')
        .eq('event_type', 'FAVOR_REQUEST')
        .order('created_at', { ascending: false });

      // Fetch favors in progress (partner accepted from me)
      const { data: inProgressData, error: inProgressError } = await supabase
        .from('events')
        .select('*')
        .eq('sender_id', userId)
        .eq('status', 'ACCEPTED')
        .eq('event_type', 'FAVOR_REQUEST')
        .order('created_at', { ascending: false });

      if (toDoError) throw toDoError;
      if (inProgressError) throw inProgressError;

      const formattedToDo = toDoData?.map(event => ({
        id: event.id,
        title: event.content?.title || event.title || 'Favor Request',
        description: event.content?.description || event.description || '',
        points: event.content?.points || event.points || 0,
        sender_name: event.sender_name || 'Your partner',
        receiver_name: event.receiver_name,
        created_at: event.created_at,
        custom_message: event.content?.message || event.custom_message || null,
        type: 'to_do' as const,
      })) || [];

      const formattedInProgress = inProgressData?.map(event => ({
        id: event.id,
        title: event.content?.title || event.title || 'Favor Request',
        description: event.content?.description || event.description || '',
        points: event.content?.points || event.points || 0,
        sender_name: event.sender_name || 'Your partner',
        receiver_name: event.receiver_name,
        created_at: event.created_at,
        custom_message: event.content?.message || event.custom_message || null,
        type: 'in_progress' as const,
      })) || [];

      setFavorsToDo(formattedToDo);
      setFavorsInProgress(formattedInProgress);
    } catch (error) {
      console.error('Error fetching active favors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFavor = async (favorId: string) => {
    Alert.alert(
      'Confirm Completion',
      'Has your partner completed this favor?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Mark Done',
          onPress: async () => {
            try {
              const { data, error } = await supabase.functions.invoke('complete-favor', {
                body: { event_id: favorId, user_id: userId },
              });

              if (error) {
                console.error('Error details:', error);
                throw error;
              }

              Alert.alert('Success', 'Favor marked as completed!');
              fetchActiveFavors();
              onFavorComplete?.();
            } catch (error: any) {
              console.error('Error completing favor:', error);
              const errorMessage = error?.message || 'Could not complete favor. Please try again.';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (loading) {
    return null;
  }

  const totalFavors = favorsToDo.length + favorsInProgress.length;
  
  if (totalFavors === 0) {
    return null;
  }

  const bannerColor = totalFavors >= 3 ? '#FED7AA' : '#FEF3C7'; // orange-200 : yellow-100

  return (
    <View style={[styles.container, { backgroundColor: bannerColor }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <CheckSquare color={Colors.warning} size={20} />
        <Text style={styles.headerText}>
          Favours open: {favorsToDo.length} / Favours asked: {favorsInProgress.length}
        </Text>
        {isExpanded ? (
          <ChevronUp color={Colors.textSecondary} size={20} />
        ) : (
          <ChevronDown color={Colors.textSecondary} size={20} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>

        {favorsToDo.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>You need to do:</Text>
            {favorsToDo.map((favor) => (
              <View key={favor.id} style={styles.favorCard}>
                <View style={styles.favorContent}>
                  <Text style={styles.favorTitle} numberOfLines={2}>
                    {favor.title}
                  </Text>
                  {favor.description && (
                    <Text style={styles.favorDescription} numberOfLines={2}>
                      {favor.description}
                    </Text>
                  )}
                  {favor.custom_message && (
                    <Text style={styles.favorMessage} numberOfLines={2}>
                      "{favor.custom_message}"
                    </Text>
                  )}
                  <View style={styles.favorFooter}>
                    <View style={styles.favorTime}>
                      <Clock color={Colors.textTertiary} size={12} />
                      <Text style={styles.favorTimeText}>{getTimeAgo(favor.created_at)}</Text>
                    </View>
                    <Text style={styles.favorSeparator}>|</Text>
                    <View style={styles.favorPoints}>
                      <Coins color={Colors.warning} size={14} />
                      <Text style={styles.favorPointsText}>{favor.points} points</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.openLabel}>
                  <Text style={styles.openLabelText}>Open</Text>
                </View>
              </View>
            ))}
          </>
        )}
        
        {favorsInProgress.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Your partner is doing:</Text>
            {favorsInProgress.map((favor) => (
              <View key={favor.id} style={styles.favorCard}>
                <View style={styles.favorContent}>
                  <Text style={styles.favorTitle} numberOfLines={2}>
                    {favor.title}
                  </Text>
                  {favor.description && (
                    <Text style={styles.favorDescription} numberOfLines={2}>
                      {favor.description}
                    </Text>
                  )}
                  {favor.custom_message && (
                    <Text style={styles.favorMessage} numberOfLines={2}>
                      "{favor.custom_message}"
                    </Text>
                  )}
                  <View style={styles.favorFooter}>
                    <View style={styles.favorTime}>
                      <Clock color={Colors.textTertiary} size={12} />
                      <Text style={styles.favorTimeText}>{getTimeAgo(favor.created_at)}</Text>
                    </View>
                    <Text style={styles.favorSeparator}>|</Text>
                    <View style={styles.favorPoints}>
                      <Coins color={Colors.warning} size={14} />
                      <Text style={styles.favorPointsText}>{favor.points} points</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteFavor(favor.id)}
                >
                  <CheckSquare color={Colors.white} size={14} />
                  <Text style={styles.completeButtonText}>Mark Done</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.warning + '30',
    ...Shadows.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  expandedContent: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  favorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  favorContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  favorTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.tight,
  },
  favorDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: Typography.lineHeight.tight,
  },
  favorMessage: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.tight,
  },
  favorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 6,
  },
  favorMeta: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
  },
  favorPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favorPointsText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.warning,
    marginLeft: Spacing.xs,
  },
  favorTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  favorTimeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
  },
  favorSeparator: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textTertiary,
    marginHorizontal: 2,
  },
  completeButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    minHeight: 44,  // Apple HIG minimum touch target
    minWidth: 44,   // Apple HIG minimum touch target
    justifyContent: 'center',
    ...Shadows.sm,
  },
  completeButtonText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  openLabel: {
    backgroundColor: Colors.info + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  openLabelText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.info,
  },
});