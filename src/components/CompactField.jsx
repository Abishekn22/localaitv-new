import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function CompactField({ icon, label, val, T }) {
  if (!val) return null;
  return (
    <div style={{
      padding:'7px 9px',
      background:T.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',
      border:`1px solid ${T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'}`,
      borderRadius:8,
      display:'flex', flexDirection:'column', gap:2, minWidth:0,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:4,
        fontSize:9, fontWeight:700, letterSpacing:0.4,
        fontFamily:"'Barlow Condensed',sans-serif",
        color:T.isDark?'rgba(255,255,255,0.5)':T.textMuted,
        textTransform:'uppercase' }}>
        <span style={{fontSize:11}}>{icon}</span>{label}
      </div>
      <div style={{
        fontFamily:"'Noto Sans Telugu',sans-serif",
        fontSize:12, fontWeight:700, lineHeight:1.3,
        color:T.isDark?'#fff':'#0a0a14',
        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
      }}>{val}</div>
    </div>
  );
}

export { CompactField };
export default CompactField;
