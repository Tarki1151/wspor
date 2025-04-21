import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TakvimScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Takvim</Text>
      <Text style={styles.subtitle}>Aylık takvim yakında burada olacak.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
