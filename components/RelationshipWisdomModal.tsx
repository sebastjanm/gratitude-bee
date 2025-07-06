import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Crown, Heart, CheckCircle, Home } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface WisdomOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface RelationshipWisdomModalProps {
  visible: boolean;
  onClose: () => void;
  onSendWisdom: (wisdomId: string, wisdomTitle: string) => void;
}

const wisdomOptions: WisdomOption[] = [
  {
    id: 'whatever-you-say',
    title: 'Whatever You Say, So Be It',
    description: 'Graceful acceptance of your perspective and wisdom',
    icon: '🤝',
    color: '#9B59B6',
  },
  {
    id: 'yes-dear',
    title: 'Yes, Dear',
    description: 'Wise partnership acknowledgment and agreement',
    icon: '👑',
    color: '#E67E22',
  },
  {
    id: 'happy-wife-happy-life',
    title: 'Happy Wife, Happy Life',
    description: 'Understanding relationship priorities and harmony',
    icon: '🏠',
    color: '#27AE60',
  },
  {
    id: 'im-sorry',
    title: 'I\'m Sorry',
    description: 'Sincere apology and commitment to making amends',
    icon: '💔',
    color: '#F87171',
  },
];

export default function RelationshipWisdomModal({
  visible,
  onClose,
  onSendWisdom,
}: RelationshipWisdomModalProps) {
  const [selectedWisdom, setSelectedWisdom] = useState<WisdomOption | null>(null);

  const handleClose = () => {
    setSelectedWisdom(null);
    onClose();
  };

  const handleSendWisdom = () => {
    if (selectedWisdom) {
      onSendWisdom(selectedWisdom.id, selectedWisdom.title);
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Relationship Wisdom</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Crown color="#8B5CF6" size={32} />
            </View>
            <Text style={styles.heroTitle}>Relationship Wisdom</Text>
            <Text style={styles.heroSubtitle}>
              Sometimes relationships require wisdom, compromise, and understanding. 
              These moments aren't traditional appreciation - they're about navigating 
              partnership with grace and maturity.
            </Text>
          </View>

          <View style={styles.wisdomSection}>
            <Text style={styles.sectionTitle}>Choose Your Response</Text>
            <Text style={styles.sectionSubtitle}>
              Each response acknowledges different aspects of partnership wisdom
            </Text>
            
            <View style={styles.wisdomGrid}>
              {wisdomOptions.map((wisdom) => (
                <TouchableOpacity
                  key={wisdom.id}
                  style={[
                    styles.wisdomCard,
                    selectedWisdom?.id === wisdom.id && styles.selectedWisdomCard,
                  ]}
                  onPress={() => setSelectedWisdom(wisdom)}
                  activeOpacity={0.7}>
                  <View style={styles.wisdomCardHeader}>
                    <View style={[styles.wisdomIcon, { backgroundColor: wisdom.color + '20' }]}>
                      <Text style={styles.wisdomEmoji}>{wisdom.icon}</Text>
                    </View>
                    <Text style={styles.wisdomTitle}>{wisdom.title}</Text>
                  </View>
                  <Text style={styles.wisdomDescription}>{wisdom.description}</Text>
                  
                  {selectedWisdom?.id === wisdom.id && (
                    <View style={styles.selectedIndicator}>
                      <CheckCircle color={wisdom.color} size={16} />
                      <Text style={[styles.selectedText, { color: wisdom.color }]}>Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 About Relationship Wisdom</Text>
            <Text style={styles.tipText}>
              These responses acknowledge the practical wisdom that comes with mature relationships. 
              They're about knowing when to compromise, when to apologize, and when to prioritize 
              harmony over being right. This isn't about submission - it's about partnership intelligence.
            </Text>
          </View>

          {selectedWisdom && (
            <View style={styles.sendButtonContainer}>
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: selectedWisdom.color }]}
                onPress={handleSendWisdom}
                activeOpacity={0.8}>
                <Crown color="white" size={20} />
                <Text style={styles.sendButtonText}>
                  Send "{selectedWisdom.title}"
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  wisdomSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
  },
  wisdomGrid: {
    gap: 16,
  },
  wisdomCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedWisdomCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6' + '05',
  },
  wisdomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wisdomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  wisdomEmoji: {
    fontSize: 20,
  },
  wisdomTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  wisdomDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  tipSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  sendButtonContainer: {
    paddingBottom: 32,
  },
  sendButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});