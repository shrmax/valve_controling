import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

const db: any = SQLite.openDatabaseSync('user.db');

const initDatabase = () => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS userData (id INTEGER PRIMARY KEY NOT NULL, data TEXT NOT NULL);',
      [],
      () => console.log('User data table created or already exists.'),
      (_: any, error: any) => console.error('Error creating user data table:', error)
    );
  });
};

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
    initDatabase();
    const loadData = async () => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM userData WHERE id = 1;',
          [],
          (_: any, { rows }: any) => {
            if (rows.length > 0) {
              const parsedData = JSON.parse(rows._array[0].data);
              setUserData(parsedData);
              console.log('User data loaded successfully from SQLite.');
            } else {
              console.log('No user data found in SQLite. Inserting initial data.');
              tx.executeSql(
                'INSERT INTO userData (id, data) VALUES (1, ?);',
                [JSON.stringify(initialUserData)],
                () => setUserData(initialUserData),
                (_: any, error: any) => console.error('Error inserting initial user data:', error)
              );
            }
          },
          (_: any, error: any) => console.error('Error loading user data from SQLite:', error)
        );
      });
    };
    loadData();
  }, []);

  useEffect(() => {
    initDatabase();
    const saveData = async () => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'INSERT OR REPLACE INTO userData (id, data) VALUES (1, ?);',
          [JSON.stringify(userData)],
          () => console.log('User data saved successfully to SQLite.'),
          (_: any, error: any) => console.error('Error saving user data to SQLite:', error)
        );
      });
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
