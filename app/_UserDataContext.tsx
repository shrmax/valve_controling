import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const USER_DATA_KEY = 'userData';

export const initialUserData = {
  name: "John Doe",
  email: "john.doe@example.com",
  number: "+1 234 567 890",
  picoIp: "192.168.4.1",
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
  ],
  pumpState: false, // false = off, true = on
  valveStates: {},  // e.g., { "A": false, "B": true }
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
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          console.log('User data loaded successfully from AsyncStorage.');
          console.log('Pump state:', parsedData.pumpState);
          console.log('Valve states:', parsedData.valveStates);
        } else {
          await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(initialUserData));
          setUserData(initialUserData);
          console.log('No user data found in AsyncStorage. Inserting initial data.');
          console.log('Pump state:', initialUserData.pumpState);
          console.log('Valve states:', initialUserData.valveStates);
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
export const updatePicoIp = (newIp: string) => {
  const { userData, setUserData } = useUserData();
  setUserData({ ...userData, picoIp: newIp });
};


export const useUserData = () => useContext(UserDataContext);

// Example function to update picoIp


// To toggle pump
