import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function PaketlerScreen() {
  const [paketler, setPaketler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Ekle" onPress={() => navigation.navigate('PaketEkle')} color="#1565c0" />
      ),
      headerShown: true,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchPaketler = async () => {
      setLoading(true);
      setHata(null);
      try {
        const resp = await fetch('http://localhost:4000/api/packages');
        if (!resp.ok) throw new Error('Sunucu hatası');
        const data = await resp.json();
        setPaketler(data);
      } catch (err) {
        setHata(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchPaketler();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paketler</Text>
      {loading && <ActivityIndicator size="large" color="#1565c0" style={{ marginVertical: 20 }} />}
      {hata && <Text style={{ color: 'red' }}>{hata}</Text>}
      <FlatList
        data={paketler}
        keyExtractor={item => item.package_id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Tür: {item.type === 'duration' ? 'Süreli' : 'Derslik'}</Text>
            {item.type === 'duration' ? (
              <Text>Süre: {item.duration_days} gün</Text>
            ) : (
              <Text>Ders: {item.num_classes}</Text>
            )}
            <Text>Fiyat: {item.price} TL</Text>
            <Button title="Düzenle" onPress={() => navigation.navigate('PaketDuzenle', { packageId: item.package_id })} color="#1565c0" />
          </View>
        )}
        ListEmptyComponent={!loading && <Text>Hiç paket bulunamadı.</Text>}
      />
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
