import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, safeImageUrl, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import KurnoolShortsScreen from './../../screens/KurnoolShortsScreen.jsx';
import SectionAccentBar from './../SectionAccentBar.jsx';
import { SkeletonBox } from './../atoms.jsx';

// Some upload keys are stored by a backend bug as Windows local paths
// (e.g. "C:\Users\…\file.jpg", percent-encoded). Those never exist in S3 →
// 403/404 → black thumbnail. Drop them before they reach <video>/<img>.
function isBrokenKey(u) {
  return typeof u !== 'string' || u.includes('\\') || u.includes('%5C') || u.includes('%3A%5C');
}

// ── SHORT NEWS SECTION COMPONENT (manual scroll only) ────────
// `items` (optional) — live incident-derived shorts from /api/incidents,
// mapped by the parent (HomeScreen) into the SHORT_NEWS shape.
//
// While the first fetch is in flight we show a shimmer skeleton instead
// of the old bundled SHORT_NEWS demo set. The demo set caused a
// jarring swap on every page load (2-3 sec after mount the demo videos
// were replaced by completely different live videos in the same slots,
// which read to users as "the videos shuffled"). The skeleton avoids
// that swap — slots stay empty (clearly loading) until real data lands,
// then real videos paint into their final positions and don't move
// again until new uploads come in on the 3-minute refresh.
//
// Auto-scroll was removed per UX request — the strip is now a static
// horizontal carousel. Users swipe (mobile) or scroll (desktop) manually.
function ShortNewsSection({ channel, items: liveItems }) {
  const { T } = useAppTheme();
  const [openIdx,    setOpenIdx]    = useState(null);
  const [openItem,   setOpenItem]   = useState(null); // the exact clip tapped (resolved by identity in the viewer)
  const [showFeed,   setShowFeed]   = useState(false);
  const scrollRef  = useRef(null);

  // No fallback to demo data — render skeleton while live items load.
  const items = Array.isArray(liveItems) ? liveItems : [];
  const total = items.length;
  const loading = !Array.isArray(liveItems) || liveItems.length === 0;

  // ── Infinite circular carousel (manual scroll only — no auto-scroll) ──
  // Repeat the items so one "cycle" copy is always wider than the viewport,
  // render THREE copies, and park the scroll in the middle copy. When a swipe
  // drifts scrollLeft into an outer copy we snap it back by exactly one cycle
  // width — pixel-identical (the copies are duplicates), so the jump is
  // invisible and the rail loops endlessly in both directions. The parent
  // supplies items newest-first, and the copies preserve that order, so the
  // newest uploads always lead and the loop keeps cycling through everything.
  const CARD_W = 116; // 108 card + 8 gap
  const baseW  = total * CARD_W;
  const viewportW = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 480;
  const reps   = total ? Math.max(1, Math.ceil((viewportW + CARD_W) / baseW)) : 1;
  const unit   = [];
  for (let r = 0; r < reps; r++) unit.push(...items);
  const cycleW = unit.length * CARD_W;
  const looped = total ? [...unit, ...unit, ...unit] : [];

  const initialisedRef = useRef(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !cycleW) return;
    // Park in the MIDDLE copy on first data load so the user can swipe either way.
    if (!initialisedRef.current) { el.scrollLeft = cycleW; initialisedRef.current = true; }
  }, [cycleW]);

  // Seamless wrap on manual scroll — when scrollLeft drifts past the middle copy
  // in either direction, snap back by exactly one cycle width (invisible jump).
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || !cycleW) return;
    if (el.scrollLeft >= 2 * cycleW)       el.scrollLeft -= cycleW;
    else if (el.scrollLeft < cycleW * 0.5) el.scrollLeft += cycleW;
  };

  // First-paint state: show shimmer placeholders that match the real
  // tile geometry so there's no layout shift when real data lands.
  if (loading) return <ShortNewsSkeleton T={T} channel={channel} />;

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
        <span onClick={() => { setOpenItem(null); setOpenIdx(0); }}
          style={{ fontSize:11, color:T.red, fontWeight:600, cursor:'pointer', flexShrink:0 }}>See all →</span>
      </div>

      {/* Cards — YouTube Shorts aspect ratio 9:16 ≈ width:108 height:192.
          Static carousel — manual swipe (mobile) or scroll (desktop) only. */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{ display:'flex', gap:8, padding:'0 16px 14px',
          overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}
      >
        {looped.map((s, i) => (
          // key={s.id} (with a position-based fallback) lets React track
          // each card by identity across re-renders. When the 3-minute
          // refresh prepends new uploads, surviving cards keep the SAME
          // DOM node — their <video> element doesn't unmount/remount,
          // so playback continues uninterrupted while the card slides
          // to its new grid slot. With key={i} React would think every
          // card was different after a prepend and reload all videos.
          <div key={`${s.id ?? 'p'}-${i}`} onClick={() => {
              // looped[i] repeats the source list, so the real source index is
              // i % total. Hand the viewer the EXACT tapped object (it resolves
              // position by identity after its internal newest-first sort).
              const srcItem = items[i % total];
              setOpenItem(srcItem);
              setOpenIdx(i % total);
            }}
            style={{ flexShrink:0, width:108, cursor:'pointer', position:'relative' }}>
            {/* Clean 9:16 thumbnail — no text overlays, no dark gradient.
                Prefers a looping <video> preview when the source row has a
                generated bulletin URL (s.previewVideo); falls back to the
                uploader-provided photo. */}
            <div style={{ width:108, height:192, borderRadius:10, overflow:'hidden',
              background:'linear-gradient(135deg,#1a1a2e,#16213e)', position:'relative' }}>
              {(() => {
                // Filter out malformed S3 keys (Windows-path uploads) so a broken
                // URL can't render as a black box. Prefer a real photo poster.
                const vid = s.previewVideo && !isBrokenKey(s.previewVideo) ? s.previewVideo : null;
                const poster = s.img && !isBrokenKey(s.img) ? safeImageUrl(s.img) : null;
                return vid ? (
                  <video
                    // "#t=0.1" forces the browser to seek to the first frame and
                    // paint it immediately, so the card shows real content instead
                    // of a blank/black frame while autoplay spins up.
                    src={vid + '#t=0.1'}
                    poster={poster || undefined}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={{ width:'100%', height:'100%', objectFit:'cover', background:'#000' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <img
                    src={poster || s.img}
                    alt={s.titleEn}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.style.opacity = '0.25'; }}
                  />
                );
              })()}
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
          rawItems={items}
          initialItem={openItem}
          initialIdx={openIdx || 0}
          onClose={() => { setOpenIdx(null); setOpenItem(null); }}
        />
      )}
    </div>
  );
}

