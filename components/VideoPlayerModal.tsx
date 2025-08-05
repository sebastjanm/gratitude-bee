// This component was created by the assistant.
// It provides a full-screen modal for playing video guides,
// optimizing space and providing a better user experience than the previous implementation.

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

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
            <X color={Colors.textPrimary} size={28} />
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundElevated,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginRight: Spacing.md,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  videoContainer: {
    width: width,
    height: width * (9 / 16), // 16:9 aspect ratio
    backgroundColor: Colors.black,
  },
  videoPlayer: {
    flex: 1,
  },
  infoContainer: {
    padding: Layout.screenPadding,
    flex: 1,
  },
  videoTitle: {
    ...ComponentStyles.modal.headerTitle,
    marginBottom: Spacing.md,
  },
  videoDescription: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.normal,
  },
}); 