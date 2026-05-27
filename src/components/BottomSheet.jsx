import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function BottomSheet({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div
      onClick={onClose}
      style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.75)',zIndex:500,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{background:T.bg2, borderRadius:'20px 20px 0 0', padding:'20px 18px 36px', maxHeight:'85%', overflowY:'auto', animation:'slideUp 0.35s cubic-bezier(0.34,1.2,0.64,1)'}}
      >
        {/* Handle */}
        <div style={{width:36,height:4,background:T.bg3,borderRadius:2,margin:'0 auto 16px'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18,letterSpacing:0.5}}>{title}</span>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:'50%',background:T.bg3,color:T.textMuted,fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Compliance 1 & 2: Report + Block Sheet ────────────────────

export { BottomSheet };
export default BottomSheet;
