import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Check,
  Globe,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentLanguage();
  }, []);

  const loadCurrentLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app_language');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === selectedLanguage) return;

    setLoading(true);
    try {
      // Save the selected language
      await AsyncStorage.setItem('app_language', languageCode);
      setSelectedLanguage(languageCode);
      
      // Find the selected language details
      const language = languages.find(lang => lang.code === languageCode);
      
      Alert.alert(
        'Language Changed',
        `Language has been changed to ${language?.name}. The app will restart to apply changes.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // In a real app, you would trigger a reload/restart here
              // For now, we'll just go back
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change language. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderLanguageItem = (language: Language) => {
    const isSelected = language.code === selectedLanguage;
    
    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageItem,
          isSelected && styles.selectedLanguageItem,
        ]}
        onPress={() => handleLanguageSelect(language.code)}
        disabled={loading}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <Text style={styles.flag}>{language.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[styles.languageName, isSelected && styles.selectedText]}>
              {language.name}
            </Text>
            <Text style={[styles.nativeName, isSelected && styles.selectedSubtext]}>
              {language.nativeName}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkIcon}>
            <Check color={Colors.primary} size={20} strokeWidth={3} />
          </View>
        )}
      </TouchableOpacity>
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
        <Text style={styles.title}>Language Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Globe color={Colors.primary} size={24} />
          </View>
          <Text style={styles.infoText}>
            Select your preferred language. The app will restart to apply the changes.
          </Text>
        </View>

        <View style={styles.languageList}>
          {languages.map(renderLanguageItem)}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '10',
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.info + '30',
  },
  infoIcon: {
    marginRight: Spacing.sm,
  },
  infoText: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  
  // Language List
  languageList: {
    paddingHorizontal: Layout.screenPadding,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundElevated,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.sm,
  },
  selectedLanguageItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.semiBold,
    marginBottom: Spacing.xs,
  },
  nativeName: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.primary,
  },
  selectedSubtext: {
    color: Colors.primary + 'CC',
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
});