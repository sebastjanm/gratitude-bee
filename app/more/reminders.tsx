import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// No date picker needed - using simple time selection
import {
  ChevronLeft,
  Bell,
  Clock,
  Calendar,
  Sunrise,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface TimeSlot {
  id: string;
  label: string;
  time: string;
  icon: any;
  description: string;
}

const suggestedTimes: TimeSlot[] = [
  {
    id: 'morning',
    label: 'Morning',
    time: '08:00',
    icon: Sunrise,
    description: 'Start the day with gratitude',
  },
  {
    id: 'lunch',
    label: 'Lunch',
    time: '12:00',
    icon: Sun,
    description: 'Midday appreciation break',
  },
  {
    id: 'evening',
    label: 'Evening',
    time: '20:00',
    icon: Sunset,
    description: 'Reflect on the day together',
  },
  {
    id: 'night',
    label: 'Night',
    time: '22:00',
    icon: Moon,
    description: 'End the day with love',
  },
];

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(['20:00']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReminderSettings();
  }, []);

  const loadReminderSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('daily_reminder_enabled');
      const times = await AsyncStorage.getItem('daily_reminder_times');
      
      setRemindersEnabled(enabled !== 'false');
      if (times) {
        setSelectedTimes(JSON.parse(times));
      }
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const handleToggleReminders = async (value: boolean) => {
    setRemindersEnabled(value);
    try {
      await AsyncStorage.setItem('daily_reminder_enabled', value.toString());
      
      if (value) {
        const count = selectedTimes.length;
        Alert.alert(
          'Daily Reminders Enabled',
          `You'll receive ${count} ${count === 1 ? 'reminder' : 'reminders'} each day to appreciate your partner.`,
        );
      } else {
        Alert.alert(
          'Daily Reminders Disabled',
          'You won\'t receive daily reminders. You can always turn them back on!',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save setting. Please try again.');
    }
  };

  // Removed date picker functionality - using simple selection instead

  const toggleTimeSelection = async (time: string) => {
    let newTimes: string[];
    
    if (selectedTimes.includes(time)) {
      // Remove time if already selected
      newTimes = selectedTimes.filter(t => t !== time);
    } else {
      // Add time if not selected
      newTimes = [...selectedTimes, time].sort();
    }
    
    setSelectedTimes(newTimes);
    
    try {
      await AsyncStorage.setItem('daily_reminder_times', JSON.stringify(newTimes));
    } catch (error) {
      Alert.alert('Error', 'Failed to save times. Please try again.');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function removed - no longer needed without date picker

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color={Colors.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Reminders</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Bell color={Colors.primary} size={24} />
          </View>
          <Text style={styles.infoTitle}>Build a Daily Habit</Text>
          <Text style={styles.infoText}>
            Get a gentle reminder each day to share what you appreciate about your partner. 
            Consistency is key to building stronger relationships!
          </Text>
        </View>

        {/* Master Toggle */}
        <View style={styles.masterToggle}>
          <View style={styles.toggleContent}>
            <View style={styles.toggleIcon}>
              <Clock color={Colors.primary} size={24} />
            </View>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Enable Daily Reminders</Text>
              <Text style={styles.toggleSubtitle}>
                Get reminded once a day at your chosen time
              </Text>
            </View>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={handleToggleReminders}
            trackColor={{ false: Colors.gray300, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Time Selection */}
        {remindersEnabled && (
          <>
            <View style={styles.timeSection}>
              <Text style={styles.sectionTitle}>Choose Your Reminder Time</Text>
              <Text style={styles.sectionSubtitle}>
                Select the time that works best for your daily routine
              </Text>
            </View>

            {/* Time Options */}
            <View style={styles.suggestionsSection}>
              
              {suggestedTimes.map((slot) => {
                const IconComponent = slot.icon;
                const isSelected = selectedTimes.includes(slot.time);
                
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
                    onPress={() => toggleTimeSelection(slot.time)}
                  >
                    <View style={[styles.slotIcon, isSelected && styles.selectedSlotIcon]}>
                      <IconComponent 
                        color={isSelected ? Colors.primary : Colors.textSecondary} 
                        size={24} 
                      />
                    </View>
                    <View style={styles.slotContent}>
                      <Text style={[styles.slotLabel, isSelected && styles.selectedText]}>
                        {slot.label} - {formatTime(slot.time)}
                      </Text>
                      <Text style={[styles.slotDescription, isSelected && styles.selectedSubtext]}>
                        {slot.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sample Notification */}
            <View style={styles.sampleSection}>
              <Text style={styles.sectionTitle}>Sample Notification</Text>
              <View style={styles.sampleNotification}>
                <View style={styles.sampleHeader}>
                  <Bell color={Colors.primary} size={16} />
                  <Text style={styles.sampleApp}>Gratitude Bee</Text>
                  <Text style={styles.sampleTime}>now</Text>
                </View>
                <Text style={styles.sampleTitle}>Daily Appreciation Time! 💝</Text>
                <Text style={styles.sampleBody}>
                  What made you smile today? Share it with your partner!
                </Text>
              </View>
              
              {selectedTimes.length > 0 && (
                <View style={styles.selectedTimesInfo}>
                  <Clock color={Colors.textSecondary} size={16} />
                  <Text style={styles.selectedTimesText}>
                    You'll receive reminders at: {selectedTimes.map(t => formatTime(t)).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Daily Reminders?</Text>
          <View style={styles.benefit}>
            <Text style={styles.benefitEmoji}>🎯</Text>
            <Text style={styles.benefitText}>
              Build a consistent appreciation habit
            </Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitEmoji}>💝</Text>
            <Text style={styles.benefitText}>
              Never forget to express gratitude
            </Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitEmoji}>📈</Text>
            <Text style={styles.benefitText}>
              Strengthen your relationship daily
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
  
  // Info Section
  infoSection: {
    backgroundColor: Colors.primary + '10',
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    ...ComponentStyles.text.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.5,
  },
  
  // Master Toggle
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  toggleSubtitle: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  
  // Time Section
  timeSection: {
    marginTop: Spacing.xl,
    marginHorizontal: Layout.screenPadding,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md,
  },
  sectionSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  
  // Suggestions
  suggestionsSection: {
    marginTop: Spacing.xl,
    marginHorizontal: Layout.screenPadding,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundElevated,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  selectedTimeSlot: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  slotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  selectedSlotIcon: {
    backgroundColor: Colors.primary + '20',
  },
  slotContent: {
    flex: 1,
  },
  slotLabel: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  slotDescription: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.primary,
  },
  selectedSubtext: {
    color: Colors.primary + 'CC',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
  },
  
  // Sample Notification
  sampleSection: {
    marginTop: Spacing.xl,
    marginHorizontal: Layout.screenPadding,
  },
  sampleNotification: {
    backgroundColor: Colors.backgroundElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  sampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sampleApp: {
    ...ComponentStyles.text.caption,
    fontFamily: Typography.fontFamily.semiBold,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  sampleTime: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
  },
  sampleTitle: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  sampleBody: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
  },
  selectedTimesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  selectedTimesText: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  
  // Benefits
  benefitsSection: {
    backgroundColor: Colors.success + '10',
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
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
  benefitEmoji: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  benefitText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    flex: 1,
  },
});