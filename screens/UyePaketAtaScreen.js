import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';

// Not: mevcutPaketler = mevcutta bu üyeye atanmış paketler (API'den alınacak)
// seciliPaket = kullanıcı tarafından seçilen paket_id
// kaydediliyor = kaydetme işlemi sırasında loading


export default function UyePaketAtaScreen({ route, navigation }) {
  const { memberId } = route.params;
  const [paketler, setPaketler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);
  const [mevcutPaketler, setMevcutPaketler] = useState(null); // null: yükleniyor, []: yok
  const [seciliPaket, setSeciliPaket] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  // Paketler ve mevcut paketleri getir
  useEffect(() => {
    let isActive = true;
    const fetchAll = async () => {
      setLoading(true);
      setHata(null);
      try {
        // Tüm paketler
        const resp1 = await fetch('https://wspor.onrender.com/api/packages');
        if (!resp1.ok) throw new Error('Sunucu hatası');
        const paketlerData = await resp1.json();
        // Mevcut paketler (üyeye atanmış)
        const resp2 = await fetch(`https://wspor.onrender.com/api/member-packages/${memberId}`);
        if (!resp2.ok) throw new Error('Sunucu hatası');
        const mevcut = await resp2.json();
        if (isActive) {
          setPaketler(paketlerData);
          setMevcutPaketler(mevcut);
        }
      } catch (err) {
        if (isActive) setHata(err.message);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchAll();
    return () => { isActive = false; };
  }, [memberId]);

  // Paket seçimi
  const handlePaketSec = (package_id) => {
    setSeciliPaket(package_id);
  };

  // Kaydet (atanan paketi gönder)
  const handleKaydet = async () => {
    if (!seciliPaket) return;
    setKaydediliyor(true);
    try {
      const today = new Date();
      const start_date = today.toISOString().slice(0, 10);
      const end_date = new Date(today.setMonth(today.getMonth() + 1)).toISOString().slice(0, 10);
      const resp = await fetch('https://wspor.onrender.com/api/member-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: memberId, package_id: seciliPaket, start_date, end_date, classes_remaining: null }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || 'Sunucu hatası');
      }
      Alert.alert('Başarılı', 'Paket atandı');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setKaydediliyor(false);
    }
  };


  if (loading) return <ActivityIndicator style={{ margin: 40 }} size="large" color="#1565c0" />;
  if (hata) return <Text style={{ color: 'red', margin: 20 }}>{hata}</Text>;

  if (loading) return <ActivityIndicator style={{ margin: 40 }} size="large" color="#1565c0" />;
if (hata) return <Text style={{ color: 'red', margin: 20 }}>{hata}</Text>;
if (mevcutPaketler && mevcutPaketler.length > 0) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atanmış Paketler</Text>
      {mevcutPaketler.map((mp) => (
        <View key={mp.member_package_id} style={[styles.card, {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]}>
          <View>
            <Text style={styles.name}>{mp.package_name}</Text>
            <Text>Tür: {mp.package_type === 'duration' ? 'Süreli' : 'Derslik'}</Text>
            <Text>Başlangıç: {mp.start_date || '-'}</Text>
            <Text>Bitiş: {mp.end_date || '-'}</Text>
          </View>
          <Button title="Sil" color="#c62828" onPress={() => handleSilMemberPackage(mp.member_package_id)} />
        </View>
      ))}
    </View>
  );
}

// Atanan paketi sil fonksiyonu
async function handleSilMemberPackage(memberPackageId) {
  Alert.alert(
    'Dikkat',
    'Bu paketi üyeden silmek istediğinize emin misiniz?',
    [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try {
          const resp = await fetch(`https://wspor.onrender.com/api/member-packages/${memberPackageId}`, {
            method: 'DELETE',
          });
          if (!resp.ok) throw new Error('Sunucu hatası');
          Alert.alert('Başarılı', 'Paket silindi');
          // Listeyi güncelle
          setMevcutPaketler(mevcutPaketler.filter(mp => mp.member_package_id !== memberPackageId));
        } catch (err) {
          Alert.alert('Hata', err.message);
        }
      } }
    ]
  );
}
return (
  <View style={styles.container}>
    <Text style={styles.title}>Paket Ata</Text>
    <FlatList
      data={paketler}
      keyExtractor={item => item.package_id?.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.card,
            seciliPaket === item.package_id && { borderColor: '#1565c0', borderWidth: 2 }
          ]}
          onPress={() => handlePaketSec(item.package_id)}
          disabled={kaydediliyor}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text>Tür: {item.type === 'duration' ? 'Süreli' : 'Derslik'}</Text>
          <Text>Fiyat: {item.price} TL</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text>Paket bulunamadı.</Text>}
    />
    <Button
      title={kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
      color="#1565c0"
      disabled={!seciliPaket || kaydediliyor}
      onPress={handleKaydet}
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
