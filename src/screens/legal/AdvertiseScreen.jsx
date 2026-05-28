import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css, genComplianceId } from '../../_imports.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

function AdvertiseScreen({ onBack }) {
  const { T } = useAppTheme();
  const { token } = useAuth();
  const [name, setName]       = useState('');
  const [business, setBiz]    = useState('');
  const [phone, setPhone]     = useState('');
  const [email, setEmail]     = useState('');
  const [budget, setBudget]   = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent]       = useState(false);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit  = !!(name && business && phone && emailValid);

  function submit() {
    if (!canSubmit) return;
    const enquiryId = genComplianceId('AD');
    const subject = encodeURIComponent(`Advertise Inquiry [${enquiryId}] — ${business}`);
    const body = encodeURIComponent(
`ADVERTISER INQUIRY — LocalAI / AI News Network
Reference ID: ${enquiryId}

Contact Name:  ${name}
Business:      ${business}
Phone:         ${phone}
Email:         ${email}
Budget Range:  ${budget || 'Not specified'}

Message:
${message || 'Interested in advertising on LocalAI.'}

Submitted: ${new Date().toLocaleString('en-IN')}
`);
    // ── Save the lead in the Contact Us table (POST /contacts) ──
    // Field mapping: name→name, email→email; business, phone, budget and the
    // user's message are combined into a clean labelled `message`. Bearer token
    // attached only when the user is signed in (form is open to guests too).
    const contactsMessage =
`Advertise With Us — Enquiry

Business / Company: ${business}
Phone: ${phone}
Monthly Budget: ${budget || 'Not specified'}

Message:
${message || 'Interested in advertising on LocalAI.'}`;
    try {
      apiCall('/contacts', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({
          name,
          email,
          subject: `Advertise With Us — ${business}`,
          message: contactsMessage,
        }),
      }).catch(()=>{});
    } catch (e) { /* ignore */ }

    window.open(`mailto:ads@localaitv.com?subject=${subject}&body=${body}`);
    setSent(true);
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <div style={{background:`linear-gradient(135deg,#7A0010,#D0021B)`,padding:'48px 18px 22px',flexShrink:0,position:'relative'}}>
        <button onClick={onBack} style={{position:'absolute',top:52,left:14,background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:6}}>📢</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,letterSpacing:0.8}}>Advertise With Us</div>
          <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:14,lineHeight:1.65,fontWeight:700,color:T.textMuted,marginTop:4}}>మాతో ప్రకటనలు ఇవ్వండి</div>

        </div>
      </div>

      {sent ? (
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'32px 24px',textAlign:'center'}}>
          <div style={{fontSize:60,marginBottom:16}}>✅</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text,marginBottom:8}}>Inquiry Sent!</div>
          <div style={{fontSize:13,color:T.textMuted,lineHeight:1.7,marginBottom:24}}>
            Thank you for your interest. Our advertising team will contact you within 24 hours to discuss packages and pricing.
          </div>
          <button onClick={onBack} style={{background:T.red,color:'white',border:'none',borderRadius:14,padding:'14px 36px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,letterSpacing:1.5,cursor:'pointer'}}>BACK TO HOME</button>
        </div>
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:'20px 18px 140px'}}>
          <div style={{fontSize:13,color:T.textMuted,textAlign:'center',marginBottom:18,lineHeight:1.6}}>
            Reach <strong style={{color:T.gold}}>local audiences</strong> in your town, city, mandal, or constituency. Hyperlocal targeting, transparent process.
          </div>

          {/* Why advertise — safer wording */}
          <div style={{padding:'14px',background:'rgba(0,198,184,0.06)',border:'1px solid rgba(0,198,184,0.18)',borderRadius:12,marginBottom:18}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:13,color:T.teal,letterSpacing:1,marginBottom:10}}>🎯 WHY ADVERTISE WITH US?</div>
            {[
              ['📍','Target local customers in your area'],
              ['📺','Video, image, scrolling, and sponsored content formats'],
              ['🏪','Suitable for shops, services, events, institutions, local brands'],
              ['🌐','Distribution through app, website, and partner channels'],
              ['💼','Affordable advertising options for local businesses'],
            ].map((row, i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'5px 0'}}>
                <span style={{fontSize:14}}>{row[0]}</span>
                <span style={{fontSize:12,color:T.textMuted}}>{row[1]}</span>
              </div>
            ))}
            <div style={{fontSize:10,color:T.textMuted,marginTop:10,fontStyle:'italic',lineHeight:1.5}}>
              Note: Ad performance may vary depending on location, audience, campaign quality, duration, and platform availability.
            </div>
          </div>

          {/* Compliance disclaimer */}
          <div style={{padding:'10px 12px',background:'rgba(208,2,27,0.06)',border:'1px solid rgba(208,2,27,0.15)',borderRadius:10,marginBottom:18}}>
            <div style={{fontSize:10,color:T.textMuted,lineHeight:1.6}}>
              <strong style={{color:T.red}}>Disclaimer:</strong> Advertisement availability, pricing, approval, placement, and duration are subject to LocalAI review, inventory availability, and applicable advertising policy. All advertisements are subject to verification and applicable law.
            </div>
          </div>

          {/* Form */}
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.gold,marginBottom:10,letterSpacing:1}}>📝 GET A QUOTE</div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.5}}>Your Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,fontFamily:'inherit',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}} />
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.5}}>Business / Company Name</div>
            <input value={business} onChange={e=>setBiz(e.target.value)} placeholder="e.g., Kurnool Sweets" style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,fontFamily:'inherit',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}} />
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.5}}>Phone Number</div>
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="10-digit mobile" type="tel" style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,fontFamily:'inherit',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}} />
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.5}}>Email</div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" style={{width:'100%',background:T.bg3,border:`1px solid ${email && !emailValid ? T.red : T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,fontFamily:'inherit',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}} />
            {email && !emailValid && (
              <div style={{fontSize:10,color:T.red,marginTop:4}}>Please enter a valid email address</div>
            )}
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.5}}>Monthly Budget Range</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {['< ₹10K','₹10K – ₹50K','₹50K – ₹2L','₹2L+'].map((b,bi) => (
                <button key={b} onClick={()=>setBudget(b)} style={{
                  background: budget===b ? T.red : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${budget===b ? T.red : 'rgba(255,255,255,0.08)'}`,
                  borderRadius:10,padding:'9px',color: budget===b ? 'white' : T.gray1,
                  fontSize:11,fontWeight:600,cursor:'pointer'
                }}>{b}</button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:6,fontWeight:600,letterSpacing:0.5}}>Message (optional)</div>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tell us about your business and goals..." rows={4} style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 12px',color:T.text,fontSize:13,resize:'vertical',fontFamily:'inherit',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}} />
          </div>

          <button onClick={submit} disabled={!canSubmit} style={{
            width:'100%',
            background: canSubmit ? `linear-gradient(135deg,${T.red},#7A0010)` : T.gray3,
            color:T.text,border:'none',borderRadius:14,padding:'14px',
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,letterSpacing:1.5,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? `0 8px 24px ${T.red}55` : 'none',
          }}>📩 SEND INQUIRY</button>

          <div style={{textAlign:'center',padding:'14px 0 4px',fontSize:10,color:T.textMuted,lineHeight:1.5}}>
            Or contact directly:<br/>
            📧 <a href="mailto:ads@localaitv.com" style={{color:T.textMuted}}>ads@localaitv.com</a> · 📞 <a href="tel:+917569684979" style={{color:T.textMuted}}>+91 7569684979</a>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ── COMPLIANCE FORMS (per IT Rules 2021 / Apple+Google policies) ──
// ════════════════════════════════════════════════════════════


export { AdvertiseScreen };
export default AdvertiseScreen;
