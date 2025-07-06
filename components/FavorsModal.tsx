import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, HandHeart, Coffee, ShoppingCart, Car, Home as HomeIcon, Utensils, Gift, Plus, Coins } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/utils/supabase';

const { width } = Dimensions.get('window');

interface FavorOption {
  id: string;
  category_id: 'food' | 'errands' | 'help' | 'treats';
  title: string;
  description: string;
  points: number;
  icon: string;
}

const categoryDetails = {
  all: { name: 'All Favors', icon: HandHeart, color: '#FF8C42' },
  food: { name: 'Food & Drinks', icon: Coffee, color: '#8B4513' },
  errands: { name: 'Errands', icon: ShoppingCart, color: '#4ECDC4' },
  help: { name: 'Home Help', icon: HomeIcon, color: '#FFEAA7' },
  treats: { name: 'Treats', icon: Gift, color: '#FF69B4' },
};

interface FavorsModalProps {
  visible: boolean;
  onClose: () => void;
  onSendFavor: (favorId: string, favorTitle: string, points: number, customMessage?: string) => void;
  currentFavorPoints: number;
}

export default function FavorsModal({
  visible,
  onClose,
  onSendFavor,
  currentFavorPoints,
}: FavorsModalProps) {
  const [favorTemplates, setFavorTemplates] = useState<FavorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFavor, setSelectedFavor] = useState<FavorOption | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomFavor, setShowCustomFavor] = useState(false);
  const [customFavorTitle, setCustomFavorTitle] = useState('');
  const [customFavorPoints, setCustomFavorPoints] = useState(5);

  useEffect(() => {
    if (visible) {
      fetchFavorTemplates();
    }
  }, [visible]);

  const fetchFavorTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('favor_templates').select('*');
    if (error) {
      Alert.alert('Error', 'Could not fetch favor options.');
      console.error(error);
    } else {
      setFavorTemplates(data as FavorOption[]);
    }
    setLoading(false);
  };

  const filteredFavors = favorTemplates.filter(favor => 
    selectedCategory === 'all' || favor.category_id === selectedCategory
  );

  const handleClose = () => {
    setSelectedFavor(null);
    setCustomMessage('');
    setShowCustomFavor(false);
    setCustomFavorTitle('');
    setCustomFavorPoints(5);
    setSelectedCategory('all');
    onClose();
  };

  const handleSendFavor = () => {
    if (selectedFavor) {
      onSendFavor(selectedFavor.id, selectedFavor.title, selectedFavor.points, customMessage);
      handleClose();
    }
  };

  const handleSendCustomFavor = () => {
    if (customFavorTitle.trim()) {
      onSendFavor('custom', customFavorTitle, customFavorPoints, customMessage);
      handleClose();
    }
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
        decelerationRate="fast"
        snapToInterval={88} // Width of button + margin
        snapToAlignment="start">
        {Object.entries(categoryDetails).map(([id, { name, icon, color }]) => {
          const IconComponent = icon;
          const isSelected = selectedCategory === id;
          return (
            <TouchableOpacity
              key={id}
              style={[
                styles.categoryFilterItem,
                isSelected && styles.selectedCategoryFilter,
              ]}
              onPress={() => setSelectedCategory(id)}
              activeOpacity={0.7}>
              <IconComponent
                color={isSelected ? 'white' : '#666'}
                size={16}
                strokeWidth={isSelected ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.categoryFilterText,
                  isSelected && styles.selectedCategoryFilterText,
                ]}
                numberOfLines={1}>
                {name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Scroll indicators */}
      <View style={styles.scrollIndicators}>
        <LinearGradient
          colors={['rgba(255,248,240,0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.leftScrollIndicator}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', 'rgba(255,248,240,0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.rightScrollIndicator}
          pointerEvents="none"
        />
      </View>
    </View>
  );

  const renderFavorsList = () => (
    <ScrollView style={styles.favorsList} showsVerticalScrollIndicator={false}>
      {/* Custom Favor Button */}
      <TouchableOpacity
        style={styles.customFavorButton}
        onPress={() => setShowCustomFavor(true)}>
        <View style={styles.customFavorIcon}>
          <Plus color="#FF8C42" size={24} />
        </View>
        <View style={styles.customFavorContent}>
          <Text style={styles.customFavorTitle}>Create Custom Favor</Text>
          <Text style={styles.customFavorDescription}>
            Ask for something specific with custom points
          </Text>
        </View>
      </TouchableOpacity>

      {/* Predefined Favors */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8C42" />
          <Text style={styles.loadingText}>Loading favors...</Text>
        </View>
      ) : filteredFavors.length === 0 ? (
        <View style={styles.noFavorsContainer}>
          <Text style={styles.noFavorsText}>No favors found for this category.</Text>
        </View>
      ) : (
        filteredFavors.map((favor) => {
          const categoryColor = categoryDetails[favor.category_id]?.color || '#FF8C42';
          const isSelected = selectedFavor?.id === favor.id;
          return (
            <TouchableOpacity
              key={favor.id}
              style={[
                styles.favorCard,
                isSelected && styles.selectedFavorCard,
              ]}
              onPress={() => setSelectedFavor(favor)}
              activeOpacity={0.7}>
              <View style={styles.favorCardHeader}>
                <View style={[styles.favorIcon, { backgroundColor: categoryColor + '20' }]}>
                  <Text style={styles.favorEmoji}>{favor.icon}</Text>
                </View>
                <View style={styles.favorInfo}>
                  <Text style={styles.favorTitle}>{favor.title}</Text>
                  <Text style={styles.favorDescription}>{favor.description}</Text>
                </View>
                <View style={styles.favorPoints}>
                  <Coins color="#FFD700" size={16} />
                  <Text style={styles.favorPointsText}>{favor.points}</Text>
                </View>
              </View>
              
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <View style={[styles.selectedDot, { backgroundColor: categoryColor }]} />
                  <Text style={[styles.selectedText, { color: categoryColor }]}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );

  const renderCustomFavorForm = () => (
    <View style={styles.customFavorForm}>
      <View style={styles.customFormHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowCustomFavor(false)}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.customFormTitle}>Create Custom Favor</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>What do you need?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Pick up my dry cleaning"
          value={customFavorTitle}
          onChangeText={setCustomFavorTitle}
          maxLength={50}
        />
        <Text style={styles.characterCount}>{customFavorTitle.length}/50</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Favor Points (1-20)</Text>
        <View style={styles.pointsSelector}>
          {[5, 8, 10, 12, 15].map((points) => (
            <TouchableOpacity
              key={points}
              style={[
                styles.pointsOption,
                customFavorPoints === points && styles.selectedPointsOption,
              ]}
              onPress={() => setCustomFavorPoints(points)}>
              <Coins color={customFavorPoints === points ? 'white' : '#FFD700'} size={16} />
              <Text style={[
                styles.pointsOptionText,
                customFavorPoints === points && styles.selectedPointsOptionText,
              ]}>
                {points}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.formLabel}>Additional details (optional)</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Any specific instructions or details..."
          value={customMessage}
          onChangeText={setCustomMessage}
          multiline
          numberOfLines={3}
          maxLength={150}
        />
        <Text style={styles.characterCount}>{customMessage.length}/150</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.sendCustomButton,
          !customFavorTitle.trim() && styles.disabledButton,
        ]}
        onPress={handleSendCustomFavor}
        disabled={!customFavorTitle.trim()}>
        <HandHeart color="white" size={20} />
        <Text style={styles.sendCustomButtonText}>
          Request Favor ({customFavorPoints} points)
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {showCustomFavor ? (
          renderCustomFavorForm()
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Request a Favor</Text>
                <Text style={styles.headerSubtitle}>
                  Use your favor points to ask for help. Your partner earns them when the favor is done.
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X color="#666" size={24} />
              </TouchableOpacity>
            </View>

            {renderCategoryFilter()}
            {renderFavorsList()}

            {selectedFavor && (
              <View style={styles.messageSection}>
                <Text style={styles.messageLabel}>Add a personal message (optional)</Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Please and thank you! 🙏"
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  maxLength={100}
                />
                <Text style={styles.characterCount}>{customMessage.length}/100</Text>
              </View>
            )}
          </>
        )}

        {selectedFavor && !showCustomFavor && (
          <View style={styles.fixedSendButtonContainer}>
            <TouchableOpacity
              style={[styles.fixedSendButton, { backgroundColor: categoryDetails[selectedFavor.category_id]?.color || '#FF8C42' }]}
              onPress={handleSendFavor}
              activeOpacity={0.8}>
              <HandHeart color="white" size={20} />
              <Text style={styles.fixedSendButtonText}>
                Send request
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 8,
    marginRight: -8, // Align icon better with edge
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
  },
  categoryFilterContainer: {
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    position: 'relative',
  },
  categoryFilter: {
    paddingTop: 20,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryFilterItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    width: 88,
    height: 52, // Increased height for better touch target (44pt minimum)
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    // Minimum 44pt touch target as per Apple HIG
    minHeight: 44,
  },
  selectedCategoryFilter: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.02 }],
  },
  categoryFilterText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
    marginTop: 3,
    textAlign: 'center',
    lineHeight: 13,
    paddingHorizontal: 2,
  },
  selectedCategoryFilterText: {
    color: 'white',
  },
  scrollIndicators: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
  leftScrollIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  rightScrollIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  favorsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
    marginTop: 10,
  },
  noFavorsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noFavorsText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  customFavorButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE0B2',
    borderStyle: 'dashed',
    minHeight: 76, // Reduced but still comfortable
  },
  customFavorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customFavorContent: {
    flex: 1,
  },
  customFavorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF8C42',
    marginBottom: 2,
  },
  customFavorDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  favorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 76, // Reduced but still comfortable
  },
  selectedFavorCard: {
    borderColor: '#FF8C42',
    backgroundColor: '#FFF8F0',
  },
  favorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 44, // Apple HIG minimum
  },
  favorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  favorEmoji: {
    fontSize: 24,
  },
  favorInfo: {
    flex: 1,
  },
  favorTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  favorDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 18,
  },
  favorPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    minHeight: 24,
    minWidth: 32,
    justifyContent: 'center',
  },
  favorPointsText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
    marginLeft: 2,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  selectedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  messageSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  messageLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 6,
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 3,
    minHeight: 44, // Apple HIG minimum
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'right',
  },
  customFavorForm: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  customFormTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 4,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  pointsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pointsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 44, // Apple HIG minimum touch target
    minWidth: 56,  // Slightly wider for better visual balance
  },
  selectedPointsOption: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  pointsOptionText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 3,
  },
  selectedPointsOptionText: {
    color: 'white',
  },
  sendCustomButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  sendCustomButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  fixedSendButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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