import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput, SubmitBtn } from './../../components/Form/FormElements.jsx';

function ShoppingAdForm({ onBack }) {
  const { T } = useAppTheme();
  const [shopName,    setShopName]    = useState('');
  const [adDetails,   setAdDetails]   = useState('');
  const [recording,   setRecording]   = useState(false);
  const [interimText, setInterimText] = useState('');
  const [location,    setLocation]    = useState('');
  const [contactPhone,setContactPhone]= useState('');
  const [mediaFiles,  setMediaFiles]  = useState([]); // up to 3 files
  const [mediaPreviews,setMediaPreviews]= useState([]); // object URLs (max 3)
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(null);
  const [apiError,    setApiError]    = useState('');

  const recognitionRef = useRef(null);
  const VOICE_SUPPORTED = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  function validate() {
    const e = {};
    if (!shopName.trim())  e.shopName  = 'Shop / Establishment name is required';
    if (!adDetails.trim()) e.adDetails = 'Advertisement details are required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function startShopVoice() {
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
        setAdDetails(p => (p + ' ' + final).trim());
        setInterimText(''); setRecording(false);
      }
    };
    rec.onerror = () => { setRecording(false); setInterimText(''); };
    rec.onend   = () => { setRecording(false); setInterimText(''); };
    recognitionRef.current = rec; rec.start();
  }
  function stopShopVoice() {
    try { recognitionRef.current?.stop(); } catch(e) {}
    setRecording(false); setInterimText('');
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('SHP');
    try {
      await fetch(`${API}/shopping-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: reqId, shop_name: shopName,
          location: location, contact_phone: contactPhone,
          ad_details: adDetails, status: 'Pending Review',
        }),
      });
      setSuccess(reqId);
    } catch (e) {
      setApiError('Submission failed. Please check your connection and try again.');
    }
    setLoading(false);
  }

  if (success) return (
    <div style={{width:'100%',height:'100%',background:'#f7f8fa'}}>
      <SuccessScreen emoji="🛍️" title="Ad Submitted!"
        message="Your shopping advertisement has been submitted. Our team will review and broadcast it soon."
        reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient="linear-gradient(135deg,#b45309,#f59e0b)" emoji="🛍️"
        title="Shopping Advertisement" subtitle="వ్యాపార ప్రకటన" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#b45309',lineHeight:1.3}}>🏪 షాపు వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#b45309',letterSpacing:0.4}}>Shop Details</div>
          </div>

          <div style={{marginBottom:14}}>
            <FLabel required>Shop / Establishment Name</FLabel>
            <FInput value={shopName} onChange={setShopName}
              placeholder="e.g. Sri Lakshmi Stores" error={errors.shopName}/>
          </div>

          <div style={{marginBottom:14}}>
            <FLabel>Add Location / Street Name / Area</FLabel>
            <FInput value={location} onChange={setLocation}
              placeholder="e.g. Main Bazaar Road, Gandhi Nagar"/>
          </div>

          {/* Advertisement Details with Type Text / Record Voice */}
          <div style={{marginBottom:14}}>
            <FLabel required>Advertisement Details</FLabel>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Type Text /Record Voice</div>
            <textarea value={recording && interimText ? adDetails + ' ' + interimText : adDetails}
              onChange={e=>setAdDetails(e.target.value)}
              placeholder="Describe your offer, products, discounts, timing etc…"
              style={{width:'100%',border:`1.5px solid ${recording?T.red:errors.adDetails?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:recording?'rgba(208,2,27,0.04)':T.inputBg,
                height:100,resize:'none',boxSizing:'border-box',lineHeight:1.6,
                fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}/>
            {errors.adDetails && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.adDetails}</div>}
            {/* Word count + Record button */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600}}>
                {adDetails.trim() ? adDetails.trim().split(/\s+/).filter(Boolean).length : 0} పదాలు / words
              </div>
              {VOICE_SUPPORTED && (
                <button type="button" onClick={()=>recording?stopShopVoice():startShopVoice()}
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
        </FCard>

        {/* Upload — 3 source buttons, up to 3 files allowed */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#b45309',lineHeight:1.3}}>📸 ఫోటో / వీడియో / ఫైల్ అప్‌లోడ్</div>
            <div style={{display:'flex',alignItems:'baseline',gap:8}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#b45309',letterSpacing:0.4}}>Upload Photo / Video / File</div>
              <span style={{fontSize:11,color:T.textMuted}}>(Max 3 files · {mediaPreviews.length}/3)</span>
            </div>
          </div>

          {/* 3 source buttons — disabled when 3 files already uploaded */}
          <div style={{display:'flex',gap:8,marginBottom:mediaPreviews.length?12:0}}>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length>=3){ alert('Maximum 3 files allowed. Delete one to upload another.'); return; }
              document.getElementById('shp-photo-camera')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length>=3) return;
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
                flex:1,padding:'14px 6px',borderRadius:12,cursor:'pointer',border:'none',
                background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                boxShadow:'0 3px 12px rgba(208,2,27,0.35)',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
                opacity: mediaPreviews.length>=3 ? 0.55 : 1,
              }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span style={{fontSize:11,color:'white',fontWeight:800,lineHeight:1}}>Take Photo</span>
            </button>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length>=3){ alert('Maximum 3 files allowed. Delete one to upload another.'); return; }
              document.getElementById('shp-video-camera')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length>=3) return;
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
                flex:1,padding:'14px 6px',borderRadius:12,cursor:'pointer',border:'none',
                background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                boxShadow:'0 3px 12px rgba(208,2,27,0.35)',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
                opacity: mediaPreviews.length>=3 ? 0.55 : 1,
              }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <span style={{fontSize:11,color:'white',fontWeight:800,lineHeight:1}}>Take Video</span>
            </button>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length>=3){ alert('Maximum 3 files allowed. Delete one to upload another.'); return; }
              document.getElementById('shp-library')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length>=3) return;
                e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow='0 8px 22px rgba(180,83,9,0.4)';
                e.currentTarget.style.background='rgba(180,83,9,0.06)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.boxShadow='none';
                e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
              }}
              style={{
                flex:1,padding:'14px 6px',borderRadius:12,cursor:'pointer',
                border:`2px solid #b45309`,
                background:T.isDark?T.bg3:'#FFFFFF',
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
                opacity: mediaPreviews.length>=3 ? 0.55 : 1,
              }}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span style={{fontSize:11,color:'#b45309',fontWeight:800,lineHeight:1}}>Upload File</span>
            </button>
          </div>

          {/* Hidden inputs — append into the array, max 3 */}
          <input id="shp-photo-camera" type="file" accept="image/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) { return; }
              if(mediaPreviews.length>=3){ e.target.value=''; alert('Maximum 3 files allowed.'); return; }
              setMediaFiles(p=>[...p,f]); setMediaPreviews(p=>[...p,URL.createObjectURL(f)]); e.target.value='';
            }}/>
          <input id="shp-video-camera" type="file" accept="video/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) { return; }
              if(mediaPreviews.length>=3){ e.target.value=''; alert('Maximum 3 files allowed.'); return; }
              setMediaFiles(p=>[...p,f]); setMediaPreviews(p=>[...p,URL.createObjectURL(f)]); e.target.value='';
            }}/>
          <input id="shp-library" type="file" accept="image/*,video/*" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) { return; }
              if(mediaPreviews.length>=3){ e.target.value=''; alert('Maximum 3 files allowed.'); return; }
              setMediaFiles(p=>[...p,f]); setMediaPreviews(p=>[...p,URL.createObjectURL(f)]); e.target.value='';
            }}/>

          {/* Previews — up to 3, each individually removable */}
          {mediaPreviews.map((src,i)=>(
            <div key={i} style={{position:'relative',borderRadius:12,overflow:'hidden',
              border:`1.5px solid ${T.border}`,background:'#000',marginBottom:8}}>
              {mediaFiles[i]?.type?.startsWith('video/')
                ? <video src={src} controls
                    style={{width:'100%',display:'block',maxHeight:240,background:'#000'}}/>
                : <img src={src} alt=""
                    style={{width:'100%',display:'block',maxHeight:240,objectFit:'cover'}}/>
              }
              <div style={{padding:'8px 12px',background:T.bg2,borderTop:`1px solid ${T.border}`,
                display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:11,color:T.textMuted,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {mediaFiles[i]?.type?.startsWith('video/')?'🎥':'📷'} {mediaFiles[i]?.name}
                </span>
                <button type="button" onClick={()=>{
                    setMediaFiles(p=>p.filter((_,j)=>j!==i));
                    setMediaPreviews(p=>p.filter((_,j)=>j!==i));
                  }}
                  style={{background:'rgba(208,2,27,0.92)',border:'none',borderRadius:8,
                    padding:'6px 14px',color:'white',fontSize:11,fontWeight:700,cursor:'pointer'}}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </FCard>

        {/* Contact phone — optional, below the upload section */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#b45309',lineHeight:1.3}}>📞 సంప్రదింపు నంబర్</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#b45309',letterSpacing:0.4}}>Contact Phone Number (Optional)</div>
          </div>
          <FInput value={contactPhone} type="tel"
            onChange={v=>setContactPhone(String(v).replace(/\D/g,'').slice(0,10))}
            placeholder="10-digit mobile number (optional)"/>
        </FCard>

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        <SubmitBtn labelTe="🛍️ ప్రకటన సమర్పించండి" label="Submit Advertisement" onClick={handleSubmit} loading={loading}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── FORM: JOBS ────────────────────────────────────────────────
// Job Title, Company, Description, Location, Contact

export { ShoppingAdForm };
export default ShoppingAdForm;
