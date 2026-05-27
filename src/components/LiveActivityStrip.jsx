import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function LiveActivityStrip({ constituency }) {
  const { T } = useAppTheme();
  const [tick, setTick] = useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(v=>v+1),4000);return()=>clearInterval(t);},[]);
  const activities = [
    {ch:'Anantapur TV',  action:'🎙️ Morning bulletin recording',       color:T.red   },
    {ch:'Karimnagar TV', action:'📤 3 uploads pending review',          color:T.gold  },
    {ch:'Kakinada TV',   action:'🎂 Birthday wish airing — Raju garu', color:T.teal  },
    {ch:'Warangal TV',   action:'📡 Going live at 6:00 PM',            color:'#F57F17'},
    {ch:'Nalgonda TV',   action:'🌾 Farmer interview in progress',      color:T.green },
    {ch:'Khammam TV',    action:'💒 Marriage announcement — 280 watching',color:T.red  },
    {ch:'Nellore TV',    action:'🏛️ Official update broadcast',         color:'#1565C0'},
    {ch:'Tirupati TV',   action:'🙏 Devotional program live',           color:'#7B1FA2'},
  ];
  const active = activities[tick % activities.length];
  return (
    <div style={{background:T.isDark?`rgba(0,0,0,0.4)`:T.bg3,
      borderTop:`1px solid ${T.border}`,padding:'7px 14px',
      display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
      <div style={{width:6,height:6,borderRadius:'50%',background:active.color,animation:'blink 0.8s infinite',flexShrink:0}}/>
      <div style={{flex:1,overflow:'hidden'}}>
        <div key={tick} style={{animation:'fadeIn 0.4s ease'}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:10,color:active.color}}>{active.ch}</span>
          <span style={{fontSize:10,color:T.textMuted}}> — {active.action}</span>
        </div>
      </div>
      <span style={{fontSize:9,color:T.textMuted,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>LIVE NETWORK</span>
    </div>
  );
}


export { LiveActivityStrip };
export default LiveActivityStrip;
