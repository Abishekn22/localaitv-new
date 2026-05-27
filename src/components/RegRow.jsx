import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function RegRow({ c, constituency, setConst, setSearch, isLive }) {
  const isSelected = constituency === c.en;
  return (
    <div onClick={()=>{setConst(c.en);setSearch('');}} style={{padding:'10px 12px',borderBottom:`1px solid ${T.border}`,cursor:'pointer',background:isSelected?`rgba(208,2,27,0.12)`:'transparent',display:'flex',alignItems:'center',gap:8}}>
      <div style={{flex:1,minWidth:0,display:'flex',alignItems:'baseline',gap:5,flexWrap:'wrap',lineHeight:1.25}}>
        <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:14,lineHeight:1.65,color:isSelected?T.red:T.text,fontWeight:700}}>{c.te}</span>
        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:12,
          color:isSelected?T.red:'rgba(255,184,0,0.75)',letterSpacing:0.5}}>TV</span>
        <span style={{fontSize:11,color:isSelected?'rgba(208,2,27,0.7)':T.textMuted}}>/</span>
        <span style={{fontSize:11,fontWeight:500,color:isSelected?'rgba(208,2,27,0.95)':T.text}}>{c.en}</span>
      </div>
      {!isSelected && (
        isLive ? (
          <div style={{display:'flex',alignItems:'center',gap:3,background:'rgba(0,200,90,0.12)',borderRadius:5,padding:'2px 6px',flexShrink:0,border:'1px solid rgba(0,200,90,0.2)'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite'}}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:9,color:'#00C85A',letterSpacing:0.5}}>LIVE</span>
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'center',gap:3,background:'rgba(255,184,0,0.08)',borderRadius:5,padding:'2px 6px',flexShrink:0,border:'1px solid rgba(255,184,0,0.2)'}}>
            <span style={{fontSize:8}}>🚀</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:9,color:T.gold,letterSpacing:0.3}}>LAUNCHING SOON</span>
          </div>
        )
      )}
      {isSelected && <span style={{color:T.red,fontSize:14,flexShrink:0}}>✓</span>}
    </div>
  );
}


export { RegRow };
export default RegRow;
