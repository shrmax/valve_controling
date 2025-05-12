import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const ProfilePage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        {/* Profile Icon */}
        <Image
          source={require('../../assets/images/profile.png')} // Replace with your image path
          style={styles.profileImage}
        />
        
        {/* User Information */}
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.detail}>john.doe@example.com</Text>
        <Text style={styles.detail}>+1 234 567 890</Text>

        {/* Configure Button */}
        {/* <TouchableOpacity 
          style={styles.configureButton}
          onPress={() =>{ console.log('Configure pressed'),
            router.push('/configure')}

          }
        >
          <Text style={styles.buttonText}>Configure</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#f5f5f5',
    paddingTop: 60,
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
    borderColor: '#333',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  // configureButton: {
  //   marginTop: 30,
  //   backgroundColor: '#007AFF',
  //   paddingVertical: 12,
  //   paddingHorizontal: 35,
  //   borderRadius: 25,
  //   elevation: 3,
  // },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfilePage;