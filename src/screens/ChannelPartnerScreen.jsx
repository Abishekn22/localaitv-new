import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function ChannelPartnerScreen({ onBack }) {
  const { T } = useAppTheme();
  const [name,         setName]         = useState('');
  const [phone,        setPhone]        = useState('');
  const [email,        setEmail]        = useState('');
  const [constituency, setConstituency] = useState('');
  const [state,        setState]        = useState('');
  const [occupation,   setOccupation]   = useState('');
  const [experience,   setExperience]   = useState('');
  const [whyPartner,   setWhyPartner]   = useState('');
  const [errors,       setErrors]       = useState({});
  const [submitted,    setSubmitted]    = useState(false);
  const [constituencySearch, setConstituencySearch] = useState(''); // filter for the constituency list

  function validate() {
    const e = {};
    if (!name.trim())         e.name         = 'Full name is required';
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\D/g,'')))
                              e.phone        = 'Valid 10-digit mobile number required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
                              e.email        = 'Valid email address required';
    if (!state)               e.state        = 'Please select state';
    if (!constituency.trim()) e.constituency = 'Constituency is required';
    if (!occupation.trim())   e.occupation   = 'Occupation is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    // Build email body
    const body = encodeURIComponent(
`New Channel Partner Application — LocalAI TV

Full Name:        ${name}
Mobile:           +91 ${phone}
Email:            ${email}
State:            ${state}
Constituency:     ${constituency}
Occupation:       ${occupation}
Experience:       ${experience || 'Not mentioned'}
Why Partner:      ${whyPartner || 'Not mentioned'}

Submitted on: ${new Date().toLocaleString('en-IN')}
`);
    const subject = encodeURIComponent(`Channel Partner Application — ${name} — ${constituency}`);
    const applicationId = genComplianceId('CP');

    // Best-effort backend submit
    try {
      apiCall('/partner-applications', { method:'POST', body: JSON.stringify({
        application_id: applicationId,
        full_name: name, mobile: phone, email, state, town_constituency: constituency,
        current_work_business: occupation, experience_type: experience,
        reason_to_join: whyPartner, agreed_to_rules: true, consent_to_contact: true,
        status: 'New', created_at: new Date().toISOString(),
      }) }).catch(()=>{});
    } catch (e) { /* ignore */ }

    window.open(`mailto:support@localaitv.com?subject=${subject}&body=${body}`);
    setSubmitted(true);
  }

  if (submitted) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#f7f8fa'}}>
      <div style={{background:'linear-gradient(135deg,#b45309,#d97706)',padding:'48px 18px 24px',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:8}}>🎉</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,color:T.text}}>Application Sent!</div>
        <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Thank you for applying</div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px 20px',textAlign:'center'}}>
        <div style={{background:'white',borderRadius:16,padding:'24px',marginBottom:20,boxShadow:'0 4px 16px rgba(0,0,0,0.08)',width:'100%'}}>
          <div style={{fontSize:32,marginBottom:12}}>📧</div>
          <div style={{fontWeight:800,fontSize:18,color:'#111',marginBottom:8}}>Email Draft Opened</div>
          <div style={{fontSize:13,color:'#555',lineHeight:1.6,marginBottom:16}}>Your application has been prepared. Please send the email from your mail app to complete registration.</div>
          <div style={{background:'#fefce8',border:'1px solid #fde68a',borderRadius:10,padding:'10px 14px',fontSize:12,color:'#92400e',textAlign:'left'}}>
            📬 Send to: <strong>support@localaitv.com</strong><br/>
            Our team will review your details and contact you if your application is shortlisted. Approval is subject to verification, business suitability, local availability, and separate written agreement.
          </div>
        </div>
        <button onClick={onBack} style={{background:'linear-gradient(135deg,#b45309,#d97706)',color:T.text,border:'none',borderRadius:12,padding:'14px 32px',fontWeight:800,fontSize:15,cursor:'pointer',letterSpacing:0.5}}>
          Back to App
        </button>
      </div>
    </div>
  );

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:'#f7f8fa'}}>

      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#b45309,#d97706)',padding:'48px 18px 24px',flexShrink:0,position:'relative'}}>
        <button onClick={onBack} style={{position:'absolute',top:52,left:14,background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:6}}>📺</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text,letterSpacing:0.8}}>Channel Partner Program</div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:6,lineHeight:1.5,maxWidth:300,marginLeft:'auto',marginRight:'auto'}}>Be part of an AI-powered hyperlocal news network. Subject to verification, business suitability, and separate written agreement.</div>
        </div>
      </div>

      {/* Benefits strip — safer wording (opportunity, not guarantee) */}
      <div style={{background:'#fff7ed',borderBottom:'1px solid #fed7aa',padding:'12px 16px',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-around',textAlign:'center'}}>
          {[['📡','Local Channel'],['💼','Local Network'],['👥','Citizen Reporters'],['🤝','Partnership']].map(([e,l])=>(
            <div key={l}>
              <div style={{fontSize:20,marginBottom:2}}>{e}</div>
              <div style={{fontSize:9,fontWeight:700,color:'#92400e'}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>

        {/* Personal Details */}
        <div style={{background:'white',borderRadius:14,padding:'16px',marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{fontWeight:800,fontSize:15,color:'#111',marginBottom:14,paddingBottom:10,borderBottom:'1px solid #f0f0f0'}}>👤 Personal Details</div>
          <div style={{marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Full Name <span style={{color:'#e53e3e'}}>*</span></div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Ravi Kumar Reddy"
              style={{width:'100%',border:`1.5px solid ${errors.name?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 14px',fontSize:14,color:'#111',boxSizing:'border-box'}}/>
            {errors.name && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.name}</div>}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Mobile <span style={{color:'#e53e3e'}}>*</span></div>
              <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="98765 43210" type="tel"
                style={{width:'100%',border:`1.5px solid ${errors.phone?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 12px',fontSize:13,color:'#111',boxSizing:'border-box'}}/>
              {errors.phone && <div style={{color:'#e53e3e',fontSize:10,marginTop:2}}>{errors.phone}</div>}
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Email <span style={{color:'#e53e3e'}}>*</span></div>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@gmail.com" type="email"
                style={{width:'100%',border:`1.5px solid ${errors.email?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 12px',fontSize:13,color:'#111',boxSizing:'border-box'}}/>
              {errors.email && <div style={{color:'#e53e3e',fontSize:10,marginTop:2}}>{errors.email}</div>}
            </div>
          </div>
          <div style={{marginBottom:4}}>
            <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Occupation <span style={{color:'#e53e3e'}}>*</span></div>
            <input value={occupation} onChange={e=>setOccupation(e.target.value)} placeholder="e.g. Journalist, Business Owner, Teacher"
              style={{width:'100%',border:`1.5px solid ${errors.occupation?'#e53e3e':'#ddd'}`,borderRadius:10,padding:'12px 14px',fontSize:14,color:'#111',boxSizing:'border-box'}}/>
            {errors.occupation && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.occupation}</div>}
          </div>
        </div>

        {/* Channel Details — state selector + scrollable constituency card list
            (same pattern as the home page constituency picker, but shows ALL
             constituencies in the selected state, not just live ones). */}
        <div style={{background:'white',borderRadius:14,padding:'16px',marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{fontWeight:800,fontSize:15,color:'#111',marginBottom:14,paddingBottom:10,borderBottom:'1px solid #f0f0f0'}}>📍 Channel Location</div>

          {/* STEP 1: STATE — button pair */}
          <div style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>State <span style={{color:'#e53e3e'}}>*</span></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[{label:'Andhra Pradesh',count:AP_CONSTITUENCIES.length,emoji:'🟡'},
                {label:'Telangana',     count:TG_CONSTITUENCIES.length,emoji:'🔵'}].map(s=>(
                <button key={s.label} onClick={()=>{ setState(s.label); setConstituency(''); }}
                  style={{
                    background:state===s.label?'#b45309':'#f8fafc',
                    border:`1.5px solid ${state===s.label?'#b45309':'#e2e8f0'}`,
                    borderRadius:10, padding:'12px 8px',
                    fontSize:13, fontWeight:700,
                    color:state===s.label?'white':'#374151',
                    cursor:'pointer',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                  }}>
                  <span>{s.emoji} {s.label}</span>
                  <span style={{fontSize:10,fontWeight:600,opacity:0.85}}>
                    {s.count} constituencies
                  </span>
                </button>
              ))}
            </div>
            {errors.state && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.state}</div>}
          </div>

          {/* STEP 2: CONSTITUENCY — scrollable card list, filtered by state */}
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <div style={{fontWeight:700,fontSize:13,color:'#222'}}>
                Constituency / Town <span style={{color:'#e53e3e'}}>*</span>
              </div>
              {state && (
                <span style={{fontSize:10,color:'#6B7280',fontWeight:600}}>
                  {state==='Andhra Pradesh' ? AP_CONSTITUENCIES.length : TG_CONSTITUENCIES.length} options
                </span>
              )}
            </div>

            {!state && (
              <div style={{
                background:'#F9FAFB', border:'1.5px dashed #E5E7EB',
                borderRadius:10, padding:'24px 14px', textAlign:'center',
                color:'#9CA3AF', fontSize:12, fontStyle:'italic',
              }}>
                Pick a state above to see all its constituencies.
              </div>
            )}

            {state && (
              <div style={{
                border:`1.5px solid ${errors.constituency?'#e53e3e':'#E5E7EB'}`,
                borderRadius:10, overflow:'hidden',
                background:'#FFFFFF',
              }}>
                {/* Search box for filtering long list */}
                <div style={{padding:'8px 10px', borderBottom:'1px solid #F3F4F6', background:'#FAFBFC'}}>
                  <input
                    placeholder="🔍 Search constituency…"
                    value={constituencySearch || ''}
                    onChange={e=>setConstituencySearch(e.target.value)}
                    style={{
                      width:'100%', border:'1px solid #E5E7EB', borderRadius:8,
                      padding:'8px 10px', fontSize:12, outline:'none',
                      boxSizing:'border-box', background:'#FFFFFF',
                    }}/>
                </div>
                {/* Scrollable card list */}
                <div style={{maxHeight:280, overflowY:'auto', WebkitOverflowScrolling:'touch'}}>
                  {(state==='Andhra Pradesh' ? AP_CONSTITUENCIES : TG_CONSTITUENCIES)
                    .filter(c => {
                      if (!constituencySearch) return true;
                      const q = constituencySearch.toLowerCase();
                      return (c.en||'').toLowerCase().includes(q) || (c.te||'').includes(constituencySearch);
                    })
                    .map((c,i,arr) => {
                      const value = c.en;
                      const isActive = constituency === value;
                      return (
                        <div key={value}
                          onClick={()=>setConstituency(value)}
                          style={{
                            display:'flex', alignItems:'center', gap:10,
                            padding:'10px 14px',
                            borderBottom: i < arr.length-1 ? '1px solid #F3F4F6' : 'none',
                            cursor:'pointer',
                            background: isActive ? 'rgba(180,83,9,0.08)' : 'transparent',
                          }}>
                          {/* dot */}
                          <div style={{
                            width:10, height:10, borderRadius:'50%', flexShrink:0,
                            background: isActive ? '#b45309' : '#E5E7EB',
                          }}/>
                          {/* names */}
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{
                              fontFamily:"'Noto Sans Telugu',sans-serif",
                              fontWeight:700, fontSize:14,
                              color: isActive ? '#92400e' : '#111',
                              lineHeight:1.3,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                            }}>{c.te}</div>
                            <div style={{
                              fontFamily:"'Barlow',sans-serif",
                              fontSize:11, color:'#6B7280', lineHeight:1.3,
                              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                            }}>{c.en}</div>
                          </div>
                          {/* live badge */}
                          {c.live && (
                            <span style={{
                              background:'#DCFCE7', color:'#16A34A',
                              fontFamily:"'Barlow Condensed',sans-serif",
                              fontSize:9, fontWeight:800, letterSpacing:0.5,
                              padding:'2px 6px', borderRadius:4, flexShrink:0,
                            }}>LIVE</span>
                          )}
                          {/* check */}
                          {isActive && (
                            <div style={{
                              width:18, height:18, borderRadius:'50%',
                              background:'#b45309', color:'white',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:11, fontWeight:800, flexShrink:0,
                            }}>✓</div>
                          )}
                        </div>
                      );
                    })}
                  {/* empty state when search filters everything out */}
                  {state && constituencySearch && (state==='Andhra Pradesh' ? AP_CONSTITUENCIES : TG_CONSTITUENCIES)
                    .filter(c => (c.en||'').toLowerCase().includes(constituencySearch.toLowerCase()) || (c.te||'').includes(constituencySearch))
                    .length === 0 && (
                    <div style={{padding:'18px 14px',textAlign:'center',fontSize:12,color:'#9CA3AF'}}>
                      No matches for "<strong>{constituencySearch}</strong>". Try a different search.
                    </div>
                  )}
                </div>
              </div>
            )}
            {errors.constituency && <div style={{color:'#e53e3e',fontSize:11,marginTop:3}}>{errors.constituency}</div>}
            {state && constituency && (
              <div style={{marginTop:6,fontSize:11,color:'#16A34A',fontWeight:600}}>
                ✓ Selected: {constituency}
              </div>
            )}
          </div>
        </div>

        {/* Experience */}
        <div style={{background:'white',borderRadius:14,padding:'16px',marginBottom:14,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{fontWeight:800,fontSize:15,color:'#111',marginBottom:14,paddingBottom:10,borderBottom:'1px solid #f0f0f0'}}>🎯 Your Background</div>
          <div style={{marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Media / Business Experience (Optional)</div>
            <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="e.g. 5 years in cable TV, local newspaper, community management…"
              style={{width:'100%',border:'1.5px solid #ddd',borderRadius:10,padding:'12px 14px',fontSize:13,color:'#111',height:72,resize:'none',boxSizing:'border-box'}}/>
          </div>
          <div style={{marginBottom:4}}>
            <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Why do you want to be a Channel Partner? (Optional)</div>
            <textarea value={whyPartner} onChange={e=>setWhyPartner(e.target.value)} placeholder="Tell us your vision for your town's channel…"
              style={{width:'100%',border:'1.5px solid #ddd',borderRadius:10,padding:'12px 14px',fontSize:13,color:'#111',height:80,resize:'none',boxSizing:'border-box'}}/>
          </div>
        </div>

        {/* What you may get — safer wording per spec (opportunity, not guarantee) */}
        <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:14,padding:'16px',marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:14,color:'#92400e',marginBottom:10}}>🤝 Your Role as a Channel Partner</div>
          {[
            ['📡','Help build local channel presence in your area'],
            ['🤖','Use AI-assisted tools for content workflow'],
            ['👥','Coordinate with citizen reporters & local contributors'],
            ['📱','Distribution across Android, iPhone, Smart TV & YouTube'],
            ['🎓','Onboarding and training, subject to approval'],
            ['💼','Potential earning opportunities through approved local advertisements and partnerships, subject to separate agreement'],
          ].map(([e,t])=>(
            <div key={t} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:8}}>
              <span style={{fontSize:16,flexShrink:0}}>{e}</span>
              <span style={{fontSize:13,color:'#78350f',lineHeight:1.4}}>{t}</span>
            </div>
          ))}
        </div>

        {/* Compliance disclaimer */}
        <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:12,padding:'12px 14px',marginBottom:16}}>
          <div style={{fontSize:11,color:'#7f1d1d',lineHeight:1.6}}>
            <strong>Disclaimer:</strong> Submitting this form does not guarantee approval, partnership, ad placement, revenue sharing, payment, employment, franchise rights, or campaign performance. All applications are subject to review, verification, approval, availability, applicable laws, and separate written agreement where required.
          </div>
        </div>

        {/* Rule agreement & contact consent (required per spec) */}
        <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:'14px',marginBottom:16}}>
          <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',marginBottom:10}}>
            <input type="checkbox" defaultChecked style={{marginTop:2,minWidth:16,width:16,height:16,accentColor:'#b45309'}}/>
            <span style={{fontSize:11,color:'#374151',lineHeight:1.5}}>
              I confirm that the information provided is true and I agree to follow LocalAI rules, moderation policy, grievance policy, and applicable laws.
            </span>
          </label>
          <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
            <input type="checkbox" defaultChecked style={{marginTop:2,minWidth:16,width:16,height:16,accentColor:'#b45309'}}/>
            <span style={{fontSize:11,color:'#374151',lineHeight:1.5}}>
              I agree that LocalAI may contact me by phone, email, SMS, or WhatsApp regarding this application.
            </span>
          </label>
        </div>

        <button onClick={handleSubmit}
          style={{width:'100%',background:'linear-gradient(135deg,#b45309,#d97706)',color:T.text,border:'none',borderRadius:12,padding:'16px',fontWeight:800,fontSize:16,cursor:'pointer',letterSpacing:0.5,marginBottom:8}}>
          📧 Submit Application
        </button>
        <div style={{fontSize:11,color:'#888',textAlign:'center',marginBottom:24}}>
          This will open your email app to send the application to support@localaitv.com
        </div>
      </div>


    </div>
  );
}


export { ChannelPartnerScreen };
export default ChannelPartnerScreen;
