import React, { useState } from 'react';
import { ToastAndroid } from 'react-native';

import {
  Alert,
  Dimensions,
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';

const { UsbSerialModule } = NativeModules;

const ValveController = () => {
  const [logs, setLogs] = useState<string[]>([]);

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
      setLogs(prevLogs => [`Connected: ${result}`, ...prevLogs]);
    } catch (err) {
      console.error('❌ USB Connection failed:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setLogs(prevLogs => [`Connection failed: ${errorMessage}`, ...prevLogs]);
    }
    await new Promise(res => setTimeout(res, 300)); // allow slave to stabilize
  };

  const [command, setCommand] = useState('');

  const handleSendCommand = async () => {
    if (!command) {
      Alert.alert('Error', 'Please enter a command');
      return;
    }

    setLogs(prev => [`📤 Sent: ${command}`, ...prev]);

    if (!UsbSerialModule?.sendCommand) {
      Alert.alert('Error', 'sendCommand not available on UsbSerialModule');
      return;
    }

    try {
      const res = await UsbSerialModule.sendCommand(command);
      setLogs(prev => [`📥 Response: ${res.toString().trim()}`, ...prev]);
    } catch (error) {
      console.error('Send failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLogs(prev => [`❌ ${String(errorMessage)}`, ...prev]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Quadra Valve Controller</Text>

        <Pressable style={styles.connectButton} onPress={connectDevice}>
          <Text style={styles.buttonText}>🔌 Connect Device</Text>
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Enter command"
          value={command}
          onChangeText={setCommand}
        />

        <Pressable style={styles.submitButton} onPress={handleSendCommand}>
          <Text style={styles.buttonText}>Send Command</Text>
        </Pressable>

        <Text style={styles.logTitle}>📝Command Logs:</Text>
        <View style={styles.logBox}>
          <ScrollView
            nestedScrollEnabled // ✅ lets this ScrollView handle its own vertical drag on Android
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={true}
            scrollEventThrottle={16}
          >
            {logs.map((line, idx) => (
              <Text key={idx} style={styles.logText}>
                {line}
              </Text>
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
  connectButton: {
    backgroundColor: '#d3d3d3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  buttonText: { fontSize: 16, fontWeight: '500', color: 'white' },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '100%',
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
    height: 180, // Fixed height
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
});

export default ValveController;
