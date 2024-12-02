import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen'; // No need to redeclare it
import BMICalculator from '../components/BMICalculator';
import FoodChart from '../components/FoodChart';
import WaterReminder from '../components/WaterReminder';
import Workouts from '../components/Workouts';
import YouTubeExercises from '../components/YouTubeExercises';
import ProgressSharing from '../components/ProgressSharing';

// Create Tab and Stack Navigators
const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const BMICalculatorStack = createStackNavigator();
const FoodChartStack = createStackNavigator();
const WaterReminderStack = createStackNavigator();
const WorkoutsStack = createStackNavigator();

// Stack Navigator for HomeScreen and its related screens
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="BMI" component={BMICalculator} />
      <HomeStack.Screen name="Food" component={FoodChart} />
      <HomeStack.Screen name="Water" component={WaterReminder} />
      <HomeStack.Screen name="Workouts" component={Workouts} />
      <HomeStack.Screen name="Exercises" component={YouTubeExercises} />
      <HomeStack.Screen name="Progress" component={ProgressSharing} />
    </HomeStack.Navigator>
  );
}

// Stack Navigator for BMICalculator
function BMICalculatorStackScreen() {
  return (
    <BMICalculatorStack.Navigator>
      <BMICalculatorStack.Screen name="BMI" component={BMICalculator} />
    </BMICalculatorStack.Navigator>
  );
}

// Stack Navigator for FoodChart
function FoodChartStackScreen() {
  return (
    <FoodChartStack.Navigator>
      <FoodChartStack.Screen name="Food" component={FoodChart} />
    </FoodChartStack.Navigator>
  );
}

// Stack Navigator for WaterReminder
function WaterReminderStackScreen() {
  return (
    <WaterReminderStack.Navigator>
      <WaterReminderStack.Screen name="Water" component={WaterReminder} />
    </WaterReminderStack.Navigator>
  );
}

// Stack Navigator for Workouts
function WorkoutsStackScreen() {
  return (
    <WorkoutsStack.Navigator>
      <WorkoutsStack.Screen name="Workouts" component={Workouts} />
    </WorkoutsStack.Navigator>
  );
}

// Main Tab Navigator
export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Set icon names based on the tab's name
          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'BMI':
              iconName = focused ? 'calculator' : 'calculator-outline';
              break;
            case 'Food':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Water':
              iconName = focused ? 'water' : 'water-outline';
              break;
            case 'Workouts':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            default:
              iconName = 'home'; // Default icon
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Tab Screens with corresponding stack components */}
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="BMI" component={BMICalculatorStackScreen} options={{ title: 'BMI' }} />
      <Tab.Screen name="Food" component={FoodChartStackScreen} options={{ title: 'Food Chart' }} />
      <Tab.Screen name="Water" component={WaterReminderStackScreen} options={{ title: 'Water Reminder' }} />
      <Tab.Screen name="Workouts" component={WorkoutsStackScreen} options={{ title: 'Workouts' }} />
    </Tab.Navigator>
  );
}
