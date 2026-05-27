import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput, SubmitBtn } from './../../components/Form/FormElements.jsx';

function RentalForm({ onBack }) {
  const { T } = useAppTheme();
  const [propType,    setPropType]    = useState('Flat');
  const [bhk,         setBhk]         = useState('');
  const [location,    setLocation]    = useState('');
  const [rent,        setRent]        = useState('');
  const [deposit,     setDeposit]     = useState('');
  const [available,   setAvailable]   = useState('');
  const [furnishing,  setFurnishing]  = useState('Semi-Furnished');
  const [description, setDescription] = useState('');
  const [contact,     setContact]     = useState('');
  // Multi-media (max 3)
  const [mediaFiles,    setMediaFiles]    = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(null);
  const [apiError,    setApiError]    = useState('');

  // Voice input
  const [recording,   setRecording]   = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const VOICE_SUPPORTED = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  function startRentVoice() {
    if (!VOICE_SUPPORTED) { alert('Voice input is not supported on this browser. Please type your details.'); return; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'te-IN';
    rec.continuous = false;
    rec.interimResults = true;
    setRecording(true); setInterimText('');
    rec.onresult = (e) => {
      let interim='', final='';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      setInterimText(interim);
      if (final) {
        setDescription(p => (p + ' ' + final).trim());
        setInterimText(''); setRecording(false);
      }
    };
    rec.onerror = () => { setRecording(false); setInterimText(''); };
    rec.onend   = () => { setRecording(false); setInterimText(''); };
    recognitionRef.current = rec; rec.start();
  }
  function stopRentVoice() {
    try { recognitionRef.current?.stop(); } catch(e) {}
    setRecording(false); setInterimText('');
  }

  const PROP_TYPES = ['Flat','House','Room','PG','Office','Shop','Land','Warehouse'];
  const accentColor = '#00838F';

  function validate() {
    const e = {};
    if (!location.trim()) e.location = 'Location is required';
    if (!rent.trim())     e.rent     = 'Monthly rent is required';
    if (!contact.trim())  e.contact  = 'Contact number is required';
    else if (!/^[6-9]\d{9}$/.test(contact.replace(/[\s\-]/g,''))) e.contact = 'Enter a valid 10-digit mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('RENT');
    try {
      await fetch(`${API}/rental-listings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: reqId, property_type: propType, bhk, location,
          monthly_rent: rent, deposit, available_from: available,
          furnishing, description, contact, status: 'Pending Review',
        }),
      });
      setSuccess(reqId);
    } catch (e) {
      setApiError('Submission failed. Please check your connection and try again.');
    }
    setLoading(false);
  }

  if (success) return (
    <SuccessScreen emoji="🏠" title="Rental Listed!"
      message="Your rental listing has been submitted and will be broadcast on your local channel soon."
      reqId={success} onDone={onBack}/>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient={`linear-gradient(135deg,#005F6B,#00838F)`} emoji="🏠"
        title="Rentals" subtitle="అద్దెకు" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        {/* Property Type */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:accentColor,lineHeight:1.3}}>🏠 ఆస్తి వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:accentColor,letterSpacing:0.4}}>Property Details</div>
          </div>

          {/* Property Type — DROPDOWN */}
          <div style={{marginBottom:14}}>
            <FLabel required>Property Type</FLabel>
            <select value={propType} onChange={e=>setPropType(e.target.value)}
              style={{width:'100%',border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                padding:'12px 14px',fontSize:14,color:T.text,background:T.inputBg,
                boxSizing:'border-box',cursor:'pointer',fontWeight:600}}>
              {PROP_TYPES.map(t=>(
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <FLabel>BHK / Size</FLabel>
              <FInput value={bhk} onChange={setBhk} placeholder="e.g. 2BHK, 500 sqft"/>
            </div>
            <div>
              <FLabel>Available From</FLabel>
              <FInput value={available} onChange={setAvailable} placeholder="e.g. Immediate, June 1"/>
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <FLabel required>Location / Area</FLabel>
            <FInput value={location} onChange={setLocation}
              placeholder="e.g. Kurnool, Nandyal Road" error={errors.location}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <FLabel required>Monthly Rent (₹)</FLabel>
              <FInput value={rent} onChange={setRent} placeholder="e.g. ₹8,000" error={errors.rent}/>
            </div>
            <div>
              <FLabel>Deposit (₹)</FLabel>
              <FInput value={deposit} onChange={setDeposit} placeholder="e.g. ₹50,000"/>
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <FLabel>Furnishing</FLabel>
            <div style={{display:'flex',gap:8}}>
              {['Furnished','Semi-Furnished','Unfurnished'].map(f=>(
                <button key={f} onClick={()=>setFurnishing(f)} style={{
                  flex:1,padding:'10px 6px',borderRadius:10,cursor:'pointer',
                  background: furnishing===f ? `rgba(0,131,143,0.12)` : T.bg3,
                  border: `2px solid ${furnishing===f ? accentColor : T.border}`,
                  color: furnishing===f ? accentColor : T.textMuted,
                  fontWeight:700,fontSize:11,
                }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Additional Details with voice record */}
          <div style={{marginBottom:14}}>
            <FLabel>Additional Details</FLabel>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Type Text /Record Voice</div>
            <textarea value={recording && interimText ? description + ' ' + interimText : description}
              onChange={e=>setDescription(e.target.value)}
              placeholder="Amenities, floor, parking, nearby landmarks…"
              style={{width:'100%',border:`1.5px solid ${recording?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:recording?'rgba(208,2,27,0.04)':T.inputBg,
                height:90,resize:'none',boxSizing:'border-box',lineHeight:1.6,
                fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}/>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600}}>
                {description.trim() ? description.trim().split(/\s+/).filter(Boolean).length : 0} పదాలు / words
              </div>
              {VOICE_SUPPORTED && (
                <button type="button" onClick={()=>recording?stopRentVoice():startRentVoice()}
                    onMouseEnter={e=>{
                      e.currentTarget.style.transform='translateY(-2px) scale(1.06)';
                      e.currentTarget.style.boxShadow='0 6px 18px rgba(208,2,27,0.6)';
                      e.currentTarget.style.background='linear-gradient(135deg,#FF1A35,#C8001F)';
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.transform='translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow='0 2px 10px rgba(208,2,27,0.35)';
                      e.currentTarget.style.background = recording
                        ?'linear-gradient(135deg,#9A0015,#D0021B)'
                        :'linear-gradient(135deg,#E8001E,#B0001A)';
                    }}
                  style={{
                    background: recording
                      ?'linear-gradient(135deg,#9A0015,#D0021B)'
                      :'linear-gradient(135deg,#E8001E,#B0001A)',
                    border:'none', borderRadius:24, padding:'8px 18px',
                    color:'white', fontSize:12, fontWeight:800, letterSpacing:0.5,
                    cursor:'pointer',
                    display:'flex', alignItems:'center', gap:7,
                    boxShadow:'0 2px 10px rgba(208,2,27,0.35)',
                  }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="11" rx="3"/>
                    <path d="M5 10a7 7 0 0014 0"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                  <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>{recording?'ఆపండి / Stop':'రికార్డ్ / Record'}</span>
                </button>
              )}
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <FLabel required>Contact / WhatsApp</FLabel>
            <FInput value={contact} onChange={setContact}
              placeholder="98765 43210" type="tel" error={errors.contact}/>
          </div>

          {/* Property Photos / Videos — Maximum 3 */}
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
            <FLabel>Property Photos / Videos</FLabel>
            <span style={{fontSize:11,color:T.textMuted}}>(Maximum 3)</span>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
              document.getElementById('rent-photo-camera')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length >= 3) return;
                e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.6)';
                e.currentTarget.style.background='linear-gradient(160deg,#FF1A35 0%,#C8001F 100%)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.boxShadow='0 3px 12px rgba(208,2,27,0.35)';
                e.currentTarget.style.background='linear-gradient(160deg,#E8001E 0%,#B0001A 100%)';
              }}
              style={{
                flex:1,padding:'14px 8px',borderRadius:12,cursor:'pointer',border:'none',
                background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                boxShadow:'0 3px 12px rgba(208,2,27,0.35)',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                opacity: mediaPreviews.length >= 3 ? 0.55 : 1,
              }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                <span style={{fontSize:13,color:'white',fontWeight:800,lineHeight:1}}>Photo</span>
                <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>Take a picture</span>
              </div>
            </button>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
              document.getElementById('rent-video-camera')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length >= 3) return;
                e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.6)';
                e.currentTarget.style.background='linear-gradient(160deg,#FF1A35 0%,#C8001F 100%)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.boxShadow='0 3px 12px rgba(208,2,27,0.35)';
                e.currentTarget.style.background='linear-gradient(160deg,#E8001E 0%,#B0001A 100%)';
              }}
              style={{
                flex:1,padding:'14px 8px',borderRadius:12,cursor:'pointer',border:'none',
                background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                boxShadow:'0 3px 12px rgba(208,2,27,0.35)',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                opacity: mediaPreviews.length >= 3 ? 0.55 : 1,
              }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                <span style={{fontSize:13,color:'white',fontWeight:800,lineHeight:1}}>Video</span>
                <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>Record a clip</span>
              </div>
            </button>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
              document.getElementById('rent-library')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length >= 3) return;
                e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow='0 8px 22px rgba(0,131,143,0.4)';
                e.currentTarget.style.background='rgba(0,131,143,0.06)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.boxShadow='none';
                e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
              }}
              style={{
                flex:1,padding:'14px 8px',borderRadius:12,cursor:'pointer',
                border:`2px solid ${accentColor}`,
                background:T.isDark?T.bg3:'#FFFFFF',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                opacity: mediaPreviews.length >= 3 ? 0.55 : 1,
              }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                <span style={{fontSize:13,color:accentColor,fontWeight:800,lineHeight:1}}>Library</span>
                <span style={{fontSize:9,color:accentColor,marginTop:2,fontWeight:600}}>Files &amp; Gallery</span>
              </div>
            </button>
          </div>
          <input id="rent-photo-camera" type="file" accept="image/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          <input id="rent-video-camera" type="file" accept="video/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          <input id="rent-library" type="file" accept="image/*,video/*" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          {/* Thumbnail grid (max 3) */}
          {mediaPreviews.length > 0 && (
            <div style={{display:'flex',gap:8}}>
              {mediaPreviews.map((src,i)=>{
                const file = mediaFiles[i];
                const isVideo = file && file.type && file.type.startsWith('video/');
                return (
                  <div key={i} style={{flex:1,aspectRatio:'1',position:'relative',borderRadius:12,overflow:'hidden',
                    border:`1.5px solid ${T.border}`,background:'#000',
                    display:'flex',flexDirection:'column'}}>
                    <div style={{flex:1,position:'relative',overflow:'hidden',background:'#000'}}>
                      {isVideo ? (
                        <>
                          <video src={src} preload="metadata" muted
                            style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
                            width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.92)',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            boxShadow:'0 2px 6px rgba(0,0,0,0.4)',pointerEvents:'none'}}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="#D0021B">
                              <polygon points="5,3 19,12 5,21"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      )}
                    </div>
                    <button type="button" onClick={()=>{
                      setMediaFiles(prev=>prev.filter((_,j)=>j!==i));
                      setMediaPreviews(prev=>prev.filter((_,j)=>j!==i));
                    }} style={{
                      width:'100%',padding:'5px 0',background:'rgba(208,2,27,0.92)',border:'none',
                      color:'white',fontSize:10,fontWeight:700,letterSpacing:0.5,cursor:'pointer',flexShrink:0,
                    }}>Delete</button>
                  </div>
                );
              })}
              {Array.from({length: 3 - mediaPreviews.length}).map((_,i)=>(
                <div key={`rs${i}`} style={{flex:1,aspectRatio:'1'}}/>
              ))}
            </div>
          )}
        </FCard>

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        <SubmitBtn labelTe="🏠 అద్దె జాబితా సమర్పించండి" label="Submit Rental Listing" onClick={handleSubmit} loading={loading}/>
      </div>
    </div>
  );
}



export { RentalForm };
export default RentalForm;
