import axios from 'axios';
import type { User } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const tokenRaw = localStorage.getItem('chatflow_token');
  let token = tokenRaw;
  
  // Handle case where token is JSON stringified by useLocalStorage
  if (tokenRaw) {
    try {
      // useLocalStorage JSON.stringify's everything, so parse it
      const parsed = JSON.parse(tokenRaw);
      token = parsed;
    } catch {
      // If parsing fails, use the raw value
      token = tokenRaw;
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const updateUserProfile = async (data: { nickname: string; selectedAvatar: string }): Promise<{ user: User }> => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export default api;