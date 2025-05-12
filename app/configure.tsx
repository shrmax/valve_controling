import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

export default function ConfigureScreen() {
  return (
     <SafeAreaView style={styles.container}>
    <View >
      <Text  style={styles.text}>Configuration Page</Text>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text>Go Back</Text>
      </Pressable>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    paddingTop:20,
  },
  text:{
    color:'blue',
    fontWeight: 'bold',
  },

  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ddd',
  },
});