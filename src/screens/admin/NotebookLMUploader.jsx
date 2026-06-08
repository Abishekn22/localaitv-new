// NotebookLM Bulletin Uploader — Admin Dashboard module.
//
// Per NOTEBOOKLM_FULLSTACK_HANDOFF.md, only 2 APIs are involved:
//
//   1. POST {VITE_NOTEBOOKLM_API_URL}/api/notebooklm/presign       ← requires Bearer
//      → backend returns a signed S3 PUT URL
//   2. PUT  <signedUrl>  (file → S3 directly, server never touches the bytes)
//   3. GET  {VITE_NOTEBOOKLM_API_URL}/api/notebooklm/bulletins      ← NO auth
//      → list PROCESSED bulletins (raw upload + intro + welcome anchor +
//        closing anchor, built automatically by the streamer). The RAW
//        upload itself is NEVER shown in any UI — per the doc.
//
// Auth: VITE_NOTEBOOKLM_TOKEN is a static Bearer token baked into the
// frontend bundle at build time. Per the doc, this is the intended design
// — Gyana provides the token specifically for the upload endpoint.
//
// What this component is NOT responsible for:
//   - The streamer that wraps the uploaded MP4 with intro + anchors — runs
//     automatically on the backend side.
//   - Pushing into the citizen feed — also auto (the streamer POSTs to
//     /api/bulletins, called "Flow A" in the flow doc).
//
// Total surface area: this one file + 2 env vars + 1 wiring change in
// AdminDashboardScreen.jsx. No backend changes anywhere.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppTheme } from '../../_imports.js';

// ── Gyan's API config (from frontend .env.local / build-time env) ─────
const NEWSPIPELINE_URL   = import.meta.env.VITE_NOTEBOOKLM_API_URL || 'https://srv1264596.hstgr.cloud';
const NEWSPIPELINE_TOKEN = import.meta.env.VITE_NOTEBOOKLM_TOKEN   || '';

