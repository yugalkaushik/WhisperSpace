import { useState } from 'react';
import type { User } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('chatflow_user', null);
  const [token, setToken] = useLocalStorage<string | null>('chatflow_token', null);
  const [error, setError] = useState<string | null>(null);
  const [loading] = useState(false);

  // Set user and token (used by AuthCallback after Google OAuth)
  const setAuthData = (userData: User, authToken: string) => {
    // Load nickname and avatar from localStorage if they exist
    const savedNickname = localStorage.getItem(STORAGE_KEYS.NICKNAME);
    const savedAvatar = localStorage.getItem(STORAGE_KEYS.AVATAR);
    
    const enhancedUser = {
      ...userData,
      nickname: savedNickname || userData.nickname || userData.username,
      selectedAvatar: savedAvatar || userData.selectedAvatar || 'avatar1'
    };
    
    setUser(enhancedUser);
    setToken(authToken);
    setError(null);
  };

  // Placeholder functions for compatibility (OAuth flow handles actual auth)
  const login = async () => {
    // OAuth login is handled by redirecting to Google
    setError('Please use Google Sign-In');
  };

  const register = async () => {
    // OAuth registration is handled by redirecting to Google  
    setError('Please use Google Sign-In');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    // Clear profile data from localStorage
    localStorage.removeItem(STORAGE_KEYS.NICKNAME);
    localStorage.removeItem(STORAGE_KEYS.AVATAR);
  };

  return { 
    user, 
    token, 
    login, 
    register, 
    logout, 
    error, 
    loading,
    setAuthData 
  };
};