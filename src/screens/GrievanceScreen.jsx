import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';
import { useAuth } from '../contexts/AuthContext.jsx';

function GrievanceScreen({ onBack }) {
  const { T } = useAppTheme();
  const { token } = useAuth();
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

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>

      {/* Header */}
      <div style={{background:`linear-gradient(135deg,#7A0010,#D0021B)`,padding:'48px 18px 20px',flexShrink:0,position:'relative'}}>
        <button onClick={onBack} style={{position:'absolute',top:52,left:14,background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:6}}>📣</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,letterSpacing:0.8}}>Grievance & Complaints</div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>Report content · Request removal · Raise complaint</div>
        </div>
      </div>

      {sent ? (
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',textAlign:'center'}}>
          <div style={{fontSize:60,marginBottom:16}}>✅</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text,marginBottom:8}}>Grievance Submitted!</div>
          <div style={{fontSize:13,color:T.textMuted,lineHeight:1.7,marginBottom:20}}>
            Your complaint has been submitted successfully. Our team will review it and contact you if more information is required.
          </div>
          <div style={{background:T.bg3,borderRadius:12,padding:'14px 18px',marginBottom:24,width:'100%',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:8,fontWeight:600}}>Grievance Officer</div>
            <div style={{fontSize:12,color:T.teal,marginBottom:4}}>📧 support@localaitv.com</div>
            <div style={{fontSize:12,color:T.teal}}>📞 +91 7569684979</div>
          </div>
          <button onClick={onBack} style={{background:T.red,color:'white',border:'none',borderRadius:12,padding:'14px 32px',fontWeight:800,fontSize:15,cursor:'pointer'}}>Done</button>
        </div>
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:'16px'}}>

          {/* Grievance officer contact card */}
          <div style={{background:`linear-gradient(135deg,rgba(208,2,27,0.12),rgba(208,2,27,0.06))`,border:`1px solid rgba(208,2,27,0.25)`,borderRadius:14,padding:'16px',marginBottom:16}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.red,marginBottom:6,letterSpacing:0.5}}>GRIEVANCE OFFICER (IT Rules 2021)</div>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:10}}>Bommena Prashanth</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(208,2,27,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📧</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:1}}>EMAIL</div>
                  <div onClick={()=>window.open('mailto:support@localaitv.com')}
                    style={{fontSize:13,fontWeight:600,color:T.teal,cursor:'pointer'}}>support@localaitv.com</div>
                </div>
                <button onClick={()=>window.open('mailto:support@localaitv.com')}
                  style={{background:'rgba(0,198,184,0.15)',border:`1px solid rgba(0,198,184,0.3)`,borderRadius:8,padding:'6px 12px',fontSize:11,color:T.teal,fontWeight:700,cursor:'pointer'}}>Email</button>
              </div>
              <div style={{height:1,background:T.bg3}}/>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(208,2,27,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📞</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:1}}>PHONE</div>
                  <div onClick={()=>window.open('tel:+917569684979')}
                    style={{fontSize:13,fontWeight:600,color:T.teal,cursor:'pointer'}}>+91 7569684979</div>
                </div>
                <button onClick={()=>window.open('tel:+917569684979')}
                  style={{background:'rgba(0,208,104,0.15)',border:`1px solid rgba(0,208,104,0.3)`,borderRadius:8,padding:'6px 12px',fontSize:11,color:T.green,fontWeight:700,cursor:'pointer'}}>Call</button>
              </div>
            </div>
          </div>

          {/* Response time */}
          <div style={{background:'rgba(255,184,0,0.08)',border:`1px solid rgba(255,184,0,0.2)`,borderRadius:12,padding:'12px 14px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:18,flexShrink:0}}>⏱</span>
            <div style={{fontSize:12,color:T.gold,lineHeight:1.6}}>
              Complaints will be acknowledged within <strong>24 hours</strong> where applicable.<br/>
              Resolution or decision will be provided within <strong>15 days</strong> as per applicable process.
            </div>
          </div>

          {/* Form */}
          <div style={{background:T.bg2,borderRadius:14,padding:'16px',marginBottom:14,border:`1px solid ${T.border}`}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:T.text,marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>📝 Complaint Form</div>

            {/* Type */}
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:8}}>
                Type of Complaint <span style={{color:T.red}}>*</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {['Defamation / Objectionable Content','False / Misleading Information','Intellectual Property Violation','Privacy Violation','Fake Profile / Impersonation','Harassment / Threats','Hate Speech / Illegal Content','Other'].map(t=>(
                  <button key={t} onClick={()=>setType(t)} style={{
                    background:type===t?'rgba(208,2,27,0.2)':'rgba(255,255,255,0.05)',
                    border:`1px solid ${type===t?T.red:'rgba(255,255,255,0.1)'}`,
                    borderRadius:20,padding:'6px 12px',fontSize:11,fontWeight:600,
                    color:type===t?'white':T.gray1,cursor:'pointer',
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Your Name <span style={{color:T.red}}>*</span></div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name"
                style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
            </div>

            {/* Email */}
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Email <span style={{color:T.red}}>*</span></div>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"
                style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
            </div>

            {/* Phone */}
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Phone Number (Optional)</div>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel"
                style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
            </div>

            {/* Video URL */}
            <div style={{marginBottom:12}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Video / Content Link (Optional)</div>
              <input value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} placeholder="YouTube link or bulletin ID"
                style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
              <div style={{fontSize:10,color:T.textMuted,marginTop:4}}>If you want a specific video removed, paste the link here</div>
            </div>

            {/* Description */}
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,letterSpacing:1.5,color:T.textMuted,textTransform:'uppercase',marginBottom:6}}>Complaint Details <span style={{color:T.red}}>*</span></div>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)}
                placeholder="Describe your complaint in detail — what content is problematic, who is affected, what happened, and what action you are requesting…" rows={5}
                style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px 14px',color:T.text,fontSize:13,resize:'none',lineHeight:1.6,boxSizing:'border-box',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}/>
            </div>

            <button onClick={send} disabled={!type||!name||!email||!desc}
              style={{width:'100%',background:type&&name&&email&&desc?'linear-gradient(135deg,#D0021B,#7A0010)':'rgba(255,255,255,0.08)',color:T.text,border:'none',borderRadius:12,padding:'15px',fontWeight:800,fontSize:15,cursor:type&&name&&email&&desc?'pointer':'not-allowed',letterSpacing:0.5}}>
              📣 Submit Grievance
            </button>
          </div>
          <div style={{height:20}}/>
        </div>
      )}
    </div>
  );
}

export { GrievanceScreen };
export default GrievanceScreen;
