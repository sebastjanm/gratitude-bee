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
  Alert,
} from 'react-native';
import { X, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/utils/supabase'; // Assuming supabase client is here
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

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
  onSendWisdom: (wisdom: WisdomOption) => void;
}

export default function RelationshipWisdomModal({
  visible,
  onClose,
  onSendWisdom,
}: RelationshipWisdomModalProps) {
  const [wisdomOptions, setWisdomOptions] = useState<WisdomOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWisdom, setSelectedWisdom] = useState<WisdomOption | null>(null);

  useEffect(() => {
    const fetchWisdomTemplates = async () => {
      if (visible) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('wisdom_templates')
            .select('*')
            .eq('is_active', true);

          if (error) throw error;
          setWisdomOptions(data || []);
        } catch (error) {
          console.error("Error fetching wisdom templates:", error);
          Alert.alert("Error", "Could not load wisdom options. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWisdomTemplates();
  }, [visible]);


  const handleClose = () => {
    setSelectedWisdom(null);
    onClose();
  };

  const handleSendWisdom = () => {
    if (selectedWisdom) {
      onSendWisdom(selectedWisdom);
      handleClose();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading Wisdom...</Text>
        </View>
      );
    }

    return (
      <View style={styles.wisdomGrid}>
        {wisdomOptions.map((wisdom) => (
          <TouchableOpacity
            key={wisdom.id}
            style={[
              styles.wisdomCard,
              selectedWisdom?.id === wisdom.id &&
                styles.selectedWisdomCard,
              { borderLeftColor: wisdom.color },
            ]}
            onPress={() => setSelectedWisdom(wisdom)}
            activeOpacity={0.7}>
            <View style={styles.wisdomCardContent}>
              <View style={[styles.wisdomIcon, { backgroundColor: wisdom.color + '20' }]}>
                <Text style={styles.wisdomEmoji}>{wisdom.icon}</Text>
              </View>
              <View style={styles.wisdomTextContainer}>
                <Text style={styles.wisdomTitle}>{wisdom.title}</Text>
                <Text style={styles.wisdomDescription}>{wisdom.description}</Text>
              </View>
            </View>
            
            {selectedWisdom?.id === wisdom.id && (
              <View style={styles.selectedIndicator}>
                <CheckCircle color={wisdom.color} size={16} />
                <Text style={[styles.selectedText, { color: wisdom.color }]}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
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
              <Image source={require('../assets/images/owl.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Relationship Wisdom</Text>
            <Text style={styles.heroSubtitle}>
              Sometimes relationships just need a little wisdom, compromise, and understanding.
            </Text>
          </View>

          <View style={styles.wisdomSection}>
            {renderContent()}
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 About Relationship Wisdom</Text>
            <Text style={styles.tipText}>
              These responses acknowledge the practical wisdom that comes with mature relationships. 
              They're about knowing when to compromise, when to apologize, and when to prioritize 
              harmony over being right. This isn't about submission - it's about partnership intelligence.
            </Text>
          </View>

        </ScrollView>

        {selectedWisdom && !loading && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: selectedWisdom.color }]}
              onPress={handleSendWisdom}
              activeOpacity={0.8}>
              <Image source={require('../assets/images/owl.png')} style={styles.buttonImage} />
              <Text style={styles.fixedSendButtonText}>
                Send "{selectedWisdom.title}"
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.background,
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
    backgroundColor: '#8B5CF6' + '20',
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
  wisdomSection: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  wisdomGrid: {
    gap: 16,
  },
  wisdomCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  selectedWisdomCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6' + '1A',
  },
  wisdomCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  wisdomTextContainer: {
    flex: 1,
  },
  wisdomTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  wisdomDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 64, // Align with text (icon width 48 + margin 16)
  },
  selectedText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    marginLeft: Spacing.xs,
  },
  tipSection: {
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
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
  buttonImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
    marginRight: 8,
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
});