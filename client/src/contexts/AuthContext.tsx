import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthContext } from './auth-context';

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
      setAuthData: auth.setAuthData,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};