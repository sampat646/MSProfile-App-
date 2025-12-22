// src/config/auth.config.ts
import { Platform } from 'react-native';
import { env } from './env.config';

export const authConfig = {
  clientId: env.MICROSOFT_CLIENT_ID,
  redirectUrl: Platform.OS === 'ios'
    ? env.MICROSOFT_REDIRECT_URI || 'msauth.com.msprofile://auth'
    : `msauth://com.msprofile/${env.MICROSOFT_ANDROID_SIGNATURE_HASH}`,
  scopes: [
    'openid', 
    'profile', 
    'email', 
    'User.Read',
    'Group.Read.All',      // ✅ GROUPS
    'GroupMember.Read.All' // ✅ GROUP MEMBERS
  ],
  serviceConfiguration: {
    authorizationEndpoint: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
  },
};
