import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function GrievanceBlock() {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [type,     setType]     = useState('');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [desc,     setDesc]     = useState('');
  const [sent,     setSent]     = useState(false);

  function send() {
    if (!type || !name || !email || !desc) return;

    // ── Grievance API submission (POST /contacts) ──
    // Field mapping: name→name, email→email, "type — video link"→subject,
    // phone + complaint details combined into a labelled message.
    const subject = `${type} — ${videoUrl || 'No video link'}`;
    const message =
`Phone: ${phone || 'Not provided'}

Complaint Details: ${desc}`;

    // API_BASE already ends in /api → path is '/contacts'. Bearer token is
    // attached only when the user is signed in (form is open to anon users).
    try {
      apiCall('/contacts', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ name, email, subject, message }),
      }).catch(()=>{});
    } catch (e) { /* ignore */ }

    // Keep the email draft as a belt-and-suspenders fallback.
    const mailSubject = encodeURIComponent(`Grievance: ${type} — ${name}`);
    const body = encodeURIComponent(
`GRIEVANCE / COMPLAINT — LocalAI TV

Type:        ${type}
Name:        ${name}
Email:       ${email}
Phone:       ${phone || 'Not provided'}
Video URL:   ${videoUrl || 'Not provided'}

Description:
${desc}

Submitted: ${new Date().toLocaleString('en-IN')}
`);
    window.open(`mailto:support@localaitv.com?subject=${mailSubject}&body=${body}`);
    setSent(true);
  }

  if (sent) return (
    <div style={{background:'rgba(0,208,104,0.08)',border:`1px solid rgba(0,208,104,0.25)`,borderRadius:14,padding:'20px 16px',textAlign:'center'}}>
      <div style={{fontSize:36,marginBottom:8}}>✅</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.text,marginBottom:4}}>Grievance Submitted</div>
      <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>Your complaint has been sent to our team. We will review and respond within 24–48 hours.</div>
      <button onClick={()=>{setSent(false);setExpanded(false);setType('');setName('');setEmail('');setPhone('');setVideoUrl('');setDesc('');}}
        style={{marginTop:14,background:T.bg3,border:'none',borderRadius:10,padding:'10px 20px',color:T.textMuted,fontSize:13,cursor:'pointer'}}>
        Close
      </button>
    </div>
  );

  return (
    <div style={{background:T.bg3,borderRadius:14,overflow:'hidden',border:`1px solid rgba(208,2,27,0.2)`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
      {/* Header row — always visible */}
      <div onClick={()=>setExpanded(e=>!e)}
        style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}}>
        <div style={{width:36,height:36,borderRadius:10,background:'rgba(208,2,27,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📣</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:2}}>Raise a Grievance</div>
          <div style={{fontSize:11,color:T.textMuted}}>Report content · Request removal · Complaints</div>
        </div>
        <span style={{fontSize:14,color:T.red,fontWeight:700}}>{expanded?'▲':'▼'}</span>
      </div>

      {expanded && (
        <div style={{padding:'0 16px 16px',borderTop:`1px solid ${T.border}`}}>
          {/* Contact info strip */}
          <div style={{background:'rgba(208,2,27,0.08)',borderRadius:10,padding:'10px 12px',margin:'12px 0',display:'flex',flexDirection:'column',gap:6}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:2,fontWeight:600}}>Grievance Officer Contact</div>
            <div onClick={()=>window.open('tel:+917032327702')}
        style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',
          background:'rgba(37,211,102,0.06)',borderRadius:12,cursor:'pointer',
          border:'1px solid rgba(37,211,102,0.2)',marginBottom:8}}>
        <span style={{fontSize:20}}>📞</span>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#059669'}}>+91 70323 27702</div>
          <div style={{fontSize:10,color:'#6B7280'}}>Support Helpline</div>
        </div>
      </div>
      <div onClick={()=>window.open('mailto:support@localaitv.com')}
              style={{fontSize:12,color:T.teal,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              📧 support@localaitv.com
            </div>
            <div onClick={()=>window.open('tel:+917569684979')}
              style={{fontSize:12,color:T.teal,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
              📞 +91 7569684979
            </div>
          </div>

          {/* Grievance type */}
          <div style={{marginBottom:12}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:8}}>
              Type of Grievance <span style={{color:T.red}}>*</span>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['False / Misleading News','Defamation','Privacy Violation','Copyright Infringement','Offensive Content','Wrong Information','Other'].map(t=>(
                <button key={t} onClick={()=>setType(t)} style={{
                  background:type===t?'rgba(208,2,27,0.2)':'rgba(255,255,255,0.05)',
                  border:`1px solid ${type===t?T.red:'rgba(255,255,255,0.1)'}`,
                  borderRadius:20,padding:'5px 12px',fontSize:11,fontWeight:600,
                  color:type===t?'white':T.gray1,cursor:'pointer',
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Your Name <span style={{color:T.red}}>*</span></div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'11px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
          </div>

          {/* Email */}
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Email <span style={{color:T.red}}>*</span></div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'11px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
          </div>

          {/* Phone */}
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Phone (Optional)</div>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile number" type="tel"
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'11px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
          </div>

          {/* Video URL */}
          <div style={{marginBottom:10}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Video / Content Link (if known)</div>
            <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="YouTube URL or bulletin ID"
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'11px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
          </div>

          {/* Description */}
          <div style={{marginBottom:14}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Description <span style={{color:T.red}}>*</span></div>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Describe your complaint in detail — what is wrong, who is affected, what action you are requesting…" rows={4}
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'11px 14px',color:T.text,fontSize:13,resize:'none',lineHeight:1.6,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
          </div>

          {/* Response time note */}
          <div style={{background:'rgba(255,184,0,0.08)',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:11,color:T.gold,lineHeight:1.5}}>
            ⏱ We respond to all grievances within <strong>24–48 hours</strong>. Content flagged for removal will be reviewed within <strong>24 hours</strong>.
          </div>

          <button onClick={send} disabled={!type||!name||!email||!desc}
            style={{width:'100%',background:type&&name&&email&&desc?'linear-gradient(135deg,#D0021B,#7A0010)':'rgba(255,255,255,0.08)',color:T.text,border:'none',borderRadius:10,padding:'13px',fontWeight:800,fontSize:14,cursor:type&&name&&email&&desc?'pointer':'not-allowed',letterSpacing:0.5}}>
            📣 Submit Grievance
          </button>
        </div>
      )}
    </div>
  );
}

// ── REUSABLE LEGAL/INFO DOC SCREEN ─────────────────────────

export { GrievanceBlock };
export default GrievanceBlock;
