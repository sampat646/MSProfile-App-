// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signOut, getTokenSilently } from '../services/auth.service';
import { getUserProfile, getUserPhoto, UserProfile } from '../services/user.service';

interface AuthContextType {
  user: UserProfile | null;
  photoUrl: string | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const token = await getTokenSilently();
      if (token) {
        setAccessToken(token);
        const profile = await getUserProfile(token);
        setUser(profile);
        const photo = await getUserPhoto(token);
        setPhotoUrl(photo);
      }
    } catch (err) {
      console.log('No existing login found');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const authResult = await signIn();
      setAccessToken(authResult.accessToken);
      const profile = await getUserProfile(authResult.accessToken);
      setUser(profile);
      const photo = await getUserPhoto(authResult.accessToken);
      setPhotoUrl(photo);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (accessToken) {
        await signOut(accessToken);
      }
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
    <AuthContext.Provider value={{ user, photoUrl, accessToken, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
