// API client — talks to TWO LocalAI backends.
//
//   API_BASE   (main)       → http://localhost:5000/api   (dev)
//                            https://localaitv.com/api     (prod)
//       Most app endpoints: news, bulletins, incidents, auth, reports,
//       election, leaderboard, projects, utility, users…
//
//   API_BASE_2 (aiservices) → https://aiservices.localaitv.com   (local + prod)
//       The classifieds feed + all the upload forms (& /upload-file) live here.
//
// Routing:
//   • apiCall('/classifieds…')   → aiservices (URL 2)
//   • apiCall(anything else)     → main (URL 1)
//   • apiCall2(…)                → aiservices (URL 2), explicit
//   • `${API}/…`  (forms+upload) → aiservices (URL 2)  — API alias points there
//   • `${API_BASE}/…` (auth/reports/…) → main (URL 1)
//
// Override either base with VITE_API_BASE / VITE_API_BASE_2 in a .env file.

const _env   = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const _isDev = !!_env.DEV;

// ── URL 1 — main backend (localhost in dev, localaitv.com in prod) ──
const DEV_API_BASE  = 'http://localhost:5000/api';
const PROD_API_BASE = 'https://localaitv.com/api';
export const API_BASE = _env.VITE_API_BASE || (_isDev ? DEV_API_BASE : PROD_API_BASE);

// ── URL 2 — aiservices backend (same URL for local + prod) ──
export const API_BASE_2 = _env.VITE_API_BASE_2 || 'https://aiservices.localaitv.com';

export const YT_CHANNEL  = 'UClB3scGwKSfe3CmLYYFkDoQ';
export const APP_VERSION = '1.0.6';

// Read paths that live on the aiservices backend (URL 2). Everything else → URL 1.
const _URL2_PREFIXES = ['/classifieds'];
function _baseFor(path) {
  return _URL2_PREFIXES.some(p => path.startsWith(p)) ? API_BASE_2 : API_BASE;
}

async function _fetchJSON(base, path, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${base}${path}`, {
      ...opts,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// GET/POST helper. Auto-routes by path (classifieds → aiservices, rest → main).
export async function apiCall(path, opts = {}) {
  return _fetchJSON(_baseFor(path), path, opts);
}

// Explicit helper for the aiservices backend (URL 2).
export async function apiCall2(path, opts = {}) {
  return _fetchJSON(API_BASE_2, path, opts);
}

// Convenience aliases. Forms + upload use `${API}` and must hit aiservices (URL 2).
export const API  = API_BASE_2;  // aiservices — forms + /upload-file
export const API2 = API_BASE_2;  // aiservices
