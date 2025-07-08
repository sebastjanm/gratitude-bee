import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, HelpCircle, Video, MessageSquare } from 'lucide-react-native';

// Mock data, in a real app this would come from a CMS or a local markdown file
const faqs = [
  {
    q: 'What is Gratitude Bee?',
    a: 'Gratitude Bee is an app designed to help couples strengthen their relationship by making it easy and fun to share appreciation, ask for favors, and communicate effectively.',
  },
  {
    q: 'How do I connect with my partner?',
    a: 'On the "Profile" screen, tap "Invite Partner." You can then share your unique invite link or have your partner scan your QR code.',
  },
  {
    q: 'What\'s the difference between an Appreciation and a Favor?',
    a: 'Appreciations are simple thank-yous. Favors are requests for help that cost favor points, which your partner earns upon completion.',
  },
];

const videos = [
  {
    title: 'Getting Started: Connecting With Your Partner',
    description: 'A quick walkthrough of the invitation and QR code process.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    title: 'The Points Economy Explained',
    description: 'Learn how to earn and spend favor points.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        <HelpCircle color="#FF8C42" size={28} />
        <Text style={styles.title}>Help Center</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare color="#4ECDC4" size={20} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Video color="#FF6B9D" size={20} />
            <Text style={styles.sectionTitle}>Video Tutorials</Text>
          </View>
          {videos.map((video, index) => (
            <TouchableOpacity key={index} style={styles.videoItem} onPress={() => Linking.openURL(video.url)}>
              <View style={styles.videoIcon}>
                <Video color="white" size={20} />
              </View>
              <View style={styles.videoTextContainer}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                <Text style={styles.videoDescription}>{video.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontFamily: 'Inter-SemiBold', color: '#333', marginLeft: 8 },
  faqItem: { marginBottom: 20 },
  faqQuestion: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: '#333', marginBottom: 8 },
  faqAnswer: { fontSize: 14, fontFamily: 'Inter-Regular', color: '#666', lineHeight: 20 },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  videoTextContainer: { flex: 1 },
  videoTitle: { fontSize: 16, fontFamily: 'Inter-Medium', color: '#333', marginBottom: 4 },
  videoDescription: { fontSize: 12, fontFamily: 'Inter-Regular', color: '#666' },
}); 