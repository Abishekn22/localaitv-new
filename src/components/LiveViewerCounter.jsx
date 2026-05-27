import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function LiveViewerCounter({ totalViewers }) {
  const [count, setCount] = useState(totalViewers || 4247);
  useEffect(() => {
    const t = setInterval(() => setCount(c => c + Math.floor(Math.random()*15)-5), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(0,208,104,0.08)',border:`1px solid rgba(0,208,104,0.2)`,borderRadius:20,padding:'5px 12px'}}>
      <div style={{width:7,height:7,borderRadius:'50%',background:T.green,animation:'blink 1.2s infinite',flexShrink:0}}/>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,color:T.green,letterSpacing:0.5}}>
        {count.toLocaleString('en-IN')} watching
      </span>
    </div>
  );
}


export { LiveViewerCounter };
export default LiveViewerCounter;
