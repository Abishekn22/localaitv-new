import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function ProgressScreen({ onBack, constituency }) {
  const FALLBACK = [
    { title:'NH-40 Kurnool Bypass Road',      dept:'Roads & Buildings', budget:'₹124 Cr', status:'ongoing',   pct:65, started:'Jan 2024', due:'Dec 2026' },
    { title:'New Govt Hospital ICU Block',     dept:'Health Dept',       budget:'₹18 Cr',  status:'completed', pct:100,started:'Mar 2023', due:'Apr 2025' },
    { title:'Municipal Drinking Water Supply', dept:'Municipal Corp',     budget:'₹42 Cr',  status:'ongoing',   pct:40, started:'Jun 2024', due:'Jun 2026' },
    { title:'Smart School Kurnool Phase 1',    dept:'Education Dept',    budget:'₹8 Cr',   status:'completed', pct:100,started:'Apr 2023', due:'Jan 2025' },
    { title:'Kurnool Solar Power Plant',       dept:'Energy Dept',       budget:'₹310 Cr', status:'planned',   pct:5,  started:'TBD',      due:'2027'     },
    { title:'New Bus Stand Phase 2',           dept:'APSRTC',            budget:'₹55 Cr',  status:'ongoing',   pct:25, started:'Sep 2024', due:'Mar 2027' },
    { title:'Flood Canal Restoration',         dept:'Irrigation Dept',   budget:'₹29 Cr',  status:'ongoing',   pct:80, started:'Nov 2023', due:'Aug 2025' },
    { title:'Public Park Rejuvenation',        dept:'Municipal Corp',     budget:'₹4.5 Cr', status:'completed', pct:100,started:'Jan 2024', due:'Oct 2024' },
  ];
  const { data: projects } = useAPI(
    () => apiCall(`/projects?constituency=${encodeURIComponent(constituency||'Kurnool')}`).then(d => d.items || d),
    FALLBACK,
    [constituency]
  );
  const statColor = s => s==='completed'?T.green:s==='ongoing'?T.gold:'rgba(255,255,255,0.3)';
  const statLabel = s => s==='completed'?'✅ Completed':s==='ongoing'?'🔨 Ongoing':'📋 Planned';
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#0a2a1a,#1a4a2a)',padding:'48px 18px 16px',flexShrink:0}}>
        <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',marginBottom:10}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>🏗️ Constituency Progress</div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{constituency} · Government Projects Tracker</div>
        {/* Summary bar */}
        <div style={{display:'flex',gap:12,marginTop:12}}>
          {[
            {l:'Completed',v:projects.filter(p=>p.status==='completed').length,c:T.green},
            {l:'Ongoing',v:projects.filter(p=>p.status==='ongoing').length,c:T.gold},
            {l:'Planned',v:projects.filter(p=>p.status==='planned').length,c:'rgba(255,255,255,0.4)'},
          ].map(s=>(
            <div key={s.l} style={{background:T.bg3,borderRadius:8,padding:'6px 12px',textAlign:'center'}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:s.c}}>{s.v}</div>
              <div style={{fontSize:9,color:T.textMuted}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {projects.map((p,i) => (
          <div key={i} style={{background:T.bg3,borderRadius:14,padding:'14px 16px',marginBottom:12,border:`1px solid ${p.status==='completed'?'rgba(0,208,104,0.15)':p.status==='ongoing'?'rgba(255,184,0,0.15)':'rgba(255,255,255,0.05)'}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div style={{flex:1,paddingRight:8}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,lineHeight:1.2,marginBottom:3}}>{p.title}</div>
                <div style={{fontSize:10,color:T.textMuted}}>{p.dept} · {p.budget}</div>
              </div>
              <span style={{background:`rgba(${p.status==='completed'?'0,208,104':p.status==='ongoing'?'255,184,0':'255,255,255'},0.12)`,color:statColor(p.status),fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:6,flexShrink:0,whiteSpace:'nowrap'}}>{statLabel(p.status)}</span>
            </div>
            <div style={{height:6,background:T.bg3,borderRadius:3,overflow:'hidden',marginBottom:6}}>
              <div style={{height:'100%',width:`${p.pct}%`,background:`linear-gradient(90deg,${statColor(p.status)},${statColor(p.status)}99)`,borderRadius:3}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:10,color:T.textMuted}}>Started: {p.started}</span>
              <span style={{fontSize:10,color:T.textMuted}}>Due: {p.due}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,color:statColor(p.status)}}>{p.pct}%</span>
            </div>
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}


export { ProgressScreen };
export default ProgressScreen;
