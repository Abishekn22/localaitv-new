import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import { LocationPin } from './atoms.jsx';

function ConstituencyRow({ c, sel, setSel, state, index, isLive }) {
  const isSel = sel && sel.en === c.en;
  return (
    <div onClick={()=>setSel(c)}
      style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',
        borderBottom:`1px solid ${T.border}`,cursor:'pointer',transition:'background 0.15s',
        background:isSel?`rgba(208,2,27,0.1)`:'transparent'}}>
      {/* Location pin */}
      <div style={{flexShrink:0,opacity:isLive?1:0.45,
        filter:isSel?'drop-shadow(0 2px 4px rgba(208,2,27,0.5))':'none'}}>
        <LocationPin size={26}/>
      </div>
      {/* Name */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'baseline',gap:6,flexWrap:'wrap',lineHeight:1.25}}>
          <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:16,lineHeight:1.65,
            fontWeight:700,color:isSel?'white':T.text}}>{c.te}</span>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:13,
            color:isSel?'rgba(255,184,0,0.9)':'rgba(255,184,0,0.75)',letterSpacing:0.5}}>TV</span>
          <span style={{fontSize:12,color:isSel?'rgba(255,255,255,0.55)':T.textMuted}}>/</span>
          <span style={{fontSize:13,fontWeight:500,color:isSel?'rgba(255,255,255,0.9)':T.text}}>{c.en}</span>
        </div>
        <div style={{fontSize:10,color:isSel?'rgba(255,255,255,0.55)':T.textMuted,marginTop:2}}>
          {state==='AP'?'Andhra Pradesh':'Telangana'}
        </div>
      </div>
      {/* Status badge */}
      {!isSel&&(
        isLive?(
          <div style={{display:'flex',alignItems:'center',gap:4,background:'rgba(0,200,90,0.12)',
            borderRadius:6,padding:'3px 7px',border:`1px solid rgba(0,200,90,0.25)`,flexShrink:0}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite'}}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
              fontSize:9,color:'#00C85A',letterSpacing:0.5}}>LIVE</span>
          </div>
        ):(
          <div style={{display:'flex',alignItems:'center',gap:4,background:T.isDark?'rgba(255,184,0,0.08)':'rgba(184,134,11,0.08)',
            borderRadius:6,padding:'3px 7px',border:`1px solid ${T.isDark?'rgba(255,184,0,0.2)':'rgba(184,134,11,0.25)'}`,flexShrink:0}}>
            <span style={{fontSize:8}}>🚀</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
              fontSize:9,color:T.gold,letterSpacing:0.3}}>SOON</span>
          </div>
        )
      )}
      {isSel&&<span style={{color:T.red,fontSize:18}}>✓</span>}
    </div>
  );
}


export { ConstituencyRow };
export default ConstituencyRow;
