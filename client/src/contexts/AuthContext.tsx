import { createContext, ReactNode, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
  loading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();

  const value = useMemo(
    () => ({
      user: auth.user,
      token: auth.token,
      login: auth.login,
      register: auth.register,
      logout: auth.logout,
      error: auth.error,
      loading: auth.loading,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};