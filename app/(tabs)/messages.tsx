import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { ChevronLeft, HelpCircle as HelpCircleIcon } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
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
        avatar: isMine ? myAvatarUrl : participant?.avatar_url,
      },
      image: message.uri,
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
          .rpc<string>('get_or_create_conversation', {
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
  } = useInfiniteQuery({
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
    initialPageParam: undefined,
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
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
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  const allMessages = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [data]);

  const formattedMessages = useMemo(() => {
    if (!myUserId) return [];
    return formatMessagesForGiftedChat(allMessages, myUserId, myAvatarUrl, participant);
  }, [allMessages, myUserId, myAvatarUrl, participant]);

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    if (!conversationId || !myUserId || messages.length === 0) return;

    setIsSending(true);
    try {
      const message = messages[0];
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: myUserId,
        text: message.text,
        uri: message.image || null,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [conversationId, myUserId]);

  const onLoadEarlier = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoadingConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C42" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conversationId || !participant) {
    return (
      <SafeAreaView style={styles.container}>
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
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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
        scrollToBottom
        renderUsernameOnMessage={false}
        messagesContainerStyle={styles.messagesContainer}
      />

      {isSending && (
        <View style={styles.sendingOverlay}>
          <ActivityIndicator size="small" color="#FF8C42" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
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