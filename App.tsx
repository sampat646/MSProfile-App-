// App.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavbar from './src/components/AuthNavbar';
import BottomNav from './src/components/BottomNav';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GroupsScreen from './src/screens/GroupsScreen';
// import GroupScreen from './src/screens/GroupScreen'; // Add when ready

const AppContent = () => {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'group' | 'profile'>('home');

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <AuthNavbar onLogin={login} onLogout={logout} />
        <View style={styles.content} />
      </SafeAreaView>
    );
  }

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
    <SafeAreaView style={styles.container}>
      <AuthNavbar onLogin={login} onLogout={logout} />
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingBottom: 0, // BottomNav handles its own spacing
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
