import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { uploadMediaChunked, mediaKindOf, MAX_REPORT_FILE_BYTES } from '../../utils/reportUpload.js';
import MediaCaptureModal from '../../components/MediaCaptureModal.jsx';

function NewsUploadFormScreen({ onBack, onNavigate, constituency }) {
  const { T } = useAppTheme();
  const { user, token } = useAuth();
  // Live camera capture overlay: null | 'photo' | 'video'
  const [capture, setCapture] = useState(null);
  // Recorded audio clips: { file, url } | null.
  const [headlineAudio, setHeadlineAudio] = useState(null);
  const [descriptionAudio, setDescriptionAudio] = useState(null);
  // Full-screen preview of an added media file (index into mediaFiles) | null.
  const [previewIdx, setPreviewIdx] = useState(null);
  // Add a captured/picked file to the media list (cap at 3).
  const addMediaFile = (f) => {
    if (!f) return;
    setMediaFiles(prev => (prev.length >= 3 ? prev : [...prev, f]));
    setMediaPreviews(prev => (prev.length >= 3 ? prev : [...prev, URL.createObjectURL(f)]));
  };

  // ── Inline audio recording (no modal) — driven by each field's Record button.
  const audioStreamRef   = useRef(null);
  const audioRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const audioTimerRef    = useRef(null);
  const [audioRecording, setAudioRecording] = useState(null); // 'headline' | 'details' | null
  const [audioSecs,      setAudioSecs]      = useState(0);
  const audioFallbackFor = useRef(null); // field for the hidden <input> fallback

  const storeFieldAudio = (field, file) => {
    const clip = { file, url: URL.createObjectURL(file) };
    const setter = field === 'headline' ? setHeadlineAudio : setDescriptionAudio;
    setter(prev => { if (prev?.url) { try { URL.revokeObjectURL(prev.url); } catch (e) {} } return clip; });
  };

  async function startFieldAudio(field) {
    if (audioRecording) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
      audioFallbackFor.current = field;
      document.getElementById('news-audio-input')?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];
      const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const mimeType = candidates.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mr.ondataavailable = (e) => { if (e.data && e.data.size) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const type = mr.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type });
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
        const file = new File([blob], `news-audio-${field}-${Date.now()}.${ext}`, { type });
        storeFieldAudio(field, file);
        if (audioStreamRef.current) audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      };
      audioRecorderRef.current = mr;
      mr.start();
      setAudioRecording(field);
      setAudioSecs(0);
      audioTimerRef.current = setInterval(() => setAudioSecs(s => s + 1), 1000);
    } catch (e) {
      audioFallbackFor.current = field;
      document.getElementById('news-audio-input')?.click();
    }
  }

  function stopFieldAudio() {
    if (audioTimerRef.current) { clearInterval(audioTimerRef.current); audioTimerRef.current = null; }
    try { if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') audioRecorderRef.current.stop(); } catch (e) {}
    setAudioRecording(null);
  }

  const toggleFieldAudio = (field) => { audioRecording === field ? stopFieldAudio() : startFieldAudio(field); };
  const audioMMSS = `${String(Math.floor(audioSecs / 60)).padStart(2, '0')}:${String(audioSecs % 60).padStart(2, '0')}`;
  const [step,        setStep]        = useState(0); // 0=form, 1=uploading, 2=result
  const [headline,    setHeadline]    = useState('');
  const [details,     setDetails]     = useState('');
  const [location,    setLocation]    = useState(constituency || '');
  const [mediaType,    setMediaType]   = useState(null); // 'photo'|'video'|'text'
  const [mediaFiles,   setMediaFiles]  = useState([]); // array of File objects (max 3)
  const [mediaPreviews,setMediaPreviews]= useState([]); // array of object URLs
  const [confirmed,    setConfirmed]   = useState(true); // content originality confirmation
  const [uploadPct,   setUploadPct]   = useState(0);
  const [aiSteps,     setAiSteps]     = useState([]);
  const [aiResult,    setAiResult]    = useState(null); // 'approved'|'flagged'|'review'
  const [flagReason,  setFlagReason]  = useState('');
  // Inline validation feedback — shown above submit button when the form fails.
  // We also use this to flag which field(s) should turn red.
  const [validationError, setValidationError] = useState(''); // empty | a message string
  const [invalidFields,   setInvalidFields]   = useState({ headline:false, details:false, media:false, confirm:false });

  // Auto-clear validation message once the user fixes the offending field.
  useEffect(() => {
    if (!validationError) return;
    const hwc = headline.trim() ? headline.trim().split(/\s+/).filter(Boolean).length : 0;
    const wc  = details.trim()  ? details.trim().split(/\s+/).filter(Boolean).length  : 0;
    const ok  = hwc >= 4 && hwc <= 30 && wc >= 20 && wc <= 300
                && mediaType && mediaPreviews.length > 0 && confirmed;
    if (ok) { setValidationError(''); setInvalidFields({headline:false,details:false,media:false,confirm:false}); }
  }, [headline, details, mediaType, mediaPreviews, confirmed, validationError]);

  // Auto-navigate back to home a few seconds after successful submission.
  useEffect(() => {
    if (step === 2) {
      const t = setTimeout(() => onNavigate('home'), 3500);
      return () => clearTimeout(t);
    }
  }, [step, onNavigate]);

  // ── VOICE INPUT STATE ──────────────────────────────────────
  const [voiceField,   setVoiceField]   = useState(null); // 'headline'|'details'|'location'
  const [voiceLang,    setVoiceLang]    = useState('te-IN'); // te-IN | en-IN
  const [interimText,  setInterimText]  = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const recognitionRef = useRef(null);

  const VOICE_SUPPORTED = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  function startVoice(field) {
    if (!VOICE_SUPPORTED) { alert('Voice input is not supported on this browser.\n\niPhone users: please type your text directly — Safari does not support voice input yet.\n\nOn desktop, use Google Chrome for voice input.'); return; }
    // Stop any existing session
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e) {} }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = voiceLang;
    rec.continuous = true;        // keep listening until the user taps Stop
    rec.interimResults = true;    // stream a live transcript while speaking

    setVoiceField(field);
    setInterimText('');

    const appendFinal = (text) => {
      const add = (text || '').trim();
      if (!add) return;
      if (field === 'headline') setHeadline(p => (p ? p + ' ' : '') + add);
      if (field === 'details')  setDetails(p  => (p ? p + ' ' : '') + add);
      if (field === 'location') setLocation(p => (p ? p + ' ' : '') + add);
    };

    rec.onresult = (e) => {
      let interim = '';
      let final   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimText(interim);                       // live preview as you speak
      if (final) {
        const hasTeluguChars = /[ఀ-౿]/.test(final);
        setDetectedLang(hasTeluguChars ? '🇮🇳 Telugu' : '🇬🇧 English');
        appendFinal(final);                          // commit each finished phrase
        setInterimText('');
      }
    };
    rec.onerror = (ev) => {
      if (ev && (ev.error === 'not-allowed' || ev.error === 'service-not-allowed')) {
        alert('Microphone permission denied. Please allow mic access in your browser and try again.');
      }
      setVoiceField(null); setInterimText(''); recognitionRef.current = null;
    };
    rec.onend = () => {
      // Commit any trailing interim text the engine never marked "final".
      setInterimText(cur => { if (cur && cur.trim()) appendFinal(cur); return ''; });
      setVoiceField(null);
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    try { rec.start(); } catch (e) { setVoiceField(null); setInterimText(''); }
  }

  function stopVoice() {
    try { recognitionRef.current?.stop(); } catch(e) {}
    setVoiceField(null);
    setInterimText('');
  }

  // ── MIC BUTTON component (inline) ─────────────────────────
  function MicBtn({ field }) {
    const isActive = voiceField === field;
    return (
      <button
        onClick={() => isActive ? stopVoice() : startVoice(field)}
        style={{
          flexShrink: 0,
          width: 40, height: 40,
          borderRadius: '50%',
          border: `2px solid ${isActive ? T.red : T.border}`,
          background: isActive
            ? `linear-gradient(135deg,${T.red},#9A0015)`
            : T.bg3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isActive ? `0 0 0 4px rgba(208,2,27,0.2)` : 'none',
          animation: isActive ? 'pulse 1s infinite' : 'none',
          transition: 'all 0.2s',
        }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke={isActive ? 'white' : T.textMuted} strokeWidth={2.2}
          strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="11" rx="3"/>
          <path d="M5 10a7 7 0 0014 0"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="8"  y1="22" x2="16" y2="22"/>
        </svg>
      </button>
    );
  }

  // ── LANG TOGGLE ────────────────────────────────────────────
  function LangToggle() {
    return (
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
        <span style={{fontSize:10,color:T.textMuted,fontWeight:600,letterSpacing:0.5}}>VOICE LANG:</span>
        {[['te-IN','తె Telugu'],['en-IN','EN English']].map(([code,label])=>(
          <button key={code} onClick={()=>setVoiceLang(code)} style={{
            padding:'4px 10px', borderRadius:12, cursor:'pointer',
            background: voiceLang===code ? T.red : T.bg3,
            border: `1px solid ${voiceLang===code ? T.red : T.border}`,
            color: voiceLang===code ? 'white' : T.textMuted,
            fontSize:10, fontWeight:700,
          }}>{label}</button>
        ))}
        {detectedLang && (
          <span style={{fontSize:10,color:T.teal,fontWeight:700}}>
            Detected: {detectedLang}
          </span>
        )}
      </div>
    );
  }

  const AI_STEPS_APPROVED = [
    { label:'Uploading media…',                done:false },
    { label:'AI transcription complete',       done:false },
    { label:'Language detection: Telugu ✓',    done:false },
    { label:'Content safety check: ✅ Clean',  done:false },
    { label:'Duplicate detection: No match ✓', done:false },
    { label:'Category auto-tagged: Local News',done:false },
    { label:'Editorial queue: Submitted ✓',    done:false },
  ];
  const AI_STEPS_REVIEW = [
    { label:'Uploading media…',                          done:false },
    { label:'AI transcription complete',                 done:false },
    { label:'Language detection: Telugu ✓',              done:false },
    { label:'Content safety check: ⚠️ Needs review',    done:false },
    { label:'Sent to editorial team for verification',   done:false },
  ];

  // Reveal the AI-moderation steps one by one as the success confirmation.
  function runResultAnimation() {
    const steps = AI_STEPS_APPROVED;
    setAiSteps([]);
    steps.forEach((s, i) => {
      setTimeout(() => {
        setAiSteps(prev => [...prev, { ...s, done: true }]);
        if (i === steps.length - 1) {
          setTimeout(() => { setAiResult('approved'); setStep(2); }, 600);
        }
      }, 300 + i * 500);
    });
  }

  async function startUpload() {
    // Reset previous flags
    setValidationError('');
    setInvalidFields({headline:false,details:false,media:false,confirm:false});

    const hwc = headline.trim() ? headline.trim().split(/\s+/).filter(Boolean).length : 0;
    const wc  = details.trim()  ? details.trim().split(/\s+/).filter(Boolean).length  : 0;
    const headlineBad = hwc < 4 || hwc > 30;
    const detailsBad  = wc < 20 || wc > 300;
    const mediaBad    = mediaPreviews.length === 0;
    const confirmBad  = !confirmed;

    if (headlineBad || detailsBad || mediaBad || confirmBad) {
      // Build a clear, friendly multi-line message naming every missing piece.
      const reasons = [];
      if (hwc === 0)        reasons.push('• Please type a Headline (Min 4 words).');
      else if (hwc < 4)     reasons.push(`• Headline needs at least 4 words — you have only ${hwc}.`);
      else if (hwc > 30)    reasons.push(`• Headline is too long — please keep it under 30 words (currently ${hwc}).`);
      if (wc === 0)         reasons.push('• Please describe the incident (Min 20 words).');
      else if (wc < 20)     reasons.push(`• Description needs at least 20 words — you have only ${wc}.`);
      else if (wc > 300)    reasons.push(`• Description is too long — please keep it under 300 words (currently ${wc}).`);
      if (mediaBad)         reasons.push('• Please upload at least one Photo or Video.');
      if (confirmBad)       reasons.push('• Please tick the content-originality confirmation.');
      setValidationError(reasons.join('\n'));
      setInvalidFields({ headline:headlineBad, details:detailsBad, media:mediaBad, confirm:confirmBad });
      return;
    }

    // Must be signed in to submit a report.
    if (!token) {
      setValidationError('• Please sign in before uploading.');
      return;
    }
    // Reject any file over the 2 GB hard cap before uploading anything.
    const tooBig = mediaFiles.find(f => f.size > MAX_REPORT_FILE_BYTES);
    if (tooBig) {
      setValidationError(`• "${tooBig.name || 'File'}" is larger than the 2 GB limit. Please choose a smaller file.`);
      setInvalidFields(prev => ({ ...prev, media: true }));
      return;
    }

    setStep(1);
    setUploadPct(0);
    setAiSteps([]);

    try {
      // 1) Upload every file → collect its stored path, grouped by type into
      //    video_paths / image_paths / audio_paths. The headline/description
      //    voice recordings are uploaded as audio and join audio_paths too.
      const video_paths = [], image_paths = [], audio_paths = [];
      const uploadJobs = [
        ...mediaFiles.map(f => ({ file: f, kind: mediaKindOf(f) })),
        ...(headlineAudio ? [{ file: headlineAudio.file, kind: 'audio' }] : []),
        ...(descriptionAudio ? [{ file: descriptionAudio.file, kind: 'audio' }] : []),
      ];
      const totalBytes = uploadJobs.reduce((a, j) => a + j.file.size, 0) || 1;
      let doneBytes = 0;

      for (const job of uploadJobs) {
        const arr = job.kind === 'video' ? video_paths : job.kind === 'audio' ? audio_paths : image_paths;
        const path = await uploadMediaChunked({
          blob: job.file, kind: job.kind, originalName: job.file.name, token,
          onProgress: (frac) => {
            const overall = (doneBytes + frac * job.file.size) / totalBytes;
            setUploadPct(Math.min(90, Math.round(overall * 90)));
          },
        });
        doneBytes += job.file.size;
        arr.push(path);
      }
      setUploadPct(92);

      // 2) POST /api/reports — exact documented body shape.
      const profilePicPath =
        user?.profile_picture || user?.profile_photo || user?.profilePhoto ||
        user?.profile_pic || user?.profile_image || user?.profileImage ||
        user?.photo || user?.avatar || user?.image || '';
      const payload = {
        name: (user?.name || '').trim(),
        email: user?.email || '',
        subject: headline.trim(),
        message: details.trim(),
        location: (location || '').trim(),
        video_paths,
        image_paths,
        audio_paths,
        profile_picture: profilePicPath,
      };

      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        const msg = (d && (d.message || d.error))
          || (d && Array.isArray(d.errors) ? d.errors.map(e => e.msg || e.message).filter(Boolean).join('\n') : '')
          || `Submission failed (${res.status}).`;
        setStep(0);
        setValidationError(msg);
        return;
      }

      setUploadPct(100);
      runResultAnimation();
    } catch (e) {
      setStep(0);
      setValidationError('• Upload failed: ' + ((e && e.message) || 'network error') + '. Please try again.');
    }
  }

  // ── STEP 0: Fill form ──────────────────────────────────────
  if (step === 0) return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{
        background:'linear-gradient(135deg,#0a1a3a 0%,#1A3FCC 55%,#0F2A99 100%)',
        padding:'52px 18px 18px',flexShrink:0,
        boxShadow:'0 4px 18px rgba(26,63,204,0.3)',
        position:'relative',overflow:'hidden',
        display:'flex',alignItems:'center',justifyContent:'center',
        minHeight:96,
      }}>
        {/* Subtle decorative shine */}
        <div style={{position:'absolute',top:-30,right:-30,width:140,height:140,
          borderRadius:'50%',background:'radial-gradient(circle,rgba(255,255,255,0.18),transparent 70%)',
          pointerEvents:'none'}}/>
        {/* Back arrow — absolute, vertically centered with the title */}
        <button onClick={onBack} style={{
          position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',
          marginTop:14, /* offset the 52px top safe-area padding */
          zIndex:10,
          background:'rgba(255,255,255,0.22)',border:'none',borderRadius:8,
          width:34,height:34,color:'white',fontSize:18,cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',
        }}>←</button>
        {/* Centered title with reporter's handheld mic */}
        <div style={{
          marginTop:14,
          display:'flex',alignItems:'center',gap:12,
        }}>
          {/* Reporter handheld TV mic — bent to the right, with LocalAI TV branded flag */}
          <div style={{
            flexShrink:0,
            transform:'rotate(14deg)',
            transformOrigin:'50% 90%',
            filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
          }}>
            <svg width={50} height={78} viewBox="0 0 60 96" fill="none">
              {/* Foam head — black rounded dome */}
              <path d="M30 4
                       C18 4, 13 12, 13 24
                       L13 36
                       C13 42, 18 46, 30 46
                       C42 46, 47 42, 47 36
                       L47 24
                       C47 12, 42 4, 30 4 Z"
                fill="#1a1a1a"/>
              {/* Foam highlight (subtle gloss) */}
              <ellipse cx="22" cy="18" rx="3.5" ry="7" fill="rgba(255,255,255,0.13)"/>

              {/* Blue rectangular flag — LocalAI TV branded */}
              <rect x="3" y="44" width="54" height="20" rx="2" ry="2"
                fill="#1A3FCC" stroke="#0F2A99" strokeWidth="0.6"/>

              {/* Red location pin (top of flag) */}
              <path d="M30 47.5
                       C27.5 47.5, 25.8 49.2, 25.8 51.4
                       C25.8 53.8, 30 57, 30 57
                       C30 57, 34.2 53.8, 34.2 51.4
                       C34.2 49.2, 32.5 47.5, 30 47.5 Z"
                fill="#D0021B"/>
              <circle cx="30" cy="51.4" r="1.5" fill="white"/>

              {/* "LocalAI" text — no space */}
              <text x="6" y="62"
                fontFamily="Barlow Condensed, sans-serif"
                fontSize="6.5" fontWeight="900" fill="white"
                letterSpacing="0.2">LocalAI</text>

              {/* Small "TV" red badge — placed right beside LocalAI */}
              <rect x="36" y="57.5" width="13" height="6" rx="1.5" fill="#D0021B"/>
              <text x="42.5" y="62.2" textAnchor="middle"
                fontFamily="Barlow Condensed, sans-serif"
                fontSize="5" fontWeight="900" fill="white">TV</text>

              {/* Black handle — longer */}
              <rect x="26" y="64" width="8" height="30" rx="1.5" fill="#1a1a1a"/>
              {/* Handle highlight */}
              <rect x="27" y="64.5" width="1.5" height="29" rx="0.5" fill="rgba(255,255,255,0.18)"/>
              {/* Handle bottom cap */}
              <rect x="25" y="92" width="10" height="2" rx="0.5" fill="#0a0a0a"/>
            </svg>
          </div>

          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',lineHeight:1}}>
            <span style={{
              fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:28,
              color:'white',
              textShadow:'0 1px 3px rgba(0,0,0,0.25)',lineHeight:1.1,
            }}>వార్తలు</span>
            <span style={{
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:14,
              color:'rgba(255,255,255,0.85)',letterSpacing:0.8,marginTop:2,
              textShadow:'0 1px 2px rgba(0,0,0,0.2)',
            }}>News</span>
          </div>
        </div>
      </div>

      {/* ── White sub-banner: "వార్తల సమాచారం / News Information" with mic icon ── */}
      <div style={{
        background: T.isDark ? T.bg2 : '#FFFFFF',
        padding:'10px 18px',flexShrink:0,
        borderBottom:`1px solid ${T.border}`,
        boxShadow:T.isDark?'none':'0 2px 6px rgba(0,0,0,0.06)',
        display:'flex',alignItems:'center',gap:12,
      }}>
        {/* Mic icon — same handheld TV reporter mic from the top header, smaller */}
        <div style={{flexShrink:0,filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>
          <svg width={32} height={42} viewBox="0 0 60 96" fill="none">
            <path d="M30 4 C18 4, 13 12, 13 24 L13 36 C13 42, 18 46, 30 46 C42 46, 47 42, 47 36 L47 24 C47 12, 42 4, 30 4 Z" fill="#1a1a1a"/>
            <ellipse cx="22" cy="18" rx="3.5" ry="7" fill="rgba(255,255,255,0.13)"/>
            <rect x="3" y="44" width="54" height="20" rx="2" ry="2" fill="#1A3FCC" stroke="#0F2A99" strokeWidth="0.6"/>
            <path d="M30 47.5 C27.5 47.5, 25.8 49.2, 25.8 51.4 C25.8 53.8, 30 57, 30 57 C30 57, 34.2 53.8, 34.2 51.4 C34.2 49.2, 32.5 47.5, 30 47.5 Z" fill="#D0021B"/>
            <circle cx="30" cy="51.4" r="1.5" fill="white"/>
            <text x="6" y="62" fontFamily="Barlow Condensed, sans-serif" fontSize="6.5" fontWeight="900" fill="white" letterSpacing="0.2">LocalAI</text>
            <rect x="36" y="57.5" width="13" height="6" rx="1.5" fill="#D0021B"/>
            <text x="42.5" y="62.2" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontSize="5" fontWeight="900" fill="white">TV</text>
            <rect x="26" y="64" width="8" height="30" rx="1.5" fill="#1a1a1a"/>
            <rect x="27" y="64.5" width="1.5" height="29" rx="0.5" fill="rgba(255,255,255,0.18)"/>
            <rect x="25" y="92" width="10" height="2" rx="0.5" fill="#0a0a0a"/>
          </svg>
        </div>
        {/* Telugu BIG on top, English smaller below */}
        <div style={{display:'flex',flexDirection:'column',lineHeight:1}}>
          <span style={{
            fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:20,
            color:'#0F2A99',lineHeight:1.2,
          }}>వార్తల సమాచారం</span>
          <span style={{
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:13,
            color:T.textMuted,letterSpacing:0.6,marginTop:2,
          }}>News Information</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'20px 18px 120px'}}>


        {/* ── UPLOAD MEDIA SECTION ── */}
        <div style={{marginBottom:18}}>
          {/* Photo / Video heading — same style as HEADLINE / DESCRIBE / LOCATION */}
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:18,color:T.text,fontWeight:900,lineHeight:1.2}}>
              ఫోటో / వీడియో <span style={{fontSize:14,color:T.textMuted,fontWeight:600}}>(గరిష్ఠంగా 3 ఫైళ్లు)</span>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:T.textMuted,fontWeight:600,letterSpacing:0.4}}>
              Photo / Video <span style={{fontSize:11,color:T.textMuted,fontWeight:500}}>(Max 3 files)</span>
            </div>
          </div>

          {/* 3 equal buttons — Photo (red), Video (red), Library (white w/ red border) */}
          <div style={{display:'flex',gap:8,marginBottom:12}}>

            {/* PHOTO — square, English only */}
            <button onClick={()=>{
              if(mediaPreviews.length>=3){alert('Maximum allowed is 3 files.');return;}
              setMediaType('photo');
              setCapture('photo');
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-4px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.65), inset 0 0 0 2px rgba(255,255,255,0.35)';
              e.currentTarget.style.background='linear-gradient(160deg,#FF1A35 0%,#C8001F 100%)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow=mediaType==='photo'
                ?'0 3px 14px rgba(208,2,27,0.5), inset 0 0 0 2px rgba(255,255,255,0.3)'
                :'0 2px 8px rgba(208,2,27,0.3)';
              e.currentTarget.style.background='linear-gradient(160deg,#E8001E 0%,#B0001A 100%)';
            }}
            style={{
              flex:1, aspectRatio:'1', borderRadius:12, cursor:'pointer',
              border:'none',
              background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
              boxShadow: mediaType==='photo'
                ?'0 3px 14px rgba(208,2,27,0.5), inset 0 0 0 2px rgba(255,255,255,0.3)'
                :'0 2px 8px rgba(208,2,27,0.3)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:4, padding:'8px 4px', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <div style={{
                width:30, height:30, borderRadius:'50%',
                background:'rgba(255,255,255,0.22)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:'white',fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Photo</div>
              <div style={{fontFamily:"'Barlow',sans-serif",fontSize:8,color:'rgba(255,255,255,0.85)',fontWeight:500,lineHeight:1.1,textAlign:'center'}}>Take a picture</div>
            </button>

            {/* VIDEO — square, English only */}
            <button onClick={()=>{
              if(mediaPreviews.length>=3){alert('Maximum allowed is 3 files.');return;}
              setMediaType('video');
              setCapture('video');
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-4px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.65), inset 0 0 0 2px rgba(255,255,255,0.35)';
              e.currentTarget.style.background='linear-gradient(160deg,#FF1A35 0%,#C8001F 100%)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow=mediaType==='video'
                ?'0 3px 14px rgba(208,2,27,0.5), inset 0 0 0 2px rgba(255,255,255,0.3)'
                :'0 2px 8px rgba(208,2,27,0.3)';
              e.currentTarget.style.background='linear-gradient(160deg,#E8001E 0%,#B0001A 100%)';
            }}
            style={{
              flex:1, aspectRatio:'1', borderRadius:12, cursor:'pointer',
              border:'none',
              background:'linear-gradient(160deg,#E8001E 0%,#B0001A 100%)',
              boxShadow: mediaType==='video'
                ?'0 3px 14px rgba(208,2,27,0.5), inset 0 0 0 2px rgba(255,255,255,0.3)'
                :'0 2px 8px rgba(208,2,27,0.3)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:4, padding:'8px 4px', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <div style={{
                width:30, height:30, borderRadius:'50%',
                background:'rgba(255,255,255,0.22)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:'white',fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Video</div>
              <div style={{fontFamily:"'Barlow',sans-serif",fontSize:8,color:'rgba(255,255,255,0.85)',fontWeight:500,lineHeight:1.1,textAlign:'center'}}>Record a clip</div>
            </button>

            {/* LIBRARY — square, English only */}
            <button onClick={()=>{
              if(mediaPreviews.length>=3){alert('Maximum allowed is 3 files.');return;}
              setMediaType('text');
              document.getElementById('news-library-input')?.click();
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-4px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 8px 22px rgba(208,2,27,0.4), inset 0 0 0 1px rgba(208,2,27,0.2)';
              e.currentTarget.style.background='rgba(208,2,27,0.06)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow=mediaType==='text'?'0 2px 10px rgba(208,2,27,0.22)':'none';
              e.currentTarget.style.background=T.isDark?T.bg3:'#FFFFFF';
            }}
            style={{
              flex:1, aspectRatio:'1', borderRadius:12, cursor:'pointer',
              border:`2px solid ${T.red}`,
              background:T.isDark?T.bg3:'#FFFFFF',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:4, padding:'8px 4px', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: mediaType==='text'?'0 2px 10px rgba(208,2,27,0.22)':'none',
            }}>
              <div style={{
                width:30, height:30, borderRadius:'50%',
                background:'rgba(255,200,205,0.55)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2B7FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:T.red,fontWeight:900,lineHeight:1,letterSpacing:0.3,marginTop:1}}>Library</div>
              <div style={{fontFamily:"'Barlow',sans-serif",fontSize:8,color:T.red,fontWeight:600,lineHeight:1.1,textAlign:'center'}}>Files &amp; Gallery</div>
            </button>
          </div>

          {/* Hidden file inputs */}
          {/* Photo — opens camera, photo only */}
          <input id="news-photo-input" type="file" accept="image/*" capture="environment"
            style={{display:'none'}} onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3) { e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          {/* Video — opens camera, video only */}
          <input id="news-video-input" type="file" accept="video/*" capture="environment"
            style={{display:'none'}} onChange={e=>{
              const f = e.target.files?.[0]; if(!f) return;
              if(mediaPreviews.length >= 3) { e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              setMediaFiles(prev=>[...prev,f]);
              setMediaPreviews(prev=>[...prev,URL.createObjectURL(f)]);
              e.target.value='';
            }}/>
          {/* Library — opens file picker, multiple photos/videos from gallery */}
          <input id="news-library-input" type="file" accept="image/*,video/*" multiple
            style={{display:'none'}} onChange={e=>{
              const picked = Array.from(e.target.files || []);
              if(!picked.length) return;
              const room = 3 - mediaPreviews.length;
              if(room <= 0){ e.target.value=''; alert('Maximum allowed is 3 files.'); return; }
              if(picked.length > room) alert(`Only ${room} more file(s) can be added (3 max).`);
              picked.slice(0, room).forEach(addMediaFile);
              e.target.value='';
            }}/>

          {/* Uploaded thumbnails — same square size as the buttons */}
          {mediaPreviews.length > 0 && (
            <div style={{display:'flex',gap:8}}>
              {mediaPreviews.map((src,i)=>{
                const file = mediaFiles[i];
                const isVideo = file && file.type && file.type.startsWith('video/');
                return (
                  <div key={i} style={{flex:1,aspectRatio:'1',position:'relative',borderRadius:12,overflow:'hidden',
                    border:`1.5px solid ${T.border}`,background:'#000',flexShrink:0,
                    display:'flex',flexDirection:'column'}}>
                    {/* Media area — tap to preview full-screen */}
                    <div onClick={()=>setPreviewIdx(i)} style={{flex:1,position:'relative',overflow:'hidden',background:'#000',cursor:'pointer'}}>
                      {isVideo ? (
                        <>
                          <video src={src} preload="metadata" muted playsInline
                            style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                          {/* Play button overlay */}
                          <div style={{
                            position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
                            width:34,height:34,borderRadius:'50%',
                            background:'rgba(255,255,255,0.92)',
                            display:'flex',alignItems:'center',justifyContent:'center',
                            boxShadow:'0 2px 6px rgba(0,0,0,0.4)',pointerEvents:'none',
                          }}>
                            <svg width={14} height={14} viewBox="0 0 24 24" fill="#D0021B">
                              <polygon points="5,3 19,12 5,21"/>
                            </svg>
                          </div>
                        </>
                      ) : (
                        <img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                      )}
                      <div style={{position:'absolute',top:5,left:5,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:8,fontWeight:800,letterSpacing:0.5,borderRadius:5,padding:'2px 6px',fontFamily:"'Barlow Condensed',sans-serif"}}>
                        {isVideo?'VIDEO':'PHOTO'}
                      </div>
                      <div style={{position:'absolute',bottom:5,right:5,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:8,fontWeight:700,borderRadius:5,padding:'2px 6px'}}>👁 View</div>
                    </div>
                    {/* Delete bar at bottom */}
                    <button onClick={()=>{
                      setMediaFiles(prev=>prev.filter((_,j)=>j!==i));
                      setMediaPreviews(prev=>prev.filter((_,j)=>j!==i));
                    }} style={{
                      width:'100%',padding:'5px 0',
                      background:'rgba(208,2,27,0.92)',border:'none',
                      color:'white',fontSize:10,fontWeight:700,letterSpacing:0.5,
                      cursor:'pointer',flexShrink:0,
                    }}>Delete</button>
                  </div>
                );
              })}

              {/* Add slot — shown while < 3 uploaded */}
              {mediaPreviews.length < 3 && (
                <div onClick={()=>document.getElementById('news-library-input')?.click()}
                  style={{flex:1,aspectRatio:'1',borderRadius:12,
                    border:`1.5px dashed ${T.border}`,background:T.bg3,
                    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                    gap:4,cursor:'pointer',flexShrink:0}}>
                  <span style={{fontSize:26,color:T.textMuted,lineHeight:1}}>＋</span>
                  <span style={{fontSize:9,color:T.textMuted,fontWeight:700}}>
                    Add File
                  </span>
                </div>
              )}

              {/* Blank spacer slots to keep the 3-column grid */}
              {mediaPreviews.length === 0 && [0,1].map(i=>(
                <div key={i} style={{flex:1,aspectRatio:'1',borderRadius:12,
                  border:`1px solid transparent`,flexShrink:0}}/>
              ))}
              {mediaPreviews.length === 1 && (
                <div style={{flex:1,aspectRatio:'1',borderRadius:12,
                  border:`1px solid transparent`,flexShrink:0}}/>
              )}
            </div>
          )}

        </div>

        {/* ── HEADLINE (card) ── */}
        <div style={{
          background:T.isDark?T.bg2:'#FFFFFF',
          borderRadius:14,padding:'16px',marginBottom:16,
          border:`1px solid ${T.border}`,
          boxShadow:T.isDark?'none':'0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:18,color:T.text,fontWeight:900,lineHeight:1.2}}>
              శీర్షిక <span style={{color:T.red}}>*</span>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:T.textMuted,fontWeight:600,letterSpacing:0.4}}>
              HEADLINE
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:13,color:T.text,fontWeight:700,lineHeight:1.3}}>
              టెక్స్ట్ టైప్ చేయండి / వాయిస్ రికార్డ్ చేయండి (కనీసం 4 పదాలు)
            </div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Type Text /Record Voice (Min 4 Words)</div>
          </div>

          <input value={voiceField==='headline' && interimText ? (headline ? headline + ' ' : '') + interimText : headline}
            onChange={e=>setHeadline(e.target.value)} maxLength={100}
            placeholder="హెడ్‌లైన్‌ను ఇక్కడ టైప్ చేయండి"
            style={{width:'100%',background:invalidFields.headline?'rgba(229,57,53,0.06)':(T.isDark?T.bg3:'#FAFBFC'),
              borderRadius:10,padding:'14px',fontSize:14,color:T.text,
              border:`${invalidFields.headline?2:1}px solid ${invalidFields.headline?'#E53935':(voiceField==='headline'?T.red:T.border)}`,
              outline:'none',boxSizing:'border-box',
              fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
              boxShadow: invalidFields.headline?'0 0 0 3px rgba(229,57,53,0.12)':'none',
              transition:'all 0.2s'}}/>

          {/* Bottom row: word count (left) + small Record button (right) */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
            marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
            <div style={{fontSize:12,color:T.textMuted,fontWeight:600,fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>
              {headline.trim() ? headline.trim().split(/\s+/).filter(Boolean).length : 0} పదాలు <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:T.textMuted}}>/ words</span>
            </div>
            <button onClick={()=>toggleFieldAudio('headline')}
              style={{
                background: audioRecording==='headline'
                  ?'linear-gradient(135deg,#9A0015,#D0021B)'
                  :'linear-gradient(135deg,#E8001E,#B0001A)',
                border:'none', borderRadius:24, padding:'8px 18px',
                color:'white', fontSize:12, fontWeight:800, letterSpacing:0.5,
                cursor:'pointer', display:'flex', alignItems:'center', gap:7,
                boxShadow:'0 2px 10px rgba(208,2,27,0.35)',
                animation: audioRecording==='headline' ? 'pulse 1s infinite' : 'none',
              }}>
              {audioRecording==='headline' ? (
                <>
                  <span style={{width:9,height:9,borderRadius:'50%',background:'#fff'}}/>
                  <span style={{fontVariantNumeric:'tabular-nums',letterSpacing:1}}>{audioMMSS}</span>
                  <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>ఆపండి / Stop</span>
                </>
              ) : (
                <>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="2" width="6" height="11" rx="3"/>
                    <path d="M5 10a7 7 0 0014 0"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                  <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>రికార్డ్ / Record</span>
                </>
              )}
            </button>
          </div>
          {/* Recorded headline audio — playback preview */}
          {headlineAudio && (
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'8px 10px'}}>
              <audio src={headlineAudio.url} controls style={{flex:1,height:34}}/>
              <button onClick={()=>{ try{URL.revokeObjectURL(headlineAudio.url);}catch(e){} setHeadlineAudio(null); }}
                style={{flexShrink:0,width:30,height:30,borderRadius:8,border:'none',background:'rgba(208,2,27,0.92)',color:'white',fontSize:14,fontWeight:800,cursor:'pointer'}}>✕</button>
            </div>
          )}
        </div>

        {/* ── DESCRIBE THE INCIDENT (card) ── */}
        <div style={{
          background:T.isDark?T.bg2:'#FFFFFF',
          borderRadius:14,padding:'16px 16px 14px',marginBottom:16,
          border:`1px solid ${T.border}`,
          boxShadow:T.isDark?'none':'0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:18,color:T.text,fontWeight:900,lineHeight:1.2}}>
              సంఘటన వివరించండి <span style={{color:T.red}}>*</span>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:T.textMuted,fontWeight:600,letterSpacing:0.4}}>
              DESCRIBE THE INCIDENT
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:13,color:T.text,fontWeight:700,lineHeight:1.3}}>
              టెక్స్ట్ టైప్ చేయండి / వాయిస్ రికార్డ్ చేయండి (కనీసం 20 పదాలు)
            </div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Type Text /Record Voice (Min 20 Words)</div>
          </div>

          <textarea
            value={voiceField==='details' && interimText ? details + ' ' + interimText : details}
            onChange={e=>setDetails(e.target.value)} maxLength={5000} rows={5}
            placeholder="సంఘటన వివరాలను ఇక్కడ టైప్ చేయండి"
            style={{width:'100%',background:invalidFields.details?'rgba(229,57,53,0.06)':(T.isDark?T.bg3:'#FAFBFC'),
              borderRadius:10,padding:'14px',fontSize:14,color:T.text,
              border:`${invalidFields.details?2:1}px solid ${invalidFields.details?'#E53935':T.border}`,
              outline:'none',resize:'none',boxSizing:'border-box',lineHeight:1.6,
              fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
              boxShadow: invalidFields.details?'0 0 0 3px rgba(229,57,53,0.12)':'none',
              transition:'all 0.2s'}}/>

          {/* Bottom row: word/char count (left) + small Record button (right) */}
          {(() => {
            const wc = details.trim() ? details.trim().split(/\s+/).filter(Boolean).length : 0;
            const tooLong = wc > 300;
            const ok = wc >= 20 && wc <= 300;
            const clr = tooLong ? '#E53935' : ok ? '#00D068' : T.textMuted;
            return (
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,gap:10}}>
                <div style={{display:'flex',flexDirection:'column',gap:2}}>
                  <div style={{fontSize:12,color:clr,fontWeight:600,fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>
                    {wc} / 300 పదాలు <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,color:T.textMuted}}>words</span>
                  </div>
                  <div style={{fontSize:10,color:T.textMuted}}>min 20 · max 300</div>
                </div>
                <button onClick={()=>toggleFieldAudio('details')}
                  style={{
                    background: audioRecording==='details'
                      ?'linear-gradient(135deg,#9A0015,#D0021B)'
                      :'linear-gradient(135deg,#E8001E,#B0001A)',
                    border:'none', borderRadius:24, padding:'8px 18px',
                    color:'white', fontSize:12, fontWeight:800, letterSpacing:0.5,
                    cursor:'pointer', display:'flex', alignItems:'center', gap:7,
                    boxShadow:'0 2px 10px rgba(208,2,27,0.35)', flexShrink:0,
                    animation: audioRecording==='details' ? 'pulse 1s infinite' : 'none',
                  }}>
                  {audioRecording==='details' ? (
                    <>
                      <span style={{width:9,height:9,borderRadius:'50%',background:'#fff'}}/>
                      <span style={{fontVariantNumeric:'tabular-nums',letterSpacing:1}}>{audioMMSS}</span>
                      <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>ఆపండి / Stop</span>
                    </>
                  ) : (
                    <>
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="2" width="6" height="11" rx="3"/>
                        <path d="M5 10a7 7 0 0014 0"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                        <line x1="8" y1="22" x2="16" y2="22"/>
                      </svg>
                      <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>రికార్డ్ / Record</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}
          {/* Recorded description audio — playback preview */}
          {descriptionAudio && (
            <div style={{display:'flex',alignItems:'center',gap:8,marginTop:10,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'8px 10px'}}>
              <audio src={descriptionAudio.url} controls style={{flex:1,height:34}}/>
              <button onClick={()=>{ try{URL.revokeObjectURL(descriptionAudio.url);}catch(e){} setDescriptionAudio(null); }}
                style={{flexShrink:0,width:30,height:30,borderRadius:8,border:'none',background:'rgba(208,2,27,0.92)',color:'white',fontSize:14,fontWeight:800,cursor:'pointer'}}>✕</button>
            </div>
          )}
        </div>

        {/* ── LOCATION (card) ── */}
        <div style={{
          background:T.isDark?T.bg2:'#FFFFFF',
          borderRadius:14,padding:'16px',marginBottom:16,
          border:`1px solid ${T.border}`,
          boxShadow:T.isDark?'none':'0 2px 10px rgba(0,0,0,0.04)',
        }}>
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:18,color:T.text,fontWeight:900,lineHeight:1.2}}>
              ప్రదేశం <span style={{color:T.red}}>*</span>
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,color:T.textMuted,fontWeight:600,letterSpacing:0.4}}>
              LOCATION
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:13,color:T.text,fontWeight:700,lineHeight:1.3}}>
              వీధి / ప్రాంతం / గ్రామం / పట్టణం
            </div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:1}}>Street Name / Area / Village / Town</div>
          </div>

          {/* Input with pin icon on the RIGHT */}
          <div style={{position:'relative'}}>
            <input value={voiceField==='location' && interimText ? (location ? location + ' ' : '') + interimText : location}
              onChange={e=>setLocation(e.target.value)}
              placeholder="వీధి / ప్రాంతం / గ్రామం / పట్టణం"
              style={{width:'100%',background:T.isDark?T.bg3:'#FAFBFC',
                borderRadius:10,padding:'14px 50px 14px 14px',fontSize:14,color:T.text,
                border:`1px solid ${voiceField==='location'?T.red:T.border}`,
                outline:'none',boxSizing:'border-box',transition:'all 0.2s',
                fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}/>
            {/* Location pin on the right side of the input */}
            <div style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',
              width:36,height:36,borderRadius:8,
              background:'linear-gradient(135deg,#E8001E,#B0001A)',
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 2px 6px rgba(208,2,27,0.35)',pointerEvents:'none'}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5" fill="#B0001A"/>
              </svg>
            </div>
          </div>

          {/* Bottom row: small Record button only (right-aligned) */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',
            marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
            {VOICE_SUPPORTED && (
              <button onClick={() => voiceField==='location'?stopVoice():startVoice('location')}
                onMouseEnter={e=>{
                  e.currentTarget.style.transform='translateY(-2px) scale(1.06)';
                  e.currentTarget.style.boxShadow='0 6px 18px rgba(208,2,27,0.6)';
                  e.currentTarget.style.background='linear-gradient(135deg,#FF1A35,#C8001F)';
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform='translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow='0 2px 10px rgba(208,2,27,0.35)';
                  e.currentTarget.style.background = voiceField==='location'
                    ?'linear-gradient(135deg,#9A0015,#D0021B)'
                    :'linear-gradient(135deg,#E8001E,#B0001A)';
                }}
                style={{
                  background: voiceField==='location'
                    ?'linear-gradient(135deg,#9A0015,#D0021B)'
                    :'linear-gradient(135deg,#E8001E,#B0001A)',
                  border:'none', borderRadius:24, padding:'8px 18px',
                  color:'white', fontSize:12, fontWeight:800, letterSpacing:0.5,
                  cursor:'pointer',
                  display:'flex', alignItems:'center', gap:7,
                  boxShadow:'0 2px 10px rgba(208,2,27,0.35)',
                  transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0014 0"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
                <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>{voiceField==='location'?'ఆపండి / Stop':'రికార్డ్ / Record'}</span>
              </button>
            )}
          </div>
        </div>
        {/* Content originality confirmation */}
        <div style={{
          background:'rgba(43,127,255,0.08)',
          border:'1px solid rgba(43,127,255,0.18)',
          borderRadius:14, padding:'14px 16px', marginBottom:16,
          display:'flex', alignItems:'flex-start', gap:12,
        }}>
          {/* Checkbox */}
          <button onClick={()=>setConfirmed(v=>!v)} style={{
            flexShrink:0, width:22, height:22, borderRadius:5,
            background: confirmed?'#2B7FFF':'transparent',
            border:`2px solid #2B7FFF`,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', padding:0,
          }}>
            {confirmed && (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12,color:T.text,lineHeight:1.5,fontWeight:700}}>
              ఈ కంటెంట్ స్వంతమైనదని, ఏ చట్టాలను ఉల్లంఘించడం లేదని నేను నిర్ధారిస్తున్నాను.
            </div>
            <div style={{fontSize:11,color:T.textMuted,lineHeight:1.4,marginBottom:4}}>
              I confirm this content is original and does not violate any laws.
            </div>
            <a href="#" onClick={e=>e.preventDefault()}
              style={{fontSize:12,color:'#2B7FFF',fontWeight:700,textDecoration:'underline',fontFamily:"'Noto Sans Telugu','Barlow',sans-serif"}}>
              కంటెంట్ పాలసీ చదవండి / Read Content Policy
            </a>
          </div>
        </div>
        {/* Inline validation error banner — appears when Submit is clicked with missing/short fields */}
        {validationError && (
          <div style={{
            background:'rgba(229,57,53,0.08)',
            border:'2px solid #E53935',
            borderLeft:'5px solid #E53935',
            borderRadius:12, padding:'12px 14px', marginBottom:12,
            display:'flex', alignItems:'flex-start', gap:10,
            animation:'shake 0.3s ease',
          }}>
            <span style={{fontSize:18,flexShrink:0,lineHeight:1.1}}>⚠️</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,color:'#C62828',letterSpacing:0.4,marginBottom:4}}>
                Submission Blocked — Please Fix:
              </div>
              <div style={{fontSize:12.5,color:T.isDark?'#FFB4B4':'#7A1F1F',lineHeight:1.55,whiteSpace:'pre-line',fontWeight:600}}>
                {validationError}
              </div>
            </div>
          </div>
        )}
        {/* Submit */}
        {(() => {
          const wc = details.trim() ? details.trim().split(/\s+/).filter(Boolean).length : 0;
          const hwc = headline.trim() ? headline.trim().split(/\s+/).filter(Boolean).length : 0;
          const canSubmit = headline.trim() && hwc >= 4 && hwc <= 30 && wc >= 20 && wc <= 300 && mediaPreviews.length > 0 && confirmed;
          // NOTE: We intentionally do NOT disable the button — clicking always runs validation
          // so the user sees an inline red banner explaining what's missing, instead of a dead button.
          return (
            <button onClick={startUpload}
              style={{width:'100%',background:canSubmit?`linear-gradient(135deg,${T.red},#9A0015)`:'rgba(120,120,120,0.45)',color:'white',borderRadius:12,padding:'14px',cursor:'pointer',border:'none',boxSizing:'border-box',display:'flex',flexDirection:'column',alignItems:'center',gap:2,opacity:canSubmit?1:0.85,transition:'all 0.2s'}}>
              <span style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:17,lineHeight:1.2}}>🚀 సమీక్ష కోసం సమర్పించండి</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:12,letterSpacing:1.5,opacity:0.92}}>Submit for Review</span>
            </button>
          );
        })()}
      </div>

      {/* Hidden audio fallback input (used if inline mic recording is unavailable) */}
      <input id="news-audio-input" type="file" accept="audio/*" style={{display:'none'}}
        onChange={e=>{ const f=e.target.files?.[0]; if(f && audioFallbackFor.current){ storeFieldAudio(audioFallbackFor.current, f); audioFallbackFor.current=null; } e.target.value=''; }}/>

      {/* Live camera capture (photo / video) — opens the real camera on desktop
          + mobile; falls back to the hidden file inputs on error. */}
      {capture && (
        <MediaCaptureModal
          mode={capture}
          onClose={() => setCapture(null)}
          onCapture={(file) => { addMediaFile(file); setCapture(null); }}
          onFallback={() => {
            const id = capture === 'video' ? 'news-video-input' : 'news-photo-input';
            setCapture(null);
            document.getElementById(id)?.click();
          }}
        />
      )}

      {/* Full-screen preview of an added media file (photo / video) */}
      {previewIdx !== null && mediaPreviews[previewIdx] && (() => {
        const f = mediaFiles[previewIdx];
        const isVid = f && f.type && f.type.startsWith('video/');
        const isAud = f && f.type && f.type.startsWith('audio/');
        return (
          <div onClick={()=>setPreviewIdx(null)}
            style={{position:'fixed',inset:0,zIndex:3500,background:'rgba(0,0,0,0.94)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
            <button type="button" onClick={(e)=>{e.stopPropagation();setPreviewIdx(null);}}
              style={{position:'absolute',top:16,right:16,width:40,height:40,borderRadius:'50%',border:'none',background:'rgba(255,255,255,0.15)',color:'white',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>✕</button>
            {isVid ? (
              <video src={mediaPreviews[previewIdx]} controls autoPlay playsInline onClick={e=>e.stopPropagation()} style={{maxWidth:'100%',maxHeight:'85vh',borderRadius:12,background:'#000'}}/>
            ) : isAud ? (
              <audio src={mediaPreviews[previewIdx]} controls autoPlay onClick={e=>e.stopPropagation()} style={{width:'90%'}}/>
            ) : (
              <img src={mediaPreviews[previewIdx]} alt="preview" onClick={e=>e.stopPropagation()} style={{maxWidth:'100%',maxHeight:'85vh',objectFit:'contain',borderRadius:12}}/>
            )}
            <div style={{position:'absolute',bottom:18,left:0,right:0,textAlign:'center',color:'rgba(255,255,255,0.65)',fontSize:12}}>
              {previewIdx+1} / {mediaPreviews.length} · tap outside to close
            </div>
          </div>
        );
      })()}
    </div>
  );

  // ── STEP 1: Upload + AI processing animation ───────────────
  if (step === 1) return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
      {/* Upload progress ring */}
      <div style={{width:100,height:100,borderRadius:'50%',background:`conic-gradient(${T.red} ${uploadPct*3.6}deg,${T.bg3} 0deg)`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:24,flexShrink:0}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text}}>{uploadPct}%</div>
        </div>
      </div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text,marginBottom:6}}>Processing your story…</div>
      <div style={{fontSize:11,color:T.textMuted,marginBottom:28}}>AI is reviewing your content</div>
      {/* Step-by-step AI log */}
      <div style={{width:'100%',maxWidth:320,display:'flex',flexDirection:'column',gap:8}}>
        {aiSteps.map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:T.bg2,borderRadius:10,border:`1px solid ${T.border}`}}>
            <span style={{fontSize:14}}>{s.done?'✅':'⏳'}</span>
            <span style={{fontSize:12,color:s.done?T.text:T.textMuted}}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── STEP 2: Submission confirmation ────────────────────────
  // Simple, focused success screen: confirms the upload, tells the user it's under
  // review and which constituency TV channel it will appear on, then auto-navigates
  // back to home (handled by the useEffect at the top of this component).
  return (
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

        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:26,color:T.text,marginBottom:6,textAlign:'center',letterSpacing:0.3}}>
          Your news uploaded successfully
        </div>
        <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:700,fontSize:14,color:T.textMuted,marginBottom:18,textAlign:'center'}}>
          మీ వార్త విజయవంతంగా అప్‌లోడ్ అయింది
        </div>

        {/* Under review card */}
        <div style={{width:'100%',maxWidth:340,
          background:T.isDark?'rgba(0,208,104,0.08)':'rgba(0,208,104,0.06)',
          border:'1px solid rgba(0,208,104,0.25)',
          borderRadius:14,padding:'16px 18px',marginBottom:18,textAlign:'center'}}>
          <div style={{fontSize:13,color:T.text,lineHeight:1.65,fontWeight:600}}>
            It is under review. Once reviewed, it will be published live in&nbsp;
            <span style={{color:T.red,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
              {constituency || 'your local'} TV
            </span>.
          </div>
        </div>

        {/* Submission preview */}
        <div style={{width:'100%',maxWidth:340,background:T.bg2,borderRadius:14,padding:'14px 16px',border:`1px solid ${T.border}`,marginBottom:18}}>
          <div style={{fontSize:10,color:T.textMuted,marginBottom:6,textTransform:'uppercase',letterSpacing:1,fontWeight:700}}>Your Submission</div>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:6,lineHeight:1.4}}>{headline}</div>
          <div style={{fontSize:12,color:T.textMuted,lineHeight:1.55}}>{details.slice(0,120)}{details.length>120?'…':''}</div>
          <div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
            <span style={{background:T.bg3,borderRadius:8,padding:'3px 8px',fontSize:10,color:T.textMuted,fontWeight:600}}>📍 {location||constituency}</span>
            <span style={{background:'rgba(255,184,0,0.14)',borderRadius:8,padding:'3px 8px',fontSize:10,color:T.gold,fontWeight:700}}>⏳ Under Review</span>
          </div>
        </div>

        {/* Auto-redirect hint */}
        <div style={{fontSize:11,color:T.textMuted,fontWeight:600,letterSpacing:0.4,textAlign:'center',display:'flex',alignItems:'center',gap:6}}>
          <span style={{display:'inline-block',width:10,height:10,borderRadius:'50%',
            border:`2px solid ${T.textMuted}`,borderTopColor:'transparent',
            animation:'spin 0.8s linear infinite'}}/>
          Returning to home…
        </div>

        {/* Manual fallback link in case auto-redirect doesn't fire */}
        <button onClick={()=>onNavigate('home')} style={{marginTop:10,background:'none',border:'none',color:T.red,fontSize:12,cursor:'pointer',padding:'6px',fontWeight:700,letterSpacing:0.4}}>
          Go to Home now →
        </button>
      </div>
    </div>
  );
}

export { NewsUploadFormScreen };
export default NewsUploadFormScreen;
