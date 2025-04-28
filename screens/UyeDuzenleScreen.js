import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import GunSecici from '../components/GunSecici';

export default function UyeDuzenleScreen({ route, navigation }) {
  const { memberId } = route.params;
  const [uye, setUye] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const fetchUye = async () => {
      try {
        const resp = await fetch('http://localhost:4000/api/members?q=');
        const data = await resp.json();
        const found = data.find(u => u.member_id === memberId);
        if (found) {
          setUye(found);
          setName(found?.name || '');
          setPhone(found?.phone || '');
          setEmail(found?.email || '');
          setAddress(found?.address || '');
          setDateOfBirth(found?.date_of_birth || '');
          setNote(found?.note || '');
        }
      } catch (err) {
        Alert.alert('Hata', err.message);
      }
    };
    fetchUye();
  }, [memberId]);

  const handleKaydet = async () => {
    if (!name) return Alert.alert('Uyarı', 'İsim zorunludur');
    try {
      const resp = await fetch(`http://localhost:4000/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address, date_of_birth: dateOfBirth, registration_date: uye?.registration_date || new Date().toISOString().slice(0, 10), note }),
      });
      if (!resp.ok) throw new Error('Sunucu hatası');
      Alert.alert('Başarılı', 'Üye güncellendi');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    }
  };

  if (!uye) return <Text style={{ margin: 20 }}>Yükleniyor...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Üye Düzenle</Text>
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
      <Button title="Kaydet" onPress={handleKaydet} color="#1565c0" />
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
