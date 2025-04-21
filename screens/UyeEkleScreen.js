import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';

export default function UyeEkleScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleEkle = async () => {
    if (!name) return Alert.alert('Uyarı', 'İsim zorunludur');
    try {
      const resp = await fetch('http://localhost:4000/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, date_of_birth: dateOfBirth, registration_date: new Date().toISOString().slice(0, 10) }),
      });
      if (!resp.ok) throw new Error('Sunucu hatası');
      Alert.alert('Başarılı', 'Üye eklendi');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yeni Üye Ekle</Text>
      <TextInput style={styles.input} placeholder="İsim Soyisim*" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Adres" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="Doğum Tarihi (YYYY-MM-DD)" value={dateOfBirth} onChangeText={setDateOfBirth} />
      <Button title="Ekle" onPress={handleEkle} color="#1565c0" />
      {/* Düzenleme modunda ise sil butonu gösterilebilir */}
      {memberId && (
        <>
          <View style={{ height: 10 }} />
          <Button title="Sil" color="#c62828" onPress={() => {
            Alert.alert(
              'Dikkat',
              'Bu üyeyi silmek istediğinize emin misiniz?',
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
    const resp = await fetch(`http://localhost:4000/api/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!resp.ok) throw new Error('Sunucu hatası');
    Alert.alert('Başarılı', 'Üye silindi');
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
