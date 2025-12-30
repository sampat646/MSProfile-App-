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
  department?: string;
}

// Get current user's profile
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

// Get current user's profile photo
export const getUserPhoto = async (accessToken: string): Promise<string | null> => {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
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

// Get colleagues - people from same groups
export const getColleagues = async (accessToken: string) => {
  try {
    // First get user's groups
    const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf/microsoft.graph.group?$top=20', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!groupsResponse.ok) {
      console.error('Error fetching groups');
      return [];
    }

    const groupsData = await groupsResponse.json();
    const groups = groupsData.value || [];

    // Get members from all groups
    const colleaguesMap = new Map();
    
    for (const group of groups.slice(0, 5)) { // Limit to first 5 groups to avoid too many calls
      try {
        const membersResponse = await fetch(
          `https://graph.microsoft.com/v1.0/groups/${group.id}/members/microsoft.graph.user?$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation&$top=50`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          const members = membersData.value || [];
          
          members.forEach((member: any) => {
            if (!colleaguesMap.has(member.id)) {
              colleaguesMap.set(member.id, member);
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching members for group ${group.id}:`, error);
      }
    }

    return Array.from(colleaguesMap.values());
  } catch (error) {
    console.error('Error fetching colleagues:', error);
    return [];
  }
};

// Alternative: Get people from same department
export const getDepartmentColleagues = async (accessToken: string) => {
  try {
    // Get current user's department
    const userProfile = await getUserProfile(accessToken);
    const userDepartment = userProfile.department;

    if (!userDepartment) {
      // Fallback to getting colleagues from groups
      return getColleagues(accessToken);
    }

    // Get users from same department
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users?$filter=department eq '${userDepartment}'&$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation&$top=100`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching department colleagues:', error);
    return [];
  }
};

// Fetch specific user's profile photo with better error handling
export const getSpecificUserPhoto = async (accessToken: string, userId: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/photo/$value`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read photo blob'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching photo for user:', userId, error);
    return null;
  }
};

// Batch fetch photos for multiple users
export const batchFetchPhotos = async (accessToken: string, userIds: string[]): Promise<{ [key: string]: string }> => {
  const photoCache: { [key: string]: string } = {};
  
  // Fetch photos in parallel but limit concurrent requests
  const batchSize = 5;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const promises = batch.map(async (userId) => {
      const photo = await getSpecificUserPhoto(accessToken, userId);
      return { userId, photo };
    });

    const results = await Promise.all(promises);
    results.forEach(({ userId, photo }) => {
      if (photo) {
        photoCache[userId] = photo;
      }
    });
  }

  return photoCache;
};

// Get user groups
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

// Get group members
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