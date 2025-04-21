import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function ProfilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Salon bilgilerinizi düzenleyin.</Text>
      <Button title="Çıkış Yap" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
});
