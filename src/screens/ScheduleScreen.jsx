import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function ScheduleScreen({ onBack, constituency }) {
  const { T } = useAppTheme();
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const nowMins = h * 60 + m;

  // Per spec: 6-6:15 Bulletin · 6:15-6:30 Community (Birthdays etc) · 6:30-7 Bulletin
  // Each bulletin: Global News (8 min) + Local News (7 min)
  function inSlot(startH, startM, endH, endM) {
    const start = startH*60 + startM;
    const end   = endH*60 + endM;
    return nowMins >= start && nowMins < end;
  }
  function doneSlot(endH, endM) {
    return nowMins >= endH*60 + endM;
  }

  const slots = [
    // ── 6:00 AM block ─────────────────────────────────────────
    {
      time:'6:00–6:15 AM', title:'Morning News Bulletin',
      te:'ఉదయం వార్తల బులెటిన్',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
      ],
      live: inSlot(6,0,6,15), done: doneSlot(6,15),
    },
    {
      time:'6:15–6:30 AM', title:'Community Spotlight',
      te:'సమాజ ప్రత్యేకత',
      segments:[
        {icon:'🎂', label:'Birthdays',       mins:2,  color:'#7B1FA2'},
        {icon:'💒', label:'Marriages',       mins:2,  color:'#C2185B'},
        {icon:'💼', label:'Jobs & Classifieds',mins:3, color:'#1565C0'},
        {icon:'🎉', label:'Events',          mins:2,  color:'#E65100'},
        {icon:'🛍️', label:'Shopping Ads',    mins:2,  color:'#F57F17'},
        {icon:'🥦', label:'Veg Prices',      mins:1,  color:'#2E7D32'},
        {icon:'🌤️', label:'Weather',         mins:1,  color:'#0288D1'},
        {icon:'🪔', label:'Devotional',      mins:2,  color:'#7B1FA2'},
      ],
      community: true,
      live: inSlot(6,15,6,30), done: doneSlot(6,30),
    },
    {
      time:'6:30–7:00 AM', title:'Morning News Bulletin',
      te:'ఉదయం వార్తల బులెటిన్ — 2',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
        {icon:'🏛️', label:'Official Updates', mins:8, color:'#00838F'},
        {icon:'🌾', label:'Agri & Farming',  mins:7,  color:'#2E7D32'},
      ],
      live: inSlot(6,30,7,0), done: doneSlot(7,0),
    },
    // ── 8:00 AM block (same pattern as 6AM) ──────────────────
    {
      time:'8:00–8:15 AM', title:'Morning News Bulletin',
      te:'ఉదయం వార్తల బులెటిన్',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
      ],
      live: inSlot(8,0,8,15), done: doneSlot(8,15),
    },
    {
      time:'8:15–8:30 AM', title:'Community Spotlight',
      te:'సమాజ ప్రత్యేకత',
      segments:[
        {icon:'🎂', label:'Birthdays',       mins:2,  color:'#7B1FA2'},
        {icon:'💒', label:'Marriages',       mins:2,  color:'#C2185B'},
        {icon:'💼', label:'Jobs & Classifieds',mins:3, color:'#1565C0'},
        {icon:'🎉', label:'Events',          mins:2,  color:'#E65100'},
        {icon:'🛍️', label:'Shopping Ads',    mins:2,  color:'#F57F17'},
        {icon:'🥦', label:'Veg Prices',      mins:1,  color:'#2E7D32'},
        {icon:'🌤️', label:'Weather',         mins:1,  color:'#0288D1'},
        {icon:'🪔', label:'Devotional',      mins:2,  color:'#7B1FA2'},
      ],
      community: true,
      live: inSlot(8,15,8,30), done: doneSlot(8,30),
    },
    {
      time:'8:30–9:00 AM', title:'Prime Morning Bulletin',
      te:'ప్రధాన ఉదయ వార్తలు',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
        {icon:'🏛️', label:'Official Updates', mins:8, color:'#00838F'},
        {icon:'🌾', label:'Agri & Farming',  mins:7,  color:'#2E7D32'},
      ],
      live: inSlot(8,30,9,0), done: doneSlot(9,0),
    },
    // ── 12:00 PM block ────────────────────────────────────────
    {
      time:'12:00–12:15 PM', title:'Noon News Bulletin',
      te:'మధ్యాహ్నం వార్తల బులెటిన్',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
      ],
      live: inSlot(12,0,12,15), done: doneSlot(12,15),
    },
    {
      time:'12:15–12:30 PM', title:'Community Spotlight',
      te:'మధ్యాహ్నం సమాజ ప్రత్యేకత',
      segments:[
        {icon:'🎂', label:'Birthdays',       mins:2,  color:'#7B1FA2'},
        {icon:'💒', label:'Marriages',       mins:2,  color:'#C2185B'},
        {icon:'💼', label:'Jobs & Classifieds',mins:3, color:'#1565C0'},
        {icon:'🎉', label:'Events',          mins:2,  color:'#E65100'},
        {icon:'🛍️', label:'Shopping Ads',    mins:2,  color:'#F57F17'},
        {icon:'🥦', label:'Veg Prices',      mins:1,  color:'#2E7D32'},
        {icon:'🌤️', label:'Weather',         mins:1,  color:'#0288D1'},
        {icon:'🪔', label:'Devotional',      mins:2,  color:'#7B1FA2'},
      ],
      community: true,
      live: inSlot(12,15,12,30), done: doneSlot(12,30),
    },
    {
      time:'12:30–1:00 PM', title:'Midday Bulletin',
      te:'మధ్యాహ్నం వార్తలు',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
        {icon:'🏛️', label:'Govt Updates',    mins:8,  color:'#00838F'},
        {icon:'🌾', label:'Market Rates',    mins:7,  color:'#2E7D32'},
      ],
      live: inSlot(12,30,13,0), done: doneSlot(13,0),
    },
    {
      time:'6:00–6:15 PM', title:'Evening News Bulletin',
      te:'సాయంత్రం వార్తల బులెటిన్',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
      ],
      live: inSlot(18,0,18,15), done: doneSlot(18,15),
    },
    {
      time:'6:15–6:30 PM', title:'Community Spotlight',
      te:'సాయంత్రం సమాజ ప్రత్యేకత',
      segments:[
        {icon:'🎂', label:'Birthdays',       mins:2,  color:'#7B1FA2'},
        {icon:'💒', label:'Marriages',       mins:2,  color:'#C2185B'},
        {icon:'💼', label:'Jobs',            mins:3,  color:'#1565C0'},
        {icon:'🎉', label:'Events',          mins:2,  color:'#E65100'},
        {icon:'🛍️', label:'Shopping',        mins:2,  color:'#F57F17'},
        {icon:'🥦', label:'Veg Prices',      mins:1,  color:'#2E7D32'},
        {icon:'🌤️', label:'Weather',         mins:1,  color:'#0288D1'},
        {icon:'🪔', label:'Devotional',      mins:2,  color:'#7B1FA2'},
      ],
      community: true,
      live: inSlot(18,15,18,30), done: doneSlot(18,30),
    },
    {
      time:'6:30–7:00 PM', title:'Prime Evening Bulletin',
      te:'ప్రధాన సాయంత్రం బులెటిన్',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
        {icon:'🏛️', label:'Official Updates', mins:8, color:'#00838F'},
        {icon:'🌾', label:'Agri & Farming',  mins:7,  color:'#2E7D32'},
      ],
      live: inSlot(18,30,19,0), done: doneSlot(19,0),
    },
    {
      time:'10:00–10:15 PM', title:'Night News Bulletin',
      te:'రాత్రి వార్తల బులెటిన్',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
      ],
      live: inSlot(22,0,22,15), done: doneSlot(22,15),
    },
    {
      time:'10:15–10:30 PM', title:'Community Spotlight',
      te:'రాత్రి సమాజ ప్రత్యేకత',
      segments:[
        {icon:'🎂', label:'Birthdays',       mins:2,  color:'#7B1FA2'},
        {icon:'💒', label:'Marriages',       mins:2,  color:'#C2185B'},
        {icon:'💼', label:'Jobs & Classifieds',mins:3, color:'#1565C0'},
        {icon:'🎉', label:'Events',          mins:2,  color:'#E65100'},
        {icon:'🛍️', label:'Shopping Ads',    mins:2,  color:'#F57F17'},
        {icon:'🥦', label:'Veg Prices',      mins:1,  color:'#2E7D32'},
        {icon:'🌤️', label:'Weather',         mins:1,  color:'#0288D1'},
        {icon:'🪔', label:'Devotional',      mins:2,  color:'#7B1FA2'},
      ],
      community: true,
      live: inSlot(22,15,22,30), done: doneSlot(22,30),
    },
    {
      time:'10:30–11:00 PM', title:'Night News Summary',
      te:'రాత్రి వార్తల సారాంశం',
      segments:[
        {icon:'🌍', label:'Global News',     mins:8,  color:'#1565C0'},
        {icon:'📍', label:'Local News',      mins:7,  color:T.red},
        {icon:'🏛️', label:'Official Updates', mins:8, color:'#00838F'},
        {icon:'🔮', label:'Tomorrow Preview', mins:7,  color:'#7B1FA2'},
      ],
      live: inSlot(22,30,23,0), done: doneSlot(23,0),
    },
  ];

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.isDark?`linear-gradient(135deg,#0a1628,#1a2a4a)`:T.bg2,
        padding:'48px 18px 16px',flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
        <button onClick={onBack} style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,
          width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',marginBottom:12}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.text}}>
          📺 Today's Schedule
        </div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>
          {constituency} TV · {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}
        </div>
        {/* Format legend */}
        <div style={{display:'flex',gap:10,marginTop:10,flexWrap:'wrap'}}>
          {[
            {icon:'🌍',label:'Global News',color:'#1565C0'},
            {icon:'📍',label:'Local News', color:T.red},
            {icon:'🎉',label:'Community',  color:'#E65100'},
          ].map(l=>(
            <div key={l.label} style={{display:'flex',alignItems:'center',gap:4,
              background:`${l.color}18`,border:`1px solid ${l.color}33`,
              borderRadius:12,padding:'3px 8px'}}>
              <span style={{fontSize:10}}>{l.icon}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
                fontSize:9,color:l.color,letterSpacing:0.3}}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 100px'}}>
        {slots.map((s,i)=>(
          <div key={i} style={{marginBottom:14}}>
            <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
              {/* Time + indicator */}
              <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',width:80}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,
                  color:s.live?T.gold:s.done?T.textMuted:T.text,textAlign:'right',width:'100%'}}>
                  {s.time}
                </div>
                <div style={{width:10,height:10,borderRadius:'50%',marginTop:4,flexShrink:0,
                  background:s.live?T.gold:s.done?T.green:T.bg3,
                  border:`2px solid ${s.live?T.gold:s.done?T.green:T.border}`}}/>
                {i<slots.length-1&&<div style={{width:2,flex:1,minHeight:24,background:T.border,marginTop:2}}/>}
              </div>

              {/* Content card */}
              <div style={{flex:1,background:s.live?`rgba(255,184,0,0.06)`:T.bg2,
                borderRadius:14,padding:'12px 14px',
                border:`1px solid ${s.live?'rgba(255,184,0,0.3)':T.border}`,
                boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`,
                marginBottom:4}}>

                {/* Header row */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,
                      color:s.live?T.gold:T.text}}>{s.title}</div>
                    <div style={{fontFamily:"'Tiro Telugu',serif",fontSize:10,color:T.textMuted,marginTop:1}}>{s.te}</div>
                  </div>
                  {s.live && <span style={{background:T.gold,color:'#000',fontSize:8,fontWeight:800,
                    padding:'2px 8px',borderRadius:4,letterSpacing:0.5}}>ON AIR</span>}
                  {s.done && <span style={{background:'rgba(0,208,104,0.12)',color:T.green,fontSize:8,
                    fontWeight:700,padding:'2px 8px',borderRadius:4}}>DONE ✓</span>}
                  {!s.live&&!s.done && <span style={{background:T.bg3,color:T.textMuted,fontSize:8,
                    fontWeight:700,padding:'2px 8px',borderRadius:4}}>UPCOMING</span>}
                </div>

                {/* Segment breakdown */}
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {s.segments.map((seg,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:8}}>
                      {/* Color bar */}
                      <div style={{width:3,height:20,borderRadius:2,background:seg.color,flexShrink:0}}/>
                      <span style={{fontSize:11}}>{seg.icon}</span>
                      <span style={{fontSize:11,color:T.text,flex:1}}>{seg.label}</span>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,
                        fontSize:10,color:T.textMuted}}>{seg.mins} min</span>
                    </div>
                  ))}
                </div>

                {/* Community note */}
                {s.community && (
                  <div style={{marginTop:8,padding:'6px 10px',background:'rgba(230,81,0,0.06)',
                    borderRadius:8,border:'1px solid rgba(230,81,0,0.15)'}}>
                    <div style={{fontSize:9,color:'#E65100',fontWeight:600}}>
                      📢 No news in this slot — community announcements only
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export { ScheduleScreen };
export default ScheduleScreen;
