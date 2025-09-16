import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useUserData } from './UserDataContext';
import { initialUserData } from './UserDataContext';

export default function Index() {
  const router = useRouter();
  const { setUserData } = useUserData();

  useEffect(() => {
    // Automatically "log in" with initial user data
    setUserData(initialUserData);
    router.replace('/(tabs)/valvecontroller');
  }, []);

  return null; // This page will not render anything as it immediately redirects
}
