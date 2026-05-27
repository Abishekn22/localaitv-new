import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genId, uploadPhotos } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput } from './../../components/Form/FormElements.jsx';

function PublicVoiceRequestForm({ onBack }) {
  const { T } = useAppTheme();
  const ACCENT = '#DC2626'; // civic red
  const MAX_SECS = 120;     // 2 minutes
  const [issueName, setIssueName] = useState('');
  const [uploader,  setUploader]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [video,     setVideo]     = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [duration,  setDuration]  = useState(0);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(null);
  const [apiError,  setApiError]  = useState('');

  function acceptVideo(file) {
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    const url = URL.createObjectURL(file);
    probe.onloadedmetadata = () => {
      const secs = probe.duration;
      URL.revokeObjectURL(url);
      if (!isFinite(secs) || secs <= 0) { alert('Could not read the video duration. Please try a different file.'); return; }
      if (secs > MAX_SECS) {
        alert(`Maximum allowed video duration is 2 minutes (${Math.floor(secs/60)}:${String(Math.round(secs%60)).padStart(2,'0')} provided).`);
        return;
      }
      setVideo(file);
      setPreview(URL.createObjectURL(file));
      setDuration(secs);
    };
    probe.onerror = () => { URL.revokeObjectURL(url); alert('Could not read the video. Please try a different file.'); };
    probe.src = url;
  }

  function validate() {
    const e = {};
    if (!issueName.trim()) e.issueName = 'Issue name is required';
    if (!uploader.trim())  e.uploader  = 'Uploader name is required';
    if (!phone.trim())     e.phone     = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(phone.replace(/\s+/g,''))) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!video)            e.video     = 'Issue video is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('PV');
    try {
      const videoUrls = video
        ? await uploadPhotos([video], reqId, 'voice')
        : [];
      await fetch(`${API}/public-voice-requests`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          request_id: reqId,
          issue_name: issueName,
          uploader_name: uploader,
          phone,
          duration_seconds: Math.round(duration),
          status:'Pending Review',
          photo_uris: videoUrls,
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
      <SuccessScreen emoji="📢" title="Issue Reported!"
        message="మీ ఫిర్యాదు అందింది. (Your issue has been submitted. Concerned authorities will be notified for action.)"
        reqId={success} onDone={onBack}/>
    </div>
  );

  const ISSUES = [
    ['💧','Drainage'],['⚡','Electricity'],['🛣️','Road'],['🦟','Mosquito'],
    ['🗑️','Garbage'],['🚰','Water Supply'],['🐕','Stray Dogs'],['🏛️','Govt / Public'],
  ];

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient={`linear-gradient(135deg,${ACCENT},#7F1D1D)`} emoji="📢"
        title="Public Voice" subtitle="పబ్లిక్ వాయిస్" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        {/* TOP description card */}
        <div style={{
          background:`linear-gradient(135deg,${ACCENT}14,${ACCENT}26)`,
          border:`1px solid ${ACCENT}55`, borderRadius:14, padding:'14px 14px', marginBottom:14,
        }}>
          <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:16,color:ACCENT,lineHeight:1.35,marginBottom:6}}>
            📢 మీ ప్రాంత సమస్యలు తెలియజేయండి
          </div>
          <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12,color:T.text,lineHeight:1.6,marginBottom:10}}>
            మీ ప్రాంతంలో ఎదుర్కొంటున్న సమస్యలను నేరుగా రికార్డ్ చేసి/అప్‌లోడ్ చేసి ప్రభుత్వ అధికారుల దృష్టికి తీసుకువెళ్లండి. (Report local issues directly so concerned authorities can act on them.)
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            {ISSUES.map(([e,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:7,
                background:'rgba(255,255,255,0.55)', borderRadius:8, padding:'7px 9px'}}>
                <span style={{fontSize:15}}>{e}</span>
                <span style={{fontSize:11.5,fontWeight:700,color:T.text}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:ACCENT,lineHeight:1.3}}>📢 సమస్య వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:ACCENT,letterSpacing:0.4}}>Issue Details</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>All fields are mandatory.</div>
          </div>

          <FLabel required>సమస్య పేరు · Issue Name</FLabel>
          <FInput value={issueName} onChange={setIssueName}
            placeholder="e.g. Road Damage · Drainage Problem · Water Supply"
            error={errors.issueName}/>

          <div style={{marginTop:12}}>
            <FLabel required>ఫిర్యాదు చేస్తున్న వారి పేరు · Uploader Name</FLabel>
            <FInput value={uploader} onChange={setUploader}
              placeholder="e.g. రామకృష్ణ (Ramakrishna)"
              error={errors.uploader}/>
          </div>

          <div style={{marginTop:12}}>
            <FLabel required>ఫోన్ నంబర్ · Phone Number</FLabel>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
              maxLength={10} inputMode="numeric" placeholder="10-digit mobile number"
              style={{width:'100%',border:`1.5px solid ${errors.phone?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:T.inputBg,boxSizing:'border-box',letterSpacing:0.5}}/>
            {errors.phone && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.phone}</div>}
            <div style={{fontSize:10.5,color:T.textMuted,marginTop:4,lineHeight:1.45}}>
              Authorities may contact you for clarification before acting on the issue.
            </div>
          </div>

          {/* Video upload — 1 video, max 2 minutes */}
          <div style={{marginTop:14}}>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
              <FLabel required>Record / Upload Issue Video</FLabel>
              <span style={{fontSize:11,color:T.textMuted}}>(1 video · max 2 minutes)</span>
            </div>

            {!preview ? (
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('pv-record')?.click()}
                  style={{flex:1,aspectRatio:'2/1',borderRadius:12,cursor:'pointer',border:'none',
                    background:`linear-gradient(160deg,${ACCENT} 0%,#7F1D1D 100%)`,
                    boxShadow:`0 3px 12px ${ACCENT}55`,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                    <span style={{fontSize:13,color:'white',fontWeight:800,lineHeight:1}}>Record</span>
                    <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>Selfie / Camera</span>
                  </div>
                </button>
                <button type="button" onClick={()=>document.getElementById('pv-lib')?.click()}
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
              <div style={{borderRadius:12,overflow:'hidden',border:`1.5px solid ${T.border}`,background:'#000'}}>
                <video src={preview} controls playsInline preload="metadata"
                  style={{width:'100%',height:220,display:'block',background:'#000'}}/>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:T.bg2}}>
                  <span style={{fontSize:11,color:T.textMuted}}>
                    Duration: <b style={{color:duration<=MAX_SECS?'#10B981':'#EF4444'}}>{Math.floor(duration/60)}:{String(Math.round(duration%60)).padStart(2,'0')}</b> / 2:00
                  </span>
                  <button type="button" onClick={()=>{ setVideo(null); setPreview(null); setDuration(0); }}
                    style={{background:`${ACCENT}E6`,border:'none',color:'white',fontSize:11,fontWeight:700,letterSpacing:0.3,padding:'6px 12px',borderRadius:7,cursor:'pointer'}}>
                    Delete / Re-upload
                  </button>
                </div>
              </div>
            )}
            <input id="pv-record" type="file" accept="video/*" capture="environment" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; acceptVideo(f); e.target.value=''; }}/>
            <input id="pv-lib" type="file" accept="video/*" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; acceptVideo(f); e.target.value=''; }}/>
            {errors.video && <div style={{color:T.red,fontSize:10,marginTop:6,textAlign:'center'}}>{errors.video}</div>}
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
            background:`linear-gradient(135deg,${ACCENT},#7F1D1D)`,
            color:'white',fontWeight:900,fontSize:15,letterSpacing:0.3,
            boxShadow:`0 4px 16px ${ACCENT}66`,opacity:loading?0.7:1,
            fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>
          {loading ? 'Sending…' : '📢 సమస్యను తెలియజేయండి'}
        </button>
      </div>
    </div>
  );
}


export { PublicVoiceRequestForm };
export default PublicVoiceRequestForm;
