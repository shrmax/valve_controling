import React, { useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserData, initialUserData } from '../UserDataContext';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const ProfilePage = () => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { userData, setUserData } = useUserData();
  const [password, setPassword] = useState('');
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const router = useRouter();
  const styles = createStyles(themeColors);

  const handleLogout = () => {
    setUserData(initialUserData);
    router.replace('/');
  };

  const handleEditConfiguration = () => {
    setPasswordModalVisible(true);
  };

  const verifyPasswordAndRedirect = () => {
    // For now, a simple hardcoded password check
    if (password === '1234') { // Replace with a more secure method in a real app
      setPasswordModalVisible(false);
      setPassword('');
      router.push('/edit-zones-valves'); // Navigate to the new configuration page
    } else {
      Alert.alert('Authentication Failed', 'Incorrect password.');
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <Image
            source={require('../../assets/images/profile.png')}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.detail}>{userData.email}</Text>
          <Text style={styles.detail}>{userData.number}</Text>

          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Zone Stats</Text>
            {userData.zones.map((zone) => (
              <View key={zone.name} style={styles.zoneBox}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneDetail}>
                  Valves: <Text style={styles.zoneValves}>{zone.valves.join(', ')}</Text>
                </Text>
                <Text style={styles.zoneDetail}>Flow: <Text style={styles.zoneValue}>{zone.flow}</Text></Text>
                <Text style={styles.zoneDetail}>Battery: <Text style={styles.zoneValue}>{zone.battery}</Text></Text>
              </View>
            ))}
          </View>

          {/* Pico IP Section */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Pico IP</Text>
            <View style={styles.zoneBox}>
              <Text style={styles.zoneName}>Current IP: <Text style={styles.zoneValue}>{userData.picoIp || 'Not set'}</Text></Text>
            </View>
          </View>

          {/* New Edit Configuration Button */}
          <TouchableOpacity style={styles.editConfigButton} onPress={handleEditConfiguration}>
            <Text style={styles.editConfigButtonText}>Edit Configuration</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>

      {/* Password Entry Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Password to Edit</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <Pressable style={styles.modalBtn} onPress={() => setPasswordModalVisible(false)}>
                <Text style={{ color: '#2268ad', fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { marginLeft: 12 }]} onPress={verifyPasswordAndRedirect}>
                <Text style={{ color: '#4caf50', fontWeight: 'bold' }}>Verify</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfilePage;

const createStyles = (themeColors: (typeof Colors.light) & { contentBackground?: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 80,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: themeColors.tint,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: themeColors.text,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: themeColors.text,
  },
  statsSection: {
    marginTop: 30,
    width: '100%',
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.tint,
    marginBottom: 12,
    textAlign: 'center',
  },
  zoneBox: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 8,
    elevation: 1,
    position: 'relative',
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 4,
  },
  zoneDetail: {
    fontSize: 14,
    color: themeColors.text,
    marginBottom: 2,
  },
  zoneValves: {
    color: themeColors.tint,
    fontWeight: '600',
  },
  zoneValue: {
    color: '#4caf50',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 320,
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.tint,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: themeColors.icon,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: themeColors.background,
    color: themeColors.text,
  },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  logoutButton: {
    backgroundColor: '#e53935',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  editConfigButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  editConfigButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
});
