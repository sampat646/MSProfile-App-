// App.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavbar from './src/components/AuthNavbar';
import BottomNav from './src/components/BottomNav';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import { RootStackParamList } from './src/types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'group' | 'profile'>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'group':
        return (
          <View style={{ flex: 1 }} pointerEvents="box-none">
            <GroupsScreen />
          </View>
        );
      case 'profile':
        return (
          <View style={{ flex: 1 }} pointerEvents="box-none">
            <ProfileScreen />
          </View>
        );
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.content}>
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
};

const AppNavigator = () => {
  const { login, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <AuthNavbar onLogin={login} onLogout={logout} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        <Stack.Screen name="Home" component={MainTabs} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const AppContent = () => {
  const { user, login } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthNavbar onLogin={login} onLogout={() => {}} />
        <View style={styles.content} />
      </SafeAreaView>
    );
  }

  return <AppNavigator />;
};

const App = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
});

export default App;