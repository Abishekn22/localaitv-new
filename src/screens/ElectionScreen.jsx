import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function ElectionScreen({ onBack, constituency }) {
  const FALLBACK = {
    constituency: constituency || 'Kurnool',
    mla: { name:'Sri Bhumana Karunakar Reddy', party:'TDP', since:'2024', emoji:'🏛️' },
    mp:  { name:'Sri S. Bhagya Reddy', party:'TDP', since:'2024', emoji:'🇮🇳' },
    last: { year:2024, results:[
      { party:'TDP',   candidate:'Bhumana Karunakar Reddy', votes:'92,456', pct:'48.2%', won:true  },
      { party:'YSRCP', candidate:'G. Srinivasulu',          votes:'81,234', pct:'42.4%', won:false },
      { party:'JSP',   candidate:'K. Satya Narayana',       votes:'11,240', pct:'5.9%',  won:false },
      { party:'BJP',   candidate:'P. Ramaiah',              votes:'6,890',  pct:'3.5%',  won:false },
    ]},
    nextElection:'April 2029', totalVoters:'2,14,820',
    maleVoters:'1,08,340', femaleVoters:'1,06,480', boothCount:'287',
  };
  const { data } = useAPI(
    () => apiCall(`/election?constituency=${encodeURIComponent(constituency||'Kurnool')}`),
    FALLBACK,
    [constituency]
  );
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#1a0a3a,#3a1a6a)',padding:'48px 18px 16px',flexShrink:0}}>
        <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',marginBottom:10}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>🗳️ Election Dashboard</div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>{data.constituency} Constituency</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {/* Current representatives */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.textMuted,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Current Representatives</div>
        {[{label:'MLA · శాసన సభ్యుడు',d:data.mla},{label:'MP · పార్లమెంటు సభ్యుడు',d:data.mp}].map(r=>(
          <div key={r.label} style={{background:T.bg3,borderRadius:14,padding:'14px 16px',marginBottom:10,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:12,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#3a1a6a,#1a0a3a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{r.d.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:10,color:T.textMuted,marginBottom:2}}>{r.label}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text}}>{r.d.name}</div>
              <div style={{fontSize:11,color:T.teal,marginTop:2}}>{r.d.party} · Since {r.d.since}</div>
            </div>
          </div>
        ))}
        {/* Voter stats */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.textMuted,letterSpacing:1,textTransform:'uppercase',marginBottom:10,marginTop:6}}>Voter Statistics</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {[
            {l:'Total Voters',v:data.totalVoters,c:T.gold},
            {l:'Total Booths',v:data.boothCount,c:T.teal},
            {l:'Male Voters',v:data.maleVoters,c:'#60a5fa'},
            {l:'Female Voters',v:data.femaleVoters,c:'#f472b6'},
          ].map(s=>(
            <div key={s.l} style={{background:T.bg3,borderRadius:10,padding:'12px',border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:s.c}}>{s.v}</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Last election results */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.textMuted,letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Last Election {data.last.year} Results</div>
        {data.last.results.map((r,i)=>(
          <div key={i} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:r.won?T.gold:'white'}}>{r.party}</span>
                {r.won&&<span style={{background:T.gold,color:T.navy,fontSize:8,fontWeight:800,padding:'1px 6px',borderRadius:4}}>WON ✓</span>}
              </div>
              <span style={{fontSize:12,fontWeight:700,color:r.won?T.gold:T.gray1}}>{r.pct} · {r.votes}</span>
            </div>
            <div style={{height:6,background:T.bg3,borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:r.pct,background:r.won?T.gold:'rgba(255,255,255,0.3)',borderRadius:3}}/>
            </div>
            <div style={{fontSize:10,color:T.textMuted,marginTop:3}}>{r.candidate}</div>
          </div>
        ))}
        {/* Next election countdown */}
        <div style={{background:'rgba(255,184,0,0.08)',border:`1px solid rgba(255,184,0,0.2)`,borderRadius:12,padding:'14px',marginBottom:20,textAlign:'center'}}>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>Next Election Expected</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.gold}}>{data.nextElection}</div>
        </div>
      </div>
    </div>
  );
}


export { ElectionScreen };
export default ElectionScreen;
