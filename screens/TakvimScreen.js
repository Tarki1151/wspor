import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Platform, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

const TIME_SLOTS = [
  { label: 'Sabah', value: 'morning' },
  { label: 'Öğleden Sonra', value: 'afternoon' },
  { label: 'Akşam', value: 'evening' },
];

const TIME_SLOT_LABELS = {
  morning: 'Sabah',
  afternoon: 'Öğleden Sonra',
  evening: 'Akşam',
};

import { useRoute, useNavigation } from '@react-navigation/native';

export default function TakvimScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false); // false: yeni, true: düzenle
  const [editClassId, setEditClassId] = useState(null);
  const [newClass, setNewClass] = useState({ time_slot: 'morning', member_ids: [] });
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);

  // Üyeleri getir
  useEffect(() => {
    fetch('http://localhost:4000/api/members')
      .then(res => res.json())
      .then(data => setMembers(data));
  }, []);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // Başka ekrandan gün seçimi için
  const onSelectDate = route.params?.onSelectDate;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({}); // {class_id: ["Ali", "Veli"]}


  // Branşları getir
  useEffect(() => {
    fetch('http://localhost:4000/api/branches')
      .then(res => res.json())
      .then(data => {
        setBranches(data);
        if (data.length > 0 && !selectedBranch) setSelectedBranch(data[0].branch_id);
      });
  }, []);

  // Dersleri ve attendance'ı birlikte getir
  const fetchClassesAndAttendance = async () => {
    if (!selectedBranch || !selectedDate) return;
    setLoading(true);
    const res = await fetch(`http://localhost:4000/api/classes?branch_id=${selectedBranch}&date=${selectedDate}`);
    const data = await res.json();
    setClasses(data);
    const attMap = {};
    await Promise.all(data.map(async (cls) => {
      const resp = await fetch(`http://localhost:4000/api/classes/${cls.class_id}/attendance`);
      const att = await resp.json();
      attMap[cls.class_id] = att.filter(a => a.attended).map(a => a.member_name);
    }));
    setAttendanceMap(attMap);
    setLoading(false);
  };

  useEffect(() => {
    fetchClassesAndAttendance();
    // eslint-disable-next-line
  }, [selectedBranch, selectedDate]);

  // Basit tarih seçici (web için input, mobil için Text)
  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={selectedDate}
          onChange={e => {
            setSelectedDate(e.target.value);
            if (onSelectDate) {
              onSelectDate(e.target.value);
              setTimeout(() => navigation.goBack(), 200);
            }
          }}
          style={{ padding: 8, marginVertical: 8, borderRadius: 6, borderColor: '#ddd', borderWidth: 1 }}
        />
      );
    }
    return (
      <TouchableOpacity
        onPress={async () => {
          // Mobilde basit: bugünün tarihi seçili, tıklanınca bugünün tarihi döner
          if (onSelectDate) {
            onSelectDate(selectedDate);
            setTimeout(() => navigation.goBack(), 200);
          }
        }}
        style={{ marginVertical: 8 }}
      >
        <Text style={{ fontSize: 16 }}>{selectedDate}</Text>
        {onSelectDate && <Text style={{ color: '#1976d2', fontSize: 12 }}>Bu günü seç</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Takvim</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text>Branş: </Text>
        <select
          value={selectedBranch || ''}
          onChange={e => setSelectedBranch(e.target.value)}
          style={{ padding: 6, borderRadius: 4, borderColor: '#ccc', marginRight: 12 }}
        >
          {branches.map(b => (
            <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
          ))}
        </select>
        {renderDatePicker()}
        <Button title="Ders Ekle" onPress={() => setModalVisible(true)} color="#1565c0" />
      </View>
      <ScrollView style={{ flex: 1, width: '100%' }}>
        {loading ? <ActivityIndicator size="large" color="#1565c0" /> :
          classes.length === 0 ? <Text style={{ margin: 20 }}>Bu gün için ders yok.</Text> :
            classes.map(cls => (
              <View key={cls.class_id} style={styles.classCard}>
                <Text style={{ fontWeight: 'bold' }}>{TIME_SLOT_LABELS[cls.time_slot] || cls.time_slot}</Text>
                <Text>Tarih: {cls.date}</Text>
                <Text>Katılımcılar: {(attendanceMap[cls.class_id] || []).join(', ') || '-'}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <Button title="Düzenle" onPress={async () => {
                    setEditMode(true);
                    setEditClassId(cls.class_id);
                    // Mevcut yoklama üyelerini çek
                    let member_ids = [];
                    try {
                      const resp = await fetch(`http://localhost:4000/api/classes/${cls.class_id}/attendance`);
                      const att = await resp.json();
                      member_ids = att.filter(a => a.attended).map(a => a.member_id);
                    } catch {}
                    setNewClass({
                      time_slot: cls.time_slot,
                      member_ids
                    });
                    setModalVisible(true);
                  }} color="#1976d2" />
                  <View style={{ width: 8 }} />
                  <Button title="Sil" onPress={async () => {
                    let confirm = false;
                    if (Platform.OS === 'web') {
                      confirm = window.confirm('Bu dersi silmek istediğinize emin misiniz?');
                    } else {
                      // Alert.alert fonksiyonunu burada kullanmak için import edilmeli
                      // Fakat, native Alert'i burada eklemiyoruz, kod örneği için aşağıdaki satırı ekleyebilirsin:
                      // Alert.alert('Onay', 'Bu dersi silmek istediğinize emin misiniz?', [ { text: 'İptal' }, { text: 'Sil', onPress: () => ... } ])
                      confirm = true; // Mobilde doğrudan sil (örnek amaçlı)
                    }
                    if (confirm) {
                      await fetch(`http://localhost:4000/api/classes/${cls.class_id}`, { method: 'DELETE' });
                      await fetchClassesAndAttendance();
                    }
                  }} color="#d32f2f" />
                </View>
              </View>
            ))
        }
      </ScrollView>

      {/* Ders Ekle/Düzenle Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>{editMode ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</Text>
            <Text style={{ marginBottom: 4 }}>Saat Dilimi:</Text>
            <select
              value={newClass.time_slot}
              onChange={e => setNewClass({ ...newClass, time_slot: e.target.value })}
              style={{ padding: 6, borderRadius: 4, borderColor: '#ccc', marginBottom: 8 }}
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
            <Text style={{ marginBottom: 4 }}>Öğrenciler:</Text>
            <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 12, borderWidth: 1, borderColor: '#eee', borderStyle: 'solid', borderRadius: 6, padding: 8 }}>
              {members.map(m => (
                <label key={m.member_id} style={{ display: 'block', marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={newClass.member_ids.includes(m.member_id)}
                    onChange={e => {
                      if (e.target.checked) {
                        setNewClass({ ...newClass, member_ids: [...newClass.member_ids, m.member_id] });
                      } else {
                        setNewClass({ ...newClass, member_ids: newClass.member_ids.filter(id => id !== m.member_id) });
                      }
                    }}
                  />
                  {m.name}
                </label>
              ))}
            </div>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <Button
                title={saving ? 'Kaydediliyor...' : (editMode ? 'Güncelle' : 'Kaydet')}
                onPress={async () => {
                  if (!selectedBranch || !selectedDate || !newClass.time_slot || newClass.member_ids.length === 0) return;
                  setSaving(true);
                  let class_id = editClassId;
                  if (editMode && editClassId) {
                    await fetch(`http://localhost:4000/api/classes/${editClassId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        branch_id: selectedBranch,
                        date: selectedDate,
                        time_slot: newClass.time_slot
                      })
                    });
                  } else {
                    // Yeni ders ekle
                    const resp = await fetch('http://localhost:4000/api/classes', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        branch_id: selectedBranch,
                        date: selectedDate,
                        time_slot: newClass.time_slot
                      })
                    });
                    const data = await resp.json();
                    class_id = data.class_id;
                  }
                  // Yoklama kaydı oluştur/güncelle
                  await fetch(`http://localhost:4000/api/classes/${class_id}/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ attendance: members.map(m => ({ member_id: m.member_id, attended: newClass.member_ids.includes(m.member_id) ? 1 : 0 })) })
                  });
                  setSaving(false);
                  setModalVisible(false);
                  setNewClass({ time_slot: 'morning', member_ids: [] });
                  setEditMode(false);
                  setEditClassId(null);
                  // Yeniden yükle
                  await fetchClassesAndAttendance();
                }}
                color="#1565c0"
                disabled={saving}
              />
              <View style={{ width: 12 }} />
              <Button title="İptal" onPress={() => {
                setModalVisible(false);
                setEditMode(false);
                setEditClassId(null);
                setNewClass({ time_slot: 'morning', member_ids: [] });
              }} color="#888" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: 340,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'flex-start',
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
  },
});
