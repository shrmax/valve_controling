import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useUserData } from './_UserDataContext';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

type Zone = {
  name: string;
  valves: string[];
  flow: string;
  battery: string;
};

export default function EditZonesValvesPage() {
  const { userData, setUserData } = useUserData();
  const [zones, setZones] = useState<Zone[]>(userData.zones);
  const [newZoneName, setNewZoneName] = useState('');
  const [editZoneIndex, setEditZoneIndex] = useState<number | null>(null);
  const [editZoneName, setEditZoneName] = useState('');
  const [editFlow, setEditFlow] = useState('');
  const [editBattery, setEditBattery] = useState('');
  const [editValves, setEditValves] = useState<string[]>([]);
  const [newValveInput, setNewValveInput] = useState('');
  const [zoneEditModalVisible, setZoneEditModalVisible] = useState(false);
  const [picoIp, setPicoIp] = useState(userData.picoIp || '');

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handleAddZone = () => {
    if (newZoneName.trim() === '') {
      Alert.alert('Error', 'Zone name cannot be empty.');
      return;
    }
    const newZone: Zone = {
      name: newZoneName.trim(),
      valves: [],
      flow: '',
      battery: '',
    };
    setZones([...zones, newZone]);
    setNewZoneName('');
  };

  const handleRemoveZone = (index: number) => {
    Alert.alert(
      'Remove Zone',
      `Are you sure you want to remove "${zones[index].name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            const updatedZones = zones.filter((_, i) => i !== index);
            setZones(updatedZones);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const openEditZoneModal = (index: number) => {
    setEditZoneIndex(index);
    setEditZoneName(zones[index].name);
    setEditFlow(zones[index].flow);
    setEditBattery(zones[index].battery);
    setEditValves([...zones[index].valves]);
    setNewValveInput('');
    setZoneEditModalVisible(true);
  };

  const handleSaveZoneEdit = () => {
    if (editZoneIndex !== null) {
      if (editZoneName.trim() === '') {
        Alert.alert('Error', 'Zone name cannot be empty.');
        return;
      }
      const updatedZones = [...zones];
      updatedZones[editZoneIndex] = {
        ...updatedZones[editZoneIndex],
        name: editZoneName.trim(),
        flow: editFlow,
        battery: editBattery,
        valves: editValves.filter(v => v.trim() !== ''),
      };
      setZones(updatedZones);
      setZoneEditModalVisible(false);
      setEditZoneIndex(null);
    }
  };

  const handleAddValve = () => {
    const valve = newValveInput.trim().toUpperCase();
    if (valve && !editValves.includes(valve)) {
      setEditValves([...editValves, valve]);
      setNewValveInput('');
    }
  };

  const handleRemoveValve = (valveToRemove: string) => {
    setEditValves(editValves.filter((valve) => valve !== valveToRemove));
  };

  const handleSaveConfiguration = () => {
    setUserData({ ...userData, zones: zones, picoIp: picoIp });
    Alert.alert('Success', 'Configuration saved successfully!');
    router.back();
  };

  const styles = createStyles(themeColors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Edit Zones and Valves</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pico IP Configuration</Text>
          <TextInput
            style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon, fontSize: 18, paddingVertical: 15 }]}
            placeholder="Pico IP Address"
            placeholderTextColor="#999"
            value={picoIp}
            onChangeText={setPicoIp}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Zone</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon, fontSize: 18, paddingVertical: 15 }]}
              placeholder="New Zone Name"
              placeholderTextColor="#999"
              value={newZoneName}
              onChangeText={setNewZoneName}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddZone}>
              <Icon name="plus-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Zones</Text>
          {zones.length === 0 ? (
            <Text style={styles.noZonesText}>No zones configured.</Text>
          ) : (
            zones.map((zone, index) => (
              <View key={index} style={styles.zoneItem}>
                <Text style={styles.zoneItemName}>{zone.name}</Text>
                <Text style={styles.zoneItemValves}>Valves: {zone.valves.join(', ') || 'None'}</Text>
                <Text style={styles.zoneItemDetail}>Flow: {zone.flow || 'N/A'}</Text>
                <Text style={styles.zoneItemDetail}>Battery: {zone.battery || 'N/A'}</Text>
                <View style={styles.zoneItemActions}>
                  <TouchableOpacity onPress={() => openEditZoneModal(index)} style={styles.actionButton}>
                    <Icon name="pencil" size={20} color="#2563eb" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveZone(index)} style={[styles.actionButton, { marginLeft: 10 }]}>
                    <Icon name="delete" size={20} color="#e53935" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveConfiguration}>
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Zone Edit Modal */}
      <Modal
        visible={zoneEditModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setZoneEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalBox}>
            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Edit Zone</Text>
              <Text style={styles.inputLabel}>Zone Name:</Text>
              <TextInput
              
                style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon, fontSize: 18, paddingVertical: 15 }]}
                value={editZoneName}
                onChangeText={setEditZoneName}
                placeholder="Zone Name"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputLabel}>Flow:</Text>
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon, fontSize: 18, paddingVertical: 15 }]}
                value={editFlow}
                onChangeText={setEditFlow}
                placeholder="Flow"
                placeholderTextColor="#999"
                autoCapitalize='characters'
                maxLength={1}
              />
              <Text style={styles.inputLabel}>Battery:</Text>
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: themeColors.icon, fontSize: 18, paddingVertical: 15 }]}
                value={editBattery}
                onChangeText={setEditBattery}
                placeholder="Battery"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputLabel}>Valves:</Text>
              <View style={styles.valveInputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0, color: themeColors.text, borderColor: themeColors.icon, fontSize: 18, paddingVertical: 15 }]}
                  value={newValveInput}
                  onChangeText={setNewValveInput}
                  placeholder="Add valve (e.g. X)"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  maxLength={2}
                />
                <Pressable style={styles.addValveBtn} onPress={handleAddValve}>
                  <Icon name="plus-circle" size={26} color="#4caf50" />
                </Pressable>
              </View>
              <View style={styles.valveChipsContainer}>
                {editValves.map((valve) => (
                  <View key={valve} style={[styles.valveChip, { backgroundColor: themeColors.tint }]}>
                    <Text style={{ color: themeColors.text, fontWeight: 'bold' }}>{valve}</Text>
                    <Pressable onPress={() => handleRemoveValve(valve)} hitSlop={10}>
                      <Icon name="close-circle" size={18} color="#e53935" style={{ marginLeft: 2 }} />
                    </Pressable>
                  </View>
                ))}
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.modalBtn} onPress={() => setZoneEditModalVisible(false)}>
                  <Text style={{ color: '#2268ad', fontWeight: 'bold' }}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalBtn, { marginLeft: 12 }]} onPress={handleSaveZoneEdit}>
                  <Text style={{ color: '#4caf50', fontWeight: 'bold' }}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (themeColors: (typeof Colors.light) & { contentBackground?: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: themeColors.text,
    textAlign: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  section: {
    marginBottom: 30,
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: themeColors.tint,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc', // Default border color
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: themeColors.background, // Ensure background is theme compatible
    color: themeColors.text, // Ensure text color is theme compatible
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 10,
  },
  noZonesText: {
    textAlign: 'center',
    color: themeColors.text,
    fontSize: 16,
    fontStyle: 'italic',
  },
  zoneItem: {
    backgroundColor: themeColors.background,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  zoneItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.text,
    marginBottom: 5,
  },
  zoneItemValves: {
    fontSize: 16,
    color: themeColors.text,
    marginBottom: 5,
  },
  zoneItemDetail: {
    fontSize: 16,
    color: themeColors.text,
    marginBottom: 3,
  },
  zoneItemActions: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    maxHeight: '80%', // Add maxHeight to prevent modal from taking full height
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  // Add a style for the scrollable content inside the modal
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.tint,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: themeColors.text,
    marginBottom: 8,
    marginTop: 10,
    fontWeight: 'bold',
  },
  valveInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addValveBtn: {
    marginLeft: 10,
    padding: 2,
  },
  valveChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 15,
  },
  valveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb', // Default chip background
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});
