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
    margin: Spacing.lg,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.lg,
  },
  modalText: {
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  reactionButton: {
    margin: Spacing.md,
    padding: Spacing.md,
  },
  reactionEmoji: {
    fontSize: 30,
  },
  closeButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  closeButtonText: {
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
});

export default ReactionModal; 