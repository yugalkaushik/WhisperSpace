import { useState, useEffect } from 'react';
import type { User } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useProfile } from './useProfile';

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('chatflow_user', null);
  const [token, setToken] = useLocalStorage<string | null>('chatflow_token', null);
  const { resetProfile } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('chatflow_token');
    const storedUserData = localStorage.getItem('chatflow_user');
    
    if ((storedToken && !storedUserData) || (!storedToken && storedUserData)) {
      localStorage.removeItem('chatflow_token');
      localStorage.removeItem('chatflow_user');
      setUser(null);
      setToken(null);
    }
  }, [token, setToken, setUser]);

  const setAuthData = (userData: User, authToken: string) => {
    localStorage.setItem('chatflow_token', authToken);
    localStorage.setItem('chatflow_user', JSON.stringify(userData));
    
    setToken(authToken);
    setUser(userData);
    setError(null);
  };

  const login = async () => {
    setError('Please use Google Sign-In');
  };

  const register = async () => {
    setError('Please use Google Sign-In');
  };

  const logout = () => {
    setLoading(true);
    
    localStorage.removeItem('chatflow_token');
    localStorage.removeItem('chatflow_user');
    localStorage.removeItem('currentRoom');
    localStorage.removeItem('auth_attempt_time');
    
    setUser(null);
    setToken(null);
    resetProfile();
    setError(null);
    setLoading(false);
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