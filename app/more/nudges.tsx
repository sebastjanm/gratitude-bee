import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Bell,
  Heart,
  MessageCircle,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface NudgeType {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  defaultEnabled: boolean;
  frequency: string;
  example: string;
}

const nudgeTypes: NudgeType[] = [
  {
    id: 'appreciation_reminder',
    title: 'Appreciation Reminder',
    description: 'Gentle reminder to send appreciation when you haven\'t in a while',
    icon: Heart,
    color: Colors.primary,
    defaultEnabled: true,
    frequency: 'After 3 days of inactivity',
    example: '"Hey! Your partner might love hearing from you today 💝"',
  },
  {
    id: 'milestone_celebration',
    title: 'Milestone Celebrations',
    description: 'Celebrate relationship milestones and streaks',
    icon: TrendingUp,
    color: Colors.success,
    defaultEnabled: true,
    frequency: 'On achievement days',
    example: '"You\'re on a 7-day streak! Keep the love flowing 🎉"',
  },
  {
    id: 'conversation_starter',
    title: 'Conversation Starters',
    description: 'Suggest topics to appreciate about your partner',
    icon: MessageCircle,
    color: Colors.info,
    defaultEnabled: false,
    frequency: 'Weekly on quiet days',
    example: '"Why not thank them for their patience today?"',
  },
  {
    id: 'peak_time',
    title: 'Peak Time Nudges',
    description: 'Remind you during your most active times',
    icon: Clock,
    color: Colors.warning,
    defaultEnabled: false,
    frequency: 'Based on your usage pattern',
    example: '"It\'s 8 PM - your usual appreciation time!"',
  },
  {
    id: 'reciprocity_boost',
    title: 'Reciprocity Booster',
    description: 'Encourage responding to partner\'s appreciations',
    icon: Users,
    color: '#8B5CF6',
    defaultEnabled: true,
    frequency: 'After receiving appreciation',
    example: '"Your partner sent you love! Send some back? 💕"',
  },
  {
    id: 'surprise_moments',
    title: 'Surprise Moments',
    description: 'Random nudges for spontaneous appreciation',
    icon: Sparkles,
    color: '#EC4899',
    defaultEnabled: false,
    frequency: 'Random 1-2x per week',
    example: '"Surprise them with unexpected appreciation!"',
  },
];

