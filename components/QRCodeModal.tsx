import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { X, Copy, Share2 } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  inviteCode: string;
  inviteLink: string;
}

export default function QRCodeModal({ visible, onClose, inviteCode, inviteLink }: QRCodeModalProps) {
  if (!inviteCode || !inviteLink) {
    return null;
  }
  
  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join me on GratitudeBee! Use my invite code: ${inviteCode} or click this link: ${inviteLink}`,
        url: inviteLink,
        title: 'Join me on GratitudeBee',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      Alert.alert('Error sharing', message);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color={Colors.textSecondary} size={24} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Your Invite QR Code</Text>
          <Text style={styles.modalSubtitle}>
            Have your partner scan this code to connect instantly.
          </Text>

          <View style={styles.qrContainer}>
            <QRCode
              value={inviteLink}
              size={220}
            />
          </View>
          
          <Text style={styles.codeLabel}>Or share your invite code:</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <TouchableOpacity onPress={handleCopyCode}>
              <Copy color={Colors.primary} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShareInvite}>
            <Share2 color="white" size={20} />
            <Text style={styles.shareButtonText}>Share Invite Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: Spacing.lg,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.lg,
    width: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: Spacing.sm,
  },
  modalTitle: {
    ...ComponentStyles.modal.headerTitle,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    ...ComponentStyles.modal.headerSubtitle,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  qrContainer: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  codeLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  codeText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    letterSpacing: 2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    width: '100%',
    ...Shadows.md,
  },
  shareButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    marginLeft: Spacing.sm,
  }
}); 