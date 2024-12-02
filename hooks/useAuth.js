import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen'; // Import your HomeScreen component
 // Import your SignIn/SignUp component
import AuthScreen from'../screens/AuthScreen';

// Utility to generate a random token
const generateRandomToken = () => {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
};

// Create AuthContext
const AuthContext = createContext({
  userSession: null,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  isAuthenticated: false,
});

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [userSession, setUserSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is logged in when the app starts
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionToken = await AsyncStorage.getItem('sessionToken');
        if (sessionToken) {
          setUserSession(sessionToken);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      }
    };
    checkSession(); // Check session when app loads
  }, []);

  // Sign In Function
  const signIn = async (email, password) => {
    try {
      console.log('Attempting to sign in with:', email);
      
      // Add network timeout and more detailed error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
      try {
        const response = await fetch('http://10.11.146.131:8080/signin', {
          method: 'POST',
          signal: controller.signal,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password }),
        });
  
        clearTimeout(timeoutId);
  
        // Log full response details
        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
  
        // Check if response is OK before parsing
        if (!response.ok) {
          // Try to get error text if available
          const errorText = await response.text();
          console.error('Server Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
  
        // Safely parse JSON
        const data = await response.json();
        console.log('Parsed Response Data:', data);
  
        if (data?.success) {
          const token = data.email;
          await AsyncStorage.setItem('sessionToken', token);
          setUserSession(token);
          setIsAuthenticated(true);
        } else {
          console.error('Login unsuccessful:', data);
          throw new Error(data?.message || 'Login failed');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Detailed error logging
        console.error('Detailed Fetch Error:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack
        });
  
        // Network-specific error handling
        if (fetchError.name === 'AbortError') {
          Alert.alert('Network Timeout', 'The request took too long. Please check your connection.');
        } else if (fetchError.message.includes('Failed to fetch')) {
          Alert.alert('Network Error', 'Unable to connect to the server. Please check your network connection.');
        } else {
          Alert.alert('Sign In Error', fetchError.message || 'Unable to sign in. Please try again.');
        }
      }
    } catch (err) {
      console.error('Unexpected Error in Sign In:', err);
      Alert.alert('Unexpected Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Sign Up Function
  const signUp = async (email, password) => {
    try {
      const response = await fetch('http://10.11.146.131:8080/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        const token = generateRandomToken();
        await AsyncStorage.setItem('sessionToken', token);
        setUserSession(token);
        setIsAuthenticated(true);
      } else {
        console.error('Sign Up Error:', data?.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Sign Up failed:', err.message);
    }
  };

  // Sign Out Function
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('sessionToken');
      setUserSession(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Context Value
  const contextValue = {
    userSession,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Conditional rendering based on authentication status */}
      {isAuthenticated ? <HomeScreen /> : <AuthScreen/>}
    </AuthContext.Provider>
  );
};

// Export useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { user: context.userSession, ...context };
};

