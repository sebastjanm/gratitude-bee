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
import { X, Phone, MessageSquare, Clock, CircleCheck as CheckCircle, Shell, Briefcase, Heart, Users, AlertTriangle, Sparkles } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';
import { useCategories } from '@/hooks/useCategories';

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

// Icon mapping for categories from database
const categoryIcons: { [key: string]: any } = {
  'panic-call': Phone,
  'panic-work': Briefcase,
  'panic-anxiety': Clock,
  'panic-health': Heart,
  'panic-family': Users,
};

export default function DontPanicModal({
  visible,
  onClose,
  onSend,
}: DontPanicModalProps) {
  const [selectedOption, setSelectedOption] = useState<DontPanicTemplate | null>(null);
  const [templates, setTemplates] = useState<DontPanicTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Fetch categories from database
  const { data: categories, isLoading: categoriesLoading } = useCategories('dontpanic');

  useEffect(() => {
    const fetchTemplates = async () => {
      if (visible) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('dont_panic_templates')
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
    setSelectedOption(null);
    setSelectedCategory('all');
    onClose();
  };

  const handleSendOption = () => {
    if (selectedOption) {
      onSend(selectedOption);
      handleClose();
    }
  };

  const renderCategoryFilter = () => {
    if (!categories || categoriesLoading) return null;
    
    // Build categoryDetails from database
    const categoryDetails: any = {
      all: { name: 'All', icon: AlertTriangle, color: Colors.primary }
    };
    
    categories.forEach(cat => {
      categoryDetails[cat.id] = {
        name: cat.name,
        icon: categoryIcons[cat.id] || AlertTriangle,
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
              <Image source={require('../assets/images/dont-panic.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Send Calm & Reassurance</Text>
            <Text style={styles.heroSubtitle}>
              Sometimes your partner needs immediate comfort after a stressful moment.
            </Text>
          </View>

          {renderCategoryFilter()}

          <View style={styles.content}>
            <View style={styles.optionsSection}>
              <Text style={styles.sectionTitle}>Choose Your Message</Text>
              
              {loading && <ActivityIndicator color="#6366F1" style={{ marginVertical: 20 }} />}
              {error && <Text style={styles.errorText}>Error fetching messages: {error}</Text>}

              {!loading && !error && (
                <View style={styles.optionsGrid}>
                  {filteredTemplates.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionCard,
                        selectedOption?.id === option.id &&
                          styles.selectedOptionCard,
                        { borderLeftColor: option.color },
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
                          <Text style={styles.optionTitle}>{option.title}</Text>
                          <Text style={styles.optionMessage}>"{option.description}"</Text>
                          
                          {selectedOption?.id === option.id && (
                            <View style={styles.selectedIndicator}>
                              <Sparkles color={option.color} size={14} />
                              <Text style={[styles.selectedText, { color: option.color }]}>Selected</Text>
                            </View>
                          )}
                        </View>
                      </View>
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
    minHeight: 60, // Increased for better text visibility
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
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
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
  optionRightContent: {
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
    marginTop: Spacing.xs,
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