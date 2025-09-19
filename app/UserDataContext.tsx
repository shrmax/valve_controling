import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const initialUserData = {
  name: "John Doe",
  email: "john.doe@example.com",
  number: "+1 234 567 890",
  picoIp: "192.168.1.100", // Default IP for testing
  zones: [
    {
      name: "Ganapathi",
      valves: ["E", "F", "H"],
      flow: "F",      // command to get flow
      battery: "B"    // command to get battery
    },
    {
      name: "Srinivas",
      valves: ["A", "B", "C", "P", "Q", "R"],
      flow: "F",      // command to get flow
      battery: "B"    // command to get battery
    }
  ]
};

type UserDataType = typeof initialUserData;

const UserDataContext = createContext<{
  userData: UserDataType;
  setUserData: React.Dispatch<React.SetStateAction<UserDataType>>;
}>({
  userData: initialUserData,
  setUserData: () => {},
});

export const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState(initialUserData);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Attempting to load user data from AsyncStorage...');
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('User data loaded successfully:', parsedData);
          setUserData(parsedData);
        } else {
          console.log('No user data found in AsyncStorage. Using initial data.');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        console.log('Attempting to save user data to AsyncStorage:', userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('User data saved successfully.');
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    };
    saveData();
  }, [userData]);

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);