// ── Geo taxonomy ─────────────────────────────────────────────────────
// Districts come straight from NOTEBOOKLM_FULLSTACK_HANDOFF.md §"Dropdown
// data". Display label → storage key. One intentional name-key mismatch:
//   Nellore → 'nalore' (the S3 folder uses the shorter spelling)
// "Anantapur" was dropped from the doc's dropdown list — only 5 AP
// districts are valid for upload now.
const STATES = [
  { key: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { key: 'telangana',      label: 'Telangana'      },
];
const DISTRICTS = {
  andhra_pradesh: [
    { key: 'kurnool',   label: 'Kurnool'   },
    { key: 'guntur',    label: 'Guntur'    },
    { key: 'kakinada',  label: 'Kakinada'  },
    { key: 'nalore',    label: 'Nellore'   },  // ⚠️ S3 key = 'nalore'
    { key: 'tirupati',  label: 'Tirupati'  },
  ],
  telangana: [
    { key: 'khammam',     label: 'Khammam'     },
    { key: 'karimnagar',  label: 'Karimnagar'  },
    { key: 'warangal',    label: 'Warangal'    },
    { key: 'nalgonda',    label: 'Nalgonda'    },
  ],
};

// District key → backend location_id (from handoff doc §"Location IDs").
// Used to filter GET /api/notebooklm/bulletins for the "recent uploads"
// section so it shows processed bulletins for the same district the admin
// is currently uploading to.
const LOCATION_ID = {
  karimnagar: 75,
  nalgonda:   141,
  warangal:   154,
  khammam:    161,
  kakinada:   209,
  nalore:     285,
  kurnool:    305,
  tirupati:   335,
  guntur:     344,
};

const MAX_FILE_BYTES = 1024 * 1024 * 1024;   // 1 GB
const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

// Live preview of the S3 key — matches notebooklm_geo_key() in newspipeline.
function previewKey({ scope, state, district, kind, date }) {
  if (!scope || !date) return null;
  const fname = `notebooklm_${date}.mp4`;
  if (scope === 'national') return `geo/national/notebooklm/${fname}`;
  if (scope === 'state') {
    if (!state) return null;
    return `geo/states/${state}/_state/notebooklm/${fname}`;
  }
  if (scope === 'district') {
    if (!state || !district || !kind) return null;
    return `geo/states/${state}/districts/${district}/${kind}/notebooklm/${fname}`;
  }
  return null;
}

function NotebookLMUploader() {
  const { T } = useAppTheme();

  // ── form state ────────────────────────────────────────────────────────
  const [scope,    setScope]    = useState('');
  const [state,    setStateVal] = useState('');
  const [district, setDistrict] = useState('');
  const [kind,     setKind]     = useState('');
  const [date,     setDate]     = useState(TODAY_ISO());
  const [file,     setFile]     = useState(null);
  const fileInputRef = useRef(null);

  // ── upload state ──────────────────────────────────────────────────────
  const [stage,      setStage]      = useState('form');   // form | uploading | success | error
  const [progress,   setProgress]   = useState(0);
  const [errMsg,     setErrMsg]     = useState('');
  const [okPayload,  setOkPayload]  = useState(null);

  // ── recent uploads (last 2) ───────────────────────────────────────────
  const [recent,        setRecent]        = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // Reset downstream fields when scope changes — keeps the form clean.
  useEffect(() => {
    if (scope !== 'state' && scope !== 'district') setStateVal('');
    if (scope !== 'district') { setDistrict(''); setKind(''); }
  }, [scope]);
  useEffect(() => { setDistrict(''); }, [state]);

  // ── Fetch helpers ─────────────────────────────────────────────────────
  // POST /presign needs Bearer auth; GET /bulletins is public (per doc).
  // We keep them as two helpers so we don't accidentally send the admin
  // token on the public read endpoint.
  const presignCall = async (body) => {
    if (!NEWSPIPELINE_TOKEN) {
      throw new Error('VITE_NOTEBOOKLM_TOKEN missing — check .env.local');
    }
    const res = await fetch(`${NEWSPIPELINE_URL}/api/notebooklm/presign`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NEWSPIPELINE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === 'error') {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  };

  const bulletinsCall = async (queryString) => {
    // No Authorization header — doc says this endpoint is public.
    const res = await fetch(`${NEWSPIPELINE_URL}/api/notebooklm/bulletins${queryString ? '?' + queryString : ''}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.status === 'error') {
      throw new Error(data.message || `Request failed (${res.status})`);
    }
    return data;
  };

  // ── Load the last 2 PROCESSED bulletins for the currently-selected
  // location. Doc filters available: channel, location_id, kind. We use
  // location_id (derived from the picked district) + kind so admins see
  // exactly what's live for that channel feed. For 'national' / 'state'
  // scopes there's no per-district location yet, so we just show recent
  // global processed bulletins (no filter) until those land in S3.
  const loadRecent = async () => {
    if (!scope) { setRecent([]); return; }
    setRecentLoading(true);
    try {
      const params = new URLSearchParams();
      if (scope === 'district' && district && LOCATION_ID[district]) {
        params.set('location_id', String(LOCATION_ID[district]));
        if (kind) params.set('kind', kind);
      } else if (scope === 'state' && kind) {
        // 'state' scope uploads land in the state channel feed; filter by kind only.
        params.set('kind', kind);
      }
      const data = await bulletinsCall(params.toString());
      setRecent((data.items || []).slice(0, 2));
    } catch (e) {
      console.warn('[notebooklm] recent load failed:', e.message);
      setRecent([]);
    } finally {
      setRecentLoading(false);
    }
  };
  useEffect(() => { loadRecent(); /* eslint-disable-next-line */ }, [scope, state, district, kind]);

  // ── Form validation gates the submit button. ──────────────────────────
  const targetKey = previewKey({ scope, state, district, kind, date });

  const reachesText = useMemo(() => {
    if (scope === 'national') {
      // Per NOTEBOOKLM_FULLSTACK_HANDOFF.md §7: "national scope is not
      // processed yet — a national upload is stored but does not currently
      // produce a bulletin." Surfacing this here so admins don't get a
      // silent no-show after uploading.
      return '⚠️ NOTE: National uploads are stored in S3 but the backend ' +
             'streamer does NOT process them yet. The upload will succeed, ' +
             'but no processed bulletin will appear on any channel. Use ' +
             'State / District scope until Gyana confirms national is live.';
    }
    if (scope === 'state') {
      if (!state) return '';
      const stateLabel = STATES.find(s => s.key === state)?.label || state;
      const districts = (DISTRICTS[state] || []).map(d => d.label).join(', ');
      return `Plays on every district in ${stateLabel}: ${districts}.`;
    }
    if (scope === 'district') {
      if (!state || !district) return '';
      const districtLabel = (DISTRICTS[state] || []).find(d => d.key === district)?.label || district;
      const kindLabel = kind === 'local' ? 'Local feed' :
                        kind === 'district' ? 'District feed' : '(pick a feed)';
      return `Plays only on the ${kindLabel} of ${districtLabel}.`;
    }
    return '';
  }, [scope, state, district, kind]);

  const canSubmit = !!(targetKey && file && stage === 'form');

  // ── The actual upload — 2 calls to Gyan + 1 PUT to S3. ────────────────
  const onSubmit = async () => {
    if (!canSubmit) return;
    if (file.size > MAX_FILE_BYTES) {
      setStage('error');
      setErrMsg(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 1 GB.`);
      return;
    }
    if (!/\.mp4$/i.test(file.name)) {
      setStage('error');
      setErrMsg('Only .mp4 files are accepted.');
      return;
    }

    setStage('uploading');
    setProgress(0);
    setErrMsg('');

    try {
      // Step 1: Ask the backend for a signed S3 PUT URL.
      const filename = `notebooklm_${date}.mp4`;
      const presign = await presignCall({ scope, state, district, kind, filename });

      // Step 2: PUT the file directly to S3 (browser → S3, bypasses backend).
      // XMLHttpRequest because fetch() doesn't expose upload progress.
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presign.uploadUrl, true);
        xhr.setRequestHeader('Content-Type', presign.contentType || 'video/mp4');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 upload failed (HTTP ${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error('Network error during S3 upload (check S3 CORS)'));
        xhr.onabort = () => reject(new Error('Upload aborted'));
        xhr.send(file);
      });

      // Step 3: Show success + refresh recent list.
      setOkPayload({
        key: presign.key,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
      setStage('success');
      loadRecent();
    } catch (e) {
      setStage('error');
      setErrMsg(e.message || 'Upload failed');
    }
  };

  // ── Reset form to upload another ──────────────────────────────────────
  const onUploadAnother = () => {
    setFile(null);
    setStage('form');
    setProgress(0);
    setErrMsg('');
    setOkPayload(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Styles — mirror the existing AdminDashboard look. ─────────────────
  const cardS  = { background: T.bg2, border: `1px solid ${T.border}`,
                    borderRadius: 12, padding: '14px 16px', marginBottom: 12 };
  const labelS = { fontSize: 11, fontWeight: 800, letterSpacing: 1,
                    textTransform: 'uppercase', color: T.textMuted, marginBottom: 6 };
  const inputS = { width: '100%', padding: '10px 12px', borderRadius: 8,
                    border: `1px solid ${T.border}`, background: T.bg,
                    color: T.text, fontSize: 13, boxSizing: 'border-box' };
  const btnS = (variant = 'primary') => ({
    padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', border: 'none', minWidth: 140,
    background: variant === 'primary' ? '#D0021B' : T.bg3,
    color: variant === 'primary' ? '#fff' : T.text,
    transition: 'opacity 0.15s',
  });

  // ── Render — branched by stage. ───────────────────────────────────────
  if (stage === 'uploading') {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>
          Uploading to S3…
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>
          {file?.name} ({(file?.size / 1024 / 1024).toFixed(1)} MB)
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 18, wordBreak: 'break-all' }}>
          → {targetKey}
        </div>
        <div style={{ width: '100%', maxWidth: 420, height: 12, margin: '0 auto',
                       background: T.bg3, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#D0021B',
                         transition: 'width 0.2s' }}/>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: T.text }}>{progress}%</div>
        <div style={{ marginTop: 14, fontSize: 11, color: T.textMuted }}>
          Please don't close this tab.
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>✅</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 12 }}>
          Upload successful
        </div>
        <div style={cardS}>
          <div style={labelS}>S3 Key</div>
          <div style={{ fontSize: 12, color: T.text, wordBreak: 'break-all', marginBottom: 10 }}>
            {okPayload.key}
          </div>
          <div style={labelS}>Size</div>
          <div style={{ fontSize: 13, color: T.text, marginBottom: 10 }}>
            {(okPayload.size / 1024 / 1024).toFixed(1)} MB
          </div>
          <div style={labelS}>Uploaded at</div>
          <div style={{ fontSize: 13, color: T.text, marginBottom: 10 }}>
            {new Date(okPayload.uploadedAt).toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 10 }}>
            Gyan's streamer will pick this up automatically and wrap it with
            intro + anchors. Processed bulletin will appear in the citizen feed
            shortly.
          </div>
        </div>
        <button onClick={onUploadAnother} style={btnS('primary')}>🆕 Upload another</button>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>❌</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#D0021B', marginBottom: 12 }}>
          Upload failed
        </div>
        <div style={{ ...cardS, borderColor: '#D0021B' }}>
          <div style={{ fontSize: 13, color: T.text }}>{errMsg}</div>
        </div>
        <button onClick={onUploadAnother} style={btnS('secondary')}>⬅️ Back to form</button>
      </div>
    );
  }

  // ── stage === 'form' ──
  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>
          🎙️ NotebookLM Bulletin Upload
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
          Upload a NotebookLM bulletin to Gyan's S3 bucket. The streamer will
          process and broadcast it automatically.
        </div>
      </div>

      {/* STEP 1 — Scope */}
      <div style={cardS}>
        <div style={labelS}>Step 1 — Broadcast scope</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { k: 'national', label: '🌐 National',  hint: 'Plays everywhere'         },
            { k: 'state',    label: '🏛️ State',      hint: 'All districts of 1 state' },
            { k: 'district', label: '📍 District',   hint: '1 district feed'          },
          ].map(opt => {
            const active = scope === opt.k;
            return (
              <button key={opt.k} onClick={() => setScope(opt.k)}
                style={{
                  flex: '1 1 140px', padding: '10px 14px', borderRadius: 10,
                  border: `1.5px solid ${active ? '#D0021B' : T.border}`,
                  background: active ? 'rgba(208,2,27,0.08)' : T.bg,
                  color: T.text, cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
                <div style={{ fontSize: 10.5, color: T.textMuted, marginTop: 3 }}>{opt.hint}</div>
              </button>
            );
          })}
        </div>
        {reachesText && (
          <div style={{ marginTop: 10, fontSize: 11.5, color: T.textMuted, lineHeight: 1.5 }}>
            ℹ️ {reachesText}
          </div>
        )}
      </div>

      {/* STEP 2 — Location (state for 'state' scope; +district +kind for 'district') */}
      {(scope === 'state' || scope === 'district') && (
        <div style={cardS}>
          <div style={labelS}>Step 2 — Location</div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: T.text, fontWeight: 600, marginBottom: 4 }}>
              🏛️ State
            </div>
            <select value={state} onChange={(e) => setStateVal(e.target.value)} style={inputS}>
              <option value="">— pick state —</option>
              {STATES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>

          {scope === 'district' && state && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: T.text, fontWeight: 600, marginBottom: 4 }}>
                📍 District
              </div>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} style={inputS}>
                <option value="">— pick district —</option>
                {(DISTRICTS[state] || []).map(d =>
                  <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
              {district && (
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                  Stored as <code>{district}</code> in S3.
                </div>
              )}
            </div>
          )}

          {scope === 'district' && district && (
            <div>
              <div style={{ fontSize: 12, color: T.text, fontWeight: 600, marginBottom: 4 }}>
                📡 Channel kind
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { k: 'local',    label: 'Local',    hint: '"… LOCAL" rail' },
                  { k: 'district', label: 'District', hint: '"… జిల్లా వార్తలు" rail' },
                ].map(opt => {
                  const active = kind === opt.k;
                  return (
                    <button key={opt.k} onClick={() => setKind(opt.k)}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 8,
                        border: `1.5px solid ${active ? '#D0021B' : T.border}`,
                        background: active ? 'rgba(208,2,27,0.08)' : T.bg,
                        color: T.text, cursor: 'pointer', textAlign: 'left',
                      }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</div>
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{opt.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — Date */}
      {scope && (
        <div style={cardS}>
          <div style={labelS}>Step 3 — Bulletin date</div>
          <input type="date" value={date} max={TODAY_ISO()}
            onChange={(e) => setDate(e.target.value)} style={inputS}/>
          <div style={{ fontSize: 10.5, color: T.textMuted, marginTop: 5 }}>
            Filename will be <code>notebooklm_{date || 'YYYY-MM-DD'}.mp4</code>.
          </div>
        </div>
      )}

      {/* STEP 4 — File */}
      {scope && (
        <div style={cardS}>
          <div style={labelS}>Step 4 — Video file</div>
          <label htmlFor="nblm-file" style={{
            display: 'block', padding: '20px', textAlign: 'center', cursor: 'pointer',
            border: `2px dashed ${T.border}`, borderRadius: 10, background: T.bg,
          }}>
            <div style={{ fontSize: 14, color: T.text, marginBottom: 6 }}>
              {file ? '📁 ' + file.name : '📁 Click to pick a .mp4 file'}
            </div>
            <div style={{ fontSize: 11, color: T.textMuted }}>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ${file.type || 'video/mp4'}`
                : 'Max 1 GB · H.264 recommended'}
            </div>
            <input id="nblm-file" ref={fileInputRef} type="file" accept="video/mp4,.mp4"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}/>
          </label>
        </div>
      )}

      {/* Live preview of the S3 key */}
      {targetKey && (
        <div style={{ ...cardS, background: T.bg3 }}>
          <div style={labelS}>📍 Target S3 key (preview)</div>
          <div style={{ fontSize: 11.5, color: T.text, wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {targetKey}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 18, marginBottom: 24 }}>
        <button onClick={onSubmit} disabled={!canSubmit}
          style={{ ...btnS('primary'), opacity: canSubmit ? 1 : 0.45,
                    cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
          🚀 Upload Bulletin
        </button>
        {file && (
          <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
            style={btnS('secondary')}>
            Clear file
          </button>
        )}
      </div>

      {/* Recently-PROCESSED bulletins for this location.
          Note: shows the streamer's OUTPUT (intro + anchors + raw), not the
          raw upload itself — per NOTEBOOKLM_FULLSTACK_HANDOFF.md, raw video
          is never shown in any UI. Filter is location_id (district scope)
          or kind-only (state scope). National scope shows nothing here
          because the bulletins endpoint doesn't expose a scope filter. */}
      <div style={cardS}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={labelS}>📚 Last 2 processed bulletins for this location</div>
          <button onClick={loadRecent}
            style={{ background: 'none', border: 'none', color: T.textMuted,
                      cursor: 'pointer', fontSize: 11 }}>
            ↻ refresh
          </button>
        </div>
        {recentLoading && (
          <div style={{ fontSize: 12, color: T.textMuted, padding: '8px 0' }}>Loading…</div>
        )}
        {!recentLoading && recent.length === 0 && (
          <div style={{ fontSize: 12, color: T.textMuted, padding: '8px 0' }}>
            No processed bulletins yet. The streamer wraps each upload with
            intro + anchors — usually appears within a few minutes of upload.
          </div>
        )}
        {!recentLoading && recent.map((it, i) => (
          <div key={it.key || i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 0', borderTop: i > 0 ? `1px solid ${T.border}` : 'none',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, wordBreak: 'break-all' }}>
                {it.filename}
              </div>
              <div style={{ fontSize: 10.5, color: T.textMuted, marginTop: 3 }}>
                {it.channel && <span>{it.channel} · </span>}
                {it.kind && <span>{it.kind} · </span>}
                {(it.size / 1024 / 1024).toFixed(1)} MB · {new Date(it.lastModified).toLocaleString()}
              </div>
            </div>
            {it.url && (
              <a href={it.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 11, color: T.textMuted, textDecoration: 'none',
                          padding: '4px 8px', border: `1px solid ${T.border}`, borderRadius: 6 }}>
                ▶ Play
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotebookLMUploader;
export { NotebookLMUploader };
