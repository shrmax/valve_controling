import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ToastAndroid, Switch, Alert
} from 'react-native';

//import UsbSerialModule from '../modules/UsbSerialModule'; // Native module

const ValveControlScreen = () => {
  const [valveStates, setValveStates] = useState<{ [key: string]: boolean }>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [usePicoNetwork, setUsePicoNetwork] = useState(false);

  const valves = ['A', 'B', 'C'];

  const sendToPicoW = async (command: string) => {
    try {
      const picoIP = 'http://192.168.4.1'; // Pico W hotspot IP
      const response = await fetch(`${picoIP}/?data=${encodeURIComponent(command)}`);
      const resText = await response.text();

      setLogs(prev => [`🌐 PicoW Response: ${resText.trim()}`, ...prev]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs(prev => [`❌ PicoW Error: ${msg}`, ...prev]);
    }
  };

  const handleValveToggle = async (valve: string, state: boolean) => {
    const command = state ? valve : valve.toLowerCase();
    setValveStates(prev => ({ ...prev, [valve]: state }));
    setLogs(prev => [`📤 Sent ${command}`, ...prev]);

    if (usePicoNetwork) {
      await sendToPicoW(command);
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
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Valve Controller</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <Text style={{ marginRight: 10 }}>Use Pico (HTTP)</Text>
        <Switch
          value={usePicoNetwork}
          onValueChange={setUsePicoNetwork}
          trackColor={{ false: '#767577', true: '#3498db' }}
          thumbColor="#f4f3f4"
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
        {valves.map(valve => (
          <TouchableOpacity
            key={valve}
            onPress={() => handleValveToggle(valve, !valveStates[valve])}
            style={{
              backgroundColor: valveStates[valve] ? '#4caf50' : '#f44336',
              padding: 16,
              borderRadius: 8,
              minWidth: 80,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>{valve}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }}>
        {logs.map((log, idx) => (
          <Text key={idx} style={{ marginVertical: 2 }}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default ValveControlScreen;
