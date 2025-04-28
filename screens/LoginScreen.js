import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';

export default function LoginScreen({ navigation, onLogin }) {
  const [logo, setLogo] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/salon')
      .then(res => res.json())
      .then(data => {
        if (data && data.logo) setLogo(data.logo);
        else setLogo(null);
      })
      .catch(() => setLogo(null));
  }, []);

  const logoSource = logo && logo.startsWith('data:') ? { uri: logo } : logo && logo.startsWith('http') ? { uri: logo } : require('../assets/TARABYA MARTE-250x.png');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    // Hardcoded admin credentials for now
    if (username === 'admin' && password === 'admin123') {
      setLoading(false);
      if (onLogin) onLogin();
      else navigation.replace('MainTabs');
    } else {
      setLoading(false);
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Giriş Yap</Text>
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı Adı"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giriş</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
    alignSelf: 'center',
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1565c0',
    padding: 14,
    borderRadius: 8,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 10, fontWeight: 'bold' },
});
