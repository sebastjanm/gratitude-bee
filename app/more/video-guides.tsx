import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Play,
  Clock,
} from 'lucide-react-native';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface VideoGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

const videoGuides: VideoGuide[] = [
  {
    id: 'getting-started',
    title: 'Getting Started & Partner Connection',
    description: 'Learn how to set up your account and connect with your partner',
    duration: '2:30',
    thumbnail: 'https://picsum.photos/400/225?random=1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'appreciation-system',
    title: 'Sending Appreciations & Badges',
    description: 'Master the art of showing gratitude with our badge system',
    duration: '3:15',
    thumbnail: 'https://picsum.photos/400/225?random=2',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'favor-system',
    title: 'Points Economy & Favor Requests',
    description: 'Understanding how favor points work and making requests',
    duration: '2:45',
    thumbnail: 'https://picsum.photos/400/225?random=3',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'communication',
    title: 'Effective Communication Features',
    description: 'Use pings, hornets, and wisdom quotes to communicate better',
    duration: '4:00',
    thumbnail: 'https://picsum.photos/400/225?random=4',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  },
  {
    id: 'achievements',
    title: 'Badges & Achievements',
    description: 'Track your progress and unlock special rewards',
    duration: '2:15',
    thumbnail: 'https://picsum.photos/400/225?random=5',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  },
];

export default function VideoGuidesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedVideo, setSelectedVideo] = useState<VideoGuide | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const handleVideoPress = (video: VideoGuide) => {
    setSelectedVideo(video);
    setVideoModalVisible(true);
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
        <Text style={styles.title}>Video Guides</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.subtitle}>
          Quick video tutorials to help you get the most out of Gratitude Bee
        </Text>

        {videoGuides.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={styles.videoCard}
            onPress={() => handleVideoPress(video)}
            activeOpacity={0.8}
          >
            <View style={styles.videoThumbnail}>
              <View style={styles.playButton}>
                <Play color={Colors.white} size={24} fill={Colors.white} />
              </View>
              <View style={styles.durationBadge}>
                <Clock color={Colors.white} size={12} />
                <Text style={styles.duration}>{video.duration}</Text>
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoDescription}>{video.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <VideoPlayerModal 
        video={selectedVideo}
        visible={videoModalVisible}
        onClose={() => setVideoModalVisible(false)}
      />
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
    paddingTop: Spacing.lg,
  },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  
  // Video Cards
  videoCard: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  videoThumbnail: {
    height: 180,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  duration: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  videoInfo: {
    padding: Spacing.lg,
  },
  videoTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  videoDescription: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
});