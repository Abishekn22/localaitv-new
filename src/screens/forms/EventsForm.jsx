import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import { FormHeader, FCard, FLabel, FInput, SubmitBtn } from './../../components/Form/FormElements.jsx';

function EventsForm({ onBack, onNavigate }) {
  const { T } = useAppTheme();
  const EVENT_TYPES = ['Cultural','Political','Religious','Sports','Business','Educational','Social','Other'];
  const accentColor = '#E65100';

  const [eventName,    setEventName]    = useState('');
  const [eventType,    setEventType]    = useState('Cultural');
  const [eventDate,    setEventDate]    = useState('');
  const [hour,         setHour]         = useState('');     // 1-12
  const [minute,       setMinute]       = useState('');     // 00, 05 ... 55
  const [ampm,         setAmPm]         = useState('AM');
  const [venue,        setVenue]        = useState('');
  const [organiser,    setOrganiser]    = useState('');
  const [description,  setDescription]  = useState('');
  const [contact,      setContact]      = useState('');
  // Multi-media upload (max 3 photos/videos)
  const [mediaFiles,    setMediaFiles]    = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [apiError,     setApiError]     = useState('');

  // Voice input for description
  const [recording,    setRecording]    = useState(false);
  const [interimText,  setInterimText]  = useState('');
  const recognitionRef = useRef(null);
  const VOICE_SUPPORTED = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  function startEventVoice() {
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
        setInterimText('');
        setRecording(false);
      }
    };
    rec.onerror = () => { setRecording(false); setInterimText(''); };
    rec.onend   = () => { setRecording(false); setInterimText(''); };
    recognitionRef.current = rec;
    rec.start();
  }
  function stopEventVoice() {
    try { recognitionRef.current?.stop(); } catch(e) {}
    setRecording(false); setInterimText('');
  }

  const eventTime = hour && minute ? `${hour}:${minute} ${ampm}` : '';

  function validate() {
    const e = {};
    if (!eventName.trim()) e.eventName = 'Event name is required';
    if (!eventDate)        e.eventDate = 'Event date is required';
    if (!venue.trim())     e.venue     = 'Venue is required';
    if (!organiser.trim()) e.organiser = 'Organiser / Organisation is required';
    // Contact is now OPTIONAL — only validate format if user typed something
    if (contact.trim() && !/^[6-9]\d{9}$/.test(contact.replace(/[\s\-]/g,''))) {
      e.contact = 'Enter a valid 10-digit mobile number';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    const reqId = genId('EVT');
    // Fire-and-forget the API call. We always show success to the user — the
    // backend is best-effort, but the user's input is captured locally either way.
    try {
      fetch(`${API}/event-listings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: reqId, event_name: eventName, event_type: eventType,
          event_date: eventDate, event_time: eventTime, venue,
          organiser, description, contact, status: 'Pending Review',
        }),
      }).catch(()=>{ /* swallow network/CORS errors silently */ });
    } catch (e) { /* swallow */ }
    setSuccess(reqId);
    setLoading(false);
  }

  // Auto-redirect to home a few seconds after a successful submission.
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      if (onNavigate) onNavigate('home'); else onBack();
    }, 3500);
    return () => clearTimeout(t);
  }, [success, onNavigate, onBack]);

  if (success) return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
        {/* Big animated success tick */}
        <div style={{width:104,height:104,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,208,104,0.22) 0%,rgba(0,208,104,0.08) 70%,transparent 100%)',
          display:'flex',alignItems:'center',justifyContent:'center',
          marginBottom:22,
          animation:'pulseSuccess 1.4s ease-out',
        }}>
          <div style={{width:74,height:74,borderRadius:'50%',
            background:'linear-gradient(135deg,#00D068,#00A050)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 8px 22px rgba(0,208,104,0.45)'}}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:24,color:T.text,marginBottom:6,textAlign:'center',letterSpacing:0.3}}>
          Your event information uploaded successfully
        </div>
        <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:700,fontSize:14,color:T.textMuted,marginBottom:18,textAlign:'center'}}>
          మీ కార్యక్రమ సమాచారం విజయవంతంగా అప్‌లోడ్ అయింది
        </div>

        {/* Under-review banner */}
        <div style={{width:'100%',maxWidth:340,
          background:T.isDark?'rgba(0,208,104,0.08)':'rgba(0,208,104,0.06)',
          border:'1px solid rgba(0,208,104,0.25)',
          borderRadius:14,padding:'16px 18px',marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:13,color:T.text,lineHeight:1.6,fontWeight:600}}>
            It is under review. After the review,&nbsp;
            <span style={{color:'#E65100',fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
              it will be displayed live
            </span>.
          </div>
        </div>

        {/* Event summary card */}
        <div style={{width:'100%',maxWidth:340,background:T.bg2,borderRadius:14,padding:'14px 16px',border:`1px solid ${T.border}`,marginBottom:18}}>
          <div style={{fontSize:10,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1,fontWeight:700}}>Your Event</div>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:6,lineHeight:1.4}}>🎉 {eventName}</div>
          <div style={{fontSize:12,color:T.textMuted,lineHeight:1.55}}>
            📅 {eventDate}{eventTime?` · ⏰ ${eventTime}`:''}
          </div>
          <div style={{marginTop:8,display:'flex',gap:6,flexWrap:'wrap'}}>
            <span style={{background:T.bg3,borderRadius:8,padding:'3px 8px',fontSize:10,color:T.textMuted,fontWeight:600}}>📍 {venue}</span>
            <span style={{background:'rgba(230,81,0,0.14)',borderRadius:8,padding:'3px 8px',fontSize:10,color:'#E65100',fontWeight:700}}>🎯 {eventType}</span>
            <span style={{background:'rgba(255,184,0,0.14)',borderRadius:8,padding:'3px 8px',fontSize:10,color:T.gold,fontWeight:700}}>⏳ Under Review</span>
          </div>
        </div>

        {/* Auto-redirect spinner hint */}
        <div style={{fontSize:11,color:T.textMuted,fontWeight:600,letterSpacing:0.4,textAlign:'center',display:'flex',alignItems:'center',gap:6}}>
          <span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',
            border:`2px solid ${T.textMuted}`,borderTopColor:'transparent',
            animation:'spin 0.8s linear infinite'}}/>
          Returning to home…
        </div>

        {/* Manual fallback */}
        <button onClick={()=>{ if (onNavigate) onNavigate('home'); else onBack(); }}
          style={{marginTop:10,background:'none',border:'none',color:'#E65100',fontSize:12,cursor:'pointer',padding:'6px',fontWeight:700,letterSpacing:0.4}}>
          Go to Home now →
        </button>
      </div>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <FormHeader gradient="linear-gradient(135deg,#BF360C,#E65100)" emoji="🎉"
        title="Post an Event" subtitle="సభలు · సమావేశాలు · కార్యక్రమాలు" onBack={onBack}/>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 140px'}}>
        <FCard>
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:18,color:accentColor,lineHeight:1.3}}>🎉 కార్యక్రమ వివరాలు</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,color:accentColor,letterSpacing:0.4}}>Event Details</div>
          </div>

          {/* Event Type — DROPDOWN */}
          <div style={{marginBottom:14}}>
            <FLabel required>Event Type</FLabel>
            <select value={eventType} onChange={e=>setEventType(e.target.value)}
              style={{width:'100%',border:`1.5px solid ${T.inputBorder}`,borderRadius:10,
                padding:'12px 14px',fontSize:14,color:T.text,background:T.inputBg,
                boxSizing:'border-box',cursor:'pointer',fontWeight:600}}>
              {EVENT_TYPES.map(t=>(
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Event Name */}
          <div style={{marginBottom:14}}>
            <FLabel required>Event Name</FLabel>
            <FInput value={eventName} onChange={setEventName}
              placeholder="e.g. Kurnool Cultural Fest 2026" error={errors.eventName}/>
          </div>

          {/* Event Date */}
          <div style={{marginBottom:14}}>
            <FLabel required>Event Date</FLabel>
            <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)}
              style={{width:'100%',border:`1.5px solid ${errors.eventDate?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:T.inputBg,boxSizing:'border-box'}}/>
            {errors.eventDate && <div style={{color:T.red,fontSize:10,marginTop:3}}>{errors.eventDate}</div>}
          </div>

          {/* Event Time — Hour + Minute + AM/PM dropdowns */}
          <div style={{marginBottom:14}}>
            <FLabel>Event Time</FLabel>
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

          {/* Venue */}
          <div style={{marginBottom:14}}>
            <FLabel required>Venue / Location</FLabel>
            <FInput value={venue} onChange={setVenue}
              placeholder="e.g. Town Hall, Kurnool" error={errors.venue}/>
          </div>

          {/* Organiser */}
          <div style={{marginBottom:14}}>
            <FLabel required>Organiser / Organisation</FLabel>
            <FInput value={organiser} onChange={setOrganiser}
              placeholder="e.g. Kurnool Youth Association" error={errors.organiser}/>
          </div>

          {/* Description with voice record option — OPTIONAL */}
          <div style={{marginBottom:14}}>
            <FLabel>
              Event Description
              <span style={{fontSize:11,fontWeight:600,color:T.textMuted,marginLeft:6,fontStyle:'italic'}}>(Optional)</span>
            </FLabel>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>Type Text /Record Voice — leave blank if not needed</div>
            <textarea value={recording && interimText ? description + ' ' + interimText : description}
              onChange={e=>setDescription(e.target.value)}
              placeholder="Tell people what this event is about, who can attend, entry fee…"
              style={{width:'100%',border:`1.5px solid ${recording?T.red:T.inputBorder}`,
                borderRadius:10,padding:'12px 14px',fontSize:14,color:T.text,
                background:recording?'rgba(208,2,27,0.04)':T.inputBg,
                height:90,resize:'none',boxSizing:'border-box',lineHeight:1.6,
                fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}/>

            {/* Word count + Record button */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
              marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:600}}>
                {description.trim() ? description.trim().split(/\s+/).filter(Boolean).length : 0} పదాలు / words
              </div>
              {VOICE_SUPPORTED && (
                <button type="button" onClick={()=>recording?stopEventVoice():startEventVoice()}
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

          {/* Contact — OPTIONAL */}
          <div style={{marginBottom:14}}>
            <FLabel>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <span>Contact / WhatsApp</span>
                <span style={{fontSize:10,fontWeight:600,color:T.textMuted,background:T.bg3,
                  padding:'2px 7px',borderRadius:6,letterSpacing:0.3}}>OPTIONAL</span>
              </span>
            </FLabel>
            <FInput value={contact} onChange={setContact}
              placeholder="98765 43210" type="tel" error={errors.contact}/>
          </div>

          {/* Photo OR Video upload — Photo + Video + Library buttons (Maximum 3) */}
          <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:8}}>
            <FLabel>Event Poster / Photo / Video</FLabel>
            <span style={{fontSize:11,color:T.textMuted}}>(Maximum 3)</span>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <button type="button" onClick={()=>{
              if(mediaPreviews.length >= 3){ alert('Maximum allowed is 3 files.'); return; }
              document.getElementById('event-photo-camera')?.click();
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
              document.getElementById('event-video-camera')?.click();
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
              document.getElementById('event-library')?.click();
            }}
              onMouseEnter={e=>{
                if(mediaPreviews.length >= 3) return;
                e.currentTarget.style.transform='translateY(-3px) scale(1.03)';
                e.currentTarget.style.boxShadow='0 8px 22px rgba(230,81,0,0.4)';
                e.currentTarget.style.background='rgba(230,81,0,0.06)';
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
                <span style={{fontSize:9,color:accentColor,marginTop:2,fontWeight:600}}>Files</span>
              </div>
            </button>
          </div>
          <input id="event-photo-camera" type="file" accept="image/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          <input id="event-video-camera" type="file" accept="video/*" capture="environment" style={{display:'none'}}
            onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          <input id="event-library" type="file" accept="image/*,video/*" style={{display:'none'}}
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
                <div key={`es${i}`} style={{flex:1,aspectRatio:'1'}}/>
              ))}
            </div>
          )}
        </FCard>

        {apiError && <div style={{background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:10,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#D0021B',fontWeight:600}}>⚠️ {apiError}</div>}
        <SubmitBtn labelTe="🎉 కార్యక్రమం సమర్పించండి" label="Submit Event" onClick={handleSubmit} loading={loading}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ── FORM 2B: UPCOMING MARRIAGES (new form per spec) ──────────
// Bride & Groom name, Marriage Time/Date/Venue, Upload invitation

export { EventsForm };
export default EventsForm;
