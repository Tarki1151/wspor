import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UyelerScreen() {
  const [uyeler, setUyeler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState(null);
  const [arama, setArama] = useState('');
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Ekle" onPress={() => navigation.navigate('UyeEkle')} color="#1565c0" />
      ),
      headerShown: true,
    });
  }, [navigation]);

  const fetchUyeler = async (q = '') => {
    setLoading(true);
    setHata(null);
    try {
      const resp = await fetch(`http://localhost:4000/api/members?q=${encodeURIComponent(q)}`);
      if (!resp.ok) throw new Error('Sunucu hatası');
      const data = await resp.json();
      setUyeler(data);
    } catch (err) {
      setHata(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUyeler();
  }, []);

  const handleSearch = () => {
    fetchUyeler(arama);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Üyeler</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Ara..."
          value={arama}
          onChangeText={setArama}
        />
        <Button title="Ara" onPress={handleSearch} />
      </View>
      {loading && <ActivityIndicator size="large" color="#1565c0" style={{ marginVertical: 20 }} />}
      {hata && <Text style={{ color: 'red', marginBottom: 10 }}>{hata}</Text>}
      <FlatList
        data={uyeler}
        keyExtractor={item => item.member_id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('UyeDetay', { memberId: item.member_id })}>
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Telefon: {item.phone || '-'}</Text>
              <Text>Kayıt Tarihi: {item.registration_date}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && <Text>Hiç üye bulunamadı.</Text>}
      />
      <Button title="Yeni Üye Ekle" onPress={() => Alert.alert('Yakında', 'Üye ekleme özelliği yakında eklenecek.')} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
});
