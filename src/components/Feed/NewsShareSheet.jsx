import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function NewsShareSheet({ item, onClose }) {
  const { T } = useAppTheme();
  const shareText = encodeURIComponent(
    `${item?.title}\n${item?.titleEn || ''}\n\n📱 LocalAI TV: https://localaitv.com/app`
  );
  const platforms = [
    { label:'WhatsApp', emoji:'💬', color:'#25D366', bg:'rgba(37,211,102,0.15)',
      action:()=>window.open(`https://api.whatsapp.com/send?text=${shareText}`,'_blank') },
    { label:'Telegram', emoji:'✈️', color:'#0088CC', bg:'rgba(0,136,204,0.15)',
      action:()=>window.open(`https://t.me/share/url?url=${encodeURIComponent('https://localaitv.com/app')}&text=${shareText}`,'_blank') },
    { label:'Facebook', emoji:'📘', color:'#1877F2', bg:'rgba(24,119,242,0.15)',
      action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://localaitv.com/app')}`,'_blank') },
    { label:'Twitter',  emoji:'🐦', color:'#000',    bg:'rgba(0,0,0,0.08)',
      action:()=>window.open(`https://twitter.com/intent/tweet?text=${shareText}`,'_blank') },
    { label:'Email',    emoji:'📧', color:'#EA4335', bg:'rgba(234,67,53,0.15)',
      action:()=>window.open(`mailto:?subject=${encodeURIComponent(item?.title||'')}&body=${shareText}`,'_blank') },
    { label:'More',     emoji:'⤴',  color:'#6B7280', bg:'rgba(107,114,128,0.12)',
      action:()=>navigator.share?.({title:item?.title,text:decodeURIComponent(shareText),url:'https://localaitv.com/app'}).catch(()=>{}) },
  ];
  return (
    <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:50,
      background:'rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:T.isDark?'#111':'#fff', borderRadius:'22px 22px 0 0',
          padding:'12px 0 40px', boxShadow:'0 -6px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ width:38,height:4,background:T.border,borderRadius:2,margin:'0 auto 16px' }}/>
        <div style={{ textAlign:'center', marginBottom:20,
          fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:16, color:T.text }}>
          Share this News
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:14, padding:'0 20px' }}>
          {platforms.map(p => (
            <div key={p.label} onClick={()=>{ p.action(); onClose(); }}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', width:66 }}>
              <div style={{ width:56,height:56,borderRadius:18, background:p.bg,
                border:`1.5px solid ${p.color}44`, display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:24 }}>{p.emoji}</div>
              <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:10,
                color:T.textMuted, fontWeight:600 }}>{p.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ display:'block', margin:'22px auto 0',
          background:T.bg3, border:`1px solid ${T.border}`, borderRadius:14,
          padding:'12px 48px', fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:700, fontSize:15, color:T.textMuted, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}


export { NewsShareSheet };
export default NewsShareSheet;
