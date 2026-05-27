import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function EmergencyScreen({ onBack, constituency }) {
  const contacts = [
    { name:'Police Control Room',     number:'100',          emoji:'🚔', color:'#1d4ed8', cat:'Emergency'  },
    { name:'Ambulance',               number:'108',          emoji:'🚑', color:'#dc2626', cat:'Emergency'  },
    { name:'Fire Station',            number:'101',          emoji:'🚒', color:'#ea580c', cat:'Emergency'  },
    { name:'Women Helpline',          number:'1091',         emoji:'👩', color:'#be185d', cat:'Emergency'  },
    { name:'Child Helpline',          number:'1098',         emoji:'👶', color:'#7c3aed', cat:'Emergency'  },
    { name:'Disaster Helpline',       number:'1077',         emoji:'🌊', color:'#0891b2', cat:'Emergency'  },
    { name:'Kurnool Collectorate',    number:'08518-222001', emoji:'🏛️', color:'#374151', cat:'District'   },
    { name:'SP Office Kurnool',       number:'08518-222100', emoji:'👮', color:'#1d4ed8', cat:'District'   },
    { name:'Municipal Commissioner',  number:'08518-222300', emoji:'🏢', color:'#374151', cat:'District'   },
    { name:'District Medical Officer',number:'08518-222400', emoji:'🏥', color:'#059669', cat:'District'   },
    { name:'Electricity Complaints',  number:'1912',         emoji:'⚡', color:'#d97706', cat:'Utilities'  },
    { name:'Gas Emergency',           number:'1906',         emoji:'🔥', color:'#dc2626', cat:'Utilities'  },
    { name:'Water Board',             number:'155313',       emoji:'💧', color:'#0891b2', cat:'Utilities'  },
    { name:'Road Accident Helpline',  number:'1033',         emoji:'🛣️', color:'#374151', cat:'Transport'  },
    { name:'Railway Enquiry',         number:'139',          emoji:'🚂', color:'#374151', cat:'Transport'  },
    { name:'APSRTC Helpline',         number:'0866-2570005', emoji:'🚌', color:'#374151', cat:'Transport'  },
  ];
  const cats = ['Emergency','District','Utilities','Transport'];
  const [activecat, setActivecat] = useState('Emergency');
  const shown = contacts.filter(c=>c.cat===activecat);
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#7a0010,#d00218)',padding:'48px 18px 0',flexShrink:0}}>
        <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',marginBottom:10}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>🆘 Emergency Contacts</div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:4,marginBottom:12}}>{constituency} · Tap to call instantly</div>
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${T.border}`}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setActivecat(c)} style={{flex:1,background:'none',color:activecat===c?'white':'rgba(255,255,255,0.5)',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,padding:'10px 4px',borderBottom:activecat===c?'2px solid white':'2px solid transparent',cursor:'pointer'}}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {activecat==='Emergency'&&(
          <div style={{background:'rgba(208,2,27,0.1)',border:'1px solid rgba(208,2,27,0.3)',borderRadius:12,padding:'12px 14px',marginBottom:16,display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontSize:20}}>🚨</span>
            <span style={{fontSize:12,color:'#fca5a5',lineHeight:1.5}}>In case of emergency, call immediately. These numbers work 24×7 and are completely <strong>FREE</strong>.</span>
          </div>
        )}
        {shown.map((c,i)=>(
          <div key={i} onClick={()=>window.open(`tel:${c.number}`)}
            style={{display:'flex',alignItems:'center',gap:14,background:T.bg3,borderRadius:12,padding:'14px 16px',marginBottom:8,border:`1px solid ${T.border}`,cursor:'pointer',transition:'all 0.15s',active:{opacity:0.7},boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${c.color}22`,border:`1px solid ${c.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{c.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>{c.name}</div>
              <div style={{fontSize:13,fontWeight:600,color:T.teal,marginTop:2}}>{c.number}</div>
            </div>
            <div style={{background:'rgba(0,208,104,0.15)',border:'1px solid rgba(0,208,104,0.25)',borderRadius:8,padding:'6px 12px',display:'flex',alignItems:'center',gap:4}}>
              <span style={{fontSize:14}}>📞</span>
              <span style={{fontSize:11,color:T.green,fontWeight:700}}>CALL</span>
            </div>
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

// ── 9. WHATSAPP SHARE (helper function used everywhere) ──────
// Uses api.whatsapp.com/send (more reliable than wa.me for sharing without phone number).
// On mobile: opens WhatsApp app. On desktop: opens WhatsApp Web.
// ── Input sanitizer — strips HTML/scripts from user input ──
function sanitizeInput(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 2000);
}

function shareToWhatsApp(text) {
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}


export { EmergencyScreen };
export default EmergencyScreen;
