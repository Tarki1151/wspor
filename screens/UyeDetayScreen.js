import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Button, Pressable, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UyeDetayScreen({ route }) {
  const { memberId } = route.params;
  const [uye, setUye] = useState(null);
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Düzenle" onPress={() => navigation.navigate('UyeDuzenle', { memberId })} color="#1565c0" />
      ),
      headerShown: true,
    });
  }, [navigation, memberId]);
  const [branslar, setBranslar] = useState([]);
  const [paketler, setPaketler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    const fetchDetay = async () => {
      setLoading(true);
      setHata(null);
      try {
        // Üye bilgisi
        const uyeResp = await fetch(`http://localhost:4000/api/members?q=`);
        const uyeData = await uyeResp.json();
        const found = uyeData.find(u => u.member_id === memberId);
        setUye(found);
        // Branşlar
        const bransResp = await fetch(`http://localhost:4000/api/member-branches/${memberId}`);
        setBranslar(await bransResp.json());
        // Paketler
        const paketResp = await fetch(`http://localhost:4000/api/member-packages/${memberId}`);
        setPaketler(await paketResp.json());
      } catch (err) {
        setHata(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetay();
  }, [memberId]);

  if (loading) return <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 40 }} />;
  if (hata) return <Text style={{ color: 'red', margin: 20 }}>{hata}</Text>;
  if (!uye) return <Text style={{ margin: 20 }}>Üye bulunamadı.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{uye.name}</Text>
      <Text>Telefon: {uye.phone || '-'}</Text>
      <Text>E-posta: {uye.email || '-'}</Text>
      <Text>Adres: {uye.address || '-'}</Text>
      <Text>Doğum Tarihi: {uye.date_of_birth || '-'}</Text>
      <Text>Kayıt Tarihi: {uye.registration_date}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
        <Text style={styles.sectionTitle}>Spor Branşları</Text>
        <View style={{ flex: 1 }} />
        <Button title="Branş Ata" onPress={() => navigation.navigate('UyeBransAta', { memberId })} color="#1565c0" />
      </View>
      {branslar.length === 0 ? <Text>Branş yok.</Text> : branslar.map(b => (
  <View key={b.branch_id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
    <Text style={{ flex: 1 }}>• {b.name}</Text>
    <Pressable
      style={styles.deleteXButton}
      onPress={async () => {
        try {
          const resp = await fetch(`http://localhost:4000/api/member-branches/${b.branch_id}?member_id=${memberId}`, {
            method: 'DELETE',
          });
          if (!resp.ok) throw new Error('Sunucu hatası');
          setBranslar(current => current.filter(br => br.branch_id !== b.branch_id));
        } catch (err) {
          Alert.alert('Hata', err.message);
        }
      }}
    >
      <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: -2 }}>×</Text>
    </Pressable>
  </View>
))}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
        <Text style={styles.sectionTitle}>Paketler</Text>
        <View style={{ flex: 1 }} />
        <Button title="Paket Ata" onPress={() => navigation.navigate('UyePaketAta', { memberId })} color="#1565c0" />
      </View>
      {paketler.length === 0 ? <Text>Paket yok.</Text> : paketler.map(p => (
        <View key={p.member_package_id} style={[styles.packageCard, { flexDirection: 'row', alignItems: 'center' }]}> 
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{p.package_name}</Text>
            <Text>Tür: {p.package_type === 'duration' ? 'Süreli' : 'Derslik'}</Text>
            {p.package_type === 'duration' ? (
              <Text>
                Başlangıç: {p.start_date || '-'}
                {'\n'}Bitiş: {p.end_date || '-'}
              </Text>
            ) : (
              <Text>Kalan Ders: {p.classes_remaining}</Text>
            )}
          </View>
          <Pressable
            style={styles.deleteXButton}
            onPress={async () => {
              try {
                const resp = await fetch(`http://localhost:4000/api/member-packages/${p.member_package_id}`, {
                  method: 'DELETE',
                });
                if (!resp.ok) throw new Error('Sunucu hatası');
                setPaketler(current => current.filter(mp => mp.member_package_id !== p.member_package_id));
              } catch (err) {
                Alert.alert('Hata', err.message);
              }
            }}
          >
            <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: -2 }}>×</Text>
          </Pressable>
        </View>
      ))} 
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    color: '#444',
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteXButton: {
    backgroundColor: '#c62828',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginRight: 2,
    marginVertical: 2,
    elevation: 2,
  },
});
