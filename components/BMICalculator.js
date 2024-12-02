import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function BMICalculator() {
  const userSession = useAuth();
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
  });
  const [bmi, setBmi] = useState(null);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const slideAnim = useState(new Animated.Value(-50))[0];

  useEffect(() => {
    startEntryAnimations();
  }, []);

  const startEntryAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetAnimations = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    slideAnim.setValue(-50);
  };

  const calculateBMI = async () => {
    if (!validateInput()) return;

    try {
      const response = await fetch('http://10.11.146.131:8080/bmi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          user: userSession.userSession,
        }),
      });

      if (!response.ok) {
        Alert.alert('Error', 'Failed to calculate BMI. Please check your input.');
        return;
      }

      const result = await response.json();
      setBmi(result);

      // Reset animations and start new success animation
      resetAnimations();
      startEntryAnimations();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      console.error(error);
    }
  };

  const validateInput = () => {
    const { weight, height, age } = formData;
    if (!weight || !height || !age) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (parseFloat(weight) <= 0 || parseFloat(height) <= 0 || parseInt(age, 10) <= 0) {
      Alert.alert('Error', 'Please enter valid values');
      return false;
    }
    return true;
  };

  const renderBMICategory = () => {
    if (!bmi) return null;

    let category = '';
    let color = '';

    if (bmi.bmi < 18.5) {
      category = 'Underweight';
      color = '#3498db';
    } else if (bmi.bmi < 25) {
      category = 'Normal Weight';
      color = '#2ecc71';
    } else if (bmi.bmi < 30) {
      category = 'Overweight';
      color = '#f1c40f';
    } else {
      category = 'Obese';
      color = '#e74c3c';
    }

    return (
      <Animated.View
        style={[
          styles.resultContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.bmiValue}>BMI: {bmi.bmi.toFixed(2)}</Text>
        <Text style={[styles.bmiCategory, { color }]}>{category}</Text>
        <Text style={styles.bmiDescription}>{bmi.recommendation || 'Stay healthy!'}</Text>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>BMI Calculator</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              keyboardType="numeric"
              value={formData.weight}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, weight: value }))
              }
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              keyboardType="numeric"
              value={formData.height}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, height: value }))
              }
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Age"
              keyboardType="numeric"
              value={formData.age}
              onChangeText={(value) =>
                setFormData((prev) => ({ ...prev, age: value }))
              }
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={styles.genderSelector}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={styles.genderSelectorText}>
                Gender: {formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={calculateBMI}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Calculate BMI</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {renderBMICategory()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#2d3436',
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  genderSelector: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#dfe6e9',
  },
  genderSelectorText: {
    fontSize: 16,
    color: '#2d3436',
  },
  button: {
    backgroundColor: '#0984e3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  genderButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    marginBottom: 10,
  },
  genderButtonActive: {
    backgroundColor: '#0984e3',
    borderColor: '#0984e3',
  },
  genderButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#2d3436',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  cancelButton: {
    padding: 15,
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#e74c3c',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  bmiCategory: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  bmiDescription: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 22,
  },
});