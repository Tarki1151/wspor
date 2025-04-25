import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_COLOR = '#1565c0';

export default function ProfilScreen() {
  const [salon, setSalon] = useState({
    name: '', address: '', phone: '', logo: '', admin_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/salon')
      .then(r => r.json())
      .then(data => {
        setSalon({
          name: data?.name || '',
          address: data?.address || '',
          phone: data?.phone || '',
          logo: data?.logo || '',
          admin_password: '',
        });
        setLoading(false);
      })
      .catch(() => { setError('Salon bilgisi yüklenemedi'); setLoading(false); });
  }, []);

  const handleSave = () => {
    setSaving(true);
    setError('');
    const { theme_color, ...salonData } = salon;
    fetch('http://localhost:4000/api/salon', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salonData),
    })
      .then(r => r.json())
      .then(() => { setSuccess(true); setSaving(false); setTimeout(() => setSuccess(false), 2000); })
      .catch(() => { setError('Kaydedilemedi'); setSaving(false); });
  };

  const pickLogo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.5 });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setSalon({ ...salon, logo: 'data:image/jpeg;base64,' + result.assets[0].base64 });
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={DEFAULT_COLOR} /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Salon Bilgisi</Text>
      <TextInput
        style={styles.input}
        placeholder="Salon Adı"
        value={salon.name}
        onChangeText={v => setSalon({ ...salon, name: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Adres"
        value={salon.address}
        onChangeText={v => setSalon({ ...salon, address: v })}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefon"
        value={salon.phone}
        keyboardType="phone-pad"
        onChangeText={v => setSalon({ ...salon, phone: v })}
      />
      <View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 10 }}>
        <Text style={styles.label}>Logo</Text>
        {salon.logo ? (
          <Image source={{ uri: salon.logo }} style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 6 }} />
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={pickLogo} style={styles.buttonSmall}>
            <Text style={styles.buttonSmallText}>Galeriden Seç</Text>
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 8 }}>veya</Text>
          <TextInput
            style={[styles.input, { flex: 1, minWidth: 120, marginBottom: 0 }]}
            placeholder="Logo URL"
            value={salon.logo?.startsWith('data:') ? '' : salon.logo}
            onChangeText={v => setSalon({ ...salon, logo: v })}
          />
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Yeni Admin Şifresi"
        value={salon.admin_password}
        secureTextEntry
        onChangeText={v => setSalon({ ...salon, admin_password: v })}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>Kaydedildi!</Text> : null}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  label: { fontWeight: 'bold', marginBottom: 4, color: '#333', fontSize: 15 },

  buttonSmall: {
    backgroundColor: '#1565c0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonSmallText: { color: '#fff', fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#1565c0',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', marginTop: 8 },
  success: { color: 'green', marginTop: 8, fontWeight: 'bold' },
});
