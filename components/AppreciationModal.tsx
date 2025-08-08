// Fix: Refactored to support category-specific point units (e.g., bees, butterflies).
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Sparkles, Heart } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';
import { useCategories } from '@/hooks/useCategories';

const { width } = Dimensions.get('window');

// Interfaces remain the same for component's internal state management
interface BadgeOption {
  id: string;
  title: string;
  description: string;
  points: number;
  point_unit: string;
  points_icon: string;
  icon: string;
  notification_text?: string;
}

interface SubCategoryItem {
  id: string;
  title: string;
  description: string;
  points: number;
  points_icon: string;
  point_unit: string;
  icon: string;
  notification_text?: string;
}

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  tagline?: string;
  icon: any;
  color: string;
  badges: BadgeOption[];
}

interface AppreciationModalProps {
  visible: boolean;
  onClose: () => void;
  onSendBadge: (categoryId: string, badgeId: string, badgeTitle: string, badgeIcon: string, points: number, pointsIcon: string, description: string, notificationText: string) => void;
}

// Hardcoded data is removed. We will fetch this from Supabase.

export default function AppreciationModal({
  visible,
  onClose,
  onSendBadge,
}: AppreciationModalProps) {
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeOption | null>(null);
  
  // Fetch categories from database
  const { data: dbCategories, isLoading: categoriesLoading } = useCategories('appreciation');

  useEffect(() => {
    if (visible) {
      fetchAppreciationTemplates();
    }
  }, [visible]);

  useEffect(() => {
    // Group badges by category when both data sources are ready
    if (dbCategories && badges.length > 0) {
      const groupedData = groupBadgesByCategory(badges, dbCategories);
      setCategories(groupedData);
    }
  }, [dbCategories, badges]);

  const fetchAppreciationTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('appreciation_templates').select('*');

    if (error) {
      Alert.alert('Error', 'Could not fetch appreciation badges.');
      console.error(error);
    } else {
      setBadges(data || []);
    }
    setLoading(false);
  };
  
  // This function will group the flat list of badges from the DB into categories
  const groupBadgesByCategory = (badges: any[], categories: any[]): SubCategory[] => {
      const categoryMap: { [key: string]: SubCategory } = {};
      
      // Initialize categories from database
      categories.forEach(cat => {
          categoryMap[cat.id] = {
              id: cat.id,
              name: cat.name,
              description: cat.description,
              tagline: cat.tagline,
              icon: cat.icon,
              color: cat.color,
              badges: []
          };
      });

      badges.forEach(badge => {
          if (categoryMap[badge.category_id]) {
              categoryMap[badge.category_id].badges.push({
                  id: badge.id,
                  title: badge.title,
                  description: badge.description,
                  points: badge.points,
                  point_unit: badge.point_unit,
                  points_icon: badge.points_icon,
                  icon: badge.icon,
                  notification_text: badge.notification_text,
              });
          }
      });
      return Object.values(categoryMap);
  };


  const handleClose = () => {
    setSelectedCategory(null);
    setSelectedBadge(null);
    onClose();
  };

  const handleSendBadge = () => {
    if (selectedCategory && selectedBadge) {
      onSendBadge(
        selectedCategory,
        selectedBadge.id,
        selectedBadge.title,
        selectedBadge.icon,
        selectedBadge.points,
        selectedBadge.points_icon,
        selectedBadge.description,
        selectedBadge.notification_text || ''
      );
      handleClose();
    }
  };

  const renderCategorySelection = () => (
    <View style={styles.categorySelection}>
      {(loading || categoriesLoading) ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }}/>
      ) : (
        <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { borderLeftColor: category.color }]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}>
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
                  <IconComponent color={category.color} size={24} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryBadgeCount}>
                    {getCategoryDescription(category)}
                  </Text>
                </View>
                <View style={styles.categoryArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  // Short tagline in the header
  const getCategoryHeaderSubtext = (category: SubCategory): string => {
    // Use database tagline if available, otherwise show badge count
    return category.tagline || `${category.badges.length} ways to appreciate`;
  };

  // Description on category selection cards
  const getCategoryDescription = (category: SubCategory): string => {
    // Use database description if available, otherwise show count
    if (category.description) {
      return category.description;
    }
    const badgeCount = category.badges.length;
    if (badgeCount === 0) return 'No badges available';
    if (badgeCount === 1) return '1 appreciation option';
    return `${badgeCount} appreciation options`;
  };

  const renderBadgeSelection = () => {
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return null;

    const IconComponent = category.icon;

    return (
      <View style={styles.badgeSelection}>
        <View style={styles.badgeHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.categoryHeaderInfo}>
            <View style={[styles.categoryHeaderIcon, { backgroundColor: category.color + '20' }]}>
              <IconComponent color={category.color} size={24} />
            </View>
            <View style={styles.categoryHeaderTextContainer}>
              <Text style={styles.categoryHeaderName}>{category.name}</Text>
              <Text style={styles.categoryHeaderSubtitle}>{getCategoryHeaderSubtext(category)}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.badgesList} showsVerticalScrollIndicator={false}>
          {category.badges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeCard,
                selectedBadge?.id === badge.id && styles.selectedBadgeCard,
              ]}
              onPress={() => setSelectedBadge(selectedBadge?.id === badge.id ? null : badge)}
              activeOpacity={0.7}>
              <View style={styles.badgeCardContent}>
                {/* Icon on the left */}
                <View style={styles.badgeIconContainer}>
                  <Text style={styles.badgeEmoji}>{badge.icon || '🐝'}</Text>
                </View>
                
                {/* Content on the right */}
                <View style={styles.badgeRightContent}>
                  {/* Points badge at the top - only show when selected */}
                  {selectedBadge?.id === badge.id && (
                    <View style={styles.badgePointsRow}>
                      <View style={styles.badgePointsContainer}>
                        <Text style={styles.badgePointsText}>
                          {badge.points} {badge.points_icon}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Title and Description */}
                  <View style={styles.badgeTextContainer}>
                    <Text style={styles.badgeTitle} numberOfLines={1} ellipsizeMode="tail">
                      {badge.title}
                    </Text>
                    <Text style={styles.badgeDescription} numberOfLines={2} ellipsizeMode="tail">
                      {badge.description || ' '}
                    </Text>
                  </View>
                  
                  {/* Selected indicator */}
                  {selectedBadge?.id === badge.id && (
                    <View style={styles.selectedIndicator}>
                      <Sparkles color={category.color} size={14} />
                      <Text style={[styles.selectedText, { color: category.color }]}>Selected</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedBadge && (
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: category.color }]}
              onPress={handleSendBadge}
              activeOpacity={0.8}>
              <Heart color="white" size={20} />
              <Text style={styles.sendButtonText}>
                Send Appreciation
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {selectedCategory ? (
          renderBadgeSelection()
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Send Appreciation</Text>
                <Text style={styles.headerSubtitle}>
                  Show your partner how much you appreciate them
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>
            {renderCategorySelection()}
          </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm,
  },
  headerTitle: {
    ...ComponentStyles.modal.headerTitle,
  },
  headerSubtitle: {
    ...ComponentStyles.modal.headerSubtitle,
    marginRight: Spacing.md,
  },
  categorySelection: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  modalTitle: {
    ...ComponentStyles.text.h2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  modalSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.relaxed,
  },
  categoriesList: {
    flex: 1,
  },
  categoryCard: {
    ...ComponentStyles.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.xs,
  },
  categoryBadgeCount: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  categoryArrow: {
    marginLeft: Spacing.md,
  },
  arrowText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textTertiary,
  },
  badgeSelection: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.lg,
    marginHorizontal: -Layout.screenPadding,
    paddingHorizontal: Layout.screenPadding,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  categoryHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  categoryHeaderTextContainer: {
    flex: 1,
  },
  categoryHeaderName: {
    ...ComponentStyles.text.h3,
    marginBottom: 2,
  },
  categoryHeaderSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  badgesList: {
    flex: 1,
  },
  badgeCard: {
    ...ComponentStyles.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 80,
  },
  selectedBadgeCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
    borderWidth: 2,
  },
  badgeCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  badgeEmoji: {
    fontSize: Typography.fontSize.xl,
  },
  badgeRightContent: {
    flex: 1,
    justifyContent: 'center',
  },
  badgePointsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  badgePointsContainer: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    minWidth: 50,
    alignItems: 'center',
  },
  badgePointsText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  badgeTextContainer: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
    minHeight: Typography.lineHeight.tight * 2, // Dynamic height for 2 lines
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
  sendButtonContainer: {
    paddingVertical: Spacing.lg,
  },
  sendButton: {
    ...ComponentStyles.button.primary,
    height: 'auto',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  sendButtonText: {
    ...ComponentStyles.button.text.primary,
    marginLeft: Spacing.sm,
  },
});