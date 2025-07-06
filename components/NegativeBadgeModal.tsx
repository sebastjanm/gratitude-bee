import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { X, TriangleAlert as AlertTriangle, Bug } from 'lucide-react-native';

interface NegativeBadgeModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string, badgesToCancel: string[]) => void;
  recentPositiveBadges: Array<{
    id: string;
    name: string;
    category: string;
    earnedDate: string;
  }>;
}

export default function NegativeBadgeModal({
  visible,
  onClose,
  onSend,
  recentPositiveBadges,
}: NegativeBadgeModalProps) {
  const [message, setMessage] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const handleSend = () => {
    if (selectedBadges.length === 0) {
      Alert.alert(
        'No badges selected',
        'Please select at least one positive badge to cancel.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Send Hornet?',
      `This will cancel ${selectedBadges.length} positive badge${selectedBadges.length > 1 ? 's' : ''} and cannot be undone. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Hornet',
          style: 'destructive',
          onPress: () => {
            onSend(message, selectedBadges);
            setMessage('');
            setSelectedBadges([]);
            onClose();
          },
        },
      ]
    );
  };

  const toggleBadgeSelection = (badgeId: string) => {
    setSelectedBadges(prev =>
      prev.includes(badgeId)
        ? prev.filter(id => id !== badgeId)
        : [...prev, badgeId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Send Hornet</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.warningContainer}>
          <AlertTriangle color="#FF4444" size={24} />
          <Text style={styles.warningText}>
            Hornets cancel out positive badges and should be used thoughtfully for accountability.
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Select badges to cancel:</Text>
          
          {recentPositiveBadges.length === 0 ? (
            <View style={styles.noBadgesContainer}>
              <Text style={styles.noBadgesText}>
                No recent positive badges to cancel
              </Text>
            </View>
          ) : (
            <View style={styles.badgesList}>
              {recentPositiveBadges.map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={[
                    styles.badgeItem,
                    selectedBadges.includes(badge.id) && styles.selectedBadgeItem,
                  ]}
                  onPress={() => toggleBadgeSelection(badge.id)}>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeDate}>
                      {badge.category} • {formatDate(badge.earnedDate)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      selectedBadges.includes(badge.id) && styles.checkedBox,
                    ]}>
                    {selectedBadges.includes(badge.id) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Optional message:</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Explain why you're sending this hornet..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.characterCount}>{message.length}/200</Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              selectedBadges.length === 0 && styles.disabledButton,
            ]}
            onPress={handleSend}
            disabled={selectedBadges.length === 0}>
            <Bug color="white" size={20} />
            <Text style={styles.sendButtonText}>
              Send Hornet ({selectedBadges.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  noBadgesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noBadgesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  badgesList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedBadgeItem: {
    backgroundColor: '#FFF5F5',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 4,
  },
  badgeDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#FF4444',
    borderColor: '#FF4444',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  sendButton: {
    backgroundColor: '#FF4444',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});