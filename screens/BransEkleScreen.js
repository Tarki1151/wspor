import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';

export default function BransEkleScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleEkle = async () => {
    if (!name) return Alert.alert('Uyarı', 'Branş adı zorunludur');
    try {
      const resp = await fetch('http://localhost:4000/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!resp.ok) throw new Error('Sunucu hatası');
      Alert.alert('Başarılı', 'Branş eklendi');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yeni Branş Ekle</Text>
      <TextInput style={styles.input} placeholder="Branş Adı*" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Açıklama" value={description} onChangeText={setDescription} />
      <Button title="Ekle" onPress={handleEkle} color="#1565c0" />
      {/* Düzenleme modunda ise sil butonu gösterilebilir */}
      {branchId && (
        <>
          <View style={{ height: 10 }} />
          <Button title="Sil" color="#c62828" onPress={() => {
            Alert.alert(
              'Dikkat',
              'Bu branşı silmek istediğinize emin misiniz?',
              [
                { text: 'Vazgeç', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: handleSil }
              ]
            );
          }} />
        </>
      )}
    </ScrollView>
  );
}

// Silme fonksiyonu
async function handleSil() {
  try {
    const resp = await fetch(`http://localhost:4000/api/branches/${branchId}`, {
      method: 'DELETE',
    });
    if (!resp.ok) throw new Error('Sunucu hatası');
    Alert.alert('Başarılı', 'Branş silindi');
    navigation.goBack();
  } catch (err) {
    Alert.alert('Hata', err.message);
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
});
