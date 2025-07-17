// This file will list all of the user's ongoing conversations.
//
// Refactored to fix TypeScript type errors and improve data handling:
// - Updated `Partner` and `Participant` interfaces to correctly handle array-like structures returned by Supabase for relationships.
// - Modified data processing in `fetchInitialData` to correctly extract partner and participant information.
// - Adjusted rendering logic in `ListEmptyComponent` to access partner data from the corrected structure.
// - Refactored data fetching and state management to be more robust and fix inconsistent pull-to-refresh behavior.
// - Temporarily removed pull-to-refresh functionality for debugging purposes.
// - Redesigned conversation list from a grid to large, tappable buttons for better UX.
//
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { MessageSquarePlus, User, ChevronRight } from 'lucide-react-native';
import LottieView from 'lottie-react-native';

// Define types for our data structures
interface Conversation {
  id: string;
  last_message: string | null;
  last_message_sent_at: string | null;
  participant_name: string;
  participant_id: string | null;
  participant_avatar_url: string | null;
}

interface Partner {
  partner_id: string | null;
  partner: {
    display_name: string;
  }[] | null;
}

interface Participant {
  users: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

interface FetchedConversation {
  id: string;
  last_message: string | null;
  last_message_sent_at: string | null;
  conversation_participants: Participant[];
}

const MessagesHeader = ({ onNewChat }: { onNewChat: () => void }) => {
    return (
        <View style={styles.fixedHeaderContainer}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <User color="#FF8C42" size={28} />
                    <Text style={styles.title}>Messages</Text>
                </View>
                <TouchableOpacity style={styles.headerButton} onPress={onNewChat}>
                    <MessageSquarePlus color="#666" size={24} />
                </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>View your recent conversations.</Text>
        </View>
    );
};


export default function MessagesScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const animationRef = useRef<LottieView>(null);
  const hasPerformedInitialRedirect = useRef(false);

  // A single, stable function to fetch all necessary data.
  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const [partnerRes, conversationsRes] = await Promise.all([
        supabase.from('users').select('partner_id, partner:users!partner_id(display_name)').eq('id', session.user.id).single(),
        supabase.from('conversations').select(`
          id, last_message, last_message_sent_at,
          conversation_participants!inner(users(id, display_name, avatar_url))
        `).order('last_message_sent_at', { ascending: false })
      ]);

      if (partnerRes.error) console.error('Error fetching partner:', partnerRes.error);
      if (conversationsRes.error) console.error('Error fetching conversations:', conversationsRes.error);

      if (partnerRes.data) setPartner(partnerRes.data as unknown as Partner);
      
      if (conversationsRes.data) {
        const formattedConversations = (conversationsRes.data as unknown as FetchedConversation[]).map(convo => {
          const otherParticipant = convo.conversation_participants.find(p => p.users?.id !== session.user.id);
          return {
            id: convo.id,
            last_message: convo.last_message,
            last_message_sent_at: convo.last_message_sent_at,
            participant_name: otherParticipant?.users?.display_name || 'Unknown User',
            participant_id: otherParticipant?.users?.id || null,
            participant_avatar_url: otherParticipant?.users?.avatar_url || null
          };
        });
        setConversations(formattedConversations);
      }
    } catch(error) {
        console.error("Failed to fetch initial data", error);
    }
  }, [session?.user?.id]);


  // Effect for the initial data load
  useEffect(() => {
    if (session?.user?.id) {
        setLoading(true);
        fetchData().finally(() => setLoading(false));
    }
  }, [session?.user?.id, fetchData]);

  // Effect to handle automatic redirect, runs only once.
  useEffect(() => {
    if (!loading && conversations.length === 1 && !hasPerformedInitialRedirect.current) {
      console.log('Performing initial redirect to single conversation...');
      hasPerformedInitialRedirect.current = true;
      router.push(`/messages/${conversations[0].id}`);
    }
  }, [loading, conversations, router]);

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
    router.push(`/messages/${conversationId}`);
  };

  // Effect for setting up real-time subscriptions. Runs only once.
  useEffect(() => {
    const handleDbChange = (payload: any) => {
      console.log('Database change detected, refetching data.', payload);
      fetchData();
    };

    const conversationsChannel = supabase
      .channel('public:conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, handleDbChange)
      .subscribe();

    const usersChannel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, handleDbChange)
      .subscribe();
      
    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [fetchData]);
  
  const ConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.conversationItem} 
      onPress={() => router.push(`/messages/${item.id}`)}
    >
        {item.participant_avatar_url ? (
            <Image source={{ uri: item.participant_avatar_url }} style={styles.conversationAvatarImage} />
        ) : (
            <View style={styles.conversationAvatar}>
                <User size={30} color="#FF8C42" />
            </View>
        )}
      <View style={styles.conversationTextContainer}>
        <Text style={styles.conversationName} numberOfLines={1}>{item.participant_name}</Text>
        <Text style={styles.conversationAction}>Start chatting</Text>
        </View>
      <ChevronRight color="#BDBDBD" size={24} />
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => {
    console.log('Rendering ListEmptyComponent...');
    if (loading) {
      return null;
    }

    if (conversations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <LottieView
            ref={animationRef}
            source={require('@/assets/lottie/sad.json')}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <Text style={styles.emptyText}>No conversations yet.</Text>
        </View>
      );
    }
    
    if (partner?.partner_id && !hasConversationWithPartner) {
        return (
            <View style={styles.emptyContainer}>
                <TouchableOpacity style={styles.startChatButton} onPress={handleNewChat}>
                    <MessageSquarePlus color="#FFF" size={24} style={{ marginRight: 12 }}/>
                    <Text style={styles.startChatButtonText}>
                        Start a conversation with {partner.partner?.[0]?.display_name || 'your partner'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <MessagesHeader onNewChat={handleNewChat} />
      {loading ? (
          <ActivityIndicator style={{marginTop: 20}} size="large" color="#FF8C42" />
      ) : (
        <FlatList
            data={conversations}
            renderItem={ConversationItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={ListEmptyComponent}
            style={styles.list}
            contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginLeft: 12,
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
  },
  list: {
    flex: 1,
    backgroundColor: '#FFF8F0', // Match container background
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conversationAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  conversationAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  conversationTextContainer: {
    flex: 1,
  },
  conversationName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  conversationAction: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF8C42',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
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
    marginTop: 20,
    textAlign: 'center',
  },
  lottie: {
    width: 150,
    height: 150,
  }
});