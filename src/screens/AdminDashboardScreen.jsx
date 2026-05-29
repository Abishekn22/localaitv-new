import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function AdminDashboardScreen({ onBack }) {
  const { T } = useAppTheme();
  const { token, logout, user, refreshUser } = useAuth();
  // Map the logged-in user's DB role to a dashboard tier key.
  const roleKeyFromUser = (r) => {
    const s = String(r || '').toLowerCase();
    if (s === 'superadmin' || s === 'super_admin' || s === 'super') return 'super';
    if (s === 'master_admin' || s === 'master') return 'master';
    return 'admin';
  };
  const [role, setRole] = useState(() => roleKeyFromUser(user?.role)); // locked to the user's own role
  // Keep the tier in sync if the user/role resolves after mount.
  useEffect(() => { setRole(roleKeyFromUser(user?.role)); }, [user?.role]);
  const [view, setView] = useState('home');    // home | <moduleKey>
  const [period, setPeriod] = useState('today'); // time filter for analytics
  const [drill, setDrill] = useState([]);       // drill-down navigation stack
  const pushDrill = (f) => setDrill(d => [...d, f]);
  const scrollRef = useRef(null);               // main scroll container
  // Always open a view/drill from the top — never auto-land at the bottom.
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [view, drill.length]);
  // Pending-review edit state (lifted so it survives child re-mounts)
  const [editMode, setEditMode] = useState(false);
  const [editHead, setEditHead] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhotos, setEditPhotos] = useState([]);

  // ── Real admin API layer (main backend, logged-in admin JWT) ──────────────
  const adminFetch = useCallback(async (path, opts = {}) => {
    const hasBody = opts.body != null && !(opts.body instanceof FormData);
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: {
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    // Surface auth errors as a message — do NOT log the user out of the whole
    // app just because one admin endpoint returned 401/403.
    if (res.status === 401) throw new Error('Not authorized (401). Your session may have expired.');
    if (res.status === 403) throw new Error('Access denied (403) — your role can’t access this.');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data && data.message) || `Request failed (${res.status})`);
    return data;
  }, [token]);

  // Reports (GET /webhooks/reports) — citizen-submitted news reports.
  const REPORTS_PAGE = 10; // infinite-scroll page size
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);      // initial / first-page load
  const [reportsLoadingMore, setReportsLoadingMore] = useState(false); // subsequent pages
  const [reportsHasMore, setReportsHasMore] = useState(true);
  const [reportsErr, setReportsErr] = useState('');
  const [reportFilter, setReportFilter] = useState('all'); // moderation queue status filter
  const [reportSearch, setReportSearch] = useState('');    // name / subject / email search
  const [reportLocFilter, setReportLocFilter] = useState('all'); // location filter
  const [reportDate, setReportDate] = useState('');        // YYYY-MM-DD date filter
  const [reportStats, setReportStats] = useState(null);    // { total, byStatus, new } for KPIs

  // Report counts (total + per-status) for the "Pending Review" KPI.
  const loadReportStats = useCallback(async () => {
    try {
      const d = await adminFetch('/webhooks/reports/count');
      setReportStats(d || null);
    } catch { /* non-blocking — KPI falls back to a placeholder */ }
  }, [adminFetch]);

  const fetchReportsPage = useCallback(async (offset) => {
    const d = await adminFetch(`/webhooks/reports?offset=${offset}&limit=${REPORTS_PAGE}`);
    return d.items || d.data || (Array.isArray(d) ? d : []);
  }, [adminFetch]);

  // First page — resets the list (used on open + Refresh).
  const loadReports = useCallback(async () => {
    setReportsLoading(true); setReportsErr(''); setReportsHasMore(true);
    try {
      const batch = await fetchReportsPage(0);
      setReports(batch);
      setReportsHasMore(batch.length === REPORTS_PAGE);
    } catch (e) { setReportsErr(e.message); } finally { setReportsLoading(false); }
  }, [fetchReportsPage]);

  // Next page — appends. Guarded so overlapping scroll events can't double-fetch.
  const loadMoreReports = useCallback(async () => {
    if (reportsLoadingMore || !reportsHasMore || reportsLoading) return;
    setReportsLoadingMore(true);
    try {
      const batch = await fetchReportsPage(reports.length);
      setReports(prev => {
        // de-dupe by id in case of overlap
        const seen = new Set(prev.map(r => r.id));
        return [...prev, ...batch.filter(r => !seen.has(r.id))];
      });
      setReportsHasMore(batch.length === REPORTS_PAGE);
    } catch (e) { setReportsErr(e.message); } finally { setReportsLoadingMore(false); }
  }, [fetchReportsPage, reports.length, reportsLoadingMore, reportsHasMore, reportsLoading]);

  // Users (GET /users) — user management.
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersErr, setUsersErr] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userVerFilter, setUserVerFilter] = useState('all'); // all | unverified | verified
  const [promoteRole, setPromoteRole] = useState(null); // null | 'admin' | 'master_admin' — drives "pick a user to promote" mode
  const loadUsers = useCallback(async () => {
    setUsersLoading(true); setUsersErr('');
    try {
      const d = await adminFetch('/users');
      setUsers(d.users || d.data || (Array.isArray(d) ? d : []));
    } catch (e) { setUsersErr(e.message); } finally { setUsersLoading(false); }
  }, [adminFetch]);

  // Locations (GET /locations).
  const [locations, setLocations] = useState([]);
  const loadLocations = useCallback(async () => {
    try {
      const d = await adminFetch('/locations');
      setLocations(d.locations || d.data || (Array.isArray(d) ? d : []));
    } catch (e) { /* non-blocking */ }
  }, [adminFetch]);

  // Fetch each module's data when it opens.
  useEffect(() => {
    if (view === 'moderation') loadReports();
    if (view === 'users') { loadUsers(); loadLocations(); }
  }, [view, loadReports, loadUsers, loadLocations]);

  // Load on mount: user list (Citizens KPI) + report counts (Pending Review KPI).
  useEffect(() => { loadUsers(); loadReportStats(); }, [loadUsers, loadReportStats]);

  // Refresh the logged-in user's live role/verification when the dashboard opens,
  // so the role-locked tab + gating reflect any change made since login.
  useEffect(() => { refreshUser?.(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // ── Report actions ──
  // Generic status setter (Review→read, Approve→approved, etc.).
  const setReportStatus = async (id, status) => {
    try { await adminFetch(`/webhooks/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setReports(rs => rs.map(r => r.id === id ? { ...r, status } : r));
      loadReportStats(); // keep the Pending Review (new) count fresh
    } catch (e) { alert(e.message); }
  };
  // Opening a report marks a brand-new one as "read" (fire-and-forget).
  const markReportRead = (id) => {
    const r = reports.find(x => x.id === id);
    if (r && String(r.status || '').toLowerCase() === 'new') setReportStatus(id, 'read');
  };
  const approveReport = (id) => setReportStatus(id, 'approved');
  // Revert an approved report — flips it back to "read".
  const revertApproval = (id) => {
    if (!window.confirm('Cancel this approval? The report will move back to Read status.')) return;
    setReportStatus(id, 'read');
  };
  // Reject a report — sets "rejected" (red status). Available for any video.
  const rejectReport = (id) => {
    if (!window.confirm('Reject this report? It will move to Rejected (red) status.')) return;
    setReportStatus(id, 'rejected');
  };
  // Open the full review + mark read.
  const openReport = (r) => { markReportRead(r.id); pushDrill({ type: 'reportreview', report: r }); };
  // Full edit: subject / message / image list. Returns true on success.
  const saveReportEdits = async (id, fields) => {
    const body = {};
    if (typeof fields.subject === 'string') body.subject = fields.subject;
    if (typeof fields.message === 'string') body.message = fields.message;
    if (Array.isArray(fields.image_paths)) body.image_paths = fields.image_paths;
    if (!Object.keys(body).length) return false;
    try {
      await adminFetch(`/webhooks/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setReports(rs => rs.map(r => r.id === id ? { ...r, ...body } : r));
      return true;
    } catch (e) { alert(e.message); return false; }
  };
  // Quick inline subject edit (used by the card's ✏️ button).
  const editReportSubject = async (id) => {
    const cur = reports.find(r => r.id === id);
    const next = window.prompt('Edit report subject:', cur?.subject || '');
    if (next == null || next.trim() === '' || next === cur?.subject) return;
    await saveReportEdits(id, { subject: next.trim() });
  };
  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    try { await adminFetch(`/webhooks/reports/${id}`, { method: 'DELETE' });
      setReports(rs => rs.filter(r => r.id !== id));
      loadReportStats();
    } catch (e) { alert(e.message); }
  };

  // ── User actions ──
  const verifyUser = async (id) => {
    try { await adminFetch(`/users/${id}/verify`, { method: 'PATCH' });
      setUsers(us => us.map(u => u.id === id ? { ...u, is_verified: 1 } : u));
    } catch (e) { alert(e.message); }
  };
  const rejectUser = async (id) => {
    const reason = window.prompt('Reason for rejecting verification:');
    if (reason == null || reason.trim() === '') return;
    try { await adminFetch(`/users/${id}/reject-verification`, { method: 'PATCH', body: JSON.stringify({ reason: reason.trim() }) });
      setUsers(us => us.map(u => u.id === id ? { ...u, is_verified: 0 } : u));
    } catch (e) { alert(e.message); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await adminFetch(`/users/${id}`, { method: 'DELETE' });
      setUsers(us => us.filter(u => u.id !== id));
    } catch (e) { alert(e.message); }
  };

  const changeUserRole = async (id, newRole) => {
    try { await adminFetch(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
      setUsers(us => us.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (e) { alert(e.message); }
  };

  // Resolve a numeric location id ("285") to a readable name for display.
  const locName = (loc) => {
    if (loc == null || loc === '') return '';
    const hit = locations.find(l => String(l.id) === String(loc));
    return hit ? (hit.name || hit.constituency || String(loc)) : String(loc);
  };

  // ── Webhook /reports response helpers (mirrors reference admin User_reports.jsx) ──
  // Report media lives on the production server (not localhost), so resolve against
  // VITE_MEDIA_BASE (default https://localaitv.com) even in dev.
  const reportMediaHost = (import.meta.env.VITE_MEDIA_BASE || 'https://localaitv.com').replace(/\/+$/, '');
  const reportMediaUrl = (p) => {
    if (!p) return '';
    const c = String(p).replace(/\\/g, '/');
    return /^https?:\/\//i.test(c) ? c : `${reportMediaHost}/${c.replace(/^\/+/, '')}`;
  };
  const reportToPaths = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
    if (typeof val === 'string') {
      try { const p = JSON.parse(val); if (Array.isArray(p)) return p.map(String).map(s => s.trim()).filter(Boolean); } catch {}
      return val.trim() ? [val.trim()] : [];
    }
    return [];
  };
  const reportMedia = (r) => {
    const imgs = reportToPaths(r.image_paths); if (!imgs.length && r.image_path) imgs.push(String(r.image_path));
    const vids = reportToPaths(r.video_paths); if (!vids.length && r.video_path) vids.push(String(r.video_path));
    const auds = reportToPaths(r.audio_paths); if (!auds.length && r.audio_path) auds.push(String(r.audio_path));
    return { imgs, vids, auds };
  };
  const reportTitle = (r) => r.subject ? r.subject : (r.message ? r.message.trim().slice(0, 80) + (r.message.length > 80 ? '…' : '') : '(no subject)');
  const reportReporter = (r) => r.name || r.postedBy?.name || r.email || '—';
  const reportLoc = (r) => r.locationAddress || (r.location_id ? locName(r.location_id) : '') || '';
  const reportStatusColor = (s) => ({ new:'#F59E0B', read:'#3B82F6', pending:'#F59E0B', processing:'#0EA5E9', done:'#10B981', published:'#10B981', failed:'#EF4444', rejected:'#EF4444' })[String(s||'').toLowerCase()] || '#6B7280';
  const fmtAge = (iso) => {
    if (!iso) return '';
    const d = new Date(iso); if (isNaN(d)) return '';
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return s + 's ago';
    const m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
    const dd = Math.floor(h / 24); if (dd < 30) return dd + 'd ago';
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  };
  const fmtDateTime = (iso) => { if (!iso) return '—'; const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); };

  const ROLES = {
    super:  { label:'Super Admin',  scope:'🌐 All India · all states · full control' },
    master: { label:'Master Admin', scope:'🗺️ All states · senior moderator' },
    admin:  { label:'Admin',        scope:'📍 Assigned: Andhra Pradesh · Telangana (Telugu)' },
  };
  const R = ROLES[role];
  const can = (cap) => {
    switch (cap) {
      case 'createMaster':      return role === 'super';
      case 'createAdmin':       return role === 'super' || role === 'master';
      case 'cancelJobs':        return role === 'super' || role === 'master';
      case 'allIndiaAnalytics': return role === 'super' || role === 'master';
      case 'forceRelease':      return role === 'super';
      case 'secrets':           return role === 'super';
      case 'infra':             return role === 'super';
      case 'pipeline':          return role === 'super' || role === 'master';
      case 'storage':           return role === 'super' || role === 'master';
      default:                  return true;
    }
  };
  const auditScope = role === 'super' ? 'All admins (full)' : role === 'master' ? 'Your team only' : 'Your own actions only';

  // ── KPIs scale by role scope (super/master = all-India, admin = AP+TG) ──
  const wide = role !== 'admin';
  const KPI = [
    { icon:'📋', label:'Pending Review',  value: reportStats ? Number(reportStats.new || 0).toLocaleString('en-IN') : '…',   c:'#F59E0B' },
    { icon:'⚙️', label:'In AI Pipeline',  value: wide ? '318'   : '22',   c:'#3B82F6' },
    { icon:'✅', label:'Published Today',  value: wide ? '4,870' : '410',  c:'#10B981' },
    { icon:'📺', label:'Live Channels',   value: wide ? '9'     : '9',    c:'#D0021B' },
    { icon:'🛑', label:'Dead-letter',     value: wide ? '7'     : '1',    c:'#EF4444' },
    { icon:'👥', label:'Citizens',        value: usersLoading && !users.length ? '…' : users.length.toLocaleString('en-IN'), c:'#8B5CF6' },
  ];

  // ── 15 modules — Plan v1.3 functional areas. need = capability gate ──
  const MODULES = [
    { key:'moderation', icon:'📋', title:'Moderation Queue',   sub:'Claim · Approve · Reject · Escalate', need:null },
    { key:'workflow',   icon:'🔄', title:'Content Workflow',   sub:'8-step end-to-end pipeline',          need:null },
    { key:'channels',   icon:'📺', title:'Channels',           sub:'9 → 300 → 3,000 · YouTube live',      need:null },
    { key:'users',      icon:'👥', title:'Users & Roles',      sub:'3-tier · permissions matrix',         need:null },
    { key:'scheduler',  icon:'🕐', title:'Scheduler',          sub:'5 daily broadcast slots',             need:null },
    { key:'analytics',  icon:'📊', title:'Analytics',          sub:'Drill-down · precomputed counts',     need:'allIndiaAnalytics' },
    { key:'pipeline',   icon:'⚙️', title:'AI Pipeline Monitor',sub:'Jobs · workers · federation',         need:'pipeline' },
    { key:'webhooks',   icon:'🔗', title:'Webhooks & Callbacks',sub:'Delivery log · retry · 4xx/5xx',     need:'pipeline' },
    { key:'rules',      icon:'🎯', title:'Display Rules',      sub:'Auto-expiry · rotation',              need:null },
    { key:'storage',    icon:'🗄️', title:'Storage & Retention',sub:'S3 · lifecycle tiering',              need:'storage' },
    { key:'audit',      icon:'📜', title:'Audit Log',          sub:auditScope,                            need:null },
    { key:'notify',     icon:'🔔', title:'Notifications',      sub:'Push templates · history',            need:null },
    { key:'security',   icon:'🔐', title:'Security & Secrets', sub:'HMAC · token rotation · RLS',         need:'secrets' },
    { key:'infra',      icon:'🏗️', title:'Infrastructure & Cost',sub:'Architecture · projections',        need:'infra' },
    { key:'forms',      icon:'📥', title:'Form Submissions',  sub:'Leads · complaints · CRM follow-ups',  need:null },
    { key:'roadmap',    icon:'🚀', title:'Roadmap & Sign-off', sub:'Phase 0–4 · approvals',               need:null },
  ];

  // ── Sample moderation queue (Telugu, faithful to v1.3 §4 workflow) ──
  const QUEUE = [
    { t:'కర్నూలు జిల్లాలో భారీ వర్షాలు — లోతట్టు ప్రాంతాలు జలమయం', cat:'News',     loc:'Kurnool, AP',     by:'ravi_k',      age:'4m',  st:'pending'   },
    { t:'శ్రీమతి సరోజమ్మ గారికి 75వ పుట్టినరోజు శుభాకాంక్షలు',     cat:'Birthday', loc:'Guntur, AP',      by:'public_2291', age:'12m', st:'pending'   },
    { t:'విజయవాడలో కొత్త ఫ్లైఓవర్ ప్రారంభం — ట్రాఫిక్ ఉపశమనం',    cat:'News',     loc:'Vijayawada, AP',  by:'suresh.r',    age:'26m', st:'in_review', mine:true,  lock:'⏳ Claimed by you · 28:11 left' },
    { t:'2BHK ఇల్లు అద్దెకు — హైదరాబాద్ కూకట్‌పల్లి',              cat:'Rental',   loc:'Hyderabad, TG',   by:'owner_88',    age:'41m', st:'in_review', lock:'🔒 Claimed by Lakshmi (Admin)' },
    { t:'పాత కారు అమ్మకం — Maruti Swift 2018, సింగిల్ ఓనర్',      cat:'Vehicle',  loc:'Warangal, TG',    by:'auto_sell',   age:'1h',  st:'escalated' },
    { t:'Suspicious job posting with external links',             cat:'Jobs',     loc:'Nellore, AP',     by:'spam_acc',    age:'2h',  st:'pending', flag:true },
  ];

  // ── status enum → colour (content_status, Plan v1.3) ──
  const STC = {
    pending:'#F59E0B', in_review:'#3B82F6', approved:'#10B981', rejected:'#EF4444',
    escalated:'#8B5CF6', queued:'#0EA5E9', processing:'#3B82F6', ready_for_bulletin:'#14B8A6',
    scheduled:'#6366F1', published:'#10B981', failed_retryable:'#F97316', failed_final:'#EF4444',
    callback_lost:'#DC2626', archived:'#6B7280',
  };

  // ── tiny UI primitives ──
  const cardS = { background:T.bg2, border:`1px solid ${T.border}`, borderRadius:12, padding:'13px 14px', marginBottom:10 };
  const Chip = ({ txt, c }) => (
    <span style={{
      display:'inline-block', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700,
      fontSize:10, letterSpacing:0.5, textTransform:'uppercase', color:c,
      background:`${c}1f`, border:`1px solid ${c}55`, borderRadius:6, padding:'2px 7px',
    }}>{txt}</span>
  );
  const SecH = ({ children }) => (
    <div style={{
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:800,
      color:T.textMuted, letterSpacing:1, textTransform:'uppercase', margin:'16px 0 8px',
    }}>{children}</div>
  );
  const KV = ({ k, v, vc }) => (
    <div style={{display:'flex',justifyContent:'space-between',gap:10,padding:'7px 0',borderBottom:`1px solid ${T.border}`}}>
      <span style={{fontSize:12.5,color:T.textMuted,flexShrink:0}}>{k}</span>
      <span style={{fontSize:12.5,fontWeight:700,color:vc||T.text,textAlign:'right',minWidth:0,wordBreak:'break-word',overflowWrap:'anywhere'}}>{v}</span>
    </div>
  );
  const Locked = ({ need }) => (
    <div style={{textAlign:'center',padding:'60px 28px'}}>
      <div style={{fontSize:46,marginBottom:12}}>🔒</div>
      <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:17,color:T.text,marginBottom:6}}>Restricted</div>
      <div style={{fontSize:13,color:T.textMuted,lineHeight:1.55}}>
        This area requires <b style={{color:T.text}}>{need}</b> access.<br/>
        Your current role: <b style={{color:'#D0021B'}}>{R.label}</b>.
      </div>
      <div style={{marginTop:14,fontSize:11.5,color:T.textMuted}}>Contact a Super Admin if you need access.</div>
    </div>
  );

  // ══ DRILL-DOWN: dummy analytics + workflow data ═══════════════════
  // Full lifecycle status set (workflow visibility). label + colour.
  const STATUS = {
    ai_pending:  { l:'AI Verification Pending',     c:'#0EA5E9' },
    processing:  { l:'Processing',                  c:'#3B82F6' },
    under_review:{ l:'Under Review',                c:'#6366F1' },
    need_info:   { l:'Need More Information',        c:'#F59E0B' },
    reupload:    { l:'Sent for Re-upload',           c:'#F97316' },
    duplicate:   { l:'Duplicate Content Detected',   c:'#DC2626' },
    escalated:   { l:'Escalated for Review',         c:'#8B5CF6' },
    approved:    { l:'Approved',                     c:'#10B981' },
    rejected:    { l:'Rejected',                     c:'#EF4444' },
    published:   { l:'Published',                    c:'#059669' },
  };
  const statusKeys = Object.keys(STATUS);

  const PERIODS = [['today','Today',1],['yesterday','Yesterday',0.9],['weekly','Weekly',6.3],
    ['monthly','Monthly',26],['quarterly','Quarterly',78],['yearly','Yearly',310],['custom','Custom',12]];
  const periodMeta = PERIODS.find(p=>p[0]===period) || PERIODS[0];
  const periodMult = periodMeta[2];
  const periodLabel = periodMeta[1];

  const METRICS = [
    { key:'uploaded',  label:'Total Uploaded Videos',  icon:'📤', c:'#3B82F6' },
    { key:'processed', label:'Processed Videos',        icon:'⚙️', c:'#14B8A6' },
    { key:'pending',   label:'Pending Videos',          icon:'📋', c:'#F59E0B' },
    { key:'rejected',  label:'Rejected Videos',         icon:'❌', c:'#EF4444' },
    { key:'rereview',  label:'Sent for Re-review',      icon:'🔁', c:'#F97316' },
    { key:'published', label:'Published Videos',        icon:'✅', c:'#10B981' },
  ];
  const STATES = [
    { code:'AP', name:'Andhra Pradesh' }, { code:'TG', name:'Telangana' },
    { code:'KA', name:'Karnataka' },      { code:'TN', name:'Tamil Nadu' },
  ];
  const CONST = {
    AP:['Kurnool','Guntur','Vijayawada','Nellore','Tirupati'],
    TG:['Warangal','Khammam','Nizamabad'],
    KA:['Bengaluru South','Mysuru'], TN:['Chennai Central','Coimbatore'],
  };
  const baseState = {
    AP:{uploaded:980,processed:660,pending:210,rejected:74,rereview:33,published:580},
    TG:{uploaded:520,processed:360,pending:96,rejected:38,rereview:18,published:300},
    KA:{uploaded:210,processed:140,pending:48,rejected:18,rereview:8, published:128},
    TN:{uploaded:110,processed:80, pending:32,rejected:12,rereview:5, published:78},
  };
  const scale = (n) => Math.max(0, Math.round(n * periodMult));
  const fmt = (n) => n.toLocaleString('en-IN');
  const metricTotal = (mk) => scale(STATES.reduce((a,s)=>a+baseState[s.code][mk],0));
  const hash = (s) => { let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; };
  const pick = (s,arr) => arr[hash(s)%arr.length];
  const between = (s,min,max) => min + (hash(s)%(max-min+1));
  const consCount = (st,c,mk) => {
    const list = CONST[st]; const w = list.map(x=>1+(hash(st+x)%5));
    const sum = w.reduce((a,b)=>a+b,0); const i = list.indexOf(c);
    return scale(Math.round(baseState[st][mk]*w[i]/sum));
  };

  const RNAMES = ['Ravi Kumar','Lakshmi Devi','Suresh Reddy','Anjali Rao','Venkatesh N',
    'Priya Sharma','Naveen Chowdary','Sunitha M','Kiran Babu','Deepa Reddy'];
  const REVIEWERS = ['Lakshmi Devi','Ravi Kumar','Karthik N','Priya Senior'];
  const TITLES = [
    'కర్నూలు జిల్లాలో భారీ వర్షాలు — లోతట్టు ప్రాంతాలు జలమయం',
    'శ్రీమతి సరోజమ్మ గారికి 75వ పుట్టినరోజు శుభాకాంక్షలు',
    'విజయవాడలో కొత్త ఫ్లైఓవర్ ప్రారంభం — ట్రాఫిక్ ఉపశమనం',
    'స్థానిక సంత — కూరగాయల ధరలు తగ్గాయి',
    'ప్రభుత్వ ఆసుపత్రిలో కొత్త ICU బ్లాక్ ప్రారంభం',
    'రైతు సదస్సు — పంట బీమా వివరాలు వెల్లడి',
    'పాఠశాల వార్షికోత్సవ వేడుకలు ఘనంగా',
    'జాతీయ రహదారిపై రోడ్డు ప్రమాదం — ట్రాఫిక్ ఆటంకం',
  ];
  const reportersFor = (st, c) => {
    const n = 3 + (hash(st+c)%3);
    return Array.from({length:n}).map((_,i)=>{
      const k = st+c+i; const appr = between(k+'a',62,93);
      return {
        id:'CR-'+(1000+(hash(k)%9000)), name:RNAMES[hash(k)%RNAMES.length],
        state:st, stateName:(STATES.find(s=>s.code===st)||{}).name, cons:c,
        uploads:between(k+'u',42,260), approvedPct:appr,
        rejectedPct:Math.max(3,100-appr-between(k+'p',2,9)),
        lastActive:pick(k+'la',['2h ago','5h ago','Today 11:20','Yesterday 19:40','1d ago','3h ago']),
        score:between(k+'s',58,97), warnings:hash(k+'w')%4, points:between(k+'pt',120,2600),
        mobile:'+91 '+(70000+(hash(k)%29999))+' '+(10000+(hash(k+'2')%89999)),
        avatar:pick(k+'av',['#3B82F6','#8B5CF6','#10B981','#F59E0B','#D0021B','#0EA5E9']),
      };
    });
  };
  const videosFor = (rep) => {
    const n = 6 + (hash(rep.id)%5);
    return Array.from({length:n}).map((_,i)=>{
      const k = rep.id+'v'+i;
      return {
        id:'VID-'+(80000+(hash(k)%19999)), title:TITLES[hash(k)%TITLES.length],
        cat:pick(k+'c',['News','Birthday','Event','Rental','Vehicle','Jobs']),
        uploadedAt:pick(k+'t',['Today 09:42','Today 11:18','Today 14:05','Yesterday 18:30','Today 08:12']),
        st:statusKeys[hash(k)%statusKeys.length],
        ai:pick(k+'ai',['Passed','Passed','Flagged','Pending']),
        reviewer:REVIEWERS[hash(k+'r')%REVIEWERS.length], rep,
      };
    });
  };

  // ── form submissions (Forms CRM hub: leads, complaints, contact, partners) ──
  const FORM_STATUS = {
    new:            { l:'New',                  c:'#3B82F6' },
    contacted:      { l:'Contacted',            c:'#0EA5E9' },
    follow_up:      { l:'Follow-up Pending',    c:'#F59E0B' },
    interested:     { l:'Interested',           c:'#8B5CF6' },
    agreement:      { l:'Agreement Executed',   c:'#10B981' },
    closed:         { l:'Successfully Closed',  c:'#059669' },
    not_interested: { l:'Not Interested',       c:'#6B7280' },
    rejected:       { l:'Rejected',             c:'#EF4444' },
    on_hold:        { l:'On Hold',              c:'#F97316' },
    resolved:       { l:'Resolved',             c:'#10B981' },
    escalated:      { l:'Escalated',            c:'#8B5CF6' },
  };
  const formStatusKeys = Object.keys(FORM_STATUS);

  const FORM_CATS = [
    { key:'advertise', label:'Advertise With Us',    icon:'💼', c:'#3B82F6',
      sample:['Budget tier ₹2.5L for Q3 launch','Need ad slots in Kurnool + Tirupati','Looking for 6-month brand campaign','Print + TV combo enquiry'],
      statuses:['new','contacted','follow_up','interested','agreement','closed','not_interested','on_hold'] },
    { key:'partner',   label:'Channel Partner',       icon:'🤝', c:'#10B981',
      sample:['Want to partner for Anantapur district','Existing TV studio · interested to onboard','3-state coverage proposal','New constituency rollout request'],
      statuses:['new','contacted','follow_up','interested','agreement','closed','not_interested','on_hold'] },
    { key:'complaint', label:'Grievance & Complaint', icon:'⚠️', c:'#EF4444',
      sample:['Wrong constituency tagged on my upload','Bulletin not playing on Kurnool channel','Inappropriate advert seen','OTP not received'],
      statuses:['new','contacted','follow_up','escalated','resolved','rejected','on_hold'] },
    { key:'contact',   label:'Contact Us',            icon:'📞', c:'#8B5CF6',
      sample:['Press enquiry — RTV magazine','Volunteer to cover events in Guntur','Want to know subscription plans','Career enquiry — content writer'],
      statuses:['new','contacted','follow_up','interested','closed','not_interested'] },
  ];

  const ADMIN_NAMES = ['Koneti Mohan Reddy','Priya Senior','Ravi Kumar','Lakshmi Devi','Karthik N'];
  const SUBMITTER_NAMES = ['Suresh Chowdary','Padmaja Reddy','Anjali Sharma','Naveen Kumar','Deepa Rao','Kishore Babu','Sunitha M','Vijay Krishna','Bhargavi N','Harsha Vardhan','Madhu Sudhan','Sireesha','Phani Kumar','Rajeshwari','Vamsi Krishna'];
  const DAYS_AGO = (n) => {
    const d = new Date(); d.setDate(d.getDate() - n);
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' }) + ' · ' +
           ((n===0)?'Today':(n===1?'Yesterday':n+'d ago'));
  };

  const seedForms = () => {
    let serial = 1; const out = [];
    FORM_CATS.forEach(cat => {
      const n = 5 + (hash(cat.key+'n')%4); // 5–8 per category
      for (let i=0; i<n; i++) {
        const k = cat.key+'s'+i;
        const ageDays = i + (hash(k+'d')%5);
        const sub = SUBMITTER_NAMES[hash(k+'sn')%SUBMITTER_NAMES.length];
        const statusKey = cat.statuses[hash(k+'st')%cat.statuses.length];
        // 0–3 prior follow-ups for variety
        const fuCount = hash(k+'fc')%4;
        const followUps = [];
        for (let f=0; f<fuCount; f++) {
          followUps.push({
            at: DAYS_AGO(ageDays - 1 - f),
            by: ADMIN_NAMES[hash(k+'fa'+f)%ADMIN_NAMES.length],
            status: cat.statuses[hash(k+'fs'+f)%cat.statuses.length],
            note: pick(k+'fn'+f,[
              'Called — line busy, will retry tomorrow.',
              'Spoke for 5 mins — sent rate card on WhatsApp.',
              'Asked for proposal in writing; promised by EOD.',
              'Discussed budget — needs internal approval.',
              'Site visit scheduled for next week.',
              'Forwarded to ops team for technical check.',
            ]),
          });
        }
        out.push({
          id: 'FRM-'+(10000+(hash(k)%89999)),
          serial: serial++,
          category: cat.key,
          name: sub,
          phone: '+91 '+(70000+(hash(k+'p')%29999))+' '+(10000+(hash(k+'p2')%89999)),
          email: sub.toLowerCase().replace(/[^a-z]+/g,'.')+'@gmail.com',
          city: pick(k+'ct',['Kurnool','Guntur','Vijayawada','Tirupati','Hyderabad','Bengaluru','Visakhapatnam','Nellore']),
          submittedAt: DAYS_AGO(ageDays),
          details: cat.sample[hash(k+'sm')%cat.sample.length],
          fullText: 'Submitted via the LocalAI TV ' + cat.label + ' form. ' +
            'The submitter has expressed interest and provided contact details for further communication. ' +
            'Please review the request and add follow-up notes below.',
          files: (hash(k+'f')%3 === 0) ? [{ name:'proposal.pdf', size:(120+(hash(k+'fsz')%480))+' KB' }] : [],
          status: statusKey,
          followUps,
        });
      }
    });
    // Newest-first within category — serial is preserved for stable id
    return out.sort((a,b)=> hash(b.id)%1000 - hash(a.id)%1000);
  };
  const [formSubs, setFormSubs] = useState(seedForms);
  const [formNote, setFormNote] = useState('');
  const [formNextStatus, setFormNextStatus] = useState('contacted');
  const addFollowUp = (id, note, nextStatus) => {
    setFormSubs(arr => arr.map(s => s.id !== id ? s : ({
      ...s,
      status: nextStatus || s.status,
      followUps: [
        { at: DAYS_AGO(0), by: R.label + ' — ' + ADMIN_NAMES[0], status: nextStatus || s.status, note: note.trim() },
        ...s.followUps,
      ],
    })));
  };

  // ── pending-reviews queue (live state — actions remove items) ──
  const PENDING_CATS = ['News','Events','Jobs','Shopping','Birthdays','Car Sales','House Rent','Marriage Events','Obituaries','Local Advertisements'];
  const seedPending = () => {
    const items = []; let serial = 1;
    STATES.forEach(s => {
      CONST[s.code].forEach(c => {
        const n = 2 + (hash(s.code+c+'pn')%3);
        for (let i=0; i<n; i++) {
          const k = s.code+c+'p'+i;
          items.push({
            id:'PND-'+(10000+(hash(k)%89999)), serial: serial++,
            uploader: {
              name: RNAMES[hash(k+'r')%RNAMES.length],
              id:'CR-'+(1000+(hash(k+'id')%9000)),
              mobile:'+91 '+(70000+(hash(k+'m')%29999))+' '+(10000+(hash(k+'m2')%89999)),
              avatar: pick(k+'av',['#3B82F6','#8B5CF6','#10B981','#F59E0B','#D0021B','#0EA5E9']),
            },
            uploadedAt: pick(k+'t',['Today 09:42','Today 11:18','Today 14:05','Today 16:30','Today 08:12','Yesterday 19:40']),
            state: s.code, stateName: s.name, cons: c,
            cat: PENDING_CATS[hash(k+'c')%PENDING_CATS.length],
            headline: TITLES[hash(k+'h')%TITLES.length],
            description: 'మన ప్రాంతంలో జరిగిన ముఖ్య సంఘటన/సమాచారం వివరాలు. ప్రజలకు ఉపయోగపడే విషయాలు పూర్తిగా చూపిస్తున్నాము. (Demo description from citizen reporter.)',
            location: c + ', ' + s.name,
            photos: Array.from({length: 1 + (hash(k+'np')%3)}).map((_,j)=>'https://picsum.photos/seed/'+k+j+'/400/280'),
            videos: [{ id:'V-'+(hash(k+'v')%99999), src:'splash-intro.mp4', duration:'0:'+(20+(hash(k+'d')%40)) }],
            meta: { device: pick(k+'dv',['Android 14','iOS 17','Android 13']), fileSize: (8+(hash(k+'fs')%18)).toFixed(1)+' MB', resolution:'1080×1920' },
          });
        }
      });
    });
    return items;
  };
  const [pendingItems, setPendingItems] = useState(seedPending);
  const removePending = (id) => setPendingItems(items => items.filter(x => x.id !== id));
  const ROLE_STATES = { super:['AP','TG','KA','TN'], master:['AP','TG'], admin:['AP'] };
  const myStates = ROLE_STATES[role] || ROLE_STATES.super;
  const myPending = () => pendingItems.filter(x => myStates.includes(x.state));

  // ── shared drill UI ──
  const PeriodBar = () => (
    <div>
      <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:period==='custom'?8:12}}>
        {PERIODS.map(p=>(
          <button key={p[0]} onClick={()=>setPeriod(p[0])} style={{flexShrink:0,fontSize:11,fontWeight:700,
            cursor:'pointer',color:period===p[0]?'#fff':T.textMuted,background:period===p[0]?'#3B82F6':T.bg3,
            border:`1px solid ${T.border}`,borderRadius:20,padding:'6px 12px'}}>{p[1]}</button>
        ))}
      </div>
      {period==='custom' && (
        <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
          <input type="date" defaultValue="2026-05-01" style={{flex:1,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 9px',color:T.text,fontSize:12}}/>
          <span style={{color:T.textMuted,fontSize:12}}>→</span>
          <input type="date" defaultValue="2026-05-22" style={{flex:1,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 9px',color:T.text,fontSize:12}}/>
        </div>
      )}
    </div>
  );
  const MetricTiles = ({ onPick }) => (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
      {METRICS.map(m=>(
        <button key={m.key} onClick={()=>onPick(m.key)} style={{textAlign:'left',cursor:'pointer',
          background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,padding:'12px 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:18}}>{m.icon}</span><span style={{fontSize:14,color:m.c}}>›</span>
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,color:m.c,lineHeight:1.1,marginTop:4}}>{fmt(metricTotal(m.key))}</div>
          <div style={{fontSize:10.5,color:T.textMuted,fontWeight:700,marginTop:2,lineHeight:1.3}}>{m.label}</div>
        </button>
      ))}
    </div>
  );
  const Crumb = ({ items }) => (
    <div style={{fontSize:11,color:T.textMuted,marginBottom:10,lineHeight:1.5}}>{items.join('  ›  ')}</div>
  );
  const NavRow = ({ title, sub, right, rc, onClick, left }) => (
    <button onClick={onClick} style={{width:'100%',textAlign:'left',cursor:'pointer',background:T.bg2,
      border:`1px solid ${T.border}`,borderRadius:12,padding:'12px 13px',marginBottom:9,display:'flex',alignItems:'center',gap:11}}>
      {left}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13.5,fontWeight:700,color:T.text}}>{title}</div>
        {sub && <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{sub}</div>}
      </div>
      {right!=null && <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:19,fontWeight:900,color:rc||T.text}}>{right}</div>}
      <span style={{color:T.textMuted,fontSize:17}}>›</span>
    </button>
  );
  const Stat = ({ label, value, c }) => (
    <div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,padding:'11px 10px'}}>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:21,fontWeight:900,color:c||T.text,lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:10,color:T.textMuted,fontWeight:700,marginTop:2}}>{label}</div>
    </div>
  );

  // ── drill-down screens ──
  function MetricView({ metric }) {
    const m = METRICS.find(x=>x.key===metric);
    return (
      <div>
        <PeriodBar/>
        <div style={{...cardS,borderColor:m.c+'66',background:m.c+'14'}}>
          <div style={{fontSize:11,color:T.textMuted}}>{m.label} · {periodLabel}</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:30,fontWeight:900,color:m.c}}>{fmt(metricTotal(metric))}</div>
          <div style={{fontSize:11,color:T.textMuted}}>Tap a state to drill down →</div>
        </div>
        <SecH>State level</SecH>
        {STATES.map(s=>(
          <NavRow key={s.code} title={s.name} sub={`${CONST[s.code].length} constituencies`}
            right={fmt(scale(baseState[s.code][metric]))} rc={m.c}
            onClick={()=>pushDrill({type:'state',metric,state:s.code})}/>
        ))}
      </div>
    );
  }
  function StateView({ metric, state }) {
    const m = METRICS.find(x=>x.key===metric); const sName=(STATES.find(s=>s.code===state)||{}).name;
    return (
      <div>
        <PeriodBar/>
        <Crumb items={[m.label, sName]}/>
        <SecH>{sName} · constituency level</SecH>
        {CONST[state].map(c=>(
          <NavRow key={c} title={c} sub={`${reportersFor(state,c).length} citizen reporters`}
            right={fmt(consCount(state,c,metric))} rc={m.c}
            onClick={()=>pushDrill({type:'cons',metric,state,cons:c})}/>
        ))}
      </div>
    );
  }
  function ConsView({ metric, state, cons }) {
    const m = METRICS.find(x=>x.key===metric); const reps=reportersFor(state,cons);
    return (
      <div>
        <PeriodBar/>
        <Crumb items={[m.label,(STATES.find(s=>s.code===state)||{}).name,cons]}/>
        <SecH>{cons} · citizen reporters</SecH>
        {reps.map(r=>(
          <NavRow key={r.id} onClick={()=>pushDrill({type:'reporter',rep:r})}
            left={<div style={{width:36,height:36,borderRadius:'50%',background:r.avatar,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,flexShrink:0}}>{r.name[0]}</div>}
            title={r.name} sub={`${r.id} · ${scale(r.uploads)} uploads · ${r.approvedPct}% approved`}
            right={`${r.score}`} rc={'#10B981'}/>
        ))}
        <div style={{fontSize:10.5,color:T.textMuted,textAlign:'center',marginTop:2}}>Right value = performance score · tap a reporter for full profile</div>
      </div>
    );
  }
  function ReporterView({ rep }) {
    const vids = videosFor(rep);
    return (
      <div>
        <div style={{...cardS,display:'flex',gap:13,alignItems:'center'}}>
          <div style={{width:54,height:54,borderRadius:'50%',background:rep.avatar,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22,flexShrink:0}}>{rep.name[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:16,color:T.text}}>{rep.name}</div>
            <div style={{fontSize:11.5,color:T.textMuted}}>{rep.id} · {rep.mobile}</div>
            <div style={{fontSize:11.5,color:T.textMuted}}>📍 {rep.cons}, {rep.stateName}</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:6}}>
          <Stat label="Uploaded" value={fmt(rep.uploads)} c="#3B82F6"/>
          <Stat label="Approval %" value={rep.approvedPct+'%'} c="#10B981"/>
          <Stat label="Rejection %" value={rep.rejectedPct+'%'} c="#EF4444"/>
          <Stat label="Perf. score" value={rep.score} c="#8B5CF6"/>
          <Stat label="Reward pts" value={fmt(rep.points)} c="#F59E0B"/>
          <Stat label="Warnings" value={rep.warnings} c={rep.warnings?'#EF4444':'#10B981'}/>
        </div>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          <KV k="Last active" v={rep.lastActive}/>
          <KV k="Constituency assigned" v={`${rep.cons}, ${rep.stateName}`}/>
          <KV k="Warning history" v={rep.warnings?`${rep.warnings} warning(s) · last: spam flag`:'Clean record'} vc={rep.warnings?'#EF4444':'#10B981'}/>
          <KV k="Rewards / points" v={`${fmt(rep.points)} pts · ${rep.points>1500?'Gold':'Silver'} tier`} vc="#F59E0B"/>
          <div style={{padding:'4px 0'}}/>
        </div>
        <SecH>All uploaded videos ({vids.length})</SecH>
        {vids.map(v=>(
          <button key={v.id} onClick={()=>pushDrill({type:'video',video:v})} style={{width:'100%',textAlign:'left',cursor:'pointer',...cardS,display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{width:46,height:46,borderRadius:8,background:T.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🎬</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12.5,fontWeight:700,color:T.text,lineHeight:1.4,marginBottom:4}}>{v.title}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:6}}>
                <span style={{fontSize:10.5,color:T.textMuted}}>{v.cat} · {v.uploadedAt}</span>
                <Chip txt={STATUS[v.st].l} c={STATUS[v.st].c}/>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
  function VideoView({ video:v }) {
    const s = STATUS[v.st];
    const reason = {
      rejected:'Low video quality / shaky footage — does not meet broadcast standard.',
      reupload:'Audio not clear. Please re-record with better sound and re-upload.',
      need_info:'Please confirm the exact location and date of this event.',
      duplicate:'Matches an already-published video (98% similarity · content_77c…).',
    }[v.st];
    const reupMsg = `నమస్తే ${v.rep.name} గారు, మీ వీడియోను మళ్లీ అప్‌లోడ్ చేయండి — స్పష్టమైన ఆడియో అవసరం. (Re-upload requested — clearer audio needed.)`;
    const finalAction = {
      approved:'Approved by '+v.reviewer, published:'Approved & aired by '+v.reviewer,
      rejected:'Rejected by '+v.reviewer, reupload:'Re-upload requested by '+v.reviewer,
      need_info:'More info requested by '+v.reviewer, escalated:'Escalated to Master Admin',
      duplicate:'Auto-blocked by dedup', under_review:'Pending decision', processing:'—', ai_pending:'—',
    }[v.st] || '—';
    const human = {
      approved:'Approved', published:'Approved', rejected:'Rejected', reupload:'Returned for re-upload',
      need_info:'Awaiting info', escalated:'Escalated', under_review:'In progress',
      processing:'Not started', ai_pending:'Not started', duplicate:'Auto-handled',
    }[v.st];
    const publishS = v.st==='published'?'🟢 Live on channel':v.st==='approved'?'Scheduled · next slot':'— not published';
    const pushS = v.st==='published'?'Sent ✓ (FCM)':v.st==='approved'?'Queued':['rejected','reupload','need_info'].includes(v.st)?'Sent ✓ (status update)':'Not sent';
    const procS = ['ai_pending'].includes(v.st)?'Queued':v.st==='processing'?'Processing · FFmpeg 2/5':'Completed';
    const notif = [
      ['Citizen Reporter', v.rep.name, pushS==='Not sent'?'Pending':'Delivered'],
      ['Uploader', v.rep.name, pushS==='Not sent'?'Pending':'Delivered'],
      ['Reviewer', v.reviewer, 'Read'],
      ['Admin', 'Koneti Mohan Reddy', 'Delivered'],
    ];
    return (
      <div>
        <Crumb items={[v.rep.stateName, v.rep.cons, v.rep.name, v.id]}/>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          <div style={{height:150,background:'#000',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,position:'relative'}}>🎬
            <span style={{position:'absolute',bottom:8,right:8}}><Chip txt={s.l} c={s.c}/></span>
          </div>
          <div style={{padding:'12px 13px'}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.45}}>{v.title}</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{v.id} · {v.cat} · 👤 {v.rep.name} ({v.rep.id})</div>
          </div>
        </div>
        <SecH>Review workflow</SecH>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          <KV k="Upload time" v={v.uploadedAt}/>
          <KV k="Processing status" v={procS} vc={procS==='Completed'?'#10B981':'#3B82F6'}/>
          <KV k="AI moderation" v={v.ai} vc={v.ai==='Passed'?'#10B981':v.ai==='Flagged'?'#EF4444':'#0EA5E9'}/>
          <KV k="Human review" v={human} vc={s.c}/>
          <KV k="Assigned reviewer" v={v.reviewer}/>
          <KV k="Final action taken" v={finalAction} vc={s.c}/>
          <KV k="Publish status" v={publishS} vc={v.st==='published'?'#10B981':T.textMuted}/>
          <KV k="Push notification" v={pushS} vc={pushS.startsWith('Sent')?'#10B981':T.textMuted}/>
          <div style={{padding:'4px 0'}}/>
        </div>
        {reason && (
          <div style={{...cardS,background:'rgba(239,68,68,0.08)',borderColor:'rgba(239,68,68,0.35)'}}>
            <div style={{fontSize:11,fontWeight:800,color:'#EF4444',marginBottom:3}}>Reason for {s.l.toLowerCase()}</div>
            <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{reason}</div>
          </div>
        )}
        {v.st==='reupload' && (
          <div style={{...cardS,background:'rgba(249,115,22,0.08)',borderColor:'rgba(249,115,22,0.35)'}}>
            <div style={{fontSize:11,fontWeight:800,color:'#F97316',marginBottom:3}}>Re-upload request message</div>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12,color:T.text,lineHeight:1.55}}>{reupMsg}</div>
          </div>
        )}
        <SecH>Actions</SecH>
        <div style={{display:'flex',gap:7,flexWrap:'wrap',marginBottom:6}}>
          {['✅ Approve','✏️ Modify+Approve','❌ Reject','🔁 Request Re-upload','ℹ️ Need More Info','↗ Escalate','🚀 Publish'].map(b=>(
            <span key={b} style={{fontSize:11,fontWeight:700,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px'}}>{b}</span>
          ))}
        </div>
        <SecH>Notifications sent</SecH>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          {notif.map((n,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',borderTop:i?`1px solid ${T.border}`:'none'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:T.text}}>{n[0]}</div>
                <div style={{fontSize:10.5,color:T.textMuted}}>→ {n[1]}</div>
              </div>
              <Chip txt={n[2]} c={n[2]==='Pending'?'#F59E0B':n[2]==='Read'?'#3B82F6':'#10B981'}/>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // ── Pending Reviews table (role-scoped queue) ──
  function PendingTable() {
    const [catFilter, setCatFilter] = useState('All');
    const allMine = myPending();
    const items = allMine.filter(x => catFilter==='All' || x.cat===catFilter);
    const cats = ['All', ...PENDING_CATS];
    const scopeLabel = role==='super' ? 'All India · all states'
      : role==='master' ? 'Assigned: AP + TG'
      : 'Assigned: AP';
    return (
      <div>
        <div style={{...cardS,background:'rgba(245,158,11,0.08)',borderColor:'rgba(245,158,11,0.35)'}}>
          <div style={{fontSize:11,fontWeight:800,color:'#F59E0B',letterSpacing:0.5,marginBottom:3}}>PENDING REVIEWS · {R.label}</div>
          <div style={{fontSize:12.5,color:T.text,lineHeight:1.5}}>
            Scope: <b>{scopeLabel}</b> · <b>{allMine.length}</b> in your queue.
          </div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:4,lineHeight:1.5}}>
            ⚡ Atomic claim — once any admin acts on an item, it disappears from every admin's queue (no duplicate reviews).
          </div>
        </div>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
          {cats.map(c=>{
            const cnt = c==='All' ? allMine.length : allMine.filter(x=>x.cat===c).length;
            return (
              <button key={c} onClick={()=>setCatFilter(c)} style={{flexShrink:0,fontSize:11,fontWeight:700,cursor:'pointer',
                color:catFilter===c?'#fff':T.textMuted,
                background:catFilter===c?'#F59E0B':T.bg3,border:`1px solid ${T.border}`,
                borderRadius:20,padding:'6px 12px'}}>{c}{c!=='All'?` · ${cnt}`:''}</button>
            );
          })}
        </div>
        <div style={{fontSize:10,color:T.textMuted,marginBottom:6,lineHeight:1.5,letterSpacing:0.3}}>
          Columns: # · Photo · Name · Date/Time · State · Constituency · Category · Review
        </div>
        {items.length===0 && (
          <div style={{...cardS,textAlign:'center',color:T.textMuted,padding:'40px 20px'}}>
            🎉 No pending items in this filter.
          </div>
        )}
        {items.map(it=>(
          <div key={it.id} style={{...cardS,padding:'11px 12px'}}>
            <div style={{display:'flex',gap:9,alignItems:'center',marginBottom:9}}>
              <span style={{fontSize:10,fontWeight:800,color:T.textMuted,minWidth:22}}>#{it.serial}</span>
              <div style={{width:36,height:36,borderRadius:'50%',background:it.uploader.avatar,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,flexShrink:0}}>{it.uploader.name[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{it.uploader.name}</div>
                <div style={{fontSize:10.5,color:T.textMuted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>📅 {it.uploadedAt} · {it.state} · {it.cons}</div>
              </div>
              <Chip txt={it.cat} c="#F59E0B"/>
            </div>
            <button onClick={()=>{ setEditMode(false); pushDrill({type:'pendingreview',item:it}); }}
              style={{width:'100%',fontSize:12,fontWeight:800,color:'#fff',
                background:'linear-gradient(135deg,#3B82F6,#1E40AF)',border:'none',
                borderRadius:9,padding:'10px 0',cursor:'pointer',letterSpacing:0.5}}>
              👁  REVIEW  ›
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ── Per-item review detail with Approve / Modify+Approve / Reject / Escalate ──
  function PendingReviewDetail({ item }) {
    const escalateTarget = role==='admin' ? 'Master Admin' : role==='master' ? 'Super Admin' : null;
    const finish = () => {
      removePending(item.id);
      setEditMode(false);
      setDrill(d => d.slice(0,-1));
    };
    const startEdit = () => {
      setEditHead(item.headline); setEditDesc(item.description);
      setEditPhotos(item.photos.slice()); setEditMode(true);
    };
    const cancelEdit = () => setEditMode(false);

    const headline = editMode ? editHead : item.headline;
    const description = editMode ? editDesc : item.description;
    const photos = editMode ? editPhotos : item.photos;

    return (
      <div>
        <div style={{...cardS,display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:54,height:54,borderRadius:'50%',background:item.uploader.avatar,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22,flexShrink:0}}>{item.uploader.name[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:16,color:T.text}}>{item.uploader.name}</div>
            <div style={{fontSize:11.5,color:T.textMuted}}>{item.uploader.id} · {item.uploader.mobile}</div>
            <div style={{fontSize:11.5,color:T.textMuted}}>📍 {item.location}</div>
          </div>
          <Chip txt={item.cat} c="#F59E0B"/>
        </div>

        <SecH>Upload details</SecH>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          <KV k="Upload time" v={item.uploadedAt}/>
          <KV k="State" v={item.stateName}/>
          <KV k="Constituency / District" v={item.cons}/>
          <KV k="Category" v={item.cat} vc="#F59E0B"/>
          <KV k="Location" v={item.location}/>
          <KV k="Device" v={item.meta.device}/>
          <KV k="File · resolution" v={item.meta.fileSize+' · '+item.meta.resolution}/>
          <KV k="Submission id" v={item.id}/>
          <div style={{padding:'4px 0'}}/>
        </div>

        <SecH>Headline {editMode && <span style={{color:'#F59E0B'}}>· editing</span>}</SecH>
        {editMode ? (
          <textarea value={editHead} onChange={e=>setEditHead(e.target.value)}
            style={{width:'100%',minHeight:56,background:T.bg2,color:T.text,
              border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 11px',
              fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:13,
              resize:'vertical',boxSizing:'border-box'}}/>
        ) : (
          <div style={{...cardS,fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.45}}>{headline}</div>
        )}

        <SecH>Description / content</SecH>
        {editMode ? (
          <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)}
            style={{width:'100%',minHeight:100,background:T.bg2,color:T.text,
              border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 11px',
              fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12.5,
              resize:'vertical',boxSizing:'border-box'}}/>
        ) : (
          <div style={{...cardS,fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12.5,color:T.text,lineHeight:1.6}}>{description}</div>
        )}

        <SecH>Photos · {photos.length}{editMode ? ' · tap × to remove' : ''}</SecH>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:9}}>
          {photos.map((p,i)=>(
            <div key={i} onClick={()=> editMode && setEditPhotos(arr=>arr.filter((_,j)=>j!==i))}
              style={{aspectRatio:'1/1',background:T.bg3,backgroundImage:`url(${p})`,backgroundSize:'cover',backgroundPosition:'center',borderRadius:9,border:`1px solid ${T.border}`,position:'relative',cursor:editMode?'pointer':'default'}}>
              {editMode && (
                <div style={{position:'absolute',top:4,right:4,width:22,height:22,borderRadius:'50%',background:'rgba(239,68,68,0.95)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800}}>×</div>
              )}
            </div>
          ))}
          {editMode && (
            <div style={{aspectRatio:'1/1',background:T.bg3,borderRadius:9,border:`1px dashed ${T.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontSize:11,color:T.textMuted,gap:2}}>
              <span style={{fontSize:20}}>＋</span><span>Add photo</span>
            </div>
          )}
        </div>

        <SecH>Videos · {item.videos.length} (playable)</SecH>
        {item.videos.map(v=>(
          <div key={v.id} style={{...cardS,padding:0,overflow:'hidden'}}>
            <video src={v.src} controls playsInline preload="metadata" style={{width:'100%',height:200,background:'#000',display:'block'}}/>
            <div style={{padding:'8px 12px',display:'flex',justifyContent:'space-between',fontSize:11,color:T.textMuted}}>
              <span>{v.id}</span><span>Duration {v.duration}</span>
            </div>
          </div>
        ))}

        <div style={{...cardS,background:T.bg3,fontSize:11,color:T.textMuted,lineHeight:1.55,marginTop:6}}>
          ✓ Verify: media relevant · no abusive content · not fake / spam · corrections needed.
        </div>

        <SecH>Actions</SecH>
        {editMode ? (
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
            <button onClick={finish} style={{flex:1,minWidth:140,fontSize:13,fontWeight:800,color:'#fff',
              background:'linear-gradient(135deg,#10B981,#047857)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer',letterSpacing:0.3}}>
              ✅ Save & Approve
            </button>
            <button onClick={cancelEdit} style={{flex:1,minWidth:120,fontSize:13,fontWeight:700,color:T.text,
              background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',cursor:'pointer'}}>
              Cancel edit
            </button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            <button onClick={finish} style={{fontSize:13,fontWeight:800,color:'#fff',
              background:'linear-gradient(135deg,#10B981,#047857)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>
              ✅ Approve
            </button>
            <button onClick={startEdit} style={{fontSize:13,fontWeight:800,color:'#fff',
              background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>
              ✏️ Modify & Approve
            </button>
            <button onClick={finish} style={{fontSize:13,fontWeight:800,color:'#fff',
              background:'linear-gradient(135deg,#EF4444,#B91C1C)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>
              ❌ Reject
            </button>
            <button onClick={finish} disabled={!escalateTarget} style={{fontSize:13,fontWeight:800,
              color: escalateTarget?'#fff':T.textMuted,
              background: escalateTarget?'linear-gradient(135deg,#8B5CF6,#6D28D9)':T.bg3,
              border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',
              cursor:escalateTarget?'pointer':'not-allowed',lineHeight:1.2}}>
              {escalateTarget ? `↗ Escalate → ${escalateTarget}` : '↗ Escalate (top tier)'}
            </button>
          </div>
        )}
        <div style={{...cardS,background:T.bg3,fontSize:11,color:T.textMuted,lineHeight:1.55}}>
          On any action the item is removed from every admin's pending queue and flows to the next stage of the publishing pipeline.
        </div>
      </div>
    );
  }

  // ── Forms CRM: hub (category tiles + totals) ──
  function FormsHub() {
    const totalsBy = (k) => formSubs.filter(s => s.category === k).length;
    const total = formSubs.length;
    return (
      <div>
        <div style={{...cardS,background:'rgba(59,130,246,0.08)',borderColor:'rgba(59,130,246,0.35)'}}>
          <div style={{fontSize:11,fontWeight:800,color:'#3B82F6',letterSpacing:0.5,marginBottom:3}}>FORM SUBMISSIONS · CRM HUB</div>
          <div style={{fontSize:12.5,color:T.text,lineHeight:1.5}}>
            Total inputs across all forms: <b>{total}</b>. Tap any category to view its submissions and follow-up history.
          </div>
        </div>
        <SecH>By category</SecH>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
          {FORM_CATS.map(c => (
            <button key={c.key} onClick={()=>pushDrill({type:'formslist', category:c.key})}
              style={{textAlign:'left',cursor:'pointer',background:T.bg2,
                border:`1px solid ${T.border}`,borderRadius:12,padding:'12px 12px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:20}}>{c.icon}</span><span style={{fontSize:13,color:c.c}}>›</span>
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:900,color:c.c,lineHeight:1.1,marginTop:4}}>{totalsBy(c.key)}</div>
              <div style={{fontSize:10.5,color:T.textMuted,fontWeight:700,marginTop:2,lineHeight:1.3}}>{c.label}</div>
            </button>
          ))}
        </div>
        <SecH>Recent activity</SecH>
        {formSubs.slice(0,4).map(s => {
          const cat = FORM_CATS.find(c => c.key === s.category) || {};
          const st = FORM_STATUS[s.status] || {l:s.status,c:T.textMuted};
          return (
            <button key={s.id} onClick={()=>{ setFormNote(''); setFormNextStatus(s.status); pushDrill({type:'formdetail', sub:s}); }}
              style={{width:'100%',textAlign:'left',cursor:'pointer',...cardS,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:22}}>{cat.icon}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.name}</div>
                <div style={{fontSize:10.5,color:T.textMuted}}>{cat.label} · {s.submittedAt}</div>
              </div>
              <Chip txt={st.l} c={st.c}/>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Forms CRM: list within a category ──
  function FormsList({ category }) {
    const cat = FORM_CATS.find(c => c.key === category) || {};
    const [stFilter, setStFilter] = useState('All');
    const all = formSubs.filter(s => s.category === category);
    const items = all.filter(s => stFilter==='All' || s.status===stFilter);
    const cats = ['All', ...cat.statuses];
    return (
      <div>
        <div style={{...cardS,background:cat.c+'14',borderColor:cat.c+'55'}}>
          <div style={{fontSize:11,fontWeight:800,color:cat.c,letterSpacing:0.5,marginBottom:3}}>{cat.icon} {(cat.label||'').toUpperCase()}</div>
          <div style={{fontSize:12.5,color:T.text,lineHeight:1.5}}><b>{all.length}</b> submissions · latest first · tap a row for the full submission + follow-up history</div>
        </div>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
          {cats.map(s => {
            const cnt = s==='All' ? all.length : all.filter(x=>x.status===s).length;
            const lbl = s==='All' ? 'All' : (FORM_STATUS[s]||{l:s}).l;
            const col = s==='All' ? cat.c : (FORM_STATUS[s]||{c:cat.c}).c;
            return (
              <button key={s} onClick={()=>setStFilter(s)} style={{flexShrink:0,fontSize:11,fontWeight:700,cursor:'pointer',
                color:stFilter===s?'#fff':T.textMuted,
                background:stFilter===s?col:T.bg3, border:`1px solid ${T.border}`,
                borderRadius:20,padding:'6px 11px'}}>{lbl} · {cnt}</button>
            );
          })}
        </div>
        {items.length===0 && (
          <div style={{...cardS,textAlign:'center',color:T.textMuted,padding:'30px 18px'}}>
            No submissions in this filter yet.
          </div>
        )}
        {items.map(s => {
          const st = FORM_STATUS[s.status] || {l:s.status,c:T.textMuted};
          return (
            <button key={s.id} onClick={()=>{ setFormNote(''); setFormNextStatus(s.status); pushDrill({type:'formdetail', sub:s}); }}
              style={{width:'100%',textAlign:'left',cursor:'pointer',...cardS,padding:'11px 12px'}}>
              <div style={{display:'flex',gap:9,alignItems:'center',marginBottom:6}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:cat.c+'22',color:cat.c,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,flexShrink:0}}>{(s.name||'?')[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.name}</div>
                  <div style={{fontSize:10.5,color:T.textMuted}}>📞 {s.phone} · 📅 {s.submittedAt}</div>
                </div>
                <Chip txt={st.l} c={st.c}/>
              </div>
              <div style={{fontSize:11.5,color:T.textMuted,lineHeight:1.45,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.details}</div>
              {s.followUps && s.followUps.length>0 && (
                <div style={{marginTop:5,fontSize:10.5,color:T.textMuted}}>📝 {s.followUps.length} follow-up{s.followUps.length>1?'s':''}</div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Forms CRM: per-submission detail + follow-up composer + history ──
  function FormDetail({ sub }) {
    const cat = FORM_CATS.find(c => c.key === sub.category) || {};
    const live = formSubs.find(s => s.id === sub.id) || sub;
    const st = FORM_STATUS[live.status] || {l:live.status, c:T.textMuted};
    const submitFollowUp = () => {
      if (!formNote.trim()) { alert('Please add a note before submitting.'); return; }
      addFollowUp(live.id, formNote, formNextStatus);
      setFormNote('');
    };
    return (
      <div>
        <Crumb items={[cat.label || sub.category, live.id]}/>
        <div style={{...cardS,display:'flex',gap:11,alignItems:'center'}}>
          <div style={{width:50,height:50,borderRadius:'50%',background:cat.c+'22',color:cat.c,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:20,flexShrink:0}}>{(live.name||'?')[0]}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:16,color:T.text}}>{live.name}</div>
            <div style={{fontSize:11.5,color:T.textMuted}}>{live.phone}</div>
            <div style={{fontSize:11.5,color:T.textMuted}}>{live.email} · 📍 {live.city}</div>
          </div>
          <Chip txt={st.l} c={st.c}/>
        </div>

        <SecH>Submission</SecH>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          <KV k="Form" v={cat.label || live.category} vc={cat.c}/>
          <KV k="Submission id" v={live.id}/>
          <KV k="Submitted" v={live.submittedAt}/>
          <KV k="Channel" v="App + Website"/>
          <div style={{padding:'4px 0'}}/>
        </div>
        <div style={{...cardS}}>
          <div style={{fontSize:11,fontWeight:800,color:T.textMuted,letterSpacing:0.5,marginBottom:4}}>SUBMITTED DETAILS</div>
          <div style={{fontSize:13,color:T.text,fontWeight:700,marginBottom:6,lineHeight:1.45}}>{live.details}</div>
          <div style={{fontSize:12,color:T.textMuted,lineHeight:1.55}}>{live.fullText}</div>
        </div>

        {live.files && live.files.length>0 && (
          <>
            <SecH>Uploaded files · {live.files.length}</SecH>
            {live.files.map((f,i)=>(
              <div key={i} style={{...cardS,display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:22}}>📎</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12.5,fontWeight:700,color:T.text}}>{f.name}</div>
                  <div style={{fontSize:11,color:T.textMuted}}>{f.size}</div>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:'#3B82F6',cursor:'pointer'}}>Download ›</span>
              </div>
            ))}
          </>
        )}

        <SecH>Add follow-up</SecH>
        <div style={{...cardS}}>
          <div style={{fontSize:11,fontWeight:800,color:T.textMuted,letterSpacing:0.5}}>NOTE · what happened in this call / contact</div>
          <textarea value={formNote} onChange={e=>setFormNote(e.target.value)}
            placeholder="e.g. Called the advertiser, discussed Q3 plan, sent rate card. Follow up next Monday."
            style={{width:'100%',minHeight:80,background:T.bg2,color:T.text,
              border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 11px',
              fontFamily:"'Barlow',sans-serif",fontSize:12.5,resize:'vertical',boxSizing:'border-box',marginTop:6}}/>
          <div style={{marginTop:10}}>
            <div style={{fontSize:11,fontWeight:800,color:T.textMuted,letterSpacing:0.5}}>UPDATE STATUS</div>
            <select value={formNextStatus} onChange={e=>setFormNextStatus(e.target.value)}
              style={{width:'100%',background:T.bg2,color:T.text,border:`1px solid ${T.border}`,
                borderRadius:10,padding:'10px 11px',fontSize:13,marginTop:6}}>
              {(cat.statuses||formStatusKeys).map(k=>(
                <option key={k} value={k}>{(FORM_STATUS[k]||{l:k}).l}</option>
              ))}
            </select>
          </div>
          <button onClick={submitFollowUp}
            style={{width:'100%',marginTop:12,fontSize:13,fontWeight:800,color:'#fff',
              background:`linear-gradient(135deg,${cat.c||'#3B82F6'},#1E40AF)`,
              border:'none',borderRadius:10,padding:'12px',cursor:'pointer',letterSpacing:0.3}}>
            ＋ Save follow-up
          </button>
        </div>

        <SecH>Follow-up history · {live.followUps.length}</SecH>
        {live.followUps.length === 0 ? (
          <div style={{...cardS,textAlign:'center',color:T.textMuted,padding:'24px 18px',fontSize:12}}>
            No follow-ups yet. Use the composer above to start the conversation log.
          </div>
        ) : (
          live.followUps.map((f,i)=>{
            const fs = FORM_STATUS[f.status] || {l:f.status, c:T.textMuted};
            return (
              <div key={i} style={{...cardS,borderLeft:`3px solid ${fs.c}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4,gap:8}}>
                  <div style={{fontSize:12.5,fontWeight:700,color:T.text}}>{f.by}</div>
                  <Chip txt={fs.l} c={fs.c}/>
                </div>
                <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>📅 {f.at}</div>
                <div style={{fontSize:12.5,color:T.text,lineHeight:1.55}}>{f.note}</div>
              </div>
            );
          })
        )}

        <div style={{...cardS,background:T.bg3,fontSize:11,color:T.textMuted,lineHeight:1.55,marginTop:10}}>
          Every follow-up stays attached to this submission — any admin opening it later sees the full history (original submission · all prior notes · current status).
        </div>
      </div>
    );
  }

  // ── Full report detail: every field + all media, with inline edit / approve / delete ──
  function ReportReview({ report }) {
    const live = reports.find(r => r.id === report.id) || report;
    const { imgs, vids, auds } = reportMedia(live);
    const st = String(live.status || 'new').toLowerCase();
    const sc = reportStatusColor(st);
    const loc = reportLoc(live);
    const profilePic = live.profilePicture ? reportMediaUrl(live.profilePicture) : null;
    const reporter = reportReporter(live);
    const mediaCount = imgs.length + vids.length + auds.length;
    const close = () => setDrill(d => d.slice(0, -1));

    // ── Edit mode (subject / message / image removal) ──
    const [editing, setEditing] = useState(false);
    const [eSubject, setESubject] = useState(live.subject || '');
    const [eMessage, setEMessage] = useState(live.message || '');
    const [eImgs, setEImgs] = useState(imgs);
    const [saving, setSaving] = useState(false);
    const startEdit = () => { setESubject(live.subject || ''); setEMessage(live.message || ''); setEImgs(imgs); setEditing(true); };
    const cancelEdit = () => setEditing(false);
    const save = async () => {
      setSaving(true);
      const ok = await saveReportEdits(live.id, { subject: eSubject, message: eMessage, image_paths: eImgs });
      setSaving(false);
      if (ok) setEditing(false);
    };

    return (
      <div>
        {/* Reporter header */}
        <div style={{...cardS,display:'flex',gap:12,alignItems:'center'}}>
          {profilePic
            ? <img src={profilePic} alt="" style={{width:54,height:54,borderRadius:'50%',objectFit:'cover',flexShrink:0}} onError={e=>{e.target.style.display='none';}}/>
            : <div style={{width:54,height:54,borderRadius:'50%',background:'#3B82F6',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22,flexShrink:0}}>{(reporter||'?').charAt(0).toUpperCase()}</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:16,color:T.text}}>{reporter}</div>
            {live.email && <div style={{fontSize:11.5,color:T.textMuted,wordBreak:'break-all'}}>{live.email}</div>}
            {loc && <div style={{fontSize:11.5,color:T.textMuted}}>📍 {loc}</div>}
          </div>
          <Chip txt={st.charAt(0).toUpperCase()+st.slice(1)} c={sc} />
        </div>

        <SecH>Report details</SecH>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          <KV k="Report id" v={live.id || '—'} />
          <KV k="Status" v={st.charAt(0).toUpperCase()+st.slice(1)} vc={sc} />
          {loc && <KV k="Location" v={loc} />}
          <KV k="Reporter" v={reporter} />
          {live.email && <KV k="Email" v={live.email} />}
          <KV k="Submitted" v={fmtDateTime(live.created_at)} />
          <KV k="Media files" v={`${mediaCount} (${vids.length} video · ${imgs.length} image · ${auds.length} audio)`} />
          <div style={{padding:'4px 0'}}/>
        </div>

        <SecH>Headline / subject {editing && <span style={{color:'#F59E0B'}}>· editing</span>}</SecH>
        {editing ? (
          <textarea value={eSubject} onChange={e=>setESubject(e.target.value)}
            style={{width:'100%',minHeight:54,boxSizing:'border-box',background:T.bg2,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 11px',fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:14,fontWeight:700,resize:'vertical'}}/>
        ) : (
          <div style={{...cardS,fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.45,wordBreak:'break-word',overflowWrap:'anywhere'}}>
            {live.subject || '(no subject)'}
          </div>
        )}

        <SecH>Message / content</SecH>
        {editing ? (
          <textarea value={eMessage} onChange={e=>setEMessage(e.target.value)}
            style={{width:'100%',minHeight:120,boxSizing:'border-box',background:T.bg2,color:T.text,border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 11px',fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12.5,resize:'vertical'}}/>
        ) : (
          <div style={{...cardS,fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12.5,color:T.text,lineHeight:1.6,whiteSpace:'pre-wrap',wordBreak:'break-word',overflowWrap:'anywhere'}}>
            {live.message || '—'}
          </div>
        )}

        {vids.length > 0 && (<>
          <SecH>Videos · {vids.length}</SecH>
          {vids.map((p,i)=>(
            <div key={'v'+i} style={{...cardS,padding:0,overflow:'hidden'}}>
              <video src={reportMediaUrl(p)} controls playsInline preload="metadata" style={{width:'100%',maxHeight:260,background:'#000',display:'block'}} onError={e=>{e.target.style.display='none';}}/>
            </div>
          ))}
        </>)}

        {(editing ? eImgs.length > 0 : imgs.length > 0) && (<>
          <SecH>Images · {editing ? eImgs.length : imgs.length}{editing ? ' · tap × to remove' : ''}</SecH>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:9}}>
            {(editing ? eImgs : imgs).map((p,i)=>(
              editing ? (
                <div key={'i'+i} onClick={()=>setEImgs(arr=>arr.filter((_,j)=>j!==i))}
                  style={{aspectRatio:'1/1',background:T.bg3,backgroundImage:`url(${reportMediaUrl(p)})`,backgroundSize:'cover',backgroundPosition:'center',borderRadius:9,border:`1px solid ${T.border}`,position:'relative',cursor:'pointer'}}>
                  <div style={{position:'absolute',top:4,right:4,width:22,height:22,borderRadius:'50%',background:'rgba(239,68,68,0.95)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800}}>×</div>
                </div>
              ) : (
                <a key={'i'+i} href={reportMediaUrl(p)} target="_blank" rel="noreferrer"
                  style={{aspectRatio:'1/1',background:T.bg3,backgroundImage:`url(${reportMediaUrl(p)})`,backgroundSize:'cover',backgroundPosition:'center',borderRadius:9,border:`1px solid ${T.border}`,display:'block'}}/>
              )
            ))}
          </div>
        </>)}

        {auds.length > 0 && (<>
          <SecH>Audio · {auds.length}</SecH>
          {auds.map((p,i)=>(
            <div key={'a'+i} style={{...cardS,display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20,flexShrink:0}}>🔊</span>
              <audio src={reportMediaUrl(p)} controls style={{flex:1,height:34}} onError={e=>{e.target.style.display='none';}}/>
            </div>
          ))}
        </>)}

        {mediaCount === 0 && !editing && (
          <div style={{...cardS,textAlign:'center',color:T.textMuted,fontSize:12,padding:'24px 18px'}}>No media attached to this report.</div>
        )}

        <SecH>Actions</SecH>
        {editing ? (
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
            <button onClick={save} disabled={saving} style={{flex:1,minWidth:140,fontSize:13,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#10B981,#047857)',border:'none',borderRadius:10,padding:'12px',cursor:saving?'wait':'pointer',opacity:saving?0.7:1}}>{saving?'Saving…':'💾 Save changes'}</button>
            <button onClick={cancelEdit} disabled={saving} style={{flex:1,minWidth:120,fontSize:13,fontWeight:700,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',cursor:'pointer'}}>Cancel</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
            {st === 'approved' ? (
              <button onClick={()=>revertApproval(live.id)} style={{fontSize:13,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#F59E0B,#B45309)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>↩ Revert approval</button>
            ) : (
              <button onClick={()=>approveReport(live.id)} style={{fontSize:13,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#10B981,#047857)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>✅ Approve</button>
            )}
            {st !== 'rejected' ? (
              <button onClick={()=>rejectReport(live.id)} style={{fontSize:13,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#EF4444,#B91C1C)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>❌ Reject</button>
            ) : (
              <button onClick={startEdit} style={{fontSize:13,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>✏️ Modify</button>
            )}
            {st !== 'rejected' && (
              <button onClick={startEdit} style={{fontSize:13,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',border:'none',borderRadius:10,padding:'12px',cursor:'pointer'}}>✏️ Modify</button>
            )}
            <button onClick={()=>{ deleteReport(live.id); close(); }} style={{fontSize:13,fontWeight:800,color:T.textMuted,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',cursor:'pointer',gridColumn:'span 2'}}>🗑 Delete</button>
          </div>
        )}
      </div>
    );
  }

  function DrillScreen() {
    const f = drill[drill.length-1];
    if (f.type==='metric')        return <MetricView metric={f.metric}/>;
    if (f.type==='state')         return <StateView metric={f.metric} state={f.state}/>;
    if (f.type==='cons')          return <ConsView metric={f.metric} state={f.state} cons={f.cons}/>;
    if (f.type==='reporter')      return <ReporterView rep={f.rep}/>;
    if (f.type==='video')         return <VideoView video={f.video}/>;
    if (f.type==='pending')       return <PendingTable/>;
    if (f.type==='pendingreview') return <PendingReviewDetail item={f.item}/>;
    if (f.type==='reportreview')  return <ReportReview report={f.report}/>;
    if (f.type==='formslist')     return <FormsList category={f.category}/>;
    if (f.type==='formdetail')    return <FormDetail sub={f.sub}/>;
    return null;
  }
  const drillTitle = () => {
    const f = drill[drill.length-1]; if(!f) return '';
    if (f.type==='metric')        return (METRICS.find(x=>x.key===f.metric)||{}).label;
    if (f.type==='state')         return (STATES.find(s=>s.code===f.state)||{}).name;
    if (f.type==='cons')          return f.cons;
    if (f.type==='reporter')      return f.rep.name;
    if (f.type==='video')         return 'Video Review';
    if (f.type==='pending')       return 'Pending Reviews';
    if (f.type==='pendingreview') return 'Review · ' + f.item.id;
    if (f.type==='reportreview')  return 'Report · ' + reportReporter(f.report);
    if (f.type==='formslist')     return (FORM_CATS.find(c=>c.key===f.category)||{}).label || 'Form submissions';
    if (f.type==='formdetail')    return 'Submission · ' + f.sub.id;
    return '';
  };

  // ── notifications & messaging hub (module: notify) ──
  const NotifyHub = () => {
    const templates = [
      ['✅ Approval','Citizen Reporter','“Your {category} video was approved and is being processed for broadcast.”','#10B981'],
      ['❌ Rejection','Citizen Reporter','“Your video was rejected: {reason}. You may submit a new one.”','#EF4444'],
      ['🔁 Re-upload Request','Uploader','“Please re-upload: {reason}. Tap to re-record.”','#F97316'],
      ['ℹ️ Need More Information','Uploader','“We need more details: {question} before we can review.”','#F59E0B'],
      ['🎁 Reward','Citizen Reporter','“Congrats! You earned {points} points for {count} approved videos this week.”','#8B5CF6'],
      ['↗ Escalation Alert','Reviewer / Admin','“Item {id} escalated to {tier} for senior review.”','#8B5CF6'],
      ['🎉 Published','User / Uploader','“Your content is now live on {channel}!”','#059669'],
      ['⏰ Pre-broadcast','Uploader','“Your content airs in 10 minutes on {channel}.”','#3B82F6'],
      ['📝 Admin Remark','Admin','“Note added by {admin}: {remark}.”','#6B7280'],
    ];
    const sent = [
      ['Ravi Kumar (CR-1042)','Approval','Citizen Reporter','Delivered','#10B981','2m ago'],
      ['Suresh Reddy (CR-3187)','Re-upload Request','Uploader','Delivered','#10B981','9m ago'],
      ['Anjali Rao (CR-2255)','Rejection','Citizen Reporter','Delivered','#10B981','21m ago'],
      ['Lakshmi Devi','Escalation Alert','Reviewer','Read','#3B82F6','34m ago'],
      ['Deepa Reddy (CR-4471)','Reward','Citizen Reporter','Delivered','#10B981','1h ago'],
      ['Koneti Mohan Reddy','Admin Remark','Admin','Pending','#F59E0B','1h ago'],
    ];
    return (
      <div>
        <SecH>Message templates · by audience</SecH>
        {templates.map((t,i)=>(
          <div key={i} style={{...cardS,borderLeft:`3px solid ${t[3]}`}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8,marginBottom:3}}>
              <span style={{fontWeight:800,fontSize:13,color:T.text}}>{t[0]}</span>
              <span style={{fontSize:10,color:t[3],fontWeight:700,whiteSpace:'nowrap'}}>→ {t[1]}</span>
            </div>
            <div style={{fontSize:12,color:T.textMuted,fontStyle:'italic',lineHeight:1.5}}>{t[2]}</div>
          </div>
        ))}
        <SecH>Recently sent</SecH>
        {sent.map((m,i)=>(
          <div key={i} style={{...cardS,display:'flex',alignItems:'center',gap:8}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12.5,fontWeight:700,color:T.text}}>{m[0]}</div>
              <div style={{fontSize:11,color:T.textMuted}}>{m[1]} · to {m[2]} · {m[5]}</div>
            </div>
            <Chip txt={m[3]} c={m[4]}/>
          </div>
        ))}
        <div style={{...cardS,background:T.bg3,fontSize:11.5,color:T.textMuted,lineHeight:1.6}}>
          Audiences covered: <b style={{color:T.text}}>User · Uploader · Citizen Reporter · Reviewer · Admin</b>. Delivery via Firebase Cloud Messaging. (Demo data.)
        </div>
      </div>
    );
  };

  // ══ MODULE RENDERERS ══════════════════════════════════════════════
  function ModuleBody() {
    const m = MODULES.find(x => x.key === view);
    if (m && m.need && !can(m.need)) return <Locked need={m.need} />;

    if (view === 'moderation') {
      // Status filter pills built from the statuses actually present (reports carry `status`, not a category).
      const statusesPresent = Array.from(new Set(reports.map(r => String(r.status || 'new').toLowerCase())));
      const pills = ['all', ...statusesPresent];
      const pillLabel = (s) => s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1);
      // Distinct locations among loaded reports (for the location dropdown).
      const locOptions = Array.from(new Set(reports.map(r => reportLoc(r)).filter(Boolean))).sort();
      const localDate = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
      const q = reportSearch.trim().toLowerCase();
      const visible = reports.filter(r => {
        if (reportFilter !== 'all' && String(r.status || 'new').toLowerCase() !== reportFilter) return false;
        if (reportLocFilter !== 'all' && reportLoc(r) !== reportLocFilter) return false;
        if (reportDate && localDate(r.created_at) !== reportDate) return false;
        if (q && ![reportReporter(r), r.email, r.subject, r.message, reportLoc(r)]
          .some(f => f != null && String(f).toLowerCase().includes(q))) return false;
        return true;
      });
      const hasReportFilters = reportFilter !== 'all' || reportLocFilter !== 'all' || !!reportDate || !!q;
      const clearReportFilters = () => { setReportFilter('all'); setReportLocFilter('all'); setReportDate(''); setReportSearch(''); };
      const palette = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#D0021B','#0EA5E9'];
      return (
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <SecH>Reports {reports.length ? `· ${reports.length}` : ''}</SecH>
            <button onClick={loadReports} style={{fontSize:11,fontWeight:700,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'5px 10px',cursor:'pointer'}}>↻ Refresh</button>
          </div>

          {/* Status filter pills */}
          {reports.length > 0 && (
            <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
              {pills.map(s => {
                const cnt = s === 'all' ? reports.length : reports.filter(r => String(r.status||'new').toLowerCase() === s).length;
                const active = reportFilter === s;
                const c = s === 'all' ? '#D0021B' : reportStatusColor(s);
                return (
                  <button key={s} onClick={()=>setReportFilter(s)} style={{flexShrink:0,fontSize:11,fontWeight:700,cursor:'pointer',
                    color:active?'#fff':T.textMuted, background:active?c:T.bg3,
                    border:`1px solid ${active?c:T.border}`, borderRadius:20, padding:'6px 12px'}}>
                    {pillLabel(s)}{s!=='all'?` · ${cnt}`:''}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search · Location · Date filters */}
          {reports.length > 0 && (
            <div style={{...cardS,display:'flex',flexDirection:'column',gap:8}}>
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',fontSize:13,color:T.textMuted,pointerEvents:'none'}}>🔍</span>
                <input type="text" value={reportSearch} onChange={e=>setReportSearch(e.target.value)}
                  placeholder="Search by name, subject, email…"
                  style={{width:'100%',boxSizing:'border-box',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:9,padding:'9px 32px 9px 32px',color:T.text,fontSize:12.5,outline:'none'}}/>
                {reportSearch && (
                  <button onClick={()=>setReportSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:T.textMuted,fontSize:14,cursor:'pointer',lineHeight:1,padding:2}}>✕</button>
                )}
              </div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <div style={{flex:1,minWidth:140}}>
                  <div style={{fontSize:10,fontWeight:800,color:T.textMuted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>📍 Location</div>
                  <select value={reportLocFilter} onChange={e=>setReportLocFilter(e.target.value)}
                    style={{width:'100%',boxSizing:'border-box',background:T.bg3,color:T.text,border:`1px solid ${T.border}`,borderRadius:9,padding:'8px 9px',fontSize:12.5,outline:'none'}}>
                    <option value="all">All locations</option>
                    {locOptions.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div style={{flex:1,minWidth:140}}>
                  <div style={{fontSize:10,fontWeight:800,color:T.textMuted,textTransform:'uppercase',letterSpacing:0.5,marginBottom:4}}>📅 Date</div>
                  <input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)}
                    style={{width:'100%',boxSizing:'border-box',background:T.bg3,color:T.text,border:`1px solid ${T.border}`,borderRadius:9,padding:'7px 9px',fontSize:12.5,outline:'none'}}/>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                <span style={{fontSize:11,color:T.textMuted}}>Showing <b style={{color:T.text}}>{visible.length}</b> of {reports.length} loaded</span>
                {hasReportFilters && (
                  <button onClick={clearReportFilters} style={{fontSize:11,fontWeight:700,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'6px 11px',cursor:'pointer'}}>✕ Clear filters</button>
                )}
              </div>
            </div>
          )}

          {reportsErr && <div style={{...cardS,background:'rgba(239,68,68,0.08)',borderColor:'rgba(239,68,68,0.35)',fontSize:12,color:'#EF4444'}}>{reportsErr}</div>}
          {reportsLoading && <div style={{...cardS,textAlign:'center',color:T.textMuted,fontSize:12}}>Loading reports…</div>}
          {!reportsLoading && !reportsErr && reports.length === 0 && (
            <div style={{...cardS,textAlign:'center',color:T.textMuted,fontSize:12}}>No reports found.</div>
          )}
          {!reportsLoading && reports.length > 0 && visible.length === 0 && (
            <div style={{...cardS,textAlign:'center',color:T.textMuted,fontSize:12}}>No reports match the current filters{reportsHasMore ? ' — scroll / Load more to fetch additional reports.' : '.'}</div>
          )}

          {visible.map((r,i) => {
            const { imgs, vids, auds } = reportMedia(r);
            const thumb = imgs[0] ? reportMediaUrl(imgs[0]) : null;
            const st = String(r.status || 'new').toLowerCase();
            const sc = reportStatusColor(st);
            const loc = reportLoc(r);
            const col = palette[i % palette.length];
            return (
              <div key={r.id || i} onClick={()=>openReport(r)}
                style={{...cardS, cursor:'pointer', display:'flex', gap:11, alignItems:'flex-start'}}>
                {/* Thumbnail / media-type icon */}
                <div style={{width:54,height:54,borderRadius:9,background:T.bg3,flexShrink:0,overflow:'hidden',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,
                  backgroundImage:thumb?`url(${thumb})`:'none',backgroundSize:'cover',backgroundPosition:'center'}}>
                  {!thumb && (vids.length ? '🎬' : auds.length ? '🔊' : '📄')}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'flex-start',marginBottom:4}}>
                    <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:13.5,fontWeight:700,color:T.text,lineHeight:1.4,
                      display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {reportTitle(r)}
                    </div>
                    <span style={{flexShrink:0}}><Chip txt={pillLabel(st)} c={sc} /></span>
                  </div>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:8,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {loc?`📍 ${loc} · `:''}👤 {reportReporter(r)}{r.created_at?` · ${fmtAge(r.created_at)}`:''}
                  </div>
                  {(vids.length || imgs.length || auds.length) > 0 && (
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                      {vids.length>0 && <span style={{fontSize:10,fontWeight:700,color:'#3B82F6',background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.35)',borderRadius:6,padding:'3px 7px'}}>🎬 {vids.length}</span>}
                      {imgs.length>0 && <span style={{fontSize:10,fontWeight:700,color:'#10B981',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.35)',borderRadius:6,padding:'3px 7px'}}>🖼 {imgs.length}</span>}
                      {auds.length>0 && <span style={{fontSize:10,fontWeight:700,color:'#8B5CF6',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:6,padding:'3px 7px'}}>🔊 {auds.length}</span>}
                    </div>
                  )}
                  <div style={{display:'flex',gap:7,flexWrap:'wrap'}} onClick={(e)=>e.stopPropagation()}>
                    <button onClick={()=>openReport(r)} style={{fontSize:11,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>👁 Review</button>
                    {st === 'approved' ? (
                      <button onClick={()=>revertApproval(r.id)} style={{fontSize:11,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#F59E0B,#B45309)',border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>↩ Revert</button>
                    ) : (
                      <button onClick={()=>approveReport(r.id)} style={{fontSize:11,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#10B981,#047857)',border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>✅ Approve</button>
                    )}
                    {st !== 'rejected' && (
                      <button onClick={()=>rejectReport(r.id)} style={{fontSize:11,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#EF4444,#B91C1C)',border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>❌ Reject</button>
                    )}
                    <button onClick={()=>openReport(r)} style={{fontSize:11,fontWeight:800,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>✏️ Modify</button>
                    <button onClick={()=>deleteReport(r.id)} style={{fontSize:11,fontWeight:800,color:T.textMuted,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>🗑 Delete</button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Infinite-scroll footer */}
          {!reportsLoading && reports.length > 0 && (
            <div style={{textAlign:'center',padding:'8px 0 4px'}}>
              {reportsLoadingMore ? (
                <div style={{fontSize:12,color:T.textMuted}}>Loading more…</div>
              ) : reportsHasMore ? (
                <button onClick={loadMoreReports} style={{fontSize:12,fontWeight:700,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:9,padding:'9px 18px',cursor:'pointer'}}>
                  ↓ Load more
                </button>
              ) : (
                <div style={{fontSize:11,color:T.textMuted}}>· End of reports · {reports.length} total ·</div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (view === 'workflow') {
      const steps = [
        ['1','Upload','Citizen submits 1–3 media + headline + description + location. Turnstile, ClamAV virus scan, SHA-256 dedup, NSFW check → status: pending'],
        ['2','Admin Claim','Atomic lock: UPDATE … WHERE status=pending AND not-claimed. 1 row = you own it, 0 rows = already claimed'],
        ['3','Decision','Approve · Modify+Approve (original kept read-only) · Reject (reason → citizen notified) · Escalate (admin→master→super)'],
        ['4','Webhook via Queue','pg_boss job → POST to AI Pipeline with HMAC + idempotency_key. Retry 1s→5s→30s→5min→30min, dead-letter after 5'],
        ['5','AI Pipeline','FastAPI validates + HMAC, 202 in 200ms. Celery: Gemini Flash → Google TTS → FFmpeg (NVENC). Output → S3'],
        ['6','Callback','POST /api/webhook/ai-processed → status = ready_for_bulletin. Retry if Admin unreachable, else AI-side DLQ'],
        ['7','Time-slot Schedule','pg_cron + advisory lock. Birthdays on exact date, others across 5 slots. 10-min pre-broadcast push'],
        ['8','Broadcast','Bulletin assembled & aired. Audit log records aired_at'],
      ];
      return (
        <div>
          {steps.map(([n,h,d],i) => (
            <div key={n} style={{display:'flex',gap:11,marginBottom:i<7?4:0}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'#D0021B',color:'#fff',
                  display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,flexShrink:0}}>{n}</div>
                {i<7 && <div style={{width:2,flex:1,background:T.border,margin:'3px 0'}}/>}
              </div>
              <div style={{...cardS,flex:1}}>
                <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:14,color:T.text,marginBottom:4}}>{h}</div>
                <div style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (view === 'channels') {
      const ch = [
        ['కర్నూలు TV','Kurnool, AP','LIVE','#10B981',5],['గుంటూరు TV','Guntur, AP','LIVE','#10B981',5],
        ['విజయవాడ TV','Vijayawada, AP','LIVE','#10B981',5],['నెల్లూరు TV','Nellore, AP','LIVE','#10B981',4],
        ['వరంగల్ TV','Warangal, TG','LIVE','#10B981',4],['ఖమ్మం TV','Khammam, TG','STANDBY','#F59E0B',5],
      ];
      return (
        <div>
          <div style={{...cardS,background:'rgba(59,130,246,0.1)',borderColor:'rgba(59,130,246,0.35)'}}>
            <div style={{fontSize:12.5,color:T.text,lineHeight:1.6}}>
              <b>Scale roadmap:</b> 9 live now → 300 (Month 1) → 3,000 channels (Month 6, pan-India).
              200 videos/day/channel ≈ 600,000/day at peak. YouTube used for LIVE only; all else via S3 + Cloudflare CDN.
            </div>
          </div>
          {ch.map((c,i) => (
            <div key={i} style={{...cardS,display:'flex',alignItems:'center',gap:10}}>
              <div style={{fontSize:22}}>📺</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>{c[0]}</div>
                <div style={{fontSize:11,color:T.textMuted}}>{c[1]} · {c[4]} daily slots · 🔴 YouTube live</div>
              </div>
              <Chip txt={c[2]} c={c[3]} />
            </div>
          ))}
          <div style={{textAlign:'center',marginTop:6}}>
            <span style={{fontSize:12,fontWeight:700,color:can('createAdmin')?'#fff':T.textMuted,
              background:can('createAdmin')?'#D0021B':T.bg3,border:`1px solid ${T.border}`,
              borderRadius:9,padding:'9px 18px'}}>
              {can('createAdmin') ? '＋ Add / Configure Channel' : '🔒 Add channel — Master/Super only'}
            </span>
          </div>
        </div>
      );
    }

    if (view === 'users') {
      const matrix = [
        ['Create Master Admin','✅','❌','❌'],['Create Admin','✅','✅','❌'],
        ['Suspend lower tier','✅','✅ admins','❌'],['Geographic access','All','All','Assigned'],
        ['Bypass review (own)','✅','✅','✅'],['Approve/Reject/Escalate','✅','✅','✅'],
        ['All-India analytics','✅','✅','❌'],['Cancel approved jobs','✅','✅','❌'],
        ['Audit log access','All','Team','Own'],
      ];
      const palette = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#D0021B','#0EA5E9'];
      // Canonical role display data (label + colour). Keys match DB role values.
      const ROLE_META = {
        user:         { label:'User',         c:'#6B7280' },
        admin:        { label:'Admin',        c:'#3B82F6' },
        master_admin: { label:'Master Admin', c:'#8B5CF6' },
        super_admin:  { label:'Super Admin',  c:'#D0021B' },
      };
      const roleMeta = (r) => ROLE_META[String(r || 'user').toLowerCase()] || ROLE_META.user;
      const isVerified = (u) => u.is_verified === 1 || u.is_verified === true || u.is_verified === '1';
      const q = userSearch.trim().toLowerCase();
      const unverifiedTotal = users.filter(u => !isVerified(u)).length;
      const filteredUsers = users.filter(u => {
        if (userVerFilter === 'verified' && !isVerified(u)) return false;
        if (userVerFilter === 'unverified' && isVerified(u)) return false;
        if (!q) return true;
        return [u.name, u.phone, u.email, u.role, locName(u.location)]
          .some(f => f != null && f.toString().toLowerCase().includes(q));
      });
      // Unverified users float to the top, preserving original order within each group.
      const sortedUsers = filteredUsers
        .map((u, i) => ({ u, i }))
        .sort((a, b) => (isVerified(a.u) === isVerified(b.u) ? a.i - b.i : isVerified(a.u) ? 1 : -1))
        .map(x => x.u);
      return (
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <SecH>Users {users.length ? `· ${users.length}` : ''}</SecH>
            <button onClick={loadUsers} style={{fontSize:11,fontWeight:700,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'5px 10px',cursor:'pointer'}}>↻ Refresh</button>
          </div>
          <div style={{position:'relative',marginBottom:10}}>
            <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',fontSize:13,color:T.textMuted,pointerEvents:'none'}}>🔍</span>
            <input
              type="text"
              value={userSearch}
              onChange={(e)=>setUserSearch(e.target.value)}
              placeholder="Search by name, phone, email, role…"
              style={{width:'100%',boxSizing:'border-box',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:9,
                padding:'9px 32px 9px 32px',color:T.text,fontSize:12.5,outline:'none'}}
            />
            {userSearch && (
              <button onClick={()=>setUserSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',
                background:'none',border:'none',color:T.textMuted,fontSize:14,cursor:'pointer',lineHeight:1,padding:2}}>✕</button>
            )}
          </div>
          <div style={{display:'flex',gap:6,marginBottom:10,alignItems:'center'}}>
            {[['all','All'],['unverified','Unverified'],['verified','Verified']].map(([key,label])=>{
              const active = userVerFilter===key;
              const badge = key==='unverified' && unverifiedTotal ? ` · ${unverifiedTotal}` : '';
              return (
                <button key={key} onClick={()=>setUserVerFilter(key)} style={{flexShrink:0,fontSize:11,fontWeight:700,cursor:'pointer',
                  color:active?'#fff':T.textMuted,background:active?'#3B82F6':T.bg3,
                  border:`1px solid ${T.border}`,borderRadius:20,padding:'6px 12px'}}>{label}{badge}</button>
              );
            })}
            <span style={{marginLeft:'auto',fontSize:11,color:T.textMuted,fontWeight:700}}>{sortedUsers.length} of {users.length}</span>
          </div>
          {promoteRole && (
            <div style={{...cardS,background:`${roleMeta(promoteRole).c}14`,borderColor:`${roleMeta(promoteRole).c}66`,display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:800,color:roleMeta(promoteRole).c,letterSpacing:0.5,marginBottom:2}}>SELECT A USER</div>
                <div style={{fontSize:12.5,color:T.text,lineHeight:1.5}}>Tap any user below to make them <b style={{color:roleMeta(promoteRole).c}}>{roleMeta(promoteRole).label}</b>.</div>
              </div>
              <button onClick={()=>setPromoteRole(null)} style={{fontSize:11,fontWeight:800,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 12px',cursor:'pointer',flexShrink:0}}>Cancel</button>
            </div>
          )}
          {usersErr && <div style={{...cardS,background:'rgba(239,68,68,0.08)',borderColor:'rgba(239,68,68,0.35)',fontSize:12,color:'#EF4444'}}>{usersErr}</div>}
          {usersLoading && <div style={{...cardS,textAlign:'center',color:T.textMuted,fontSize:12}}>Loading users…</div>}
          {!usersLoading && !usersErr && users.length === 0 && (
            <div style={{...cardS,textAlign:'center',color:T.textMuted,fontSize:12}}>No users found.</div>
          )}
          {!usersLoading && !usersErr && users.length > 0 && sortedUsers.length === 0 && (
            <div style={{...cardS,textAlign:'center',color:T.textMuted,fontSize:12}}>
              {userSearch ? `No users match “${userSearch}”.` : `No ${userVerFilter !== 'all' ? userVerFilter + ' ' : ''}users.`}
            </div>
          )}
          <div style={{maxHeight:520,overflowY:'auto',marginRight:-4,paddingRight:4}}>
          {sortedUsers.map((u,i) => {
            const verified = isVerified(u);
            const rm = roleMeta(u.role);
            const selecting = !!promoteRole;
            const pickUser = () => {
              if (!selecting) return;
              const tgt = roleMeta(promoteRole);
              if ((u.role||'user') === promoteRole) { alert(`${u.name||'This user'} is already ${tgt.label}.`); return; }
              if (!window.confirm(`Make ${u.name||'this user'} a ${tgt.label}?`)) return;
              changeUserRole(u.id, promoteRole);
              setPromoteRole(null);
            };
            return (
              <div key={u.id || i} onClick={pickUser} style={{...cardS,
                cursor: selecting ? 'pointer' : 'default',
                borderColor: selecting ? `${roleMeta(promoteRole).c}66` : T.border,
                boxShadow: selecting ? `0 0 0 1px ${roleMeta(promoteRole).c}33 inset` : 'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:selecting?0:8}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:palette[i%palette.length],color:'#fff',
                    display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,flexShrink:0}}>
                    {(u.name||u.phone||'?').toString().charAt(0).toUpperCase()}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13.5,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{u.name||'—'}</div>
                    <div style={{fontSize:11,color:T.textMuted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {u.phone||u.email||'—'}{u.location?` · 📍 ${locName(u.location)}`:''}
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end',flexShrink:0}}>
                    <Chip txt={rm.label} c={rm.c} />
                    <Chip txt={verified?'Verified':'Unverified'} c={verified?'#10B981':'#F59E0B'} />
                  </div>
                </div>
                {!selecting && (
                  <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:8}}>
                    {!verified && (
                      <button onClick={()=>verifyUser(u.id)} style={{fontSize:11,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#10B981,#047857)',border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>✅ Verify</button>
                    )}
                    <button onClick={()=>rejectUser(u.id)} style={{fontSize:11,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#F59E0B,#B45309)',border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>✋ Reject</button>
                    <button onClick={()=>deleteUser(u.id)} style={{fontSize:11,fontWeight:800,color:'#fff',background:'linear-gradient(135deg,#EF4444,#B91C1C)',border:'none',borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>🗑 Delete</button>
                    {(u.role||'user') !== 'user' && (
                      <button onClick={()=>{ if(window.confirm(`Demote ${u.name||'this user'} to User?`)) changeUserRole(u.id,'user'); }} style={{fontSize:11,fontWeight:800,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 12px',cursor:'pointer'}}>⬇ Demote to User</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
          <div style={{display:'flex',gap:8,marginTop:4,marginBottom:6}}>
            <button
              disabled={!can('createMaster')}
              onClick={()=>setPromoteRole(p => p==='master_admin' ? null : 'master_admin')}
              style={{flex:1,textAlign:'center',fontSize:11.5,fontWeight:700,cursor:can('createMaster')?'pointer':'not-allowed',
                color:can('createMaster')?'#fff':T.textMuted,
                background:promoteRole==='master_admin' ? '#6D28D9' : (can('createMaster')?'#8B5CF6':T.bg3),
                border:`1px solid ${promoteRole==='master_admin'?'#6D28D9':T.border}`,borderRadius:9,padding:'9px 6px'}}>
              {can('createMaster')?(promoteRole==='master_admin'?'✕ Cancel':'＋ Master Admin'):'🔒 Master Admin'}</button>
            <button
              disabled={!can('createAdmin')}
              onClick={()=>setPromoteRole(p => p==='admin' ? null : 'admin')}
              style={{flex:1,textAlign:'center',fontSize:11.5,fontWeight:700,cursor:can('createAdmin')?'pointer':'not-allowed',
                color:can('createAdmin')?'#fff':T.textMuted,
                background:promoteRole==='admin' ? '#1D4ED8' : (can('createAdmin')?'#3B82F6':T.bg3),
                border:`1px solid ${promoteRole==='admin'?'#1D4ED8':T.border}`,borderRadius:9,padding:'9px 6px'}}>
              {can('createAdmin')?(promoteRole==='admin'?'✕ Cancel':'＋ Admin'):'🔒 Admin'}</button>
          </div>
          <SecH>Permissions matrix (Plan v1.3 §3.2)</SecH>
          <div style={{...cardS,padding:0,overflow:'hidden'}}>
            <div style={{display:'flex',background:T.bg3,padding:'8px 10px',fontSize:10.5,fontWeight:800,color:T.textMuted,textTransform:'uppercase',letterSpacing:0.5}}>
              <span style={{flex:1.6}}>Capability</span><span style={{flex:1,textAlign:'center'}}>Super</span>
              <span style={{flex:1,textAlign:'center'}}>Master</span><span style={{flex:1,textAlign:'center'}}>Admin</span>
            </div>
            {matrix.map((r,i) => (
              <div key={i} style={{display:'flex',padding:'7px 10px',fontSize:11,color:T.text,borderTop:`1px solid ${T.border}`}}>
                <span style={{flex:1.6,color:T.textMuted}}>{r[0]}</span>
                <span style={{flex:1,textAlign:'center'}}>{r[1]}</span>
                <span style={{flex:1,textAlign:'center'}}>{r[2]}</span>
                <span style={{flex:1,textAlign:'center'}}>{r[3]}</span>
              </div>
            ))}
          </div>
          <div style={{...cardS,background:T.bg3}}>
            <div style={{fontSize:11.5,color:T.textMuted,lineHeight:1.6}}>
              <b style={{color:T.text}}>State restriction:</b> Admins are assigned one or more states.
              Queue auto-filters; RLS enforces at DB level. Multi-language: AP/TG (Telugu), Karnataka (Kannada), Tamil Nadu (Tamil)…
            </div>
          </div>
        </div>
      );
    }

    if (view === 'scheduler') {
      const slots = [
        ['08:50 – 09:00','Morning','12 items','Birthdays + morning news'],
        ['11:50 – 12:00','Lunch','9 items','General news round-robin'],
        ['16:50 – 17:00','Evening','11 items','Events (2d/1d/on-day)'],
        ['20:50 – 21:00','Prime time','15 items','Top news + NotebookLM'],
        ['22:50 – 23:00','Late night','HELD','⚠️ AI callback pending → Standby filler'],
      ];
      return (
        <div>
          <div style={{...cardS,background:T.bg3,fontSize:12,color:T.textMuted,lineHeight:1.6}}>
            Birthdays/anniversaries → slot nearest 9 AM on exact date · Upcoming marriage → 7d/3d/on-day ·
            Events → 2d/1d/on-day · News → round-robin. 10-min pre-broadcast push to uploaders.
          </div>
          {slots.map((s,i) => {
            const held = s[2] === 'HELD';
            return (
              <div key={i} style={{...cardS, borderColor: held?'rgba(245,158,11,0.45)':T.border}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:T.text}}>{s[0]}</span>
                  <Chip txt={s[1]} c={held?'#F59E0B':'#6366F1'} />
                </div>
                <div style={{fontSize:12,color:held?'#F59E0B':T.textMuted}}>{held?s[3]:`${s[2]} · ${s[3]}`}</div>
                {held && (
                  <div style={{marginTop:9}}>
                    <span style={{fontSize:11,fontWeight:700,
                      color:can('forceRelease')?'#fff':T.textMuted,
                      background:can('forceRelease')?'#F59E0B':T.bg3,
                      border:`1px solid ${T.border}`,borderRadius:8,padding:'6px 12px'}}>
                      {can('forceRelease')?'⚡ Force-release slot':'🔒 Force-release — Super only'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (view === 'analytics') return (
      <div>
        <PeriodBar/>
        <SecH>Content metrics — tap to drill down</SecH>
        <MetricTiles onPick={(mk)=>pushDrill({type:'metric',metric:mk})}/>
        <div style={{...cardS,background:T.bg3,marginTop:10,fontSize:11.5,color:T.textMuted,lineHeight:1.6}}>
          Drill path: <b style={{color:T.text}}>State → Constituency → Citizen Reporter → Individual videos.</b> Tap any metric above to begin.
        </div>
        <SecH>Top categories</SecH>
        {[['News',82,'#D0021B'],['Birthday',64,'#8B5CF6'],['Rental',47,'#3B82F6'],['Events',38,'#10B981'],['Vehicle',29,'#F59E0B']].map((b,i)=>(
          <div key={i} style={{marginBottom:9}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11.5,color:T.text,marginBottom:3}}>
              <span>{b[0]}</span><span style={{color:T.textMuted}}>{b[1]}%</span>
            </div>
            <div style={{height:8,background:T.bg3,borderRadius:5,overflow:'hidden'}}>
              <div style={{width:`${b[1]}%`,height:'100%',background:b[2],borderRadius:5}}/>
            </div>
          </div>
        ))}
        <div style={{...cardS,background:T.bg3,marginTop:8,fontSize:11.5,color:T.textMuted,lineHeight:1.6}}>
          ⚡ Counts are <b style={{color:T.text}}>precomputed</b> (content_filter_counts) — no slow live queries at 3,000-channel scale.
        </div>
      </div>
    );

    if (view === 'pipeline') return (
      <div>
        <SecH>Two-database federation</SecH>
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:10}}>
          <div style={{...cardS,marginBottom:0,borderColor:'rgba(208,2,27,0.4)'}}>
            <div style={{fontWeight:800,fontSize:13,color:'#D0021B',marginBottom:3}}>DB 1 · Admin Dashboard (Supabase, Mumbai)</div>
            <div style={{fontSize:11,color:T.textMuted}}>users · content · content_audit_log · webhook_deliveries · notifications</div>
          </div>
          <div style={{textAlign:'center',fontSize:11,color:T.textMuted}}>↕ linked by <b style={{color:T.text}}>content_id</b> (UUID v4)</div>
          <div style={{...cardS,marginBottom:0,borderColor:'rgba(59,130,246,0.4)'}}>
            <div style={{fontWeight:800,fontSize:13,color:'#3B82F6',marginBottom:3}}>DB 2 · AI Pipeline (AI team's PostgreSQL)</div>
            <div style={{fontSize:11,color:T.textMuted}}>ai_processing_jobs · content_assets · content_collections · schedule_* · ai_callbacks_outbox</div>
          </div>
        </div>
        <SecH>ai_processing_jobs (live)</SecH>
        {[['job_8821','content_a3f…','FFmpeg/NVENC','processing','#3B82F6','2/5'],
          ['job_8820','content_77c…','Gemini→TTS','processing','#3B82F6','1/5'],
          ['job_8817','content_19b…','done','published','#10B981','—'],
          ['job_8814','content_c40…','FFmpeg','failed_retryable','#F97316','4/5']].map((j,i)=>(
          <div key={i} style={{...cardS,display:'flex',alignItems:'center',gap:8}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12.5,fontWeight:700,color:T.text}}>{j[0]} <span style={{color:T.textMuted,fontWeight:400}}>· {j[1]}</span></div>
              <div style={{fontSize:11,color:T.textMuted}}>{j[2]} · attempts {j[5]}</div>
            </div>
            <Chip txt={j[3].replace(/_/g,' ')} c={j[4]} />
          </div>
        ))}
        <SecH>Worker health</SecH>
        <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
          {[['media','🟢'],['build','🟢'],['maintenance','🟢'],['beat','🟡']].map((w,i)=>(
            <span key={i} style={{fontSize:11.5,color:T.text,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,padding:'7px 11px'}}>{w[1]} {w[0]}</span>
          ))}
        </div>
      </div>
    );

    if (view === 'webhooks') return (
      <div>
        <SecH>Retry ladder</SecH>
        <div style={{...cardS,fontSize:13,fontWeight:700,color:T.text,textAlign:'center',letterSpacing:0.3}}>1s → 5s → 30s → 5min → 30min → dead-letter</div>
        <SecH>Callback failure contract (§15.7)</SecH>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          {[['2xx success','Mark complete → ready_for_bulletin','#10B981'],
            ['5xx (Admin down)','RETRY (transient) · pg_cron watchdog','#F59E0B'],
            ['4xx (bad payload)','DEAD-LETTER · do NOT retry · Sentry','#EF4444'],
            ['Timeout / none','Treat as 5xx → retry','#F59E0B'],
            ['> 30 min no callback','content → callback_lost · super reconciles','#DC2626']].map((r,i)=>(
            <div key={i} style={{padding:'9px 12px',borderTop:i?`1px solid ${T.border}`:'none'}}>
              <div style={{fontSize:12,fontWeight:700,color:r[2]}}>{r[0]}</div>
              <div style={{fontSize:11.5,color:T.textMuted}}>{r[1]}</div>
            </div>
          ))}
        </div>
        <SecH>ai_callbacks_outbox (dead-letter)</SecH>
        {[['content_5e2…','HTTP 422 · bad thumbnail_url','2h ago'],['content_9a1…','HTTP 401 · token mismatch','5h ago']].map((d,i)=>(
          <div key={i} style={{...cardS,display:'flex',justifyContent:'space-between',gap:8}}>
            <div><div style={{fontSize:12.5,fontWeight:700,color:T.text}}>{d[0]}</div><div style={{fontSize:11,color:'#EF4444'}}>{d[1]}</div></div>
            <span style={{fontSize:11,color:T.textMuted}}>{d[2]}</span>
          </div>
        ))}
        <div style={{...cardS,background:T.bg3,fontSize:11,color:T.textMuted,lineHeight:1.6}}>
          Staging: pipeline-staging.localaitv.com → api-staging.localaitv.com<br/>
          Production: pipeline.localaitv.com → api.localaitv.com · all via Cloudflare WAF
        </div>
      </div>
    );

    if (view === 'rules') return (
      <div>
        {[['🎂 Birthday','Auto-scheduled to slot nearest 9 AM on exact birthday date. Auto-expires next day.'],
          ['💒 Marriage anniversary','Same as birthday — exact date, then expires.'],
          ['💍 Upcoming marriage','Shown 7 days, 3 days, and on-day. Auto-expires after event.'],
          ['📅 Events','Shown 2 days, 1 day, and on-day. Auto-expires after event.'],
          ['🛍 Shopping','Visible 7 days then auto-expires.'],
          ['🚗 Vehicle / Car sale','Auto-expires after configured window unless renewed.'],
          ['🔄 Rotation','content_rotation_state cycles items so feeds stay fresh at scale.']].map((r,i)=>(
          <div key={i} style={cardS}>
            <div style={{fontWeight:800,fontSize:13.5,color:T.text,marginBottom:4}}>{r[0]}</div>
            <div style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>{r[1]}</div>
          </div>
        ))}
        <div style={{textAlign:'center'}}>
          <span style={{fontSize:11.5,fontWeight:700,color:can('createAdmin')?'#fff':T.textMuted,
            background:can('createAdmin')?'#D0021B':T.bg3,border:`1px solid ${T.border}`,borderRadius:9,padding:'9px 16px'}}>
            {can('createAdmin')?'✏️ Edit rules':'🔒 Edit — Master/Super only'}</span>
        </div>
      </div>
    );

    if (view === 'storage') return (
      <div>
        <SecH>S3 bucket · localaitv-content-mumbai</SecH>
        <div style={{...cardS,fontFamily:"'Barlow Condensed',monospace",fontSize:11.5,color:T.text,lineHeight:1.7}}>
          ai-processed/<br/>&nbsp;&nbsp;state/district/constituency/<br/>&nbsp;&nbsp;&nbsp;&nbsp;category/content_id/final_video.mp4<br/>
          ai-processed-bulletins/state/district/constituency/bul_TS/
        </div>
        <SecH>Lifecycle tiering (auto · 50–75% cost saving)</SecH>
        {[['0–30 days','S3 Standard','#10B981'],['30–90 days','Standard-IA','#3B82F6'],['90–180 days','Glacier IR','#8B5CF6'],['180+ days','Deep Archive','#6B7280']].map((t,i)=>(
          <div key={i} style={{...cardS,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:12.5,color:T.text}}>{t[0]}</span><Chip txt={t[1]} c={t[2]} />
          </div>
        ))}
        <div style={{...cardS,background:T.bg3,fontSize:11.5,color:T.textMuted,lineHeight:1.6}}>
          DB tracks logical state (active/archived/expired); S3 lifecycle handles physical tiering. Cloudflare CDN sits in front of S3 (mandatory at scale to avoid egress cost).
        </div>
      </div>
    );

    if (view === 'audit') {
      const log = [
        ['Koneti M.R.','Force-released slot 22:50','Khammam TV','2m ago'],
        ['Ravi Kumar','Approved content','News · Kurnool','8m ago'],
        ['Lakshmi Devi','Rejected (low quality)','Vehicle · Warangal','19m ago'],
        ['Priya Senior','Created Admin "Karthik N"','Karnataka','1h ago'],
        ['System','callback_lost → reconciled','content_5e2…','2h ago'],
      ];
      const shown = role==='admin' ? log.filter(l=>l[0]==='Ravi Kumar') : role==='master' ? log.filter(l=>l[0]!=='Koneti M.R.') : log;
      return (
        <div>
          <div style={{...cardS,background:T.bg3,fontSize:11.5,color:T.textMuted}}>Scope: <b style={{color:T.text}}>{auditScope}</b></div>
          {shown.map((l,i)=>(
            <div key={i} style={cardS}>
              <div style={{fontSize:12.5,fontWeight:700,color:T.text}}>{l[0]} <span style={{color:T.textMuted,fontWeight:400}}>· {l[3]}</span></div>
              <div style={{fontSize:12,color:T.textMuted}}>{l[1]} — {l[2]}</div>
            </div>
          ))}
          {shown.length===0 && <div style={{textAlign:'center',color:T.textMuted,fontSize:12,padding:'30px 0'}}>No entries in your scope.</div>}
        </div>
      );
    }

    if (view === 'notify') return <NotifyHub/>;

    if (view === 'forms') return <FormsHub/>;

    if (view === 'security') return (
      <div>
        <SecH>Secrets</SecH>
        {[['WEBHOOK_HMAC_SECRET','Active · rotated 12 days ago','#10B981'],
          ['ADMIN_CALLBACK_TOKEN','Active · rotated 12 days ago','#10B981'],
          ['Next rotation','24h dual-accept grace · 48h notice','#3B82F6']].map((s,i)=>(
          <div key={i} style={{...cardS,display:'flex',justifyContent:'space-between',gap:8}}>
            <div><div style={{fontSize:12.5,fontWeight:700,color:T.text}}>{s[0]}</div></div>
            <span style={{fontSize:11,color:s[2],fontWeight:700,textAlign:'right'}}>{s[1]}</span>
          </div>
        ))}
        <SecH>Controls</SecH>
        <div style={{...cardS,fontSize:12,color:T.textMuted,lineHeight:1.7}}>
          HMAC-SHA256 signing (raw body) · idempotency keys · Row Level Security ·
          Cloudflare Turnstile + WAF · secret exchange via 1Password (never email/Slack/git).
        </div>
        <div style={{textAlign:'center'}}>
          <span style={{fontSize:11.5,fontWeight:700,color:'#fff',background:'#D0021B',borderRadius:9,padding:'9px 16px'}}>🔁 Rotate secret (runbook)</span>
        </div>
      </div>
    );

    if (view === 'infra') return (
      <div>
        <SecH>Architecture</SecH>
        <div style={{...cardS,fontSize:12,color:T.text,lineHeight:1.8}}>
          📱 App → 🛡️ Cloudflare → 🖥️ Hostinger VPS (Admin API)<br/>
          ⚙️ AWS EC2 g4dn.xlarge (T4 GPU, ap-south-1) — AI pipeline<br/>
          🗄️ AWS S3 (Mumbai) + Cloudflare CDN · 🐘 Supabase Postgres
        </div>
        <SecH>Cost projection (peak scale)</SecH>
        <div style={{...cardS,padding:0,overflow:'hidden'}}>
          <KV k="Without CDN (do NOT)" v="₹5–10 Cr/mo egress" vc="#EF4444"/>
          <KV k="With Cloudflare CDN" v="≈ ₹18–24 L/mo" vc="#10B981"/>
          <KV k="Per-video lifetime" v="≈ ₹0.42" vc={T.text}/>
          <div style={{padding:'7px 0'}}/>
        </div>
        <SecH>Stack</SecH>
        <div style={{...cardS,fontSize:11.5,color:T.textMuted,lineHeight:1.7}}>
          FastAPI · Celery · RabbitMQ · Redis · Gemini Flash · Google TTS · FFmpeg/NVENC ·
          Sarvam/OpenAI fallback · pg_boss · pg_cron · Sentry · PostHog · OpenTelemetry
        </div>
      </div>
    );

    if (view === 'roadmap') {
      const ph = [
        ['Phase 0','URGENT · this week','Fix 15min → 90sec bottleneck. EC2 g4dn.xlarge + NVENC. Lift-and-shift, zero logic change.','#EF4444'],
        ['Phase 1','Week 1–4','Admin Dashboard + webhook adapter + 300-channel infra. Staging first.','#F59E0B'],
        ['Phase 2','Month 1–3','Scale to 1,000 channels.','#3B82F6'],
        ['Phase 3','Month 3–6','Pan-India 3,000 channels.','#8B5CF6'],
        ['Phase 4','Month 6+','Optimization.','#10B981'],
      ];
      return (
        <div>
          {ph.map((p,i)=>(
            <div key={i} style={{...cardS,borderLeft:`4px solid ${p[3]}`}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontWeight:800,fontSize:14,color:T.text}}>{p[0]}</span>
                <span style={{fontSize:11,color:p[3],fontWeight:700}}>{p[1]}</span>
              </div>
              <div style={{fontSize:12,color:T.textMuted,lineHeight:1.5}}>{p[2]}</div>
            </div>
          ))}
          <SecH>Sign-off</SecH>
          <div style={{...cardS,padding:0,overflow:'hidden'}}>
            <KV k="Founder approval" v="✅ Plan v1.3" vc="#10B981"/>
            <KV k="AI team (Sameer/Gnana/Gyan)" v="In progress" vc="#F59E0B"/>
            <KV k="Open item" v="Schedule-table write API" vc="#3B82F6"/>
            <div style={{padding:'6px 0'}}/>
          </div>
        </div>
      );
    }

    return null;
  }

  // ══ HOME GRID ══════════════════════════════════════════════════════
  const Home = (
    <div>
      {/* Role badge — only the logged-in user's own tier is shown (no switching). */}
      <div style={{display:'flex',marginBottom:12,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:12,padding:5}}>
        <div style={{
          flex:1, textAlign:'center', borderRadius:9, padding:'9px 4px',
          fontFamily:"'Barlow',sans-serif", fontWeight:800, fontSize:12,
          background:'linear-gradient(135deg,#E8001E,#D0021B)', color:'#fff',
        }}>{R.label}</div>
      </div>
      <div style={{...cardS,background:'rgba(208,2,27,0.08)',borderColor:'rgba(208,2,27,0.3)',marginBottom:14}}>
        <div style={{fontSize:12.5,color:T.text,fontWeight:700}}>{R.scope}</div>
      </div>

      {/* KPI grid — "Pending Review" tile opens the Moderation Queue */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:6}}>
        {KPI.map((k,i)=>{
          const isPending = k.label === 'Pending Review';
          const onClick = isPending ? ()=>setView('moderation') : undefined;
          return (
            <div key={i} onClick={onClick} style={{
              background:T.bg2,
              border:`1px solid ${isPending?'rgba(245,158,11,0.55)':T.border}`,
              borderRadius:12,padding:'11px 8px',textAlign:'center',
              cursor:isPending?'pointer':'default',position:'relative',
            }}>
              {isPending && <span style={{position:'absolute',top:5,right:7,fontSize:12,color:'#F59E0B',fontWeight:700}}>›</span>}
              <div style={{fontSize:17,marginBottom:2}}>{k.icon}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900,color:k.c,lineHeight:1.1}}>{k.value}</div>
              <div style={{fontSize:9.5,color:T.textMuted,fontWeight:700,textTransform:'uppercase',letterSpacing:0.3,marginTop:2}}>{k.label}</div>
            </div>
          );
        })}
      </div>

      {can('allIndiaAnalytics') && (<>
        <SecH>Content Analytics · tap a metric to drill down</SecH>
        <PeriodBar/>
        <MetricTiles onPick={(mk)=>pushDrill({type:'metric',metric:mk})}/>
      </>)}

      <SecH>Modules</SecH>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {MODULES.map(m => {
          const locked = m.need && !can(m.need);
          return (
            <button key={m.key} onClick={()=>setView(m.key)} style={{
              textAlign:'left', cursor:'pointer',
              background:T.bg2, border:`1px solid ${locked?'rgba(239,68,68,0.3)':T.border}`,
              borderRadius:13, padding:'13px 12px', position:'relative',
            }}>
              <div style={{fontSize:23,marginBottom:6}}>{m.icon}</div>
              <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:13.5,color:T.text,marginBottom:3}}>
                {m.title}{locked && <span style={{marginLeft:5}}>🔒</span>}
              </div>
              <div style={{fontSize:10.5,color:T.textMuted,lineHeight:1.4}}>{m.sub}</div>
            </button>
          );
        })}
      </div>
      <div style={{textAlign:'center',fontSize:11,color:T.textMuted,margin:'16px 0 4px',lineHeight:1.6}}>
        Signed in as <b style={{color:T.text}}>{R.label}</b>.
      </div>
    </div>
  );

  const title = drill.length ? drillTitle()
    : view === 'home' ? 'Admin Dashboard' : (MODULES.find(m=>m.key===view)||{}).title;
  const goBack = () => {
    if (drill.length) setDrill(d => d.slice(0,-1));
    else if (view !== 'home') setView('home');
    else onBack();
  };

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#1A237E 0%,#3949AB 100%)',padding:'52px 16px 18px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <button onClick={goBack} style={{
          width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.18)',border:'none',
          color:'#fff',fontSize:18,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
        }}>←</button>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:18,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.8)'}}>🛡️ {R.label}{(view==='home'&&!drill.length)?' · demo':''}</div>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={(e)=>{
          if (view !== 'moderation' || drill.length) return;
          const el = e.currentTarget;
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 240) loadMoreReports();
        }}
        style={{flex:1,overflowY:'auto',padding:'14px 14px 40px'}}>
        {drill.length ? <DrillScreen/> : (view === 'home' ? Home : ModuleBody())}
      </div>
    </div>
  );
}

export { AdminDashboardScreen };
export default AdminDashboardScreen;
