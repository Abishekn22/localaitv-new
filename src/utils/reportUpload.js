// Shared report-upload helpers — used by the report/news upload flows.
// Mirrors the backend contract for /reports media uploads. Do NOT change the
// backend; field names and endpoints here must match it exactly.
//
// Endpoints (single /api — API_BASE already ends in /api in this repo):
//   POST /reports/media/init     JSON { kind, totalSize, mimeType, originalName } -> { uploadId }
//   POST /reports/media/chunk    FormData { uploadId, index, chunk }              (per 2MB slice)
//   POST /reports/media/complete JSON { uploadId }                                -> { path }
//
// Auth header rules (critical):
//   • JSON requests     → { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
//   • FormData requests → { Authorization: 'Bearer ' + token } ONLY (never set Content-Type)
import { API_BASE } from '../api/client.js';

export const CHUNK_SIZE = 2 * 1024 * 1024;             // 2 MB slices
export const DIRECT_THRESHOLD = 5 * 1024 * 1024;       // ≤5 MB → send directly in the /reports FormData
export const MAX_REPORT_FILE_BYTES = 2 * 1024 * 1024 * 1024; // hard 2 GB cap

// Chunk-upload a single large file (> DIRECT_THRESHOLD) and return the
// server-stored path. `kind` is 'video' | 'image' | 'audio'. `onProgress`
// (optional) receives a 0..1 fraction for this file.
export async function uploadMediaChunked({ blob, kind, originalName, token, onProgress }) {
  const authHeader = token ? { Authorization: 'Bearer ' + token } : {};

  // 1) init
  const initRes = await fetch(`${API_BASE}/reports/media/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({
      kind,
      totalSize: blob.size,
      mimeType: blob.type || 'application/octet-stream',
      originalName,
    }),
  });
  if (!initRes.ok) throw new Error(`Upload init failed (${initRes.status})`);
  const initData = await initRes.json().catch(() => null);
  const uploadId = initData && initData.uploadId;
  if (!uploadId) throw new Error('Upload init returned no uploadId');

  // 2) chunks — one 2 MB slice at a time (FormData: no Content-Type header)
  const totalChunks = Math.max(1, Math.ceil(blob.size / CHUNK_SIZE));
  for (let index = 0; index < totalChunks; index++) {
    const start = index * CHUNK_SIZE;
    const chunk = blob.slice(start, Math.min(start + CHUNK_SIZE, blob.size));
    const fd = new FormData();
    fd.append('uploadId', uploadId);
    fd.append('index', String(index));
    fd.append('chunk', chunk);
    const chunkRes = await fetch(`${API_BASE}/reports/media/chunk`, {
      method: 'POST',
      headers: { ...authHeader },
      body: fd,
    });
    if (!chunkRes.ok) throw new Error(`Chunk ${index + 1}/${totalChunks} failed (${chunkRes.status})`);
    if (onProgress) onProgress((index + 1) / totalChunks);
  }

  // 3) complete
  const compRes = await fetch(`${API_BASE}/reports/media/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({ uploadId }),
  });
  if (!compRes.ok) throw new Error(`Upload complete failed (${compRes.status})`);
  const compData = await compRes.json().catch(() => null);
  const path = compData && compData.path;
  if (!path) throw new Error('Upload complete returned no path');
  return path;
}

// Classify a File by MIME into the report's media kind.
export function mediaKindOf(file) {
  const t = (file && file.type) || '';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'audio';
  return 'image';
}
