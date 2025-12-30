// App.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavbar from './src/components/AuthNavbar';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GroupsScreen from './src/screens/EmployeeDirectoryScreen';
import { RootStackParamList, TabsParamList } from './src/types/navigation.types';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

const iconMap: Record<keyof TabsParamList, string> = {
  Home: 'home',
  People: 'users',
  Profile: 'user'
}
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => (
          <Icon
            name={iconMap[route.name]}
            size={size}
            color={focused ? '#2563eb' : 'gray'}
          />

        ),
        headerShown: false,
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'grey'
      })}

    >
      <Tab.Screen name='Home' component={HomeScreen} />
      <Tab.Screen name='People' component={GroupsScreen} />
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator >

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
        <AuthNavbar onLogin={login} onLogout={() => { }} />
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