import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function MenuRow({ item, onClick, isLast }) {
  const ICONS = {
    home: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V9.5z"/>
      </svg>
    ),
    info: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="13"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    upload: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill={item.color} stroke="none">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
      </svg>
    ),
    dashboard: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
    user: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    mail: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/>
        <polyline points="3 7 12 13 21 7"/>
      </svg>
    ),
    doc: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
    shield: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    people: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    bolt: (
      <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  };
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'14px 18px',
      cursor:'pointer',
      borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
      transition:'background 0.15s',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.background='#FAFBFC'; }}
      onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
      <div style={{flexShrink:0, width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center'}}>
        {ICONS[item.icon] || null}
      </div>
      <div style={{flex:1, fontFamily:"'Barlow',sans-serif", fontSize:15, fontWeight:500, color:'#1F2937'}}>
        {item.label}
      </div>
    </div>
  );
}

// Tiny labeled field card used in the Classifieds detail page.

export { MenuRow };
export default MenuRow;
