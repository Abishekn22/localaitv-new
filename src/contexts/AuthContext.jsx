import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// True when the user object indicates a verified account (handles the several
// shapes the backend returns: is_verified bool/1/'1', verified 'yes'/'true').
export function isUserVerified(u) {
  if (!u) return false;
  if (u.is_verified === true || u.is_verified === 1 || u.is_verified === '1') return true;
  const v = String(u.verified == null ? '' : u.verified).toLowerCase();
  return v === 'yes' || v === 'true' || v === '1';
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

  // Merge a partial update into the stored user (reads the persisted copy first
  // so concurrent/interval callers never clobber each other with stale state).
  const patchUser = useCallback((partial) => {
    if (!partial) return;
    const prev = readJSON(STORAGE_KEY_USER) || {};
    setUser({ ...prev, ...partial });
  }, [setUser]);

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
      // Also clear the legacy registration-profile keys App.jsx writes, so no
      // stale identity (name / mobile / photo) lingers after sign-out.
      localStorage.removeItem('localaitv_user_profile');
      localStorage.removeItem('localaitv_registered');
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
      if (fresh) {
        // Preserve the profile photo if /auth/me doesn't echo it back, so the
        // avatar doesn't vanish after a refresh.
        const prev = readJSON(STORAGE_KEY_USER) || {};
        if (!fresh.profile_picture && !fresh.profile_photo) {
          const keptPic = prev.profile_picture || prev.profile_photo;
          if (keptPic) fresh.profile_picture = keptPic;
        }
        setUser(fresh);
      }
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

  // Resolve role + verification once per session (POST /users/:id/role) so the
  // admin gating and the upload-verification gate reflect the real status.
  const _roleCheckedFor = useRef(null);
  useEffect(() => {
    const uid = user && user.id;
    if (!token || !uid || _roleCheckedFor.current === uid) return;
    _roleCheckedFor.current = uid;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users/${uid}/role`, {
          method: 'GET',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (!cancelled && data && (data.role || 'is_verified' in data)) {
          patchUser({
            ...(data.role ? { role: data.role } : {}),
            ...('is_verified' in data ? { is_verified: data.is_verified } : {}),
            ...('verified' in data ? { verified: data.verified } : {}),
          });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user && user.id]);

  const value = useMemo(() => ({
    token,
    user,
    loading,
    isAuthenticated: !!token,
    isVerified: isUserVerified(user),
    setSession,
    setUser,
    patchUser,
    setToken,
    refreshUser,
    logout,
  }), [token, user, loading, setSession, setUser, patchUser, setToken, refreshUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
