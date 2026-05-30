import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genId, uploadPhotos, getUserLocationId } from '../../_imports.js';

import Logo from './../../components/Logo.jsx';
import { SuccessScreen, FormHeader, FCard, FLabel, FInput, SubmitBtn } from './../../components/Form/FormElements.jsx';

function JobsForm({ onBack }) {
  const { T } = useAppTheme();
  const [jobTitle,    setJobTitle]    = useState('');
  const [company,     setCompany]     = useState('');
  const [qualification,setQualification]= useState('');
  const [experience,  setExperience]  = useState('');
  const [description, setDescription] = useState('');
  const [vacancies,   setVacancies]   = useState('');
  const [location,    setLocation]    = useState('');
  const [salary,      setSalary]      = useState('');
  const [contact,     setContact]     = useState('');
  const [email,       setEmail]       = useState('');
  // Multi-media upload (max 3 photos/videos)
  const [mediaFiles,    setMediaFiles]    = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(null);
  const [apiError,    setApiError]    = useState('');

  // Voice input for description
  const [recording,   setRecording]   = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const VOICE_SUPPORTED = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  function startJobVoice() {
    if (!VOICE_SUPPORTED) { alert('Voice input is not supported on this browser. Please type your description.'); return; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'te-IN';
    rec.continuous = false;
    rec.interimResults = true;
    setRecording(true);
    setInterimText('');
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
    recognitionRef.current = rec;
    rec.start();
  }
  function stopJobVoice() {
    try { recognitionRef.current?.stop(); } catch(e) {}
    setRecording(false); setInterimText('');
  }

  function validate() {
    const e = {};
    if (!jobTitle.trim())    e.jobTitle    = 'Job title is required';
    if (!company.trim())     e.company     = 'Company / Shop / Establishment / Employer Name is required';
    if (!description.trim()) e.description = 'Job description is required';
    if (!contact.trim())     e.contact     = 'Contact info is required';
    else if (!/^[6-9]\d{9}$/.test(contact.replace(/[\s\-]/g,''))) e.contact = 'Enter a valid 10-digit mobile number';
    // Email is optional — only validate format if user typed something
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    const reqId = genId('JOB');
    try {
      const photoUrls = mediaFiles.length
        ? await uploadPhotos(mediaFiles, reqId, 'job')
        : [];
      const res = await fetch(`${API}/job-posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: reqId, location_id: getUserLocationId(), job_title: jobTitle,
          company, qualification, experience, description, vacancies, location, salary, contact, email,
          status: 'Pending Review', photo_uris: photoUrls }),
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
      <SuccessScreen emoji="💼" title="Job Posted!"
        message="Your job listing has been submitted. It will be broadcast on the next bulletin."
        reqId={success} onDone={onBack}/>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient="linear-gradient(135deg,#1e3a8a,#3b82f6)" emoji="💼"
        title="Post a Job" subtitle="ఉద్యోగ ప్రకటన" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:'#1e3a8a',lineHeight:1.3}}>💼 ఉద్యోగ వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:'#1e3a8a',letterSpacing:0.4}}>Job Details</div>
          </div>

          <div style={{marginBottom:14}}>
            <FLabel required>Job Title / Position</FLabel>
            <FInput value={jobTitle} onChange={setJobTitle}
              placeholder="e.g. Sales Executive, Driver, Teacher" error={errors.jobTitle}/>
          </div>
          <div style={{marginBottom:14}}>
            <FLabel required>Company / Shop / Establishment / Employer Name</FLabel>
            <FInput value={company} onChange={setCompany} placeholder="e.g. ABC Enterprises / Sri Lakshmi Stores" error={errors.company}/>
          </div>

          {/* Job Description with voice record */}
          <div style={{marginBottom:14}}>
            <FLabel required>Job Description</FLabel>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Type Text /Record Voice</div>
            <textarea value={recording && interimText ? description + ' ' + interimText : description}
              onChange={e=>setDescription(e.target.value)}
              placeholder="Describe the role, requirements, experience needed…"
              style={{width:'100%',border:`1.5px solid ${recording?T.red:errors.description?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:recording?'rgba(208,2,27,0.04)':T.inputBg,
                height:90,resize:'none',boxSizing:'border-box',lineHeight:1.6,
                fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}/>
            {errors.description && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.description}</div>}
            {/* Word count + Record button */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600}}>
                {description.trim() ? description.trim().split(/\s+/).filter(Boolean).length : 0} పదాలు / words
              </div>
              {VOICE_SUPPORTED && (
                <button type="button" onClick={()=>recording?stopJobVoice():startJobVoice()}
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

          {/* Number of Vacancies + Location */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            <div>
              <FLabel>Number of Vacancies</FLabel>
              <FInput value={vacancies} onChange={v=>setVacancies(v.replace(/[^\d]/g,''))}
                placeholder="e.g. 5" type="tel"/>
            </div>
            <div>
              <FLabel>Location</FLabel>
              <FInput value={location} onChange={setLocation} placeholder="e.g. Kurnool"/>
            </div>
          </div>

          {/* Qualification (optional) */}
          <div style={{marginBottom:14}}>
            <FLabel>Qualification (optional)</FLabel>
            <FInput value={qualification} onChange={setQualification} placeholder="e.g. 10th / Degree / ITI / Any"/>
          </div>

          {/* Experience (optional) */}
          <div style={{marginBottom:14}}>
            <FLabel>Experience (optional)</FLabel>
            <FInput value={experience} onChange={setExperience} placeholder="e.g. Freshers / 2 years / Any"/>
          </div>

          {/* Salary */}
          <div style={{marginBottom:14}}>
            <FLabel>Salary (optional)</FLabel>
            <FInput value={salary} onChange={setSalary} placeholder="e.g. ₹15,000/month"/>
          </div>

          {/* Contact */}
          <div style={{marginBottom:14}}>
            <FLabel required>Contact / Phone</FLabel>
            <FInput value={contact} onChange={setContact}
              placeholder="Phone / WhatsApp number" error={errors.contact}/>
          </div>

          {/* Email — OPTIONAL */}
          <div style={{marginBottom:14}}>
            <FLabel>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span>Email Address</span>
                <span style={{fontSize:10,fontWeight:600,color:T.textMuted,background:T.bg3,
                  padding:'2px 7px',borderRadius:6,letterSpacing:0.3}}>OPTIONAL</span>
              </span>
            </FLabel>
            <FInput value={email} onChange={setEmail}
              placeholder="employer@company.com" type="email" error={errors.email}/>
          </div>

          {/* Photo / Video / Logo upload — Max 3 files */}
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
            <FLabel>Photos / Videos / Logo</FLabel>
            <span style={{fontSize:11,color:T.textMuted}}>(Maximum 3)</span>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
              document.getElementById('job-photo-camera')?.click();
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
              document.getElementById('job-video-camera')?.click();
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
              document.getElementById('job-library')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length >= 3) return;
                e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow='0 8px 22px rgba(30,58,138,0.4)';
                e.currentTarget.style.background='rgba(30,58,138,0.06)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.boxShadow='none';
                e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
              }}
              style={{
                flex:1,padding:'14px 8px',borderRadius:12,cursor:'pointer',
                border:`2px solid #1e3a8a`,
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
                <span style={{fontSize:13,color:'#1e3a8a',fontWeight:800,lineHeight:1}}>Library</span>
                <span style={{fontSize:9,color:'#1e3a8a',marginTop:2,fontWeight:600}}>Logo / Files</span>
              </div>
            </button>
          </div>
          <input id="job-photo-camera" type="file" accept="image/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          <input id="job-video-camera" type="file" accept="video/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          <input id="job-library" type="file" accept="image/*,video/*" style={{display:'none'}}
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
                <div key={`js${i}`} style={{flex:1,aspectRatio:'1'}}/>
              ))}
            </div>
          )}
        </FCard>

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        <SubmitBtn labelTe="💼 ఉద్యోగ ప్రకటన పోస్ట్ చేయండి" label="Post Job" onClick={handleSubmit} loading={loading}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── FORM: CAR SALES ───────────────────────────────────────────
// Vehicle details, price, photos, contact

export { JobsForm };
export default JobsForm;