export default function NudgesScreen() {
  const insets = useSafeAreaInsets();
  const [nudgesEnabled, setNudgesEnabled] = useState(true);
  const [enabledNudgeTypes, setEnabledNudgeTypes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNudgeSettings();
  }, []);

  const loadNudgeSettings = async () => {
    try {
      const nudgeStatus = await AsyncStorage.getItem('nudges_enabled');
      setNudgesEnabled(nudgeStatus !== 'false');

      const savedTypes = await AsyncStorage.getItem('nudge_types');
      if (savedTypes) {
        setEnabledNudgeTypes(JSON.parse(savedTypes));
      } else {
        // Set defaults
        const defaults: Record<string, boolean> = {};
        nudgeTypes.forEach(nudge => {
          defaults[nudge.id] = nudge.defaultEnabled;
        });
        setEnabledNudgeTypes(defaults);
      }
    } catch (error) {
      console.error('Error loading nudge settings:', error);
    }
  };

  const handleMasterToggle = async (value: boolean) => {
    setNudgesEnabled(value);
    try {
      await AsyncStorage.setItem('nudges_enabled', value.toString());
      if (!value) {
        Alert.alert(
          'Nudges Disabled',
          'You won\'t receive any nudge notifications. You can always turn them back on!',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save setting. Please try again.');
    }
  };

  const handleNudgeTypeToggle = async (nudgeId: string, value: boolean) => {
    const updated = { ...enabledNudgeTypes, [nudgeId]: value };
    setEnabledNudgeTypes(updated);
    
    try {
      await AsyncStorage.setItem('nudge_types', JSON.stringify(updated));
    } catch (error) {
      Alert.alert('Error', 'Failed to save setting. Please try again.');
    }
  };

  const renderNudgeType = (nudge: NudgeType) => {
    const IconComponent = nudge.icon;
    const isEnabled = enabledNudgeTypes[nudge.id] ?? nudge.defaultEnabled;
    
    return (
      <View key={nudge.id} style={styles.nudgeCard}>
        <View style={styles.nudgeHeader}>
          <View style={[styles.nudgeIcon, { backgroundColor: nudge.color + '20' }]}>
            <IconComponent color={nudge.color} size={24} />
          </View>
          <View style={styles.nudgeInfo}>
            <Text style={styles.nudgeTitle}>{nudge.title}</Text>
            <Text style={styles.nudgeFrequency}>{nudge.frequency}</Text>
          </View>
          <Switch
            value={isEnabled && nudgesEnabled}
            onValueChange={(value) => handleNudgeTypeToggle(nudge.id, value)}
            disabled={!nudgesEnabled}
            trackColor={{ false: Colors.gray300, true: nudge.color }}
            thumbColor={Colors.white}
          />
        </View>
        
        <Text style={styles.nudgeDescription}>{nudge.description}</Text>
        
        <View style={styles.exampleBox}>
          <Text style={styles.exampleLabel}>Example:</Text>
          <Text style={styles.exampleText}>{nudge.example}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Nudge Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Strategy Section */}
        <View style={styles.strategySection}>
          <View style={styles.strategyIcon}>
            <Zap color={Colors.primary} size={24} />
          </View>
          <Text style={styles.strategyTitle}>The Hook Strategy</Text>
          <Text style={styles.strategyText}>
            Our nudges use behavioral psychology to help you build a consistent appreciation habit:
          </Text>
          <View style={styles.strategyPoints}>
            <Text style={styles.strategyPoint}>
              <Text style={styles.strategyBold}>1. Trigger:</Text> Smart reminders at optimal times
            </Text>
            <Text style={styles.strategyPoint}>
              <Text style={styles.strategyBold}>2. Action:</Text> Quick, easy appreciation sending
            </Text>
            <Text style={styles.strategyPoint}>
              <Text style={styles.strategyBold}>3. Reward:</Text> Partner's joy & relationship growth
            </Text>
            <Text style={styles.strategyPoint}>
              <Text style={styles.strategyBold}>4. Investment:</Text> Building emotional connection
            </Text>
          </View>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <View style={styles.masterToggleContent}>
            <View style={styles.masterIcon}>
              <Bell color={Colors.primary} size={24} />
            </View>
            <View style={styles.masterText}>
              <Text style={styles.masterTitle}>Enable Nudges</Text>
              <Text style={styles.masterSubtitle}>
                Get gentle reminders to appreciate your partner
              </Text>
            </View>
          </View>
          <Switch
            value={nudgesEnabled}
            onValueChange={handleMasterToggle}
            trackColor={{ false: Colors.gray300, true: Colors.primary }}
            thumbColor={Colors.white}
            style={styles.masterSwitch}
          />
        </View>

        {/* Nudge Types */}
        {nudgesEnabled && (
          <View style={styles.nudgeTypes}>
            <Text style={styles.sectionTitle}>Customize Your Nudges</Text>
            <Text style={styles.sectionSubtitle}>
              Choose which types of reminders work best for you
            </Text>
            {nudgeTypes.map(renderNudgeType)}
          </View>
        )}

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Nudges Work</Text>
          <View style={styles.benefit}>
            <Heart color={Colors.primary} size={20} />
            <Text style={styles.benefitText}>
              Increase appreciation frequency by 3x
            </Text>
          </View>
          <View style={styles.benefit}>
            <TrendingUp color={Colors.success} size={20} />
            <Text style={styles.benefitText}>
              Build lasting relationship habits
            </Text>
          </View>
          <View style={styles.benefit}>
            <Users color={Colors.info} size={20} />
            <Text style={styles.benefitText}>
              Strengthen emotional connection
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
    paddingBottom: Spacing.xl,
  },
  
  // Strategy Section
  strategySection: {
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  strategyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  strategyTitle: {
    ...ComponentStyles.text.h3,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  strategyText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  strategyPoints: {
    gap: Spacing.sm,
  },
  strategyPoint: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  strategyBold: {
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
  },
  
  // Master Toggle
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  masterToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  masterText: {
    flex: 1,
  },
  masterTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.xs,
  },
  masterSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  masterSwitch: {
    marginLeft: Spacing.md,
  },
  
  // Nudge Types
  nudgeTypes: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  nudgeCard: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  nudgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  nudgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  nudgeInfo: {
    flex: 1,
  },
  nudgeTitle: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
  },
  nudgeFrequency: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  nudgeDescription: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.base * 1.4,
  },
  exampleBox: {
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
  },
  exampleLabel: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  exampleText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Benefits
  benefitsSection: {
    backgroundColor: Colors.success + '10',
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  benefitsTitle: {
    ...ComponentStyles.text.h3,
    color: Colors.success,
    marginBottom: Spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  benefitText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
});