import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import {
  Heart,
  HandHeart,
  Crown,
  TriangleAlert as AlertTriangle,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

const { width } = Dimensions.get('window');

interface QuickSendActionsProps {
  onShowAppreciationModal: () => void;
  onShowFavorsModal: () => void;
  onShowRelationshipWisdomModal: () => void;
  onShowDontPanicModal: () => void;
  onShowNegativeModal: () => void;
  onShowPingModal: () => void;
  heartAnimation: Animated.Value;
}

export default function QuickSendActions({
  onShowAppreciationModal,
  onShowFavorsModal,
  onShowRelationshipWisdomModal,
  onShowDontPanicModal,
  onShowNegativeModal,
  onShowPingModal,
  heartAnimation,
}: QuickSendActionsProps) {
  const renderRelationshipWisdomButton = () => (
    <TouchableOpacity
      style={styles.relationshipWisdomButton}
      onPress={onShowRelationshipWisdomModal}
      activeOpacity={0.8}>
      <View style={styles.relationshipWisdomButtonContent}>
        <Image
          source={require('../assets/images/owl.png')}
          style={styles.wisdomImage}
        />
        <Text style={styles.relationshipWisdomButtonText}>
          Relationship Wisdom
        </Text>
      </View>
      <Text style={styles.relationshipWisdomButtonSubtext}>
        "Whatever you say", "Yes dear", "I'm sorry"
      </Text>
    </TouchableOpacity>
  );

  const renderDontPanicButton = () => (
    <TouchableOpacity
      style={styles.dontPanicButton}
      onPress={onShowDontPanicModal}
      activeOpacity={0.8}>
      <View style={styles.dontPanicButtonContent}>
        <Image
          source={require('../assets/images/dont-panic.png')}
          style={styles.dontPanicImage}
        />
        <Text style={styles.dontPanicButtonText}>Don't Panic</Text>
      </View>
      <Text style={styles.dontPanicButtonSubtext}>
        Send calm reassurance after stress
      </Text>
    </TouchableOpacity>
  );

  const renderNegativeBadgeButton = () => (
    <TouchableOpacity
      style={styles.negativeButton}
      onPress={onShowNegativeModal}
      activeOpacity={0.8}>
      <View style={styles.negativeButtonContent}>
        <Image
          source={require('../assets/images/hornet.png')}
          style={styles.hornetImage}
        />
        <Text style={styles.negativeButtonText}>Send Hornet</Text>
        <AlertTriangle color={Colors.error} size={16} />
      </View>
      <Text style={styles.negativeButtonSubtext}>
        Cancel positive badges for accountability
      </Text>
    </TouchableOpacity>
  );

  const renderSendPingButton = () => (
    <TouchableOpacity
      style={styles.pingButton}
      onPress={onShowPingModal}
      activeOpacity={0.8}>
      <View style={styles.pingButtonContent}>
        <Image
          source={require('../assets/images/ping.png')}
          style={styles.pingImage}
        />
        <Text style={styles.pingButtonText}>Send a Ping</Text>
      </View>
      <Text style={styles.pingButtonSubtext}>
        Urgent check-in: "I'm worried, text me back"
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.quickSendContainer}>
      {/* Level 1 Categories */}
      <View style={styles.levelOneContainer}>
        <TouchableOpacity
          style={[styles.levelOneButton, styles.appreciationButton]}
          onPress={onShowAppreciationModal}
          activeOpacity={0.8}>
          <Animated.View style={[{ transform: [{ scale: heartAnimation }] }]}>
            <Heart color={Colors.primary} size={28} fill={Colors.primary} />
          </Animated.View>
          <Text style={[styles.levelOneButtonText, { color: Colors.primary }]}>
            Send Appreciation
          </Text>
          <Text style={styles.levelOneButtonSubtext}>
            Select from various appreciation categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.levelOneButton, styles.favorsButton]}
          onPress={onShowFavorsModal}
          activeOpacity={0.8}>
          <Animated.View style={[{ transform: [{ scale: heartAnimation }] }]}>
            <HandHeart color={Colors.gray800} size={28} />
          </Animated.View>
          <Text style={[styles.levelOneButtonText, { color: Colors.gray800 }]}>
            Ask for a Favor
          </Text>
          <Text style={styles.levelOneButtonSubtext}>
            Ask for help using your earned points
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Level 2 Categories */}
      <View style={styles.levelTwoContainer}>
        {renderRelationshipWisdomButton()}
        {renderDontPanicButton()}

        {renderSendPingButton()}
        {renderNegativeBadgeButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickSendContainer: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  levelOneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  levelOneButton: {
    flex: 1,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Shadows.sm,
  },
  levelOneButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  levelOneButtonSubtext: {
    ...ComponentStyles.text.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    height: 32,
  },
  appreciationButton: {
    borderColor: Colors.primary + '30',
  },
  favorsButton: {
    borderColor: Colors.gray400,
    backgroundColor: Colors.gray100,
  },
  levelTwoContainer: {},
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  negativeButton: {
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.error + '20',
    marginBottom: Spacing.md,
  },
  negativeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  hornetImage: {
    width: 24,
    height: 24,
  },
  negativeButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.error,
    marginHorizontal: Spacing.sm,
  },
  negativeButtonSubtext: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  dontPanicButton: {
    backgroundColor: Colors.success + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.success + '30',
    marginBottom: Spacing.md,
  },
  dontPanicButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  dontPanicButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.success,
  },
  dontPanicButtonSubtext: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  dontPanicImage: {
    width: 24,
    height: 24,
    marginRight: Spacing.sm,
  },
  relationshipWisdomButton: {
    backgroundColor: '#8B5CF610',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: '#8B5CF630',
    marginBottom: Spacing.md,
  },
  relationshipWisdomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  relationshipWisdomButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: '#8B5CF6',
  },
  relationshipWisdomButtonSubtext: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  wisdomImage: {
    width: 24,
    height: 24,
    marginRight: Spacing.sm,
  },
  pingButton: {
    backgroundColor: Colors.info + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.info + '30',
    marginBottom: Spacing.md,
  },
  pingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  pingIconContainer: {
    marginRight: 8,
    position: 'relative',
  },
  pingHandIcon: {
    position: 'absolute',
    bottom: -2,
    right: -4,
  },
  pingButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.info,
  },
  pingButtonSubtext: {
    ...ComponentStyles.text.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  pingImage: {
    width: 24,
    height: 24,
    marginRight: Spacing.sm,
  },
}); 