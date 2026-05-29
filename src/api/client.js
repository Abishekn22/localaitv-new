// API client — talks to the LocalAI backend.
// Base URL switches by environment:
//   • Vite dev server (`npm run dev`) → http://localhost:5000/api
//   • Production build               → https://aiservices.localaitv.com/api
// Override either with VITE_API_BASE in a .env file.
const DEV_API_BASE  = 'http://localhost:5000/api';
const PROD_API_BASE = 'https://aiservices.localaitv.com/api';
export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV)
    ? DEV_API_BASE
    : PROD_API_BASE);
export const YT_CHANNEL  = 'UClB3scGwKSfe3CmLYYFkDoQ';
export const APP_VERSION = '1.0.6';

export async function apiCall(path, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
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

// Convenience alias used by the older form/upload code paths.
export const API = API_BASE;
