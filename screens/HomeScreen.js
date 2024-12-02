import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import BMICalculatorScreen from '../components/BMICalculator';
import FoodChartScreen from '../components/FoodChart';
import WaterReminderScreen from '../components/WaterReminder';
import WorkoutsScreen from '../components/Workouts';
import YouTubeExercisesScreen from '../components/YouTubeExercises';
import ProgressSharingScreen from '../components/ProgressSharing';
import Sidebar from '../components/sidebar';
import { useAuth } from '../hooks/useAuth';


const Stack = createStackNavigator();

const HomeContent = ({ navigation }) => {
  const { signOut, userSession } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleUserModal = () => {
    setUserModalVisible(!userModalVisible);
  };

  const features = [
    { name: 'BMI Calculator', icon: 'calculator-outline', screen: 'BMI' },
    { name: 'Food Chart', icon: 'restaurant-outline', screen: 'Food' },
    { name: 'Water Reminder', icon: 'water-outline', screen: 'Water' },
    { name: 'Workouts', icon: 'barbell-outline', screen: 'Workouts' },
    { name: 'YouTube Exercises', icon: 'logo-youtube', screen: 'Exercises' },
    { name: 'Share Your Thoughts', icon: 'share-outline', screen: 'Progress' },
   
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fit-Sync</Text>
        <TouchableOpacity onPress={toggleUserModal}>
          <Ionicons name="person-circle-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/fitness-image.jpeg')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome to Your Fitness Journey</Text>
        <Text style={styles.subtitle}>Achieve your health goals with our comprehensive tools</Text>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureItem}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <Ionicons name={feature.icon} size={40} color="#3498db" />
              <Text style={styles.featureText}>{feature.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={toggleSidebar}
      >
        <Sidebar onClose={toggleSidebar} />
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={userModalVisible}
        onRequestClose={toggleUserModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Session</Text>
            <Text style={styles.modalText}>{userSession || 'Not logged in'}</Text>
            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={toggleUserModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function HomeScreen() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeContent} />
        <Stack.Screen name="BMI" component={BMICalculatorScreen} />
        <Stack.Screen name="Food" component={FoodChartScreen} />
        <Stack.Screen name="Water" component={WaterReminderScreen} />
        <Stack.Screen name="Workouts" component={WorkoutsScreen} />
        <Stack.Screen name="Exercises" component={YouTubeExercisesScreen} />
        <Stack.Screen name="Progress" component={ProgressSharingScreen} />
       
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  featureText: {
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

