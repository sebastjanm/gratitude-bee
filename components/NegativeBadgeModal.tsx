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
  Image,
} from 'react-native';
import { X, Zap, CircleAlert as AlertCircle, Bomb } from 'lucide-react-native';

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

interface HornetOption {
  id: string;
  count: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  severity: 'light' | 'medium' | 'heavy';
}

const hornetOptions: HornetOption[] = [
  {
    id: 'light-misunderstanding',
    count: -10,
    title: 'Light Misunderstanding',
    description: 'Minor issue that needs gentle addressing',
    icon: Zap,
    color: '#F59E0B',
    severity: 'light',
  },
  {
    id: 'not-ok',
    title: 'Hey, This Is Not OK',
    count: -50,
    description: 'Significant concern that requires attention',
    icon: AlertCircle,
    color: '#EF4444',
    severity: 'medium',
  },
  {
    id: 'clusterfuck',
    count: -100,
    title: 'Clusterfuck',
    description: 'Major issue requiring serious discussion',
    icon: Bomb,
    color: '#DC2626',
    severity: 'heavy',
  },
];

export default function NegativeBadgeModal({
  visible,
  onClose,
  onSend,
  recentPositiveBadges,
}: NegativeBadgeModalProps) {
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<HornetOption | null>(null);

  const handleSend = () => {
    if (!selectedOption) {
      Alert.alert(
        'No option selected',
        'Please select a hornet type to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    const severityText = selectedOption.severity === 'light' ? 'minor issue' : 
                        selectedOption.severity === 'medium' ? 'significant concern' : 
                        'major issue';

    Alert.alert(
      'Send Hornet?',
      `This will cancel ${selectedOption.count} positive badges for this ${severityText} and cannot be undone. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Hornet',
          style: 'destructive',
          onPress: () => {
            // Generate mock badge IDs to cancel
            const badgesToCancel = Array.from({ length: selectedOption.count }, (_, i) => `badge_${i}`);
            onSend(message, badgesToCancel);
            setMessage('');
            setSelectedOption(null);
            onClose();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setMessage('');
    setSelectedOption(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Send Hornet</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>


          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
              <Image source={require('../assets/images/hornet.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Accountability Hornet</Text>
            <Text style={styles.heroSubtitle}>
              Sometimes relationships need honest feedback. But be careful, it can be a double edged sword.
            </Text>
          </View>


          <View style={styles.optionsSection}>

            
            <View style={styles.optionsGrid}>
              {hornetOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      selectedOption?.id === option.id && styles.selectedOptionCard,
                      { borderLeftColor: option.color }
                    ]}
                    onPress={() => setSelectedOption(option)}
                    activeOpacity={0.7}>
                    <View style={styles.optionHeader}>
                      <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                        <IconComponent color={option.color} size={24} />
                      </View>
                      <View style={styles.optionInfo}>
                        <View style={styles.optionTitleRow}>
                          <Text style={styles.optionCount}>{option.count}</Text>
                          <Text style={styles.optionTitle}>{option.title}</Text>
                        </View>
                        <Text style={styles.optionDescription}>{option.description}</Text>
                      </View>
                    </View>
                    
                    {selectedOption?.id === option.id && (
                      <View style={styles.selectedIndicator}>
                        <View style={[styles.selectedDot, { backgroundColor: option.color }]} />
                        <Text style={[styles.selectedText, { color: option.color }]}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>Optional message:</Text>
            <Text style={styles.sectionSubtitle}>
              Explain the situation that prompted this hornet
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Explain why you're sending this hornet..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={3}
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{message.length}/200</Text>
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 Using Hornets Wisely</Text>
            <Text style={styles.tipText}>
              Hornets are for accountability, not punishment. Use them to address genuine 
              concerns that need discussion. The goal is better communication, not keeping score.
            </Text>
          </View>
        </ScrollView>

        {selectedOption && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: selectedOption.color }]}
              onPress={handleSend}
              activeOpacity={0.8}>
              <Image source={require('../assets/images/hornet.png')} style={styles.buttonImage} />
              <Text style={styles.fixedSendButtonText}>
                Send Hornet (-{Math.abs(selectedOption.count)})
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF4444' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
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
  optionsSection: {
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
  optionsGrid: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedOptionCard: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  optionInfo: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionCount: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FF4444',
    marginRight: 8,
    minWidth: 40,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  messageSection: {
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
  },
  tipSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
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
  buttonImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  fixedSendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});