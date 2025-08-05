import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Video,
  Mail,
  MessageCircle,
  ChevronRight,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface HelpOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: () => void;
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  const handleContactSupport = async () => {
    const email = 'support@gratitudebee.com';
    const subject = 'Help Request - Gratitude Bee App';
    const body = 'Hi Gratitude Bee Team,\n\nI need help with:\n\n[Please describe your issue or question here]';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('No Email App', 'Please install an email app to contact support, or email us at support@gratitudebee.com');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email app. Please email us at support@gratitudebee.com');
    }
  };

  const helpOptions: HelpOption[] = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Find quick answers to common questions about features, account, and more',
      icon: BookOpen,
      color: Colors.primary,
      action: () => router.push('/(more)/faq'),
    },
    {
      id: 'videos',
      title: 'Video Guides',
      description: 'Watch step-by-step tutorials to learn how to use every feature',
      icon: Video,
      color: Colors.info,
      action: () => router.push('/(more)/video-guides'),
    },
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Can\'t find what you\'re looking for? Reach out to our support team',
      icon: Mail,
      color: Colors.success,
      action: handleContactSupport,
    },
  ];

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color={Colors.textSecondary} size={Layout.iconSize.lg} />
            </TouchableOpacity>
            <HelpCircle color={Colors.primary} size={Layout.iconSize.xl} />
            <Text style={styles.title}>Help Center</Text>
          </View>
          <View />
        </View>
        <Text style={styles.subtitle}>How can we help you today?</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <MessageCircle color={Colors.primary} size={40} />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to Help Center</Text>
          <Text style={styles.welcomeText}>
            Choose from the options below to get the help you need. We're here to make your experience with Gratitude Bee amazing!
          </Text>
        </View>

        {/* Help Options */}
        <View style={styles.optionsSection}>
          {helpOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
                  <IconComponent color={option.color} size={32} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <ChevronRight color={Colors.textTertiary} size={20} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          <View style={styles.tip}>
            <Text style={styles.tipEmoji}>💡</Text>
            <Text style={styles.tipText}>
              Most questions can be answered in our FAQ section
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipEmoji}>🎥</Text>
            <Text style={styles.tipText}>
              Video guides show you exactly how to use each feature
            </Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.tipEmoji}>✉️</Text>
            <Text style={styles.tipText}>
              Our support team typically responds within 24 hours
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fixedHeaderContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: Spacing.sm,
    margin: -Spacing.sm,
    marginRight: Spacing.md,
  },
  title: {
    ...ComponentStyles.text.h2,
    marginLeft: Spacing.md,
  },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  
  // Welcome Section
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Layout.screenPadding,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    ...ComponentStyles.text.h2,
    marginBottom: Spacing.sm,
  },
  welcomeText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.5,
  },
  
  // Options Section
  optionsSection: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  
  // Tips Section
  tipsSection: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  tipsTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tipEmoji: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  tipText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    flex: 1,
  },
});