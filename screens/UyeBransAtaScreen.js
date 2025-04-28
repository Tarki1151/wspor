import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';

export default function UyeBransAtaScreen({ route, navigation }) {
  const { memberId } = route.params;
  const [branslar, setBranslar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    const fetchBranslar = async () => {
      setLoading(true);
      setHata(null);
      try {
        const resp = await fetch('https://wspor.onrender.com/api/branches');
        if (!resp.ok) throw new Error('Sunucu hatası');
        setBranslar(await resp.json());
      } catch (err) {
        setHata(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBranslar();
  }, []);

  const handleAta = async (branch_id) => {
    try {
      const resp = await fetch('https://wspor.onrender.com/api/member-branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, branch_id }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Sunucu hatası');
      }
      Alert.alert('Başarılı', 'Branş atandı');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    }
  };

  if (loading) return <ActivityIndicator style={{ margin: 40 }} size="large" color="#1565c0" />;
  if (hata) return <Text style={{ color: 'red', margin: 20 }}>{hata}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Branş Ata</Text>
      <FlatList
        data={branslar}
        keyExtractor={item => item.branch_id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleAta(item.branch_id)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Branş bulunamadı.</Text>}
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
    fontSize: 22,
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
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
});
