import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Award } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const BraveryBadge = () => {
  return (
    <View style={styles.container}>
      <Award color="#FFD700" size={24} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
});

export default BraveryBadge; 