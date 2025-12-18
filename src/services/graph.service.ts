// Microsoft Graph API calls
import axios from 'axios';

export const getUserProfile = async (accessToken: string) => {
  const res = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.data;
};
