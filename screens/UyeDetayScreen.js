import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Button, Pressable, Alert, Platform, TextInput, Modal, TouchableOpacity, FlatList } from 'react-native';
import GunSecici from '../components/GunSecici';
import { useNavigation } from '@react-navigation/native';

function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

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
  // Ödeme ekleme için
  const [odemeTutar, setOdemeTutar] = useState('');
  const [odemeTarih, setOdemeTarih] = useState('');
  const [showOdemeDatePicker, setShowOdemeDatePicker] = useState(false);
  const [odemeAciklama, setOdemeAciklama] = useState('');
  const [odemeKaydediliyor, setOdemeKaydediliyor] = useState(false);
  const [odemeModalVisible, setOdemeModalVisible] = useState(false);
  const [odemeler, setOdemeler] = useState([]);
  const [odemelerLoading, setOdemelerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    const fetchDetay = async () => {
      setLoading(true);
      setHata(null);
      try {
        // Üye bilgisi
        const uyeResp = await fetch(`https://wspor.onrender.com/api/members?q=`);
        const uyeData = await uyeResp.json();
        const found = uyeData.find(u => u.member_id === memberId);
        setUye(found);
        // Branşlar
        const bransResp = await fetch(`https://wspor.onrender.com/api/member-branches/${memberId}`);
        setBranslar(await bransResp.json());
        // Paketler
        const paketResp = await fetch(`https://wspor.onrender.com/api/member-packages/${memberId}`);
        setPaketler(await paketResp.json());
      } catch (err) {
        setHata(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetay();
    fetchOdemeler();
  }, [memberId]);

  const fetchOdemeler = async () => {
    setOdemelerLoading(true);
    try {
      const resp = await fetch(`https://wspor.onrender.com/api/reports/payments/?member_id=${memberId}`);
      if (!resp.ok) throw new Error('Ödemeler alınamadı');
      const data = await resp.json();
      setOdemeler(data);
    } catch (err) {
      setOdemeler([]);
    } finally {
      setOdemelerLoading(false);
    }
  };

  const handleOdemeEkle = async () => {
    if (!odemeTutar) return Alert.alert('Uyarı', 'Tutar zorunludur');
    setOdemeKaydediliyor(true);
    try {
      const body = {
        member_id: memberId,
        amount: odemeTutar,
      };
      if (odemeTarih) body.payment_date = odemeTarih;
      if (odemeAciklama) body.description = odemeAciklama;
      const resp = await fetch('https://wspor.onrender.com/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error('Sunucu hatası');
      Alert.alert('Başarılı', 'Ödeme kaydedildi');
      setOdemeTutar('');
      setOdemeTarih('');
      setOdemeAciklama('');
      setOdemeModalVisible(false);
      fetchOdemeler();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setOdemeKaydediliyor(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 40 }} />;
  if (hata) return <Text style={{ color: 'red', margin: 20 }}>{hata}</Text>;
  if (!uye) return <Text style={{ margin: 20 }}>Üye bulunamadı.</Text>;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{uye.name}</Text>
        <Text>Telefon: {uye.phone || '-'}</Text>
        <Text>E-posta: {uye.email || '-'}</Text>
        <Text>Adres: {uye.address || '-'}</Text>
        <Text>Doğum Tarihi: {formatDate(uye.date_of_birth)}</Text>
        <Text>Kayıt Tarihi: {formatDate(uye.registration_date)}</Text>
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
                  const resp = await fetch(`https://wspor.onrender.com/api/member-branches/${b.branch_id}?member_id=${memberId}`, {
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
                  const resp = await fetch(`https://wspor.onrender.com/api/member-packages/${p.member_package_id}`, {
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
        <Text style={styles.sectionTitle}>Ödeme Geçmişi</Text>
        {odemelerLoading ? (
          <ActivityIndicator size="small" color="#1565c0" />
        ) : odemeler.length === 0 ? (
          <Text>Henüz ödeme kaydı yok.</Text>
        ) : (
          <FlatList
            data={odemeler}
            keyExtractor={item => item.payment_id?.toString()}
            renderItem={({ item }) => (
              <View style={styles.paymentCard}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.amount} TL</Text>
                <Text style={{ color: '#555' }}>Tarih: {formatDate(item.payment_date)}</Text>
                {item.description ? <Text style={{ color: '#888' }}>Açıklama: {item.description}</Text> : null}
              </View>
            )}
          />
        )}
      </ScrollView>
      {/* Ödeme Ekleme Modalı */}
      <Modal visible={odemeModalVisible} animationType="slide" transparent onRequestClose={() => setOdemeModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Ödeme Ekle</Text>
            <Text>Tutar (TL):</Text>
            <TextInput style={styles.input} placeholder="Tutar" value={odemeTutar} onChangeText={setOdemeTutar} keyboardType="numeric" />
            <Text>Tarih:</Text>
            <GunSecici value={odemeTarih} onChange={val => {
              if (val === 'SELECT_FROM_TAKVIM') {
                navigation.navigate('Takvim', { onSelectDate: (dateStr) => setOdemeTarih(dateStr) });
              } else {
                setOdemeTarih(val);
              }
            }} />
            <Text>Açıklama:</Text>
            <TextInput style={styles.input} placeholder="Açıklama (isteğe bağlı)" value={odemeAciklama} onChangeText={setOdemeAciklama} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="İptal" onPress={() => setOdemeModalVisible(false)} color="#888" />
              <Button title={odemeKaydediliyor ? 'Kaydediliyor...' : 'Kaydet'} onPress={handleOdemeEkle} color="#388e3c" disabled={odemeKaydediliyor} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setOdemeModalVisible(true)}>
        <Text style={styles.fabText}>+ Ödeme Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#388e3c',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
