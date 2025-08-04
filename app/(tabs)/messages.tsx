import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { ChevronLeft, HelpCircle as HelpCircleIcon } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { GiftedChat, IMessage, Day, LoadEarlier } from 'react-native-gifted-chat';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles, A11y } from '@/utils/design-system';

const PAGE_SIZE = 20;

interface ChatUser {
  id: string;
  display_name: string | null;
  last_seen: string | null;
  avatar_url: string | null;
}

interface ChatMessage {
  id: string;
  text: string;
  created_at: string;
  sender_id: string;
  uri: string | null;
  conversation_id?: string;
}

const formatMessagesForGiftedChat = (
  messages: ChatMessage[],
  myUserId: string,
  myAvatarUrl: string | null,
  participant: ChatUser | null
): IMessage[] => {
  return messages.map(message => {
    const isMine = message.sender_id === myUserId;
    return {
      _id: message.id,
      text: message.text,
      createdAt: new Date(message.created_at),
      user: {
        _id: isMine ? myUserId : message.sender_id,
        name: isMine ? 'You' : participant?.display_name || 'Partner',
        avatar: isMine ? (myAvatarUrl || undefined) : (participant?.avatar_url || undefined),
      },
      image: message.uri || undefined,
    };
  });
};

export default function MessagesScreen() {
  const router = useRouter();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [participant, setParticipant] = useState<ChatUser | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingStatusRef = useRef(false);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  const myUserId = session?.user?.id;
  const myAvatarUrl = session?.user?.user_metadata?.avatar_url || null;

  // Update last_seen when user opens chat
  useEffect(() => {
    const updateLastSeen = async () => {
      if (!myUserId) return;
      
      await supabase
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', myUserId);
    };

    updateLastSeen();
    
    // Update every 30 seconds while chat is open
    const interval = setInterval(updateLastSeen, 30000);
    
    return () => clearInterval(interval);
  }, [myUserId]);

  // Initialize or find conversation
  useEffect(() => {
    const initializeConversation = async () => {
      if (!session?.user?.id) return;

      try {
        setIsLoadingConversation(true);
        
        // First, get the partner ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('partner_id')
          .eq('id', session.user.id)
          .single();

        if (userError || !userData?.partner_id) {
          console.log('No partner found');
          setIsLoadingConversation(false);
          return;
        }

        // Get or create conversation
        const { data: convId, error: rpcError } = await supabase
          .rpc('get_or_create_conversation', {
            user_one_id: session.user.id,
            user_two_id: userData.partner_id,
          });

        if (rpcError || !convId) {
          console.error('Error getting conversation:', rpcError);
          Alert.alert('Error', 'Could not load conversation');
          setIsLoadingConversation(false);
          return;
        }

        setConversationId(convId);

        // Get partner details
        const { data: partnerData } = await supabase
          .from('users')
          .select('id, display_name, last_seen, avatar_url')
          .eq('id', userData.partner_id)
          .single();

        if (partnerData) {
          setParticipant(partnerData);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        Alert.alert('Error', 'Could not load conversation');
      } finally {
        setIsLoadingConversation(false);
      }
    };

    initializeConversation();
  }, [session?.user?.id]);

  // Query for messages with pagination
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useInfiniteQuery<ChatMessage[], Error>({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      if (!conversationId) throw new Error('No conversation ID');

      const query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (pageParam) {
        query.lt('created_at', pageParam);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ChatMessage[];
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return lastPage[lastPage.length - 1].created_at;
    },
    enabled: !!conversationId,
    initialPageParam: undefined as string | undefined,
  });

  // Subscribe to participant updates (for last_seen)
  useEffect(() => {
    if (!participant) return;

    const userChannel = supabase
      .channel(`user:${participant.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${participant.id}`,
        },
        (payload) => {
          // Update participant data with new last_seen
          if (payload.new && payload.new.last_seen) {
            setParticipant(prev => prev ? { ...prev, last_seen: payload.new.last_seen as string } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [participant]);

  // Subscribe to new messages, typing, and presence
  useEffect(() => {
    if (!conversationId || !myUserId || !participant) return;

    setConnectionStatus('connecting');

    // Messages channel for new messages
    const messageChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Only add if it's not from the current user (to avoid duplicates)
          if (newMessage.sender_id !== myUserId) {
            queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
              if (!oldData || !oldData.pages) return oldData;
              
              // Add to the first page (newest messages)
              const newPages = [...oldData.pages];
              newPages[0] = [newMessage, ...newPages[0]];
              
              return {
                ...oldData,
                pages: newPages,
              };
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    // Typing channel for typing indicators
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'broadcast',
        { event: 'typing' },
        ({ payload }) => {
          if (payload.user_id !== myUserId) {
            setIsPartnerTyping(payload.is_typing);
            
            // Clear existing timeout
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            
            // Auto-hide typing indicator after 3 seconds
            if (payload.is_typing) {
              typingTimeoutRef.current = setTimeout(() => {
                setIsPartnerTyping(false);
              }, 3000) as unknown as NodeJS.Timeout;
            }
          }
        }
      )
      .subscribe();

    // Presence channel for online/offline status
    const presenceChannel = supabase
      .channel(`presence:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        // Check if partner is online
        const partnerPresence = Object.values(state).find(
          (presence: any) => presence[0]?.user_id === participant.id
        );
        setIsPartnerOnline(!!partnerPresence);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Check if the joining user is our partner
        if (newPresences[0]?.user_id === participant.id) {
          setIsPartnerOnline(true);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Check if the leaving user is our partner
        if (leftPresences[0]?.user_id === participant.id) {
          setIsPartnerOnline(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track our own presence
          await presenceChannel.track({
            user_id: myUserId,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
      supabase.removeChannel(presenceChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
      // Send typing false on unmount
      if (lastTypingStatusRef.current && conversationId && myUserId) {
        const typingChannel = supabase.channel(`typing:${conversationId}`);
        typingChannel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: myUserId,
            is_typing: false,
            timestamp: new Date().toISOString(),
          },
        });
      }
    };
  }, [conversationId, myUserId, participant, queryClient]);

  // Pulse animation for connection status
  useEffect(() => {
    if (connectionStatus === 'disconnected') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [connectionStatus, pulseAnim]);

  // Auto-reconnect when disconnected
  useEffect(() => {
    if (connectionStatus === 'disconnected' && conversationId) {
      const reconnectTimer = setTimeout(() => {
        // Force a refetch which will re-establish connection
        refetch();
      }, 5000); // Try to reconnect after 5 seconds

      return () => clearTimeout(reconnectTimer);
    }
  }, [connectionStatus, conversationId, refetch]);

  const allMessages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [data]);

  // Debug info
  useEffect(() => {
    if (__DEV__) {
      console.log('Messages pagination:', {
        totalMessages: allMessages.length,
        hasNextPage,
        pageSize: PAGE_SIZE,
      });
    }
  }, [allMessages.length, hasNextPage]);

  const formattedMessages = useMemo(() => {
    if (!myUserId || !allMessages) return [];
    return formatMessagesForGiftedChat(allMessages, myUserId, myAvatarUrl, participant);
  }, [allMessages, myUserId, myAvatarUrl, participant]);

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    if (!conversationId || !myUserId || messages.length === 0) return;

    const message = messages[0];
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - add message immediately
    const optimisticMessage: ChatMessage = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: myUserId,
      text: message.text,
      created_at: new Date().toISOString(),
      uri: message.image || null,
    };
    
    queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
      if (!oldData || !oldData.pages) return oldData;
      const newPages = [...oldData.pages];
      newPages[0] = [optimisticMessage, ...newPages[0]];
      return { ...oldData, pages: newPages };
    });

    setIsSending(true);
    try {
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: myUserId,
        text: message.text,
        uri: message.image || null,
      }).select().single();

      if (error) throw error;

      // Replace temp message with real one
      queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = oldData.pages.map((page: ChatMessage[]) =>
          page.map(msg => msg.id === tempId ? data : msg)
        );
        return { ...oldData, pages: newPages };
      });
    } catch (error) {
      // Remove optimistic message on error
      queryClient.setQueryData(['messages', conversationId], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = oldData.pages.map((page: ChatMessage[]) =>
          page.filter(msg => msg.id !== tempId)
        );
        return { ...oldData, pages: newPages };
      });
      
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [conversationId, myUserId, queryClient]);

  const onLoadEarlier = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Send typing status with debouncing
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!conversationId || !myUserId) return;
    
    // Only send if status actually changed
    if (lastTypingStatusRef.current === isTyping) return;
    lastTypingStatusRef.current = isTyping;

    const typingChannel = supabase.channel(`typing:${conversationId}`);
    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: myUserId,
        is_typing: isTyping,
        timestamp: new Date().toISOString(),
      },
    });
  }, [conversationId, myUserId]);

  // Debounced typing handler
  const handleTyping = useCallback((text: string) => {
    // Clear existing timeout
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    if (text.length > 0) {
      // Send typing true immediately if not already typing
      if (!lastTypingStatusRef.current) {
        sendTypingStatus(true);
      }
      
      // Set timeout to stop typing after 2 seconds of inactivity
      typingDebounceRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 2000) as unknown as NodeJS.Timeout;
    } else {
      // Send typing false immediately when text is cleared
      sendTypingStatus(false);
    }
  }, [sendTypingStatus]);

  if (isLoadingConversation) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading conversation...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!conversationId || !participant) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Partner Connected</Text>
            <Text style={styles.emptySubtitle}>
              Connect with your partner to start chatting
            </Text>
            <TouchableOpacity 
              style={styles.connectButton}
              onPress={() => router.push('/(modals)/connect-partner')}>
              <Text style={styles.connectButtonText}>Connect Partner</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            Keyboard.dismiss();
            router.push('/(tabs)');
          }}>
          <ChevronLeft color={Colors.textSecondary} size={Layout.iconSize.lg} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <View>
              {participant.avatar_url ? (
                <Image source={{ uri: participant.avatar_url }} style={styles.headerAvatar} />
              ) : (
                <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {participant.display_name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              {isPartnerOnline && <View style={styles.onlineDot} />}
            </View>
            <View>
              <Text style={styles.title}>{participant.display_name || 'Partner'}</Text>
              <Text style={[styles.lastSeen, isPartnerOnline && styles.onlineStatus]}>
                {isPartnerOnline 
                  ? 'Online' 
                  : participant.last_seen 
                    ? `Last seen ${formatDistanceToNow(new Date(participant.last_seen), { addSuffix: true })}`
                    : 'Offline'
                }
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
          <HelpCircleIcon color={Colors.textSecondary} size={Layout.iconSize.lg} />
        </TouchableOpacity>
      </View>

      {connectionStatus === 'disconnected' && (
        <View style={styles.connectionBanner}>
          <Animated.View style={[styles.connectionDot, { opacity: pulseAnim }]} />
          <Text style={styles.connectionText}>Connecting...</Text>
        </View>
      )}


      <GiftedChat
        messages={formattedMessages}
        onSend={onSend}
        user={{ _id: myUserId || '' }}
        renderLoading={() => <ActivityIndicator size="large" color={Colors.primary} />}
        loadEarlier={hasNextPage}
        onLoadEarlier={onLoadEarlier}
        isLoadingEarlier={isFetchingNextPage}
        alwaysShowSend
        renderUsernameOnMessage={false}
        messagesContainerStyle={styles.messagesContainer}
        bottomOffset={0}
        minInputToolbarHeight={56}
        keyboardShouldPersistTaps="handled"
        isKeyboardInternallyHandled={false}
        isTyping={isPartnerTyping}
        onInputTextChanged={handleTyping}
        listViewProps={{
          scrollEventThrottle: 16,
        } as any}
        textInputProps={{
          placeholderTextColor: Colors.textTertiary,
          placeholder: 'Type a message...',
        }}
        minComposerHeight={40}
        maxComposerHeight={120}
        renderBubble={(props) => {
          const { currentMessage, position } = props;
          const isLeft = position === 'left';
          return (
            <View style={{
              alignSelf: isLeft ? 'flex-start' : 'flex-end',
              marginVertical: 2,
              marginHorizontal: 8,
              maxWidth: '80%',
            }}>
              <View style={{
                backgroundColor: isLeft ? Colors.white : '#DCF8C6',
                borderRadius: 8,
                paddingTop: 8,
                paddingBottom: 4,
                paddingLeft: 12,
                paddingRight: 12,
                ...Shadows.sm,
                alignSelf: isLeft ? 'flex-start' : 'flex-end',
              }}>
                <Text style={{
                  fontSize: 16,
                  fontFamily: Typography.fontFamily.regular,
                  color: Colors.textPrimary,
                  lineHeight: 22,
                }}>
                  {currentMessage?.text}
                </Text>
                <Text style={{
                  fontSize: 11,
                  color: Colors.textTertiary,
                  marginTop: 2,
                  alignSelf: 'flex-end',
                }}>
                  {currentMessage?.createdAt && 
                    new Date(currentMessage.createdAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: false,
                    })
                  }
                </Text>
              </View>
            </View>
          );
        }}
        renderSend={(props) => (
          <TouchableOpacity
            onPress={() => {
              if (props.onSend && props.text?.trim()) {
                props.onSend({ text: props.text.trim() }, true);
              }
            }}
            style={{
              height: 44,
              width: 44,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 4,
              marginRight: 4,
              marginBottom: 0,
            }}
            disabled={!props.text?.trim()}
          >
            <View style={{
              width: 32,
              height: 32,
              borderRadius: BorderRadius.full,
              backgroundColor: props.text?.trim() ? Colors.textPrimary : Colors.gray300,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                color: Colors.white,
                fontSize: 18,
                fontFamily: Typography.fontFamily.medium,
                transform: [{ rotate: '90deg' }],
              }}>‹</Text>
            </View>
          </TouchableOpacity>
        )}
        renderDay={() => null}
        renderLoadEarlier={(props) => {
          // Auto-load when this component becomes visible
          if (hasNextPage && !props.isLoadingEarlier) {
            // Trigger load earlier automatically
            setTimeout(() => {
              props.onLoadEarlier?.();
            }, 100);
          }
          
          return props.isLoadingEarlier ? (
            <View style={{
              alignItems: 'center',
              paddingVertical: 20,
            }}>
              <ActivityIndicator size="small" color={Colors.textTertiary} />
            </View>
          ) : null;
        }}
        renderTime={() => null}
      />

      {isSending && (
        <View style={styles.sendingOverlay}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: {
    ...ComponentStyles.text.h2,
    marginBottom: Spacing.md,
  },
  emptySubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  connectButton: {
    ...ComponentStyles.button.primary,
    paddingHorizontal: Spacing.xl,
  },
  connectButtonText: {
    ...ComponentStyles.button.text.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
    marginRight: Spacing.sm,
    minWidth: A11y.minTouchTarget,
    minHeight: A11y.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  headerAvatarPlaceholder: {
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  title: {
    ...ComponentStyles.text.h3,
  },
  lastSeen: {
    ...ComponentStyles.text.caption,
    marginTop: 2,
  },
  onlineStatus: {
    color: Colors.success,
    fontFamily: Typography.fontFamily.medium,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  headerButton: {
    padding: Spacing.sm,
    minWidth: A11y.minTouchTarget,
    minHeight: A11y.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    backgroundColor: '#E5DDD5',
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  sendingOverlay: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.lg,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
    ...Shadows.sm,
  },
  connectionBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.warning + '10', // 10% opacity
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '20', // 20% opacity
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.warning,
    marginRight: Spacing.sm,
  },
  connectionText: {
    ...ComponentStyles.text.caption,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.warning,
  },
});