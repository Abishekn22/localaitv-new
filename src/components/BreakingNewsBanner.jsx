import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function BreakingNewsBanner({ onNavigate }) {
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const alerts = [
    { text:"🚨 BREAKING: కర్నూలు జిల్లాలో వరద హెచ్చరిక జారీ", en:"Flood warning issued in Kurnool district" },
    { text:"⚡ BREAKING: AP బడ్జెట్ 2026 విడుదల — ₹3.2 లక్షల కోట్లు", en:"AP Budget 2026 released — ₹3.2 lakh crore" },
    { text:"🚨 BREAKING: తిరుమల ఆలయ ప్రత్యేక సేవలు నేటి నుండి ప్రారంభం", en:"Tirumala special services begin today" },
  ];
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i+1) % alerts.length), 5000);
    return () => clearInterval(t);
  }, []);
  if (!visible) return null;
  return (
    <div style={{background:'linear-gradient(90deg,#7A0010,#D0021B,#7A0010)',padding:'7px 14px',display:'flex',alignItems:'center',gap:10,flexShrink:0,position:'relative',animation:'pulse 2s infinite'}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'white',animation:'blink 1s infinite',flexShrink:0}}/>
      <div style={{flex:1,overflow:'hidden'}}>
        <div style={{fontSize:11,fontWeight:800,color:T.text,letterSpacing:0.3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{alerts[idx].text}</div>
      </div>
      <button onClick={()=>setVisible(false)} style={{background:T.bg3,border:'none',borderRadius:4,width:18,height:18,color:T.text,fontSize:10,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}


export { BreakingNewsBanner };
export default BreakingNewsBanner;
