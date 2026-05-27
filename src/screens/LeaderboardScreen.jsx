import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function LeaderboardScreen({ onBack, constituency }) {
  const FALLBACK = [
    { rank:1,  name:'Ravi Kumar Reddy',  stories:142, trust:94, badge:'🥇', location:'Kurnool',     specialty:'Civic & Politics'  },
    { rank:2,  name:'Suresh Rao',        stories:128, trust:91, badge:'🥈', location:'Karimnagar',  specialty:'Agriculture'        },
    { rank:3,  name:'Priya Devi',        stories:117, trust:88, badge:'🥉', location:'Warangal',    specialty:'Culture & Festivals'},
    { rank:4,  name:'Krishna Murthy',    stories:98,  trust:85, badge:'⭐', location:'Vijayawada',  specialty:'Business & Economy' },
    { rank:5,  name:'Laxmi Bai',         stories:87,  trust:82, badge:'⭐', location:'Nalgonda',    specialty:'Health & Welfare'   },
    { rank:6,  name:'Naidu Garu',        stories:76,  trust:79, badge:'⭐', location:'Guntur',      specialty:'Agri & Markets'     },
    { rank:7,  name:'Anitha Reddy',      stories:65,  trust:76, badge:'⭐', location:'Rajahmundry', specialty:'Weather & Civic'    },
    { rank:8,  name:'Venkatesan',        stories:58,  trust:74, badge:'⭐', location:'Tirupati',    specialty:'Devotional & Local' },
    { rank:9,  name:'Sunita Devi',       stories:47,  trust:70, badge:'⭐', location:'Vizag',       specialty:'Crime & Law'        },
    { rank:10, name:'Ramesh Babu',       stories:39,  trust:67, badge:'⭐', location:'Hyderabad',   specialty:'National & State'   },
  ];
  const { data: reporters } = useAPI(
    () => apiCall(`/leaderboard?constituency=${encodeURIComponent(constituency||'Kurnool')}&month=${new Date().toISOString().slice(0,7)}`).then(d => d.items || d),
    FALLBACK,
    [constituency]
  );
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#1a3a0a,#2a5a10)',padding:'48px 18px 16px',flexShrink:0}}>
        <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',marginBottom:10}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>🏆 Reporter Leaderboard</div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>Top Contributors · This Month</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {/* Top 3 podium */}
        <div style={{display:'flex',alignItems:'flex-end',justifyContent:'center',gap:10,marginBottom:20,padding:'10px 0'}}>
          {[reporters[1],reporters[0],reporters[2]].map((r,i)=>{
            const heights = [80,100,70];
            const colors  = ['#aaa','#f59e0b','#cd7f32'];
            return (
              <div key={r.rank} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:12,color:T.text,textAlign:'center',lineHeight:1.2}}>{r.name.split(' ')[0]}</div>
                <div style={{fontSize:9,color:T.textMuted}}>{r.stories} stories</div>
                <div style={{height:heights[i],background:`linear-gradient(180deg,${colors[i]}33,${colors[i]}11)`,border:`2px solid ${colors[i]}55`,borderRadius:'8px 8px 0 0',width:'100%',display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:8}}>
                  <span style={{fontSize:24}}>{r.badge}</span>
                </div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:13,color:colors[i]}}>#{r.rank}</div>
              </div>
            );
          })}
        </div>
        {/* Full list */}
        {reporters.map((r,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,background:i<3?`rgba(${i===0?'245,158,11':i===1?'170,170,170':'205,127,50'},0.08)`:T.navy3,borderRadius:12,padding:'12px 14px',marginBottom:8,border:`1px solid ${i<3?`rgba(${i===0?'245,158,11':i===1?'170,170,170':'205,127,50'},0.2)`:'rgba(255,255,255,0.05)'}`}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:i===0?T.gold:i===1?'#aaa':i===2?'#cd7f32':T.gray1,width:28,textAlign:'center',flexShrink:0}}>#{r.rank}</div>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#1a3a7a,#0a1a4a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{r.badge}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>{r.name}</div>
              <div style={{fontSize:10,color:T.textMuted}}>{r.location} · {r.specialty}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:i<3?T.gold:'white'}}>{r.stories}</div>
              <div style={{fontSize:9,color:T.textMuted}}>stories</div>
            </div>
          </div>
        ))}
        <div style={{background:'rgba(255,184,0,0.06)',border:`1px solid rgba(255,184,0,0.15)`,borderRadius:12,padding:'14px',marginBottom:20,textAlign:'center'}}>
          <div style={{fontSize:12,color:T.gold,fontWeight:600}}>Upload more stories to climb the leaderboard!</div>
          <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>Rankings reset on 1st of every month</div>
        </div>
      </div>
    </div>
  );
}


export { LeaderboardScreen };
export default LeaderboardScreen;
