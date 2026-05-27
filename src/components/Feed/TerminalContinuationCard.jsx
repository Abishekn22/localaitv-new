import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function TerminalContinuationCard({ type, title }) {
  // Type-aware Telugu — keeps the moment authentic to the content type
  const teByType = {
    shorts:      'మరిన్ని Shorts త్వరలో',
    bulletins:   'మరిన్ని ప్రసారాలు త్వరలో',
    classifieds: 'మరిన్ని listings త్వరలో',
    news:        'మరిన్ని వార్తలు త్వరలో',
  };
  const teLine = teByType[type] || teByType.news;

  return (
    <div style={{
      width:'100%', height:'100%', position:'relative',
      background:'#000', overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'40px 28px',
    }}>
      {/* Ambient halo — reuses the Phase-3 broadcast hero language.
          Two desync layers (4.2s + 5.7s) to match the live-player feel. */}
      <div className="ott-halo" style={{
        position:'absolute', inset:'18% 12%',
        borderRadius:'50%',
        background:'radial-gradient(ellipse at center, rgba(225,29,72,0.22) 0%, rgba(225,29,72,0.08) 50%, transparent 75%)',
        filter:'blur(34px)',
        pointerEvents:'none',
      }}/>
      <div className="ott-halo2" style={{
        position:'absolute', inset:'24% 18%',
        borderRadius:'50%',
        background:'radial-gradient(ellipse at center, rgba(225,29,72,0.14) 0%, rgba(225,29,72,0.05) 55%, transparent 80%)',
        filter:'blur(42px)',
        pointerEvents:'none',
      }}/>

      {/* Centered content stack */}
      <div style={{
        position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:14, maxWidth:340, textAlign:'center',
      }}>
        {/* Eyebrow — identity continuity with live AI ribbon */}
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div className="ott-ai-pulse" style={{
            width:7, height:7, borderRadius:'50%',
            background:OTT.color.red,
          }}/>
          <span style={{
            fontFamily:OTT.type.mono.font, fontSize:10.5, fontWeight:900,
            color:'#fff', letterSpacing:2.2, textTransform:'uppercase',
          }}>The&nbsp;Network&nbsp;Continues</span>
        </div>

        {/* Big Telugu — the emotional anchor */}
        <div style={{
          fontFamily:OTT.type.te.font, fontSize:26, fontWeight:800,
          color:'#fff', lineHeight:1.32, letterSpacing:0.3,
          textShadow:'0 2px 18px rgba(225,29,72,0.32)',
          marginTop:6,
        }}>{teLine}</div>

        {/* English subtitle — softer, sets the mood */}
        <div style={{
          fontFamily:OTT.type.body.font, fontSize:13, fontWeight:500,
          color:'rgba(255,255,255,0.62)', lineHeight:1.5,
          letterSpacing:0.15, maxWidth:300,
        }}>
          The network continues beyond this rail.
          {title ? <><br/>More from <span style={{color:'rgba(255,255,255,0.82)', fontWeight:700}}>{title}</span> is on the way.</> : null}
        </div>

        {/* Hairline separator + wordmark — restrained closure */}
        <div style={{
          marginTop:22, paddingTop:18,
          borderTop:'1px solid rgba(255,255,255,0.10)',
          display:'flex', alignItems:'center', gap:8,
        }}>
          <span style={{
            fontFamily:OTT.type.mono.font, fontSize:9, fontWeight:800,
            color:'rgba(255,255,255,0.42)', letterSpacing:2.0, textTransform:'uppercase',
          }}>LocalAI&nbsp;TV</span>
          <span style={{
            width:3, height:3, borderRadius:'50%',
            background:'rgba(255,255,255,0.22)',
          }}/>
          <span style={{
            fontFamily:OTT.type.mono.font, fontSize:9, fontWeight:700,
            color:'rgba(255,184,0,0.65)', letterSpacing:1.6, textTransform:'uppercase',
          }}>AI&nbsp;Curated</span>
        </div>

        {/* Subtle swipe-down hint — appears, doesn't shout */}
        <div style={{
          marginTop:8,
          fontFamily:OTT.type.body.font, fontSize:10.5, fontWeight:500,
          color:'rgba(255,255,255,0.32)', letterSpacing:0.4,
        }}>
          ↓&nbsp;&nbsp;swipe down to revisit
        </div>
      </div>
    </div>
  );
}

export { TerminalContinuationCard };
export default TerminalContinuationCard;
