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
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { ChevronLeft, HelpCircle as HelpCircleIcon } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { GiftedChat, IMessage, Day, LoadEarlier } from 'react-native-gifted-chat';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

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
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingStatusRef = useRef(false);
  const typingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const myUserId = session?.user?.id;
  const myAvatarUrl = session?.user?.user_metadata?.avatar_url || null;

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

  // Subscribe to new messages and typing events
  useEffect(() => {
    if (!conversationId || !myUserId) return;

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
      .subscribe();

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

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
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
  }, [conversationId, myUserId, queryClient]);

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
            <ActivityIndicator size="large" color="#FF8C42" />
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
          <ChevronLeft color="#666" size={24} />
        </TouchableOpacity>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            {participant.avatar_url ? (
              <Image source={{ uri: participant.avatar_url }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {participant.display_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.title}>{participant.display_name || 'Partner'}</Text>
              {participant.last_seen && (
                <Text style={styles.lastSeen}>
                  Last seen {formatDistanceToNow(new Date(participant.last_seen), { addSuffix: true })}
                </Text>
              )}
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
          <HelpCircleIcon color="#666" size={24} />
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={formattedMessages}
        onSend={onSend}
        user={{ _id: myUserId || '' }}
        renderLoading={() => <ActivityIndicator size="large" color="#FF8C42" />}
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
          style: { paddingTop: 10 },
          showsVerticalScrollIndicator: false,
        }}
        renderDay={(props) => (
          <Day
            {...props}
            textStyle={{
              color: '#999',
              fontSize: 12,
              fontFamily: 'Inter-Medium',
              marginTop: 10,
              marginBottom: 10,
            }}
            containerStyle={{
              marginVertical: 10,
            }}
          />
        )}
        renderLoadEarlier={(props) => (
          <View style={{
            alignItems: 'center',
            marginVertical: 20,
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#FFE0B2',
                shadowColor: '#FF8C42',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={props.onLoadEarlier}
              disabled={props.isLoadingEarlier}>
              {props.isLoadingEarlier ? (
                <ActivityIndicator size="small" color="#FF8C42" />
              ) : (
                <Text style={{
                  color: '#FF8C42',
                  fontSize: 14,
                  fontFamily: 'Inter-Medium',
                }}>
                  Load earlier messages
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        renderTime={(props) => (
          <View style={{ 
            marginLeft: 10, 
            marginRight: 10,
            marginBottom: 5,
          }}>
            <Text style={{
              fontSize: 11,
              color: '#999',
              fontFamily: 'Inter-Regular',
            }}>
              {props.currentMessage?.createdAt && 
                new Date(props.currentMessage.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })
              }
            </Text>
          </View>
        )}
      />

      {isSending && (
        <View style={styles.sendingOverlay}>
          <ActivityIndicator size="small" color="#FF8C42" />
        </View>
      )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
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
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  connectButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  connectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
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
    borderRadius: 20,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF8C42',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  lastSeen: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  sendingOverlay: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});