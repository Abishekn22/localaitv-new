import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import Logo from './../components/Logo.jsx';

function SplashScreen({ onDone }) {
  // Video-based splash that auto-starts on open — no tap required. Browsers
  // allow muted autoplay unconditionally but block unmuted autoplay without a
  // user gesture, so we first try to play WITH sound and silently fall back to
  // muted autoplay if that's rejected. Either way the intro starts on its own
  // and advances when it ends; a safety timeout guards against a stalled video.
  //
  // The splash MP4 carries its own composed audio (per Mohan's intro spec);
  // the procedural Web Audio synth that was briefly layered in PR #37 has
  // been removed in favour of the video's built-in soundtrack.
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) { onDone(); return; }
    let cancelled = false;
    let cleanup = null;

    // Auto-start immediately — no tap gate. Prefer sound; if the browser
    // blocks unmuted autoplay, play muted right away (intro still runs) and
    // unmute on the first interaction anywhere, so music kicks in the moment
    // the user touches the screen — without any "Tap to Start" button.
    v.muted = false;
    Promise.resolve(v.play()).catch(() => {
      if (cancelled) return;
      v.muted = true;
      v.play().catch(() => {});
      const unmute = () => { v.muted = false; v.play().catch(() => {}); };
      window.addEventListener('pointerdown', unmute, { once: true });
      window.addEventListener('keydown', unmute, { once: true });
      cleanup = () => {
        window.removeEventListener('pointerdown', unmute);
        window.removeEventListener('keydown', unmute);
      };
    });

    const safety = setTimeout(() => onDone(), 20000);
    return () => { cancelled = true; clearTimeout(safety); if (cleanup) cleanup(); };
  }, []);

  return (
    <div
      style={{
        width:'100%', height:'100%', overflow:'hidden', position:'relative',
        background:'#000',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
      <video
        ref={videoRef}
        src="splash-intro.mp4"
        autoPlay
        playsInline
        preload="auto"
        onEnded={() => onDone()}
        onError={() => onDone()}
        style={{
          width:'75%', height:'75%', objectFit:'contain',
          display:'block', background:'#000',
        }}
      />
    </div>
  );
}

// ── (old animated-pin splash retired in favour of an MP4 intro) ─────
function _RetiredSplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 4200);
    return () => clearTimeout(t);
  }, []);

  const CSS = `
    @keyframes pinDrop {
      0%   { opacity:0; transform:translateY(-120px) scale(0.7); }
      60%  { opacity:1; transform:translateY(12px) scale(1.04); }
      75%  { transform:translateY(-6px) scale(0.98); }
      88%  { transform:translateY(5px) scale(1.01); }
      100% { transform:translateY(0) scale(1); }
    }
    @keyframes ringExpand {
      0%   { transform:scale(0.2); opacity:0.9; }
      100% { transform:scale(1); opacity:0; }
    }
    @keyframes groundGlow {
      0%,100% { opacity:0.5; transform:scaleX(1); }
      50%      { opacity:0.9; transform:scaleX(1.12); }
    }
    @keyframes pinGlow {
      0%,100% { filter:drop-shadow(0 0 18px rgba(208,2,27,0.5)); }
      50%      { filter:drop-shadow(0 0 38px rgba(208,2,27,0.9)); }
    }
    @keyframes splashSlideUp {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes splashFadeIn {
      from { opacity:0; } to { opacity:1; }
    }
    @keyframes splashTagline {
      0%   { opacity:0; letter-spacing:10px; }
      100% { opacity:1; letter-spacing:2.5px; }
    }
    @keyframes splashBar {
      from { width:0%; } to { width:100%; }
    }
    @keyframes starTwinkle {
      0%,100% { opacity:var(--op); }
      50%     { opacity:calc(var(--op)*0.25); }
    }
    @keyframes liveBlink {
      0%,100% { opacity:1; } 50% { opacity:0.1; }
    }
  `;

  const stars = Array.from({length:28},(_,i)=>({
    x:(i*137.5)%100, y:(i*97.3)%100,
    s:i%6===0?2.2:i%3===0?1.6:1,
    op:0.12+(i%5)*0.1,
    dur:1.5+(i%4)*0.7, del:(i*0.22)%3,
  }));

  // 4 expanding ring delays
  const rings = [0.85, 1.15, 1.45, 1.75];

  return (
    <div style={{
      width:'100%', height:'100%', overflow:'hidden', position:'relative',
      background:'linear-gradient(180deg,#020510 0%,#050c1e 40%,#030814 100%)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    }}>
      <style>{CSS}</style>

      {/* Stars */}
      {stars.map((st,i)=>(
        <div key={i} style={{
          position:'absolute', left:`${st.x}%`, top:`${st.y}%`,
          width:st.s, height:st.s, borderRadius:'50%',
          background:`rgba(200,220,255,${st.op})`,
          '--op': st.op,
          animation:`starTwinkle ${st.dur}s ${st.del}s ease-in-out infinite`,
        }}/>
      ))}

      {/* Blue floor glow */}
      <div style={{
        position:'absolute', bottom:'26%', left:'50%',
        transform:'translateX(-50%)',
        width:340, height:60,
        background:'radial-gradient(ellipse,rgba(30,100,255,0.28) 0%,transparent 70%)',
        animation:'groundGlow 2.2s 1s ease-in-out infinite',
        pointerEvents:'none',
      }}/>

      {/* Expanding rings at pin base */}
      {rings.map((del,i)=>(
        <div key={i} style={{
          position:'absolute', bottom:'29%', left:'50%',
          transform:'translateX(-50%)',
          width:90+(i*18), height:90+(i*18),
          marginLeft:-(45+(i*9)), marginBottom:-(45+(i*9)),
          borderRadius:'50%',
          border:`${2-i*0.3}px solid rgba(43,127,255,${0.7-i*0.12})`,
          boxShadow:`0 0 12px rgba(43,127,255,${0.35-i*0.06})`,
          animation:`ringExpand 1.4s ${del}s ease-out infinite`,
          pointerEvents:'none',
        }}/>
      ))}

      {/* ── The big location pin ── */}
      <div style={{
        zIndex:5, position:'relative',
        marginBottom:30,
        animation:'pinDrop 0.9s 0.2s cubic-bezier(0.22,1,0.36,1) both, pinGlow 2s 1.2s ease-in-out infinite',
      }}>
        <svg width={160} height={220} viewBox="0 0 68 100" fill="none"
          style={{display:'block',filter:'drop-shadow(0 8px 32px rgba(208,2,27,0.55))'}}>
          <defs>
            <radialGradient id="spPinB" cx="36%" cy="22%" r="68%">
              <stop offset="0%"  stopColor="#FF5555"/>
              <stop offset="38%" stopColor="#E8001E"/>
              <stop offset="100%" stopColor="#7A0010"/>
            </radialGradient>
            <radialGradient id="spPinS" cx="28%" cy="16%" r="48%">
              <stop offset="0%"  stopColor="rgba(255,255,255,0.55)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
            <radialGradient id="spHole" cx="38%" cy="32%" r="55%">
              <stop offset="0%"  stopColor="#1a0005"/>
              <stop offset="100%" stopColor="#0a0002"/>
            </radialGradient>
          </defs>
          {/* Pin body */}
          <path d="M34 2C15.8 2 2 16.2 2 31C2 54 34 98 34 98C34 98 66 54 66 31C66 16.2 52.2 2 34 2Z"
            fill="url(#spPinB)"/>
          {/* Gloss overlay */}
          <path d="M34 2C15.8 2 2 16.2 2 31C2 54 34 98 34 98C34 98 66 54 66 31C66 16.2 52.2 2 34 2Z"
            fill="url(#spPinS)"/>
          {/* Inner dark circle */}
          <circle cx="34" cy="30" r="14" fill="url(#spHole)"/>
          {/* Inner circle rim glow */}
          <circle cx="34" cy="30" r="14" fill="none"
            stroke="rgba(255,80,80,0.3)" strokeWidth="1.5"/>
        </svg>

        {/* Shadow under pin tip */}
        <div style={{
          position:'absolute', bottom:-8, left:'50%',
          transform:'translateX(-50%)',
          width:24, height:8, borderRadius:'50%',
          background:'rgba(0,0,0,0.5)',
          filter:'blur(4px)',
        }}/>
      </div>

      {/* ── Logo ── */}
      <div style={{
        zIndex:5,
        animation:'splashSlideUp 0.55s 1.1s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <Logo size="xl" dark={true}/>
      </div>

      {/* ── Gold separator ── */}
      <div style={{
        display:'flex', alignItems:'center', gap:10, marginTop:10, zIndex:5,
        animation:'splashFadeIn 0.5s 1.5s both',
      }}>
        <div style={{width:50,height:1.5,background:'linear-gradient(90deg,transparent,rgba(255,184,0,0.8))'}}/>
        <div style={{width:5,height:5,borderRadius:'50%',background:'#FFB800'}}/>
        <div style={{width:50,height:1.5,background:'linear-gradient(90deg,rgba(255,184,0,0.8),transparent)'}}/>
      </div>

      {/* ── Tagline ── */}
      <div style={{
        marginTop:10, zIndex:5,
        fontFamily:"'Barlow Condensed',sans-serif",
        fontWeight:700, fontSize:12,
        color:'rgba(180,200,255,0.7)',
        textTransform:'uppercase',
        animation:'splashTagline 0.9s 1.7s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        India's First AI Hyperlocal News
      </div>

      {/* ── LIVE badge ── */}
      <div style={{
        marginTop:14, zIndex:5,
        display:'flex', alignItems:'center', gap:6,
        background:'rgba(208,2,27,0.1)',
        border:'1px solid rgba(208,2,27,0.3)',
        borderRadius:20, padding:'5px 16px',
        animation:'splashFadeIn 0.5s 2.0s both',
      }}>
        <div style={{
          width:7,height:7,borderRadius:'50%',background:'#D0021B',flexShrink:0,
          animation:'liveBlink 0.85s 2.0s ease-in-out infinite',
        }}/>
        <span style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:800, fontSize:11, letterSpacing:2.5,
          color:'#FF3344', textTransform:'uppercase',
        }}>Live · Breaking · Hyperlocal</span>
      </div>

      {/* ── AP + TG ── */}
      <div style={{
        marginTop:10, display:'flex', gap:8, zIndex:5,
        animation:'splashFadeIn 0.5s 2.2s both',
      }}>
        {['Andhra Pradesh','Telangana'].map(s=>(
          <div key={s} style={{
            background:'rgba(43,127,255,0.1)',
            border:'1px solid rgba(43,127,255,0.28)',
            borderRadius:10, padding:'3px 12px',
            fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:700, fontSize:10,
            color:'rgba(110,170,255,0.8)', letterSpacing:1,
          }}>{s}</div>
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div style={{
        position:'absolute', bottom:42, left:0, right:0,
        display:'flex', flexDirection:'column', alignItems:'center', gap:7,
        zIndex:10, animation:'splashFadeIn 0.4s 0.4s both',
      }}>
        <div style={{width:130,height:2,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden'}}>
          <div style={{
            height:'100%', borderRadius:2,
            background:'linear-gradient(90deg,#D0021B,#FFB800)',
            animation:'splashBar 3.8s 0.4s linear forwards',
          }}/>
        </div>
        <div style={{
          fontSize:9, color:'rgba(130,150,180,0.5)',
          letterSpacing:3, textTransform:'uppercase',
          fontFamily:"'Barlow Condensed',sans-serif", fontWeight:600,
        }}>Loading local news…</div>
      </div>

    </div>
  );
}


export { SplashScreen };
export default SplashScreen;
