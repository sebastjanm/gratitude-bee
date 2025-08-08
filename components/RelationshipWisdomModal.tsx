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
import { X, CheckCircle, Heart, MessageCircle, Users, TreePine, Sparkles } from 'lucide-react-native';
import { supabase } from '@/utils/supabase'; // Assuming supabase client is here
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';
import { useCategories } from '@/hooks/useCategories';

const { width } = Dimensions.get('window');

interface WisdomOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category_id?: string;
}

interface RelationshipWisdomModalProps {
  visible: boolean;
  onClose: () => void;
  onSendWisdom: (wisdom: WisdomOption) => void;
}

// Icon mapping for categories from database
const categoryIcons: { [key: string]: any } = {
  'wisdom-love': Heart,
  'wisdom-communication': MessageCircle,
  'wisdom-conflict': Users,
  'wisdom-growth': TreePine,
};

export default function RelationshipWisdomModal({
  visible,
  onClose,
  onSendWisdom,
}: RelationshipWisdomModalProps) {
  const [wisdomOptions, setWisdomOptions] = useState<WisdomOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWisdom, setSelectedWisdom] = useState<WisdomOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Fetch categories from database
  const { data: categories, isLoading: categoriesLoading } = useCategories('wisdom');

  useEffect(() => {
    const fetchWisdomTemplates = async () => {
      if (visible) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('wisdom_templates')
            .select('*, category_id')
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


  // Filter templates by selected category
  const filteredWisdomOptions = wisdomOptions.filter(wisdom => 
    selectedCategory === 'all' || wisdom.category_id === selectedCategory
  );

  const handleClose = () => {
    setSelectedWisdom(null);
    setSelectedCategory('all');
    onClose();
  };

  const handleSendWisdom = () => {
    if (selectedWisdom) {
      onSendWisdom(selectedWisdom);
      handleClose();
    }
  };

  const renderCategoryFilter = () => {
    if (!categories || categoriesLoading) return null;
    
    // Build categoryDetails from database
    const categoryDetails: any = {
      all: { name: 'All', icon: Sparkles, color: Colors.primary }
    };
    
    categories.forEach(cat => {
      categoryDetails[cat.id] = {
        name: cat.name,
        icon: categoryIcons[cat.id] || Sparkles,
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
        {filteredWisdomOptions.map((wisdom) => (
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

          {renderCategoryFilter()}

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
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
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