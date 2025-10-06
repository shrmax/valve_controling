import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_DATA_KEY = 'userData';

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
  const isLoaded = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(USER_DATA_KEY);
        if (storedData) {
          setUserData(JSON.parse(storedData));
          console.log('User data loaded successfully from AsyncStorage.');
        } else {
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(initialUserData));
          setUserData(initialUserData);
          console.log('No user data found in AsyncStorage. Inserting initial data.');
        }
      } catch (error) {
        console.error('Error loading user data from AsyncStorage:', error);
      } finally {
        isLoaded.current = true;
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      if (!isLoaded.current) return; // Don't save until initial load is done
      try {
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        console.log('User data saved successfully to AsyncStorage.');
      } catch (error) {
        console.error('Error saving user data to AsyncStorage:', error);
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
