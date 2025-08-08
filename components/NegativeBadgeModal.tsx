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
import { X, Zap, CircleAlert as AlertCircle, Bomb, Sparkles } from 'lucide-react-native';
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
        <View style={{ flex: 1 }}>
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
                        onPress={() => setSelectedOption(selectedOption?.id === option.id ? null : option)}
                        activeOpacity={0.7}>
                        <View style={styles.optionCardContent}>
                          {/* Icon on the left */}
                          <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                            <Text style={styles.optionEmoji}>{option.icon}</Text>
                          </View>
                          
                          {/* Content on the right */}
                          <View style={styles.optionRightContent}>
                            <View style={styles.optionHeader}>
                              <View style={styles.optionInfo}>
                                <Text style={styles.optionTitle} numberOfLines={1}>{option.title}</Text>
                                <Text style={styles.optionDescription} numberOfLines={2}>{option.description}</Text>
                              </View>
                              <View style={styles.optionPoints}>
                                <Text style={styles.optionCount}>-{option.count}</Text>
                              </View>
                            </View>
                            
                            {selectedOption?.id === option.id && (
                              <View style={styles.selectedIndicator}>
                                <Sparkles color={option.color} size={14} />
                                <Text style={[styles.selectedText, { color: option.color }]}>Selected</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
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
            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Personal note</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="Explain why you're sending this hornet..."
                value={message}
                onChangeText={setMessage}
                maxLength={100}
              />
            </View>
          )}
        </View>

        {selectedOption && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: selectedOption.color }]}
              onPress={handleSend}
              activeOpacity={0.8}>
              <Image source={require('../assets/images/hornet.png')} style={styles.buttonImage} />
              <Text style={styles.fixedSendButtonText}>
                Send "{selectedOption.title}" -{selectedOption.count}
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
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    borderLeftWidth: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOptionCard: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  optionCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRightContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  optionInfo: {
    flex: 1,
    marginRight: Spacing.sm,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
    marginTop: 2,
  },
  optionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '15',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    flexShrink: 0,
  },
  optionCount: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  selectedText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    marginLeft: Spacing.xs,
  },
  messageSection: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  messageLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  messageInput: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
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
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  fixedSendButton: {
    ...ComponentStyles.button.primary,
    backgroundColor: Colors.error,
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
    ...ComponentStyles.button.text.primary,
    marginLeft: Spacing.sm,
  },
  optionEmoji: {
    fontSize: 20,
  }
});