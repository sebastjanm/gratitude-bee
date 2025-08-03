import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Star, Smile, Users, ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
  const handleContinue = () => {
    // This should only be shown to non-authenticated users
    // Direct them to sign up/login
    router.push('/(auth)/auth');
  };

  const handleSkip = () => {
    // Skip to sign up/login
    router.push('/(auth)/auth');
  };

  const features = [
    {
      icon: Heart,
      title: 'One-Tap Badges',
      description: 'Send appreciation instantly with beautiful, themed badges',
      color: '#FF6B9D',
    },
    {
      icon: Star,
      title: 'Build Streaks',
      description: 'Create lasting habits of daily appreciation together',
      color: '#4ECDC4',
    },
    {
      icon: Smile,
      title: 'Collect Memories',
      description: 'Watch your appreciation timeline grow into a beautiful memory book',
      color: '#FFD93D',
    },
    {
      icon: Users,
      title: 'Connect with Partner',
      description: 'Share badges and build stronger bonds through gratitude',
      color: '#6BCF7F',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Heart color="#FF8C42" size={40} fill="#FF8C42" />
        </View>
        <Text style={styles.title}>Welcome to GratitudeBee!</Text>
        <Text style={styles.subtitle}>
          You're all set to start building daily appreciation habits
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <IconComponent color="white" size={24} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.ctaContainer}>
        <Text style={styles.ctaTitle}>Ready to get started?</Text>
        <Text style={styles.ctaSubtitle}>
          Connect with your partner to begin sharing appreciation badges together
        </Text>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
          <Text style={styles.secondaryButtonText}>I'll do this later</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#999',
  },
});