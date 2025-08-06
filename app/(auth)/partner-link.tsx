import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Clipboard,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, QrCode, Copy, Users, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeModal from '@/components/QRCodeModal';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

export default function PartnerLinkScreen() {
  const { session } = useSession();
  const [inviteCode, setInviteCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [partnerName, setPartnerName] = useState('');
  const [isQRModalVisible, setQRModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('users')
          .select('invite_code, partner_id')
          .eq('id', session.user.id)
          .single();

        if (error) {
          Alert.alert('Error', 'Could not fetch your profile.');
        } else if (data) {
          setInviteCode(data.invite_code);
          if (data.partner_id) {
            const { data: partnerData } = await supabase
              .from('users')
              .select('display_name')
              .eq('id', data.partner_id)
              .single();
            if (partnerData) {
              setPartnerName(partnerData.display_name);
              setIsConnected(true);
            }
          }
        }
      }
      setLoadingProfile(false);
    };
    fetchProfile();

    // Stored invite codes are now handled in the root layout after authentication
  }, [session]);

  const inviteLink = `https://gratitudebee.app/invite/${inviteCode}`;

  const handleConnectWithCode = async (codeToConnect?: string) => {
    const finalCode = codeToConnect || partnerCode;
    if (!finalCode.trim()) {
      Alert.alert('Missing Code', 'Please enter your partner\'s invite code');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('connect-partner', {
        body: { inviteCode: finalCode },
      });

      if (error) throw error;
      
      setPartnerName(data.partnerName);
      setIsConnected(true);
      
      setTimeout(() => {
        Alert.alert(
          'Connected Successfully! 🎉',
          `You and ${data.partnerName} are now connected. Start sharing appreciation badges together!`,
          [
            {
              text: 'Start Appreciating',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }, 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid invite code. Please check and try again.';
      Alert.alert('Connection Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  if (isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
        <QRCodeModal
          visible={isQRModalVisible}
          onClose={() => setQRModalVisible(false)}
          inviteCode={inviteCode}
          inviteLink={inviteLink}
        />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle color="#4ECDC4" size={48} />
          </View>
          <Text style={styles.successTitle}>Connected!</Text>
          <Text style={styles.successSubtitle}>
            You and {partnerName} are now linked together
          </Text>
          <View style={styles.partnerInfo}>
            <Users color="#4ECDC4" size={24} />
            <Text style={styles.partnerText}>{session?.user.user_metadata.display_name} & {partnerName}</Text>
          </View>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Heart color="#FF8C42" size={40} fill="#FF8C42" />
        </View>
        <Text style={styles.title}>Connect with Your Partner</Text>
        <Text style={styles.subtitle}>
          Share appreciation badges and build stronger bonds together
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Your Code</Text>
        <Text style={styles.sectionSubtitle}>
          Show your QR code to your partner so they can scan and connect instantly
        </Text>

        <View style={styles.qrButtonContainer}>
          <TouchableOpacity 
            style={[styles.qrButton, loadingProfile && styles.qrButtonDisabled]} 
            onPress={() => {
              if (!inviteCode) {
                Alert.alert('Loading', 'Please wait while we load your invite code...');
                return;
              }
              setQRModalVisible(true);
            }}
            disabled={loadingProfile}>
            {loadingProfile ? (
              <ActivityIndicator size="small" color="#FF8C42" />
            ) : (
              <QrCode color="#FF8C42" size={24} />
            )}
            <Text style={styles.qrButtonText}>{loadingProfile ? 'Loading...' : 'Show My QR Code'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enter Partner's Code</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter invite code"
            value={partnerCode}
            onChangeText={setPartnerCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.connectButton, loading && styles.disabledButton]}
          onPress={() => handleConnectWithCode()}
          disabled={loading}>
          <Text style={styles.connectButtonText}>
            {loading ? 'Connecting...' : 'Connect'}
          </Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>I'll do this later</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  qrButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrButtonDisabled: {
    opacity: 0.6,
  },
  scanButton: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  qrButtonText: {
    ...ComponentStyles.button.text.secondary,
    marginLeft: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#999',
    marginHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    height: Layout.buttonHeight.md,
    ...ComponentStyles.text.body,
    textAlign: 'center',
    letterSpacing: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  connectButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    height: Layout.buttonHeight.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  connectButtonText: {
    ...ComponentStyles.button.text.primary,
    marginRight: Spacing.sm,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 'auto',
  },
  skipButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  partnerText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 12,
  },
});