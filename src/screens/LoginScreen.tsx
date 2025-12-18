// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Button, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { signIn, signOut, getTokenSilently, getCurrentAccount } from '../services/auth.service';
import { getUserProfile, getUserPhoto, UserProfile } from '../services/user.service';

const LoginScreen = () => {
  const [loading, setLoading] = useState(true); // Start with true to check existing session
  const [user, setUser] = useState<UserProfile | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      // Try to get token silently
      const token = await getTokenSilently();
      
      if (token) {
        setAccessToken(token);
        
        // Fetch user profile
        const profile = await getUserProfile(token);
        setUser(profile);

        // Fetch user photo
        const photo = await getUserPhoto(token);
        setPhotoUrl(photo);
      }
    } catch (err) {
      console.log('No existing login found');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sign in and get access token
      const authResult = await signIn();
      setAccessToken(authResult.accessToken);
      
      // Fetch user profile
      const profile = await getUserProfile(authResult.accessToken);
      setUser(profile);

      // Fetch user photo (optional)
      const photo = await getUserPhoto(authResult.accessToken);
      setPhotoUrl(photo);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Try to sign out, but continue even if it fails
      try {
        if (accessToken) {
          await signOut(accessToken);
        }
      } catch (signOutError) {
        console.warn('Sign out API failed, clearing local state:', signOutError);
      }
      
      // Clear local state
      setUser(null);
      setPhotoUrl(null);
      setAccessToken(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0078D4" />}
      
      {!loading && !user && (
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Welcome</Text>
          <Button title="Sign in with Microsoft" onPress={handleLogin} />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      )}
      
      {!loading && user && (
        <View style={styles.profileContainer}>
          {photoUrl && (
            <Image 
              source={{ uri: photoUrl }} 
              style={styles.profilePhoto}
            />
          )}
          
          <Text style={styles.greeting}>Hi, {user.givenName || user.displayName}!</Text>
          
          <View style={styles.infoContainer}>
            <InfoRow label="Name" value={user.displayName} />
            <InfoRow label="Email" value={user.mail || user.userPrincipalName} />
            {user.jobTitle && <InfoRow label="Job Title" value={user.jobTitle} />}
            {user.mobilePhone && <InfoRow label="Phone" value={user.mobilePhone} />}
            {user.officeLocation && <InfoRow label="Office" value={user.officeLocation} />}
          </View>
          
          <Button title="Sign Out" onPress={handleLogout} color="#D13438" />
        </View>
      )}
    </View>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  profileContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0078D4',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontWeight: '600',
    width: 100,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;