import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Make sure you have this package installed

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View
} from 'react-native';
import { useUserData } from '../UserDataContext'; // Add this import
import { Colors } from '../../constants/Colors';

const ValveController = () => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
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
  const [isRefreshingFlow, setIsRefreshingFlow] = useState<boolean>(false);
  const [isRefreshingBattery, setIsRefreshingBattery] = useState<boolean>(false);
  const [isPumpOn, setIsPumpOn] = useState<boolean>(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

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
      const picoIP = userData.picoIp;
      if (!picoIP) {
        setLogs(prev => [`❌ PicoW Error: Pico IP is not set in profile.`, ...prev]);
        ToastAndroid.showWithGravityAndOffset(
          `❌ Pico IP not set. Please set it in your profile.`,
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          0,
          100
        );
        return "";
      }
      const response = await fetch(`http://${picoIP}/?data=${encodeURIComponent(command)}`);
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
      return "ERROR"; // Return a specific error indicator
    }
  };

  const handleValveToggle = async (valve: string, state: boolean) => {
    const command = state ? valve : valve.toLowerCase();
    setLoadingStates(prev => ({ ...prev, [valve]: true }));
    setLogs(prev => [`📤 Sent ${command}`, ...prev]);

    const ress = await sendToPicoW(command, "valve");
    setLoadingStates(prev => ({ ...prev, [valve]: false }));

    // Check if the response matches the expected command
    if (ress === command) {
      setValveStates(prev => ({ ...prev, [valve]: state }));
      ToastAndroid.showWithGravityAndOffset(
        `Valve ${valve} turned ${state ? 'ON' : 'OFF'}`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        0,
        100
      );
    } else if (ress === "ERROR") {
      // State remains unchanged, error message already logged by sendToPicoW
    } else {
      setLogs(prev => [`⚠️ Irrelevant response for Valve ${valve}: "${ress}"`, ...prev]);
      ToastAndroid.showWithGravityAndOffset(
        `⚠️ Valve ${valve} command rejected or irrelevant response`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        0,
        100
      );
    }
  };

  const handlePumpToggle = async () => {
    const newState = !isPumpOn;
    const command = newState ? "P" : "p";

    Alert.alert(
      "Confirm Pump Action",
      `Are you sure you want to turn the pump ${newState ? 'ON' : 'OFF'}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoadingStates(prev => ({ ...prev, pump: true }));
            setLogs(prev => [`📤 Sent ${command} for Pump`, ...prev]);

            const ress = await sendToPicoW(command, "valve");
            setLoadingStates(prev => ({ ...prev, pump: false }));

            // Check if the response matches the expected command
            if (ress === command) {
              setIsPumpOn(newState);
              ToastAndroid.showWithGravityAndOffset(
                `Pump turned ${newState ? 'ON' : 'OFF'}`,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                0,
                100
              );
            } else if (ress === "ERROR") {
              // State remains unchanged, error message already logged by sendToPicoW
            } else {
              setLogs(prev => [`⚠️ Irrelevant response for Pump: "${ress}"`, ...prev]);
              ToastAndroid.showWithGravityAndOffset(
                `⚠️ Pump command rejected or irrelevant response`,
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                0,
                100
              );
            }
          },
        },
      ]
    );
  };

  const handleRefreshFlow = async () => {
    setIsRefreshingFlow(true);
    try {
      const flowCmd = selectedZoneData?.flow || "F";
      const flowRes = await sendToPicoW(flowCmd, "flow");
      setFlowValue(flowRes || "--");
    } catch {
      setLogs(prev => [`❌ Flow refresh failed`, ...prev]);
    }
    setIsRefreshingFlow(false);
  };

  const handleRefreshBattery = async () => {
    setIsRefreshingBattery(true);
    try {
      const batteryCmd = selectedZoneData?.battery || "B";
      const batteryRes = await sendToPicoW(batteryCmd, "flow");
      setBatteryValue(batteryRes || "--");
    } catch {
      setLogs(prev => [`❌ Battery refresh failed`, ...prev]);
    }
    setIsRefreshingBattery(false);
  };

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>AquaFlow Controller</Text>

        <View style={styles.pickerWrapper}>
          <Text style={styles.dropdownLabel}>Select Zone:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedZone}
              onValueChange={(itemValue) => setSelectedZone(itemValue)}
              style={{ color: themeColors.text, height: 50 }}
              mode='dropdown'
              dropdownIconColor={themeColors.text}
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
              {loadingStates[valve] ? (
                <ActivityIndicator size="small" color="#2268ad" />
              ) : (
                <Switch
                  value={!!valveStates[valve]}
                  onValueChange={(value) => handleValveToggle(valve, value)}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor="#f4f3f4"
                  disabled={loadingStates[valve]}
                />
              )}
            </View>
          ))}
        </View>
        <View style={styles.pumpBox}>
  <Icon name="water-pump" size={36} color="#2268ad" />
  <Text style={styles.pumpLabel}>Pump</Text>
  <Pressable
    style={({ pressed }) => [
      styles.pumpButton,
      { backgroundColor: isPumpOn ? '#f44336' : '#4CAF50' },
      (pressed || loadingStates.pump) && { opacity: 0.8 }
    ]}
    onPress={handlePumpToggle}
    disabled={loadingStates.pump}
  >
    {loadingStates.pump ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : (
      <Text style={styles.pumpButtonText}>{isPumpOn ? 'Turn OFF' : 'Turn ON'}</Text>
    )}
  </Pressable>
</View>


        <View style={styles.statusRow}>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Flow</Text>
            <Text style={styles.statusValue}>{flowValue}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                isRefreshingFlow && { opacity: 0.5 },
                pressed && { backgroundColor: "#e0e7ef" }
              ]}
              onPress={handleRefreshFlow}
              disabled={isRefreshingFlow}
            >
              {isRefreshingFlow ? <ActivityIndicator size="small" color="#2268ad" /> : <Icon name="refresh" size={24} color="#2268ad" />}
            </Pressable>
          </View>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Battery</Text>
            <Text style={styles.statusValue}>{batteryValue}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                isRefreshingBattery && { opacity: 0.5 },
                pressed && { backgroundColor: "#e0e7ef" }
              ]}
              onPress={handleRefreshBattery}
              disabled={isRefreshingBattery}
            >
              {isRefreshingBattery ? <ActivityIndicator size="small" color="#2268ad" /> : <Icon name="refresh" size={24} color="#2268ad" />}
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

const createStyles = (themeColors: (typeof Colors.light) & { contentBackground?: string }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    minHeight: screen.height,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themeColors.tint,
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
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  valveLabel: {
    fontWeight: '600',
    color: themeColors.text,
    fontSize: 16,
    marginBottom: 8,
  },
  logTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: themeColors.tint,
    marginBottom: 8,
  },
  logBox: {
    backgroundColor: themeColors.contentBackground || themeColors.background,
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
    color: themeColors.text,
    fontSize: 14,
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: themeColors.contentBackground || themeColors.background,
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
    color: themeColors.text,
  },
  pickerContainer: {
    backgroundColor: themeColors.contentBackground || themeColors.background, // Ensure background adapts to theme
    borderRadius: 6,
    borderWidth: 1,
    borderColor: themeColors.icon,
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
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 10,
    padding: 18,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
  },
  statusLabel: {
    fontSize: 14,
    color: themeColors.text,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: themeColors.tint,
    marginBottom: 8,
  },
  iconButton: {
    marginTop: 6,
    padding: 8,
    borderRadius: 20,
    backgroundColor: themeColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  pumpBox: {
    backgroundColor: themeColors.contentBackground || themeColors.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    elevation: 3,
  },
  pumpLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: themeColors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  pumpButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 2,
  },
  pumpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ValveController;
