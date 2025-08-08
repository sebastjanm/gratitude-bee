import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, HandHeart, Coffee, ShoppingCart, Car, Home as HomeIcon, Utensils, Gift, Plus, Coins, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

interface FavorOption {
  id: string;
  category_id: 'food' | 'errands' | 'help' | 'treats';
  title: string;
  description: string;
  points: number;
  icon: string;
}

const categoryDetails = {
  all: { name: 'All Favors', icon: HandHeart, color: Colors.primary },
  food: { name: 'Food & Drinks', icon: Coffee, color: '#8B4513' },
  errands: { name: 'Errands', icon: ShoppingCart, color: '#4ECDC4' },
  help: { name: 'Home Help', icon: HomeIcon, color: '#FFEAA7' },
  treats: { name: 'Treats', icon: Gift, color: '#FF69B4' },
};

interface FavorsModalProps {
  visible: boolean;
  onClose: () => void;
  onSendFavor: (favorId: string, favorTitle: string, points: number, description: string, customMessage?: string) => void;
  currentFavorPoints: number;
}

export default function FavorsModal({
  visible,
  onClose,
  onSendFavor,
  currentFavorPoints,
}: FavorsModalProps) {
  const [favorTemplates, setFavorTemplates] = useState<FavorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFavor, setSelectedFavor] = useState<FavorOption | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomFavor, setShowCustomFavor] = useState(false);
  const [customFavorTitle, setCustomFavorTitle] = useState('');
  const [customFavorPoints, setCustomFavorPoints] = useState(5);

  useEffect(() => {
    if (visible) {
      fetchFavorTemplates();
    }
  }, [visible]);

  const fetchFavorTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('favor_templates').select('*');
      if (error) {
        Alert.alert('Error', 'Could not fetch favor options.');
        console.error('Error fetching favor templates:', error);
      } else {
        setFavorTemplates(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFavors = favorTemplates.filter(favor => 
    selectedCategory === 'all' || favor.category_id === selectedCategory
  );

  const handleClose = () => {
    setSelectedFavor(null);
    setCustomMessage('');
    setShowCustomFavor(false);
    setCustomFavorTitle('');
    setCustomFavorPoints(5);
    setSelectedCategory('all');
    onClose();
  };

  const handleSendFavor = () => {
    if (selectedFavor) {
      onSendFavor(
        selectedFavor.id,
        selectedFavor.title,
        selectedFavor.points,
        selectedFavor.description,
        customMessage
      );
      handleClose();
    }
  };

  const handleSendCustomFavor = () => {
    if (customFavorTitle.trim()) {
      onSendFavor('custom', customFavorTitle, customFavorPoints, customMessage);
      handleClose();
    }
  };

  const renderCategoryFilter = () => (
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

  const renderFavorsList = () => (
    <ScrollView style={styles.favorsList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}>
      {/* Custom Favor Button */}
      <TouchableOpacity
        style={styles.customFavorButton}
        onPress={() => setShowCustomFavor(true)}>
        <View style={styles.customFavorIcon}>
          <Plus color={Colors.primary} size={24} />
        </View>
        <View style={styles.customFavorContent}>
          <Text style={styles.customFavorTitle}>Special Request</Text>
          <Text style={styles.customFavorDescription}>
            Ask for something unique or specific
          </Text>
        </View>
      </TouchableOpacity>

      {/* Predefined Favors */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading favors...</Text>
        </View>
      ) : filteredFavors.length === 0 ? (
        <View style={styles.noFavorsContainer}>
          <Text style={styles.noFavorsText}>No favors found for this category.</Text>
        </View>
      ) : (
        filteredFavors.map((favor) => {
          const categoryColor = categoryDetails[favor.category_id]?.color || Colors.primary;
          const isSelected = selectedFavor?.id === favor.id;
          return (
            <TouchableOpacity
              key={favor.id}
              style={[
                styles.favorCard,
                isSelected && styles.selectedFavorCard,
              ]}
              onPress={() => setSelectedFavor(favor)}
              activeOpacity={0.7}>
              <View style={styles.favorCardContent}>
                {/* Icon on the left */}
                <View style={[styles.favorIcon, { backgroundColor: categoryColor + '20' }]}>
                  <Text style={styles.favorEmoji}>{favor.icon}</Text>
                </View>
                
                {/* Content on the right */}
                <View style={styles.favorRightContent}>
                  <View style={styles.favorHeader}>
                    <View style={styles.favorInfo}>
                      <Text style={styles.favorTitle} numberOfLines={1}>{favor.title}</Text>
                      <Text style={styles.favorDescription} numberOfLines={2}>{favor.description}</Text>
                    </View>
                    <View style={styles.favorPoints}>
                      <Coins color={Colors.warning} size={16} />
                      <Text style={styles.favorPointsText}>{favor.points}</Text>
                    </View>
                  </View>
                  
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Sparkles color={categoryColor} size={14} />
                      <Text style={[styles.selectedText, { color: categoryColor }]}>Selected</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  const renderCustomFavorForm = () => (
    <View style={styles.customFavorForm}>
      <View style={styles.customFormHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowCustomFavor(false)}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.customFormTitleContainer}>
          <Text style={styles.customFormTitle}>Special Request</Text>
          <Text style={styles.customFormSubtitle}>Ask for something not in the categories</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>What do you need?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Pick up my dry cleaning"
          value={customFavorTitle}
          onChangeText={setCustomFavorTitle}
          maxLength={150}
        />
        <Text style={styles.characterCount}>{customFavorTitle.length}/150</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>How many points is this worth?</Text>
        <View style={styles.pointsGrid}>
          {[5, 10, 15, 25, 50, 100].map((points) => (
            <TouchableOpacity
              key={points}
              style={[
                styles.pointsGridItem,
                customFavorPoints === points && styles.selectedPointsGridItem,
              ]}
              onPress={() => setCustomFavorPoints(points)}>
              <Text style={[
                styles.pointsGridText,
                customFavorPoints === points && styles.selectedPointsGridText,
              ]}>
                {points}
              </Text>
              <View style={styles.pointsIconContainer}>
                <Coins color={customFavorPoints === points ? Colors.white : Colors.warning} size={14} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>


      <View style={styles.sendCustomButtonContainer}>
        <TouchableOpacity
          style={[
            styles.sendCustomButton,
            !customFavorTitle.trim() && styles.disabledButton,
          ]}
          onPress={handleSendCustomFavor}
          disabled={!customFavorTitle.trim()}>
          <HandHeart color={Colors.white} size={20} />
          <Text style={styles.sendCustomButtonText}>
            Request Favor ({customFavorPoints} points)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {showCustomFavor ? (
          renderCustomFavorForm()
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Request a Favor</Text>
                <Text style={styles.headerSubtitle}>
                  Use your favor points to ask for help. Your partner earns them when the favor is done.
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X color={Colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            {renderCategoryFilter()}
            {renderFavorsList()}

            {selectedFavor && (
              <View style={styles.messageSection}>
                <Text style={styles.messageLabel}>Add a personal message (optional)</Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Please and thank you! 🙏"
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  maxLength={100}
                />
                <Text style={styles.characterCount}>{customMessage.length}/100</Text>
              </View>
            )}
          </View>
        )}

        {selectedFavor && !showCustomFavor && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: categoryDetails[selectedFavor.category_id]?.color || Colors.primary }]}
              onPress={handleSendFavor}
              activeOpacity={0.8}>
              <HandHeart color={Colors.white} size={20} />
              <Text style={styles.fixedSendButtonText}>
                Send request
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: 50, // Reduced for more space
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: -Spacing.sm, // Align icon better with edge
  },
  headerTitle: {
    ...ComponentStyles.modal.headerTitle,
  },
  headerSubtitle: {
    ...ComponentStyles.modal.headerSubtitle,
    marginRight: Spacing.md,
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
    paddingVertical: Spacing.sm
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
  favorsList: {
    paddingHorizontal: Layout.screenPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  noFavorsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  noFavorsText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  customFavorButton: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    minHeight: 76,
  },
  customFavorIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  customFavorContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  customFavorTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  customFavorDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  favorCard: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'visible', // Ensure content is not clipped
  },
  selectedFavorCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  favorCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favorRightContent: {
    flex: 1,
  },
  favorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  favorIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  favorEmoji: {
    fontSize: Typography.fontSize.xl,
  },
  favorInfo: {
    flex: 1,
    marginRight: Spacing.sm,
    justifyContent: 'center',
  },
  favorTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  favorDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.tight,
    marginTop: 2,
  },
  favorPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    minHeight: 24,
    minWidth: 32,
    justifyContent: 'center',
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  favorPointsText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginLeft: Spacing.xs,
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
    marginBottom: Spacing.xs,
    minHeight: 44, // Apple HIG minimum touch target
  },
  characterCount: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  customFavorForm: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  customFormHeader: {
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
  customFormTitleContainer: {
    flex: 1,
  },
  customFormTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: 2,
  },
  customFormSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  formLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pointsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pointsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44, // Apple HIG minimum touch target touch target
    minWidth: 56,  // Slightly wider for better visual balance
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  selectedPointsOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pointsOptionText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  selectedPointsOptionText: {
    color: Colors.white,
  },
  pointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    marginHorizontal: -Spacing.xs,
  },
  pointsGridItem: {
    width: '30%',
    aspectRatio: 1.5,
    margin: '1.66%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  selectedPointsGridItem: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pointsGridText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  selectedPointsGridText: {
    color: Colors.white,
  },
  pointsIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendCustomButtonContainer: {
    paddingVertical: Spacing.lg,
    marginTop: 'auto',
  },
  sendCustomButton: {
    ...ComponentStyles.button.primary,
    height: 'auto',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  disabledButton: {
    backgroundColor: Colors.gray400,
  },
  sendCustomButtonText: {
    ...ComponentStyles.button.text.primary,
    marginLeft: Spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedSendButtonText: {
    ...ComponentStyles.button.text.primary,
    marginLeft: Spacing.sm,
  },
});