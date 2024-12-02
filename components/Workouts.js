import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');

const CARDIO_WORKOUTS = [
  { id: '1', name: 'Running', caloriesPerMinute: 10, icon: 'walk-outline' },
  { id: '2', name: 'Cycling', caloriesPerMinute: 8, icon: 'bicycle-outline' },
  { id: '3', name: 'Swimming', caloriesPerMinute: 12, icon: 'water-outline' },
];

const STRENGTH_WORKOUTS = [
  { id: '4', name: 'Push-ups', caloriesPerRep: 0.5, icon: 'fitness-outline' },
  { id: '5', name: 'Squats', caloriesPerRep: 0.7, icon: 'body-outline' },
  { id: '6', name: 'Pull-ups', caloriesPerRep: 1, icon: 'barbell-outline' },
];

export default function Workouts() {
  const [workoutType, setWorkoutType] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [reps, setReps] = useState('10');
  const [sets, setSets] = useState('3');
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const progress = useSharedValue(0);
  const { user } = useAuth();

  useEffect(() => {
    if (workoutType === 'cardio') {
      setWorkouts(CARDIO_WORKOUTS);
    } else if (workoutType === 'strength') {
      setWorkouts(STRENGTH_WORKOUTS);
    }
  }, [workoutType]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer + 1;
          progress.value = withTiming(newTimer / 60, {
            duration: 1000,
            easing: Easing.linear,
          });
          return newTimer;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const startWorkout = async () => {
    try {
      const response = await fetch('http://10.11.146.131:8080/workouts/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: selectedWorkout.id,
          type: workoutType,
          reps: parseInt(reps),
          sets: parseInt(sets),
        }),
      });
      const data = await response.json();
      setIsActive(true);
      setTimer(0);
      progress.value = 0;
    } catch (error) {
      console.error('Error starting workout:', error);
    }
  };

  const endWorkout = async () => {
    try {
      const duration = timer;
      let calculatedCalories = 0;
      if (workoutType === 'cardio') {
        calculatedCalories = (duration / 60) * selectedWorkout.caloriesPerMinute;
      } else {
        calculatedCalories = parseInt(reps) * parseInt(sets) * selectedWorkout.caloriesPerRep;
      }
      setCaloriesBurned(calculatedCalories);
      console.log(user);
      await fetch('http://10.11.146.131:8080/workouts/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user,
          workoutId: selectedWorkout.id,
          type: workoutType,
          reps: parseInt(reps),
          sets: parseInt(sets),
          duration: duration,
          caloriesBurned: calculatedCalories,
        }),
      });
      setIsActive(false);
      setSelectedWorkout(null);
      progress.value = 0;
    } catch (error) {
      console.error('Error ending workout:', error);
    }
  };

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity
      style={styles.workoutItem}
      onPress={() => setSelectedWorkout(item)}
    >
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.workoutItemGradient}
      >
        <Ionicons name={item.icon} size={24} color="white" />
        <Text style={styles.workoutItemText}>{item.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const workoutGifs = {
    "Pull-ups": require('../assets/Pull-Ups.gif'),
    "Push-ups": require('../assets/Push-Ups.gif'),
    "Squats": require('../assets/Squats.gif'),
    "Running": require('../assets/Running.gif'),
    "Swimming": require('../assets/Swimming.gif'),
    "Cycling": require('../assets/Cycling.gif')
  };

  const renderContent = () => {
    if (!workoutType) {
      return (
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, styles.cardioButton]}
            onPress={() => setWorkoutType('cardio')}
          >
            <Ionicons name="heart-outline" size={40} color="white" />
            <Text style={styles.typeButtonText}>Cardio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, styles.strengthButton]}
            onPress={() => setWorkoutType('strength')}
          >
            <Ionicons name="barbell-outline" size={40} color="white" />
            <Text style={styles.typeButtonText}>Strength</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (!selectedWorkout) {
      return (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          style={styles.workoutList}
          numColumns={2}
        />
      );
    } else if (!isActive) {
      return (
        <View style={styles.selectedWorkoutContainer}>
          <Text style={styles.workoutName}>{selectedWorkout.name}</Text>
          {workoutType === 'strength' && (
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setReps}
                  value={reps}
                  keyboardType="numeric"
                  placeholder="Reps"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setSets}
                  value={sets}
                  keyboardType="numeric"
                  placeholder="Sets"
                />
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.workoutSessionContainer}>
          <Text style={styles.workoutName}>{selectedWorkout.name}</Text>
          <View style={styles.timerContainer}>
            <Animated.View style={[styles.progressBar, progressStyle]} />
            <Text style={styles.timer}>{timer}s</Text>
          </View>
          <Image
            source={workoutGifs[selectedWorkout.name]}
            style={styles.workoutAnimation}
          />
          <TouchableOpacity style={styles.endButton} onPress={endWorkout}>
            <Text style={styles.endButtonText}>End Workout</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Workouts</Text>
        {renderContent()}
        {caloriesBurned > 0 && (
          <Text style={styles.caloriesBurned}>
            Calories Burned: {caloriesBurned.toFixed(2)}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    
    
      paddingTop: 30
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  typeButton: {
    width: width * 0.4,
    height: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    elevation: 5,
  },
  cardioButton: {
    backgroundColor: '#ff7f50',
  },
  strengthButton: {
    backgroundColor: '#4682b4',
  },
  typeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  workoutList: {
    width: '100%',
  },
  workoutItem: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  workoutItemGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  workoutItemText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  selectedWorkoutContainer: {
    width: '100%',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#03a9f4',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    width: 100,
    borderColor: '#03a9f4',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  workoutSessionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  timerContainer: {
    width: '100%',
    height: 40,
    backgroundColor: '#e1f5fe',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#03a9f4',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  timer: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 40,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutAnimation: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 20,
    borderRadius: 10,
  },
  startButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  endButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  endButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  caloriesBurned: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#4caf50',
  },
});

