import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput } from './../../components/Form/FormElements.jsx';

function WhoIsWhoRequestForm({ onBack }) {
  const { T } = useAppTheme();
  const ACCENT = '#0D9488'; // teal
  const [name,        setName]        = useState('');
  const [designation, setDesignation] = useState('');
  const [phone,       setPhone]       = useState('');
  const [photo,       setPhoto]       = useState(null);   // File
  const [preview,     setPreview]     = useState(null);   // string url
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(null);
  const [apiError,    setApiError]    = useState('');

  function validate() {
    const e = {};
    if (!name.trim())        e.name = 'Name is required';
    if (!designation.trim()) e.designation = 'Designation is required';
    if (!phone.trim())       e.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s+/g,''))) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!photo)              e.photo = 'Photo is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('WHO');
    try {
      await fetch(`${API}/whoiswho-requests`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          request_id: reqId,
          person_name: name,
          designation,
          phone,
          has_photo: !!photo,
          status:'Pending Review',
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
      <SuccessScreen emoji="🌟" title="Profile Submitted!"
        message="The prominent person profile has been submitted for review. It will appear in Kurnool Local once approved."
        reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient={`linear-gradient(135deg,${ACCENT},#0F766E)`} emoji="🌟"
        title="Who is Who" subtitle="పట్టణ ప్రముఖులు" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:ACCENT,lineHeight:1.3}}>🌟 పట్టణ ప్రముఖుల వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:ACCENT,letterSpacing:0.4}}>Who is Who — Details</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>All fields are mandatory.</div>
          </div>

          <FLabel required>Name · పేరు</FLabel>
          <FInput value={name} onChange={setName}
            placeholder="e.g. టి. జి. భరత్ (T. G. Bharath)"
            error={errors.name}/>

          <div style={{marginTop:12}}>
            <FLabel required>Designation · హోదా</FLabel>
            <FInput value={designation} onChange={setDesignation}
              placeholder="e.g. MLA · IAS Officer · Principal · Doctor · Advocate · Business Person"
              error={errors.designation}/>
            <div style={{fontSize:10.5,color:T.textMuted,marginTop:4,lineHeight:1.45}}>
              Enter the official title or designation (free text — any role allowed).
            </div>
          </div>

          <div style={{marginTop:12}}>
            <FLabel required>Phone Number · ఫోన్ నంబర్</FLabel>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
              maxLength={10} inputMode="numeric" placeholder="10-digit mobile number"
              style={{width:'100%',border:`1.5px solid ${errors.phone?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:T.inputBg,boxSizing:'border-box',letterSpacing:0.5}}/>
            {errors.phone && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.phone}</div>}
          </div>

          {/* Photo upload — single photo, Camera + Library buttons */}
          <div style={{marginTop:14}}>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
              <FLabel required>Photo · ఫోటో</FLabel>
              <span style={{fontSize:11,color:T.textMuted}}>(Only 1 photo)</span>
            </div>

            {!preview ? (
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('whoiswho-camera')?.click()}
                  style={{flex:1,aspectRatio:'2/1',borderRadius:12,cursor:'pointer',border:'none',
                    background:`linear-gradient(160deg,${ACCENT} 0%,#0F766E 100%)`,
                    boxShadow:`0 3px 12px ${ACCENT}55`,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                    <span style={{fontSize:13,color:'white',fontWeight:800,lineHeight:1}}>Camera / Selfie</span>
                    <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>Take a picture</span>
                  </div>
                </button>
                <button type="button" onClick={()=>document.getElementById('whoiswho-lib')?.click()}
                  style={{flex:1,aspectRatio:'2/1',borderRadius:12,cursor:'pointer',
                    border:`2px solid ${ACCENT}`, background:T.isDark?T.bg3:'#FFFFFF',
                    display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                    <span style={{fontSize:13,color:ACCENT,fontWeight:800,lineHeight:1}}>Library</span>
                    <span style={{fontSize:9,color:ACCENT,marginTop:2}}>From gallery</span>
                  </div>
                </button>
              </div>
            ) : (
              <div style={{width:'100%',aspectRatio:'1',position:'relative',borderRadius:12,overflow:'hidden',
                border:`1.5px solid ${T.border}`,background:'#000',display:'flex',flexDirection:'column',maxWidth:240,marginInline:'auto'}}>
                <div style={{flex:1,overflow:'hidden',background:'#000'}}>
                  <img src={preview} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </div>
                <button type="button" onClick={()=>{ setPhoto(null); setPreview(null); }}
                  style={{width:'100%',padding:'7px 0',background:`${ACCENT}E6`,border:'none',
                    color:'white',fontSize:11,fontWeight:700,letterSpacing:0.5,cursor:'pointer',flexShrink:0}}>
                  Delete / Re-take
                </button>
              </div>
            )}
            <input id="whoiswho-camera" type="file" accept="image/*" capture="user" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return;
                setPhoto(f); setPreview(URL.createObjectURL(f)); e.target.value=''; }}/>
            <input id="whoiswho-lib" type="file" accept="image/*" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return;
                setPhoto(f); setPreview(URL.createObjectURL(f)); e.target.value=''; }}/>
            {errors.photo && <div style={{color:T.red,fontSize:10,marginTop:6,textAlign:'center'}}>{errors.photo}</div>}
          </div>
        </FCard>

        {apiError && (
          <div style={{background:'#FEE',border:'1px solid #FCC',borderRadius:10,padding:'10px 12px',color:T.red,fontSize:12,marginBottom:14}}>
            {apiError}
          </div>
        )}
      </div>

      {/* Submit bar (sticky bottom) */}
      <div style={{flexShrink:0,padding:'12px 16px 18px',background:T.bg,borderTop:`1px solid ${T.border}`}}>
        <button type="button" onClick={handleSubmit} disabled={loading}
          style={{width:'100%',padding:'14px 16px',borderRadius:12,border:'none',cursor:loading?'wait':'pointer',
            background:`linear-gradient(135deg,${ACCENT},#0F766E)`,
            color:'white',fontWeight:900,fontSize:15,letterSpacing:0.3,
            boxShadow:`0 4px 16px ${ACCENT}66`,opacity:loading?0.7:1,
            fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>
          {loading ? 'Sending…' : '🌟 ప్రముఖుల వివరాలు పంపండి'}
        </button>
      </div>
    </div>
  );
}


export { WhoIsWhoRequestForm };
export default WhoIsWhoRequestForm;
