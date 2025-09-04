import React, { useState } from 'react';
import { FlatList, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUserData, initialUserData } from '../UserDataContext';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const ProfilePage = () => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const { userData, setUserData } = useUserData(); // Use context instead of local state
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editFlow, setEditFlow] = useState('');
  const [editBattery, setEditBattery] = useState('');
  const [editValves, setEditValves] = useState<string[]>([]);
  const [newValve, setNewValve] = useState('');
  const [zoneModalVisible, setZoneModalVisible] = useState(false); // State for Zone Edit Modal
  const [picoIpModalVisible, setPicoIpModalVisible] = useState(false); // State for Pico IP Edit Modal
  const [editPicoIp, setEditPicoIp] = useState(''); // State for editing Pico IP

  const openZoneEdit = (idx: number) => {
    setEditIdx(idx);
    setEditFlow(userData.zones[idx].flow);
    setEditBattery(userData.zones[idx].battery);
    setEditValves([...userData.zones[idx].valves]);
    setNewValve('');
    setZoneModalVisible(true);
  };

  const saveZoneEdit = () => {
    if (editIdx !== null) {
      const zones = [...userData.zones];
      zones[editIdx] = {
        ...zones[editIdx],
        flow: editFlow,
        battery: editBattery,
        valves: editValves.filter(v => v.trim() !== '')
      };
      setUserData({ ...userData, zones });
    }
    setZoneModalVisible(false);
    setEditIdx(null);
  };

  const openPicoIpEdit = () => {
    setEditPicoIp(userData.picoIp || ''); // Initialize with current IP or empty string
    setPicoIpModalVisible(true);
  };

  const savePicoIpEdit = () => {
    setUserData({ ...userData, picoIp: editPicoIp });
    setPicoIpModalVisible(false);
  };

  const addValve = () => {
    const val = newValve.trim().toUpperCase();
    if (val && !editValves.includes(val)) {
      setEditValves([...editValves, val]);
      setNewValve('');
    }
  };

  const removeValve = (val: string) => {
    setEditValves(editValves.filter(v => v !== val));
  };

  const router = useRouter();
  const styles = createStyles(themeColors);

  const handleLogout = () => {
    setUserData(initialUserData); // Reset user data to initial state
    router.replace('/'); // Navigate back to the login page
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
          {userData.zones.map((zone, idx) => (
            <View key={zone.name} style={styles.zoneBox}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Pressable
                style={styles.editIcon}
                onPress={() => openZoneEdit(idx)}
                hitSlop={10}
              >
                <Icon name="pencil" size={22} color="#2268ad" />
              </Pressable>
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
            <Pressable
              style={styles.editIcon}
              onPress={openPicoIpEdit}
              hitSlop={10}
            >
              <Icon name="pencil" size={22} color="#2268ad" />
            </Pressable>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

      {/* Zone Edit Modal */}
      <Modal
        visible={zoneModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setZoneModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Zone Values</Text>
            <Text style={styles.inputLabel}>Flow:</Text>
            <TextInput
              style={styles.input}
              value={editFlow}
              onChangeText={setEditFlow}
              placeholder="Flow"
              autoCapitalize='characters'
              maxLength={1}
            />
            <Text style={styles.inputLabel}>Battery:</Text>
            <TextInput
              style={styles.input}
              value={editBattery}
              onChangeText={setEditBattery}
              placeholder="Battery"
            />
            <Text style={[styles.zoneDetail, { marginTop: 8, marginBottom: 4 }]}>Valves:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={newValve}
                onChangeText={setNewValve}
                placeholder="Add valve (e.g. X)"
                autoCapitalize="characters"
                maxLength={2}
              />
              <Pressable style={styles.addValveBtn} onPress={addValve}>
                <Icon name="plus-circle" size={26} color="#4caf50" />
              </Pressable>
            </View>
            <FlatList
              data={editValves}
              keyExtractor={item => item}
              horizontal
              renderItem={({ item }) => (
                <View style={styles.valveChip}>
                  <Text style={{ color: '#2268ad', fontWeight: 'bold' }}>{item}</Text>
                  <Pressable onPress={() => removeValve(item)} hitSlop={10}>
                    <Icon name="close-circle" size={18} color="#e53935" style={{ marginLeft: 2 }} />
                  </Pressable>
                </View>
              )}
              contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}
              showsHorizontalScrollIndicator={false}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <Pressable style={styles.modalBtn} onPress={() => setZoneModalVisible(false)}>
                <Text style={{ color: '#2268ad', fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { marginLeft: 12 }]} onPress={saveZoneEdit}>
                <Text style={{ color: '#4caf50', fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pico IP Edit Modal */}
      <Modal
        visible={picoIpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPicoIpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Pico IP</Text>
            <TextInput
              style={styles.input}
              value={editPicoIp}
              onChangeText={setEditPicoIp}
              placeholder="Enter Pico IP Address"
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <Pressable style={styles.modalBtn} onPress={() => setPicoIpModalVisible(false)}>
                <Text style={{ color: '#2268ad', fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { marginLeft: 12 }]} onPress={savePicoIpEdit}>
                <Text style={{ color: '#4caf50', fontWeight: 'bold' }}>Save</Text>
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
    paddingBottom: 80, // Add padding for the bottom menu bar
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
  editIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 4,
    zIndex: 2,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
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
  inputLabel: {
    fontSize: 14,
    color: themeColors.text,
    marginBottom: 4,
    marginTop: 8,
    fontWeight: 'bold',
  },
  addValveBtn: {
    marginLeft: 8,
    padding: 2,
  },
  valveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.tint,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  logoutButton: {
    backgroundColor: '#e53935', // Red color for logout
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
});
