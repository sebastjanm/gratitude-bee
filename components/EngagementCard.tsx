import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

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
    title: 'Boring...',
    subtitle: 'Nothing is happening. Maybe send a little ping?',
  },
  demanding: {
    animation: require('@/assets/lottie/demanding.json'),
    title: 'Hey, do something!',
    subtitle: 'Your partner might appreciate a small gesture.',
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
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  lottie: {
    width: 80,
    height: 80,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default EngagementCard; 