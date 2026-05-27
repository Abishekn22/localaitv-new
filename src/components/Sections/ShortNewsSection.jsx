import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import KurnoolShortsScreen from './../../screens/KurnoolShortsScreen.jsx';
import SectionAccentBar from './../SectionAccentBar.jsx';
import { sortShortsForFeed } from './../Feed/UnifiedFeedViewer.jsx';

// ── SHORT NEWS SECTION COMPONENT (with auto-scroll) ─────────
// `items` (optional) — live incident-derived shorts from /api/incidents,
// mapped by the parent (HomeScreen) into the SHORT_NEWS shape. When null /
// empty the section falls back to the bundled SHORT_NEWS demo set.
function ShortNewsSection({ channel, items: liveItems }) {
  const { T } = useAppTheme();
  const [openIdx,    setOpenIdx]    = useState(null);
  const [showFeed,   setShowFeed]   = useState(false);
  const scrollRef  = useRef(null);
  const [paused, setPaused] = useState(false);

  // Auto-scroll strip
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const iv = setInterval(() => {
      if (!el || paused) return;
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      else el.scrollLeft += 1;
    }, 30);
    return () => clearInterval(iv);
  }, [paused]);

  const source = (Array.isArray(liveItems) && liveItems.length > 0) ? liveItems : SHORT_NEWS;
  const items  = [...source, ...source];
  const total  = source.length;

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
              మన {channel ? channel.name : 'కర్నూలు'}
            </span>
            <span style={{
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900,
              fontSize:18, letterSpacing:1,
              background:'linear-gradient(135deg,#0D1B5C,#1A3FCC)', // dark navy → cobalt blue
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>Shorts</span>
          </div>
        </div>
        <span onClick={() => setOpenIdx(0)}
          style={{ fontSize:11, color:T.red, fontWeight:600, cursor:'pointer', flexShrink:0 }}>See all →</span>
      </div>

      {/* Cards — YouTube Shorts aspect ratio 9:16 ≈ width:108 height:192 */}
      <div
        ref={scrollRef}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
        style={{ display:'flex', gap:8, padding:'0 16px 14px',
          overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}
      >
        {items.map((s, i) => (
          <div key={i} onClick={() => {
              // Viewer renders items sorted by uploadedAt (newest first).
              // To open the SAME clip the user tapped, look up its position
              // in the sorted feed by id and pass that as the initial index.
              const sortedFeed = sortShortsForFeed(source);
              const realIdx = sortedFeed.findIndex(x => x.id === s.id);
              setOpenIdx(realIdx >= 0 ? realIdx : 0);
            }}
            style={{ flexShrink:0, width:108, cursor:'pointer', position:'relative' }}>
            {/* Clean 9:16 thumbnail — no text overlays, no dark gradient */}
            <div style={{ width:108, height:192, borderRadius:10, overflow:'hidden',
              background:'#111', position:'relative' }}>
              <img
                src={s.img}
                alt={s.titleEn}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => { e.target.style.opacity = '0.25'; }}
              />
              {/* Tiny LIVE indicator — pulsing red dot only, no text */}
              {s.live && (
                <div style={{ position:'absolute', top:7, left:7,
                  width:9, height:9, borderRadius:'50%',
                  background:'#D0021B',
                  boxShadow:'0 0 0 2px rgba(255,255,255,0.9), 0 0 0 3.5px rgba(208,2,27,0.35)',
                  animation:'blink 1s infinite' }}/>
              )}
            </div>
            {/* Title below thumbnail (moved from on-image overlay) */}
            <div style={{ marginTop:6, fontSize:10.5, fontWeight:700, lineHeight:1.3,
              color:T.text, fontFamily:"'Noto Sans Telugu',sans-serif",
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              overflow:'hidden' }}>
              {s.titleTe}
            </div>
          </div>
        ))}
      </div>

      {/* Unified Feed Viewer — Shorts */}
      {openIdx !== null && (
        <KurnoolShortsScreen
          rawItems={source}
          initialIdx={openIdx || 0}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </div>
  );
}

// ── KURNOOL PUBLIC VOICE SECTION — auto-scroll + manual swipe ─────
// Native horizontal scroller (so finger-swipe and momentum work normally),
// with the auto-scroll just nudging scrollLeft a few pixels per frame when
// the user is idle. The items are TRIPLED and we start in the middle copy;
// when scrollLeft drifts into the outer buffer zones we shift it by exactly
// one copy-width — because copy-N is identical to copy-N±1, that shift is
// pixel-for-pixel invisible. So the rail is genuinely endless in both
// directions and the user can swipe freely at any time.
/* ═══════════════════════════════════════════════════════════════════════
   Public Voice → Shorts-shape mapper
   ───────────────────────────────────────────────────────────────────────
   Public Voice items are user-uploaded videos. To render them in the
   Mana Kurnool Shorts viewer (KurnoolShortsScreen), we transform each
   pv item into the SHORT_NEWS shape. ONLY uploaded form data flows
   through — no static/demo channel branding, no fake view counts.
   The fullText is stripped of the trailing "📍 location · 📞 phone"
   line (already captured in dedicated fields).
   ═══════════════════════════════════════════════════════════════════════ */
function publicVoiceToShortShape(pv) {
  // Strip the trailing "\n\n📍 ..." block from desc — that info already
  // lives in pv.location / pv.phone and is rendered separately
  const cleanDesc = (pv.desc || '').split(/\n\n📍/)[0].trim();
  return {
    id:          pv.id,
    mediaUrl:    pv.mediaUrl || pv.video_url || '',
    orientation: pv.orientation || 'vertical',
    titleTe:     pv.title || '',
    titleEn:     '',
    fullText:    cleanDesc,
    channel:     'పబ్లిక్ వాయిస్',
    reporter:    pv.uploaderName || '',
    profilePhoto: pv.uploaderPhoto || '',
    location:    pv.location || '',
    category:    'Public Voice',
    views:       '',
    duration:    pv.duration || null,
    live:        false,
    uploadDate:  pv.date || '',
    uploadTime:  pv.time || '',
    img:         (pv.images && pv.images[0]) || pv.thumbnail || '',
    bg:          ['#0a0010','#3a0030'],
    uploadedAt:  pv.uploadedAt ? new Date(pv.uploadedAt) : new Date(),
  };
}

export { ShortNewsSection,publicVoiceToShortShape };
