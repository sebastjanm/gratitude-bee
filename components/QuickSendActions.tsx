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
        <AlertTriangle color="#FF4444" size={16} />
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
            <Heart color="#FF8C42" size={28} fill="#FF8C42" />
          </Animated.View>
          <Text style={[styles.levelOneButtonText, { color: '#FF8C42' }]}>
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
            <HandHeart color="#2C3E50" size={28} />
          </Animated.View>
          <Text style={[styles.levelOneButtonText, { color: '#2C3E50' }]}>
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
    marginHorizontal: 20,
    marginBottom: 24,
  },
  levelOneContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  levelOneButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  levelOneButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  levelOneButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    height: 32,
  },
  appreciationButton: {
    borderColor: '#FFE0B2',
  },
  favorsButton: {
    borderColor: '#A9B4C2',
    backgroundColor: '#EAF0F6',
  },
  levelTwoContainer: {},
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  negativeButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFE0E0',
    marginBottom: 12,
  },
  negativeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  hornetImage: {
    width: 24,
    height: 24,
  },
  negativeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF4444',
    marginHorizontal: 8,
  },
  negativeButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
  dontPanicButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#A8D8B9',
    marginBottom: 12,
  },
  dontPanicButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dontPanicButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#27AE60',
  },
  dontPanicButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
  dontPanicImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  relationshipWisdomButton: {
    backgroundColor: '#F8F7FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E3FF',
    marginBottom: 12,
  },
  relationshipWisdomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  relationshipWisdomButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#8B5CF6',
  },
  relationshipWisdomButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
  wisdomImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  pingButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  pingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  pingButtonSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
  },
  pingImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
}); 