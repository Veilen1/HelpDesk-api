import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { auth, clearSession, getStoredUser, saveSession, users } from '../utils/api';
import type { UpdateUserPayload, User } from '../utils/api';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAdmin: boolean;
  canManage: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (data: UpdateUserPayload) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [status, setStatus] = useState<AuthStatus>(() =>
    localStorage.getItem('token') ? 'loading' : 'anonymous',
  );

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setStatus('anonymous');
      return;
    }
    let active = true;
    auth
      .me()
      .then((current) => {
        if (!active) return;
        setUser(current);
        localStorage.setItem('user', JSON.stringify(current));
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setUser(null);
        setStatus('anonymous');
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await auth.login(email, password);
    saveSession(data);
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await auth.register(name, email, password);
      saveSession(data);
      setUser(data.user);
      setStatus('authenticated');
    },
    [],
  );

  const logout = useCallback(() => {
    auth.logout();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const refresh = useCallback(async () => {
    const current = await auth.me();
    setUser(current);
    localStorage.setItem('user', JSON.stringify(current));
    setStatus('authenticated');
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateUserPayload) => {
      if (!user) throw new Error('Sesión no iniciada');
      const updated = await users.update(user.id, data);
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAdmin: user?.role === 'ADMIN',
      canManage: user?.role === 'ADMIN' || user?.role === 'AGENT',
      login,
      register,
      logout,
      refresh,
      updateProfile,
    }),
    [user, status, login, register, logout, refresh, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}