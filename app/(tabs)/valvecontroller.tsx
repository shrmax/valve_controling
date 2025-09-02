import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Make sure you have this package installed

import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { useUserData } from '../UserDataContext'; // Add this import

const ValveController = () => {
  const { userData } = useUserData();

  // Build zoneMap from userData
  const zoneMap: Record<string, string[]> = {};
  userData.zones.forEach(zone => {
    zoneMap[zone.name] = zone.valves;
  });

  const [selectedZone, setSelectedZone] = useState(userData.zones[0]?.name || '');
  const selectedZoneData = userData.zones.find(z => z.name === selectedZone);

  const valves = zoneMap[selectedZone] || [];
  const [valveStates, setValveStates] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [flowValue, setFlowValue] = useState<string>("--");
  const [batteryValue, setBatteryValue] = useState<string>("--");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Convert hex string to ASCII symbols (for valve IDs)
  const hexToAscii = (input: string) => {
    const clean = input.replace(/[^0-9a-fA-F ]/g, '').trim();
    if (!clean) return "";
    return clean.split(" ")
      .map(h => String.fromCharCode(parseInt(h, 16)))
      .join("");
  };

  // Convert hex string to decimal values (for flow readings)
  const hexToDecimal = (input: string) => {
    const clean = input.replace(/[^0-9a-fA-F ]/g, '').trim();
    if (!clean) return "";
    return clean.split(" ")
      .map(h => parseInt(h, 16))
      .filter(n => !isNaN(n))
      .join(" ");
  };

  const sendToPicoW = async (command: string, type: "valve" | "flow"): Promise<string> => {
    try {
      const picoIP = 'http://192.168.1.14:3000';
      const response = await fetch(`${picoIP}/?data=${encodeURIComponent(command)}`);
      const resText = await response.text();

      let parsed = "";
      if (type === "valve") {
        parsed = hexToAscii(resText);
      } else if (type === "flow") {
        parsed = hexToDecimal(resText);
      }

      setLogs(prev => [
        `🌐 PicoW Response [${type}]: ${resText.trim()} → ${parsed}`,
        ...prev
      ]);

      return parsed;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs(prev => [`❌ PicoW Error: ${msg}`, ...prev]);
      return "";
    }
  };

  const handleValveToggle = async (valve: string, state: boolean) => {
    const command = state ? valve : valve.toLowerCase();
    setValveStates(prev => ({ ...prev, [valve]: state }));
    setLogs(prev => [`📤 Sent ${command}`, ...prev]);

    const ress = await sendToPicoW(command, "valve");
    if (ress === "?") {
      setLogs(prev => [`⚠️ Invalid response for Valve ${valve}: "${ress}"`, ...prev]);
      setValveStates(prev => ({ ...prev, [valve]: !state }));
      ToastAndroid.showWithGravityAndOffset(
        `⚠️ Valve ${valve} command rejected`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        0,
        100
      );
      return;
    }

    ToastAndroid.showWithGravityAndOffset(
      `Valve ${valve} turned ${state ? 'ON' : 'OFF'}`,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      0,
      100
    );
  };

  const handleRefreshFlow = async () => {
    setRefreshing(true);
    try {
      const flowCmd = selectedZoneData?.flow || "F";
      const flowRes = await sendToPicoW(flowCmd, "flow");
      setFlowValue(flowRes || "--");
    } catch {
      setLogs(prev => [`❌ Flow refresh failed`, ...prev]);
    }
    setRefreshing(false);
  };

  const handleRefreshBattery = async () => {
    setRefreshing(true);
    try {
      const batteryCmd = selectedZoneData?.battery || "B";
      const batteryRes = await sendToPicoW(batteryCmd, "flow");
      setBatteryValue(batteryRes || "--");
    } catch {
      setLogs(prev => [`❌ Battery refresh failed`, ...prev]);
    }
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Quadra Valve Controller</Text>

        <View style={styles.pickerWrapper}>
          <Text style={styles.dropdownLabel}>Select Zone:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedZone}
              onValueChange={(itemValue) => setSelectedZone(itemValue)}
              style={{ color: '#000', height: 50 }}
              mode='dropdown'
              dropdownIconColor="#000"
            >
              {Object.keys(zoneMap).map((zone) => (
                <Picker.Item label={zone} value={zone} key={zone} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.valveGrid}>
          {valves.map(valve => (
            <View key={valve} style={styles.valveCard}>
              <Text style={styles.valveLabel}>Valve {valve}</Text>
              <Switch
                value={!!valveStates[valve]}
                onValueChange={(value) => handleValveToggle(valve, value)}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor="#f4f3f4"
              />
            </View>
          ))}
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Flow</Text>
            <Text style={styles.statusValue}>{flowValue}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                refreshing && { opacity: 0.5 },
                pressed && { backgroundColor: "#e0e7ef" }
              ]}
              onPress={handleRefreshFlow}
              disabled={refreshing}
            >
              <Icon name="refresh" size={24} color="#2268ad" />
            </Pressable>
          </View>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Battery</Text>
            <Text style={styles.statusValue}>{batteryValue}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                refreshing && { opacity: 0.5 },
                pressed && { backgroundColor: "#e0e7ef" }
              ]}
              onPress={handleRefreshBattery}
              disabled={refreshing}
            >
              <Icon name="refresh" size={24} color="#2268ad" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.logTitle}>📝Command Logs:</Text>
        <View style={styles.logBox}>
          <ScrollView
            nestedScrollEnabled
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
          >
            {logs.map((line, idx) => (
              <Text key={idx} style={styles.logText}>{line}</Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16, minHeight: screen.height },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(34, 104, 173)',
    textAlign: 'center',
    marginVertical: 20,
  },
  valveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 20,
  },
  valveCard: {
    width: (screen.width - 48) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    margin: 4,
  },
  valveLabel: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 16,
    marginBottom: 8,
  },
  logTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'rgb(34, 104, 173)',
    marginBottom: 8,
  },
  logBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
    marginBottom: 20,
    elevation: 2,
    height: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logText: {
    color: '#4a5568',
    fontSize: 14,
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#2c3e50',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  statusBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 18,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
  },
  statusLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2268ad',
    marginBottom: 8,
  },
  iconButton: {
    marginTop: 6,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default ValveController;
