// This file will list all of the user's ongoing conversations.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { MessageSquarePlus } from 'lucide-react-native';

// Define types for our data structures
interface Conversation {
  id: string;
  last_message: string | null;
  last_message_sent_at: string | null;
  participant_name: string;
  participant_id: string | null;
}

interface Partner {
  partner_id: string | null;
  // Supabase returns related tables as an array, even for one-to-one
  partner: {
    display_name: string;
  } | null;
}

interface Participant {
  users: {
    id: string;
    display_name: string;
  };
}

interface FetchedConversation {
  id: string;
  last_message: string | null;
  last_message_sent_at: string | null;
  conversation_participants: Participant[];
}


export default function MessagesScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);

  const hasConversationWithPartner = conversations.some(convo => 
    convo.participant_id === partner?.partner_id
  );

  const handleNewChat = async () => {
    if (!session?.user?.id || !partner?.partner_id) {
        alert('Could not find a partner to start a chat with.');
        return;
    }

    const { data: conversationId, error: rpcError } = await supabase.rpc('get_or_create_conversation', {
      user_one_id: session.user.id,
      user_two_id: partner.partner_id,
    });

    if (rpcError) {
      alert('Could not start a new chat. Please try again.');
      return;
    }
    router.push(`/chat/${conversationId}`);
  };

  const fetchInitialData = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    try {
        const [partnerRes, conversationsRes] = await Promise.all([
          supabase.from('users').select('partner_id, partner:users!partner_id(display_name)').eq('id', session.user.id).single(),
          supabase.from('conversations').select(`
            id, last_message, last_message_sent_at,
            conversation_participants!inner(users(id, display_name))
          `).order('last_message_sent_at', { ascending: false })
        ]);

        if (partnerRes.error) console.error('Error fetching partner:', partnerRes.error);
        if (conversationsRes.error) console.error('Error fetching conversations:', conversationsRes.error);

        if (partnerRes.data) setPartner(partnerRes.data as Partner);
        
        if (conversationsRes.data) {
          const formattedConversations = (conversationsRes.data as FetchedConversation[]).map(convo => {
            const otherParticipant = convo.conversation_participants.find(p => p.users.id !== session.user.id);
            return {
              id: convo.id,
              last_message: convo.last_message,
              last_message_sent_at: convo.last_message_sent_at,
              participant_name: otherParticipant?.users?.display_name || 'Unknown User',
              participant_id: otherParticipant?.users?.id || null
            };
          });
          setConversations(formattedConversations);
        }
    } catch(error) {
        console.error("Failed to fetch initial data", error);
    } finally {
        setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel('public:conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, (payload) => {
        fetchInitialData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialData]);
  
  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.participant_name}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.last_message || 'No messages yet...'}
        </Text>
      </View>
      <Text style={styles.time}>
        {item.last_message_sent_at ? new Date(item.last_message_sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
      </Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {partner?.partner_id && !hasConversationWithPartner && !loading ? (
        <TouchableOpacity style={styles.startChatButton} onPress={handleNewChat}>
          <MessageSquarePlus color="#FFF" size={24} style={{ marginRight: 12 }}/>
          <Text style={styles.startChatButtonText}>
            Start a conversation with {partner.partner?.display_name || 'your partner'}
          </Text>
        </TouchableOpacity>
      ) : (
        !loading && <Text style={styles.emptyText}>No conversations yet.</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Messages',
        }} 
      />
      {loading ? (
          <ActivityIndicator style={{marginTop: 20}} size="large" color="#FF8C42" />
      ) : (
        <FlatList
            data={conversations}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={ListEmptyComponent}
            style={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  startChatButton: {
    flexDirection: 'row',
    backgroundColor: '#FF8C42',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startChatButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  }
});