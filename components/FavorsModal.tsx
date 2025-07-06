import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { X, HandHeart, Coffee, ShoppingCart, Car, Chrome as Home, Utensils, Gift, Plus, Coins } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FavorOption {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  color: string;
  category: 'food' | 'errands' | 'help' | 'treats';
}

interface FavorsModalProps {
  visible: boolean;
  onClose: () => void;
  onSendFavor: (favorId: string, favorTitle: string, points: number, customMessage?: string) => void;
  currentFavorPoints: number;
}

const favorOptions: FavorOption[] = [
  // Food & Drinks
  {
    id: 'bring-coffee',
    title: 'Bring Me Coffee',
    description: 'A perfect cup of coffee, just the way I like it',
    points: 5,
    icon: Coffee,
    color: '#8B4513',
    category: 'food',
  },
  {
    id: 'cook-dinner',
    title: 'Cook Dinner Tonight',
    description: 'Surprise me with a delicious home-cooked meal',
    points: 15,
    icon: Utensils,
    color: '#FF6B35',
    category: 'food',
  },
  {
    id: 'order-food',
    title: 'Order My Favorite Food',
    description: 'I\'m craving something special, please order it',
    points: 10,
    icon: Gift,
    color: '#FF8C42',
    category: 'food',
  },
  
  // Errands & Shopping
  {
    id: 'grocery-shopping',
    title: 'Go Grocery Shopping',
    description: 'Pick up groceries from our shopping list',
    points: 12,
    icon: ShoppingCart,
    color: '#4ECDC4',
    category: 'errands',
  },
  {
    id: 'pick-me-up',
    title: 'Pick Me Up',
    description: 'Come get me from this location',
    points: 8,
    icon: Car,
    color: '#45B7D1',
    category: 'errands',
  },
  {
    id: 'run-errand',
    title: 'Run a Quick Errand',
    description: 'Help me with a small task or errand',
    points: 7,
    icon: HandHeart,
    color: '#96CEB4',
    category: 'errands',
  },
  
  // Home Help
  {
    id: 'clean-kitchen',
    title: 'Clean the Kitchen',
    description: 'Take care of the dishes and tidy up',
    points: 10,
    icon: Home,
    color: '#FFEAA7',
    category: 'help',
  },
  {
    id: 'help-with-chores',
    title: 'Help with Chores',
    description: 'Lend a hand with household tasks',
    points: 8,
    icon: HandHeart,
    color: '#DDA0DD',
    category: 'help',
  },
  
  // Treats & Special
  {
    id: 'ice-cream',
    title: 'Bring Me Ice Cream',
    description: 'I need something sweet and cold',
    points: 6,
    icon: Gift,
    color: '#FFB6C1',
    category: 'treats',
  },
  {
    id: 'surprise-treat',
    title: 'Surprise Me with a Treat',
    description: 'Something special to brighten my day',
    points: 12,
    icon: Gift,
    color: '#FF69B4',
    category: 'treats',
  },
];

const categoryFilters = [
  { id: 'all', name: 'All Favors', icon: HandHeart, color: '#FF8C42' },
  { id: 'food', name: 'Food & Drinks', icon: Coffee, color: '#8B4513' },
  { id: 'errands', name: 'Errands', icon: ShoppingCart, color: '#4ECDC4' },
  { id: 'help', name: 'Home Help', icon: Home, color: '#FFEAA7' },
  { id: 'treats', name: 'Treats', icon: Gift, color: '#FF69B4' },
];

export default function FavorsModal({
  visible,
  onClose,
  onSendFavor,
  currentFavorPoints,
}: FavorsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFavor, setSelectedFavor] = useState<FavorOption | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomFavor, setShowCustomFavor] = useState(false);
  const [customFavorTitle, setCustomFavorTitle] = useState('');
  const [customFavorPoints, setCustomFavorPoints] = useState(5);

  const filteredFavors = favorOptions.filter(favor => 
    selectedCategory === 'all' || favor.category === selectedCategory
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilter}
      contentContainerStyle={styles.categoryFilterContent}>
      {categoryFilters.map((category) => {
        const IconComponent = category.icon;
        const isSelected = selectedCategory === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryFilterItem,
              isSelected && styles.selectedCategoryFilter,
              { borderColor: category.color + '40' }
            ]}
            onPress={() => setSelectedCategory(category.id)}>
            <IconComponent
              color={isSelected ? 'white' : category.color}
              size={16}
            />
            <Text
              style={[
                styles.categoryFilterText,
                isSelected && styles.selectedCategoryFilterText,
                { color: isSelected ? 'white' : category.color }
              ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
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
      {filteredFavors.map((favor) => {
        const IconComponent = favor.icon;
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
              <View style={[styles.favorIcon, { backgroundColor: favor.color + '20' }]}>
                <IconComponent color={favor.color} size={24} />
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
                <View style={[styles.selectedDot, { backgroundColor: favor.color }]} />
                <Text style={[styles.selectedText, { color: favor.color }]}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X color="#666" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request a Favor</Text>
          <View style={styles.favorPointsDisplay}>
            <Coins color="#FFD700" size={20} />
            <Text style={styles.favorPointsDisplayText}>{currentFavorPoints}</Text>
          </View>
        </View>

        {showCustomFavor ? (
          renderCustomFavorForm()
        ) : (
          <>
            <View style={styles.heroSection}>
              <View style={styles.heroIcon}>
                <HandHeart color="#FF8C42" size={32} />
              </View>
              <Text style={styles.heroTitle}>Ask for a Favor</Text>
              <Text style={styles.heroSubtitle}>
                Request help from your partner using favor points. When they complete 
                the favor, they earn the points and you spend them.
              </Text>
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
              style={[styles.fixedSendButton, { backgroundColor: selectedFavor.color }]}
              onPress={handleSendFavor}
              activeOpacity={0.8}>
              <HandHeart color="white" size={20} />
              <Text style={styles.fixedSendButtonText}>
                Request "{selectedFavor.title}" ({selectedFavor.points} points)
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
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  favorPointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  favorPointsDisplayText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
    marginLeft: 4,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF8C42' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
  },
  categoryFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    minHeight: 44, // Apple HIG minimum touch target
  },
  selectedCategoryFilter: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  categoryFilterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  selectedCategoryFilterText: {
    color: 'white',
  },
  favorsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  customFavorButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE0B2',
    borderStyle: 'dashed',
    minHeight: 88, // Ensures 44pt minimum touch target with padding
  },
  customFavorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 88, // Ensures 44pt minimum touch target with padding
  },
  selectedFavorCard: {
    borderColor: '#FF8C42',
    backgroundColor: '#FFF8F0',
  },
  favorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 48, // Additional height for better touch experience
  },
  favorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favorPointsText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FF8C42',
    marginLeft: 4,
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
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  messageLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 4,
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
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 44, // Apple HIG minimum touch target
    minWidth: 44,  // Apple HIG minimum touch target
  },
  selectedPointsOption: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  pointsOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginLeft: 4,
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