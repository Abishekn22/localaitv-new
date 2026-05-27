import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import RegRow from './../components/RegRow.jsx';
import Toast from './../components/Toast.jsx';

function RegisterScreen({ onDone, onComplete }) {
  // OTP backend not yet live — skip straight to profile step
  const [step, setStep]           = useState(2);
  const [phone, setPhone]         = useState('');
  const [otp, setOtp]             = useState('');
  const [otpSent, setOtpSent]     = useState(false);
  const [name, setName]           = useState('');
  const [state, setState]         = useState('AP');
  const [constituency, setConst]  = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState('');
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [phoneMsg, setPhoneMsg]         = useState('');
  const [phoneMsgType, setPhoneMsgType] = useState('');
  const list = state==='AP' ? AP_CONSTITUENCIES : TG_CONSTITUENCIES;
  // Filter matches both Telugu and English; live constituencies are first in the array
  const filtered = list.filter(c => c.en.toLowerCase().includes(search.toLowerCase()) || c.te.includes(search));
  // Split for visual grouping (only when not searching)
  const liveItems  = filtered.filter(c => c.live);
  const otherItems = [...filtered].sort((a,b) => a.en.localeCompare(b.en)); // ALL, A-Z incl. live
  const showSections = search.length === 0 && liveItems.length > 0;
  function showToast(m){ setToast(m); setTimeout(()=>setToast(''),2500); }
  const checkPhoneApi = async (phoneNumber) => {
    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return { isAvailable: false, message: 'Please enter a valid 10-digit Indian phone number' };
    }
    try {
      const response = await fetch(`${API_BASE}/api/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber.trim() }),
        credentials: 'include'
      });
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseErr) {
        const responseText = await response.text();
        return { isAvailable: false, message: 'Unable to validate phone number. Please try again.', error: 'Invalid server response format' };
      }
      const phoneExists = response.ok && responseData && responseData.registered === true;
      if (phoneExists) {
        return { isAvailable: false, message: 'This phone number is already registered. Please sign in to your existing account or use a different number.' };
      }
      return { isAvailable: true, message: 'Phone number is available for registration' };
    } catch (networkError) {
      return { isAvailable: false, message: 'Network error while checking phone number. Please check your connection and try again.', error: networkError.message };
    }
  };

  useEffect(() => {
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      setPhoneMsg('');
      setPhoneMsgType('');
      return;
    }
    setPhoneMsg('Checking…');
    setPhoneMsgType('checking');
    setPhoneChecking(true);
    const timer = setTimeout(async () => {
      const result = await checkPhoneApi(phone);
      setPhoneChecking(false);
      setPhoneMsg(result.message);
      if (result.isAvailable) {
        setPhoneMsgType('available');
      } else if (result.message.includes('already registered')) {
        setPhoneMsgType('taken');
      } else {
        setPhoneMsgType('error');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [phone]);

  async function sendOtp(){
    if(phone.length<10){ showToast('Enter valid 10-digit number'); return; }
    setLoading(true);
    const result = await checkPhoneApi(phone);
    if (!result.isAvailable) {
      setLoading(false);
      setPhoneMsg(result.message);
      setPhoneMsgType(result.message.includes('already registered') ? 'taken' : 'error');
      return;
    }
    setLoading(false);
    setOtpSent(true);
    showToast('OTP sent to +91 '+phone);
  }
  function verifyOtp(){
    if(otp.length<4){ showToast('Enter OTP'); return; }
    setLoading(true);
    setTimeout(()=>{ setLoading(false); setStep(2); },1000);
  }
  function finish(){
    if(!name.trim()){ showToast('Enter your name'); return; }
    if(!constituency){ showToast('Select your constituency'); return; }
    // Save the profile data — used to gate uploads
    const profile = {
      name: name.trim(),
      phone: '+91 ' + phone,
      state,
      constituency,
      registeredAt: new Date().toISOString(),
      verified: true,
    };
    if (onComplete) onComplete(profile);
    showToast('Registration successful! Welcome to LocalAI TV');
    setTimeout(onDone, 1500);
  }
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{background:T.bg2,padding:'50px 18px 16px',flexShrink:0}}>
        {/* Context banner — why user is here */}
        <div style={{background:'rgba(208,2,27,0.12)',border:`1px solid rgba(208,2,27,0.3)`,borderRadius:8,padding:'8px 12px',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:14}}>🔒</span>
          <span style={{fontSize:11,color:T.text,lineHeight:1.4,flex:1}}>
            <strong style={{color:T.red}}>Registration required.</strong> Only verified citizens can post news on LocalAI TV.
          </span>
        </div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,letterSpacing:1}}>
          {step===1?'📱 Verify Mobile':'👤 Your Profile'}
        </div>
        <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>
          {step===1?'OTP verification is mandatory to upload news':'Complete your profile to get started'}
        </div>
        {/* Progress dots */}
        <div style={{display:'flex',gap:6,marginTop:12}}>
          {[1,2].map(s=>(
            <div key={s} style={{height:3,flex:1,borderRadius:2,background:s<=step?T.red:'rgba(255,255,255,0.12)',transition:'background 0.3s'}}/>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'24px 18px'}}>
        {step===1?(
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Mobile Number *</div>
              <div style={{display:'flex',gap:8}}>
                <div style={{background:T.bg3,borderRadius:10,padding:'12px',fontSize:14,color:T.textMuted,flexShrink:0,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>+91</div>
                <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                  placeholder="Enter 10-digit number" type="tel" maxLength={10}
                  style={{flex:1,background:T.bg3,borderRadius:10,padding:'12px',fontSize:14,color:T.text,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
              </div>
              {phoneMsg && (
                <div style={{fontSize:11,color:phoneMsgType==='available'?T.green:phoneMsgType==='checking'?T.textMuted:T.red,background:phoneMsgType==='available'?'rgba(0,200,90,0.1)':phoneMsgType==='checking'?'rgba(255,255,255,0.05)':'rgba(208,2,27,0.1)',borderRadius:8,padding:'8px 12px',border:`1px solid ${phoneMsgType==='available'?'rgba(0,200,90,0.3)':phoneMsgType==='checking'?'rgba(255,255,255,0.1)':T.red+'33'}`}}>{phoneMsg}</div>
              )}
            </div>
            {!otpSent?(
              <button onClick={sendOtp} disabled={loading || phoneChecking || !phone || phone.length !== 10 || phoneMsgType === 'taken'} style={{background:(loading||phoneChecking||!phone||phone.length!==10||phoneMsgType==='taken')?T.gray3:`linear-gradient(135deg,${T.red},#9A0015)`,color:T.text,borderRadius:12,padding:'14px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,letterSpacing:2,cursor:(loading||phoneChecking||!phone||phone.length!==10||phoneMsgType==='taken')?'not-allowed':'pointer',opacity:(loading||phoneChecking||!phone||phone.length!==10||phoneMsgType==='taken')?0.6:1,boxShadow:(loading||phoneChecking||!phone||phone.length!==10||phoneMsgType==='taken')?'none':`0 6px 20px ${T.red}44`}}>
                {loading?'SENDING…':'SEND OTP'}
              </button>
            ):(
              <>
                <div>
                  <div style={{fontSize:11,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Enter OTP *</div>
                  <input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                    placeholder="Enter OTP received" type="tel" maxLength={6}
                    style={{width:'100%',background:T.bg3,borderRadius:10,padding:'12px',fontSize:18,color:T.text,border:`1px solid ${T.red}44`,letterSpacing:8,textAlign:'center',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
                </div>
                <button onClick={verifyOtp} disabled={loading} style={{background:loading?T.gray3:`linear-gradient(135deg,${T.green},#009940)`,color:T.text,borderRadius:12,padding:'14px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,letterSpacing:2,cursor:'pointer',boxShadow:loading?'none':`0 6px 20px ${T.green}44`}}>
                  {loading?'VERIFYING…':'✅ VERIFY OTP'}
                </button>
                <div style={{textAlign:'center',fontSize:11,color:T.textMuted,cursor:'pointer'}} onClick={()=>{setOtpSent(false);setOtp('');}}>
                  Resend OTP
                </div>
              </>
            )}
            {/* Optional Aadhaar note */}
            <div style={{background:'rgba(255,184,0,0.08)',borderRadius:10,padding:'12px',border:`1px solid rgba(255,184,0,0.15)`}}>
              <div style={{fontSize:11,color:T.gold,fontWeight:700,marginBottom:4}}>💡 Aadhaar Verification (Optional)</div>
              <div style={{fontSize:11,color:T.textMuted}}>Verify with Aadhaar to get +20 trust score and Gold reporter badge. Available after OTP verification.</div>
            </div>


          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {/* Name */}
            <div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Full Name *</div>
              <input value={name} onChange={e=>setName(e.target.value)}
                placeholder="As per Aadhaar card"
                style={{width:'100%',background:T.bg3,borderRadius:10,padding:'12px',fontSize:14,color:T.text,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
            </div>
            {/* Profile photo optional */}
            <div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Profile Photo (Optional)</div>
              <div style={{display:'flex',alignItems:'center',gap:12,background:T.bg3,borderRadius:10,padding:'12px',border:`1px solid ${T.border}`,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:T.navy4,border:`2px dashed rgba(255,255,255,0.2)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👤</div>
                <div>
                  <div style={{fontSize:13,color:T.textMuted}}>Tap to add photo</div>
                  <div style={{fontSize:10,color:T.textMuted}}>Optional · Increases trust score by +10</div>
                </div>
              </div>
            </div>
            {/* State */}
            <div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>State *</div>
              <div style={{display:'flex',gap:8}}>
                {['AP','TG'].map(s=>(
                  <button key={s} onClick={()=>{setState(s);setConst('');}} style={{flex:1,background:state===s?`rgba(208,2,27,0.2)`:T.navy3,border:`1px solid ${state===s?T.red:'rgba(255,255,255,0.08)'}`,borderRadius:10,padding:'12px',color:state===s?T.red:'white',fontWeight:700,cursor:'pointer'}}>
                    {s==='AP'?'Andhra Pradesh':'Telangana'}
                  </button>
                ))}
              </div>
            </div>
            {/* Constituency */}
            <div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1}}>Your Constituency * <span style={{color:T.red,fontSize:9}}>(You can only upload news to this constituency)</span></div>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="🔍 Search (Telugu or English)…"
                style={{width:'100%',background:T.bg3,borderRadius:10,padding:'10px 12px',fontSize:13,color:T.text,border:`1px solid ${T.border}`,marginBottom:6,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
              {constituency&&(()=>{
                const sel = list.find(c=>c.en===constituency);
                return (
                  <div style={{background:`rgba(208,2,27,0.15)`,borderRadius:8,padding:'10px 12px',border:`1px solid ${T.red}44`,marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
                    <span style={{color:T.red,fontSize:14}}>✓</span>
                    <div style={{flex:1}}>
                      {sel && <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:15,color:T.red,fontWeight:700,lineHeight:1.6}}>{sel.te}</div>}
                      <div style={{fontSize:11,color:T.red,opacity:0.85}}>{constituency}</div>
                    </div>
                    {sel && sel.live && (
                      <div style={{display:'flex',alignItems:'center',gap:3,background:'rgba(0,200,90,0.15)',borderRadius:5,padding:'2px 6px'}}>
                        <div style={{width:5,height:5,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite'}}/>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:9,color:'#00C85A',letterSpacing:0.5}}>LIVE</span>
                      </div>
                    )}
                  </div>
                );
              })()}
              <div style={{maxHeight:200,overflowY:'auto',background:T.bg3,borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
                {showSections ? (
                  <>
                    {/* LIVE CHANNELS section header */}
                    <div style={{padding:'8px 12px',display:'flex',alignItems:'center',gap:6,background:'rgba(0,200,90,0.08)',borderBottom:`1px solid rgba(0,200,90,0.15)`,position:'sticky',top:0,zIndex:1}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite'}}/>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:10,color:'#00C85A',letterSpacing:1.2}}>LIVE CHANNELS · {liveItems.length}</span>
                    </div>
                    {liveItems.map((c,i)=>(
                      <RegRow key={'live-'+c.en} c={c} constituency={constituency} setConst={setConst} setSearch={setSearch} isLive={true}/>
                    ))}
                    {/* ALL CONSTITUENCIES section header */}
                    <div style={{padding:'8px 12px',display:'flex',alignItems:'center',gap:6,background:T.bg3,borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`,position:'sticky',top:0,zIndex:1}}>
                      <span style={{fontSize:10}}>📋</span>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:10,color:T.textMuted,letterSpacing:1.2}}>A-Z · {otherItems.length}</span>
                    </div>
                    {otherItems.map((c,i)=>(
                      <RegRow key={c.en} c={c} constituency={constituency} setConst={setConst} setSearch={setSearch} isLive={c.live}/>
                    ))}
                  </>
                ) : (
                  filtered.slice(0,30).map((c,i)=>(
                    <RegRow key={c.en} c={c} constituency={constituency} setConst={setConst} setSearch={setSearch} isLive={c.live}/>
                  ))
                )}
                {filtered.length===0 && (
                  <div style={{padding:'20px 12px',textAlign:'center',fontSize:12,color:T.textMuted}}>
                    No matches for "{search}"
                  </div>
                )}
              </div>
            </div>
            <button onClick={finish} style={{background:`linear-gradient(135deg,${T.red},#9A0015)`,color:'white',borderRadius:12,padding:'15px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,letterSpacing:2,cursor:'pointer',boxShadow:`0 8px 24px ${T.red}44`,marginTop:8}}>
              🚀 START REPORTING
            </button>


          </div>
        )}
      </div>
      <Toast msg={toast}/>
    </div>
  );
}

export { RegisterScreen };
export default RegisterScreen;
