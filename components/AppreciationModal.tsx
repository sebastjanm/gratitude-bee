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
import { X, Heart, Star, Smile, Compass, MessageCircle, Sparkles } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeOption | null>(null);

  useEffect(() => {
    if (visible) {
      fetchAppreciationTemplates();
    }
  }, [visible]);

  const fetchAppreciationTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('appreciation_templates').select('*');

    if (error) {
      Alert.alert('Error', 'Could not fetch appreciation badges.');
      console.error(error);
    } else {
      const groupedData = groupBadgesByCategory(data);
      setCategories(groupedData);
    }
    setLoading(false);
  };
  
  // This function will group the flat list of badges from the DB into categories
  const groupBadgesByCategory = (badges: any[]): SubCategory[] => {
      const categoryMap: { [key: string]: SubCategory } = {
          support: { id: 'support', name: 'Support', icon: Star, color: '#4ECDC4', badges: [] },
          kindness: { id: 'kindness', name: 'Kindness', icon: Heart, color: '#FF6B9D', badges: [] },
          humor: { id: 'humor', name: 'Humor', icon: Smile, color: '#FFD93D', badges: [] },
          adventure: { id: 'adventure', name: 'Adventure', icon: Compass, color: '#6BCF7F', badges: [] },
          words: { id: 'words', name: 'Love Notes', icon: MessageCircle, color: '#A8E6CF', badges: [] },
      };

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
      {loading ? (
        <ActivityIndicator size="large" color="#FF8C42" style={{ flex: 1 }}/>
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
                    {category.badges.length} appreciation options
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
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.categoryHeaderInfo}>
            <View style={[styles.categoryHeaderIcon, { backgroundColor: category.color + '20' }]}>
              <IconComponent color={category.color} size={20} />
            </View>
            <Text style={styles.categoryHeaderName}>{category.name}</Text>
          </View>
        </View>

        <Text style={styles.badgeSelectionTitle}>Choose Your Badge</Text>
        <Text style={styles.badgeSelectionSubtitle}>
          Each badge carries different meaning and value
        </Text>

        <ScrollView style={styles.badgesList} showsVerticalScrollIndicator={false}>
          {category.badges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={[
                styles.badgeCard,
                selectedBadge?.id === badge.id && styles.selectedBadgeCard,
              ]}
              onPress={() => setSelectedBadge(badge)}
              activeOpacity={0.7}>
              <View style={styles.badgeCardHeader}>
                <View style={styles.badgeIconAndTitle}>
                  <View style={styles.badgeIconContainer}>
                    <Text style={styles.badgeEmoji}>{badge.icon || '🐝'}</Text>
                  </View>
                  <View style={styles.badgeTitleContainer}>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <View style={styles.badgeCountRow}>
                      <Text style={styles.badgeCountText}>
                        {badge.points} {badge.points_icon}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <Text style={styles.badgeDescription}>{badge.description}</Text>
              
              <View style={styles.badgeFooter}>
                {selectedBadge?.id === badge.id && (
                  <View style={styles.selectedIndicator}>
                    <Sparkles color={category.color} size={16} />
                    <Text style={[styles.selectedText, { color: category.color }]}>Selected</Text>
                  </View>
                )}
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
                Send "{selectedBadge.title}" Badge
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
                  Recognize your partner by sending a badge from one of the categories below.
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
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 8,
    marginRight: -8, // Align icon better with edge
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
  },
  categorySelection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  categoriesList: {
    flex: 1,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  categoryBadgeCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  categoryArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: '#999',
  },
  badgeSelection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  categoryHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginRight: 40,
  },
  categoryHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryHeaderName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  badgeSelectionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  badgeSelectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 24,
  },
  badgesList: {
    flex: 1,
  },
  badgeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedBadgeCard: {
    borderColor: '#FF8C42',
    backgroundColor: '#FFF8F0',
  },
  badgeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeIconAndTitle: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  badgeEmoji: {
    fontSize: 20,
  },
  badgeTitleContainer: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  badgeCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeCountText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
  },
  badgeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
    marginLeft: 64, // Align with text content
    marginBottom: 8,
  },
  badgeFooter: {
    alignItems: 'flex-start',
    marginLeft: 64, // Align with text content
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  sendButtonContainer: {
    paddingVertical: 20,
  },
  sendButton: {
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
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});