import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      {/* Menggunakan Text standar dari react-native agar tidak merah */}
      <Text style={styles.title}>Modal Screen</Text>
      
      <View style={styles.separator} />

      {/* Gunakan light status bar khusus iOS di dalam modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a', // Menyesuaikan tema gelap kamu
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});