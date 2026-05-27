import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function ClassifiedShareSheet({ item, onClose }) {
  const { T } = useAppTheme();
  const shareText = encodeURIComponent(
    `${item.title}\n\n${item.desc?.slice(0,100)}...\n\n📱 LocalAI TV: https://localaitv.com/app`
  );
  const PLATFORMS = [
    { label:'WhatsApp',  color:'#25D366', bg:'rgba(37,211,102,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#25D366"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.76 1.83 6.74L2 30l7.44-1.79A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.1 19.1c-.3.84-1.76 1.6-2.4 1.7-.62.1-1.4.14-2.26-.14a20.6 20.6 0 01-2.04-.75c-3.58-1.55-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7s.92-2.62 1.26-2.98c.3-.34.66-.42.88-.42l.64.01c.2 0 .48-.08.74.56.28.66.94 2.3.02 2.56-.18.06-.34.14-.5.22-.28.14-.52.3-.36.6.16.3.7 1.16 1.5 1.88l1.44 1.14c.3.16.6.12.82-.12.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.02.96 2.36 1.13.34.18.58.26.66.4.08.16.08.9-.22 1.74z"/></svg>,
      action:()=>window.open(`https://api.whatsapp.com/send?text=${shareText}`,'_blank') },
    { label:'Telegram',  color:'#0088CC', bg:'rgba(0,136,204,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#0088CC"><path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm6.84 9.58l-2.36 11.12c-.18.8-.64 1-1.3.62l-3.6-2.65-1.73 1.67c-.2.2-.36.36-.73.36l.26-3.68 6.7-6.05c.3-.26-.06-.4-.44-.14l-8.28 5.21-3.57-1.12c-.78-.24-.8-.78.16-1.15l13.93-5.37c.64-.24 1.2.14.96 1.18z"/></svg>,
      action:()=>window.open(`https://t.me/share/url?url=${encodeURIComponent('https://localaitv.com/app')}&text=${shareText}`,'_blank') },
    { label:'Facebook',  color:'#1877F2', bg:'rgba(24,119,242,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#1877F2"><path d="M16 2C8.27 2 2 8.27 2 16c0 6.99 5.12 12.77 11.81 13.82V19.9h-3.55V16h3.55v-3.08c0-3.51 2.09-5.44 5.28-5.44 1.53 0 3.12.27 3.12.27v3.44h-1.76c-1.73 0-2.27 1.07-2.27 2.17V16h3.87l-.62 3.9h-3.25v9.92C24.88 28.77 30 22.99 30 16c0-7.73-6.27-14-14-14z"/></svg>,
      action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://localaitv.com/app')}`,'_blank') },
    { label:'X/Twitter', color:'#000', bg:'rgba(255,255,255,0.08)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="white"><path d="M18.24 14.17L27.1 4h-2.1l-7.7 8.95L11 4H4l9.3 13.53L4 28h2.1l8.13-9.45L21 28h7L18.24 14.17z"/></svg>,
      action:()=>window.open(`https://twitter.com/intent/tweet?text=${shareText}`,'_blank') },
    { label:'Email',     color:'#EA4335', bg:'rgba(234,67,53,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="28" height="20" rx="3" stroke="#EA4335" strokeWidth="2.2"/><path d="M2 10l14 9 14-9" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round"/></svg>,
      action:()=>window.open(`mailto:?subject=${encodeURIComponent(item.title)}&body=${shareText}`,'_blank') },
    { label:'More',      color:'#9CA3AF', bg:'rgba(156,163,175,0.12)',
      icon:<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2.2} strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
      action:()=>navigator.share?.({title:item.title,text:decodeURIComponent(shareText),url:'https://localaitv.com/app'}).catch(()=>{}) },
  ];

  return (
    <div onClick={onClose}
      style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,0,0,0.6)',
        display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:T.isDark?'#111':'#fff', borderRadius:'22px 22px 0 0',
          padding:'12px 0 40px', boxShadow:'0 -6px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ width:38,height:4,background:T.border,borderRadius:2,margin:'0 auto 16px' }}/>
        <div style={{ textAlign:'center', marginBottom:20,
          fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
          fontSize:16, color:T.text, letterSpacing:0.5 }}>Share this Ad</div>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:14, padding:'0 20px' }}>
          {PLATFORMS.map(p=>(
            <div key={p.label} onClick={()=>{ p.action(); onClose(); }}
              style={{ display:'flex', flexDirection:'column', alignItems:'center',
                gap:6, cursor:'pointer', width:66 }}>
              <div style={{ width:56,height:56,borderRadius:18, background:p.bg,
                border:`1.5px solid ${p.color}44`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 2px 14px ${p.color}22` }}>{p.icon}</div>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:10,
                color:T.textMuted, fontWeight:600, textAlign:'center' }}>{p.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose}
          style={{ display:'block', margin:'22px auto 0',
            background:T.bg3, border:`1px solid ${T.border}`,
            borderRadius:14, padding:'12px 48px',
            fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:700, fontSize:15, color:T.textMuted, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}


export { ClassifiedShareSheet };
export default ClassifiedShareSheet;
