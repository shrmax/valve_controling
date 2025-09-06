import React, { useState } from 'react';


import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserData } from './UserDataContext';
import { Alert } from 'react-native'; // Import Alert for displaying messages

export default function LoginPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const theme = useColorScheme();
  const router = useRouter();
  const { setUserData } = useUserData();

  // Simulated authentication function
  const authenticateUser = (email: string, pass: string) => {
    // Replace with actual API call in a real application
    if (email === 'test@example.com' && pass === 'password123') {
      return {
        name: 'Test User',
        email: 'test@example.com',
        number: '+1 987 654 3210',
        picoIp: '192.168.0.100', // Add picoIp field
        zones: [
          {
            name: 'Test Zone 1',
            valves: ['X', 'Y'],
            flow: 'A',
            battery: 'C',
          },
          {
            name: 'Test Zone 2',
            valves: ['Z'],
            flow: 'B',
            battery: 'D',
          },
        ],
      };
    }
    return null;
  };

  const handleLogin = () => {
    const authenticatedUser = authenticateUser(emailOrPhone, password);
    if (authenticatedUser) {
      setUserData(authenticatedUser);
      router.replace('/(tabs)/valvecontroller');
    } else {
      Alert.alert('Login Failed', 'Invalid email/phone or password.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email or Phone Input */}
      <TextInput
        style={[styles.input,
          {color: theme === 'dark' ? '#fff' : '#000'}
        ]}
        placeholder="Email or Phone Number"
        placeholderTextColor="#999"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        keyboardType="email-address"
      />

      {/* Password Input with Eye Icon */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput,
            {color: theme === 'dark' ? '#fff' : '#000'}
          ]}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Icon
            name={showPassword ? 'eye-off' : 'eye'}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#fff',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: '#2563eb',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 17,
    fontSize: 16,
    marginBottom: 20,
   
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 30,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
});
