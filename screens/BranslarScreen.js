import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function BranslarScreen() {
  const [branslar, setBranslar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Ekle" onPress={() => navigation.navigate('BransEkle')} color="#1565c0" />
      ),
      headerShown: true,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchBranslar = async () => {
      setLoading(true);
      setHata(null);
      try {
        const resp = await fetch('https://wspor.onrender.com/api/branches');
        if (!resp.ok) throw new Error('Sunucu hatası');
        const data = await resp.json();
        setBranslar(data);
      } catch (err) {
        setHata(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (isFocused) fetchBranslar();
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spor Branşları</Text>
      {loading && <ActivityIndicator size="large" color="#1565c0" style={{ marginVertical: 20 }} />}
      {hata && <Text style={{ color: 'red' }}>{hata}</Text>}
      <FlatList
        data={branslar}
        keyExtractor={item => item.branch_id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Button title="Düzenle" onPress={() => navigation.navigate('BransDuzenle', { branchId: item.branch_id })} color="#1565c0" />
          </View>
        )}
        ListEmptyComponent={!loading && <Text>Hiç branş bulunamadı.</Text>}
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
