import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import GunSecici from '../components/GunSecici';

export default function UyeEkleScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [note, setNote] = useState('');

  const handleEkle = async () => {
    if (!name) return Alert.alert('Uyarı', 'İsim zorunludur');
    try {
      const resp = await fetch('https://wspor.onrender.com/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, date_of_birth: dateOfBirth, registration_date: new Date().toISOString().slice(0, 10), note }),
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
      <GunSecici value={dateOfBirth} onChange={val => {
        if (val === 'SELECT_FROM_TAKVIM') {
          navigation.navigate('Takvim', { onSelectDate: (dateStr) => setDateOfBirth(dateStr) });
        } else {
          setDateOfBirth(val);
        }
      }} />
      <TextInput style={styles.input} placeholder="Not" value={note} onChangeText={setNote} multiline />
      <Button title="Ekle" onPress={handleEkle} color="#1565c0" />

    </ScrollView>
  );
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
