// src/services/auth.service.ts
import { authorize, refresh, revoke, AuthorizeResult } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env.config';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const config = {
  clientId: env.MICROSOFT_CLIENT_ID,
  redirectUrl: env.MICROSOFT_REDIRECT_URI,
  scopes: ['openid', 'profile', 'email', 'User.Read', 'offline_access'],
  serviceConfiguration: {
    authorizationEndpoint: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
    revocationEndpoint: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/logout`,
  },
};

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  accessTokenExpirationDate: string;
}

export const signIn = async (): Promise<AuthResult> => {
  try {
    console.log('AUTH CONFIG =>', config);
    const result = await authorize(config);
    
    // Save tokens for persistence
    await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
    if (result.refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    }
    
    return result;
  } catch (error) {
    console.error('Login failed', error);
    throw error;
  }
};

export const signOut = async (accessToken: string) => {
  try {
    // Clear stored tokens
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // Optional: Revoke token (this might fail, so we catch errors)
    try {
      await revoke(config, {
        tokenToRevoke: accessToken,
        sendClientId: true,
      });
    } catch (revokeError) {
      console.warn('Token revocation failed (but local tokens cleared):', revokeError);
    }
  } catch (error) {
    console.error('Logout failed', error);
  }
};

// Get stored access token
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get stored token', error);
    return null;
  }
};

// Get token silently (use stored or refresh if expired)
export const getTokenSilently = async (): Promise<string | null> => {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!storedToken) {
      return null;
    }
    
    // If we have a refresh token, try to refresh
    if (refreshToken) {
      try {
        const result = await refresh(config, {
          refreshToken: refreshToken,
        });
        
        // Save new tokens
        await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
        if (result.refreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
        }
        
        return result.accessToken;
      } catch (refreshError) {
        console.log('Token refresh failed, using stored token');
        return storedToken;
      }
    }
    
    return storedToken;
  } catch (error) {
    console.error('Failed to get token silently', error);
    return null;
  }
};

// Check if user has existing session
export const getCurrentAccount = async (): Promise<boolean> => {
  const token = await getStoredToken();
  return token !== null;
};