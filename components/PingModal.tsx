// This file was created by the assistant.
// It contains the "Send a Ping" modal component.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { X, AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';

interface PingOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface PingModalProps {
  visible: boolean;
  onClose: () => void;
  onSendPing: (pingId: string, pingTitle: string) => void;
}

const pingOptions: PingOption[] = [
  {
    id: 'checking-in',
    title: 'Just checking in',
    description: 'A gentle nudge to see how you are.',
    icon: '👋',
    color: '#3B82F6',
  },
  {
    id: 'worried',
    title: 'A bit worried',
    description: 'Please text back when you get a chance.',
    icon: '😟',
    color: '#F59E0B',
  },
  {
    id: 'urgent',
    title: 'URGENT: Are you safe?',
    description: 'Please let me know you are okay as soon as possible.',
    icon: '🚨',
    color: '#EF4444',
  },
  {
    id: 'hornet-alert',
    title: 'Hornet Alert',
    description: 'This is the final warning. A storm is coming.',
    icon: '☣️',
    color: '#DC2626',
  },
];

export default function PingModal({
  visible,
  onClose,
  onSendPing,
}: PingModalProps) {
  const [selectedPing, setSelectedPing] = useState<PingOption | null>(null);

  const handleClose = () => {
    setSelectedPing(null);
    onClose();
  };

  const handleSend = () => {
    if (selectedPing) {
      onSendPing(selectedPing.id, selectedPing.title);
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Send a Ping</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={styles.heroIcon}>
                <Image source={require('../assets/images/ping.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Send a Ping</Text>
            <Text style={styles.heroSubtitle}>
              Send an urgent nudge to your partner to let them know you're thinking of them.
            </Text>
          </View>

          <View style={styles.pingSection}>
            <View style={styles.pingGrid}>
              {pingOptions.map((ping) => (
                <TouchableOpacity
                  key={ping.id}
                  style={[
                    styles.pingCard,
                    selectedPing?.id === ping.id && styles.selectedPingCard,
                  ]}
                  onPress={() => setSelectedPing(ping)}
                  activeOpacity={0.7}>
                  <View style={styles.pingCardHeader}>
                    <View style={[styles.pingIcon, { backgroundColor: ping.color + '20' }]}>
                      <Text style={styles.pingEmoji}>{ping.icon}</Text>
                    </View>
                    <Text style={styles.pingTitle}>{ping.title}</Text>
                  </View>
                  <Text style={styles.pingDescription}>{ping.description}</Text>
                  
                  {selectedPing?.id === ping.id && (
                    <View style={styles.selectedIndicator}>
                      <CheckCircle color={ping.color} size={16} />
                      <Text style={[styles.selectedText, { color: ping.color }]}>Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 Using Pings Responsibly</Text>
            <Text style={styles.tipText}>
              Pings are for urgent check-ins. To prevent spam, consider agreeing on limits, 
              like a few per day or a cool-down timer between pings.
            </Text>
          </View>
        </ScrollView>

        {selectedPing && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: selectedPing.color }]}
              onPress={handleSend}
              activeOpacity={0.8}>
              <Image source={require('../assets/images/ping.png')} style={styles.buttonImage} />
              <Text style={styles.fixedSendButtonText}>
                Send Ping
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  heroImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pingSection: {
    marginBottom: 32,
  },
  pingGrid: {
    gap: 16,
  },
  pingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPingCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6' + '05',
  },
  pingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pingEmoji: {
    fontSize: 20,
  },
  pingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    flex: 1,
  },
  pingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  tipSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#6B7280',
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  fixedSendButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  fixedSendButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedSendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
}); 