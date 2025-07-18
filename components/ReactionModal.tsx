// components/ReactionModal.tsx
// A modal for selecting a reaction to an event.

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';

interface ReactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  eventId: string | null;
  reactionOptions: { [key: string]: string };
}

const ReactionModal: React.FC<ReactionModalProps> = ({ isVisible, onClose, eventId, reactionOptions }) => {
  const { session } = useSession();
  const [loading, setLoading] = React.useState(false);

  const handleReaction = async (reactionType: string) => {
    if (!eventId || !session) return;
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('add-reaction', {
        body: {
          event_id: eventId,
          reaction_type: reactionType,
          user_id: session.user.id,
        },
      });

      if (error) {
        throw new Error('Failed to send reaction.');
      }
      
      onClose();
    } catch (error) {
      console.error('Error sending reaction:', error);
      Alert.alert('Error', 'Could not send your reaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>React to this message</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FF8C42" />
          ) : (
            <View style={styles.reactionsContainer}>
              {Object.entries(reactionOptions).map(([key, emoji]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.reactionButton}
                  onPress={() => handleReaction(key)}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  reactionButton: {
    margin: 10,
    padding: 10,
  },
  reactionEmoji: {
    fontSize: 30,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#FF8C42',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
});

export default ReactionModal; 