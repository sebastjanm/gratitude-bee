// QRScannerModal.tsx - Simplified modal that instructs users to use native camera
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Linking } from 'react-native';
import { X, Camera, Smartphone } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
}

export default function QRScannerModal({ visible, onClose, onCodeScanned }: QRScannerModalProps) {
  const handleOpenNativeCamera = () => {
    // Users will manually type the code after scanning with native camera
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X color={Colors.textSecondary} size={24} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Smartphone color={Colors.primary} size={64} />
          </View>
          
          <Text style={styles.title}>Use Your Phone's Camera</Text>
          
          <Text style={styles.description}>
            Open your phone's built-in camera app and scan your partner's QR code. 
            The invite link will automatically open in GratitudeBee.
          </Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Open your phone's Camera app</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Point camera at the QR code</Text>
            </View>
            
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Tap the notification to open invite</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.primaryButton} onPress={handleOpenNativeCamera}>
            <Camera color="white" size={20} />
            <Text style={styles.primaryButtonText}>Got it!</Text>
          </TouchableOpacity>
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
  closeButton: {
    position: 'absolute',
    top: 60,
    right: Layout.screenPadding,
    padding: Spacing.sm,
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    ...ComponentStyles.modal.headerTitle,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...ComponentStyles.modal.headerSubtitle,
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal,
    marginBottom: Spacing.xl,
  },
  stepsContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
  },
}); 