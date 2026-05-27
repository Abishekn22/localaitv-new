import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE } from '../api/client.js';

const STORAGE_KEY_TOKEN = 'localaitv.auth.token';
const STORAGE_KEY_USER  = 'localaitv.auth.user';

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJSON(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Public helper — reads the cached user (with is_verified) without hitting the network.
export function getCachedUserVerification() {
  const user = readJSON(STORAGE_KEY_USER);
  if (!user) return null;
  return { user, is_verified: !!user.is_verified };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_TOKEN) || null; } catch { return null; }
  });
  const [user, setUserState] = useState(() => readJSON(STORAGE_KEY_USER));
  const [loading, setLoading] = useState(false);

  const setToken = useCallback((t) => {
    setTokenState(t || null);
    try {
      if (t) localStorage.setItem(STORAGE_KEY_TOKEN, t);
      else localStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch {}
  }, []);

  const setUser = useCallback((u) => {
    setUserState(u || null);
    writeJSON(STORAGE_KEY_USER, u || null);
  }, []);

  const setSession = useCallback(({ token: t, user: u }) => {
    if (t) setToken(t);
    if (u) setUser(u);
  }, [setToken, setUser]);

  const logout = useCallback(() => {
    setTokenState(null);
    setUserState(null);
    try {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {}
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (res.status === 401) {
        logout();
        return null;
      }
      const data = await res.json().catch(() => null);
      // Backend may return either { user: {...} } or the user object directly
      const fresh = data && (data.user || (data.id ? data : null));
      if (fresh) setUser(fresh);
      return fresh;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, logout, setUser]);

  // On first mount, if we have a token but no cached user, fetch it.
  useEffect(() => {
    if (token && !user) refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: !!token,
    setSession,
    setUser,
    setToken,
    refreshUser,
    logout,
  }), [token, user, loading, setSession, setUser, setToken, refreshUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
