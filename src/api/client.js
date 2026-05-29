// API client — routes /api/* calls across multiple LocalAI backends.
//
// Each backend is a named "service" with its own base URL (env-overridable,
// with a hardcoded production default). A central ROUTES table maps URL
// path-prefixes to the service that serves them; anything unmatched falls
// through to DEFAULT_SERVICE (the main app backend).
//
// ── To add a NEW backend domain ────────────────────────────────────────────
//   1. Add an entry to BACKENDS  → name : (VITE_* env override || default URL)
//   2. Map its path-prefixes to that name in ROUTES.
//   That's it — `apiCall('/whatever')` auto-routes by prefix. No call-site edits.
//
// ── To move an existing endpoint to a different backend ─────────────────────
//   Just change / add its prefix in ROUTES. Longest matching prefix wins, so
//   '/utility' → main and '/utility/trains' → aiservices can coexist.

const _env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

// Which URL set to use: an explicit VITE_ENV flag (`dev` | `prod`) wins; with
// no flag set, we fall back to Vite's build mode (`npm run dev` → dev).
// Either way, an explicit VITE_API_BASE / VITE_API_BASE_2 below still overrides
// the chosen default URL.
const _mode  = String(_env.VITE_ENV || (_env.DEV ? 'dev' : 'prod')).toLowerCase();
const _isDev = _mode === 'dev';

// ── Backend registry — service name → base URL ──────────────────────────────
// Each URL is env-overridable (so prod / staging / dev can differ without a
// code change). With no env var set, it falls back to a localhost default in
// development and the live production domain otherwise (see _mode above).
export const BACKENDS = {
  // URL 1 — main app backend: news, incidents, auth, election, leaderboard,
  //         projects, utility (veg/weather), contacts, reports, users…
  main:       _env.VITE_API_BASE   || (_isDev ? 'http://localhost:5000/api' : 'https://localaitv.com/api'),
  // URL 2 — aimodelsss backend: the classifieds feed + all forms + upload.
  aiservices: _env.VITE_API_BASE_2 || (_isDev ? 'http://localhost:5000/api' : 'https://aiservices.localaitv.com/api'),
  // Add more backends here, e.g.:
  //   media: _env.VITE_API_BASE_MEDIA || (_isDev ? 'http://localhost:5000/api' : 'https://media.localaitv.com/api'),
};

// Backend used for any path not matched in ROUTES below.
const DEFAULT_SERVICE = 'main';

// ── Route table — path prefix → service name (see BACKENDS). ────────────────
// Anything not listed here is served by DEFAULT_SERVICE. Longest match wins.
const ROUTES = {
  '/classifieds':    'aiservices',
  // Add new endpoint prefixes here, e.g.:
  //   '/forms':  'aiservices',
  //   '/upload': 'aiservices'
};

// Resolve a request path to its backend base URL via the longest matching
// prefix in ROUTES. Falls back to the default backend when nothing matches.
function _serviceFor(path) {
  let bestPrefix = '';
  let service = DEFAULT_SERVICE;
  for (const prefix in ROUTES) {
    if (path.startsWith(prefix) && prefix.length > bestPrefix.length) {
      bestPrefix = prefix;
      service = ROUTES[prefix];
    }
  }
  return service;
}

function _baseFor(path) {
  return BACKENDS[_serviceFor(path)] || BACKENDS[DEFAULT_SERVICE];
}

// ── Back-compat named exports (consumed across the app via _imports.js) ─────
export const API_BASE   = BACKENDS.main;        // URL 1
export const API_BASE_2 = BACKENDS.aiservices;  // URL 2
export const YT_CHANNEL  = 'UClB3scGwKSfe3CmLYYFkDoQ';
export const APP_VERSION = '1.0.6';

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

// GET/POST helper. Auto-routes by path prefix (see ROUTES); defaults to URL 1.
export async function apiCall(path, opts = {}) {
  return _fetchJSON(_baseFor(path), path, opts);
}

// Explicit helper for the aimodelsss backend (URL 2), if ever needed directly.
export async function apiCall2(path, opts = {}) {
  return _fetchJSON(BACKENDS.aiservices, path, opts);
}

// Convenience aliases. The forms + upload helpers use `${API}` and must hit URL 2.
export const API  = BACKENDS.aiservices;
export const API2 = BACKENDS.aiservices;
