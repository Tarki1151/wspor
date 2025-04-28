import React from 'react';
import { Platform, TouchableOpacity, Text, View, StyleSheet } from 'react-native';

// Gün.ay.yıl formatı
function formatDateTR(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// Ortak gün seçici
export default function GunSecici({ value, onChange }) {
  // Web'de input, mobilde basit bir modal açılabilir (şimdilik placeholder)
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ padding: 8, marginVertical: 8, borderRadius: 6, borderColor: '#ddd', borderWidth: 1 }}
      />
    );
  }
  // Mobilde: tıklanınca takvim ekranı açılacak şekilde bir tetikleyici
  return (
    <TouchableOpacity style={styles.input} onPress={onChange ? () => onChange('SELECT_FROM_TAKVIM') : undefined}>
      <Text>{value ? formatDateTR(value) : 'Tarih seçiniz'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    justifyContent: 'center',
  },
});
