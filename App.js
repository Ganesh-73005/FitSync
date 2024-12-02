import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './hooks/useAuth';  // Import AuthProvider and useAuth hook
import BMICalculatorScreen from './components/BMICalculator';  // Import your BMI Calculator component
import FoodChartScreen from './components/FoodChart';
import WaterReminderScreen from './components/WaterReminder';
import WorkoutsScreen from './components/Workouts';
import AuthScreen from './screens/AuthScreen';  // Import AuthScreen
import { StyleSheet, View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Dimensions } from 'react-native';

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main App Stack Navigator (if logged in)
const MainStack = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'BMI') {
          iconName = focused ? 'calculator' : 'calculator-outline';
        } else if (route.name === 'Food') {
          iconName = focused ? 'restaurant' : 'restaurant-outline';
        } else if (route.name === 'Water') {
          iconName = focused ? 'water' : 'water-outline';
        } else if (route.name === 'Workouts') {
          iconName = focused ? 'fitness' : 'fitness-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="BMI" component={BMICalculatorScreen} />
    <Tab.Screen name="Food" component={FoodChartScreen} />
    <Tab.Screen name="Water" component={WaterReminderScreen} />
    <Tab.Screen name="Workouts" component={WorkoutsScreen} />
  </Tab.Navigator>
);

export default function App() {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <NavigationContainer>
        {user ? (
          <MainStack />  // Show main app navigation if user is logged in
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Login' }} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  // Your styles here
});
