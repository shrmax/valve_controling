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
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUserData(JSON.parse(storedData));
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
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
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
