import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, Phone, MessageSquare, Clock, CircleCheck as CheckCircle, Shell } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

export interface DontPanicTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  points?: number;
  points_icon?: string;
  point_unit?: string;
  notification_text?: string;
}

interface DontPanicModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (template: DontPanicTemplate) => void;
}

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
  const [selectedOption, setSelectedOption] = useState<DontPanicTemplate | null>(null);
  const [templates, setTemplates] = useState<DontPanicTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (visible) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('dont_panic_templates')
            .select('*')
            .eq('is_active', true);

          if (error) {
            throw error;
          }
          setTemplates(data || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplates();
  }, [visible]);


  const handleClose = () => {
    setSelectedOption(null);
    onClose();
  };

  const handleSendOption = () => {
    if (selectedOption) {
      onSend(selectedOption);
      handleClose();
    }
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
              
              {loading && <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />}
              {error && <Text style={styles.errorText}>Error fetching messages: {error}</Text>}

              {!loading && !error && (
                <View style={styles.optionsGrid}>
                  {templates.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        selectedOption?.id === option.id &&
                          styles.selectedOptionCard,
                        { borderLeftColor: option.color },
                      ]}
                      onPress={() => setSelectedOption(option)}
                      activeOpacity={0.7}>
                      <View style={styles.optionCardContent}>
                        <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                          <Text style={styles.optionEmoji}>{option.icon}</Text>
                        </View>
                        <View style={styles.optionTextContainer}>
                          <Text style={styles.optionTitle}>{option.title}</Text>
                          <Text style={styles.optionMessage}>"{option.description}"</Text>
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
              )}
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
    ...ComponentStyles.modal.headerTitle,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...ComponentStyles.modal.headerSubtitle,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    color: Colors.error,
    marginVertical: Spacing.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  triggerSection: {
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
    marginBottom: Spacing.md,
  },
  triggerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  triggerCard: {
    flex: 1,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    ...Shadows.sm,
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
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  optionsSection: {
    marginBottom: 32,
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
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '1A',
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
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  optionMessage: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 64, // Align with text
  },
  selectedText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    marginLeft: Spacing.xs,
  },
  tipSection: {
    backgroundColor: Colors.info + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
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
    ...ComponentStyles.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  fixedSendButtonText: {
    ...ComponentStyles.button.text.primary,
  },
  buttonImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
    marginRight: 8,
  },
});