// Shimmer placeholder shown while the first /api/incidents fetch is in
// flight. Mirrors the real rail's header + 108×192 tile geometry so
// there's no layout shift when the data arrives. Same pattern as
// PublicVoiceSkeleton in PublicVoiceSection.jsx — kept here so the two
// rails behave identically during loading.
function ShortNewsSkeleton({ T, channel }) {
  return (
    <div style={{ background:T.bg }}>
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
              background:'linear-gradient(135deg,#0D1B5C,#1A3FCC)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>Shorts</span>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', padding:'0 16px 14px', overflow:'hidden', gap:8 }}>
        {Array.from({ length:6 }).map((_, i) => (
          <div key={`sn-sk-${i}`} style={{ flexShrink:0, width:108 }}>
            <SkeletonBox style={{ width:108, height:192, borderRadius:10 }} />
            <SkeletonBox style={{ width:'90%', height:10, borderRadius:5, marginTop:8 }} />
            <SkeletonBox style={{ width:'60%', height:10, borderRadius:5, marginTop:5 }} />
          </div>
        ))}
      </div>
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
  // Accept both the static shape and the live API shape (videos[], issue_name, …).
  const vid = pv.mediaUrl || pv.video_url || (Array.isArray(pv.videos) && pv.videos[0]) || '';
  const dur = pv.duration || (typeof pv.duration_seconds === 'number' && pv.duration_seconds > 0
    ? `${Math.floor(pv.duration_seconds / 60)}:${String(pv.duration_seconds % 60).padStart(2, '0')}` : null);
  return {
    id:          pv.id,
    mediaUrl:    vid,
    orientation: pv.orientation || 'vertical',
    titleTe:     pv.title || pv.issue_name || '',
    titleEn:     '',
    fullText:    cleanDesc || pv.issue_name || '',
    channel:     'పబ్లిక్ వాయిస్',
    reporter:    pv.uploaderName || pv.uploader_name || '',
    profilePhoto: pv.uploaderPhoto || '',
    location:    pv.location || pv.constituency || '',
    category:    'Public Voice',
    views:       '',
    duration:    dur,
    live:        false,
    uploadDate:  pv.date || '',
    uploadTime:  pv.time || '',
    // No static poster when there's a video — let the player show the video's
    // own first frame instead of a default stock image.
    img:         vid ? '' : safeImageUrl((pv.images && pv.images[0]) || pv.thumbnail),
    bg:          ['#0a0010','#3a0030'],
    uploadedAt:  pv.uploadedAt ? new Date(pv.uploadedAt) : (pv.created_at ? new Date(pv.created_at) : new Date()),
  };
}

export { ShortNewsSection,publicVoiceToShortShape };
