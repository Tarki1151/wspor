import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';

export default function PaketDuzenleScreen({ route, navigation }) {
  const { packageId } = route.params;
  const [paket, setPaket] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('duration');
  const [duration, setDuration] = useState('');
  const [numClasses, setNumClasses] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    const fetchPaket = async () => {
      try {
        const resp = await fetch('http://localhost:4000/api/packages');
        const data = await resp.json();
        const found = data.find(p => p.package_id === packageId);
        if (found) {
          setPaket(found);
          setName(found.name || '');
          setType(found.type || 'duration');
          setDuration(found.duration_days ? String(found.duration_days) : '');
          setNumClasses(found.num_classes ? String(found.num_classes) : '');
          setPrice(found.price ? String(found.price) : '');
        }
      } catch (err) {
        Alert.alert('Hata', err.message);
      }
    };
    fetchPaket();
  }, [packageId]);

  const handleKaydet = async () => {
    if (!name) return Alert.alert('Uyarı', 'Paket adı zorunludur');
    try {
      const resp = await fetch(`http://localhost:4000/api/packages/${packageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          duration: type === 'duration' ? duration : null,
          num_classes: type === 'class' ? numClasses : null,
          price,
        }),
      });
      if (!resp.ok) throw new Error('Sunucu hatası');
      Alert.alert('Başarılı', 'Paket güncellendi');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    }
  };

  if (!paket) return <Text style={{ margin: 20 }}>Yükleniyor...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Paket Düzenle</Text>
      <TextInput style={styles.input} placeholder="Paket Adı*" value={name} onChangeText={setName} />
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <Button
          title="Süreli"
          color={type === 'duration' ? '#1565c0' : '#bbb'}
          onPress={() => setType('duration')}
        />
        <View style={{ width: 10 }} />
        <Button
          title="Derslik"
          color={type === 'class' ? '#1565c0' : '#bbb'}
          onPress={() => setType('class')}
        />
      </View>
      {type === 'duration' ? (
        <TextInput style={styles.input} placeholder="Süre (gün)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
      ) : (
        <TextInput style={styles.input} placeholder="Ders Sayısı" value={numClasses} onChangeText={setNumClasses} keyboardType="numeric" />
      )}
      <TextInput style={styles.input} placeholder="Fiyat" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Button title="Kaydet" onPress={handleKaydet} color="#1565c0" />
      <View style={{ height: 10 }} />
      <Button title="Sil" color="#c62828" onPress={() => {
        Alert.alert(
          'Dikkat',
          'Bu paketi silmek istediğinize emin misiniz?',
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
    const resp = await fetch(`http://localhost:4000/api/packages/${packageId}`, {
      method: 'DELETE',
    });
    if (!resp.ok) throw new Error('Sunucu hatası');
    Alert.alert('Başarılı', 'Paket silindi');
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
