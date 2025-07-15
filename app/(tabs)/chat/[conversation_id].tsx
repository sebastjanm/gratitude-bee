// This file displays the chat interface for a selected conversation.
// All features like date separators and avatars are implemented.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { Send, ChevronLeft, HelpCircle as HelpCircleIcon } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';

const PAGE_SIZE = 20;

interface ChatMessage {
  id: string;
  text: string;
  created_at: string;
  sender_id: string;
}

type MessageListItem = { type: 'message'; data: ChatMessage } | { type: 'date'; date: string };

const groupMessagesByDate = (messages: ChatMessage[]): MessageListItem[] => {
  const grouped: MessageListItem[] = [];
  let lastDate: string | null = null;

  messages.forEach(message => {
    const messageDate = new Date(message.created_at).toDateString();
    if (messageDate !== lastDate) {
      grouped.push({ type: 'date', date: messageDate });
      lastDate = messageDate;
    }
    grouped.push({ type: 'message', data: message });
  });

  return grouped;
};

interface Participant {
  display_name: string;
  avatar_url: string | null;
  last_seen: string | null;
}

// Custom Header Component
const CustomHeader = ({ participant }: { participant: Participant }) => {
  const [lastSeenText, setLastSeenText] = useState('offline');

  useEffect(() => {
    const updateLastSeen = () => {
      if (participant.last_seen) {
        const lastSeenDate = new Date(participant.last_seen);
        const now = new Date();
        const diffSeconds = (now.getTime() - lastSeenDate.getTime()) / 1000;
        
        if (diffSeconds < 60) {
          setLastSeenText('online');
        } else {
          setLastSeenText(`last seen ${formatDistanceToNow(lastSeenDate)} ago`);
        }
      } else {
        setLastSeenText('offline');
      }
    };

    updateLastSeen();
    const intervalId = setInterval(updateLastSeen, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [participant.last_seen]);

  return (
    <View style={styles.headerContainer}>
      <Image
        source={participant.avatar_url ? { uri: participant.avatar_url } : require('@/assets/images/icon.png')}
        style={styles.headerAvatar}
      />
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerName}>{participant.display_name}</Text>
        <Text style={styles.headerLastSeen}>{lastSeenText}</Text>
      </View>
    </View>
  );
};

// A new, fully custom header component
const ChatHeader = ({ participant, onBack }: { participant: Participant, onBack: () => void }) => {
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

export default function ChatScreen() {
  const { conversation_id } = useLocalSearchParams() as { conversation_id: string };
  const { session } = useSession();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [participant, setParticipant] = useState<Participant>({
    display_name: 'Chat',
    avatar_url: null,
    last_seen: null,
  });
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allMessagesLoaded, setAllMessagesLoaded] = useState(false);
  
  const processedMessages = useMemo(() => {
    return groupMessagesByDate([...messages].reverse()).reverse();
  }, [messages]);

  const fetchChatData = useCallback(async () => {
    if (!conversation_id || !session?.user?.id) return;
    setLoading(true);

    try {
      // Fetch my avatar
      const { data: myProfile, error: myProfileError } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', session.user.id)
        .single();
      if (myProfileError) throw myProfileError;
      setMyAvatar(myProfile.avatar_url);
      
      // Fetch participant data (name, avatar, and last_seen)
      const { data: participantData, error: participantError } = await supabase
        .from('conversation_participants')
        .select('users(id, display_name, avatar_url, last_seen)')
        .eq('conversation_id', conversation_id)
        .neq('user_id', session.user.id)
        .single();
      if (participantError) throw participantError;
      
      const user = Array.isArray(participantData.users) ? participantData.users[0] : participantData.users;
      if (user) {
        setParticipant({
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          last_seen: user.last_seen
        });
      }

    } catch (error) {
      console.error("Failed to fetch chat metadata", error);
    } finally {
      setLoading(false);
    }
  }, [conversation_id, session?.user?.id]);


  const fetchMessages = useCallback(async (page = 0) => {
    if (loadingMore || (page > 0 && allMessagesLoaded)) return;
    page === 0 ? setLoading(true) : setLoadingMore(true);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('messages')
        .select('id, text, created_at, sender_id')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      if (data.length < PAGE_SIZE) setAllMessagesLoaded(true);
      setMessages(prev => (page === 0 ? data : [...prev, ...data]));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      page === 0 ? setLoading(false) : setLoadingMore(false);
    }
  }, [conversation_id, loadingMore, allMessagesLoaded]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/messages');
    }
  };

  useEffect(() => {
    fetchChatData();
    fetchMessages(0);
  }, [fetchChatData, fetchMessages]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat:${conversation_id}`)
      .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation_id}`,
        },
        (payload) => {
          setMessages(previousMessages => [payload.new as ChatMessage, ...previousMessages]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id]);

  const onSend = useCallback(async () => {
    if (!inputText.trim() || !session?.user) return;
    const textToSend = inputText.trim();
    setInputText('');

    const { error } = await supabase.from('messages').insert([{
      conversation_id,
      sender_id: session.user.id,
      text: textToSend,
    }]);

    if (error) {
      console.error('Error sending message:', error);
      setInputText(textToSend);
    }
  }, [conversation_id, session?.user, inputText]);
  
  const renderItem = ({ item }: { item: MessageListItem }) => {
     if (item.type === 'date') {
      return <Text style={styles.dateSeparator}>{new Date(item.date).toDateString()}</Text>;
    }
    const message = item.data;
    const isMyMessage = message.sender_id === session?.user?.id;
    const avatarUrl = isMyMessage ? myAvatar : participant.avatar_url;

    return (
      <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.theirMessageRow]}>
        {!isMyMessage && <Image source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/icon.png')} style={styles.avatar} />}
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble]}>
          <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>{message.text}</Text>
          <Text style={styles.messageTime}>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        {isMyMessage && <Image source={avatarUrl ? { uri: avatarUrl } : require('@/assets/images/icon.png')} style={styles.avatar} />}
      </View>
    );
  };
  
  if (loading) {
    return <ActivityIndicator style={StyleSheet.absoluteFill} size="large" color="#FF8C42" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ChatHeader participant={participant} onBack={handleBack} />
      <FlatList
          data={processedMessages}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.type === 'date' ? item.date : item.data.id.toString()}
          style={styles.messageList}
          inverted
          onEndReached={() => {
              const nextPage = Math.ceil(messages.length / PAGE_SIZE);
              fetchMessages(nextPage);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
          extraData={messages}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputToolbar}>
            <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                value={inputText}
                onChangeText={setInputText}
                multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={onSend}>
                <Send color="#FFFFFF" size={24} />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageRow: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  theirMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    maxWidth: '75%',
  },
  myMessageBubble: {
    backgroundColor: '#FFEADD',
  },
  theirMessageBubble: {
    backgroundColor: '#E5E5EA',
  },
  myMessageText: {
    color: '#000000',
    fontSize: 16,
  },
  theirMessageText: {
    color: '#333333',
    fontSize: 16,
  },
  messageTime: {
    fontSize: 10,
    color: '#A9A9A9',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#E1E1E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    fontSize: 12,
    color: '#606060',
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#FF8C42',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    paddingRight: 10,
  },
  headerTitleContainer: {
    // This style is no longer needed
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
    flexDirection: 'column',
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