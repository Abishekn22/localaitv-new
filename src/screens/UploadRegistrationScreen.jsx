import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import RegRow from './../components/RegRow.jsx';
import { LocationPin } from './../components/atoms.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getLocationIdFromName } from '../data/regions.js';

// Dev bypass — this number skips OTP and signs in directly via auth-by-phone.
// Remove before production.
const TEST_PHONE = '9876543211';

// Resolve a constituency English name → numeric backend locations.id. The
// constituency list uses a few "City"/"Urban"/… suffixed names that don't have
// an exact row in channels.js (e.g. "Kakinada City" vs "Kakinada"), so retry
// with the suffix stripped before giving up.
function resolveLocationId(en, st) {
  if (!en) return null;
  let id = getLocationIdFromName(en, st);
  if (id == null) id = getLocationIdFromName(en.replace(/ (City|Urban|Rural|East|West)$/i, ''), st);
  return id;
}

function UploadRegistrationScreen({ onNavigate, userProfile, userConstituency, userState, onSubmitDone }) {
  const { T } = useAppTheme();
  const { setSession } = useAuth();

  // 1 = Verify Mobile (OTP) · 2 = Your Profile (name + constituency)
  const [step, setStep] = useState(1);

  // ── Step 1 state — mobile + OTP ──
  const [mobile, setMobile] = useState(userProfile?.mobile || '');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState('');
  const [phoneMsgType, setPhoneMsgType] = useState('');      // new | existing | checking | error
  const [otpMsg, setOtpMsg] = useState('');
  const [otpMsgType, setOtpMsgType] = useState('');          // available | checking | error

  // ── Step 2 state — profile ──
  const [name, setName] = useState(userProfile?.name || '');
  // No location is auto-selected — the user must explicitly pick one.
  const [state, setState] = useState('');
  const [constituency, setConstituency] = useState('');
  const [search, setSearch] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(userProfile?.photo || null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState(userProfile?.profile_photo || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  // KYC video step is skipped per spec — a static path is sent on register.
  const STATIC_KYC_VIDEO_PATH = '/uploads/kyc/static-kyc-video.mp4';

  const validMobile = /^[6-9]\d{9}$/.test(mobile);

  // ── API helpers — single /api (API_BASE already ends in /api) ──
  const checkRegistered = async (phoneNumber) => {
    const response = await fetch(`${API_BASE}/auth/check-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ phone: phoneNumber.trim() }),
      credentials: 'include',
    });
    const data = await response.json().catch(() => null);
    return !!(response.ok && data && data.registered === true);
  };

  const sendOtpApi = async (phoneNumber, otpCode) => {
    try {
      const response = await fetch(`${API_BASE}/auth/send-otp-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim(), otp: otpCode }),
        credentials: 'include',
      });
      if (!response.ok) return { ok: false, message: `Failed to send OTP (${response.status})` };
      return { ok: true };
    } catch (e) {
      return { ok: false, message: 'Network error while sending OTP. Please try again.' };
    }
  };

  const authByPhoneApi = async (phoneNumber) => {
    try {
      const response = await fetch(`${API_BASE}/auth/auth-by-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim() }),
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.token) return { ok: true, token: data.token, user: data.user };
      return { ok: false, message: (data && data.message) || 'Sign-in failed.' };
    } catch (e) {
      return { ok: false, message: 'Network error during sign-in.' };
    }
  };

  const uploadPhotoApi = async (file) => {
    try {
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('purpose', 'registration');
      const response = await fetch(`${API_BASE}/kyc/upload-photo`, {
        method: 'POST',
        body: fd,                       // FormData → never set Content-Type
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      // Accept whatever shape the backend uses for the stored path.
      const path = data && (
        (data.data && (data.data.path || data.data.url || data.data.file_url)) ||
        data.path || data.url || data.file_url || data.profile_photo
      );
      if (response.ok && path) {
        return { ok: true, path, url: (data && (data.url || (data.data && data.data.url))) || '' };
      }
      return { ok: false, message: (data && data.message) || 'Photo upload failed' };
    } catch (e) {
      return { ok: false, message: 'Network error while uploading photo.' };
    }
  };

  const registerApi = async (payload) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.token) {
        return { ok: true, token: data.token, user: data.user };
      }
      return { ok: false, message: (data && data.message) || 'Registration failed' };
    } catch (e) {
      return { ok: false, message: 'Network error during registration.' };
    }
  };

  // Debounced phone lookup — informational only (a registered number signs in,
  // a new number registers; neither blocks the OTP step).
  useEffect(() => {
    if (!validMobile) { setPhoneMsg(''); setPhoneMsgType(''); return; }
    setPhoneMsg('Checking…');
    setPhoneMsgType('checking');
    setPhoneChecking(true);
    const timer = setTimeout(async () => {
      try {
        const registered = await checkRegistered(mobile);
        setPhoneMsg(registered
          ? 'Existing account — verify OTP to sign in.'
          : 'New number — verify OTP to register.');
        setPhoneMsgType(registered ? 'existing' : 'new');
      } catch {
        setPhoneMsg('Could not verify number. You can still continue.');
        setPhoneMsgType('error');
      } finally {
        setPhoneChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [mobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resend cooldown countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  // Best-effort SMS OTP autofill (Chrome / Android). Silently ignored elsewhere.
  useEffect(() => {
    if (!otpSent) return;
    if (typeof window === 'undefined' || !('OTPCredential' in window)) return;
    const ac = new AbortController();
    navigator.credentials.get({ otp: { transport: ['sms'] }, signal: ac.signal })
      .then(c => { if (c && c.code) setOtp(String(c.code).replace(/\D/g, '').slice(0, 4)); })
      .catch(() => {});
    return () => ac.abort();
  }, [otpSent]);

  function loginAndExit(res) {
    setSession({ token: res.token, user: res.user });
    onSubmitDone({ name: res.user?.name || name || '', mobile, token: res.token, user: res.user });
  }

  async function handleSendOtp() {
    setOtpMsg(''); setOtpMsgType('');
    if (!validMobile) { setOtpMsg('Enter a valid 10-digit mobile number.'); setOtpMsgType('error'); return; }

    // Dev bypass — skip OTP entirely.
    if (mobile === TEST_PHONE) {
      setOtpSending(true);
      const res = await authByPhoneApi(mobile);
      setOtpSending(false);
      if (res.ok) loginAndExit(res);
      else { setOtpMsg(res.message); setOtpMsgType('error'); }
      return;
    }

    const newOtp = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit
    setOtpSending(true);
    setOtpMsg('Sending OTP…');
    setOtpMsgType('checking');
    const result = await sendOtpApi(mobile, newOtp);
    setOtpSending(false);
    if (result.ok) {
      setGeneratedOtp(newOtp);
      setOtp('');
      setOtpSent(true);
      setResendIn(30);
      setOtpMsg(`OTP sent to +91 ${mobile}.`);
      setOtpMsgType('available');
    } else {
      setOtpMsg(result.message || 'Failed to send OTP.');
      setOtpMsgType('error');
    }
  }

  async function handleVerifyOtp() {
    setOtpMsg(''); setOtpMsgType('');
    if (mobile === TEST_PHONE) return handleSendOtp();
    if (!otp || otp.length < 4 || otp !== generatedOtp) {
      setOtpMsg('OTP does not match. Please re-check or resend.');
      setOtpMsgType('error');
      return;
    }
    setVerifying(true);
    let registered = false;
    try { registered = await checkRegistered(mobile); } catch { registered = false; }
    if (registered) {
      // Existing user → sign in, skip the profile step.
      const res = await authByPhoneApi(mobile);
      setVerifying(false);
      if (!res.ok) { setOtpMsg(res.message); setOtpMsgType('error'); return; }
      loginAndExit(res);
      return;
    }
    // New user → collect profile.
    setVerifying(false);
    setStep(2);
  }

  async function handleSubmitProfile() {
    if (submitting) return;
    if (!name.trim()) { setSubmitMsg('Please enter your name.'); return; }
    if (!constituency) { setSubmitMsg('Please select your constituency.'); return; }
    setSubmitting(true);
    setSubmitMsg('');

    // 1) Upload profile photo if a new file was chosen.
    let profilePhotoPath = uploadedPhotoPath;
    if (photo) {
      setSubmitMsg('Uploading profile photo…');
      const up = await uploadPhotoApi(photo);
      if (!up.ok) { setSubmitting(false); setSubmitMsg(up.message || 'Photo upload failed.'); return; }
      profilePhotoPath = up.path;
      setUploadedPhotoPath(up.path);
    }

    // 2) Register.
    setSubmitMsg('Submitting registration…');
    const payload = {
      name: name.trim(),
      phone: mobile.trim(),
      location_id: resolveLocationId(constituency, state),
      kyc_video: STATIC_KYC_VIDEO_PATH,
      profile_photo: profilePhotoPath,
    };
    const reg = await registerApi(payload);
    setSubmitting(false);
    if (!reg.ok) { setSubmitMsg(reg.message || 'Registration failed.'); return; }
    // Merge the uploaded photo path into the stored user so the profile shows it
    // even if the register response doesn't echo profile_photo back.
    const mergedUser = {
      ...(reg.user || {}),
      ...(profilePhotoPath ? { profile_photo: (reg.user && (reg.user.profile_photo || reg.user.profile_picture)) || profilePhotoPath } : {}),
    };
    setSession({ token: reg.token, user: mergedUser });
    setSubmitMsg('');
    onSubmitDone({
      state, constituency, name, mobile, photo,
      profile_photo: profilePhotoPath, token: reg.token, user: mergedUser,
    });
  }

  // ── Step 2 constituency list (LIVE on top, then Launching soon) ──
  // The LIVE section is sourced from LIVE_CHANNELS — the exact set already
  // streaming on the home page (both AP + TG) — so it always matches what's
  // live there, regardless of the constituency list's own flags. With no state
  // chosen, all live channels (both states) are shown; the toggle narrows them.
  const liveIds = useMemo(
    () => new Set(LIVE_CHANNELS.map(c => getLocationIdFromName(c.nameEn, c.state)).filter(x => x != null)),
    []
  );
  const liveAll = useMemo(
    () => LIVE_CHANNELS.map(c => ({ te: c.name, en: c.nameEn, live: true, state: c.state })),
    []
  );
  // Launching-soon = id-mapped constituencies (minus the live ones), per state.
  const buildRest = (src, st) => src
    .map(c => ({ te: c.te, en: c.en, live: false, state: st, id: resolveLocationId(c.en, st) }))
    .filter(c => c.id != null && !liveIds.has(c.id));
  const restAP = useMemo(() => buildRest(AP_CONSTITUENCIES, 'AP'), [liveIds]);
  const restTG = useMemo(() => buildRest(TG_CONSTITUENCIES, 'TG'), [liveIds]);

  // Selecting a location also reflects its state in the toggle.
  const selectLocation = (c) => {
    setConstituency(c.en);
    if (c.state) setState(c.state);
    setSearch('');
  };

  const q = search.trim().toLowerCase();
  const matchesSearch = (c) => c.en.toLowerCase().includes(q) || (c.te && c.te.includes(search.trim()));

  const liveSource = state ? liveAll.filter(c => c.state === state) : liveAll;
  const otherSource = state === 'AP' ? restAP
    : state === 'TG' ? restTG
    : [...restAP, ...restTG];
  const liveItems = q ? liveSource.filter(matchesSearch) : liveSource;
  const otherItems = (q ? otherSource.filter(matchesSearch) : otherSource)
    .slice().sort((a, b) => a.en.localeCompare(b.en));
  const noMatches = liveItems.length === 0 && otherItems.length === 0;

  const labelStyle = {
    fontSize: 11, color: T.textMuted, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700,
  };

  return (
    <div style={{ width: '100%', height: '100%', background: T.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Header ── */}
      <div style={{ background: T.bg2, padding: '46px 16px 16px', flexShrink: 0 }}>
        {/* Top row: back button + context banner side-by-side (no overlap) */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, marginBottom: 14 }}>
          <button onClick={() => (step === 2 ? setStep(1) : onNavigate('home'))}
            aria-label="Back"
            style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0, alignSelf: 'flex-start',
              background: T.bg3, border: `1px solid ${T.border}`, color: T.text, fontSize: 18,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>←</button>

          {/* Context banner */}
          <div style={{ flex: 1, minWidth: 0, background: 'rgba(208,2,27,0.12)', border: `1px solid rgba(208,2,27,0.3)`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 11, color: T.text, lineHeight: 1.4, flex: 1 }}>
              <strong style={{ color: T.red }}>Registration required.</strong> Only verified citizens can post news on LocalAI TV.
            </span>
          </div>
        </div>

        <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: 1, color: T.text }}>
          {step === 1 ? '📱 Verify Mobile' : '👤 Your Profile'}
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
          {step === 1 ? 'OTP verification is mandatory to upload news' : 'Complete your profile to get started'}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? T.red : 'rgba(150,150,150,0.25)', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 18px 120px' }}>
        {step === 1 ? (
          /* ════ STEP 1 — VERIFY MOBILE ════ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Mobile number */}
            <div>
              <div style={labelStyle}>Mobile Number *</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ background: T.bg3, borderRadius: 10, padding: '12px', fontSize: 14, color: T.textMuted, flexShrink: 0, border: `1px solid ${T.border}` }}>+91</div>
                <input value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit number" type="tel" inputMode="numeric" maxLength={10}
                  style={{ flex: 1, background: T.bg3, borderRadius: 10, padding: '12px', fontSize: 14, color: T.text, border: `1px solid ${T.border}`, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {phoneMsg && (
                <div style={{ marginTop: 8, fontSize: 11, padding: '8px 12px', borderRadius: 8,
                  color: phoneMsgType === 'new' ? '#00C85A' : phoneMsgType === 'existing' ? '#2B7FFF' : phoneMsgType === 'checking' ? T.textMuted : '#D0021B',
                  background: phoneMsgType === 'new' ? 'rgba(0,200,90,0.1)' : phoneMsgType === 'existing' ? 'rgba(43,127,255,0.1)' : phoneMsgType === 'checking' ? 'rgba(150,150,150,0.08)' : 'rgba(208,2,27,0.1)',
                  border: `1px solid ${phoneMsgType === 'new' ? 'rgba(0,200,90,0.3)' : phoneMsgType === 'existing' ? 'rgba(43,127,255,0.3)' : phoneMsgType === 'checking' ? 'rgba(150,150,150,0.15)' : 'rgba(208,2,27,0.33)'}` }}>
                  {phoneMsg}
                </div>
              )}
            </div>

            {!otpSent ? (
              <button onClick={handleSendOtp}
                disabled={otpSending || phoneChecking || !validMobile}
                style={{
                  background: (otpSending || phoneChecking || !validMobile) ? T.gray3 : `linear-gradient(135deg,${T.red},#9A0015)`,
                  color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
                  fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: 2,
                  cursor: (otpSending || phoneChecking || !validMobile) ? 'not-allowed' : 'pointer',
                  opacity: (otpSending || phoneChecking || !validMobile) ? 0.6 : 1,
                  boxShadow: (otpSending || phoneChecking || !validMobile) ? 'none' : `0 6px 20px ${T.red}44`,
                }}>
                {otpSending ? 'SENDING…' : 'SEND OTP'}
              </button>
            ) : (
              <>
                {/* OTP field + Auto-detect badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ ...labelStyle, marginBottom: 0 }}>Enter OTP *</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#00C85A', background: 'rgba(0,200,90,0.12)', border: '1px solid rgba(0,200,90,0.3)', borderRadius: 20, padding: '3px 9px' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C85A' }} />
                      Auto-detect
                    </span>
                  </div>
                  <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="• • • •" type="tel" inputMode="numeric" maxLength={4}
                    autoComplete="one-time-code"
                    style={{ width: '100%', background: T.bg3, borderRadius: 10, padding: '14px', fontSize: 22, color: T.text, border: `1px solid ${T.red}55`, letterSpacing: 12, textAlign: 'center', outline: 'none', boxSizing: 'border-box', fontWeight: 700 }} />
                </div>

                <button onClick={handleVerifyOtp} disabled={verifying}
                  style={{
                    background: verifying ? T.gray3 : `linear-gradient(135deg,${T.green},#009940)`,
                    color: '#fff', border: 'none', borderRadius: 12, padding: '14px',
                    fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: 2,
                    cursor: verifying ? 'not-allowed' : 'pointer',
                    boxShadow: verifying ? 'none' : `0 6px 20px ${T.green}44`,
                  }}>
                  {verifying ? 'VERIFYING…' : '✅ VERIFY OTP'}
                </button>

                {/* Resend countdown */}
                <div style={{ textAlign: 'center', fontSize: 12, color: T.textMuted }}>
                  {resendIn > 0
                    ? `Resend OTP in ${resendIn}s`
                    : <span onClick={handleSendOtp} style={{ color: T.red, fontWeight: 700, cursor: 'pointer' }}>Resend OTP</span>}
                </div>

                {otpMsg && (
                  <div style={{ fontSize: 11, padding: '8px 12px', borderRadius: 8,
                    color: otpMsgType === 'available' ? '#00C85A' : otpMsgType === 'checking' ? T.textMuted : '#D0021B',
                    background: otpMsgType === 'available' ? 'rgba(0,200,90,0.1)' : otpMsgType === 'checking' ? 'rgba(150,150,150,0.08)' : 'rgba(208,2,27,0.1)',
                    border: `1px solid ${otpMsgType === 'available' ? 'rgba(0,200,90,0.3)' : otpMsgType === 'checking' ? 'rgba(150,150,150,0.15)' : 'rgba(208,2,27,0.33)'}` }}>
                    {otpMsg}
                  </div>
                )}
              </>
            )}

            {/* Aadhaar note */}
            <div style={{ background: 'rgba(255,184,0,0.08)', borderRadius: 10, padding: '12px', border: `1px solid rgba(255,184,0,0.2)` }}>
              <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginBottom: 4 }}>💡 Aadhaar Verification (Optional)</div>
              <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
                Verify with Aadhaar to get +20 trust score and Gold reporter badge. Available after OTP verification.
              </div>
            </div>
          </div>
        ) : (
          /* ════ STEP 2 — YOUR PROFILE ════ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full name */}
            <div>
              <div style={labelStyle}>Full Name *</div>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="As per Aadhaar card"
                style={{ width: '100%', background: T.bg3, borderRadius: 10, padding: '12px', fontSize: 14, color: T.text, border: `1px solid ${T.border}`, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Profile photo */}
            <div>
              <div style={labelStyle}>Profile Photo (Optional)</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: T.bg3, border: `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28, color: T.textMuted }}>👤</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setShowCamera(true)}
                    style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', border: 'none', background: 'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)', boxShadow: '0 2px 10px rgba(208,2,27,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span style={{ fontSize: 12, color: 'white', fontWeight: 800 }}>Photo</span>
                  </button>
                  <button type="button" onClick={() => document.getElementById('reg-photo-lib')?.click()}
                    style={{ flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${T.red}`, background: T.isDark ? T.bg3 : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span style={{ fontSize: 12, color: T.red, fontWeight: 800 }}>Library</span>
                  </button>
                </div>
              </div>
              <input id="reg-photo-camera" type="file" accept="image/*" capture="user" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (!f) return; setPhoto(f); setPhotoPreview(URL.createObjectURL(f)); }} />
              <input id="reg-photo-lib" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (!f) return; setPhoto(f); setPhotoPreview(URL.createObjectURL(f)); }} />
            </div>

            {/* State */}
            <div>
              <div style={labelStyle}>State *</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['AP', 'TG'].map(s => (
                  <button key={s} onClick={() => { setState(s); setConstituency(''); setSearch(''); }}
                    style={{ flex: 1, background: state === s ? 'rgba(208,2,27,0.15)' : T.bg3, border: `1px solid ${state === s ? T.red : T.border}`, borderRadius: 10, padding: '12px', color: state === s ? T.red : T.text, fontWeight: 700, cursor: 'pointer' }}>
                    {s === 'AP' ? 'Andhra Pradesh' : 'Telangana'}
                  </button>
                ))}
              </div>
            </div>

            {/* Constituency */}
            <div>
              <div style={labelStyle}>
                Your Constituency * <span style={{ color: T.red, fontSize: 9, textTransform: 'none', letterSpacing: 0 }}>(You can only upload news to this constituency)</span>
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search (Telugu or English)…"
                style={{ width: '100%', background: T.bg3, borderRadius: 10, padding: '10px 12px', fontSize: 13, color: T.text, border: `1px solid ${T.border}`, marginBottom: 6, outline: 'none', boxSizing: 'border-box' }} />

              {constituency && (() => {
                const sel = liveAll.find(c => c.en === constituency)
                  || restAP.find(c => c.en === constituency)
                  || restTG.find(c => c.en === constituency);
                return (
                  <div style={{ background: 'rgba(208,2,27,0.15)', borderRadius: 8, padding: '10px 12px', border: `1px solid ${T.red}44`, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: T.red, fontSize: 14 }}>✓</span>
                    <div style={{ flex: 1 }}>
                      {sel && <div style={{ fontFamily: "'Noto Sans Telugu',sans-serif", fontSize: 15, color: T.red, fontWeight: 700, lineHeight: 1.6 }}>{sel.te}</div>}
                      <div style={{ fontSize: 11, color: T.red, opacity: 0.85 }}>{constituency}</div>
                    </div>
                    {sel && sel.live && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,200,90,0.15)', borderRadius: 5, padding: '2px 6px' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00C85A', animation: 'blink 1s infinite' }} />
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, fontSize: 9, color: '#00C85A', letterSpacing: 0.5 }}>LIVE</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div style={{ maxHeight: 220, overflowY: 'auto', background: T.bg3, borderRadius: 10, border: `1px solid ${T.border}` }}>
                {liveItems.length > 0 && (
                  <>
                    <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,200,90,0.08)', borderBottom: `1px solid rgba(0,200,90,0.15)`, position: 'sticky', top: 0, zIndex: 1 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C85A', animation: 'blink 1s infinite' }} />
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 10, color: '#00C85A', letterSpacing: 1.2 }}>LIVE CHANNELS · {liveItems.length}</span>
                    </div>
                    {liveItems.map(c => (
                      <RegRow key={'live-' + c.en} c={c} constituency={constituency} setConst={setConstituency} setSearch={setSearch} isLive={true} onSelect={selectLocation} />
                    ))}
                  </>
                )}
                {otherItems.length > 0 && (
                  <>
                    <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, background: T.bg3, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, zIndex: 1 }}>
                      <span style={{ fontSize: 10 }}>🚀</span>
                      <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 10, color: T.textMuted, letterSpacing: 1.2 }}>LAUNCHING SOON · {otherItems.length}</span>
                    </div>
                    {otherItems.map(c => (
                      <RegRow key={c.state + '-' + c.en} c={c} constituency={constituency} setConst={setConstituency} setSearch={setSearch} isLive={false} onSelect={selectLocation} />
                    ))}
                  </>
                )}
                {noMatches && (
                  <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 12, color: T.textMuted }}>
                    No matches for "{search}"
                  </div>
                )}
              </div>
            </div>

            {submitMsg && (
              <div style={{ fontSize: 12, color: submitting ? T.textMuted : '#D0021B', background: submitting ? 'rgba(150,150,150,0.08)' : 'rgba(208,2,27,0.1)', borderRadius: 10, padding: '10px 14px', border: `1px solid ${submitting ? 'rgba(150,150,150,0.15)' : 'rgba(208,2,27,0.33)'}` }}>
                {submitMsg}
              </div>
            )}

            <button onClick={handleSubmitProfile} disabled={submitting}
              style={{
                background: submitting ? T.gray3 : `linear-gradient(135deg,${T.red},#9A0015)`,
                color: 'white', border: 'none', borderRadius: 12, padding: '15px',
                fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: 2,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: submitting ? 'none' : `0 8px 24px ${T.red}44`,
                opacity: submitting ? 0.7 : 1, marginTop: 4,
              }}>
              {submitting ? 'SUBMITTING…' : '🚀 START REPORTING'}
            </button>
          </div>
        )}
      </div>

      {showCamera && (
        <CameraCaptureModal
          onClose={() => setShowCamera(false)}
          onCapture={(file) => { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); setShowCamera(false); }}
          onFallback={() => { setShowCamera(false); document.getElementById('reg-photo-camera')?.click(); }}
        />
      )}

      <BottomNav active="upload" onChange={onNavigate} />
    </div>
  );
}

