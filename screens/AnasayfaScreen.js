import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AnasayfaScreen() {
  const navigation = useNavigation();
  const [summary, setSummary] = React.useState({ total_members: '...', new_members: '...', today_classes: '...' });
  const [logo, setLogo] = React.useState(null);

  React.useEffect(() => {
    fetch('http://localhost:4000/api/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(() => setSummary({ total_members: '-', new_members: '-', today_classes: '-' }));
  }, []);

  React.useEffect(() => {
    fetch('http://localhost:4000/api/salon')
      .then(res => res.json())
      .then(data => {
        if (data && data.logo) setLogo(data.logo);
        else setLogo(null);
      })
      .catch(() => setLogo(null));
  }, []);

  const logoSource = logo && logo.startsWith('data:') ? { uri: logo } : logo && logo.startsWith('http') ? { uri: logo } : require('../assets/TARABYA MARTE-250x.png');

  return (
    <View style={styles.container}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Hoşgeldiniz!</Text>
      <Text style={styles.subtitle}>Bugünkü Özet</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>Aktif Üye: {summary.total_members}</Text>
        <Text style={styles.summaryText}>Yeni Kayıt: {summary.new_members}</Text>
        <Text style={styles.summaryText}>Bugünkü Dersler: {summary.today_classes}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <View style={styles.buttonWrapper}><Button title="Yeni Üye Ekle" onPress={() => navigation.navigate('Üyeler', { screen: 'UyeEkle' })} /></View>
        <View style={styles.buttonWrapper}><Button title="Ders Planla" onPress={() => navigation.navigate('Takvim')} /></View>
        <View style={styles.buttonWrapper}><Button title="Rapor Oluştur" onPress={() => navigation.navigate('Raporlar')} /></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  summaryBox: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryText: {
    color: '#222',
    fontWeight: '500',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  buttonWrapper: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    overflow: 'hidden',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    alignSelf: 'center',
    marginTop: 16,
  },
});
