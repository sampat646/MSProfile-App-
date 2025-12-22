// src/components/AuthNavbar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface AuthNavbarProps {
  onLogin?: () => void;
  onLogout?: () => void;
}

const AuthNavbar: React.FC<AuthNavbarProps> = ({ onLogin, onLogout }) => {
  const { user, photoUrl, loading, error, login, logout } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIndicator} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.appName}>MSProfile</Text>
      </View>

      <View style={styles.rightSection}>
        {user ? (
          <>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                Hi, {user.givenName || user.displayName}
              </Text>
              {photoUrl && (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
              )}
            </View>
            {/* <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity> */}
          </>
        ) : (
          <>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
              <Text style={styles.loginText}>Sign in with Microsoft</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  leftSection: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    maxWidth: 120,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  loginBtn: {
    backgroundColor: '#0078D4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 140,
  },
  loginText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    height: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AuthNavbar;
