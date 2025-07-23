import React, { useState } from 'react';
import { ToastAndroid } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import {
  Alert,
  Dimensions,
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

const { UsbSerialModule } = NativeModules;

const ValveController = () => {
  const zoneMap: Record<string, string[]> = {
  Ganapathi: ['E', 'F', 'H', 'Q', 'M', 'N'],
  Srinivas: ['A', 'B', 'C', 'P', 'Q', 'R'],
};

const [selectedZone, setSelectedZone] = useState('Ganapathi');
const valves = zoneMap[selectedZone];
const flowData = [
  { valve: 'E', status: 'ON', reading: '2.4' },
  { valve: 'F', status: 'OFF', reading: '0.0' },
  { valve: 'Q', status: 'ON', reading: '3.1' },
];


  const [valveStates, setValveStates] = useState<Record<string, boolean>>({});
  // const [log, setLog] = useState('No commands sent yet');  
  // const [response, setResponse] = useState('Waiting for response...');
  const [logs, setLogs] = useState<string[]>([
]);


  const connectDevice = async () => {
    if (!UsbSerialModule?.connect) {
      Alert.alert('Error', 'USB Serial Module is not available');
      ToastAndroid.showWithGravityAndOffset(
  'USB Serial Module is not available',
  ToastAndroid.LONG,
  ToastAndroid.CENTER,
  0,
  80
);
      return;
      
    }

    try {
      const result = await UsbSerialModule.connect();
      console.log('✅ USB Connected:', result);
      setLogs(prevLogs => [ `Connected: ${result}`, ...prevLogs]);
    } catch (err) {
      console.error('❌ USB Connection failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setLogs(prevLogs => [ `Connection failed: ${errorMessage}`, ...prevLogs]);
    }
    await new Promise(res => setTimeout(res, 300)); // allow slave to stabilize

  };

  const handleValveToggle = async (valve: string, state:boolean) => {
    const command = state ? valve : valve.toLowerCase();
    setValveStates(prev => ({ ...prev, [valve]: state }));
      setLogs(prev => [`📤 Sent ${command}`, ...prev]);

    if (!UsbSerialModule?.sendCommand) {
      Alert.alert('Error', 'sendCommand not available on UsbSerialModule');
      return;
    }

    try {
      const res = await UsbSerialModule.sendCommand(command);
      await new Promise(res => setTimeout(res, 5000)); // Simulate delay for better UX
      console.log('Raw response:', res);
      setLogs(prev => [`📥 Response: ${res.toString().trim()}`, ...prev]);
      
    } catch (error) { 
      console.error('Send failed:', error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      setLogs(prev => [`❌ ${String(errorMessage)}`, ...prev]);
    }
    ToastAndroid.showWithGravityAndOffset(
  `Valve ${valve} turned ${state ? 'ON' : 'OFF'}`,
  ToastAndroid.LONG,
  ToastAndroid.BOTTOM,
  0,
  100
);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Quadra Valve Controller</Text>

        <Pressable style={styles.connectButton} onPress={connectDevice}>
          <Text style={styles.buttonText}>🔌 Connect Device</Text>
        </Pressable>
        <View style={styles.pickerWrapper}>
  <Text style={styles.dropdownLabel}>Select Zone:</Text>
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={selectedZone}
      onValueChange={(itemValue) => setSelectedZone(itemValue)}
      style={{ color: '#000',height: 50 }}
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
        {/* After valve grid */}

        <Text style={styles.sectionTitle}>💧 Flow Meter Readings</Text>
<View style={styles.flowMeterContainer}>
  <View style={styles.flowHeader}>
    <Text style={styles.flowHeaderText}>Valve</Text>
    <Text style={styles.flowHeaderText}>Status</Text>
    <Text style={styles.flowHeaderText}>Reading (L/min)</Text>
  </View>

  <ScrollView style={styles.flowScroll} nestedScrollEnabled>
    {flowData.map((item, idx) => (
      <View key={idx} style={styles.flowRow}>
        <Text style={styles.flowCell}>{item.valve}</Text>
        <Text style={styles.flowCell}>{item.status}</Text>
        <Text style={styles.flowCell}>{item.reading}</Text>
      </View>
    ))}
  </ScrollView>
</View>

<Text style={styles.logTitle}>📝Command Logs:</Text>
       <View style={styles.logBox}>
  <ScrollView  nestedScrollEnabled   // ✅ lets this ScrollView handle its own vertical drag on Android
    automaticallyAdjustKeyboardInsets={true}
    showsVerticalScrollIndicator={true}
    scrollEventThrottle={16}>
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
    // color: '#34495e',
    color: 'rgb(34, 104, 173)',
    textAlign: 'center',
    marginVertical: 20,
  },
  connectButton: {
    backgroundColor: '#d3d3d3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  buttonText: { fontSize: 16, fontWeight: '500' },
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
  logSection: { width: '100%', marginVertical: 20 },
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
    height: 180, // Fixed height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logText: { color: '#4a5568',
     fontSize: 14,
     marginBottom: 8,},
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
  flowMeterContainer: {
  backgroundColor: '#f9fafb',
  borderRadius: 10,
  padding: 12,
  marginBottom: 20,
  elevation: 2,
},

sectionTitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 10,
  color: 'rgb(34, 104, 173)',
},

flowHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 6,
  borderBottomWidth: 1,
  borderColor: '#d1d5db',
  paddingBottom: 4,
},

flowHeaderText: {
  fontSize: 14,
  fontWeight: 'bold',
  flex: 1,
  textAlign: 'center',
  color: '#4b5563',
},

flowScroll: {
  maxHeight: 160,
},

flowRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 6,
},

flowCell: {
  flex: 1,
  textAlign: 'center',
  color: '#374151',
  fontSize: 13,
},


});

export default ValveController;
