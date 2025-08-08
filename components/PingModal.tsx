// This file was created by the assistant.
// It contains the "Send a Ping" modal component.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle, CircleCheck as CheckCircle, Bell, Heart, Coffee, Home, Zap, Clock } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';
import { useCategories } from '@/hooks/useCategories';

export interface PingTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  points?: number;
  points_icon?: string;
  point_unit?: string;
  notification_text?: string;
  category_id?: string;
}

interface PingModalProps {
  visible: boolean;
  onClose: () => void;
  onSendPing: (template: PingTemplate) => void;
}

// Icon mapping for categories from database
const categoryIcons: { [key: string]: any } = {
  'ping-checkin': Bell,
  'ping-urgent': AlertTriangle,
  'ping-worried': Heart,
  'ping-thinking': Heart,
  'ping-reminder': Clock,
};

export default function PingModal({
  visible,
  onClose,
  onSendPing,
}: PingModalProps) {
  const [selectedPing, setSelectedPing] = useState<PingTemplate | null>(null);
  const [templates, setTemplates] = useState<PingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Fetch categories from database
  const { data: categories, isLoading: categoriesLoading } = useCategories('ping');

  useEffect(() => {
    const fetchTemplates = async () => {
      if (visible) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('ping_templates')
            .select('*, category_id')
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


  // Filter templates by selected category
  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category_id === selectedCategory
  );

  const handleClose = () => {
    setSelectedPing(null);
    setSelectedCategory('all');
    onClose();
  };

  const handleSend = () => {
    if (selectedPing) {
      onSendPing(selectedPing);
      handleClose();
    }
  };

  const renderCategoryFilter = () => {
    if (!categories || categoriesLoading) return null;
    
    // Build categoryDetails from database
    const categoryDetails: any = {
      all: { name: 'All', icon: Zap, color: Colors.primary }
    };
    
    categories.forEach(cat => {
      categoryDetails[cat.id] = {
        name: cat.name,
        icon: categoryIcons[cat.id] || Zap,
        color: cat.color
      };
    });

    return (
      <View style={styles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
          decelerationRate="fast"
          snapToInterval={88} // Width of button + margin
          snapToAlignment="start">
          {Object.entries(categoryDetails).map(([id, { name, icon, color }]) => {
            const IconComponent = icon;
            const isSelected = selectedCategory === id;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.categoryFilterItem,
                  isSelected && styles.selectedCategoryFilter,
                ]}
                onPress={() => setSelectedCategory(id)}
                activeOpacity={0.7}>
                <IconComponent
                  color={isSelected ? Colors.white : Colors.textSecondary}
                  size={16}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
                <Text
                  style={[
                    styles.categoryFilterText,
                    isSelected && styles.selectedCategoryFilterText,
                  ]}
                  numberOfLines={2}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
                <Image source={require('../assets/images/ping.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Send a Ping</Text>
            <Text style={styles.heroSubtitle}>
              Send an urgent nudge to your partner to let them know you're thinking of them.
            </Text>
          </View>

          {renderCategoryFilter()}

          <View style={styles.content}>
            <View style={styles.pingSection}>
              {loading && <ActivityIndicator color="#3B82F6" style={{ marginVertical: 20 }} />}
              {error && <Text style={styles.errorText}>Error fetching pings: {error}</Text>}
              {!loading && !error && (
              <View style={styles.pingGrid}>
                {filteredTemplates.map((ping) => (
                  <TouchableOpacity
                    key={ping.id}
                    style={[
                      styles.pingCard,
                      selectedPing?.id === ping.id && styles.selectedPingCard,
                      { borderLeftColor: ping.color },
                    ]}
                    onPress={() => setSelectedPing(ping)}
                    activeOpacity={0.7}>
                    <View style={styles.pingCardContent}>
                      <View style={[styles.pingIcon, { backgroundColor: ping.color + '20' }]}>
                        <Text style={styles.pingEmoji}>{ping.icon}</Text>
                      </View>
                      <View style={styles.pingTextContainer}>
                        <Text style={styles.pingTitle}>{ping.title}</Text>
                        <Text style={styles.pingDescription}>{ping.description}</Text>
                      </View>
                    </View>
                    
                    {selectedPing?.id === ping.id && (
                      <View style={styles.selectedIndicator}>
                        <CheckCircle color={ping.color} size={16} />
                        <Text style={[styles.selectedText, { color: ping.color }]}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              )}
            </View>

            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>💡 Using Pings Responsibly</Text>
              <Text style={styles.tipText}>
                Pings are for urgent check-ins. To prevent spam, consider agreeing on limits,
                like a few per day or a cool-down timer between pings.
              </Text>
            </View>
          </View>
        </ScrollView>

        {selectedPing && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: selectedPing.color }]}
              onPress={handleSend}
              activeOpacity={0.8}>
              <Image source={require('../assets/images/ping.png')} style={styles.buttonImage} />
              <Text style={styles.fixedSendButtonText}>
                Send "{selectedPing.title}"
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
    backgroundColor: '#3B82F6' + '20',
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
  pingSection: {
    marginBottom: 32,
  },
  pingGrid: {
    gap: 16,
  },
  pingCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    borderLeftWidth: 4,
    ...Shadows.md,
  },
  selectedPingCard: {
    borderColor: Colors.info,
    backgroundColor: Colors.info + '1A',
  },
  pingCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pingEmoji: {
    fontSize: 20,
  },
  pingTextContainer: {
    flex: 1,
  },
  pingTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  pingDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
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
  buttonImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
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
    marginLeft: Spacing.sm,
  },
  categoryFilterContainer: {
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  categoryFilter: {
    paddingTop: Spacing.md,
  },
  categoryFilterContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xs,
  },
  categoryFilterItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    width: 88,
    minHeight: 60,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    paddingVertical: Spacing.sm,
  },
  selectedCategoryFilter: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  categoryFilterText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.tight,
    paddingHorizontal: Spacing.xs,
  },
  selectedCategoryFilterText: {
    color: Colors.white,
  },
}); 