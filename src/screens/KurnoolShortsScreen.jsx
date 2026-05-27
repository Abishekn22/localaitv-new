import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import KurnoolShortItem from './../components/Feed/KurnoolShortItem.jsx';
import ShortsShareSheet from './../components/Feed/ShortsShareSheet.jsx';
import { sortShortsForFeed, getLoopIdx } from './../components/Feed/UnifiedFeedViewer.jsx';

function KurnoolShortsScreen({ onClose, initialIdx = 0, rawItems }) {
  const { T }   = useAppTheme();
  // Sort by date/time: today first (latest), then yesterday, etc.
  const sorted  = useMemo(() => sortShortsForFeed(rawItems || SHORT_NEWS), [rawItems]);
  const total   = sorted.length;

  const [rawIdx,    setRawIdx]    = useState(initialIdx);
  const [animDir,   setAnimDir]   = useState(null); // 'up' | 'down'
  const [showShare, setShowShare] = useState(false);

  // Actual index with loop wrapping
  const idx = getLoopIdx(rawIdx, total);
  const cur = sorted[idx];

  const touchY  = useRef(0);
  const touchX  = useRef(0);
  const moved   = useRef(false);
  const animating = useRef(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Keyboard nav
  useEffect(() => {
    const h = e => {
      if (e.key === 'ArrowUp')   goNext();
      if (e.key === 'ArrowDown') goPrev();
      if (e.key === 'Escape')    onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [rawIdx]);

  const goNext = () => {
    if (animating.current) return;
    animating.current = true;
    setAnimDir('up');
    setTimeout(() => {
      setRawIdx(i => i + 1); // always increments, loops via getLoopIdx
      setAnimDir(null);
      animating.current = false;
    }, 270);
  };

  const goPrev = () => {
    if (animating.current) return;
    animating.current = true;
    setAnimDir('down');
    setTimeout(() => {
      // Decrement freely — getLoopIdx wraps negatives so the feed
      // loops 360° in BOTH directions (newest → oldest → newest …).
      setRawIdx(i => i - 1);
      setAnimDir(null);
      animating.current = false;
    }, 270);
  };

  const onTouchStart = e => {
    touchY.current = e.touches[0].clientY;
    touchX.current = e.touches[0].clientX;
    moved.current  = false;
  };
  const onTouchMove = e => { moved.current = true; };
  const onTouchEnd  = e => {
    if (!moved.current) return;
    const dy = touchY.current - e.changedTouches[0].clientY;
    const dx = Math.abs(e.changedTouches[0].clientX - touchX.current);
    if (dx > Math.abs(dy) * 0.8) return; // horizontal — ignore
    if (dy > 55)  goNext();
    if (dy < -55) goPrev();
  };

  // Mouse-wheel scroll → navigate (so desktop users get the same continuous
  // up/next, down/prev behaviour as touch users).
  // Throttled via `wheelLock` so a single trackpad flick only advances one short.
  const wheelLock = useRef(false);
  const onWheel = e => {
    if (wheelLock.current || animating.current) return;
    if (Math.abs(e.deltaY) < 18) return; // small noise → ignore
    wheelLock.current = true;
    if (e.deltaY > 0) goNext();
    else              goPrev();
    setTimeout(() => { wheelLock.current = false; }, 450);
  };

  // Date group label (Today / Yesterday / DD MMM)
  const getDateLabel = (item) => {
    if (!item.uploadedAt) return item.uploadDate || '';
    const d    = new Date(item.uploadedAt);
    const now  = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return 'నేడు (Today)';
    if (diff === 1) return 'నిన్న (Yesterday)';
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'#000',
      display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Top progress bars removed per user request — cleaner top of video */}

      {/* Discreet back button only — title / index / date removed per user request.
          The LocalAI TV channel logo now sits in the top-right corner of the video itself. */}
      <button onClick={onClose}
        style={{ position:'absolute', top:18, left:14, zIndex:21,
          width:36, height:36, borderRadius:'50%',
          background:'rgba(0,0,0,0.55)',
          border:'1.5px solid rgba(255,255,255,0.22)',
          color:'white', fontSize:18, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          pointerEvents:'all' }}>←</button>

      {/* ── SWIPE + WHEEL CONTAINER ──
            Touch swipe and mouse wheel both navigate continuously between Shorts. */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        style={{ flex:1, position:'relative', overflow:'hidden', paddingTop:0 }}>
        <div
          key={`short-${idx}`}
          style={{
            position:'absolute', inset:0, paddingTop:0,
            animation: animDir === 'up'
              ? 'slideOutUp 0.27s cubic-bezier(0.4,0,0.2,1) forwards'
              : animDir === 'down'
              ? 'slideOutDown 0.27s cubic-bezier(0.4,0,0.2,1) forwards'
              : 'slideInUp 0.29s cubic-bezier(0.4,0,0.2,1) both',
          }}>
          <KurnoolShortItem
            item={cur}
            isActive={!animDir}
            onShare={() => setShowShare(true)}
            onBell={() => {}}
          />
        </div>
      </div>

      {/* Share sheet */}
      {showShare && (
        <ShortsShareSheet item={cur} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════
// CLASSIFIEDS FEED SCREEN — Production grade, highest UX
// Never-ending vertical swipe feed with subcategory bar,
// image slideshow player, conditional contact, uploader meta
// ═══════════════════════════════════════════════════════════════


export { KurnoolShortsScreen };
export default KurnoolShortsScreen;
