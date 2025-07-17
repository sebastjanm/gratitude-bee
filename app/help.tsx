// Update: Replaced deprecated 'expo-av' with 'expo-video' to resolve deprecation warning.
// Refactored to use the modern, hook-based API for 'expo-video' with `useVideoPlayer` and `VideoView`.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, HelpCircle, Video as VideoIcon, MessageSquare, Users, Heart, Settings, Gift, Play, X, ChevronRight, LucideIcon } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';


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

interface VideoGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}


// FAQ Categories with organized content
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

// Video guides with embedded content
const videoGuides: VideoGuide[] = [
  {
    id: 'getting-started',
    title: 'Getting Started & Partner Connection',
    description: 'Learn how to set up your account and connect with your partner',
    duration: '2:30',
    thumbnail: 'https://picsum.photos/400/225?random=1',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Example video
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
];

const VideoPlayer = ({ url, description }: { url: string; description: string }) => {
  const player = useVideoPlayer(url);

  return (
    <View style={styles.videoPlayerContainer}>
      <VideoView
        style={styles.videoPlayer}
        player={player}
        nativeControls
        contentFit="contain"
      />
      <View style={styles.videoModalInfo}>
        <Text style={styles.videoModalDescription}>{description}</Text>
      </View>
    </View>
  );
};


export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<FAQCategory | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoGuide | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  
  // Debug logging
  useEffect(() => {
    console.log('HelpScreen mounted - modal should be visible now');
    return () => {
      console.log('HelpScreen unmounted');
    };
  }, []);

  const handleCategoryPress = (category: FAQCategory) => {
    setSelectedFAQCategory(category);
  };

  const handleVideoPress = (video: VideoGuide) => {
    setSelectedVideo(video);
    setVideoModalVisible(true);
  };

  const renderFAQCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <MessageSquare color="#4ECDC4" size={20} />
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      </View>
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
                <ChevronRight color="#666" size={16} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderVideoGuides = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <VideoIcon color="#FF6B9D" size={20} />
        <Text style={styles.sectionTitle}>Quick Guides</Text>
      </View>
      {videoGuides.map((video) => (
        <TouchableOpacity
          key={video.id}
          style={styles.videoCard}
          onPress={() => handleVideoPress(video)}
          activeOpacity={0.8}
        >
          <View style={styles.videoThumbnailContainer}>
            <View style={styles.playButton}>
              <Play color="white" size={20} fill="white" />
            </View>
            <Text style={styles.videoDuration}>{video.duration}</Text>
          </View>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoDescription}>{video.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => selectedFAQCategory ? setSelectedFAQCategory(null) : router.back()} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        {selectedFAQCategory ? 
            React.createElement(selectedFAQCategory.icon, { color: selectedFAQCategory.color, size: 28 }) : 
        <HelpCircle color="#FF8C42" size={28} />
        }
        <Text style={styles.title}>{selectedFAQCategory ? selectedFAQCategory.title : 'Help Center'}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedFAQCategory ? (
          <View style={styles.section}>
            {selectedFAQCategory.faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              </View>
            ))}
          </View>
        ) : (
          <>
            {renderFAQCategories()}
            {renderVideoGuides()}
          </>
        )}
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={videoModalVisible}
        animationType="fade"
        transparent={false}
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <View style={[styles.videoModalContainer, {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }]}>
          <View style={styles.videoModalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setVideoModalVisible(false)}
            >
              <X color="#333" size={24} />
            </TouchableOpacity>
            <Text style={styles.videoModalTitle}>{selectedVideo?.title}</Text>
          </View>
          
          {selectedVideo && (
            <VideoPlayer url={selectedVideo.videoUrl} description={selectedVideo.description} />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF8F0'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: { padding: 8, marginRight: 12 },
  title: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#333', marginLeft: 8 },
  content: { flex: 1 },
  section: { margin: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter-SemiBold', color: '#333', marginLeft: 8 },
  
  // FAQ Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 16,
    marginBottom: 12,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#999',
  },
  
  // FAQ Detail View
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  faqQuestion: { 
    fontSize: 16, 
    fontFamily: 'Inter-SemiBold', 
    color: '#333', 
    marginBottom: 8 
  },
  faqAnswer: { 
    fontSize: 14, 
    fontFamily: 'Inter-Regular', 
    color: '#666', 
    lineHeight: 20 
  },
  
  // Video Guides
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  videoThumbnailContainer: {
    height: 160,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: { 
    fontSize: 16, 
    fontFamily: 'Inter-SemiBold', 
    color: '#333', 
    marginBottom: 4 
  },
  videoDescription: { 
    fontSize: 14, 
    fontFamily: 'Inter-Regular', 
    color: '#666',
    lineHeight: 20,
  },
  
  // Video Modal
  videoModalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  videoModalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: 250,
  },
  videoModalInfo: {
    backgroundColor: 'white',
    padding: 20,
  },
  videoModalDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
}); 