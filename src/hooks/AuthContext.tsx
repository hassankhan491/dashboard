import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import type { ModuleKey, PermissionAction, User } from '../types/auth';
import { hasPermission } from '../utils/permissions';

const TOKEN_KEY = 'ecomops.token';

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean; // true while restoring session from stored token
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (module: ModuleKey, action: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restore session on app load (like validating a stored JWT)
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsInitializing(false);
      return;
    }
    authService
      .me(token)
      .then((restored) => setUser(restored))
      .finally(() => setIsInitializing(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login(email, password);
    localStorage.setItem(TOKEN_KEY, session.token);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      login,
      logout,
      can: (module, action) => hasPermission(user, module, action),
    }),
    [user, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}