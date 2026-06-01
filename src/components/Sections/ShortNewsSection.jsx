import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, safeImageUrl, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import KurnoolShortsScreen from './../../screens/KurnoolShortsScreen.jsx';
import SectionAccentBar from './../SectionAccentBar.jsx';

// Some upload keys are stored by a backend bug as Windows local paths
// (e.g. "C:\Users\…\file.jpg", percent-encoded). Those never exist in S3 →
// 403/404 → black thumbnail. Drop them before they reach <video>/<img>.
function isBrokenKey(u) {
  return typeof u !== 'string' || u.includes('\\') || u.includes('%5C') || u.includes('%3A%5C');
}

// ── SHORT NEWS SECTION COMPONENT (with auto-scroll) ─────────
// `items` (optional) — live incident-derived shorts from /api/incidents,
// mapped by the parent (HomeScreen) into the SHORT_NEWS shape. When null /
// empty the section falls back to the bundled SHORT_NEWS demo set.
function ShortNewsSection({ channel, items: liveItems }) {
  const { T } = useAppTheme();
  const [openIdx,    setOpenIdx]    = useState(null);
  const [openItem,   setOpenItem]   = useState(null); // the exact clip tapped (resolved by identity in the viewer)
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
        <span onClick={() => { setOpenItem(null); setOpenIdx(0); }}
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
              // The viewer re-sorts by uploadedAt internally, so we hand it the
              // EXACT tapped object and let it resolve the position by identity
              // (`items` is the source list doubled, so `i % total` is the real
              // source index). This is robust even when live items lack/share ids.
              const srcItem = source[i % total];
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
          rawItems={source}
          initialItem={openItem}
          initialIdx={openIdx || 0}
          onClose={() => { setOpenIdx(null); setOpenItem(null); }}
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
