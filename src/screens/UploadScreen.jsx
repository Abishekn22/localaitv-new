import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import { LiveDot } from './../components/atoms.jsx';

function UploadScreen({ onNavigate, userProfile, userConstituency, onRequestCamera, onRequestLocation }) {
  const { T } = useAppTheme();

  // Live channels only — AP + TG combined
  const LIVE_AP = AP_CONSTITUENCIES.filter(c => c.live);
  const LIVE_TG = TG_CONSTITUENCIES.filter(c => c.live);

  // Step management
  // 0 = constituency picker
  // 1 = reporter details + OTP
  // 2 = OTP verify
  // 3 = upload category grid
  // Skip channel picker & OTP — go straight to upload category grid
  const [step,        setStep]        = useState(3);
  const [selState,    setSelState]    = useState('AP');
  const [selConst,    setSelConst]    = useState(null);   // { te, en }
  const [name,        setName]        = useState(userProfile?.name || '');
  const [mobile,      setMobile]      = useState(userProfile?.mobile || '');
  const [photoUri,    setPhotoUri]    = useState(null);
  const [otp,         setOtp]         = useState(['','','','']);
  const [otpSent,     setOtpSent]     = useState(false);
  const [otpError,    setOtpError]    = useState('');
  const [sending,     setSending]     = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  // Constituency for display — falls back through: upload-flow pick → user profile → app-level constituency → 'Kurnool'
  const constituency = selConst?.en || userProfile?.constituency || userConstituency || 'Kurnool';

  // ── UPLOAD CATEGORIES — shown after verification ──────────────
  const UPLOAD_CATS = [
    { id:'news',       icon:'📰', label:'News',           labelTe:'వార్తలు',         color:'#1A237E' },
    { id:'birthdays',  icon:'🎂', label:'Birthdays',      labelTe:'పుట్టినరోజులు',    color:'#7B1FA2' },
    { id:'marriages',  icon:'💒', label:'Marriages',      labelTe:'వివాహాలు',         color:'#C2185B' },
    { id:'anniversary',icon:'💍', label:'Marriage Anniversary', labelTe:'వివాహ వార్షికోత్సవం', color:'#9B5DE5' },
    { id:'whoiswho',   icon:'🌟', label:'Who is Who',     labelTe:'పట్టణ ప్రముఖులు',  color:'#0D9488' },
    { id:'talentshow', icon:'🎤', label:'Talent Show',    labelTe:'టాలెంట్ షో',        color:'#EC4899' },
    { id:'publicvoice',icon:'📢', label:'Public Voice',   labelTe:'పబ్లిక్ వాయిస్',      color:'#DC2626' },
    { id:'events',     icon:'🎉', label:'Events',         labelTe:'కార్యక్రమాలు',     color:'#E65100' },
    { id:'jobs',       icon:'💼', label:'Jobs',           labelTe:'ఉద్యోగాలు',        color:'#1565C0' },
    { id:'carsales',   icon:'🚗', label:'Car / Motorcycle', labelTe:'కార్ / మోటార్‌సైకిల్', color:'#1B5E20' },
    { id:'rentals',    icon:'🏠', label:'Rentals',        labelTe:'అద్దెలు',           color:'#00838F' },
    { id:'shopping',   icon:'🛍️', label:'Shopping',       labelTe:'షాపింగ్',           color:'#F57F17' },
  ];

  // ── OTP handling ───────────────────────────────────────────────
  function handleOtpChange(idx, val) {
    const cleaned = val.replace(/\D/g,'').slice(0,1);
    const next = [...otp];
    next[idx] = cleaned;
    setOtp(next);
    setOtpError('');
    if (cleaned && idx < 3) otpRefs[idx+1].current?.focus();
  }
  function handleOtpKey(idx, e) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs[idx-1].current?.focus();
    }
  }
  function sendOtp() {
    if (mobile.replace(/\D/g,'').length < 10) { setOtpError('Enter valid 10-digit mobile number'); return; }
    if (!name.trim()) { setOtpError('Please enter your name'); return; }
    setSending(true);
    setTimeout(() => { setSending(false); setOtpSent(true); setStep(2); otpRefs[0].current?.focus(); }, 1500);
  }
  function verifyOtp() {
    const code = otp.join('');
    if (code.length < 4) { setOtpError('Enter all 4 digits'); return; }
    // For demo: any 4 digits work. Backend will do real verify.
    setSending(true);
    setTimeout(() => { setSending(false); setStep(3); }, 1200);
  }

  // ── STEP 0: Constituency picker ────────────────────────────────
  if (step === 0) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:T.bg,overflow:'hidden'}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,#0A1538,#1a237e)`,padding:'52px 18px 20px',flexShrink:0}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:8}}>📺</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:'white',letterSpacing:0.5}}>Select Your Channel</div>
          <div style={{fontFamily:"'Tiro Telugu',serif",fontSize:13,color:'rgba(255,255,255,0.75)',marginTop:4}}>మీ నియోజకవర్గం ఎంచుకోండి</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'20px 18px 120px'}}>
        {/* State toggle */}
        <div style={{display:'flex',borderRadius:12,overflow:'hidden',background:T.bg3,marginBottom:20,border:`1px solid ${T.border}`}}>
          {['AP','TG'].map(s=>(
            <button key={s} onClick={()=>setSelState(s)} style={{
              flex:1,padding:'11px',cursor:'pointer',
              background:selState===s?T.red:'transparent',
              color:selState===s?'white':T.textMuted,
              fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:800,fontSize:14,letterSpacing:1,border:'none',
              transition:'all 0.2s',
            }}>
              {s==='AP'?'Andhra Pradesh':'Telangana'}
            </button>
          ))}
        </div>

        {/* Live channels only */}
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:14}}>
            <LiveDot size={6}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.text,letterSpacing:0.5}}>
              LIVE CHANNELS — SELECT TO UPLOAD
            </span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {(selState==='AP'?LIVE_AP:LIVE_TG).map(c=>(
              <div key={c.en} onClick={()=>setSelConst(c)}
                style={{
                  display:'flex',alignItems:'center',gap:14,
                  background: selConst?.en===c.en
                    ? `linear-gradient(135deg,rgba(208,2,27,0.15),rgba(208,2,27,0.05))`
                    : T.bg2,
                  border:`2px solid ${selConst?.en===c.en?T.red:T.border}`,
                  borderRadius:14,padding:'14px 16px',cursor:'pointer',
                  boxShadow: selConst?.en===c.en ? `0 4px 18px ${T.red}33` : T.isDark?'none':`0 2px 8px ${T.shadow}`,
                  transition:'all 0.2s',
                }}>
                {/* Channel icon */}
                <div style={{
                  width:48,height:48,borderRadius:12,
                  background:`linear-gradient(135deg,${T.red},#7A0010)`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:20,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:900,color:'white',
                }}>
                  {c.en.slice(0,1)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:T.text,marginBottom:2}}>{c.en} TV</div>
                  <div style={{fontFamily:"'Tiro Telugu',serif",fontSize:12,color:T.textMuted}}>{c.te}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(208,2,27,0.1)',border:`1px solid rgba(208,2,27,0.25)`,borderRadius:6,padding:'2px 8px'}}>
                    <LiveDot size={4}/>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:9,color:T.red,letterSpacing:0.5}}>LIVE</span>
                  </div>
                  {selConst?.en===c.en && <span style={{color:T.red,fontSize:18}}>✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={()=>{ if(selConst) setStep(1); }}
          disabled={!selConst}
          style={{
            width:'100%',marginTop:20,
            background: selConst ? `linear-gradient(135deg,${T.red},#7A0010)` : T.bg3,
            color: selConst ? 'white' : T.textMuted,
            border:'none',borderRadius:14,padding:'16px',
            fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:800,fontSize:16,letterSpacing:1,
            cursor: selConst ? 'pointer' : 'not-allowed',
            boxShadow: selConst ? `0 6px 20px ${T.red}44` : 'none',
            transition:'all 0.2s',
          }}>
          {selConst ? `Continue — Upload for ${selConst.en} TV →` : 'Select a channel to continue'}
        </button>
      </div>
    </div>
  );

  // ── STEP 1: Reporter details ────────────────────────────────────
  if (step === 1) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:T.bg,overflow:'hidden'}}>
      <div style={{background:`linear-gradient(135deg,#0A1538,#1a237e)`,padding:'52px 18px 20px',flexShrink:0,position:'relative'}}>
        <button onClick={()=>setStep(0)} style={{position:'absolute',top:52,left:14,background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,width:32,height:32,color:'white',fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(208,2,27,0.2)',border:'1px solid rgba(208,2,27,0.4)',borderRadius:20,padding:'4px 12px',marginBottom:10}}>
            <LiveDot size={5}/><span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:'#ff6b6b',letterSpacing:0.5}}>UPLOAD FOR {selConst?.en?.toUpperCase()} TV</span>
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:'white'}}>Your Details</div>
          <div style={{fontFamily:"'Tiro Telugu',serif",fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:4}}>మీ వివరాలు నమోదు చేయండి</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'20px 18px 40px'}}>
        {/* Name */}
        <div style={{marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:6}}>Full Name <span style={{color:T.red}}>*</span></div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name"
            style={{width:'100%',background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,borderRadius:10,padding:'13px 14px',fontSize:14,color:T.text,boxSizing:'border-box'}}/>
        </div>

        {/* Mobile */}
        <div style={{marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:6}}>Mobile Number <span style={{color:T.red}}>*</span></div>
          <div style={{display:'flex',gap:8}}>
            <div style={{background:T.bg3,border:`1.5px solid ${T.border}`,borderRadius:10,padding:'13px 12px',fontSize:13,color:T.textMuted,fontWeight:600,flexShrink:0}}>🇮🇳 +91</div>
            <input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,'').slice(0,10))}
              placeholder="98765 43210" type="tel" inputMode="numeric"
              style={{flex:1,background:T.inputBg,border:`1.5px solid ${T.inputBorder}`,borderRadius:10,padding:'13px 14px',fontSize:14,color:T.text,boxSizing:'border-box'}}/>
          </div>
        </div>

        {/* Profile photo — optional */}
        <div style={{marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:6}}>Profile Photo <span style={{color:T.textMuted,fontWeight:400}}>(optional)</span></div>
          <div onClick={()=>document.getElementById('up-photo')?.click()}
            style={{
              border:`2px dashed ${T.border}`,borderRadius:12,padding:'20px',
              display:'flex',flexDirection:'column',alignItems:'center',gap:6,
              cursor:'pointer',background:T.bg3,
            }}>
            {photoUri
              ? <img src={photoUri} alt="profile" style={{width:56,height:56,borderRadius:'50%',objectFit:'cover'}}/>
              : <div style={{fontSize:36}}>📸</div>
            }
            <div style={{fontSize:12,color:T.textMuted}}>{photoUri?'Tap to change':'Upload profile photo'}</div>
            <input id="up-photo" type="file" accept="image/*" style={{display:'none'}}
              onChange={e=>{const f=e.target.files?.[0]; if(f) setPhotoUri(URL.createObjectURL(f));}}/>
          </div>
        </div>

        {otpError && <div style={{color:T.red,fontSize:12,marginBottom:12,textAlign:'center'}}>{otpError}</div>}

        <button onClick={sendOtp} disabled={sending}
          style={{
            width:'100%',background:sending?T.bg3:`linear-gradient(135deg,${T.red},#7A0010)`,
            color:sending?T.textMuted:'white',border:'none',borderRadius:14,padding:'16px',
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,letterSpacing:1,
            cursor:sending?'not-allowed':'pointer',boxShadow:sending?'none':`0 6px 20px ${T.red}44`,
          }}>
          {sending ? '⏳ Sending OTP…' : '📱 Send OTP'}
        </button>
      </div>
    </div>
  );

  // ── STEP 2: OTP verification ────────────────────────────────────
  if (step === 2) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:T.bg,overflow:'hidden'}}>
      <div style={{background:`linear-gradient(135deg,#0A1538,#1a237e)`,padding:'52px 18px 20px',flexShrink:0,position:'relative'}}>
        <button onClick={()=>{setStep(1);setOtpSent(false);setOtp(['','','','']);}} style={{position:'absolute',top:52,left:14,background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,width:32,height:32,color:'white',fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:8}}>🔐</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:'white'}}>Verify OTP</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',marginTop:4}}>Sent to +91 {mobile}</div>
        </div>
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 18px'}}>
        <div style={{fontFamily:"'Tiro Telugu',serif",fontSize:13,color:T.textMuted,marginBottom:24,textAlign:'center'}}>OTP నమోదు చేయండి</div>

        {/* 4 OTP boxes */}
        <div style={{display:'flex',gap:12,marginBottom:16}}>
          {otp.map((digit,i)=>(
            <input
              key={i}
              ref={otpRefs[i]}
              type="text" inputMode="numeric" maxLength={1}
              value={digit}
              onChange={e=>handleOtpChange(i, e.target.value)}
              onKeyDown={e=>handleOtpKey(i,e)}
              style={{
                width:56,height:64,
                background:T.inputBg,
                border:`2px solid ${digit?T.red:T.inputBorder}`,
                borderRadius:12,
                textAlign:'center',
                fontSize:28,fontWeight:800,color:T.text,
                outline:'none',
                boxShadow: digit ? `0 0 0 3px ${T.red}22` : 'none',
                transition:'all 0.15s',
              }}
            />
          ))}
        </div>

        {otpError && <div style={{color:T.red,fontSize:12,marginBottom:12}}>{otpError}</div>}

        <button onClick={verifyOtp} disabled={sending || otp.join('').length < 4}
          style={{
            width:'100%',maxWidth:280,
            background:otp.join('').length===4 ? `linear-gradient(135deg,${T.red},#7A0010)` : T.bg3,
            color:otp.join('').length===4?'white':T.textMuted,
            border:'none',borderRadius:14,padding:'16px',
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,letterSpacing:1,
            cursor:otp.join('').length===4?'pointer':'not-allowed',
            boxShadow:otp.join('').length===4?`0 6px 20px ${T.red}44`:'none',
            marginBottom:16,
          }}>
          {sending ? '⏳ Verifying…' : '✓ Verify & Continue'}
        </button>

        <button onClick={()=>{setOtp(['','','','']);setSending(true);setTimeout(()=>setSending(false),1500);}}
          style={{background:'none',border:'none',color:T.textMuted,fontSize:12,cursor:'pointer'}}>
          Didn't receive? Resend OTP
        </button>
      </div>
    </div>
  );

  // ── STEP 3: Upload category grid ────────────────────────────────
  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:T.bg,overflow:'hidden'}}>
      {/* Header — shows which channel */}
      <div style={{background:`linear-gradient(135deg,${T.red},#7A0010)`,padding:'52px 18px 18px',flexShrink:0,position:'relative'}}>
        {/* Back arrow — returns to registration page */}
        <button onClick={()=>onNavigate('uploadregister')} style={{
          position:'absolute',top:52,left:14,zIndex:10,
          background:'rgba(255,255,255,0.22)',border:'none',borderRadius:8,
          width:34,height:34,color:'white',fontSize:18,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.18)',borderRadius:20,padding:'5px 16px',marginBottom:10,border:'1px solid rgba(255,255,255,0.25)'}}>
            <LiveDot size={4}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:13,color:'white',letterSpacing:0.5}}>
              {constituency} TV
            </span>
          </div>
          {/* Telugu BIG on top, English smaller below */}
          <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:22,color:'white',lineHeight:1.2,textShadow:'0 1px 3px rgba(0,0,0,0.25)'}}>
            వార్తలు / సమాచారం అప్‌లోడ్ చేయండి
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'rgba(255,255,255,0.9)',letterSpacing:0.5,marginTop:3}}>
            Upload News / Information
          </div>
        </div>
      </div>

      {/* Category grid */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 120px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {UPLOAD_CATS.map(cat=>(
            <div key={cat.id} onClick={()=>{
                const routes = {
                  news:'newsupload', birthdays:'birthdayform', marriages:'upcomingmarriage',
                  anniversary:'anniversaryform', whoiswho:'whoiswhoform', talentshow:'talentshowform',
                  publicvoice:'publicvoiceform',
                  events:'eventsform', jobs:'jobs', carsales:'carsales',
                  rentals:'rentalform', shopping:'shopping',
                };
                onNavigate(routes[cat.id]||'upload');
              }}
              style={{
                background:T.bg2,border:`2px solid ${T.border}`,
                borderRadius:16,padding:'18px 14px',
                display:'flex',flexDirection:'column',alignItems:'center',gap:8,
                cursor:'pointer',
                boxShadow:T.isDark?'none':`0 2px 10px ${T.shadow}`,
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                transform:'translateY(0) scale(1)',
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.transform='translateY(-4px) scale(1.03)';
                e.currentTarget.style.borderColor=cat.color;
                e.currentTarget.style.boxShadow=`0 8px 24px ${cat.color}55, 0 0 0 1px ${cat.color}40`;
                e.currentTarget.style.background=`${cat.color}10`;
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.borderColor=T.border;
                e.currentTarget.style.boxShadow=T.isDark?'none':`0 2px 10px ${T.shadow}`;
                e.currentTarget.style.background=T.bg2;
              }}
              onTouchStart={e=>{
                e.currentTarget.style.transform='scale(0.96)';
                e.currentTarget.style.borderColor=cat.color;
                e.currentTarget.style.background=`${cat.color}15`;
              }}
              onTouchEnd={e=>{
                e.currentTarget.style.transform='scale(1)';
                e.currentTarget.style.borderColor=T.border;
                e.currentTarget.style.background=T.bg2;
              }}
            >
              {/* Category icon circle */}
              <div style={{
                width:52,height:52,borderRadius:16,
                background:`${cat.color}18`,
                border:`2px solid ${cat.color}33`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:26,
              }}>{cat.icon}</div>
              <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:15,color:T.text,lineHeight:1.3,textAlign:'center'}}>{cat.labelTe}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:12,color:T.textMuted,letterSpacing:0.3}}>{cat.label}</div>
            </div>
          ))}
        </div>

      </div>
      <BottomNav active="upload" onChange={onNavigate} />
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// ── UPLOAD REGISTRATION SCREEN — shown BEFORE the upload home ─
// All fields optional (testing) — Submit always proceeds to upload

export { UploadScreen };
export default UploadScreen;
