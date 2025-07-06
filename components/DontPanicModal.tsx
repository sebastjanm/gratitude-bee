import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Heart, Phone, MessageSquare, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DontPanicModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string, quickResponse?: string) => void;
}

const quickResponses = [
  "Everything will be okay ❤️",
  "I'm here for you, always",
  "Take a deep breath with me",
  "You're safe now, I love you",
  "Let's talk when you're ready",
  "Sending you all my calm energy",
];

const panicTriggers = [
  { icon: Phone, text: "After a stressful call", color: "#EF4444" },
  { icon: MessageSquare, text: "Overwhelming news", color: "#F59E0B" },
  { icon: Clock, text: "Anxiety moment", color: "#8B5CF6" },
];

export default function DontPanicModal({
  visible,
  onClose,
  onSend,
}: DontPanicModalProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [selectedQuickResponse, setSelectedQuickResponse] = useState<string | null>(null);

  const handleSendQuickResponse = (response: string) => {
    onSend('', response);
    setSelectedQuickResponse(null);
    setCustomMessage('');
    onClose();
  };

  const handleSendCustomMessage = () => {
    if (customMessage.trim()) {
      onSend(customMessage, selectedQuickResponse || undefined);
      setCustomMessage('');
      setSelectedQuickResponse(null);
      onClose();
    }
  };

  const handleClose = () => {
    setCustomMessage('');
    setSelectedQuickResponse(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Don't Panic</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Heart color="#6366F1" size={32} fill="#6366F1" />
            </View>
            <Text style={styles.heroTitle}>Send Calm & Reassurance</Text>
            <Text style={styles.heroSubtitle}>
              Sometimes your partner needs immediate comfort after a stressful moment. 
              Send a gentle reminder that everything will be okay.
            </Text>
          </View>

          <View style={styles.triggerSection}>
            <Text style={styles.sectionTitle}>Common Situations</Text>
            <View style={styles.triggerGrid}>
              {panicTriggers.map((trigger, index) => {
                const IconComponent = trigger.icon;
                return (
                  <View key={index} style={styles.triggerCard}>
                    <View style={[styles.triggerIcon, { backgroundColor: trigger.color + '20' }]}>
                      <IconComponent color={trigger.color} size={20} />
                    </View>
                    <Text style={styles.triggerText}>{trigger.text}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.quickResponseSection}>
            <Text style={styles.sectionTitle}>Quick Responses</Text>
            <Text style={styles.sectionSubtitle}>
              Tap to send immediately, or customize below
            </Text>
            <View style={styles.quickResponseGrid}>
              {quickResponses.map((response, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickResponseCard,
                    selectedQuickResponse === response && styles.selectedQuickResponse,
                  ]}
                  onPress={() => handleSendQuickResponse(response)}
                  activeOpacity={0.7}>
                  <Text style={[
                    styles.quickResponseText,
                    selectedQuickResponse === response && styles.selectedQuickResponseText,
                  ]}>
                    {response}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.customMessageSection}>
            <Text style={styles.sectionTitle}>Custom Message</Text>
            <Text style={styles.sectionSubtitle}>
              Add your own personal touch of comfort
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Write your calming message here..."
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{customMessage.length}/300</Text>
            
            {customMessage.trim().length > 0 && (
              <TouchableOpacity
                style={styles.sendCustomButton}
                onPress={handleSendCustomMessage}
                activeOpacity={0.8}>
                <Heart color="white" size={20} />
                <Text style={styles.sendCustomButtonText}>Send Don't Panic Message</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 Tip</Text>
            <Text style={styles.tipText}>
              Don't Panic messages are perfect for moments when your partner needs immediate 
              emotional support. They're not about appreciation - they're about being present 
              during difficult times.
            </Text>
          </View>
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
    backgroundColor: '#6366F1' + '20',
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
  triggerSection: {
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
    marginBottom: 16,
  },
  triggerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  triggerCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  triggerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  triggerText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
  },
  quickResponseSection: {
    marginBottom: 32,
  },
  quickResponseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickResponseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    minWidth: (width - 64) / 2,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedQuickResponse: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1' + '10',
  },
  quickResponseText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedQuickResponseText: {
    color: '#6366F1',
  },
  customMessageSection: {
    marginBottom: 32,
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'right',
    marginBottom: 16,
  },
  sendCustomButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sendCustomButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  tipSection: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
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
});