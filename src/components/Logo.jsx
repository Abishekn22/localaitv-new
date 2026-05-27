import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

// ── LOGO COMPONENT — matches official LocalAI TV logo ─────────
// Image: White card → "L" black + 📍 red pin + "calAI" (Local black, AI dark blue)
// App icon: Red rounded square + satellite dish
function Logo({ size = 'md', dark = false, showTV = true }) {
  const sizes = {
    xs:  { h:22, local:12, ai:14, tv:12, pinH:16, gap:1.5 },
    sm:  { h:32, local:18, ai:20, tv:16, pinH:22, gap:2   },
    smx: { h:43, local:24, ai:26, tv:22, pinH:30, gap:3.0 },  // +20%
    md:  { h:44, local:26, ai:28, tv:22, pinH:32, gap:3   },
    lg:  { h:60, local:36, ai:40, tv:30, pinH:44, gap:4   },
    xl:  { h:78, local:48, ai:52, tv:40, pinH:58, gap:5   },
  };
  const s = sizes[size] || sizes.md;
  const pinW = s.pinH * 0.68;

  return (
    <div style={{
      display:'inline-flex', alignItems:'center',
      gap: s.gap, lineHeight:1, position:'relative',
      padding: size==='xs'?'2px 4px':size==='sm'||size==='smx'?'3px 6px':'4px 8px',
    }}>

      {/* ── "Local" — black bold, red 3D pin replaces 'o' ── */}
      <div style={{display:'inline-flex',alignItems:'center',gap:0}}>

        {/* L */}
        <span style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:900, fontSize:s.local, lineHeight:1,
          color: dark ? '#FFFFFF' : '#0a0a0a',
          letterSpacing:-0.5,
        }}>L</span>

        {/* Red 3D location pin — replaces 'o' */}
        <svg width={pinW} height={s.pinH} viewBox="0 0 68 100" fill="none"
          style={{display:'block', marginBottom: s.pinH * 0.06, flexShrink:0}}>
          <defs>
            <radialGradient id="pinB2" cx="36%" cy="25%" r="65%">
              <stop offset="0%" stopColor="#FF6060"/>
              <stop offset="40%" stopColor="#E8001E"/>
              <stop offset="100%" stopColor="#8B0010"/>
            </radialGradient>
            <radialGradient id="pinS2" cx="28%" cy="18%" r="45%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
          </defs>
          {/* Pin teardrop body */}
          <path d="M34 3C16 3 3 17 3 31C3 53 34 97 34 97C34 97 65 53 65 31C65 17 52 3 34 3Z"
            fill="url(#pinB2)"/>
          <path d="M34 3C16 3 3 17 3 31C3 53 34 97 34 97C34 97 65 53 65 31C65 17 52 3 34 3Z"
            fill="url(#pinS2)"/>
          {/* White circle hole */}
          <circle cx="34" cy="30" r="13" fill="white"/>
          {/* Blue ripple rings at base */}
          <ellipse cx="34" cy="96" rx="18" ry="4" fill="none"
            stroke="#3B8FFF" strokeWidth="1.8" opacity="0.7"/>
          <ellipse cx="34" cy="96" rx="27" ry="6" fill="none"
            stroke="#3B8FFF" strokeWidth="1.2" opacity="0.4"/>
          <ellipse cx="34" cy="96" rx="36" ry="8" fill="none"
            stroke="#3B8FFF" strokeWidth="0.8" opacity="0.2"/>
        </svg>

        {/* cal */}
        <span style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:900, fontSize:s.local, lineHeight:1,
          color: dark ? '#FFFFFF' : '#0a0a0a',
          letterSpacing:-0.5,
        }}>cal</span>
      </div>

      {/* ── "AI" — blue gradient + cyan sparkle stars ── */}
      <div style={{position:'relative', display:'inline-flex', alignItems:'center'}}>
        {/* Sparkle stars — top right of AI */}
        {size !== 'xs' && (
          <>
            <svg width={s.ai*0.45} height={s.ai*0.45}
              viewBox="0 0 24 24"
              style={{position:'absolute', top:-s.ai*0.5, right:-s.ai*0.3, pointerEvents:'none'}}
              fill="#00CFFF">
              <path d="M12 2l1.5 7.5L21 11l-7.5 1.5L12 20l-1.5-7.5L3 11l7.5-1.5z"/>
            </svg>
            <svg width={s.ai*0.28} height={s.ai*0.28}
              viewBox="0 0 24 24"
              style={{position:'absolute', top:-s.ai*0.2, right:-s.ai*0.55, pointerEvents:'none'}}
              fill="#00CFFF">
              <path d="M12 2l1.5 7.5L21 11l-7.5 1.5L12 20l-1.5-7.5L3 11l7.5-1.5z"/>
            </svg>
          </>
        )}
        <span style={{
          fontFamily:"'Barlow Condensed',sans-serif",
          fontWeight:900, fontSize:s.ai, letterSpacing:-0.5, lineHeight:1,
          background:'linear-gradient(170deg,#60D0FF 0%,#3B8FFF 45%,#1A3FCC 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>AI</span>
      </div>

      {/* ── "TV" — white bold on dark navy, blue glowing border ── */}
      {showTV && (
        <div style={{
          display:'inline-flex', alignItems:'center', justifyContent:'center',
          borderRadius: size==='xs'?5:size==='sm'||size==='smx'?7:10,
          padding:`${s.gap*0.35}px ${s.gap*0.9}px`,
          background:'linear-gradient(160deg,#0a1a3a 0%,#050d20 100%)',
          border:`${Math.max(2, s.ai*0.09)}px solid #2B7FFF`,
          boxShadow:`0 0 ${s.ai*0.5}px rgba(43,127,255,0.7), 0 0 ${s.ai*0.25}px rgba(100,180,255,0.5), inset 0 1px 0 rgba(100,180,255,0.15)`,
          flexShrink:0,
        }}>
          <span style={{
            fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:900, fontSize:s.tv,
            color: dark ? '#FFFFFF' : '#0a0a0a',
            letterSpacing:1.5, lineHeight:1,
          }}>TV</span>
        </div>
      )}
    </div>
  );
}



export { Logo };
export default Logo;
