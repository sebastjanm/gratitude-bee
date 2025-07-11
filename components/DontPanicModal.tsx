import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { X, Phone, MessageSquare, Clock, CircleCheck as CheckCircle, Shell } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DontPanicModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string, quickResponse?: string) => void;
}

interface CalmOption {
  id: string;
  title: string;
  message: string;
  icon: string;
  color: string;
}

const calmOptions: CalmOption[] = [
  {
    id: 'everything-okay',
    title: 'Everything will be okay',
    message: 'No worries, take a deep breath. You are alive ❤️, rest can wait.',
    icon: '🫂',
    color: '#6366F1',
  },
  {
    id: 'here-for-you',
    title: 'I\'m here for you',
    message: 'I\'m here for you, always. You\'re not alone in this ❤️',
    icon: '🤗',
    color: '#8B5CF6',
  },
  {
    id: 'youre-safe',
    title: 'You\'re safe and loved',
    message: 'You\'re safe now, I love you. This feeling will pass ❤️',
    icon: '🛡️',
    color: '#10B981',
  },
  {
    id: 'talk-when-ready',
    title: 'Let\'s talk when you\'re ready',
    message: 'No pressure, just love 💕',
    icon: '💬',
    color: '#F59E0B',
  },
  {
    id: 'calm-energy',
    title: 'Sending Yoda might force',
    message: 'May the force be with you and stay calm.🕊️✨',
    icon: '🕊️',
    color: '#84CC16',
  },
];

const panicTriggers = [
  { icon: Phone, text: "Stressful call", color: "#EF4444" },
  { icon: Shell, text: "Jobs situation", color: "#8B5CF6" },
  { icon: Clock, text: "Anxiety moment", color: "#8B5CF6" },
];

export default function DontPanicModal({
  visible,
  onClose,
  onSend,
}: DontPanicModalProps) {
  const [selectedOption, setSelectedOption] = useState<CalmOption | null>(null);

  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  const handleSendOption = () => {
    if (selectedOption) {
      onSend(selectedOption.message, selectedOption.title);
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color="#666" size={24} />
            </TouchableOpacity>
            <View style={styles.heroIcon}>
              <Image source={require('../assets/images/dont-panic.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Send Calm & Reassurance</Text>
            <Text style={styles.heroSubtitle}>
              Sometimes your partner needs immediate comfort after a stressful moment.
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.triggerSection}>
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

            <View style={styles.optionsSection}>
              <Text style={styles.sectionTitle}>Choose Your Message</Text>
              
              <View style={styles.optionsGrid}>
                {calmOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      selectedOption?.id === option.id && styles.selectedOptionCard,
                    ]}
                    onPress={() => setSelectedOption(option)}
                    activeOpacity={0.7}>
                    <View style={styles.optionCardContent}>
                      <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                        <Text style={styles.optionEmoji}>{option.icon}</Text>
                      </View>
                      <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>{option.title}</Text>
                        <Text style={styles.optionMessage}>"{option.message}"</Text>
                      </View>
                    </View>
                    
                    {selectedOption?.id === option.id && (
                      <View style={styles.selectedIndicator}>
                        <CheckCircle color={option.color} size={16} />
                        <Text style={[styles.selectedText, { color: option.color }]}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>💡 About Don't Panic Messages</Text>
              <Text style={styles.tipText}>
                Don't Panic messages are perfect for moments when your partner needs immediate
                emotional support. They're not about appreciation - they're about being present
                during difficult times and offering comfort when it's needed most.
              </Text>
            </View>
          </View>
        </ScrollView>

        {selectedOption && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: selectedOption.color }]}
              onPress={handleSendOption}
              activeOpacity={0.8}>
              <Image source={require('../assets/images/dont-panic.png')} style={styles.buttonImage} />
              <Text style={styles.fixedSendButtonText}>
                Send "{selectedOption.title}"
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
  optionsSection: {
    marginBottom: 32,
  },
  optionsGrid: {
    gap: 16,
  },
  optionCard: {
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
  selectedOptionCard: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1' + '05',
  },
  optionCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  optionMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 64, // Align with text
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
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
  fixedSendButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  fixedSendButton: {
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
  fixedSendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  buttonImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
    marginRight: 8,
  },
});