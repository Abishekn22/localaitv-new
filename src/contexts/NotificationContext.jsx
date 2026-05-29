import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';

// Internal, app-driven notification store. Notifications are generated inside
// the app (no push backend) — the first source is the user's verification
// status, which fires a notification on first determination and on every
// subsequent change. Everything is persisted to localStorage so the panel
// survives reloads.
const STORAGE_KEY_NOTIFS  = 'localaitv.notifications';
const STORAGE_KEY_VERIFY  = 'localaitv.notif.verifyState'; // { userId, verified }
const STORAGE_KEY_ROLE    = 'localaitv.notif.roleState';   // { userId, role }

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Relative "time ago" label for a notification timestamp (ms epoch).
export function formatNotifTime(ts) {
  if (!ts) return '';
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

// Build the verification notification payload for a given verified state.
function makeVerifyNotif(verified) {
  return verified
    ? {
        type: 'verify',
        icon: '✅',
        title: 'Your account is verified',
        sub: 'You can now upload news and content.',
        nav: 'profile',
      }
    : {
        type: 'verify',
        icon: '⏳',
        title: 'Account not verified',
        sub: 'Verification pending — uploads unlock once verified.',
        nav: 'profile',
      };
}

// Normalize the many backend role spellings to a single key:
// "Super Admin" / "super-admin" → "super_admin", etc.
function normalizeRole(raw) {
  return String(raw == null ? '' : raw).toLowerCase().trim().replace(/[\s-]+/g, '_');
}

// Admin-tier roles (anything above a plain "user"). Used to pick the tap target.
const ADMIN_ROLE_KEYS = new Set([
  'admin', 'master', 'master_admin', 'super', 'superadmin', 'super_admin', 'moderator',
]);
function isAdminRole(roleKey) {
  return ADMIN_ROLE_KEYS.has(roleKey);
}

// Friendly label for a normalized role key.
function roleLabel(roleKey) {
  switch (roleKey) {
    case 'super':
    case 'superadmin':
    case 'super_admin':  return 'Super Admin';
    case 'master':
    case 'master_admin': return 'Master Admin';
    case 'admin':        return 'Admin';
    case 'moderator':    return 'Moderator';
    case 'user':
    case '':             return 'User';
    default:
      // Title-case any unexpected value so it still reads cleanly.
      return roleKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

// Build the role notification payload for a normalized role key.
function makeRoleNotif(roleKey) {
  const admin = isAdminRole(roleKey);
  const icon = roleKey === 'super' || roleKey === 'superadmin' || roleKey === 'super_admin'
    ? '👑'
    : admin ? '🛡️' : '👤';
  return {
    type: 'role',
    icon,
    title: `Your role: ${roleLabel(roleKey)}`,
    sub: admin
      ? 'You have admin access — tap to open the admin dashboard.'
      : "You're signed in as a regular user.",
    nav: admin ? 'admindashboard' : 'profile',
  };
}

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, isVerified, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(() => readJSON(STORAGE_KEY_NOTIFS, []));
  const _idSeq = useRef(0);

  // Persist on every change.
  useEffect(() => { writeJSON(STORAGE_KEY_NOTIFS, notifications); }, [notifications]);

  const addNotification = useCallback((payload) => {
    if (!payload) return;
    const id = `${Date.now()}_${_idSeq.current++}`;
    setNotifications(prev => [{ id, ts: Date.now(), unread: true, ...payload }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.some(n => n.unread)
      ? prev.map(n => (n.unread ? { ...n, unread: false } : n))
      : prev);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => (prev.length ? [] : prev));
  }, []);

  // ── Verification → notification bridge ───────────────────────
  // Fire a notification the first time we know a user's status, and again
  // whenever it flips. The last-seen status is keyed by user id so it only
  // fires once per real change (not on every reload).
  const userId = isAuthenticated ? (user && user.id) : null;
  useEffect(() => {
    if (!userId) return;
    const rec = readJSON(STORAGE_KEY_VERIFY, null);
    const current = !!isVerified;
    if (!rec || rec.userId !== userId || rec.verified !== current) {
      addNotification(makeVerifyNotif(current));
      writeJSON(STORAGE_KEY_VERIFY, { userId, verified: current });
    }
  }, [userId, isVerified, addNotification]);

  // ── Role → notification bridge ───────────────────────────────
  // Fire once when the role is first known (from GET /users/:id/role) and again
  // whenever it changes. We only act once `user.role` is an actual value so an
  // admin doesn't briefly get a "User" notification before the role resolves.
  const rawRole = user && user.role;
  useEffect(() => {
    if (!userId || !rawRole) return;
    const roleKey = normalizeRole(rawRole);
    const rec = readJSON(STORAGE_KEY_ROLE, null);
    if (!rec || rec.userId !== userId || rec.role !== roleKey) {
      addNotification(makeRoleNotif(roleKey));
      writeJSON(STORAGE_KEY_ROLE, { userId, role: roleKey });
    }
  }, [userId, rawRole, addNotification]);

  const unreadCount = useMemo(
    () => notifications.reduce((n, x) => n + (x.unread ? 1 : 0), 0),
    [notifications],
  );

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAllRead,
    clearAll,
  }), [notifications, unreadCount, addNotification, markAllRead, clearAll]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}
