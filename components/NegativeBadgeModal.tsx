// Fix: Fetch and display badge-specific icons from the database.
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { X, Zap, CircleAlert as AlertCircle, Bomb } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface NegativeBadgeModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string, selectedOption: HornetOption) => void;
}

interface HornetOption {
  id: string;
  count: number;
  title: string;
  description: string;
  icon: string; // Changed to string for emoji
  color: string;
  severity: 'light' | 'medium' | 'heavy';
}

export default function NegativeBadgeModal({
  visible,
  onClose,
  onSend,
}: NegativeBadgeModalProps) {
  const [hornetOptions, setHornetOptions] = useState<HornetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedOption, setSelectedOption] = useState<HornetOption | null>(null);

  useEffect(() => {
    if (visible) {
      fetchHornetTemplates();
    }
  }, [visible]);

  const fetchHornetTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('hornet_templates').select('*').order('points', { ascending: false });
    if (error) {
      Alert.alert('Error', 'Could not fetch hornet options.');
    } else {
      const colorMap: { [key: string]: string } = { light: '#FBBF24', medium: '#F97316', heavy: '#EF4444' };
      const templates = data.map(t => ({
        ...t,
        count: Math.abs(t.points),
        color: colorMap[t.severity] || '#6B7280'
      }));
      setHornetOptions(templates);
    }
    setLoading(false);
  };
  
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
            onSend(message, selectedOption);
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
        <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color={Colors.textSecondary} size={24} />
            </TouchableOpacity>
            <View style={styles.heroIcon}>
              <Image source={require('../assets/images/hornet.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Accountability Hornet</Text>
            <Text style={styles.heroSubtitle}>
              Sometimes relationships need honest feedback. But be careful, it can be a double edged sword.
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.optionsSection}>
              {loading ? (
                <ActivityIndicator size="large" color="#FF4444" />
              ) : (
                <View style={styles.optionsGrid}>
                  {hornetOptions.map((option) => {
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
                            <Text style={styles.optionEmoji}>{option.icon}</Text>
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
              )}
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
                Send Hornet ({selectedOption.count})
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
    backgroundColor: Colors.background,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 72,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: Layout.screenPadding,
    padding: Spacing.sm,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF4444' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  heroTitle: {
    ...ComponentStyles.modal.headerTitle,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...ComponentStyles.modal.headerSubtitle,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '10',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    marginBottom: Spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    lineHeight: Typography.lineHeight.tight,
  },
  optionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  optionsGrid: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  selectedOptionCard: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
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
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
    marginRight: Spacing.sm,
    minWidth: 40,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
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
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
  },
  messageSection: {
    marginBottom: 32,
  },
  messageInput: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
    marginBottom: Spacing.sm,
  },
  characterCount: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  tipSection: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.gray500,
  },
  tipTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
  },
  fixedSendButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  fixedSendButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  buttonImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  fixedSendButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.white,
    marginLeft: Spacing.sm,
  },
  optionEmoji: {
    fontSize: 24,
  }
});