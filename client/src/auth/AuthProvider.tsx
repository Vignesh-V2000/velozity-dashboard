import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthContext } from './AuthContext';
import { AuthUser } from '../types';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

const ACCESS_TOKEN_MS = 14 * 60 * 1000; // refresh 1 min before expiry (15min token)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const storeToken = useCallback((token: string) => {
    setAccessToken(token);
    (window as any).__accessToken = token;
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const { data } = await api.post(ENDPOINTS.AUTH_REFRESH);
        if (data.data?.accessToken) {
          storeToken(data.data.accessToken);
          setUser(data.data.user);
          scheduleRefresh();
        }
      } catch {
        setUser(null);
        setAccessToken(null);
        (window as any).__accessToken = null;
      }
    }, ACCESS_TOKEN_MS);
  }, [storeToken]);

  // On mount — try to restore session via refresh cookie
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.post(ENDPOINTS.AUTH_REFRESH);
        if (data.data?.accessToken) {
          storeToken(data.data.accessToken);
          setUser(data.data.user);
          scheduleRefresh();
        }
      } catch {
        // No session — user must login
      } finally {
        setIsLoading(false);
      }
    })();

    // Listen for forced logout from axios interceptor
    const handleLogout = () => {
      setUser(null);
      setAccessToken(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [storeToken, scheduleRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post(ENDPOINTS.AUTH_LOGIN, { email, password });
    storeToken(data.data.accessToken);
    setUser(data.data.user);
    scheduleRefresh();
  }, [storeToken, scheduleRefresh]);

  const logout = useCallback(async () => {
    try {
      await api.post(ENDPOINTS.AUTH_LOGOUT);
    } catch { /* ignore */ }
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setUser(null);
    setAccessToken(null);
    (window as any).__accessToken = null;
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
