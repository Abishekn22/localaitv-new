import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import BottomNav from './../../components/BottomNav.jsx';

function LegalDocScreen({ onBack, icon, title, subtitle, sections, onNavigate, topActions }) {
  const { T } = useAppTheme();
  function handleAction(action) {
    if (typeof action === 'string' && onNavigate) onNavigate(action);
    else if (typeof action === 'function') action();
  }
  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <div style={{
        background: T.isDark ? T.isDark?`linear-gradient(135deg,#0A1538,${T.bg2})`:T.bg2 : T.bg2,
        padding:'48px 18px 20px',flexShrink:0,position:'relative',
        borderBottom:`1px solid ${T.border}`,
      }}>
        <button onClick={onBack} style={{position:'absolute',top:52,left:14,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:6}}>{icon}</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,letterSpacing:0.8}}>{title}</div>
          {subtitle && <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:14,lineHeight:1.65,fontWeight:700,color:T.gold,marginTop:4}}>{subtitle}</div>}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'20px 18px 140px'}}>
        {/* Top action buttons (e.g., Submit Takedown Request, Submit Grievance) */}
        {topActions && topActions.length > 0 && (
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:18}}>
            {topActions.map((a,i) => (
              <button key={i} onClick={()=>handleAction(a.action)} style={{
                width:'100%',background:a.primary?`linear-gradient(135deg,${T.red},#7A0010)`:T.bg3,
                color:a.primary?'white':T.text,border:a.primary?'none':`1px solid ${T.border}`,borderRadius:12,padding:'13px',
                fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,letterSpacing:1,cursor:'pointer',
                boxShadow:a.primary?`0 6px 18px ${T.red}44`:'none',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
              }}>
                {a.icon && <span style={{fontSize:16}}>{a.icon}</span>}
                {a.label}
              </button>
            ))}
          </div>
        )}

        {sections.map((sec, i) => (
          <div key={i} style={{marginBottom:18}}>
            {sec.heading && <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,color:T.red,letterSpacing:0.8,marginBottom:10,paddingBottom:5,borderBottom:`1px solid rgba(208,2,27,0.2)`}}>{sec.heading}</div>}
            {sec.body && <div style={{fontSize:13,color:T.textMuted,lineHeight:1.7,marginBottom:8,whiteSpace:'pre-line'}}>{sec.body}</div>}
            {sec.bullets && (
              <ul style={{margin:'4px 0 8px 18px',padding:0,color:T.textMuted,fontSize:13,lineHeight:1.7}}>
                {sec.bullets.map((b,j) => <li key={j} style={{marginBottom:4}}>{b}</li>)}
              </ul>
            )}
            {sec.button && (
              <button onClick={()=>handleAction(sec.button.action)} style={{
                marginTop:8,background:`linear-gradient(135deg,${T.red},#7A0010)`,color:'white',border:'none',borderRadius:10,
                padding:'10px 16px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,letterSpacing:0.8,cursor:'pointer',
              }}>{sec.button.icon} {sec.button.label}</button>
            )}
          </div>
        ))}

        {/* Common footer block on every legal page */}
        <div style={{marginTop:24,padding:'14px',background:T.bg3,borderRadius:10,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
          <div style={{fontSize:11,fontWeight:700,color:T.gold,marginBottom:6,letterSpacing:0.5}}>📍 LOCALAI MEDIA NETWORK PVT LTD</div>
          <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6,marginBottom:8}}>
            CIN: U63910KA2025PTC212593<br/>
            Hyderabad, Telangana, India<br/>
            <a href="mailto:support@localaitv.com" style={{color:T.textMuted,textDecoration:'none'}}>📧 support@localaitv.com</a><br/>
            <a href="tel:+917569684979" style={{color:T.textMuted,textDecoration:'none'}}>📞 +91 7569684979</a>
          </div>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:8}}>
            <div style={{fontSize:10,fontWeight:700,color:T.red,marginBottom:3,letterSpacing:0.3}}>GRIEVANCE OFFICER (IT Rules 2021)</div>
            <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>
              Bommena Prashanth · Grievance Officer<br/>
              Jurisdiction: Hyderabad, Telangana, India
            </div>
          </div>
        </div>
        <div style={{textAlign:'center',padding:'12px 0 4px',fontSize:9,color:T.textMuted,fontStyle:'italic'}}>
          Last updated: {new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}
        </div>
      </div>
      {onNavigate && <BottomNav active="profile" onChange={onNavigate} />}
    </div>
  );
}


export { LegalDocScreen };
export default LegalDocScreen;
