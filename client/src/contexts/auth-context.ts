import { createContext } from 'react';
import type { AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  loading: false,
  setAuthData: () => {},
});
