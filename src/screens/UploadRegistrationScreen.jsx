import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import { LocationPin } from './../components/atoms.jsx';

function UploadRegistrationScreen({ onNavigate, userProfile, userConstituency, userState, onSubmitDone }) {
  const { T } = useAppTheme();

  const [state, setState] = useState(userState || '');
  const [constituency, setConstituency] = useState(userConstituency || '');
  const [name, setName] = useState(userProfile?.name || '');
  const [mobile, setMobile] = useState(userProfile?.mobile || '');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(userProfile?.photo || null);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [dropStep, setDropStep] = useState('state');   // 'state' | 'constituency' — same as home page
  const [dropState, setDropState] = useState(null);    // 'AP' | 'TG'

  // Find selected channel object from LIVE_CHANNELS (matches the home page exactly)
  const selectedChannel = LIVE_CHANNELS.find(ch => ch.nameEn === constituency);

  const constituencyList = state === 'AP' ? AP_CONSTITUENCIES
    : state === 'TG' ? TG_CONSTITUENCIES
    : [];

  function handleRequestOTP() {
    // API skipped — testing only
    setOtpRequested(true);
    alert('OTP request simulated (testing mode — backend not wired).\n\nEnter any value or skip the OTP field — Submit will still work.');
  }

  function handleSubmit() {
    // All fields optional — always proceed
    onSubmitDone({ state, constituency, name, mobile, photo });
  }

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* ── Red header (matches Upload home red gradient) ── */}
      <div style={{
        background:'linear-gradient(135deg,#D0021B 0%,#9A0015 60%,#7A0010 100%)',
        padding:'48px 18px 20px',flexShrink:0,position:'relative',
        boxShadow:'0 4px 18px rgba(208,2,27,0.25)',overflow:'hidden',
      }}>
        <div style={{position:'absolute',top:-30,right:-30,width:140,height:140,
          borderRadius:'50%',background:'radial-gradient(circle,rgba(255,255,255,0.14),transparent 70%)',
          pointerEvents:'none'}}/>

        <button onClick={()=>onNavigate('home')} style={{
          position:'absolute',top:52,left:14,zIndex:10,
          background:'rgba(255,255,255,0.22)',border:'none',borderRadius:8,
          width:34,height:34,color:'white',fontSize:18,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>←</button>

        <div style={{textAlign:'center',position:'relative',zIndex:1,padding:'0 40px'}}>
          <div style={{fontSize:32,marginBottom:4}}>📝</div>
          <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,
            color:'white',lineHeight:1.3,textShadow:'0 1px 3px rgba(0,0,0,0.25)'}}>
            వార్తలు / సమాచారం అప్‌లోడ్ చేయడానికి నమోదు ఫారం
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:12,
            color:'rgba(255,255,255,0.9)',letterSpacing:0.4,marginTop:4,lineHeight:1.3}}>
            Registration Form for Uploading News / Information
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        {/* Registration process note */}
        <div style={{
          background:`linear-gradient(135deg,rgba(0,208,104,0.08),rgba(43,127,255,0.06))`,
          border:`1px solid rgba(0,208,104,0.25)`,
          borderRadius:14,padding:'12px 16px',marginBottom:14,
          display:'flex',alignItems:'center',gap:10,
        }}>
          <span style={{fontSize:24,flexShrink:0}}>✅</span>
          <div>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:14,
              color:T.text,lineHeight:1.35}}>
              ఒక్క పేజీలో నమోదు ప్రక్రియ
            </div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2,lineHeight:1.4}}>
              Registration Process in One Page
            </div>
          </div>
        </div>

        {/* Form card */}
        <div style={{
          background:T.bg2,borderRadius:14,padding:'16px',marginBottom:14,
          border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`,
        }}>

          {/* ── Location picker — EXACT same box as Home page topbar ── */}
          <div style={{marginBottom:14}}>
            <div style={{marginBottom:8}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,color:T.text,letterSpacing:0.3,lineHeight:1.2}}>
                Select Your Town / Constituency
              </div>
            </div>

            {/* Home-page style: red pin + custom pill dropdown */}
            <div style={{display:'flex',alignItems:'center',gap:10,position:'relative'}}>
              {/* Red location pin SVG */}
              <div style={{flexShrink:0}}>
                <LocationPin size={22}/>
              </div>

              {/* Custom pill — matches home page exactly */}
              <div style={{flex:1,position:'relative'}} onClick={()=>setShowChannelDropdown(v=>!v)}>
                <div style={{
                  display:'flex', alignItems:'center', gap:6,
                  background:T.bg3,
                  border:`1.5px solid ${showChannelDropdown?'rgba(208,2,27,0.5)':T.border}`,
                  borderRadius:10,
                  padding:'8px 12px',
                  cursor:'pointer',
                  transition:'border 0.15s',
                  boxShadow: showChannelDropdown?'0 0 10px rgba(208,2,27,0.15)':'none',
                }}>
                  {/* Live dot — green blinking */}
                  <div style={{width:7,height:7,borderRadius:'50%',background:'#00C85A',
                    animation:'blink 1s infinite',boxShadow:'0 0 5px #00C85A',flexShrink:0}}/>
                  {/* Channel name in Telugu (or placeholder) */}
                  <span style={{
                    fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
                    fontWeight:700, fontSize:14, lineHeight:1.4,
                    color: selectedChannel ? T.text : T.textMuted, flex:1,
                  }}>{selectedChannel ? selectedChannel.name : 'Select Your Town / Constituency'}</span>
                  {/* TV label — only when selected */}
                  {selectedChannel && (
                    <span style={{
                      fontFamily:"'Barlow Condensed',sans-serif",
                      fontWeight:800, fontSize:10,
                      color:T.textMuted, letterSpacing:0.5,
                    }}>TV</span>
                  )}
                  {/* Chevron */}
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke={T.textMuted} strokeWidth={2.5} strokeLinecap="round">
                    <polyline points={showChannelDropdown?"18 15 12 9 6 15":"6 9 12 15 18 9"}/>
                  </svg>
                </div>

                {/* ── 2-step Hierarchical Dropdown — identical to Home page ── */}
                {showChannelDropdown && (
                  <div style={{
                    position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
                    background:T.bg2,
                    borderRadius:16,
                    border:`1px solid ${T.border}`,
                    boxShadow:`0 10px 40px rgba(0,0,0,0.28)`,
                    overflow:'hidden',
                    zIndex:200,
                  }} onClick={e=>e.stopPropagation()}>

                    {/* ── STEP 1: Select State ── */}
                    {dropStep === 'state' && (
                      <>
                        <div style={{
                          padding:'12px 16px 10px',
                          borderBottom:`1px solid ${T.border}`,
                          background: T.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',
                        }}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:11,letterSpacing:1.5,color:T.textMuted}}>SELECT STATE</div>
                        </div>

                        {/* Andhra Pradesh */}
                        <div onClick={()=>{ setDropState('AP'); setDropStep('constituency'); }}
                          style={{
                            display:'flex', alignItems:'center', gap:12,
                            padding:'16px 18px',cursor:'pointer',
                            borderBottom:`1px solid ${T.border}`,
                            transition:'background 0.15s',
                            background: selectedChannel && selectedChannel.state==='AP'?`rgba(208,2,27,0.06)`:'transparent',
                          }}>
                          <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                            background: selectedChannel && selectedChannel.state==='AP' ? T.red : T.border}}/>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text,letterSpacing:0.3}}>Andhra Pradesh</div>
                            <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12,lineHeight:1.65,color:T.textMuted,marginTop:1}}>
                              ఆంధ్రప్రదేశ్ · {LIVE_CHANNELS.filter(c=>c.state==='AP').length} live channels
                            </div>
                          </div>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth={2.5} strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>

                        {/* Telangana */}
                        <div onClick={()=>{ setDropState('TG'); setDropStep('constituency'); }}
                          style={{
                            display:'flex', alignItems:'center', gap:12,
                            padding:'16px 18px',cursor:'pointer',
                            transition:'background 0.15s',
                            background: selectedChannel && selectedChannel.state==='TG'?`rgba(208,2,27,0.06)`:'transparent',
                          }}>
                          <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                            background: selectedChannel && selectedChannel.state==='TG' ? T.red : T.border}}/>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text,letterSpacing:0.3}}>Telangana</div>
                            <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12,lineHeight:1.65,color:T.textMuted,marginTop:1}}>
                              తెలంగాణ · {LIVE_CHANNELS.filter(c=>c.state==='TG').length} live channels
                            </div>
                          </div>
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth={2.5} strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                        <div style={{height:4}}/>
                      </>
                    )}

                    {/* ── STEP 2: Select Constituency ── */}
                    {dropStep === 'constituency' && (
                      <>
                        <div style={{
                          display:'flex', alignItems:'center', gap:10,
                          padding:'10px 14px',
                          borderBottom:`1px solid ${T.border}`,
                          background: T.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',
                        }}>
                          <button onClick={()=>setDropStep('state')}
                            style={{
                              width:30,height:30,borderRadius:8,border:`1px solid ${T.border}`,
                              background:T.bg3,color:T.text,cursor:'pointer',
                              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                            }}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.text} strokeWidth={2.5} strokeLinecap="round">
                              <polyline points="15 18 9 12 15 6"/>
                            </svg>
                          </button>
                          <div style={{flex:1}}>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:11,letterSpacing:1.5,color:T.textMuted}}>
                              {dropState==='AP'?'ANDHRA PRADESH':'TELANGANA'} · SELECT CHANNEL
                            </div>
                          </div>
                        </div>

                        {LIVE_CHANNELS.filter(c=>c.state===dropState).map((c,i)=>(
                          <div key={c.id}
                            onClick={()=>{
                              setState(c.state);
                              setConstituency(c.nameEn);
                              setShowChannelDropdown(false);
                              setDropStep('state');
                              setDropState(null);
                            }}
                            style={{
                              display:'flex',alignItems:'center',gap:12,
                              padding:'13px 16px',cursor:'pointer',
                              background: constituency===c.nameEn?`rgba(208,2,27,0.1)`:'transparent',
                              borderLeft: constituency===c.nameEn?`3px solid ${T.red}`:'3px solid transparent',
                              borderBottom: i < LIVE_CHANNELS.filter(x=>x.state===dropState).length-1
                                ? `1px solid ${T.border}` : 'none',
                              transition:'all 0.15s',
                            }}>
                            <div style={{flexShrink:0}}>
                              <LocationPin size={22}/>
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,fontSize:17,color:T.text,lineHeight:1.3}}>{c.name}</div>
                              <div style={{display:'flex',alignItems:'center',gap:5,marginTop:2}}>
                                <div style={{width:5,height:5,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite'}}/>
                                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:'#00C85A',fontWeight:700,letterSpacing:0.5}}>
                                  LIVE · {c.viewers.toLocaleString()} watching
                                </span>
                              </div>
                            </div>
                            {constituency===c.nameEn && (
                              <div style={{
                                width:22,height:22,borderRadius:'50%',background:T.red,
                                display:'flex',alignItems:'center',justifyContent:'center',
                                fontSize:12,color:'white',fontWeight:700,flexShrink:0,
                              }}>✓</div>
                            )}
                          </div>
                        ))}
                        <div style={{height:6}}/>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Backdrop to close dropdown on outside click */}
            {showChannelDropdown && (
              <div style={{position:'fixed',inset:0,zIndex:100}}
                onClick={()=>{setShowChannelDropdown(false); setDropStep('state'); setDropState(null);}}/>
            )}
          </div>

          {/* Name */}
          <div style={{marginBottom:14}}>
            <div style={{marginBottom:4}}>
              <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:13,color:T.text}}>పేరు</div>
              <div style={{fontSize:11,color:T.textMuted}}>Name</div>
            </div>
            <input value={name} onChange={e=>setName(e.target.value)}
              placeholder="e.g. Ravi Kumar"
              style={{width:'100%',border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                padding:'12px 14px',fontSize:14,color:T.text,background:T.inputBg,
                outline:'none',boxSizing:'border-box'}}/>
          </div>

          {/* Mobile */}
          <div style={{marginBottom:14}}>
            <div style={{marginBottom:4}}>
              <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:13,color:T.text}}>మొబైల్ నంబర్</div>
              <div style={{fontSize:11,color:T.textMuted}}>Mobile Number</div>
            </div>
            <input value={mobile} onChange={e=>setMobile(e.target.value.replace(/[^\d]/g,''))}
              placeholder="98765 43210" type="tel" maxLength={10}
              style={{width:'100%',border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                padding:'12px 14px',fontSize:14,color:T.text,background:T.inputBg,
                outline:'none',boxSizing:'border-box',letterSpacing:0.5}}/>
          </div>

          {/* Profile Photo — Photo + Library buttons */}
          <div style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
              <div>
                <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:13,color:T.text}}>ప్రొఫైల్ ఫోటో</div>
                <div style={{fontSize:11,color:T.textMuted}}>Profile Photo</div>
              </div>
              <span style={{fontSize:10,fontWeight:600,color:T.textMuted,background:T.bg3,
                padding:'2px 7px',borderRadius:6,letterSpacing:0.3}}>OPTIONAL</span>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              {/* Preview avatar */}
              <div style={{
                width:64,height:64,borderRadius:'50%',overflow:'hidden',flexShrink:0,
                background:T.bg3,border:`2px solid ${T.border}`,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>
                {photoPreview
                  ? <img src={photoPreview} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <span style={{fontSize:28,color:T.textMuted}}>👤</span>
                }
              </div>
              <div style={{flex:1,display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('reg-photo-camera')?.click()}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-2px)';
                    e.currentTarget.style.boxShadow='0 6px 18px rgba(208,2,27,0.5)';
                    e.currentTarget.style.background='linear-gradient(160deg,#FF1A35 0%,#C8001F 100%)';
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform='translateY(0)';
                    e.currentTarget.style.boxShadow='0 2px 10px rgba(208,2,27,0.3)';
                    e.currentTarget.style.background='linear-gradient(160deg,#E8001E 0%,#B0001A 100%)';
                  }}
                  style={{
                    flex:1,padding:'10px 8px',borderRadius:10,cursor:'pointer',border:'none',
                    background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                    boxShadow:'0 2px 10px rgba(208,2,27,0.3)',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                    transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                  }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span style={{fontSize:12,color:'white',fontWeight:800}}>Photo</span>
                </button>
                <button type="button" onClick={()=>document.getElementById('reg-photo-lib')?.click()}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-2px)';
                    e.currentTarget.style.boxShadow='0 6px 18px rgba(208,2,27,0.3)';
                    e.currentTarget.style.background='rgba(208,2,27,0.05)';
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform='translateY(0)';
                    e.currentTarget.style.boxShadow='none';
                    e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
                  }}
                  style={{
                    flex:1,padding:'10px 8px',borderRadius:10,cursor:'pointer',
                    border:`2px solid ${T.red}`,
                    background:T.isDark?T.bg3:'#FFFFFF',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:6,
                    transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                  }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span style={{fontSize:12,color:T.red,fontWeight:800}}>Library</span>
                </button>
              </div>
            </div>
            <input id="reg-photo-camera" type="file" accept="image/*" capture="user" style={{display:'none'}}
              onChange={e=>{
                const f = e.target.files?.[0]; if(!f) return;
                setPhoto(f); setPhotoPreview(URL.createObjectURL(f));
              }}/>
            <input id="reg-photo-lib" type="file" accept="image/*" style={{display:'none'}}
              onChange={e=>{
                const f = e.target.files?.[0]; if(!f) return;
                setPhoto(f); setPhotoPreview(URL.createObjectURL(f));
              }}/>
          </div>

          {/* OTP — optional */}
          <div>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:6}}>
              <div>
                <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:13,color:T.text}}>OTP ధృవీకరణ</div>
                <div style={{fontSize:11,color:T.textMuted}}>OTP Verification</div>
              </div>
              <span style={{fontSize:10,fontWeight:600,color:T.textMuted,background:T.bg3,
                padding:'2px 7px',borderRadius:6,letterSpacing:0.3}}>OPTIONAL</span>
            </div>
            <div style={{display:'flex',gap:8}}>
              <input value={otp} onChange={e=>setOtp(e.target.value.replace(/[^\d]/g,''))}
                placeholder={otpRequested?"Enter OTP":"Tap → Request OTP"}
                disabled={!otpRequested} maxLength={6} type="tel"
                style={{flex:1,border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                  padding:'12px 14px',fontSize:14,color:T.text,
                  background:otpRequested?T.inputBg:T.bg3,
                  outline:'none',boxSizing:'border-box',letterSpacing:1,
                  opacity:otpRequested?1:0.6}}/>
              <button type="button" onClick={handleRequestOTP}
                style={{
                  background:'linear-gradient(135deg,#E8001E,#B0001A)',
                  border:'none',borderRadius:10,padding:'10px 14px',
                  color:'white',fontSize:12,fontWeight:800,letterSpacing:0.5,
                  cursor:'pointer',whiteSpace:'nowrap',
                  boxShadow:'0 2px 8px rgba(208,2,27,0.3)',
                }}>
                {otpRequested?'Resend':'Request OTP'}
              </button>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div style={{
          background:'rgba(43,127,255,0.07)',border:'1px solid rgba(43,127,255,0.2)',
          borderRadius:10,padding:'10px 14px',marginBottom:12,
          fontSize:11,color:T.textMuted,lineHeight:1.5,
        }}>
          ℹ️ All fields are optional for testing. Tap <b>Submit</b> below to continue to the upload page.
        </div>

        {/* Submit */}
        <button onClick={handleSubmit}
          onMouseEnter={e=>{
            e.currentTarget.style.transform='translateY(-2px)';
            e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.55)';
            e.currentTarget.style.background='linear-gradient(135deg,#FF1A35,#C8001F)';
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.transform='translateY(0)';
            e.currentTarget.style.boxShadow='0 4px 14px rgba(208,2,27,0.35)';
            e.currentTarget.style.background='linear-gradient(135deg,#E8001E,#B0001A)';
          }}
          style={{
            width:'100%',
            background:'linear-gradient(135deg,#E8001E,#B0001A)',
            color:'white',border:'none',borderRadius:12,padding:'14px',
            cursor:'pointer',
            display:'flex',flexDirection:'column',alignItems:'center',gap:2,
            boxShadow:'0 4px 14px rgba(208,2,27,0.35)',
            transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
          }}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:16,letterSpacing:0.5,lineHeight:1.2}}>
            🚀 Submit and Go To Upload
          </span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,letterSpacing:0.8,opacity:0.95,lineHeight:1.2,marginTop:2}}>
            News / Information
          </span>
        </button>
      </div>

      <BottomNav active="upload" onChange={onNavigate} />
    </div>
  );
}


// ── My Profile — minimal view: name, constituency, role, mobile, photo only ──
// ════════════════════════════════════════════════════════════════════
// ── ADMIN DASHBOARD (DEMO) — mirrors Plan v1.3 (3-tier system) ──────
//    Visual mockup only. Sample data, no backend wiring. Entry point:
//    Profile → "Admin Dashboard". Founder reviews here & gives changes.
//    Switch role (Super / Master / Admin) to see tier differences.

export { UploadRegistrationScreen };
export default UploadRegistrationScreen;
