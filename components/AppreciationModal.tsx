import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { X, Heart, Star, Smile, Compass, MessageCircle, CircleCheck as CheckCircle, Crown, Chrome as Home, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface BadgeOption {
  id: string;
  title: string;
  description: string;
  beeCount: number;
  icon: string;
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
  onSendBadge: (categoryId: string, badgeId: string, badgeTitle: string) => void;
}

const appreciationCategories: SubCategory[] = [
  {
    id: 'support',
    name: 'Support',
    icon: Star,
    color: '#4ECDC4',
    badges: [
      {
        id: 'amazing-work',
        title: 'Amazing Work',
        description: 'Recognizing exceptional effort and dedication',
        beeCount: 3,
        icon: '🐝',
      },
      {
        id: 'you-are-best',
        title: 'You Are The Best',
        description: 'Ultimate appreciation for being incredible',
        beeCount: 5,
        icon: '🐝',
      },
      {
        id: 'believe-in-you',
        title: 'I Believe In You',
        description: 'Encouraging during challenging times',
        beeCount: 2,
        icon: '🐝',
      },
      {
        id: 'proud-of-you',
        title: 'So Proud Of You',
        description: 'Celebrating achievements and milestones',
        beeCount: 4,
        icon: '🐝',
      },
    ],
  },
  {
    id: 'kindness',
    name: 'Kindness',
    icon: Heart,
    color: '#FF6B9D',
    badges: [
      {
        id: 'thank-you-much',
        title: 'Thank You Very Much',
        description: 'Deep gratitude for thoughtful actions',
        beeCount: 1,
        icon: '🦋',
      },
      {
        id: 'thanks-coffee',
        title: 'Thanks For Coffee',
        description: 'Appreciating morning thoughtfulness',
        beeCount: 2,
        icon: '🦋',
      },
      {
        id: 'gentle-heart',
        title: 'Your Gentle Heart',
        description: 'Recognizing natural compassion',
        beeCount: 3,
        icon: '🦋',
      },
      {
        id: 'caring-soul',
        title: 'Beautiful Caring Soul',
        description: 'Honoring deep empathy and care',
        beeCount: 4,
        icon: '🦋',
      },
    ],
  },
  {
    id: 'humor',
    name: 'Humor',
    icon: Smile,
    color: '#FFD93D',
    badges: [
      {
        id: 'lol',
        title: 'LOL',
        description: 'Simple moment of laughter',
        beeCount: 1,
        icon: '😄',
      },
      {
        id: 'rofl',
        title: 'ROFL',
        description: 'Rolling on the floor laughing',
        beeCount: 3,
        icon: '😄',
      },
      {
        id: 'made-me-laugh',
        title: 'Made Me Laugh',
        description: 'Bringing joy with perfect timing',
        beeCount: 2,
        icon: '😄',
      },
      {
        id: 'silly-dance',
        title: 'Silly Dance Master',
        description: 'Spontaneous moments of pure fun',
        beeCount: 3,
        icon: '😄',
      },
      {
        id: 'comedy-genius',
        title: 'Comedy Genius',
        description: 'Natural talent for making others smile',
        beeCount: 4,
        icon: '😄',
      },
      {
        id: 'brightened-day',
        title: 'Brightened My Day',
        description: 'Turning ordinary moments into joy',
        beeCount: 3,
        icon: '😄',
      },
    ],
  },
  {
    id: 'adventure',
    name: 'Adventure',
    icon: Compass,
    color: '#6BCF7F',
    badges: [
      {
        id: 'sunset-walk',
        title: 'Perfect Sunset Walk',
        description: 'Creating magical shared moments',
        beeCount: 3,
        icon: '🌅',
      },
      {
        id: 'new-place',
        title: 'Found New Place',
        description: 'Discovering hidden gems together',
        beeCount: 4,
        icon: '🌅',
      },
      {
        id: 'spontaneous-trip',
        title: 'Spontaneous Adventure',
        description: 'Embracing unexpected journeys',
        beeCount: 5,
        icon: '🌅',
      },
      {
        id: 'nature-lover',
        title: 'Nature Connection',
        description: 'Sharing love for the outdoors',
        beeCount: 2,
        icon: '🌅',
      },
    ],
  },
  {
    id: 'words',
    name: 'Love Notes',
    icon: MessageCircle,
    color: '#A8E6CF',
    badges: [
      {
        id: 'you-are-everything',
        title: 'You Are My Everything',
        description: 'Complete devotion and love',
        beeCount: 3,
        icon: '❤️',
      },
      {
        id: 'thinking-of-you',
        title: 'Thinking Of You',
        description: 'Constant presence in thoughts',
        beeCount: 1,
        icon: '💓',
      },
      {
        id: 'sweet-message',
        title: 'Sweet Message',
        description: 'Perfect words at the right time',
        beeCount: 2,
        icon: '💌',
      },
      {
        id: 'morning-text',
        title: 'Beautiful Morning Text',
        description: 'Starting the day with love',
        beeCount: 3,
        icon: '💌',
      },
      {
        id: 'love-letter',
        title: 'Heartfelt Love Letter',
        description: 'Deep emotional expression',
        beeCount: 5,
        icon: '💌',
      },
      {
        id: 'encouraging-words',
        title: 'Encouraging Words',
        description: 'Lifting spirits with kindness',
        beeCount: 3,
        icon: '💌',
      },
    ],
  },
  {
    id: 'whatever-you-say',
    name: 'Whatever You Say',
    icon: CheckCircle,
    color: '#9B59B6',
    badges: [
      {
        id: 'movie-choice',
        title: 'Your Movie Pick',
        description: 'Letting you choose without debate',
        beeCount: 2,
        icon: '🎬',
      },
      {
        id: 'restaurant-choice',
        title: 'Restaurant Decision',
        description: 'Trusting your dining preferences',
        beeCount: 2,
        icon: '🎬',
      },
      {
        id: 'weekend-plans',
        title: 'Weekend Plans',
        description: 'Following your lead on activities',
        beeCount: 3,
        icon: '🎬',
      },
      {
        id: 'vacation-spot',
        title: 'Vacation Destination',
        description: 'Trusting your travel vision',
        beeCount: 4,
        icon: '🎬',
      },
    ],
  },
  {
    id: 'yes-dear',
    name: 'Yes, Dear',
    icon: Crown,
    color: '#E67E22',
    badges: [
      {
        id: 'rearrange-furniture',
        title: 'Rearrange Furniture',
        description: 'Helping with home improvements',
        beeCount: 2,
        icon: '👑',
      },
      {
        id: 'shopping-trip',
        title: 'Shopping Companion',
        description: 'Patient shopping partnership',
        beeCount: 3,
        icon: '👑',
      },
      {
        id: 'family-event',
        title: 'Family Event Attendance',
        description: 'Supporting family commitments',
        beeCount: 4,
        icon: '👑',
      },
      {
        id: 'home-project',
        title: 'Home Project Helper',
        description: 'Tackling tasks together',
        beeCount: 3,
        icon: '👑',
      },
    ],
  },
  {
    id: 'happy-wife',
    name: 'Happy Wife, Happy Life',
    icon: Home,
    color: '#27AE60',
    badges: [
      {
        id: 'anniversary-dinner',
        title: 'Remembered Anniversary',
        description: 'Never forgetting special dates',
        beeCount: 5,
        icon: '🏠',
      },
      {
        id: 'favorite-dessert',
        title: 'Favorite Dessert Surprise',
        description: 'Thoughtful sweet gestures',
        beeCount: 3,
        icon: '🏠',
      },
      {
        id: 'flowers-surprise',
        title: 'Surprise Flowers',
        description: 'Unexpected romantic gestures',
        beeCount: 4,
        icon: '🏠',
      },
      {
        id: 'listening-ear',
        title: 'Perfect Listening Ear',
        description: 'Being fully present and attentive',
        beeCount: 3,
        icon: '🏠',
      },
    ],
  },
];

export default function AppreciationModal({
  visible,
  onClose,
  onSendBadge,
}: AppreciationModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeOption | null>(null);

  const handleClose = () => {
    setSelectedCategory(null);
    setSelectedBadge(null);
    onClose();
  };

  const handleSendBadge = () => {
    if (selectedCategory && selectedBadge) {
      onSendBadge(selectedCategory, selectedBadge.id, selectedBadge.title);
      handleClose();
    }
  };

  const renderCategorySelection = () => (
    <View style={styles.categorySelection}>
      <Text style={styles.modalTitle}>Select Appreciation</Text>
      <Text style={styles.modalSubtitle}>
        Select the type of appreciation you want to share
      </Text>
      
      <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
        {appreciationCategories.map((category) => {
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
    </View>
  );

  const renderBadgeSelection = () => {
    const category = appreciationCategories.find(c => c.id === selectedCategory);
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
                    <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                  </View>
                  <View style={styles.badgeTitleContainer}>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <View style={styles.badgeCountRow}>
                      <Text style={styles.badgeCountText}>
                        {badge.beeCount} {badge.icon}
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Appreciation</Text>
          <View style={styles.placeholder} />
        </View>

        {selectedCategory ? renderBadgeSelection() : renderCategorySelection()}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  placeholder: {
    width: 40,
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