// This file has been refactored to use TanStack Query's `useInfiniteQuery` for robust, cursor-based pagination.
// This approach simplifies state management, improves caching, and aligns with modern data-fetching best practices.

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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { ChevronLeft, HelpCircle as HelpCircleIcon } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 20;

// Matches the public.users table structure
interface ChatUser {
  id: string;
  display_name: string | null;
  last_seen: string | null;
  avatar_url: string | null;
}

// Matches the structure of a message from the DB
interface ChatMessage {
  id: string;
  text: string;
  created_at: string;
  sender_id: string;
  uri: string | null; // For images or other media
}

// Helper to format our messages for GiftedChat
const formatMessagesForGiftedChat = (
  messages: ChatMessage[],
  myUserId: string,
  myAvatarUrl: string | null,
  participant: ChatUser | null
): IMessage[] => {
  return messages.map(message => {
    const isMyMessage = message.sender_id === myUserId;
    const user = isMyMessage
      ? { _id: myUserId, name: 'Me', avatar: myAvatarUrl || undefined }
      : {
          _id: participant?.id || '',
          name: participant?.display_name || 'Participant',
          avatar: participant?.avatar_url || undefined,
        };

    return {
      _id: message.id,
      text: message.text,
      createdAt: new Date(message.created_at),
      user: user,
      image: message.uri || undefined, // Map uri to the image prop
    };
  });
};

// Custom Header Component for the title part
const HeaderTitle = ({ participant }: { participant: ChatUser | null }) => {
  if (!participant) {
    return <Text style={styles.title}>Loading...</Text>;
  }

  return (
    <View style={styles.headerTitleContainer}>
      <Image
        source={participant.avatar_url ? { uri: participant.avatar_url } : require('@/assets/images/icon.png')}
        style={styles.headerAvatar}
      />
      <Text style={styles.title}>{participant.display_name || 'Participant'}</Text>
    </View>
  );
};

