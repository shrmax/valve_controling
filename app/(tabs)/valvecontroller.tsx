import React, { useState } from 'react';
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
  const [valves] = useState<string[]>(['A', 'B', 'C']);
  const [valveStates, setValveStates] = useState<Record<string, boolean>>({});
  const [log, setLog] = useState('No commands sent yet');  
  const [response, setResponse] = useState('Waiting for response...');

  const connectDevice = async () => {
    if (!UsbSerialModule?.connect) {
      Alert.alert('Error', 'USB Serial Module is not available');
      return;
    }

    try {
      const result = await UsbSerialModule.connect();
      console.log('✅ USB Connected:', result);
      setResponse(`Connected: ${result}`);
    } catch (err) {
      console.error('❌ USB Connection failed:', err);
      setResponse(`Connection failed: ${err?.message || err}`);
    }
  };

  const handleValveToggle = async (valve: string, state:boolean) => {
    const command = state ? `ON_${valve}` : valve.toLowerCase();
    setValveStates(prev => ({ ...prev, [valve]: state }));
    setLog(`Sending: ${command}`);

    if (!UsbSerialModule?.sendCommand) {
      Alert.alert('Error', 'sendCommand not available on UsbSerialModule');
      return;
    }

    try {
      const res = await UsbSerialModule.sendCommand(command);
      setResponse(`Device: ${res}`);
    } catch (error) {
      console.error('Send failed:', error);
      setResponse(`Error: ${error?.message || error}`);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>LoRa Valve Controller</Text>

        <Pressable style={styles.connectButton} onPress={connectDevice}>
          <Text style={styles.buttonText}>🔌 Connect Device</Text>
        </Pressable>

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

        <View style={styles.logSection}>
          <Text style={styles.logTitle}>📤 Command Sent:</Text>
          <View style={styles.logBox}>
            <Text style={styles.logText}>{log}</Text>
          </View>

          <Text style={styles.logTitle}>📥 Device Response:</Text>
          <View style={styles.logBox}>
            <Text style={styles.logText}>{response}</Text>
          </View>
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
    color: '#34495e',
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
    color: '#34495e',
    marginBottom: 8,
  },
  logBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 20,
    elevation: 2,
  },
  logText: { color: '#4a5568', fontSize: 14 },
});

export default ValveController;
