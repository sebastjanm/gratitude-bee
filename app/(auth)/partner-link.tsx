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
} from 'react-native';
import { router } from 'expo-router';
import { Heart, QrCode, Copy, Users, CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeModal from '@/components/QRCodeModal';
import QRScannerModal from '@/components/QRScannerModal';

export default function PartnerLinkScreen() {
  const { session } = useSession();
  const [inviteCode, setInviteCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [isScannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
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
    };
    fetchProfile();

    const checkStoredInvite = async () => {
      const storedCode = await AsyncStorage.getItem('invite_code');
      if (storedCode) {
        await AsyncStorage.removeItem('invite_code');
        handleConnectWithCode(storedCode);
      }
    };
    checkStoredInvite();
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
      if (isScannerVisible) setScannerVisible(false);
      
      setTimeout(() => {
        Alert.alert(
          'Connected Successfully!',
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
      <View style={styles.container}>
        <QRCodeModal
          visible={isQRModalVisible}
          onClose={() => setQRModalVisible(false)}
          inviteCode={inviteCode}
          inviteLink={inviteLink}
        />
        <QRScannerModal
          visible={isScannerVisible}
          onClose={() => setScannerVisible(false)}
          onCodeScanned={handleConnectWithCode}
        />
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle color="#4ECDC4" size={64} />
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
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Heart color="#FF8C42" size={32} fill="#FF8C42" />
        </View>
        <Text style={styles.title}>Connect with Your Partner</Text>
        <Text style={styles.subtitle}>
          Share appreciation badges and build stronger bonds together
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scan or Enter Code</Text>
        <Text style={styles.sectionSubtitle}>
          Connect instantly using a QR code or by entering your partner's code manually.
        </Text>

        <View style={styles.qrButtonContainer}>
          <TouchableOpacity style={styles.qrButton} onPress={() => setQRModalVisible(true)}>
            <QrCode color="#666" size={20} />
            <Text style={styles.qrButtonText}>Show My Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.qrButton, styles.scanButton]} onPress={() => setScannerVisible(true)}>
            <QrCode color="white" size={20} />
            <Text style={[styles.qrButtonText, { color: 'white' }]}>Scan Partner's Code</Text>
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
        <Text style={styles.skipButtonText}>I'll connect later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
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
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 20,
  },
  qrButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  qrButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scanButton: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  qrButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginLeft: 8,
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
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    letterSpacing: 1,
  },
  connectButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  connectButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 'auto',
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#999',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 24,
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