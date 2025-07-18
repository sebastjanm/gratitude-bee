// This component was created by the assistant.
// It provides a full-screen modal for playing video guides,
// optimizing space and providing a better user experience than the previous implementation.

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width } = Dimensions.get('window');

interface VideoGuide {
  title: string;
  description: string;
  videoUrl: string;
}

interface VideoPlayerModalProps {
  video: VideoGuide | null;
  visible: boolean;
  onClose: () => void;
}

const VideoPlayer = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url, (player) => {
    player.play();
  });

  return (
    <VideoView
      style={styles.videoPlayer}
      player={player}
      nativeControls
      contentFit="contain"
      allowsFullscreen
    />
  );
};

export default function VideoPlayerModal({ video, visible, onClose }: VideoPlayerModalProps) {
  const insets = useSafeAreaInsets();

  if (!video) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>{video.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#333" size={28} />
          </TouchableOpacity>
        </View>

        <View style={styles.videoContainer}>
          <VideoPlayer url={video.videoUrl} />
        </View>
        
        <View style={styles.infoContainer}>
            <Text style={styles.videoTitle}>{video.title}</Text>
            <Text style={styles.videoDescription}>{video.description}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginRight: 16,
  },
  closeButton: {
    padding: 8,
  },
  videoContainer: {
    width: width,
    height: width * (9 / 16), // 16:9 aspect ratio
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    flex: 1,
  },
  videoTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
  },
  videoDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
  },
}); 