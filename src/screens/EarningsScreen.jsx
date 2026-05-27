import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function EarningsScreen({ onBack }) {
  const stats = { published:38, pending:4, rejected:2, thisMonth:'--', trustScore:72, level:'Silver' };
  const history = [
    { story:'కర్నూల్ రోడ్ పని నివేదిక', date:'May 5', amount:'--', status:'paid'    },
    { story:'గుంటూర్ మిరప ధరలు',        date:'May 4', amount:'--', status:'paid'    },
    { story:'మంటి నిర్మాణం నివేదిక',     date:'May 3', amount:'--', status:'paid'    },
    { story:'ఊర్లో నీటి సమస్య',          date:'May 2', amount:'--', status:'paid'    },
    { story:'స్కూల్ ర్యాంకులు 2026',      date:'May 1', amount:'--', status:'pending' },
  ];
  const levels = [
    { name:'Bronze',  range:'0–30',  rate:'Basic',    color:'#cd7f32' },
    { name:'Silver',  range:'31–70', rate:'Reporter', color:'#aaa'    },
    { name:'Gold',    range:'71–90', rate:'Senior',   color:T.gold    },
    { name:'Diamond', range:'91+',   rate:'Expert',   color:T.teal    },
  ];
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.bg2,padding:'50px 18px 14px',flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20}}>💰 My Stories</div>
            <div style={{fontSize:10,color:T.textMuted}}>Contributor Dashboard</div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {/* Contributor stats hero */}
        <div style={{background:`linear-gradient(135deg,rgba(0,208,104,0.15),rgba(0,208,104,0.05))`,border:`1px solid rgba(0,208,104,0.2)`,borderRadius:16,padding:'20px',textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:11,color:T.green,letterSpacing:2,marginBottom:4}}>YOUR CONTRIBUTION</div>
          <div style={{fontSize:44,fontWeight:800,color:T.green}}>{stats.published}</div>
          <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>Stories published this month</div>
        </div>
        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
          {[{label:'Published',val:stats.published,color:T.green},{label:'Pending',val:stats.pending,color:T.gold},{label:'Rejected',val:stats.rejected,color:T.red}].map((s,i)=>(
            <div key={i} style={{background:T.bg2,borderRadius:10,padding:'12px',textAlign:'center',border:`1px solid ${T.border}`}}>
              <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Trust level */}
        <div style={{background:T.bg2,borderRadius:12,padding:'14px',marginBottom:16,border:`1px solid ${T.border}`}}>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:8}}>Trust Score: <span style={{color:T.text,fontWeight:700}}>{stats.trustScore}/100</span> · Level: <span style={{color:T.gold,fontWeight:700}}>🥈 {stats.level}</span></div>
          <div style={{height:6,background:T.bg3,borderRadius:3,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${stats.trustScore}%`,background:`linear-gradient(90deg,${T.gold},${T.red})`,borderRadius:3}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,marginTop:10}}>
            {levels.map((l,i)=>(
              <div key={i} style={{textAlign:'center',opacity:l.name===stats.level?1:0.45}}>
                <div style={{fontSize:11,fontWeight:700,color:l.color}}>{l.name}</div>
                <div style={{fontSize:9,color:T.textMuted}}>{l.rate}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Story activity */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,marginBottom:10}}>📋 Recent Stories</div>
        {history.map((h,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,background:T.bg2,borderRadius:10,padding:'12px 14px',marginBottom:8,border:`1px solid ${T.border}`}}>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:T.text}}>{h.story}</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{h.date}</div>
            </div>
            <div style={{background:h.status==='paid'?`rgba(0,208,104,0.15)`:`rgba(255,184,0,0.12)`,border:`1px solid ${h.status==='paid'?T.green:T.gold}44`,borderRadius:6,padding:'3px 8px',fontSize:9,color:h.status==='paid'?T.green:T.gold,fontWeight:700}}>
              {h.status==='paid'?'Published':'Pending'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export { EarningsScreen };
export default EarningsScreen;
