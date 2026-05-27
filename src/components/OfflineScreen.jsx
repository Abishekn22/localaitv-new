import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function OfflineScreen({ onRetry }) {
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,gap:16,textAlign:'center'}}>
      <div style={{fontSize:64}}>📡</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:T.text}}>No Connection</div>
      <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:15,lineHeight:1.65,fontWeight:700,color:T.gold}}>ఇంటర్నెట్ కనెక్షన్ లేదు</div>

      <div style={{fontSize:13,color:T.textMuted,lineHeight:1.7,maxWidth:280}}>
        Please check your internet connection and try again. LocalAI TV needs internet to show you the latest local news.
      </div>
      <div style={{background:T.bg3,borderRadius:12,padding:'14px 18px',border:`1px solid ${T.border}`,width:'100%',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:8}}>You can still access:</div>
        {['📋 Saved news articles','🎥 Downloaded videos','👤 Your profile'].map((i,idx) => (
          <div key={idx} style={{fontSize:12,color:T.text,padding:'4px 0'}}>{i}</div>
        ))}
      </div>
      <button onClick={onRetry} style={{
        width:'100%', background:`linear-gradient(135deg,${T.red},#7A0010)`,
        color:T.text, borderRadius:13, padding:'15px',
        fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700,
        fontSize:16, letterSpacing:2, cursor:'pointer',
        boxShadow:`0 6px 20px ${T.red}44`,
      }}>🔄 Try Again</button>
    </div>
  );
}

// ── Compliance 6 & 7: Settings Screen ────────────────────────
// Apple guideline 5.1 — privacy policy, delete account, contact

export { OfflineScreen };
export default OfflineScreen;
