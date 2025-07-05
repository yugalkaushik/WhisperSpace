import { useState } from 'react';
import type { User } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useProfile } from './useProfile';

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('chatflow_user', null);
  const [token, setToken] = useLocalStorage<string | null>('chatflow_token', null);
  const { resetProfile } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [loading] = useState(false);

  // Set user and token (used by AuthCallback after Google OAuth)
  const setAuthData = (userData: User, authToken: string) => {
    setUser(userData);
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
    resetProfile(); // Clear profile data from localStorage
    setError(null);
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