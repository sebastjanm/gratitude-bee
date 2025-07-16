// This file displays the chat interface for a selected conversation.
// It fetches messages and participant data from Supabase and uses GiftedChat for the UI.

import React, { useState, useEffect, useCallback } from 'react';
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
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { ChevronLeft, HelpCircle as HelpCircleIcon } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

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

// Custom Header Component, now with avatar_url
const CustomHeader = ({ participant }: { participant: ChatUser }) => {
  const [lastSeenText, setLastSeenText] = useState('offline');

  useEffect(() => {
    const updateLastSeen = () => {
      if (participant.last_seen) {
        const lastSeenDate = new Date(participant.last_seen);
        setLastSeenText(`last seen ${formatDistanceToNow(lastSeenDate)} ago`);
      } else {
        setLastSeenText('offline');
      }
    };

    updateLastSeen();
    const intervalId = setInterval(updateLastSeen, 60000);
    return () => clearInterval(intervalId);
  }, [participant.last_seen]);

  return (
    <View style={styles.headerContainer}>
      <Image
        source={participant.avatar_url ? { uri: participant.avatar_url } : require('@/assets/images/icon.png')}
        style={styles.headerAvatar}
      />
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerName}>{participant.display_name || 'Participant'}</Text>
        <Text style={styles.headerLastSeen}>{lastSeenText}</Text>
      </View>
    </View>
  );
};

// Main Chat Header Component
const ChatHeader = ({ participant, onBack }: { participant: ChatUser; onBack: () => void }) => {
  return (
    <View style={styles.fixedHeaderContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
            <ChevronLeft color="#333" size={30} />
          </TouchableOpacity>
          <CustomHeader participant={participant} />
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/help')}>
          <HelpCircleIcon color="#666" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ChatScreen = () => {
  const { conversation_id } = useLocalSearchParams() as { conversation_id: string };
  const { session } = useSession();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [participant, setParticipant] = useState<ChatUser | null>(null);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Stub

  const fetchParticipantAndMessages = useCallback(async () => {
    if (!conversation_id || !session?.user?.id) return;
    setLoading(true);

    try {
      // 1. Fetch my own avatar
      const { data: myUserData, error: myUserError } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single();
      if (myUserError) throw myUserError;
      setMyAvatar(myUserData.avatar_url);

      // 2. Fetch the participant's ID from the conversation_participants table
      const { data: participantLink, error: participantLinkError } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation_id)
        .neq('user_id', session.user.id)
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
      setParticipant(participantData);

      // 4. Now that we have the participant, fetch the initial batch of messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, text, created_at, sender_id, uri')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (messagesError) throw messagesError;
      if (messagesData.length < PAGE_SIZE) setAllMessagesLoaded(true);

      const formattedMessages = formatMessagesForGiftedChat(messagesData, session.user.id, myUserData.avatar_url, participantData);
      setMessages(formattedMessages);

    } catch (error) {
      console.error('Failed to fetch chat data:', error);
      Alert.alert('Error', 'Could not load chat. Please go back and try again.');
    } finally {
      setLoading(false);
    }
  }, [conversation_id, session?.user?.id]);

  const fetchMoreMessages = useCallback(async () => {
    if (loadingMore || allMessagesLoaded || !session?.user?.id) return;
    setLoadingMore(true);

    try {
      const from = messages.length;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('messages')
        .select('id, text, created_at, sender_id, uri')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      if (data.length < PAGE_SIZE) setAllMessagesLoaded(true);

      const formattedMessages = formatMessagesForGiftedChat(data, session.user.id, myAvatar, participant);
      setMessages(prev => GiftedChat.append(prev, formattedMessages));

    } catch (error) {
      console.error('Error fetching more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, allMessagesLoaded, messages.length, session?.user?.id, myAvatar, participant]);

  useEffect(() => {
    fetchParticipantAndMessages();
  }, [fetchParticipantAndMessages]);

  useEffect(() => {
    // Ensure we have the necessary data before subscribing
    if (!conversation_id || !session?.user?.id || !participant || !myAvatar) {
      return;
    }

    const channel = supabase
      .channel(`realtime-chat:${conversation_id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversation_id}` },
        payload => {
          const newMessage = payload.new as ChatMessage;
          // Ensure we don't append our own messages twice
          if (newMessage.sender_id !== session.user.id) {
            const formattedMessage = formatMessagesForGiftedChat([newMessage], session!.user.id, myAvatar, participant);
            setMessages(previousMessages => GiftedChat.append(previousMessages, formattedMessage));
          }
        }
      )
      .subscribe();

    // Cleanup function to remove the channel subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id, session?.user?.id, participant, myAvatar]); // Correct dependency array

  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const textToSend = newMessages[0].text;
      const messageToAppend = newMessages[0];
      
      // Optimistically update the UI
      setMessages(previousMessages => GiftedChat.append(previousMessages, [messageToAppend]));

      // Asynchronously send to the backend
      supabase.from('messages').insert([
        { conversation_id, sender_id: session!.user.id, text: textToSend },
      ]).then(({ error }) => {
        if (error) {
          console.error('Error sending message:', error);
          Alert.alert('Error', 'Message failed to send.');
          // Optional: implement logic to mark the message as failed in the UI
        }
      });
    },
    [conversation_id, session]
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/messages');
  };

  if (loading || !participant) {
    return <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#FF8C42" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatHeader participant={participant} onBack={handleBack} />
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: session!.user.id }}
        loadEarlier={!allMessagesLoaded}
        onLoadEarlier={fetchMoreMessages}
        isLoadingEarlier={loadingMore}
        renderAvatarOnTop
        alwaysShowSend
        isTyping={isTyping} // Stub
      />
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
    paddingBottom: 10,
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    paddingRight: 10,
  },
  headerButton: {
    padding: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  headerLastSeen: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
});