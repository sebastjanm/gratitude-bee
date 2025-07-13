// This file was created by the assistant.
// It contains the "Send a Ping" modal component.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';

export interface PingTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  points?: number;
  points_icon?: string;
  point_unit?: string;
  notification_text?: string;
}

interface PingModalProps {
  visible: boolean;
  onClose: () => void;
  onSendPing: (template: PingTemplate) => void;
}

export default function PingModal({
  visible,
  onClose,
  onSendPing,
}: PingModalProps) {
  const [selectedPing, setSelectedPing] = useState<PingTemplate | null>(null);
  const [templates, setTemplates] = useState<PingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (visible) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('ping_templates')
            .select('*')
            .eq('is_active', true);

          if (error) {
            throw error;
          }
          setTemplates(data || []);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplates();
  }, [visible]);


  const handleClose = () => {
    setSelectedPing(null);
    onClose();
  };

  const handleSend = () => {
    if (selectedPing) {
      onSendPing(selectedPing);
      handleClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X color="#666" size={24} />
            </TouchableOpacity>
            <View style={styles.heroIcon}>
                <Image source={require('../assets/images/ping.png')} style={styles.heroImage} />
            </View>
            <Text style={styles.heroTitle}>Send a Ping</Text>
            <Text style={styles.heroSubtitle}>
              Send an urgent nudge to your partner to let them know you're thinking of them.
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.pingSection}>
              {loading && <ActivityIndicator color="#3B82F6" style={{ marginVertical: 20 }} />}
              {error && <Text style={styles.errorText}>Error fetching pings: {error}</Text>}
              {!loading && !error && (
              <View style={styles.pingGrid}>
                {templates.map((ping) => (
                  <TouchableOpacity
                    key={ping.id}
                    style={[
                      styles.pingCard,
                      selectedPing?.id === ping.id && styles.selectedPingCard,
                      { borderLeftColor: ping.color },
                    ]}
                    onPress={() => setSelectedPing(ping)}
                    activeOpacity={0.7}>
                    <View style={styles.pingCardContent}>
                      <View style={[styles.pingIcon, { backgroundColor: ping.color + '20' }]}>
                        <Text style={styles.pingEmoji}>{ping.icon}</Text>
                      </View>
                      <View style={styles.pingTextContainer}>
                        <Text style={styles.pingTitle}>{ping.title}</Text>
                        <Text style={styles.pingDescription}>{ping.description}</Text>
                      </View>
                    </View>
                    
                    {selectedPing?.id === ping.id && (
                      <View style={styles.selectedIndicator}>
                        <CheckCircle color={ping.color} size={16} />
                        <Text style={[styles.selectedText, { color: ping.color }]}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              )}
            </View>

            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>💡 Using Pings Responsibly</Text>
              <Text style={styles.tipText}>
                Pings are for urgent check-ins. To prevent spam, consider agreeing on limits,
                like a few per day or a cool-down timer between pings.
              </Text>
            </View>
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
  contentWrapper: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginVertical: 20,
    fontFamily: 'Inter-Regular',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
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
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPingCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6' + '1A',
  },
  pingCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  pingTextContainer: {
    flex: 1,
  },
  pingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  pingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 64, // Align with text
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