// src/screens/HomeScreen.tsx - Your existing home screen content
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

const HomeScreen = () => {
  const { user, accessToken } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Home!</Text>
      {user && (
        <Text style={styles.subtitle}>Logged in as: {user.displayName}</Text>
      )}
      {/* Your existing home screen content goes here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default HomeScreen;
