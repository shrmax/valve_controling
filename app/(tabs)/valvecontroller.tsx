import React, { useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet, ScrollView, Dimensions } from 'react-native';

const ValveController = () => {
  const [valves] = useState(['A', 'B', 'C']);
  const [valveStates, setValveStates] = useState<{[key: string]: boolean}>({});

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>LoRa Valve Controller</Text>

        <Pressable style={styles.connectButton} onPress={() => {}}>
          <Text style={styles.buttonText}>🔌 Connect Device</Text>
        </Pressable>

        {/* Valve Grid */}
        <View style={styles.valveGrid}>
          {valves.map((valve) => (
            <View key={valve} style={styles.valveCard}>
              <Text style={styles.valveLabel}>Valve {valve}</Text>
              <Switch
                value={valveStates[valve] || false}
                onValueChange={(value) => setValveStates(prev => ({ ...prev, [valve]: value }))}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={valveStates[valve] ? '#f4f3f4' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        {/* Command Logs */}
        <View style={styles.logSection}>
          <Text style={styles.logTitle}>📤 Command Sent:</Text>
          <View style={styles.logBox}>
            <Text style={styles.logText}>No commands sent yet</Text>
          </View>

          <Text style={styles.logTitle}>📥 Device Response:</Text>
          <View style={styles.logBox}>
            <Text style={styles.logText}>Waiting for response...</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#f4f7fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    minHeight: screen.height,
  },
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
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  valveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  valveCard: {
    width: (screen.width - 48) / 3, // 3 items with 16px gap
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    margin: 4,
  },
  valveLabel: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 16,
    marginBottom: 8,
  },
  logSection: {
    width: '100%',
    marginVertical: 20,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logText: {
    color: '#4a5568',
    fontSize: 14,
  },
});

export default ValveController;