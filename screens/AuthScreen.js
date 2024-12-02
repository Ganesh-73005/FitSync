import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import HomeScreen from './HomeScreen'; // Import HomeScreen component

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state

  const { signIn, signUp } = useAuth();

  const animation = useSharedValue(0);

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolate(animation.value, [0, 1], ['#3498db', '#e74c3c']);
    return { backgroundColor };
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(animation.value, [0, 1], [0, 180])}deg`;
    return { transform: [{ rotateY }] };
  });

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (isLogin) {
      const result = await signIn(email, password);
      if (result.success) {
        setIsAuthenticated(true); // Set the authenticated state to true
      } else {
        Alert.alert('Error', result.error || 'Login failed.');
      }
    } else {
      const result = await signUp(email, password);
      if (result.success) {
        Alert.alert('Success', 'Account created successfully. Please log in.');
        toggleAuthMode();
      } else {
        Alert.alert('Error', result.error || 'Registration failed.');
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    animation.value = withSpring(isLogin ? 1 : 0);
  };

  // If user is authenticated, return HomeScreen
  if (isAuthenticated) {
    return <HomeScreen />;
  }

  return (
    <Animated.View style={[styles.container, backgroundStyle]}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.title}>{isLogin ? 'Login' : 'Register'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isLogin ? 'Login' : 'Register'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleAuthMode}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.8,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleText: {
    marginTop: 20,
    color: '#3498db',
  },
});
