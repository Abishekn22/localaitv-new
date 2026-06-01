// Shared helpers used by the request/upload forms.
import { API } from '../../_imports.js';

function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`; }

// Returns the logged-in user's location id (numeric) from the cached auth user,
// so every request/upload form can stamp the submitter's constituency.
// Mirrors AuthContext STORAGE_KEY_USER ('localaitv.auth.user'); user.location
// holds the locations table id (same value used at registration). Null if not
// logged in or unparseable.
function getUserLocationId() {
  try {
    const u = JSON.parse(localStorage.getItem('localaitv.auth.user') || 'null');
    const raw = u && (u.location ?? u.location_id);
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// ── Compliance ID generator (per IT Rules 2021 spec) ───────
// Produces LAI-XXX-YYYYMMDD-RANDOMNUMBER format
// Used for: complaints (GRV), takedowns (IP), counter-notifications (CN),
// channel partners (CP), advertising (AD), content reports (RPT)
function genComplianceId(typeCode) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.floor(Math.random()*900000) + 100000; // 6-digit
  return `LAI-${typeCode}-${ymd}-${rand}`;
}

// Upload each file to /api/upload-file and return the resulting URLs.
// IMPORTANT: this no longer swallows failures. A failed upload (too large,
// server error, network drop, missing URL) THROWS so the calling form can show
// the user a real error instead of silently submitting a record with no media.
const MAX_UPLOAD_BYTES = 450 * 1024 * 1024; // 450 MB — safety margin under nginx 500M

async function uploadPhotos(files, reqId, relatedType) {
  const urls = [];
  for (const file of files) {
    // Client-side guard so the user gets instant feedback instead of waiting
    // for a long upload only to hit the server's size cap.
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`"${file.name}" is too large (${Math.round(file.size / 1024 / 1024)} MB). Maximum is 450 MB.`);
    }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('broadcast_request_id', reqId);
    fd.append('related_type', relatedType);
    let r;
    try {
      r = await fetch(`${API}/upload-file`, { method:'POST', body:fd });
    } catch (e) {
      throw new Error('Upload failed — please check your connection and try again.');
    }
    if (!r.ok) {
      throw new Error(r.status === 413
        ? 'Video is too large for the server. Please upload a shorter or smaller file.'
        : `Upload failed (server error ${r.status}). Please try again.`);
    }
    const d = await r.json().catch(() => null);
    if (!d || !d.file_url) {
      throw new Error('Upload did not complete — no file URL was returned. Please try again.');
    }
    urls.push(d.file_url);
  }
  return urls;
}

export { genId, genComplianceId, uploadPhotos, getUserLocationId };
