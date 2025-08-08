import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '@/utils/design-system';

// Define the structure for each engagement stage's content
type StageContent = {
  animation: any; // Lottie file require
  title: string;
  subtitle: string;
};

type EngagementCardProps = {
  stage: 'boring' | 'demanding' | 'sad' | 'spark' | 'love';
};

const stageContentMapping: Record<string, StageContent> = {
  boring: {
    animation: require('@/assets/lottie/boring.json'),
    title: 'Boring day...',
    subtitle: 'Nothing is happening. Maybe send a little wisdom?',
  },
  demanding: {
    animation: require('@/assets/lottie/demanding.json'),
    title: 'Hey, share some love!',
    subtitle: 'Your partner might appreciate a small gesture. Send a ping!ß',
  },
  sad: {
    animation: require('@/assets/lottie/sad.json'),
    title: 'A quiet day...',
    subtitle: 'A small gesture can make a big difference. Say hello!',
  },
  spark: {
    animation: require('@/assets/lottie/spark.json'),
    title: 'Keep the spark alive',
    subtitle: "You're on the right track! What's one more kind word?",
  },
  love: {
    animation: require('@/assets/lottie/love.json'),
    title: 'Feeling the love!',
    subtitle: 'Your connection is shining bright today. Keep it up!',
  }
};

const EngagementCard = ({ stage }: EngagementCardProps) => {
  const animationRef = useRef<LottieView>(null);
  const content = stageContentMapping[stage];

  useEffect(() => {
    // Ensure the animation plays when the component mounts or the stage changes
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, [stage]);

  if (!content) {
    return null; // Or a default state if a stage is ever invalid
  }

  return (
    <View style={styles.card}>
      <LottieView
        key={stage} // Add a key to ensure re-render on stage change
        ref={animationRef}
        source={content.animation}
        autoPlay
        loop
        style={styles.lottie}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  lottie: {
    width: 80,
    height: 80,
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeight.tight,
  },
});

export default EngagementCard; 