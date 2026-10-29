import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, refreshSession, setToken } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  // Restore the session from the refresh cookie when the site opens
  useEffect(() => {
    refreshSession().then((d) => setUser(d.user)).catch(() => {}).finally(() => setReady(true));
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  const value = useMemo(() => {
    const start = async (path, body) => {
      const { data } = await api.post(path, body);
      setToken(data.accessToken);
      setUser(data.user);
    };
    return {
      user,
      ready,
      login: (body) => start('/auth/login', body),
      register: (body) => start('/auth/register', body),
      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        setToken(null);
        setUser(null);
        queryClient.clear();
      },
    };
  }, [user, ready, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
