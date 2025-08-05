import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Heart,
  Gift,
  Settings,
  LucideIcon,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

interface FAQ {
  q: string;
  a: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  color: string;
  description: string;
  faqs: FAQ[];
}

const faqCategories: FAQCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Users,
    color: '#4ECDC4',
    description: 'Setup and basic features',
    faqs: [
      {
        q: 'What is Gratitude Bee?',
        a: 'Gratitude Bee is an app designed to help couples strengthen their relationship by making it easy and fun to share appreciation, ask for favors, and communicate effectively.',
      },
      {
        q: 'How do I connect with my partner?',
        a: 'On the "Profile" screen, tap "Invite Partner." You can then share your unique invite link or have your partner scan your QR code.',
      },
      {
        q: 'How do I know if my partner received my invitation?',
        a: 'Once your partner accepts the invitation, you\'ll see their profile information and be able to send messages. You\'ll also receive a notification.',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features & Usage',
    icon: Heart,
    color: '#FF6B9D',
    description: 'How to use app features',
    faqs: [
      {
        q: 'What\'s the difference between an Appreciation and a Favor?',
        a: 'Appreciations are simple thank-yous that show gratitude. Favors are requests for help that cost favor points, which your partner earns upon completion.',
      },
      {
        q: 'How do I send an appreciation badge?',
        a: 'From the home screen, tap the heart icon to open the appreciation modal. Choose a category and specific badge that matches what you want to appreciate.',
      },
      {
        q: 'What are Hornets and when should I use them?',
        a: 'Hornets are gentle accountability messages for when something bothers you. Use them to communicate concerns constructively rather than letting issues build up.',
      },
    ],
  },
  {
    id: 'points-system',
    title: 'Points & Economy',
    icon: Gift,
    color: '#FFD93D',
    description: 'Understanding favor points',
    faqs: [
      {
        q: 'How do favor points work?',
        a: 'You earn favor points when your partner appreciates you. You spend points to request favors. This creates a balanced give-and-take dynamic.',
      },
      {
        q: 'What happens if I don\'t have enough points for a favor?',
        a: 'You\'ll need to earn more points by receiving appreciations from your partner before you can request that favor.',
      },
      {
        q: 'Do points expire?',
        a: 'No, favor points don\'t expire. You can save them up for bigger requests or use them for small daily favors.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: Settings,
    color: '#9B59B6',
    description: 'Common issues and solutions',
    faqs: [
      {
        q: 'My partner isn\'t receiving notifications',
        a: 'Check that notifications are enabled in your device settings for Gratitude Bee. Also ensure you both have a stable internet connection.',
      },
      {
        q: 'I can\'t see my partner\'s messages',
        a: 'Try pulling down on the timeline to refresh. If the issue persists, check your internet connection and restart the app.',
      },
      {
        q: 'How do I disconnect from my partner?',
        a: 'Go to Profile > Settings > Disconnect Partner. Note that this will remove all shared data and cannot be undone.',
      },
    ],
  },
];

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);

  const handleCategoryPress = (category: FAQCategory) => {
    setSelectedCategory(category);
  };

  const renderCategories = () => (
    <View style={styles.categoryGrid}>
      {faqCategories.map((category) => {
        const IconComponent = category.icon;
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { borderColor: category.color + '30' }]}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <IconComponent color="white" size={24} />
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <View style={styles.categoryFooter}>
              <Text style={styles.faqCount}>{category.faqs.length} FAQs</Text>
              <ChevronRight color={Colors.textTertiary} size={20} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderFAQs = () => {
    if (!selectedCategory) return null;

    return (
      <View style={styles.faqContainer}>
        {selectedCategory.faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => selectedCategory ? setSelectedCategory(null) : router.back()} 
          style={styles.backButton}
        >
          <ChevronLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedCategory ? selectedCategory.title : 'FAQ'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {selectedCategory ? renderFAQs() : renderCategories()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    margin: -Spacing.sm,
  },
  title: {
    ...ComponentStyles.text.h2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.screenPadding,
  },
  
  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - (Layout.screenPadding * 2) - Spacing.md) / 2,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    ...Shadows.sm,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqCount: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
  },
  
  // FAQ Items
  faqContainer: {
    flex: 1,
  },
  faqItem: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  faqQuestion: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  faqAnswer: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.base * 1.5,
  },
});