import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Notifications from 'expo-notifications';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth'
const { width, height } = Dimensions.get('window');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAILY_GOAL = 2000; 
const GLASS_SIZE = 250; 
const USER_EMAIL = 'user@example.com'; // Replace with dynamic session-based email if available


export default function WaterReminder() {
  const { user } = useAuth();
  const [waterLevel, setWaterLevel] = useState(0);
  const animatedWaterLevel = useSharedValue(0);

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadWaterLevel();
  }, []);

  useEffect(() => {
    animatedWaterLevel.value = withSpring(waterLevel / DAILY_GOAL);
  }, [waterLevel]);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
  };

  const loadWaterLevel = async () => {
    try {
      const response = await fetch(`http://10.11.146.131:8080/water?email=${user}`);
      const data = await response.json();
      console.log(user);
      setWaterLevel(data.waterLevel || 0);
    } catch (error) {
      console.error('Error loading water level:', error);
    }
  };

  const addWater = async () => {
    try {
      const response = await fetch('http://10.11.146.131:8080/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: GLASS_SIZE, email: user }),
      });
      const data = await response.json();
      setWaterLevel(data.waterLevel);
    } catch (error) {
      console.error('Error updating water level:', error);
    }
  };

  const resetWaterLevel = async () => {
    try {
      const response = await fetch('http://10.11.146.131:8080/water/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user }),
      });
      const data = await response.json();
      setWaterLevel(data.waterLevel);
    } catch (error) {
      console.error('Error resetting water level:', error);
    }
  };

  const scheduleNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "It's time to drink water!",
        body: "Stay hydrated for better health.",
      },
      trigger: {
        seconds: 3600,
        repeats: true,
      },
    });
    alert('Reminders scheduled every hour!');
  };

  const animatedWaterStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        animatedWaterLevel.value,
        [0, 1],
        [0, height * 0.4]
      ),
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Water Reminder</Text>
      <View style={styles.glassContainer}>
        <View style={styles.glass}>
          <Animated.View style={[styles.water, animatedWaterStyle]}>
            <LinearGradient
              colors={['#4fc3f7', '#29b6f6', '#03a9f4']}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </View>
      </View>
      <Text style={styles.waterLevel}>
        {waterLevel}ml / {DAILY_GOAL}ml
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={addWater}>
        <Ionicons name="water-outline" size={24} color="white" />
        <Text style={styles.buttonText}>Add {GLASS_SIZE}ml</Text>
      </TouchableOpacity>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={scheduleNotification}>
          <Ionicons name="notifications-outline" size={24} color="#03a9f4" />
          <Text style={styles.secondaryButtonText}>Set Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={resetWaterLevel}>
          <Ionicons name="refresh-outline" size={24} color="#03a9f4" />
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  glassContainer: {
    width: width * 0.6,
    height: height * 0.4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  glass: {
    width: '100%',
    height: '100%',
    borderWidth: 6,
    borderColor: '#b3e5fc',
    borderRadius: 20,
    overflow: 'hidden',
  },
  water: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: 14,
  },
  waterLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#03a9f4',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#03a9f4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#03a9f4',
  },
  secondaryButtonText: {
    color: '#03a9f4',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});