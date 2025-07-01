import { useState } from 'react';
import axios from 'axios';
import { User, AuthResponse } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { API_BASE_URL } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('chatflow_user', null);
  const [token, setToken] = useLocalStorage<string | null>('chatflow_token', null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string, token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, { email, password, token });
      setUser(response.data.user);
      setToken(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password,
      });
      setUser(response.data.user);
      setToken(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return { user, token, login, register, logout, error, loading };
};