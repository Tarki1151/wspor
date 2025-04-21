import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native';

export default function YoklamaScreen({ route, navigation }) {
  const { classId } = route.params;
  const [attendance, setAttendance] = useState([]); // [{member_id, member_name, attended}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:4000/api/classes/${classId}/attendance`)
      .then(res => res.json())
      .then(data => setAttendance(data))
      .finally(() => setLoading(false));
  }, [classId]);

  const toggleAttendance = (member_id) => {
    setAttendance(attendance.map(a =>
      a.member_id === member_id ? { ...a, attended: a.attended ? 0 : 1 } : a
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`http://localhost:4000/api/classes/${classId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance: attendance.map(a => ({ member_id: a.member_id, attended: a.attended })) })
    });
    setSaving(false);
    Alert.alert('Başarılı', 'Yoklama kaydedildi.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yoklama</Text>
      {loading ? <ActivityIndicator size="large" color="#1565c0" /> : (
        <ScrollView style={{ width: '100%' }}>
          {attendance.length === 0 ? <Text>Hiç üye bulunamadı.</Text> :
            attendance.map(a => (
              <View key={a.member_id} style={styles.row}>
                <Text style={{ flex: 1 }}>{a.member_name}</Text>
                <Switch value={!!a.attended} onValueChange={() => toggleAttendance(a.member_id)} />
              </View>
            ))
          }
        </ScrollView>
      )}
      <Button title={saving ? 'Kaydediliyor...' : 'Kaydet'} onPress={handleSave} color="#1565c0" disabled={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