// Main Chat Header Component - styled to match profile.tsx
const ChatHeader = ({ participant, router }: { participant: ChatUser | null; router: any }) => {
  const [lastSeenText, setLastSeenText] = useState('offline');

  useEffect(() => {
    const updateLastSeen = () => {
      if (participant?.last_seen) {
        const lastSeenDate = new Date(participant.last_seen);
        setLastSeenText(`last seen ${formatDistanceToNow(lastSeenDate)} ago`);
      } else {
        setLastSeenText('offline');
      }
    };

    updateLastSeen();
    const intervalId = setInterval(updateLastSeen, 60000); // update every minute
    return () => clearInterval(intervalId);
  }, [participant?.last_seen]);
  
  return (
    <View style={styles.fixedHeaderContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <ChevronLeft color="#333" size={30} />
          </TouchableOpacity>
          <HeaderTitle participant={participant} />
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
          <HelpCircleIcon color="#666" size={24} />
        </TouchableOpacity>
      </View>
      {participant && <Text style={styles.subtitle}>{lastSeenText}</Text>}
    </View>
  );
};

const fetchChatData = async (conversation_id: string, myUserId: string) => {
    // 1. Fetch my own avatar
    const { data: myUserData, error: myUserError } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', myUserId)
      .single();
    if (myUserError) throw myUserError;

    // 2. Fetch the participant's ID from the conversation_participants table
    const { data: participantLink, error: participantLinkError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversation_id)
      .neq('user_id', myUserId)
      .single();
    
    if (participantLinkError) throw new Error('Could not find chat participant.');
    const participantId = participantLink.user_id;

    // 3. Fetch the participant's data from the users table
    const { data: participantData, error: participantError } = await supabase
      .from('users')
      .select('id, display_name, last_seen, avatar_url')
      .eq('id', participantId)
      .single();
    
    if (participantError) throw participantError;

    // 4. Fetch the initial batch of messages
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('id, text, created_at, sender_id, uri')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (messagesError) throw messagesError;

    return {
      myAvatar: myUserData.avatar_url,
      participant: participantData,
      initialMessages: messagesData,
    };
};


const ChatScreen = () => {
  const { conversation_id } = useLocalSearchParams() as { conversation_id: string };
  const { session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for optimistic updates and participant info
  const [participant, setParticipant] = useState<ChatUser | null>(null);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);

  // Fetch participant data separately, as it doesn't need to be part of the infinite query
  useEffect(() => {
    const fetchParticipantInfo = async () => {
      if (!conversation_id || !session?.user?.id) return;
      try {
        const { data: myUserData } = await supabase.from('users').select('avatar_url').eq('id', session.user.id).single();
        setMyAvatar(myUserData?.avatar_url || null);
        
        const { data: pLink } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', conversation_id).neq('user_id', session.user.id).single();
        if (!pLink) throw new Error('Participant not found.');

        const { data: pData } = await supabase.from('users').select('id, display_name, last_seen, avatar_url').eq('id', pLink.user_id).single();
        setParticipant(pData);

      } catch (error) {
        console.error("Failed to fetch participant info:", error);
        Alert.alert('Error', 'Could not load chat participant details.');
      }
    };
    fetchParticipantInfo();
  }, [conversation_id, session?.user?.id]);


  const fetchMessages = async ({ pageParam }: { pageParam?: string }) => {
    const query = supabase
      .from('messages')
      .select('id, text, created_at, sender_id, uri')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: false });

    // If we have a pageParam (cursor), use it to fetch older messages
    if (pageParam) {
      query.lt('created_at', pageParam);
    }
    
    const { data, error } = await query.limit(PAGE_SIZE);

    if (error) throw error;
    return data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending, // Use isPending instead of status
  } = useInfiniteQuery({
    queryKey: ['messages', conversation_id],
    queryFn: fetchMessages,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // If the last page had fewer messages than PAGE_SIZE, we've reached the end
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Otherwise, use the oldest message's created_at as the cursor for the next page
      return lastPage[lastPage.length - 1].created_at;
    },
    // Keep data fresh for a short time, but prioritize refetching on window focus
    staleTime: 1000 * 60, // 1 minute
  });

  // Use useMemo to flatten the pages into a single array of messages
  const messages = useMemo(() => {
    if (!data?.pages) return [];
    const allMessages = data.pages.flat();
    return formatMessagesForGiftedChat(allMessages, session!.user.id, myAvatar, participant);
  }, [data, session?.user?.id, myAvatar, participant]);


  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversation_id) return;

    const channel = supabase.channel(`realtime-chat:${conversation_id}`);

    const subscription = channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation_id}` },
        (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Manually update the cache to avoid a full refetch
          queryClient.setQueryData(['messages', conversation_id], (oldData: any) => {
            if (!oldData) return oldData;
            
            // Create a new pages array with the new message added to the first page
            const newPages = [...oldData.pages];
            newPages[0] = [newMessage, ...newPages[0]];

            return {
              ...oldData,
              pages: newPages,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id, queryClient]);


  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const textToSend = newMessages[0].text;
      
      // No optimistic update needed with react-query's speed, but we could add it.
      // For simplicity, we just insert and let the subscription handle the update.
      supabase.from('messages').insert([
        { conversation_id, sender_id: session!.user.id, text: textToSend },
      ]).then(({ error }) => {
        if (error) {
          console.error('Error sending message:', error);
          Alert.alert('Error', 'Message failed to send.');
        }
      });
    },
    [conversation_id, session]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader participant={participant} router={router} />
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: session!.user.id }}
        loadEarlier={hasNextPage}
        onLoadEarlier={fetchNextPage}
        isLoadingEarlier={isFetchingNextPage}
        alwaysShowSend
        keyboardShouldPersistTaps="handled"
        minInputToolbarHeight={44} // Add this prop
      />
      {isPending && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  fixedHeaderContainer: {
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? 15 : 0, // Adjusted for SafeAreaView
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    marginRight: 10,
    padding: 5,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  headerButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginLeft: 45, // Align with title
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 240, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});