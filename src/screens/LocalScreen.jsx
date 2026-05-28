import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import { LocationPin } from './../components/atoms.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

function LocalScreen({ onNavigate, constituency, onOpenCat }) {
  const { T } = useAppTheme();
  const { isAuthenticated } = useAuth();

  // ── 8 main categories (matching Upload home page) — show local LISTINGS ──
  const tiles = [
    { id:'news',       icon:'📰', label:'News',           labelTe:'వార్తలు',          color:'#1A237E', go:()=>onNavigate('shortsfeed') },
    { id:'birthdays',  icon:'🎂', label:'Birthdays',      labelTe:'పుట్టినరోజులు',    color:'#7B1FA2', go:()=>onOpenCat&&onOpenCat('Birthdays') },
    { id:'marriages',  icon:'💒', label:'Marriages',      labelTe:'వివాహాలు',         color:'#C2185B', go:()=>onOpenCat&&onOpenCat('Marriages') },
    { id:'events',     icon:'🎉', label:'Events',         labelTe:'కార్యక్రమాలు',     color:'#E65100', go:()=>onOpenCat&&onOpenCat('Events') },
    { id:'jobs',       icon:'💼', label:'Jobs',           labelTe:'ఉద్యోగాలు',        color:'#1565C0', go:()=>onOpenCat&&onOpenCat('Jobs') },
    { id:'carsales',   icon:'🚗', label:'Car / Motorcycle',labelTe:'కార్ / మోటార్‌సైకిల్', color:'#1B5E20', go:()=>onOpenCat&&onOpenCat('Car Sales') },
    { id:'rentals',    icon:'🏠', label:'Rentals',        labelTe:'అద్దెలు',          color:'#00838F', go:()=>onOpenCat&&onOpenCat('House Rents') },
    { id:'shopping',   icon:'🛍️', label:'Shopping',       labelTe:'షాపింగ్',          color:'#F57F17', go:()=>onOpenCat&&onOpenCat('Shopping') },
  ];

  // ── 8 local SERVICES (info pages) — relevant info per constituency ──
  const services = [
    { id:'emergency',  icon:'🆘', label:'Emergency Contacts', labelTe:'అత్యవసర నంబర్లు',  color:'#B71C1C', go:()=>onNavigate('emergency') },
    { id:'veg',        icon:'🥦', label:'Vegetable Rates',    labelTe:'కూరగాయల ధరలు',     color:'#2E7D32', go:()=>onNavigate('utility') },
    { id:'trains',     icon:'🚂', label:'Train Timings',      labelTe:'రైలు సమయాలు',      color:'#0277BD', go:()=>onNavigate('trains') },
    { id:'bullion',    icon:'💰', label:'Bullion Market',     labelTe:'బంగారం/వెండి ధరలు',color:'#B8860B', go:()=>onNavigate('utility') },
    { id:'weather',    icon:'🌤️', label:'Weather',            labelTe:'వాతావరణం',         color:'#0288D1', go:()=>onNavigate('weather') },
    { id:'whoswho',    icon:'👥', label:"Who's Who",          labelTe:'వ్యక్తిత్వాలు',    color:'#3949AB', go:()=>onNavigate('whoswho') },
    { id:'temples',    icon:'🛕', label:'Temple Timings',     labelTe:'ఆలయ సమయాలు',       color:'#7B1FA2', go:()=>onNavigate('devotional') },
    { id:'panchangam', icon:'🪔', label:'Panchangam',         labelTe:'పంచాంగం',          color:'#FF6F00', go:()=>onNavigate('panchangam') },
  ];

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* Header */}
      <div style={{background:T.bg2,padding:'50px 18px 14px',flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0,flex:1}}>
            {/* Red location pin SVG */}
            <div style={{flexShrink:0}}>
              <LocationPin size={28}/>
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:22,letterSpacing:0.5,color:T.text,lineHeight:1.1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {(constituency || 'Kurnool').replace(/ (Urban|City|East|West|North|South)$/, '')} Information
              </div>
              <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontSize:12,color:T.textMuted,marginTop:2,fontWeight:600}}>
                స్థానిక సమాచారం · Local Information
              </div>
            </div>
          </div>
          {!isAuthenticated && (
            <button onClick={()=>onNavigate('uploadregister')}
              onMouseEnter={e=>{
                e.currentTarget.style.transform='translateY(-2px)';
                e.currentTarget.style.boxShadow=`0 6px 18px ${T.red}66`;
                e.currentTarget.style.background='linear-gradient(135deg,#FF1A35,#C8001F)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0)';
                e.currentTarget.style.boxShadow=`0 3px 10px ${T.red}44`;
                e.currentTarget.style.background=`linear-gradient(135deg,${T.red},#9A0015)`;
              }}
              style={{
                background:`linear-gradient(135deg,${T.red},#9A0015)`,border:'none',borderRadius:12,
                padding:'10px 14px',color:'white',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800,fontSize:12,letterSpacing:0.4,cursor:'pointer',
                boxShadow:`0 3px 10px ${T.red}44`,
                display:'flex',flexDirection:'column',alignItems:'center',gap:1,flexShrink:0,
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                lineHeight:1.1,
              }}>
              <span style={{fontSize:13}}>📤 Register</span>
              <span style={{fontSize:10,opacity:0.92,fontWeight:600}}>to Upload</span>
            </button>
          )}
        </div>
      </div>

      {/* Tiles grid — 8 categories matching the Upload home page */}
      <div style={{flex:1,overflowY:'auto',padding:'14px 14px 120px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {tiles.map((t) => (
            <div key={t.id} onClick={t.go}
              style={{
                background:T.bg2,border:`2px solid ${T.border}`,
                borderRadius:16,padding:'18px 14px',
                display:'flex',flexDirection:'column',alignItems:'center',gap:8,
                cursor:'pointer',
                boxShadow:T.isDark?'none':`0 2px 10px ${T.shadow}`,
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                transform:'translateY(0) scale(1)',
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.transform='translateY(-4px) scale(1.03)';
                e.currentTarget.style.borderColor=t.color;
                e.currentTarget.style.boxShadow=`0 8px 24px ${t.color}55, 0 0 0 1px ${t.color}40`;
                e.currentTarget.style.background=`${t.color}10`;
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.borderColor=T.border;
                e.currentTarget.style.boxShadow=T.isDark?'none':`0 2px 10px ${T.shadow}`;
                e.currentTarget.style.background=T.bg2;
              }}
              onTouchStart={e=>{
                e.currentTarget.style.transform='scale(0.96)';
                e.currentTarget.style.borderColor=t.color;
                e.currentTarget.style.background=`${t.color}15`;
              }}
              onTouchEnd={e=>{
                e.currentTarget.style.transform='scale(1)';
                e.currentTarget.style.borderColor=T.border;
                e.currentTarget.style.background=T.bg2;
              }}
            >
              {/* Icon circle */}
              <div style={{
                width:52,height:52,borderRadius:16,
                background:`${t.color}18`,
                border:`2px solid ${t.color}33`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:26,
              }}>{t.icon}</div>

              {/* Telugu (top, bold) */}
              <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:15,color:T.text,lineHeight:1.3,textAlign:'center'}}>{t.labelTe}</div>
              {/* English (smaller, muted) */}
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:12,color:T.textMuted,letterSpacing:0.3}}>{t.label}</div>
            </div>
          ))}
        </div>

        {/* ── Local Services section ── */}
        <div style={{marginTop:24,marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
          <div style={{flex:1,height:1,background:T.border}}/>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:900,fontSize:16,color:T.text,lineHeight:1.2}}>
              స్థానిక సేవలు
            </div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:11,color:T.textMuted,letterSpacing:0.5}}>
              Local Services
            </div>
          </div>
          <div style={{flex:1,height:1,background:T.border}}/>
        </div>

        {/* Services grid — 8 service categories */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {services.map((t) => (
            <div key={t.id} onClick={t.go}
              style={{
                background:T.bg2,border:`2px solid ${T.border}`,
                borderRadius:16,padding:'18px 14px',
                display:'flex',flexDirection:'column',alignItems:'center',gap:8,
                cursor:'pointer',
                boxShadow:T.isDark?'none':`0 2px 10px ${T.shadow}`,
                transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                transform:'translateY(0) scale(1)',
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.transform='translateY(-4px) scale(1.03)';
                e.currentTarget.style.borderColor=t.color;
                e.currentTarget.style.boxShadow=`0 8px 24px ${t.color}55, 0 0 0 1px ${t.color}40`;
                e.currentTarget.style.background=`${t.color}10`;
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.borderColor=T.border;
                e.currentTarget.style.boxShadow=T.isDark?'none':`0 2px 10px ${T.shadow}`;
                e.currentTarget.style.background=T.bg2;
              }}
              onTouchStart={e=>{
                e.currentTarget.style.transform='scale(0.96)';
                e.currentTarget.style.borderColor=t.color;
                e.currentTarget.style.background=`${t.color}15`;
              }}
              onTouchEnd={e=>{
                e.currentTarget.style.transform='scale(1)';
                e.currentTarget.style.borderColor=T.border;
                e.currentTarget.style.background=T.bg2;
              }}
            >
              <div style={{
                width:52,height:52,borderRadius:16,
                background:`${t.color}18`,
                border:`2px solid ${t.color}33`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:26,
              }}>{t.icon}</div>
              <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",fontWeight:800,fontSize:14,color:T.text,lineHeight:1.3,textAlign:'center'}}>{t.labelTe}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,fontSize:11,color:T.textMuted,letterSpacing:0.3,textAlign:'center'}}>{t.label}</div>
            </div>
          ))}
        </div>

        {/* Constituency info strip */}
        <div style={{
          marginTop:16,background:T.bg2,borderRadius:14,
          padding:'14px 16px',border:`1px solid ${T.border}`,
          boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`,
        }}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,
            color:T.text,marginBottom:4,letterSpacing:0.5}}>
            📍 {constituency} Constituency
          </div>
          <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>
            All information above is specific to your selected constituency.
            To change location, tap the location icon on the Home screen.
          </div>
        </div>
      </div>

      <BottomNav active="local" onChange={onNavigate}/>
    </div>
  );
}

export { LocalScreen };
export default LocalScreen;
