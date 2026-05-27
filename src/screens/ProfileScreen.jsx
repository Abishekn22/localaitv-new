import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, useAppTheme, API_BASE } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import { useAuth, getCachedUserVerification } from '../contexts/AuthContext.jsx';
import { getLocationNameFromId } from '../data/regions.js';

// Build a usable image URL from whatever shape the backend returns:
//   • absolute URL  → use as-is
//   • '/api/uploads/…' → strip the leading '/api' (API_BASE already includes it)
//   • '/uploads/…'  → join with API_BASE host
//   • 'uploads/…'   → prepend '/'
function resolveProfilePictureUrl(raw) {
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const host = API_BASE.replace(/\/api\/?$/, '');
  let path = String(raw).trim();
  if (path.startsWith('/api/')) path = path.slice(4); // drop leading '/api'
  if (!path.startsWith('/')) path = '/' + path;
  return host + path;
}

function ProfileScreen({ onNavigate }) {
  const { T } = useAppTheme();
  const { user, token, refreshUser, logout } = useAuth();

  const [bootstrapping, setBootstrapping] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);     // 1 → warning, 2 → phone confirm, 3 → countdown
  const [confirmPhone, setConfirmPhone] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const countdownTimer = useRef(null);

  // On mount: prefer cached verification; only hit /auth/me when nothing is cached.
  useEffect(() => {
    const cached = getCachedUserVerification();
    if (cached?.user) return;            // cache hit → skip API call
    if (!token) return;                  // not logged in → nothing to fetch
    setBootstrapping(true);
    refreshUser().finally(() => setBootstrapping(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown effect for step 3
  useEffect(() => {
    if (deleteStep !== 3) {
      if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
      return;
    }
    setCountdown(30);
    countdownTimer.current = setInterval(() => {
      setCountdown(s => {
        if (s <= 1) {
          if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
    };
  }, [deleteStep]);

  const profilePhotoUrl = useMemo(() => resolveProfilePictureUrl(user?.profile_picture), [user?.profile_picture]);
  const locationLabel = useMemo(() => {
    if (!user) return '';
    if (user.location) {
      // If the backend already returned a string label, use it directly.
      if (typeof user.location === 'string') return user.location;
      if (typeof user.location === 'object' && user.location.name) return user.location.name;
    }
    if (user.location_id != null) return getLocationNameFromId(user.location_id);
    return '';
  }, [user]);

  const memberSince = useMemo(() => {
    const raw = user?.createdAt || user?.created_at;
    if (!raw) return '';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }, [user]);

  const goBackToHamburger = () => {
    if (typeof window !== 'undefined') { try { window.__openHamburgerOnLoad = true; } catch (e) {} }
    onNavigate('home');
  };

  function openDelete() {
    setDeleteError('');
    setConfirmPhone('');
    setDeleteStep(1);
    setDeleteOpen(true);
  }
  function closeDelete() {
    setDeleteOpen(false);
    setDeleteStep(1);
    setConfirmPhone('');
    setDeleteError('');
  }

  async function performDelete() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`${API_BASE}/users/self`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ confirm_phone: user?.phone || '' }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setDeleting(false);
        setDeleteError((data && data.message) || `Account deletion failed (${res.status})`);
        return;
      }
      logout();
      setDeleting(false);
      setDeleteOpen(false);
      onNavigate('home');
    } catch (e) {
      setDeleting(false);
      setDeleteError('Network error. Please try again.');
    }
  }

  if (!user) {
    return (
      <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14,padding:24,textAlign:'center'}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>
          {bootstrapping ? 'Loading profile…' : 'You are not signed in'}
        </div>
        {!bootstrapping && (
          <button onClick={()=>onNavigate('uploadregistration')} style={{
            background:'linear-gradient(135deg,#E8001E,#B0001A)',color:'white',border:'none',
            borderRadius:12,padding:'14px 24px',fontWeight:800,fontSize:14,cursor:'pointer',
          }}>
            Register / Sign in
          </button>
        )}
        <button onClick={()=>onNavigate('home')} style={{background:'transparent',border:'none',color:T.textMuted,cursor:'pointer',fontSize:13}}>
          ← Back to home
        </button>
      </div>
    );
  }

  const fields = [
    { icon:'👤', label:'Name / పేరు',      val: user.name || '—' },
    { icon:'✉️', label:'Email',             val: user.email || '—' },
    { icon:'📞', label:'Mobile / మొబైల్',   val: user.phone || '—' },
    { icon:'📍', label:'Location',          val: locationLabel || '—' },
    { icon:'🎭', label:'Role',              val: user.role || '—' },
    ...(memberSince ? [{ icon:'📅', label:'Member since', val: memberSince }] : []),
  ];

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#E8001E 0%,#D0021B 100%)',
        padding:'52px 18px 24px', textAlign:'center', flexShrink:0, position:'relative',
      }}>
        <button onClick={goBackToHamburger}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.background='rgba(0,0,0,0.4)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.background='rgba(0,0,0,0.25)';}}
          style={{
            position:'absolute', top:48, left:14,
            width:38, height:38, borderRadius:'50%',
            background:'rgba(0,0,0,0.25)', border:'1.5px solid rgba(255,255,255,0.30)',
            color:'#FFFFFF', fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)',
          }}>←</button>

        <div style={{
          width:90, height:90, borderRadius:'50%',
          background:'#FFFFFF',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 12px',
          boxShadow:'0 4px 16px rgba(0,0,0,0.2)',
          overflow:'hidden', position:'relative',
        }}>
          {profilePhotoUrl ? (
            <img src={profilePhotoUrl} alt={user.name || 'profile'} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          ) : (
            <svg width={62} height={62} viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="22" r="10" fill="#D0021B"/>
              <path d="M12 56c0-11 9-18 20-18s20 7 20 18v4H12v-4z" fill="#D0021B"/>
              <path d="M25 38l7 7 7-7-2-2c-1.5 1.5-3 2.5-5 2.5s-3.5-1-5-2.5l-2 2z" fill="#FFFFFF"/>
              <path d="M30 45l2-2 2 2-0.6 5-1.4 8-1.4-8z" fill="#1A237E"/>
              <path d="M30.5 45l1.5-1.5 1.5 1.5-1.5 1.5z" fill="#0D47A1"/>
            </svg>
          )}
          {user.is_verified && (
            <div title="Verified" style={{
              position:'absolute', right:-2, bottom:-2,
              width:24, height:24, borderRadius:'50%',
              background:'#1E88E5', border:'2px solid white',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, color:'white', fontWeight:900,
            }}>✓</div>
          )}
        </div>
        <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:20,color:'#FFFFFF',marginBottom:4}}>
          {user.name || 'Unnamed user'}
        </div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.85)'}}>
          {locationLabel ? `📍 ${locationLabel}` : ''}
        </div>
      </div>

      {/* Field list */}
      <div style={{flex:1,overflowY:'auto',padding:'18px 18px 120px'}}>
        {fields.map((f,i) => (
          <div key={i} style={{
            background: T.bg2, border:`1px solid ${T.border}`,
            borderRadius:12, padding:'12px 14px', marginBottom:10,
          }}>
            <div style={{
              fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700,
              color:T.textMuted, letterSpacing:1, textTransform:'uppercase', marginBottom:4,
              display:'flex', alignItems:'center', gap:5,
            }}>
              <span style={{fontSize:13}}>{f.icon}</span>{f.label}
            </div>
            <div style={{
              fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
              fontSize:15, fontWeight:600, color:T.text, wordBreak:'break-word',
            }}>{f.val}</div>
          </div>
        ))}

        {/* Edit Profile */}
        <button onClick={()=>onNavigate('uploadregistration')} style={{
          width:'100%', marginTop:8,
          background:'linear-gradient(135deg,#E8001E,#D0021B)',
          color:'#FFFFFF', border:'none', borderRadius:12, padding:'14px',
          fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:15,
          cursor:'pointer', boxShadow:'0 4px 14px rgba(208,2,27,0.35)',
        }}>
          ✏️ Edit Profile
        </button>

        {/* Sign out */}
        <button onClick={()=>{ logout(); onNavigate('home'); }} style={{
          width:'100%', marginTop:10,
          background:'transparent', color:T.text,
          border:`1.5px solid ${T.border}`, borderRadius:12, padding:'13px',
          fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer',
        }}>
          🔒 Sign out
        </button>

        {/* Delete account */}
        <button onClick={openDelete} style={{
          width:'100%', marginTop:10,
          background:'transparent', color:'#D0021B',
          border:`1.5px solid #D0021B`, borderRadius:12, padding:'13px',
          fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:14, cursor:'pointer',
        }}>
          🗑️ Delete account
        </button>
      </div>

      <BottomNav active="profile" onChange={onNavigate} />

      {/* ── Delete confirmation modal (3-step) ─────────────────── */}
      {deleteOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:1000,
          background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center',
          padding:18,
        }} onClick={closeDelete}>
          <div onClick={e=>e.stopPropagation()} style={{
            width:'100%', maxWidth:380, background:T.bg2, borderRadius:16,
            border:`1px solid ${T.border}`, boxShadow:'0 16px 48px rgba(0,0,0,0.45)',
            padding:20, color:T.text,
          }}>
            {/* Step indicator */}
            <div style={{display:'flex',gap:6,marginBottom:14}}>
              {[1,2,3].map(s => (
                <div key={s} style={{
                  flex:1, height:4, borderRadius:2,
                  background: s <= deleteStep ? '#D0021B' : T.border,
                }}/>
              ))}
            </div>

            {deleteStep === 1 && (
              <>
                <div style={{fontSize:34, textAlign:'center', marginBottom:6}}>⚠️</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,textAlign:'center',marginBottom:8}}>
                  Delete your account?
                </div>
                <div style={{fontSize:13,lineHeight:1.5,color:T.textMuted,marginBottom:16}}>
                  This will permanently remove your profile, uploads, and history from LocalAI TV. This action is <b style={{color:T.text}}>not reversible</b>.
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={closeDelete} style={{flex:1,padding:'12px',borderRadius:10,border:`1px solid ${T.border}`,background:'transparent',color:T.text,fontWeight:700,cursor:'pointer'}}>
                    Cancel
                  </button>
                  <button onClick={()=>setDeleteStep(2)} style={{flex:1,padding:'12px',borderRadius:10,border:'none',background:'#D0021B',color:'white',fontWeight:800,cursor:'pointer'}}>
                    Continue
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,marginBottom:8}}>
                  Confirm your phone
                </div>
                <div style={{fontSize:12,color:T.textMuted,marginBottom:10,lineHeight:1.5}}>
                  Type the phone number on this account to confirm: <b style={{color:T.text}}>{user.phone || '—'}</b>
                </div>
                <input
                  value={confirmPhone}
                  onChange={e=>setConfirmPhone(e.target.value.replace(/[^\d]/g,'').slice(0,10))}
                  placeholder="10-digit mobile" inputMode="tel" maxLength={10}
                  style={{width:'100%',padding:'12px 14px',borderRadius:10,border:`1.5px solid ${T.border}`,background:T.bg3,color:T.text,fontSize:14,outline:'none',boxSizing:'border-box',letterSpacing:1,marginBottom:14}}
                />
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setDeleteStep(1)} style={{flex:1,padding:'12px',borderRadius:10,border:`1px solid ${T.border}`,background:'transparent',color:T.text,fontWeight:700,cursor:'pointer'}}>
                    Back
                  </button>
                  <button
                    onClick={()=>setDeleteStep(3)}
                    disabled={!user.phone || confirmPhone !== String(user.phone).replace(/\D/g,'').slice(-10)}
                    style={{
                      flex:1,padding:'12px',borderRadius:10,border:'none',
                      background: (!user.phone || confirmPhone !== String(user.phone).replace(/\D/g,'').slice(-10)) ? '#888' : '#D0021B',
                      color:'white', fontWeight:800,
                      cursor: (!user.phone || confirmPhone !== String(user.phone).replace(/\D/g,'').slice(-10)) ? 'not-allowed' : 'pointer',
                      opacity: (!user.phone || confirmPhone !== String(user.phone).replace(/\D/g,'').slice(-10)) ? 0.6 : 1,
                    }}>
                    Continue
                  </button>
                </div>
              </>
            )}

            {deleteStep === 3 && (
              <>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,marginBottom:8}}>
                  Last chance
                </div>
                <div style={{fontSize:13,color:T.textMuted,marginBottom:12,lineHeight:1.5}}>
                  The delete button unlocks after a 30-second cooling-off period. Cancel any time before that.
                </div>
                <div style={{
                  textAlign:'center', padding:'14px 0', marginBottom:12,
                  background:T.bg3, borderRadius:10, border:`1px solid ${T.border}`,
                }}>
                  <div style={{fontSize:11,color:T.textMuted,letterSpacing:1,marginBottom:2}}>UNLOCK IN</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:36,color: countdown === 0 ? '#D0021B' : T.text,lineHeight:1}}>
                    {countdown === 0 ? 'READY' : `${countdown}s`}
                  </div>
                </div>
                {deleteError && (
                  <div style={{fontSize:12,color:'#D0021B',background:'rgba(208,2,27,0.1)',border:'1px solid rgba(208,2,27,0.33)',padding:'8px 12px',borderRadius:8,marginBottom:10}}>
                    {deleteError}
                  </div>
                )}
                <div style={{display:'flex',gap:8}}>
                  <button onClick={closeDelete} style={{flex:1,padding:'12px',borderRadius:10,border:`1px solid ${T.border}`,background:'transparent',color:T.text,fontWeight:700,cursor:'pointer'}}>
                    Cancel
                  </button>
                  <button
                    onClick={performDelete}
                    disabled={countdown > 0 || deleting}
                    style={{
                      flex:1,padding:'12px',borderRadius:10,border:'none',
                      background:(countdown > 0 || deleting) ? '#888' : '#D0021B',
                      color:'white', fontWeight:800,
                      cursor:(countdown > 0 || deleting) ? 'not-allowed' : 'pointer',
                      opacity:(countdown > 0 || deleting) ? 0.6 : 1,
                    }}>
                    {deleting ? 'Deleting…' : 'Delete forever'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { ProfileScreen };
export default ProfileScreen;
