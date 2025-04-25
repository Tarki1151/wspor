import * as React from 'react';
import LoginScreen from './screens/LoginScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AnasayfaScreen from './screens/AnasayfaScreen';
import UyelerScreen from './screens/UyelerScreen';
import UyeDetayScreen from './screens/UyeDetayScreen';
import UyeEkleScreen from './screens/UyeEkleScreen';
import UyeDuzenleScreen from './screens/UyeDuzenleScreen';
import UyePaketAtaScreen from './screens/UyePaketAtaScreen';
import UyeBransAtaScreen from './screens/UyeBransAtaScreen';
import TakvimScreen from './screens/TakvimScreen';
import RaporlarScreen from './screens/RaporlarScreen';
import ProfilScreen from './screens/ProfilScreen';
import BranslarScreen from './screens/BranslarScreen';
import BransEkleScreen from './screens/BransEkleScreen';
import BransDuzenleScreen from './screens/BransDuzenleScreen';
import { StatusBar } from 'expo-status-bar';
import PaketlerScreen from './screens/PaketlerScreen';
import PaketEkleScreen from './screens/PaketEkleScreen';
import PaketDuzenleScreen from './screens/PaketDuzenleScreen';

const Tab = createBottomTabNavigator();
import { createStackNavigator } from '@react-navigation/stack';
const UyelerStack = createStackNavigator();

function UyelerStackScreen() {
  return (
    <UyelerStack.Navigator>
      <UyelerStack.Screen name="UyelerAna" component={UyelerScreen} options={{ title: 'Üyeler', headerShown: false }} />
      <UyelerStack.Screen name="UyeDetay" component={UyeDetayScreen} options={{ title: 'Üye Detay' }} />
      <UyelerStack.Screen name="UyeEkle" component={UyeEkleScreen} options={{ title: 'Yeni Üye' }} />
      <UyelerStack.Screen name="UyeDuzenle" component={UyeDuzenleScreen} options={{ title: 'Üye Düzenle' }} />
      <UyelerStack.Screen name="UyePaketAta" component={UyePaketAtaScreen} options={{ title: 'Paket Ata' }} />
      <UyelerStack.Screen name="UyeBransAta" component={UyeBransAtaScreen} options={{ title: 'Branş Ata' }} />
    </UyelerStack.Navigator>
  );
}

const BranslarStack = createStackNavigator();
function BranslarStackScreen() {
  return (
    <BranslarStack.Navigator>
      <BranslarStack.Screen name="BranslarAna" component={BranslarScreen} options={{ title: 'Branşlar', headerShown: false }} />
      <BranslarStack.Screen name="BransEkle" component={BransEkleScreen} options={{ title: 'Yeni Branş' }} />
      <BranslarStack.Screen name="BransDuzenle" component={BransDuzenleScreen} options={{ title: 'Branş Düzenle' }} />
    </BranslarStack.Navigator>
  );
}

const PaketlerStack = createStackNavigator();
function PaketlerStackScreen() {
  return (
    <PaketlerStack.Navigator>
      <PaketlerStack.Screen name="PaketlerAna" component={PaketlerScreen} options={{ title: 'Paketler', headerShown: false }} />
      <PaketlerStack.Screen name="PaketEkle" component={PaketEkleScreen} options={{ title: 'Yeni Paket' }} />
      <PaketlerStack.Screen name="PaketDuzenle" component={PaketDuzenleScreen} options={{ title: 'Paket Düzenle' }} />
    </PaketlerStack.Navigator>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {loggedIn ? (
        <Tab.Navigator
          initialRouteName="Anasayfa"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: '#1565c0',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { paddingBottom: 6, height: 60 },
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Anasayfa') iconName = 'home';
              else if (route.name === 'Üyeler') iconName = 'people';
              else if (route.name === 'Branşlar') iconName = 'fitness-outline';
              else if (route.name === 'Paketler') iconName = 'gift-outline';
              else if (route.name === 'Takvim') iconName = 'calendar';
              else if (route.name === 'Raporlar') iconName = 'bar-chart';
              else if (route.name === 'Profil') iconName = 'person';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Anasayfa" component={AnasayfaScreen} options={{ headerShown: true, tabBarLabel: 'Anasayfa', tabBarIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />) }} />
          <Tab.Screen name="Üyeler" component={UyelerStackScreen} options={{ headerShown: true, tabBarLabel: 'Üyeler', tabBarIcon: ({ color, size }) => (<Ionicons name="people" size={size} color={color} />) }} />
          <Tab.Screen name="Branşlar" component={BranslarStackScreen} options={{ headerShown: true, tabBarLabel: 'Branşlar', tabBarIcon: ({ color, size }) => (<Ionicons name="fitness-outline" size={size} color={color} />) }} />
          <Tab.Screen name="Paketler" component={PaketlerStackScreen} options={{ headerShown: true, tabBarLabel: 'Paketler', tabBarIcon: ({ color, size }) => (<Ionicons name="gift-outline" size={size} color={color} />) }} />
          <Tab.Screen name="Takvim" component={TakvimScreen} options={{ headerShown: true, tabBarLabel: 'Takvim', tabBarIcon: ({ color, size }) => (<Ionicons name="calendar" size={size} color={color} />) }} />
          <Tab.Screen name="Raporlar" component={RaporlarScreen} options={{ headerShown: true, tabBarLabel: 'Raporlar', tabBarIcon: ({ color, size }) => (<Ionicons name="bar-chart" size={size} color={color} />) }} />
          <Tab.Screen name="Profil" component={ProfilScreen} options={{ headerShown: true, tabBarLabel: 'Profil', tabBarIcon: ({ color, size }) => (<Ionicons name="person" size={size} color={color} />) }} />
        </Tab.Navigator>
      ) : (
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      )}
    </NavigationContainer>
  );
}

