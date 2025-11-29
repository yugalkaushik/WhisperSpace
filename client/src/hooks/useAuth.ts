import { useEffect, useState } from 'react';
import type { User } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useProfile } from './useProfile';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('chatflow_user', null);
  const [token, setToken] = useLocalStorage<string | null>('chatflow_token', null);
  const { resetProfile } = useProfile();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      if (user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.user && isMounted) {
          setUser(response.data.user);
          setError(null);
        }
      } catch (fetchError) {
        console.error('Failed to rehydrate user profile:', fetchError);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [token, user, setUser, setToken]);

  const setAuthData = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setError(null);
    setLoading(false);
  };

  const login = async () => {
    setError('Please use Google Sign-In');
  };

  const register = async () => {
    setError('Please use Google Sign-In');
  };

  const logout = () => {
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