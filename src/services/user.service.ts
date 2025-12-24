// src/services/user.service.ts
import axios from 'axios';
import { authConfig } from '../config/auth.config';

export interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle: string;
  mobilePhone: string;
  officeLocation: string;
  preferredLanguage: string;
  surname: string;
  givenName: string;
}

export const getUserProfile = async (accessToken: string): Promise<UserProfile> => {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get user's profile photo
export const getUserPhoto = async (accessToken: string): Promise<string | null> => {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null; // No photo available
    }

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  } catch (error) {
    console.error('Error fetching user photo:', error);
    return null;
  }

};


export const getUserGroups = async (accessToken: string) => {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/memberOf/microsoft.graph.group', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groups API Error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const getGroupMembers = async (accessToken: string, groupId: string) => {
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/groups/${groupId}/members/microsoft.graph.user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Members API Error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
};
