import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genId, uploadPhotos, getUserLocationId } from '../../_imports.js';

import { SuccessScreen, FormHeader, FCard, FLabel, FInput, SubmitBtn } from './../../components/Form/FormElements.jsx';

function BirthdayRequestForm({ onBack }) {
  const { T } = useAppTheme();
  const [fullName,    setFullName]    = useState('');
  const [dob,         setDob]         = useState('');
  const [bdayPhotos,  setBdayPhotos]  = useState([]);  // array of File (max 3)
  const [bdayPreviews,setBdayPreviews]= useState([]);
  const [wishers,     setWishers]     = useState([
    { name:'', relation:'' },
  ]);
  const [wisherPhotos,setWisherPhotos]= useState([]);  // array of File (max 3)
  const [wisherPreviews,setWisherPreviews]=useState([]);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [apiError, setApiError] = useState('');

  // Auto-calculate age from DOB
  const age = dob ? Math.floor((Date.now() - new Date(dob)) / (365.25*24*3600*1000)) : null;

  // Max selectable DOB = LOCAL today. Using toISOString() here would give the
  // UTC date, which in IST (UTC+5:30) is the previous day for part of the day —
  // that wrongly disabled today's date (e.g. couldn't pick the 31st on the 31st).
  const todayLocal = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  function updateWisher(i, field, val) {
    const next = [...wishers];
    next[i] = { ...next[i], [field]: val };
    setWishers(next);
  }

  function validate() {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Name is required';
    if (!dob) e.dob = 'Date of birth is required';
    wishers.slice(0, 1).forEach((w, i) => {
      if (!w.name.trim())     e[`wname${i}`]     = 'Name is required';
      if (!w.relation.trim()) e[`wrelation${i}`] = 'Relation is required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('BDY');
    try {
      // Upload the recipient's birthday photos / videos and the wisher's
      // photos to S3 first; collect the returned URLs to include in the JSON.
      const recipientUrls = bdayPhotos.length
        ? await uploadPhotos(bdayPhotos, reqId, 'birthday') : [];
      const wisherUrls = wisherPhotos.length
        ? await uploadPhotos(wisherPhotos, reqId, 'birthday') : [];

      // Attach the wisher photos to the first wisher entry so the backend
      // persists them alongside the sender record.
      const wishersOut = wishers.slice(0, 1).map((w, i) => ({
        name: w.name,
        relation: w.relation,
        photo_uris: i === 0 ? wisherUrls : [],
      }));

      const buildBody = (locId) => JSON.stringify({
        request_id: reqId, location_id: locId,
        full_name: fullName,
        date_of_birth: dob,
        age_calculated: age,
        wishers: wishersOut,
        scheduled_by_dob: true,
        status: 'Pending Review',
        photo_uris: recipientUrls,
      });
      const post = (body) => fetch(`${API}/birthday-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      let res = await post(buildBody(getUserLocationId()));
      let _d = await res.json().catch(() => null);
      // Stale dev location_id cached in localStorage → prod returns 404
      // "Unknown location_id". Drop the bad id and retry with null.
      if (!res.ok && res.status === 404 && _d && /Unknown location_id/i.test(_d.detail || _d.message || '')) {
        try {
          const u = JSON.parse(localStorage.getItem('localaitv.auth.user') || 'null');
          if (u && (u.location != null || u.location_id != null)) {
            delete u.location; delete u.location_id;
            localStorage.setItem('localaitv.auth.user', JSON.stringify(u));
          }
        } catch {}
        res = await post(buildBody(null));
        _d = await res.json().catch(() => null);
      }
      if (!res.ok) throw new Error((_d && (_d.message || _d.error || _d.detail)) || ('Submission failed (' + res.status + ')'));
      setSuccess((_d && _d.request_id) || reqId);
    } catch (e) {
      setApiError(e.message || 'Submission failed. Please check your connection and try again.');
    }
    setLoading(false);
  }

  if (success) return (
    <div style={{width:'100%',height:'100%',background:'#f7f8fa'}}>
      <SuccessScreen emoji="🎂" title="Birthday Request Submitted!"
        message="Your birthday shoutout has been submitted. It will be broadcast on the birthday date automatically."
        reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient="linear-gradient(135deg,#6b21a8,#9333ea)" emoji="🎂"
        title="Birthdays" subtitle="పుట్టినరోజు శుభాకాంక్షలు" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>

        {/* Birthday Person */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#6b21a8',lineHeight:1.3}}>🎂 పుట్టినరోజు వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#6b21a8',letterSpacing:0.4}}>Birthday Details</div>
          </div>

          <FLabel required>Name</FLabel>
          <FInput value={fullName} onChange={setFullName} placeholder="e.g. Ravi Kumar" error={errors.fullName}/>

          <div style={{marginTop:12}}>
            <FLabel required>Date of Birth</FLabel>
            <input type="date" value={dob} onChange={e=>setDob(e.target.value)}
              max={todayLocal}
              style={{width:'100%',border:`1.5px solid ${errors.dob?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:T.inputBg,boxSizing:'border-box'}}/>
            {errors.dob && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.dob}</div>}
          </div>

          {/* Auto-calculated age */}
          {age !== null && age >= 0 && (
            <div style={{marginTop:10,background:'rgba(107,33,168,0.08)',border:'1px solid rgba(107,33,168,0.2)',
              borderRadius:10,padding:'10px 14px',display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:20}}>🎉</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:'#6b21a8'}}>Age: {age} years</div>
                <div style={{fontSize:10,color:T.textMuted}}>Auto-calculated from date of birth</div>
              </div>
            </div>
          )}

          {/* Birthday Photos / Videos — Photo + Video + Library buttons (max 3) */}
          <div style={{marginTop:14}}>
            <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
              <FLabel>Birthday Photos / Videos</FLabel>
              <span style={{fontSize:11,color:T.textMuted}}>(Maximum up to 3 files)</span>
            </div>
            {/* Three buttons: Photo + Video + Library */}
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <button type="button" onClick={()=>{
                if(bdayPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
                document.getElementById('bday-photo-camera')?.click();
              }}
                onMouseEnter={e=>{
                  if(bdayPreviews.length >= 3) return;
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
                  flex:1,aspectRatio:'1',borderRadius:12,cursor:'pointer',border:'none',
                  background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                  boxShadow:'0 3px 12px rgba(208,2,27,0.35)',
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'8px 4px',
                  opacity: bdayPreviews.length >= 3 ? 0.55 : 1,
                  transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                }}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.22)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:'white',fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Photo</span>
                <span style={{fontSize:8,color:'rgba(255,255,255,0.85)',fontWeight:500,lineHeight:1.1,textAlign:'center'}}>Take a picture</span>
              </button>

              {/* VIDEO — new middle button */}
              <button type="button" onClick={()=>{
                if(bdayPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
                document.getElementById('bday-video-camera')?.click();
              }}
                onMouseEnter={e=>{
                  if(bdayPreviews.length >= 3) return;
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
                  flex:1,aspectRatio:'1',borderRadius:12,cursor:'pointer',border:'none',
                  background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                  boxShadow:'0 3px 12px rgba(208,2,27,0.35)',
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'8px 4px',
                  opacity: bdayPreviews.length >= 3 ? 0.55 : 1,
                  transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                }}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.22)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"/>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                  </svg>
                </div>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:'white',fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Video</span>
                <span style={{fontSize:8,color:'rgba(255,255,255,0.85)',fontWeight:500,lineHeight:1.1,textAlign:'center'}}>Record a clip</span>
              </button>

              <button type="button" onClick={()=>{
                if(bdayPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
                document.getElementById('bday-photo-lib')?.click();
              }}
                onMouseEnter={e=>{
                  if(bdayPreviews.length >= 3) return;
                  e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                  e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.4)';
                  e.currentTarget.style.background=`rgba(208,2,27,0.06)`;
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform='translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow='none';
                  e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
                }}
                style={{
                  flex:1,aspectRatio:'1',borderRadius:12,cursor:'pointer',
                  border:`2px solid ${T.red}`,
                  background:T.isDark?T.bg3:'#FFFFFF',
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,padding:'8px 4px',
                  opacity: bdayPreviews.length >= 3 ? 0.55 : 1,
                  transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                }}>
                <div style={{width:30,height:30,borderRadius:'50%',background:'rgba(255,200,205,0.55)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:T.red,fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Library</span>
                <span style={{fontSize:8,color:T.red,fontWeight:600,lineHeight:1.1,textAlign:'center'}}>Files &amp; Gallery</span>
              </button>
            </div>
            {/* Hidden inputs — photo camera, video camera, library (photos + videos) */}
            <input id="bday-photo-camera" type="file" accept="image/*" capture="environment" style={{display:'none'}}
              onChange={e=>{
                const f = e.target.files?.[0]; if(!f) return;
                if(bdayPreviews.length >= 3) { e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
                setBdayPhotos(prev=>[...prev,f]);
                setBdayPreviews(prev=>[...prev,URL.createObjectURL(f)]);
                e.target.value='';
              }}/>
            <input id="bday-video-camera" type="file" accept="video/*" capture="environment" style={{display:'none'}}
              onChange={e=>{
                const f = e.target.files?.[0]; if(!f) return;
                if(bdayPreviews.length >= 3) { e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
                setBdayPhotos(prev=>[...prev,f]);
                setBdayPreviews(prev=>[...prev,URL.createObjectURL(f)]);
                e.target.value='';
              }}/>
            <input id="bday-photo-lib" type="file" accept="image/*,video/*" style={{display:'none'}}
              onChange={e=>{
                const f = e.target.files?.[0]; if(!f) return;
                if(bdayPreviews.length >= 3) { e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
                setBdayPhotos(prev=>[...prev,f]);
                setBdayPreviews(prev=>[...prev,URL.createObjectURL(f)]);
                e.target.value='';
              }}/>
            {/* Thumbnail grid (max 3) — supports photos and videos */}
            {bdayPreviews.length > 0 && (
              <div style={{display:'flex',gap:8}}>
                {bdayPreviews.map((src,i)=>{
                  const file = bdayPhotos[i];
                  const isVideo = file && file.type && file.type.startsWith('video/');
                  return (
                  <div key={i} style={{flex:1,aspectRatio:'1',position:'relative',borderRadius:12,overflow:'hidden',
                    border:`1.5px solid ${T.border}`,background:'#000',
                    display:'flex',flexDirection:'column'}}>
                    <div style={{flex:1,position:'relative',overflow:'hidden',background:'#000'}}>
                      {isVideo ? (
                        <>
                          <video src={src} preload="metadata" muted style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.92)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 6px rgba(0,0,0,0.4)',pointerEvents:'none'}}>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="#D0021B"><polygon points="5,3 19,12 5,21"/></svg>
                          </div>
                        </>
                      ) : (
                        <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      )}
                    </div>
                    <button type="button" onClick={()=>{
                      setBdayPhotos(prev=>prev.filter((_,j)=>j!==i));
                      setBdayPreviews(prev=>prev.filter((_,j)=>j!==i));
                    }} style={{
                      width:'100%',padding:'5px 0',background:'rgba(208,2,27,0.92)',border:'none',
                      color:'white',fontSize:10,fontWeight:700,letterSpacing:0.5,cursor:'pointer',flexShrink:0,
                    }}>Delete</button>
                  </div>
                  );
                })}
                {/* Empty slots to keep 3-col grid */}
                {Array.from({length: 3 - bdayPreviews.length}).map((_,i)=>(
                  <div key={`s${i}`} style={{flex:1,aspectRatio:'1'}}/>
                ))}
              </div>
            )}
          </div>
        </FCard>

        {/* Wisher section — single wisher */}
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#6b21a8',lineHeight:1.3}}>💌 శుభాకాంక్షలు తెలియచేయువారు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#6b21a8',letterSpacing:0.4}}>Wishes from</div>
          </div>
          <div style={{marginBottom:10}}>
            <FLabel required>Name</FLabel>
            <FInput value={wishers[0].name} onChange={v=>updateWisher(0,'name',v)}
              placeholder="e.g. Padmaja and Harinath" error={errors['wname0']}/>
          </div>
          <div style={{marginBottom:14}}>
            <FLabel required>Relation</FLabel>
            <FInput value={wishers[0].relation} onChange={v=>updateWisher(0,'relation',v)}
              placeholder="e.g. Amma and Nanna (Mother and Father)" error={errors['wrelation0']}/>
          </div>

          {/* Wisher photo upload — Photo + Library buttons (max 2) */}
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
            <FLabel>Wisher Photos</FLabel>
            <span style={{fontSize:11,color:T.textMuted}}>(Maximum up to 2 photos)</span>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button type="button" onClick={()=>{
              if(wisherPreviews.length >= 2){ alert('Maximum allowed is 2 photos.'); return; }
              document.getElementById('wisher-photo-camera')?.click();
            }}
              onMouseEnter={e=>{
                if(wisherPreviews.length >= 2) return;
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
                flex:1,aspectRatio:'2/1',borderRadius:12,cursor:'pointer',border:'none',
                background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
                boxShadow:'0 3px 12px rgba(208,2,27,0.35)',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                opacity: wisherPreviews.length >= 2 ? 0.55 : 1,
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
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
              if(wisherPreviews.length >= 2){ alert('Maximum allowed is 2 photos.'); return; }
              document.getElementById('wisher-photo-lib')?.click();
            }}
              onMouseEnter={e=>{
                if(wisherPreviews.length >= 2) return;
                e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.4)';
                e.currentTarget.style.background=`rgba(208,2,27,0.06)`;
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.boxShadow='none';
                e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
              }}
              style={{
                flex:1,aspectRatio:'2/1',borderRadius:12,cursor:'pointer',
                border:`2px solid ${T.red}`,
                background:T.isDark?T.bg3:'#FFFFFF',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                opacity: wisherPreviews.length >= 2 ? 0.55 : 1,
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
              }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                <span style={{fontSize:13,color:T.red,fontWeight:800,lineHeight:1}}>Library</span>
                <span style={{fontSize:9,color:T.red,marginTop:2,fontWeight:600}}>Files &amp; Gallery</span>
              </div>
            </button>
          </div>
          <input id="wisher-photo-camera" type="file" accept="image/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(wisherPreviews.length >= 2) { e.target.value=''; alert('Maximum allowed is 2 photos.'); return; }
              setWisherPhotos(prev=>[...prev,f]);
              setWisherPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          <input id="wisher-photo-lib" type="file" accept="image/*" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(wisherPreviews.length >= 2) { e.target.value=''; alert('Maximum allowed is 2 photos.'); return; }
              setWisherPhotos(prev=>[...prev,f]);
              setWisherPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          {wisherPreviews.length > 0 && (
            <div style={{display:'flex',gap:8}}>
              {wisherPreviews.map((src,i)=>(
                <div key={i} style={{flex:1,aspectRatio:'1',position:'relative',borderRadius:12,overflow:'hidden',
                  border:`1.5px solid ${T.border}`,background:'#000',
                  display:'flex',flexDirection:'column'}}>
                  <div style={{flex:1,overflow:'hidden'}}>
                    <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  </div>
                  <button type="button" onClick={()=>{
                    setWisherPhotos(prev=>prev.filter((_,j)=>j!==i));
                    setWisherPreviews(prev=>prev.filter((_,j)=>j!==i));
                  }} style={{
                    width:'100%',padding:'5px 0',background:'rgba(208,2,27,0.92)',border:'none',
                    color:'white',fontSize:10,fontWeight:700,letterSpacing:0.5,cursor:'pointer',flexShrink:0,
                  }}>Delete</button>
                </div>
              ))}
              {Array.from({length: 2 - wisherPreviews.length}).map((_,i)=>(
                <div key={`ws${i}`} style={{flex:1,aspectRatio:'1'}}/>
              ))}
            </div>
          )}
        </FCard>

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        <SubmitBtn labelTe="🎂 పుట్టినరోజు శుభాకాంక్షలు తెలియచేయండి" label="Convey Birthday Wishes" onClick={handleSubmit} loading={loading}/>
      </div>
    </div>
  );
}

export { BirthdayRequestForm };
export default BirthdayRequestForm;
