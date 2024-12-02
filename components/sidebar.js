import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Sidebar = ({ onClose }) => {
  const navigation = useNavigation();

  const menuItems = [
    { name: 'Home', icon: 'home-outline', screen: 'Home' },
    { name: 'BMI Calculator', icon: 'calculator-outline', screen: 'BMI' },
    { name: 'Food Chart', icon: 'restaurant-outline', screen: 'Food' },
    { name: 'Water Reminder', icon: 'water-outline', screen: 'Water' },
    { name: 'Workouts', icon: 'barbell-outline', screen: 'Workouts' },
    { name: 'YouTube Exercises', icon: 'logo-youtube', screen: 'Exercises' },
    { name: 'Share Your Thoughts', icon: 'share-outline', screen: 'Progress' },
  ];

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
    onClose();
  };

  return (
    <View style={styles.sidebar}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <ScrollView>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigateToScreen(item.screen)}
          >
            <Ionicons name={item.icon} size={24} color="#fff" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#2c3e50',
    width: '80%',
    height: '100%',
    padding: 20,
    paddingTop: 40,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Sidebar;

