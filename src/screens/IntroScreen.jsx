import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import Logo from './../components/Logo.jsx';

function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // 0=logo, 1=tagline, 2=map, 3=stats, 4=done
  useEffect(() => {
    const timings = [800, 1400, 1800, 1600];
    let t = 0;
    timings.forEach((ms, i) => {
      t += ms;
      setTimeout(() => setPhase(i + 1), t);
    });
    setTimeout(onDone, t + 600);
  }, []);

  const states = ['AP','TG','KA','TN','MH','UP','WB','GJ','RJ','MP','OR','KL'];
  return (
    <div style={{width:'100%',height:'100%',background:'#020408',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',overflow:'hidden',position:'relative'}}>
      {/* Background grid lines */}
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(208,2,27,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(208,2,27,0.05) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>

      {/* Phase 0+1 — Logo */}
      {phase >= 0 && (
        <div style={{
          textAlign:'center', animation:'fadeIn 0.6s ease',
          position:'relative', zIndex:2,
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          gap:18, width:'100%',
        }}>
          <Logo size="xl" dark={false} showTV={true}/>
        </div>
      )}

      {/* Phase 2 — India map visual */}
      {phase >= 2 && (
        <div style={{position:'absolute',display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center',width:260,top:'50%',left:'50%',transform:'translate(-50%,-50%)',opacity:0.15,animation:'fadeIn 0.5s ease'}}>
          {states.map((s,i)=>(
            <div key={i} style={{background:T.red,borderRadius:4,padding:'3px 8px',fontSize:10,fontWeight:800,letterSpacing:1,animationDelay:`${i*0.1}s`}}>{s}</div>
          ))}
        </div>
      )}

      {/* Phase 3 — Stats counter */}
      {phase >= 3 && (
        <div style={{position:'absolute',bottom:100,display:'flex',gap:32,animation:'slideUp 0.5s ease',zIndex:3}}>
          {[
            {n:'4,120',l:'Constituencies'},
            {n:'294',l:'AP + TG First'},
            {n:'24×7',l:'Live TV'},
          ].map(s=>(
            <div key={s.l} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:T.gold,letterSpacing:1}}>{s.n}</div>
              <div style={{fontSize:9,color:T.textMuted,letterSpacing:1,textTransform:'uppercase'}}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Phase 4 — "Starting" */}
      {phase >= 4 && (
        <div style={{position:'absolute',bottom:60,animation:'fadeIn 0.4s ease',zIndex:3}}>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:T.teal,letterSpacing:2,textTransform:'uppercase'}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:T.teal,animation:'blink 0.5s infinite'}}/>
            Connecting your constituency…
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WOW FACTOR 4 — REVENUE DASHBOARD SCREEN
// ══════════════════════════════════════════════════════════════

export { IntroScreen };
export default IntroScreen;
