import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function ChannelChip({ c, onClick }) {
  const colors = [T.red, T.gold, T.teal, '#7c3aed'];
  const bg = colors[c.id.charCodeAt(0) % colors.length];
  const waMsg = encodeURIComponent(`📺 Watch ${c.name} TV live on LocalAI TV!\n\n🔗 Download the app: https://localaitv.com/app`);
  return (
    <div style={{
      display:'flex',alignItems:'center',gap:8,
      background:T.bg3,
      borderRadius:10,padding:'8px 12px',
      border:`1px solid ${c.live ? T.red+'55' : T.border}`,
      cursor: c.live ? 'pointer' : 'default',
      transition:'all 0.2s',
      opacity: c.live ? 1 : 0.7,
    }}>
      {/* Channel icon */}
      <div onClick={onClick} style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${bg},${bg}88)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,flexShrink:0,fontFamily:"'Barlow Condensed',sans-serif",cursor:c.live?'pointer':'default'}}>{c.name.slice(0,1)}</div>
      {/* Name + dist */}
      <div onClick={onClick} style={{flex:1,minWidth:0,cursor:c.live?'pointer':'default'}}>
        <div style={{fontSize:13,fontWeight:700,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.name} TV</div>
  
      </div>
      {/* Live: LIVE badge + WhatsApp share button */}
      {c.live ? (
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <span style={{background:T.red,color:'white',fontSize:8,fontWeight:800,letterSpacing:1,padding:'2px 6px',borderRadius:4}}>LIVE</span>
          <button
            onClick={e=>{e.stopPropagation();window.open(`https://api.whatsapp.com/send?text=${waMsg}`,'_blank');}}
            style={{width:28,height:28,borderRadius:8,background:'#25d366',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13,flexShrink:0}}
            title="Share on WhatsApp">
            💬
          </button>
        </div>
      ) : (
        <span style={{background:'rgba(255,184,0,0.1)',color:T.gold,fontSize:7,fontWeight:700,letterSpacing:0.5,padding:'2px 6px',borderRadius:4,flexShrink:0,whiteSpace:'nowrap',border:`1px solid rgba(255,184,0,0.2)`}}>🚀 LAUNCHING SOON</span>
      )}
    </div>
  );
}


export { ChannelChip };
export default ChannelChip;