// ── Live-camera capture modal (front camera) ──────────────────
// Opened by the "Photo" button. Uses getUserMedia so the real camera
// opens on desktop AND mobile — the HTML `capture` attribute is ignored
// by desktop browsers, so a file input alone can't open a webcam there.
// On error / denied permission it falls back to the #reg-photo-camera
// file input (native camera on mobile, file picker on desktop).
function CameraCaptureModal({ onClose, onCapture, onFallback }) {
  const { T } = useAppTheme();
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera is not available in this browser.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (e) {
        setError(e && e.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow access, or pick a photo from your files.'
          : 'Could not open the camera. Pick a photo from your files instead.');
      }
    }
    start();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  function stopStream() {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  }

  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth  || 720;
    const h = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    // Mirror so the saved image matches the mirrored selfie preview.
    ctx.translate(w, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stopStream();
      onCapture(file);
    }, 'image/jpeg', 0.9);
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,0.92)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:16}}>
      <button type="button" onClick={()=>{ stopStream(); onClose(); }}
        style={{position:'absolute',top:16,right:16,width:40,height:40,borderRadius:'50%',
          border:'none',background:'rgba(255,255,255,0.15)',color:'white',fontSize:20,
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>

      <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:15,color:'white',marginBottom:14}}>
        ఫోటో తీయండి · Take a Photo
      </div>

      {error ? (
        <div style={{maxWidth:340,textAlign:'center'}}>
          <div style={{fontSize:13,color:'#FFD2D2',background:'rgba(208,2,27,0.18)',
            border:'1px solid rgba(208,2,27,0.4)',borderRadius:12,padding:'14px 16px',lineHeight:1.5,marginBottom:16}}>
            {error}
          </div>
          <button type="button" onClick={()=>{ stopStream(); onFallback(); }}
            style={{background:'linear-gradient(135deg,#E8001E,#B0001A)',color:'white',border:'none',
              borderRadius:12,padding:'12px 20px',fontSize:13,fontWeight:800,cursor:'pointer'}}>
            Choose from Files
          </button>
        </div>
      ) : (
        <>
          <div style={{width:'100%',maxWidth:360,aspectRatio:'3 / 4',borderRadius:16,overflow:'hidden',
            background:'#000',border:'2px solid rgba(255,255,255,0.18)',position:'relative'}}>
            <video ref={videoRef} playsInline muted
              style={{width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}/>
            {!ready && (
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
                color:'rgba(255,255,255,0.7)',fontSize:13}}>Starting camera…</div>
            )}
          </div>
          <div style={{display:'flex',gap:18,marginTop:20,alignItems:'center'}}>
            <button type="button" onClick={()=>{ stopStream(); onFallback(); }}
              style={{background:'rgba(255,255,255,0.12)',color:'white',border:'1px solid rgba(255,255,255,0.25)',
                borderRadius:12,padding:'12px 18px',fontSize:13,fontWeight:700,cursor:'pointer'}}>
              Files
            </button>
            <button type="button" onClick={handleCapture} disabled={!ready}
              aria-label="Capture photo"
              style={{width:68,height:68,borderRadius:'50%',border:'4px solid rgba(255,255,255,0.85)',
                background:ready?'#E8001E':'#888',cursor:ready?'pointer':'not-allowed',
                boxShadow:'0 4px 16px rgba(208,2,27,0.5)'}}/>
          </div>
        </>
      )}
    </div>
  );
}

export { UploadRegistrationScreen };
export default UploadRegistrationScreen;
