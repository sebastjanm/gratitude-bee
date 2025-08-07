// components/ReactionModal.tsx
// A modal for selecting a reaction to an event.

import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

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
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : (
            <View style={styles.reactionsContainer}>
              {Object.entries(reactionOptions).map(([key, emoji]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.reactionButton}
                  onPress={() => handleReaction(key)}
                  activeOpacity={0.7}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    ...ComponentStyles.card,
    margin: Spacing.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    width: '90%',
    maxWidth: 320,
  },
  modalText: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.xs, // Compensate for button margins
    maxWidth: 280, // Limit width to prevent overflow
  },
  reactionButton: {
    width: 48, // Reduced from 56 to fit better
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    margin: Spacing.xs, // Space between buttons
  },
  reactionEmoji: {
    fontSize: Typography.fontSize.xl, // Reduced from 2xl to fit better
  },
  closeButton: {
    ...ComponentStyles.button.secondary,
    marginTop: Spacing.sm,
    minWidth: 120,
  },
  closeButtonText: {
    ...ComponentStyles.button.text.secondary,
  },
});

export default ReactionModal; 