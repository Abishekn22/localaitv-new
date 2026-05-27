import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';

function DashboardScreen({ onNavigate, onBack }) {
  const { T } = useAppTheme();

  // Demo data — in a real backend these would come from /my-submissions
  const counts = [
    { key:'uploaded',  label:'Uploaded',   value:47, color:'#3B82F6', bg:'rgba(59,130,246,0.12)', icon:'📤' },
    { key:'processing',label:'Processing', value:5,  color:'#F59E0B', bg:'rgba(245,158,11,0.12)', icon:'⏳' },
    { key:'approved',  label:'Approved',   value:38, color:'#10B981', bg:'rgba(16,185,129,0.12)', icon:'✅' },
    { key:'rejected',  label:'Rejected',   value:4,  color:'#EF4444', bg:'rgba(239,68,68,0.12)',  icon:'❌' },
  ];

  const recent = [
    { title:'కర్నూల్ రోడ్డు మరమ్మతు పనులు ప్రారంభం', cat:'News',      status:'Approved',   date:'May 10, 2026', time:'9:15 AM',  color:'#10B981' },
    { title:'శ్రీమతి లక్ష్మీదేవి గారికి 60వ పుట్టినరోజు', cat:'Birthday',  status:'Approved',   date:'May 10, 2026', time:'8:00 AM',  color:'#10B981' },
    { title:'2BHK ఫ్లాట్ అద్దెకు — కర్నూలు మెయిన్ రోడ్',  cat:'Rental',    status:'Processing', date:'May 10, 2026', time:'8:30 AM',  color:'#F59E0B' },
    { title:'Old Car Sale Ad with broken link',           cat:'Car Sales', status:'Rejected',   date:'May 9, 2026',  time:'4:20 PM',  color:'#EF4444', reason:'Image quality too low' },
    { title:'కాకినాడ పోర్టులో కొత్త కార్గో టెర్మినల్',   cat:'News',      status:'Approved',   date:'May 9, 2026',  time:'6:30 PM',  color:'#10B981' },
    { title:'వివాహ శుభలేఖ — శ్రీ రాజేశ్వర్ & సుమిత్ర',     cat:'Marriage',  status:'Approved',   date:'May 8, 2026',  time:'10:00 AM', color:'#10B981' },
  ];

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg,#1A237E,#3949AB)',
        padding:'52px 16px 18px',
        display:'flex', alignItems:'center', gap:12, flexShrink:0,
      }}>
        <button onClick={onBack} style={{
          width:36, height:36, borderRadius:'50%',
          background:'rgba(255,255,255,0.18)', border:'none',
          color:'#FFFFFF', fontSize:18, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>←</button>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:18,color:'#FFFFFF'}}>Dashboard</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.75)'}}>Track your contributions</div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'14px 14px 28px'}}>
        {/* Counts grid */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {counts.map(c => (
            <div key={c.key} style={{
              background: c.bg,
              border:`1.5px solid ${c.color}33`,
              borderRadius:14, padding:'14px',
              display:'flex', flexDirection:'column', gap:4,
            }}>
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:18}}>{c.icon}</span>
                <span style={{
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:11, fontWeight:700, color:c.color,
                  letterSpacing:0.8, textTransform:'uppercase',
                }}>{c.label}</span>
              </div>
              <div style={{
                fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:32, fontWeight:900, color:c.color, lineHeight:1.1,
              }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Section header */}
        <div style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontSize:13, fontWeight:800, color:T.textMuted,
          letterSpacing:1, textTransform:'uppercase',
          margin:'6px 4px 8px',
        }}>Recent Activity</div>

        {/* Recent submissions list */}
        {recent.map((r,i) => (
          <div key={i} style={{
            background: T.bg2,
            border:`1px solid ${T.border}`,
            borderRadius:12, padding:'12px 14px', marginBottom:8,
          }}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:6}}>
              <div style={{
                fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
                fontSize:13, fontWeight:700, color:T.text, lineHeight:1.35, flex:1,
                overflow:'hidden', textOverflow:'ellipsis',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              }}>{r.title}</div>
              <span style={{
                flexShrink:0,
                background:`${r.color}1F`, color:r.color,
                fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:9, fontWeight:800, letterSpacing:0.4,
                padding:'3px 8px', borderRadius:6, textTransform:'uppercase',
              }}>{r.status}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:T.textMuted}}>
              <span style={{background:T.bg3,padding:'2px 7px',borderRadius:5,fontWeight:600}}>{r.cat}</span>
              <span>📅 {r.date} · 🕐 {r.time}</span>
            </div>
            {r.reason && (
              <div style={{marginTop:6,padding:'6px 8px',background:'rgba(239,68,68,0.06)',borderLeft:'3px solid #EF4444',borderRadius:4,fontSize:11,color:T.textMuted}}>
                <strong style={{color:'#EF4444'}}>Reason:</strong> {r.reason}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav active="profile" onChange={onNavigate} />
    </div>
  );
}

export { DashboardScreen };
export default DashboardScreen;
