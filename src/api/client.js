// API client — talks to TWO LocalAI backends.
//
//   API_BASE   (URL 1) = https://localaitv.com/api
//       Main app endpoints: news, bulletins, incidents, auth, election,
//       leaderboard, projects, utility (veg/weather), contacts, reports, users…
//
//   API_BASE_2 (URL 2) = https://aiservices.localaitv.com/api
//       aimodelsss endpoints — the classifieds feed + all the forms + upload.
//       This is the server that holds the database for those.
//
// Routing:
//   • apiCall('/classifieds…')  → URL 2   (aimodelsss read feed)
//   • apiCall(anything else)    → URL 1   (main app)
//   • `${API}/…` (forms+upload) → URL 2   (API alias points at URL 2)
//
// Override either base with VITE_API_BASE / VITE_API_BASE_2 in a .env file.

const _env   = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const _isDev = !!_env.DEV;

// ── URL 1 — main app backend ───────────────────────────────────────────────
const DEV_API_BASE  = 'https://localaitv.com/api';
const PROD_API_BASE = 'https://localaitv.com/api';
export const API_BASE = _env.VITE_API_BASE || (_isDev ? DEV_API_BASE : PROD_API_BASE);

// ── URL 2 — aimodelsss backend (forms + classifieds + upload) ──────────────
const DEV_API_BASE_2  = 'https://aiservices.localaitv.com/api';
const PROD_API_BASE_2 = 'https://aiservices.localaitv.com/api';
export const API_BASE_2 = _env.VITE_API_BASE_2 || (_isDev ? DEV_API_BASE_2 : PROD_API_BASE_2);

export const YT_CHANNEL  = 'UClB3scGwKSfe3CmLYYFkDoQ';
export const APP_VERSION = '1.0.6';

// Read paths that live on the aimodelsss backend (URL 2). Everything else → URL 1.
const _URL2_PREFIXES = ['/classifieds', '/utility/trains'];
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

// GET/POST helper. Auto-routes by path (classifieds/trains → URL 2, rest → URL 1).
export async function apiCall(path, opts = {}) {
  return _fetchJSON(_baseFor(path), path, opts);
}

// Explicit helper for the aimodelsss backend (URL 2), if ever needed directly.
export async function apiCall2(path, opts = {}) {
  return _fetchJSON(API_BASE_2, path, opts);
}

// Convenience aliases. The forms + upload helper use `${API}` and must hit URL 2.
export const API  = API_BASE_2;
export const API2 = API_BASE_2;
