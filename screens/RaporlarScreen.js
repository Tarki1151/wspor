import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Platform, Picker, Button, ScrollView } from 'react-native';

const TABS = [
  { key: 'attendance', label: 'Katılım' },
  { key: 'payments', label: 'Ödemeler' },
];

const DATE_RANGES = [
  { key: 'week', label: 'Bu Hafta' },
  { key: 'month', label: 'Bu Ay' },
  { key: 'custom', label: 'Özel' },
];

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function RaporlarScreen() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [paymentsData, setPaymentsData] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });

  // Fetch members for filter
  useEffect(() => {
    fetch('http://localhost:4000/api/members/')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(() => setMembers([]));
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    setError('');
    setLoading(true);
    let url = '';
    let params = [];
    let startDate, endDate;
    if (dateRange === 'week') {
      const now = new Date();
      const first = now.getDate() - now.getDay();
      startDate = new Date(now.setDate(first));
      endDate = new Date();
    } else if (dateRange === 'month') {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
    } else {
      startDate = customStart ? new Date(customStart) : '';
      endDate = customEnd ? new Date(customEnd) : '';
    }
    if (selectedMember) params.push(`member_id=${selectedMember}`);
    if (startDate) params.push(`start_date=${formatDate(startDate)}`);
    if (endDate) params.push(`end_date=${formatDate(endDate)}`);
    if (activeTab === 'attendance') {
      url = `http://localhost:4000/api/reports/attendance/?${params.join('&')}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setAttendanceData(data);
          setLoading(false);
        })
        .catch(() => {
          setAttendanceData([]);
          setError('Veri alınamadı');
          setLoading(false);
        });
    } else if (activeTab === 'payments') {
      url = `http://localhost:4000/api/reports/payments/?${params.join('&')}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          setPaymentsData(data);
          setSummary({ total: data.reduce((sum, p) => sum + (p.amount || 0), 0) });
          setLoading(false);
        })
        .catch(() => {
          setPaymentsData([]);
          setSummary({ total: 0 });
          setError('Veri alınamadı');
          setLoading(false);
        });
    }
  }, [activeTab, selectedMember, dateRange, customStart, customEnd]);

  const renderFilters = () => (
    <View style={styles.filtersBox}>
      <Text style={styles.filterLabel}>Üye:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedMember}
          onValueChange={setSelectedMember}
          style={styles.picker}
        >
          <Picker.Item key="all-members" label="Tümü" value="" />
          {members.filter(m => m && m.member_id !== undefined && m.name !== undefined).map(m => (
            <Picker.Item key={`member-${m.member_id}`} label={m.name} value={m.member_id} />
          ))}
        </Picker>
      </View>
      <Text style={styles.filterLabel}>Zaman Aralığı:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={dateRange}
          onValueChange={setDateRange}
          style={styles.picker}
        >
          {DATE_RANGES.map(r => (
            <Picker.Item key={`range-${r.key}`} label={r.label} value={r.key} />
          ))}
        </Picker>
      </View>
      {dateRange === 'custom' && (
        <View style={styles.customDateBox}>
          <Text>Başlangıç:</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              style={{ padding: 8, marginVertical: 8, borderRadius: 6, borderColor: '#ddd', borderWidth: 1, minWidth: 120 }}
            />
          ) : (
            <Button title={customStart || 'Başlangıç Seç'} onPress={() => setShowStartDatePicker(true)} />
          )}
          <Text>Bitiş:</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              style={{ padding: 8, marginVertical: 8, borderRadius: 6, borderColor: '#ddd', borderWidth: 1, minWidth: 120 }}
            />
          ) : (
            <Button title={customEnd || 'Bitiş Seç'} onPress={() => setShowEndDatePicker(true)} />
          )}
        </View>
      )}
    </View>
  );

  const renderAttendanceTable = () => (
    <View style={styles.tableBox}>
      <Text style={styles.tableTitle}>Katılım Tablosu</Text>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Üye</Text>
            <Text style={styles.tableHeaderCell}>Katıldığı Tarihler</Text>
            <Text style={styles.tableHeaderCell}>Toplam Ders</Text>
          </View>
          {attendanceData.length === 0 ? (
            <Text style={styles.tableEmpty}>Kayıt bulunamadı</Text>
          ) : (
            (Array.isArray(attendanceData) ? attendanceData : [attendanceData]).map((row, idx) => (
              <View key={row.member_id ? `attendance-${row.member_id}` : `attendance-${idx}`} style={styles.tableRow}>
                <Text style={styles.tableCell}>{row.member_name}</Text>
                <Text style={styles.tableCell}>{row.dates_attended?.join(', ')}</Text>
                <Text style={[styles.tableCell, styles.tableCellCenter]}>{row.total_sessions}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );

  const renderPaymentsTable = () => (
    <View style={styles.tableBox}>
      <Text style={styles.tableTitle}>Ödeme Tablosu</Text>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Üye</Text>
            <Text style={styles.tableHeaderCell}>Tarih</Text>
            <Text style={styles.tableHeaderCell}>Tutar</Text>
            <Text style={styles.tableHeaderCell}>Paket</Text>
          </View>
          {paymentsData.length === 0 ? (
            <Text style={styles.tableEmpty}>Kayıt bulunamadı</Text>
          ) : (
            paymentsData.map((row, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableCell}>{row.member_name}</Text>
                <Text style={styles.tableCell}>{formatDate(row.payment_date)}</Text>
                <Text style={styles.tableCell}>{row.amount}</Text>
                <Text style={styles.tableCell}>{row.package_name}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <Text style={styles.summaryText}>Toplam: {summary.total} TL</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderFilters()}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading ? <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 24 }} /> : (
        activeTab === 'attendance' ? renderAttendanceTable() : renderPaymentsTable()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#1565c0',
    backgroundColor: '#e3eafc',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1565c0',
    backgroundColor: '#1565c0',
  },
  tabText: {
    fontSize: 16,
    color: '#1565c0',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  filtersBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  pickerWrapper: {
    minWidth: 120,
    marginRight: 10,
  },
  picker: {
    height: 36,
    minWidth: 120,
  },
  customDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableBox: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1565c0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e3eafc',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  tableHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#1565c0',
    minWidth: 90,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tableCell: {
    flex: 1,
    minWidth: 90,
  },
  tableCellCenter: {
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableEmpty: {
    padding: 12,
    color: '#888',
  },
  summaryText: {
    marginTop: 12,
    fontWeight: 'bold',
    color: '#1565c0',
    textAlign: 'right',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});
