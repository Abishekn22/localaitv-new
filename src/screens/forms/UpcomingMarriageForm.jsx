import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import { SuccessScreen, FCard, FLabel, FInput, SubmitBtn } from './../../components/Form/FormElements.jsx';

function UpcomingMarriageForm({ onBack }) {
  const { T } = useAppTheme();
  const [groomName,    setGroomName]    = useState('');
  const [brideName,    setBrideName]    = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [hour,         setHour]         = useState('');     // 1-12
  const [minute,       setMinute]       = useState('');     // 00, 05, ... 55
  const [ampm,         setAmPm]         = useState('AM');   // AM/PM
  const [venue,        setVenue]        = useState('');
  const [location,     setLocation]     = useState('');
  const [inviteFile,   setInviteFile]   = useState(null);
  const [inviteVideo,  setInviteVideo]  = useState(null);
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [apiError,     setApiError]     = useState('');

  const marriageTime = hour && minute ? `${hour}:${minute} ${ampm}` : '';

  function validate() {
    const e = {};
    if (!groomName.trim())    e.groomName    = 'Groom name is required';
    if (!brideName.trim())    e.brideName    = 'Bride name is required';
    if (!marriageDate)        e.marriageDate = 'Marriage date is required';
    if (!venue.trim())        e.venue        = 'Venue is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('WED');
    try {
      await fetch(`${API}/marriage-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: reqId, type: 'upcoming',
          groom_name: groomName, bride_name: brideName,
          marriage_date: marriageDate, marriage_time: marriageTime,
          venue, location, status: 'Pending Review',
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
      <SuccessScreen emoji="💒" title="Marriage Announcement Submitted!"
        message="Your marriage announcement has been submitted. It will be broadcast before the wedding date."
        reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      {/* ── Compact Marriage Header — royal purple/magenta gradient ── */}
      <div style={{
        background:'linear-gradient(135deg,#4A148C 0%,#7B1FA2 50%,#AB47BC 100%)',
        padding:'48px 18px 20px',flexShrink:0,position:'relative',
        boxShadow:'0 4px 18px rgba(123,31,162,0.35)',overflow:'hidden',
      }}>
        {/* Decorative shine — golden glow */}
        <div style={{position:'absolute',top:-30,right:-30,width:160,height:160,
          borderRadius:'50%',background:'radial-gradient(circle,rgba(255,215,100,0.22),transparent 70%)',
          pointerEvents:'none'}}/>
        {/* Subtle bottom-left glow */}
        <div style={{position:'absolute',bottom:-40,left:-30,width:120,height:120,
          borderRadius:'50%',background:'radial-gradient(circle,rgba(255,182,193,0.15),transparent 70%)',
          pointerEvents:'none'}}/>

        <button onClick={onBack} style={{
          position:'absolute',top:52,left:14,zIndex:10,
          background:'rgba(255,255,255,0.22)',border:'none',
          borderRadius:8,width:34,height:34,
          color:'white',fontSize:18,fontWeight:700,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>←</button>

        <div style={{textAlign:'center',position:'relative',zIndex:1}}>
          {/* Small wedding image — falls back to emoji 💒 */}
          <div style={{
            width:64,height:64,borderRadius:'50%',overflow:'hidden',
            margin:'0 auto 8px',background:'rgba(255,255,255,0.2)',
            border:'2px solid rgba(255,255,255,0.45)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 3px 10px rgba(0,0,0,0.25)',
          }}>
            <img src="wedding-banner.jpg"
              onError={e=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex';}}
              alt=""
              style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
            {/* Cartoon bride + groom fallback */}
            <div style={{display:'none',alignItems:'center',justifyContent:'center',gap:2,lineHeight:1}}>
              <span style={{fontSize:26,filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}>👳🏽‍♂️</span>
              <span style={{fontSize:26,filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'}}>👰🏽‍♀️</span>
            </div>
          </div>

          {/* Telugu BIG on top */}
          <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:26,
            color:'white',letterSpacing:0.3,lineHeight:1.2,textShadow:'0 1px 3px rgba(0,0,0,0.3)'}}>
            వివాహ శుభలేఖ
          </div>
          {/* English smaller below */}
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:14,
            color:'rgba(255,255,255,0.9)',letterSpacing:0.6,marginTop:4,textShadow:'0 1px 2px rgba(0,0,0,0.2)'}}>
            Marriage Invitation
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        {/* Bride & Groom */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#92400e',lineHeight:1.3}}>🤵 పెళ్ళికొడుకు &amp; 👰 పెళ్ళికూతురు వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#92400e',letterSpacing:0.4}}>Groom &amp; Bride Details</div>
          </div>

          {/* Groom Name */}
          <div style={{marginBottom:14}}>
            <FLabel required>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:18}}>🤵</span>
                <span>Groom Name / పెళ్ళికొడుకు పేరు</span>
              </span>
            </FLabel>
            <FInput value={groomName} onChange={setGroomName}
              placeholder="e.g. Ravi Kumar" error={errors.groomName}/>
          </div>

          {/* Bride Name */}
          <div>
            <FLabel required>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:18}}>👰</span>
                <span>Bride Name / పెళ్ళికూతురు పేరు</span>
              </span>
            </FLabel>
            <FInput value={brideName} onChange={setBrideName}
              placeholder="e.g. Priya Devi" error={errors.brideName}/>
          </div>
        </FCard>

        {/* Date, Time, Venue */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#92400e',lineHeight:1.3}}>📅 వివాహ వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#92400e',letterSpacing:0.4}}>Marriage Details</div>
          </div>

          {/* Marriage Date */}
          <div style={{marginBottom:14}}>
            <FLabel required>Marriage Date</FLabel>
            <input type="date" value={marriageDate}
              onChange={e=>setMarriageDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{width:'100%',border:`1.5px solid ${errors.marriageDate?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:T.inputBg,boxSizing:'border-box'}}/>
            {errors.marriageDate && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.marriageDate}</div>}
          </div>

          {/* Marriage Time — Hour + Minute + AM/PM dropdowns */}
          <div style={{marginBottom:14}}>
            <FLabel>Marriage Time</FLabel>
            <div style={{display:'flex',gap:8}}>
              <select value={hour} onChange={e=>setHour(e.target.value)}
                style={{flex:1,border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                  padding:'12px 10px',fontSize:14,color:T.text,background:T.inputBg,
                  boxSizing:'border-box',cursor:'pointer'}}>
                <option value="">Hour</option>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(h=>(
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <select value={minute} onChange={e=>setMinute(e.target.value)}
                style={{flex:1,border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                  padding:'12px 10px',fontSize:14,color:T.text,background:T.inputBg,
                  boxSizing:'border-box',cursor:'pointer'}}>
                <option value="">Minute</option>
                {Array.from({length:60},(_,i)=>String(i).padStart(2,'0')).map(m=>(
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select value={ampm} onChange={e=>setAmPm(e.target.value)}
                style={{flex:1,border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                  padding:'12px 10px',fontSize:14,color:T.text,background:T.inputBg,
                  boxSizing:'border-box',cursor:'pointer',fontWeight:700}}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
            {hour && minute && (
              <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>
                Selected: {hour}:{minute} {ampm}
              </div>
            )}
          </div>

          <div style={{marginBottom:14}}>
            <FLabel required>Venue / Kalyana Mandapam</FLabel>
            <FInput value={venue} onChange={setVenue}
              placeholder="e.g. Sri Rama Kalyana Mandapam" error={errors.venue}/>
          </div>
          <div>
            <FLabel>Location / Address</FLabel>
            <FInput value={location} onChange={setLocation}
              placeholder="e.g. Kurnool, Andhra Pradesh"/>
          </div>
        </FCard>

        {/* Upload invitation */}
        <FCard>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,
            color:'#92400e',marginBottom:12,letterSpacing:0.5}}>📎 Upload Invitation</div>

          <div style={{display:'flex',gap:10}}>
            {/* Invitation Card — red button */}
            <button type="button" onClick={()=>document.getElementById('wed-photo')?.click()}
              onMouseEnter={e=>{
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
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
              }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',lineHeight:1.1}}>
                <span style={{fontSize:13,color:'white',fontWeight:800}}>
                  {inviteFile?'✓ Card':'Invitation'}
                </span>
                <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>
                  {inviteFile?(inviteFile.name||'').slice(0,18):'Card / Photo'}
                </span>
              </div>
            </button>
            <input id="wed-photo" type="file" accept="image/*,.pdf" style={{display:'none'}}
              onChange={e=>setInviteFile(e.target.files?.[0]||null)}/>

            {/* Invitation Video — red button */}
            <button type="button" onClick={()=>document.getElementById('wed-video')?.click()}
              onMouseEnter={e=>{
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
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
              }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',lineHeight:1.1}}>
                <span style={{fontSize:13,color:'white',fontWeight:800}}>
                  {inviteVideo?'✓ Video':'Invitation'}
                </span>
                <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>
                  {inviteVideo?(inviteVideo.name||'').slice(0,18):'Video'}
                </span>
              </div>
            </button>
            <input id="wed-video" type="file" accept="video/*" style={{display:'none'}}
              onChange={e=>setInviteVideo(e.target.files?.[0]||null)}/>
          </div>
        </FCard>

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        <SubmitBtn labelTe="💒 వివాహ శుభలేఖ సమర్పించండి" label="Submit Marriage Invitation" onClick={handleSubmit} loading={loading}/>
      </div>
    </div>
  );
}

export { UpcomingMarriageForm };
export default UpcomingMarriageForm;
