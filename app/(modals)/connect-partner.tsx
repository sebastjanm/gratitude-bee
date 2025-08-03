import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, QrCode, Users, CircleCheck as CheckCircle, ArrowRight, X } from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCodeModal from '@/components/QRCodeModal';

export default function ConnectPartnerModal() {
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
              onPress: () => router.back(),
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

  const handleClose = () => {
    router.back();
  };

  if (isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle color="#4ECDC4" size={48} />
            </View>
            <Text style={styles.successTitle}>Already Connected!</Text>
            <Text style={styles.successSubtitle}>
              You and {partnerName} are linked together
            </Text>
            <View style={styles.partnerInfo}>
              <Users color="#4ECDC4" size={24} />
              <Text style={styles.partnerText}>{session?.user.user_metadata.display_name} & {partnerName}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <QRCodeModal
          visible={isQRModalVisible}
          onClose={() => setQRModalVisible(false)}
          inviteCode={inviteCode}
          inviteLink={inviteLink}
        />
        
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft} />
            <Text style={styles.headerTitle}>Connect Partner</Text>
            <TouchableOpacity onPress={handleClose} style={styles.headerClose}>
              <X color="#666" size={24} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Share appreciation badges with your partner
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Invite Code</Text>
          <Text style={styles.sectionSubtitle}>
            Share this code with your partner
          </Text>

          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{loadingProfile ? 'Loading...' : inviteCode}</Text>
          </View>

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
            <Text style={styles.qrButtonText}>{loadingProfile ? 'Loading...' : 'Show QR Code'}</Text>
          </TouchableOpacity>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  headerClose: {
    width: 40,
    alignItems: 'flex-end',
  },
  subtitle: {
    fontSize: 15,
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
  codeDisplay: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  codeText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
    letterSpacing: 2,
  },
  qrButton: {
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
  qrButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
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
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    textAlign: 'center',
    letterSpacing: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  connectButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  closeButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF8C42',
  },
});