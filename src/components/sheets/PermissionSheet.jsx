import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import BottomSheet from './../BottomSheet.jsx';

function PermissionSheet({ show, onClose, type, onAllow }) {
  const configs = {
    camera: {
      icon:'📷', title:'Camera Access',
      why:'LocalAI TV needs camera access so you can record and upload news videos from your area.',
      uses:['Record news videos', 'Take photos for news stories', 'Capture civic issues in your area'],
      note:'Your videos are only uploaded when you tap Submit. We never record without your knowledge.',
    },
    location: {
      icon:'📍', title:'Location Access',
      why:'LocalAI TV uses your location to show news from your constituency and nearby areas.',
      uses:['Show news from your district', 'Auto-fill your district on uploads', 'Find channels near you'],
      note:'Your exact location is never shared publicly. Only your district name is used.',
    },
    microphone: {
      icon:'🎙️', title:'Microphone Access',
      why:'LocalAI TV needs microphone access to record audio when you shoot news videos.',
      uses:['Record audio with news videos', 'Voice note uploads for reporters'],
      note:'Microphone is only active when you are recording a video.',
    },
  };
  const c = configs[type] || configs.camera;

  return (
    <BottomSheet show={show} onClose={onClose} title="">
      <div style={{textAlign:'center',marginBottom:20}}>
        <div style={{fontSize:52,marginBottom:12}}>{c.icon}</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,marginBottom:6}}>{c.title}</div>
        <div style={{fontSize:13,color:T.textMuted,lineHeight:1.6}}>{c.why}</div>
      </div>
      <div style={{background:T.bg3,borderRadius:12,padding:'14px',marginBottom:16,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Used for:</div>
        {c.uses.map((u,i) => (
          <div key={i} style={{display:'flex',gap:8,alignItems:'center',padding:'5px 0',fontSize:12,color:T.text}}>
            <span style={{color:T.green}}>✓</span>{u}
          </div>
        ))}
      </div>
      <div style={{background:'rgba(255,184,0,0.07)',border:`1px solid rgba(255,184,0,0.2)`,borderRadius:10,padding:'10px 12px',marginBottom:18}}>
        <div style={{fontSize:11,color:T.gold,lineHeight:1.5}}>🔒 {c.note}</div>
      </div>
      <button onClick={onAllow} style={{
        width:'100%', background:`linear-gradient(135deg,${T.red},#7A0010)`,
        color:T.text, borderRadius:13, padding:'15px',
        fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700,
        fontSize:16, letterSpacing:1.5, cursor:'pointer',
        boxShadow:`0 6px 20px ${T.red}44`, marginBottom:10,
      }}>Allow Access</button>
      <button onClick={onClose} style={{
        width:'100%', background:T.bg3,
        color:T.textMuted, borderRadius:13, padding:'13px',
        fontSize:13, cursor:'pointer',
      }}>Not Now</button>
    </BottomSheet>
  );
}

// ── Compliance 5: Offline Screen ──────────────────────────────

export { PermissionSheet };
export default PermissionSheet;
