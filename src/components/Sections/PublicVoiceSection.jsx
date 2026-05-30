import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, safeImageUrl, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import KurnoolShortsScreen from './../../screens/KurnoolShortsScreen.jsx';
import SectionAccentBar from './../SectionAccentBar.jsx';

function PublicVoiceSection({ onNavigate, channel }) {
  const { T } = useAppTheme();
  const scrollerRef    = useRef(null);
  const touchingRef    = useRef(false);
  const lastTouchEndAt = useRef(0);
  const lastTickAt     = useRef(0);
  const initialisedRef = useRef(false);

  const items = CLASSIFIEDS.filter(c => c.cat === 'Public Voice');
  if (items.length === 0) return null;

  const CARD_W = 116;                  // 108 + marginRight:8
  const cycleW = items.length * CARD_W;
  const looped = [...items, ...items, ...items];   // 3 copies

  function openCard(item) {
    // Route Public Voice into the Mana Kurnool Shorts viewer
    // (KurnoolShortsScreen) instead of the image-based classifieds
    // viewer. The mapper publicVoiceToShortShape transforms each pv
    // item to the SHORT_NEWS shape so the viewer renders identically
    // to "మన కర్నూలు షార్ట్స్".
    if (typeof window !== 'undefined' && item && item.id) {
      window.__publicVoiceStartId = item.id;
    }
    onNavigate && onNavigate('publicvoicefeed');
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Park scroll position in the middle copy on first mount so the user
    // can freely swipe left and right by a whole copy before we wrap.
    if (!initialisedRef.current) {
      el.scrollLeft = cycleW;
      initialisedRef.current = true;
    }

    let raf;
    const SPEED = 28; // px / sec — calm reels-like pace
    const tick = (t) => {
      if (!el) { raf = requestAnimationFrame(tick); return; }
      if (lastTickAt.current === 0) lastTickAt.current = t;
      const dt = Math.min(0.1, (t - lastTickAt.current) / 1000);
      lastTickAt.current = t;

      // Auto-nudge only when the user is fully idle (touch released for >1s
      // so native momentum has finished). Otherwise let native scroll run.
      const idleMs = performance.now() - lastTouchEndAt.current;
      if (!touchingRef.current && idleMs > 1000) {
        el.scrollLeft += SPEED * dt;
      }

      // Buffer-zone wrap: when scrollLeft drifts past the middle copy in
      // either direction, snap by exactly cycleW. Visually identical pixels
      // (because the copies are duplicates), so the snap is invisible — and
      // it never happens near where the user's finger is right now.
      if (el.scrollLeft >= 2 * cycleW)      el.scrollLeft -= cycleW;
      else if (el.scrollLeft < cycleW * 0.5) el.scrollLeft += cycleW;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cycleW]);

  // Touch / mouse — purely for tracking idle state; native scroll handles motion.
  const onTouchStart = () => { touchingRef.current = true; };
  const onTouchEnd   = () => { touchingRef.current = false; lastTouchEndAt.current = performance.now(); };

  return (
    <div style={{ background:T.bg }}>
      {/* Header — Phase 5.5: shared accent bar primitive */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px 10px', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, minWidth:0 }}>
          <SectionAccentBar/>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, minWidth:0 }}>
            <span style={{ fontFamily:"'Noto Sans Telugu',sans-serif", fontWeight:800,
              fontSize:16, color:T.text }}>
              {channel ? channel.name : 'కర్నూలు'}
            </span>
            <span style={{
              fontFamily:"'Noto Sans Telugu',sans-serif", fontWeight:900,
              fontSize:17, letterSpacing:0.3,
              background:'linear-gradient(135deg,#DC2626,#F97316)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>పబ్లిక్ వాయిస్</span>
          </div>
        </div>
        <span onClick={openCard}
          style={{ fontSize:11, color:T.red, fontWeight:600, cursor:'pointer', flexShrink:0 }}>See all →</span>
      </div>

      {/* Native horizontal scroller. Auto-nudge + manual swipe coexist. */}
      <div
        ref={scrollerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        onMouseLeave={onTouchEnd}
        style={{
          display:'flex',
          padding:'0 16px 14px',
          overflowX:'auto',
          overflowY:'hidden',
          scrollbarWidth:'none',
          msOverflowStyle:'none',
          WebkitOverflowScrolling:'touch',
          overscrollBehaviorX:'contain',
        }}>
        {looped.map((s, i) => (
          <div key={`pv-${i}`} onClick={() => openCard(s)}
            style={{ flexShrink:0, width:108, marginRight:8, cursor:'pointer', position:'relative' }}>
            {/* Clean 9:16 thumbnail — prefers the generated bulletin video
                (cl.videos[0]) when present; falls back to uploader-provided
                image; play badge shown when a playable media URL exists. */}
            <div style={{ width:108, height:192, borderRadius:10, overflow:'hidden',
              background:'#111', position:'relative' }}>
<<<<<<< Updated upstream
              <img
                src={safeImageUrl((s.images && s.images[0]) || s.thumbnail)}
                alt={s.title}
                draggable={false}
                style={{ width:'100%', height:'100%', objectFit:'cover',
                  pointerEvents:'none' }}
                onError={e => { e.target.style.opacity = '0.25'; }}
              />
=======
              {Array.isArray(s.videos) && s.videos[0] ? (
                <video
                  src={s.videos[0]}
                  poster={(s.images && s.images[0]) || s.thumbnail || ''}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={{ width:'100%', height:'100%', objectFit:'cover',
                    pointerEvents:'none', background:'#000' }}
                />
              ) : (
                <img
                  src={(s.images && s.images[0]) || s.thumbnail || ''}
                  alt={s.title}
                  draggable={false}
                  style={{ width:'100%', height:'100%', objectFit:'cover',
                    pointerEvents:'none' }}
                  onError={e => { e.target.style.opacity = '0.25'; }}
                />
              )}
>>>>>>> Stashed changes
              {/* Play icon overlay — shown when the item has a playable video */}
              {(s.mediaUrl || s.video_url) && (
                <div style={{ position:'absolute', inset:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  pointerEvents:'none' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%',
                    background:'rgba(255,255,255,0.88)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.35)' }}>
                    <div style={{ width:0, height:0, marginLeft:2,
                      borderTop:'6px solid transparent',
                      borderBottom:'6px solid transparent',
                      borderLeft:'9px solid #1A237E' }}/>
                  </div>
                </div>
              )}
            </div>
            {/* Issue name below */}
            <div style={{ marginTop:6, fontSize:10.5, fontWeight:700, lineHeight:1.3,
              color:T.text, fontFamily:"'Noto Sans Telugu',sans-serif",
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              overflow:'hidden' }}>
              {s.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export { PublicVoiceSection };
export default PublicVoiceSection;
