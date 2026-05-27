import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function SocialShareRow() {
  const { T } = useAppTheme();
  const DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.localaitv.app';
  const MSG = encodeURIComponent(`📺 LocalAI TV — India's first AI hyperlocal Telugu news app!\n\nGet live local news from your constituency.\n\n📥 Download now: ${DOWNLOAD_URL}`);
  const SHORT_MSG = encodeURIComponent(`📺 LocalAI TV — Local Telugu news app! Download: ${DOWNLOAD_URL}`);

  const PLATFORMS = [
    { icon:'💬', label:'WhatsApp',  color:'#25D366', action:()=>window.open(`https://api.whatsapp.com/send?text=${MSG}`,'_blank') },
    { icon:'✈️', label:'Telegram',  color:'#0088cc', action:()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(DOWNLOAD_URL)}&text=${MSG}`,'_blank') },
    { icon:'▶️', label:'YouTube',   color:'#FF0000', action:()=>window.open('https://www.youtube.com/@localaitv','_blank') },
    { icon:'𝕏',  label:'X',         color:'#000000', action:()=>window.open(`https://twitter.com/intent/tweet?text=${SHORT_MSG}`,'_blank') },
    { icon:'👥', label:'Facebook',  color:'#1877F2', action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(DOWNLOAD_URL)}`,'_blank') },
    { icon:'📸', label:'Instagram', color:'#E1306C', action:()=>{ navigator.clipboard?.writeText(DOWNLOAD_URL);  } },
    { icon:'💼', label:'LinkedIn',  color:'#0A66C2', action:()=>window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(DOWNLOAD_URL)}`,'_blank') },
    { icon:'📱', label:'SMS',       color:'#34C759', action:()=>window.open(`sms:?&body=${MSG}`) },
  ];

  return (
    <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10}}>
      <div style={{fontSize:10,color:T.textMuted,textAlign:'center',marginBottom:8,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>📤 SHARE APP WITH FRIENDS</div>
      <div style={{display:'flex',justifyContent:'space-between',gap:4}}>
        {PLATFORMS.map(p => (
          <button key={p.label} onClick={p.action} style={{
            flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,
            background:'none',border:'none',cursor:'pointer',padding:'4px 2px',
          }}>
            <div style={{
              width:36,height:36,borderRadius:12,
              background: T.isDark ? `${p.color}22` : `${p.color}18`,
              border:`1px solid ${p.color}44`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:16,
            }}>{p.icon}</div>
            <span style={{fontSize:8,color:T.textMuted,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,letterSpacing:0.3}}>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── LIVE STRIP — below video player ──────────────────────────

export { SocialShareRow };
export default SocialShareRow;
