import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genId, uploadPhotos, getUserLocationId } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput } from './../../components/Form/FormElements.jsx';

function TalentShowRequestForm({ onBack }) {
  const { T } = useAppTheme();
  const ACCENT = '#EC4899'; // pink
  const MAX_SECS = 240;     // 4 minutes
  const [performer,  setPerformer]  = useState('');
  const [eventName,  setEventName]  = useState('');
  const [video,      setVideo]      = useState(null);   // File
  const [preview,    setPreview]    = useState(null);   // url
  const [duration,   setDuration]   = useState(0);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(null);
  const [apiError,   setApiError]   = useState('');

  // Accept a video file, but only if it's <= 4 minutes long.
  function acceptVideo(file) {
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    const url = URL.createObjectURL(file);
    probe.onloadedmetadata = () => {
      const secs = probe.duration;
      URL.revokeObjectURL(url);
      if (!isFinite(secs) || secs <= 0) { alert('Could not read the video duration. Please try a different file.'); return; }
      if (secs > MAX_SECS) {
        alert(`Maximum allowed video duration is 4 minutes (${Math.floor(secs/60)}:${String(Math.round(secs%60)).padStart(2,'0')} provided).`);
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
    if (!performer.trim()) e.performer = 'Performer name is required';
    if (!video)            e.video = 'Talent video is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('TLT');
    try {
      const videoUrls = video
        ? await uploadPhotos([video], reqId, 'talent')
        : [];
      const res = await fetch(`${API}/talent-show-requests`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          request_id: reqId, location_id: getUserLocationId(),
          performer_name: performer,
          event_name: eventName || null,
          duration_seconds: Math.round(duration),
          status:'Pending Review',
          photo_uris: videoUrls,
        }),
      });
      const _d = await res.json().catch(() => null);
      if (!res.ok) throw new Error((_d && (_d.message || _d.error)) || ('Submission failed (' + res.status + ')'));
      setSuccess((_d && _d.request_id) || reqId);
    } catch (e) {
      setApiError(e.message || 'Submission failed. Please check your connection and try again.');
    }
    setLoading(false);
  }

  if (success) return (
    <div style={{width:'100%',height:'100%',background:'#f7f8fa'}}>
      <SuccessScreen emoji="🎤" title="Talent Submitted!"
        message="Your talent video has been submitted for review. It will appear under Talent Show in Kurnool Local once approved."
        reqId={success} onDone={onBack}/>
    </div>
  );

  const TALENTS = [
    ['🎤','Singing'],['💃','Dance'],['🎭','Acting & Drama'],['⚽','Sports Skills'],
    ['🎨','Painting & Drawing'],['😂','Comedy & Mimicry'],['🧒','Kids Talent'],['✨','Any Other Talent'],
  ];

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient={`linear-gradient(135deg,${ACCENT},#BE185D)`} emoji="🎤"
        title="Talent Show" subtitle="టాలెంట్ షో" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        {/* TOP description card */}
        <div style={{
          background:`linear-gradient(135deg,${ACCENT}14,${ACCENT}26)`,
          border:`1px solid ${ACCENT}55`, borderRadius:14, padding:'14px 14px', marginBottom:14,
        }}>
          <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:15,color:ACCENT,lineHeight:1.35,marginBottom:6}}>
            🎤 మీ ప్రతిభను చూపించండి · Show Your Talent!
          </div>
          <div style={{fontSize:12,color:T.text,lineHeight:1.55,marginBottom:10}}>
            Upload any of your talents here — singing, dance, acting, sports, painting, comedy or anything else creative.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
            {TALENTS.map(([e,l])=>(
              <div key={l} style={{
                display:'flex',alignItems:'center',gap:7,
                background:'rgba(255,255,255,0.55)', borderRadius:8, padding:'7px 9px',
              }}>
                <span style={{fontSize:15}}>{e}</span>
                <span style={{fontSize:11.5,fontWeight:700,color:T.text}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:ACCENT,lineHeight:1.3}}>🎤 టాలెంట్ వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:ACCENT,letterSpacing:0.4}}>Talent Details</div>
          </div>

          <FLabel required>Performer Name · ప్రదర్శకుడి పేరు</FLabel>
          <FInput value={performer} onChange={setPerformer}
            placeholder="e.g. సాయి కిషోర్ (Sai Kishore)"
            error={errors.performer}/>

          <div style={{marginTop:12}}>
            <FLabel>Event / Talent Name (optional)</FLabel>
            <FInput value={eventName} onChange={setEventName}
              placeholder="e.g. Singing Competition · School Function · Self Performance"
              error={null}/>
            <div style={{fontSize:10.5,color:T.textMuted,marginTop:4,lineHeight:1.45}}>
              Optional — describe where this talent was performed (school, public show, drama, etc.).
            </div>
          </div>

          {/* Video upload — 1 video, max 4 minutes */}
          <div style={{marginTop:14}}>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
              <FLabel required>Upload / Record Talent Video</FLabel>
              <span style={{fontSize:11,color:T.textMuted}}>(1 video · max 4 minutes)</span>
            </div>

            {!preview ? (
              <div style={{display:'flex',gap:8}}>
                <button type="button" onClick={()=>document.getElementById('talent-record')?.click()}
                  style={{flex:1,aspectRatio:'2/1',borderRadius:12,cursor:'pointer',border:'none',
                    background:`linear-gradient(160deg,${ACCENT} 0%,#BE185D 100%)`,
                    boxShadow:`0 3px 12px ${ACCENT}55`,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                    <span style={{fontSize:13,color:'white',fontWeight:800,lineHeight:1}}>Record</span>
                    <span style={{fontSize:9,color:'rgba(255,255,255,0.85)',marginTop:2}}>Use camera</span>
                  </div>
                </button>
                <button type="button" onClick={()=>document.getElementById('talent-lib')?.click()}
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
                    Duration: <b style={{color:duration<=MAX_SECS?'#10B981':'#EF4444'}}>{Math.floor(duration/60)}:{String(Math.round(duration%60)).padStart(2,'0')}</b> / 4:00
                  </span>
                  <button type="button" onClick={()=>{ setVideo(null); setPreview(null); setDuration(0); }}
                    style={{background:`${ACCENT}E6`,border:'none',color:'white',fontSize:11,fontWeight:700,letterSpacing:0.3,padding:'6px 12px',borderRadius:7,cursor:'pointer'}}>
                    Delete / Re-upload
                  </button>
                </div>
              </div>
            )}
            <input id="talent-record" type="file" accept="video/*" capture="environment" style={{display:'none'}}
              onChange={e=>{ const f=e.target.files?.[0]; if(!f)return; acceptVideo(f); e.target.value=''; }}/>
            <input id="talent-lib" type="file" accept="video/*" style={{display:'none'}}
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
            background:`linear-gradient(135deg,${ACCENT},#BE185D)`,
            color:'white',fontWeight:900,fontSize:15,letterSpacing:0.3,
            boxShadow:`0 4px 16px ${ACCENT}66`,opacity:loading?0.7:1,
            fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>
          {loading ? 'Sending…' : '🎤 టాలెంట్ వీడియో పంపండి'}
        </button>
      </div>
    </div>
  );
}


export { TalentShowRequestForm };
export default TalentShowRequestForm;
