import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Share,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { 
  Heart, 
  QrCode, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  X,
  Copy,
  Share2,
  Link2,
  Sparkles,
  User
} from 'lucide-react-native';
import { supabase } from '@/utils/supabase';
import { useSession } from '@/providers/SessionProvider';
import QRCodeModal from '@/components/QRCodeModal';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';
import * as Clipboard from 'expo-clipboard';

export default function ConnectPartnerModal() {
  const { session } = useSession();
  const [inviteCode, setInviteCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [partnerName, setPartnerName] = useState('');
  const [isQRModalVisible, setQRModalVisible] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulse animation for the heart
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        setLoadingProfile(true);
        setCheckingConnection(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('invite_code, partner_id, display_name, avatar_url')
          .eq('id', session.user.id)
          .single();

        if (error) {
          Alert.alert('Error', 'Could not fetch your profile.');
        } else if (data) {
          setInviteCode(data.invite_code);
          setUserName(data.display_name || session.user.user_metadata.display_name || 'You');
          setUserAvatar(data.avatar_url);
          
          if (data.partner_id) {
            const { data: partnerData } = await supabase
              .from('users')
              .select('display_name, avatar_url')
              .eq('id', data.partner_id)
              .single();
            if (partnerData) {
              setPartnerName(partnerData.display_name);
              setPartnerAvatar(partnerData.avatar_url);
              setIsConnected(true);
            }
          }
        }
      }
      setLoadingProfile(false);
      setCheckingConnection(false);
    };
    fetchProfile();
  }, [session]);

  const inviteLink = `https://gratitudebee.app/invite/${inviteCode}`;

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    Alert.alert('Copied!', 'Invite code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on Gratitude Bee! Use my invite code: ${inviteCode}\n\nOr click this link: ${inviteLink}`,
        title: 'Join me on Gratitude Bee',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share');
    }
  };

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

  // Show loading state while checking connection
  if (checkingConnection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color={Colors.textSecondary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect with Partner</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <Users color={Colors.primary} size={40} />
          </View>
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Checking connection status...</Text>
          <Text style={styles.loadingSubtext}>Please wait a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <View style={styles.successIconWrapper}>
              <View style={styles.successIcon}>
                <CheckCircle2 color={Colors.success} size={64} />
              </View>
              <View style={styles.sparkle1}>
                <Sparkles color={Colors.warning} size={16} />
              </View>
              <View style={styles.sparkle2}>
                <Sparkles color={Colors.primary} size={20} />
              </View>
              <View style={styles.sparkle3}>
                <Sparkles color={Colors.info} size={14} />
              </View>
            </View>
            
            <Text style={styles.successTitle}>Connected!</Text>
            <Text style={styles.successSubtitle}>
              You're sharing appreciation with {partnerName}
            </Text>
            
            <View style={styles.avatarsContainer}>
              <View style={styles.avatarWrapper}>
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.connectedAvatar} />
                ) : (
                  <View style={[styles.connectedAvatar, styles.avatarPlaceholder]}>
                    <User color={Colors.textSecondary} size={32} />
                  </View>
                )}
                <Text style={styles.avatarName}>{userName}</Text>
              </View>
              
              <Animated.View style={[styles.heartConnector, { transform: [{ scale: pulseAnim }] }]}>
                <Heart color={Colors.primary} size={24} fill={Colors.primary} />
              </Animated.View>
              
              <View style={styles.avatarWrapper}>
                {partnerAvatar ? (
                  <Image source={{ uri: partnerAvatar }} style={styles.connectedAvatar} />
                ) : (
                  <View style={[styles.connectedAvatar, styles.avatarPlaceholder]}>
                    <User color={Colors.textSecondary} size={32} />
                  </View>
                )}
                <Text style={styles.avatarName}>{partnerName}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <QRCodeModal
        visible={isQRModalVisible}
        onClose={() => setQRModalVisible(false)}
        inviteCode={inviteCode}
        inviteLink={inviteLink}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X color={Colors.textSecondary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect with Partner</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Heart color={Colors.primary} size={40} />
          </View>
          <Text style={styles.heroTitle}>Share the Love</Text>
          <Text style={styles.heroSubtitle}>
            Connect with your partner to start sending appreciation badges and building your relationship
          </Text>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Link2 color={Colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Your Invite Code</Text>
          </View>
          
          <View style={styles.codeCard}>
            {loadingProfile ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
              <>
                <Text style={styles.codeText}>{inviteCode}</Text>
                <Text style={styles.codeHint}>Share this code with your partner</Text>
              </>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.copyButton]} 
              onPress={handleCopyCode}
              disabled={loadingProfile}
            >
              <Copy color={Colors.primary} size={20} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]} 
              onPress={handleShare}
              disabled={loadingProfile}
            >
              <Share2 color={Colors.white} size={20} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.qrButton]} 
              onPress={() => setQRModalVisible(true)}
              disabled={loadingProfile}
            >
              <QrCode color={Colors.warning} size={20} />
              <Text style={styles.qrButtonText}>QR</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users color={Colors.info} size={20} />
            <Text style={styles.sectionTitle}>Enter Partner's Code</Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Enter invite code"
            placeholderTextColor={Colors.textTertiary}
            value={partnerCode}
            onChangeText={setPartnerCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          
          <TouchableOpacity
            style={[styles.connectButton, loading && styles.disabledButton]}
            onPress={() => handleConnectWithCode()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Text style={styles.connectButtonText}>Connect Now</Text>
                <ArrowRight color={Colors.white} size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.sm,
    margin: -Spacing.sm,
  },
  headerTitle: {
    ...ComponentStyles.text.h2,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.screenPadding,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    ...ComponentStyles.text.h1,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: Typography.fontSize.base * 1.5,
  },
  
  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
  },
  sectionTitle: {
    ...ComponentStyles.text.h3,
    marginLeft: Spacing.sm,
  },
  
  // Code Card
  codeCard: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.md,
    borderWidth: 2,
    borderColor: Colors.primary + '30',
    minHeight: 100,
    justifyContent: 'center',
  },
  codeText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  codeHint: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  copyButton: {
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  copyButtonText: {
    ...ComponentStyles.text.button,
    color: Colors.primary,
  },
  shareButton: {
    backgroundColor: Colors.primary,
  },
  shareButtonText: {
    ...ComponentStyles.text.button,
    color: Colors.white,
  },
  qrButton: {
    backgroundColor: Colors.backgroundElevated,
    borderWidth: 2,
    borderColor: Colors.warning,
  },
  qrButtonText: {
    ...ComponentStyles.text.button,
    color: Colors.warning,
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
    paddingHorizontal: Layout.screenPadding,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.md,
  },
  
  // Input
  input: {
    backgroundColor: Colors.backgroundElevated,
    marginHorizontal: Layout.screenPadding,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  
  // Connect Button
  connectButton: {
    backgroundColor: Colors.info,
    marginHorizontal: Layout.screenPadding,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  disabledButton: {
    backgroundColor: Colors.gray400,
    shadowOpacity: 0,
  },
  connectButtonText: {
    ...ComponentStyles.text.button,
    color: Colors.white,
  },
  
  // Success State
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  successIconWrapper: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle1: {
    position: 'absolute',
    top: -10,
    right: 10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 0,
    left: -10,
  },
  sparkle3: {
    position: 'absolute',
    top: 20,
    left: 0,
  },
  successTitle: {
    ...ComponentStyles.text.h1,
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  connectedAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.sm,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarName: {
    ...ComponentStyles.text.body,
    fontFamily: Typography.fontFamily.medium,
  },
  heartConnector: {
    marginHorizontal: Spacing.lg,
    marginBottom: 24, // Align with avatar bottom
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl * 2,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  doneButtonText: {
    ...ComponentStyles.text.button,
    color: Colors.white,
  },
  bottomSpacing: {
    height: Spacing.xl,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loadingSpinner: {
    marginBottom: Spacing.lg,
  },
  loadingText: {
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.xs,
  },
  loadingSubtext: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
  },
});