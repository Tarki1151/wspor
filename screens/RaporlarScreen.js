import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RaporlarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raporlar</Text>
      <Text style={styles.subtitle}>İstatistikler ve raporlar yakında burada olacak.</Text>
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
