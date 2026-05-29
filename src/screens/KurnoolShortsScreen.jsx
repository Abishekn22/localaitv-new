import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import KurnoolShortItem from './../components/Feed/KurnoolShortItem.jsx';
import ShortsShareSheet from './../components/Feed/ShortsShareSheet.jsx';
import { sortShortsForFeed, getLoopIdx } from './../components/Feed/UnifiedFeedViewer.jsx';
import SnapShortsScroller from './../components/Feed/SnapShortsScroller.jsx';

function KurnoolShortsScreen({ onClose, initialIdx = 0, rawItems }) {
  const { T }   = useAppTheme();
  // Sort by date/time: today first (latest), then yesterday, etc.
  const sorted  = useMemo(() => sortShortsForFeed(rawItems || SHORT_NEWS), [rawItems]);
  const total   = sorted.length;

  const [curIdx,    setCurIdx]    = useState(initialIdx); // live looped index (share target)
  const [showShare, setShowShare] = useState(false);

  const idx = total > 0 ? getLoopIdx(curIdx, total) : 0;
  const cur = sorted[idx];

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape closes (↑/↓ navigation handled by SnapShortsScroller).
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Empty-state guard — when the feed has no items, render a bilingual
  // placeholder instead of mounting <KurnoolShortItem item={undefined}/>,
  // which would throw. Back arrow still works so the user can exit.
  if (total === 0) {
    return (
      <div style={{ position:'fixed', inset:0, zIndex:300, background:'#000',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <button onClick={onClose}
          style={{ position:'absolute', top:18, left:14, zIndex:21,
            width:36, height:36, borderRadius:'50%',
            background:'rgba(0,0,0,0.55)',
            border:'1.5px solid rgba(255,255,255,0.22)',
            color:'white', fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center' }}>←</button>
        <div style={{ textAlign:'center', padding:'0 24px' }}>
          <div style={{ fontFamily:"'Noto Sans Telugu',sans-serif",
            fontWeight:800, fontSize:20, lineHeight:1.4,
            color:'rgba(255,255,255,0.85)', marginBottom:6 }}>
            ప్రస్తుతం వీడియోలు లేవు
          </div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:600, fontSize:13, letterSpacing:0.6,
            color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>
            No videos yet
          </div>
        </div>
      </div>
    );
  }

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

      {/* ── NATIVE SCROLL-SNAP SHORTS FEED ──
            One swipe = one short, smooth momentum scrolling, infinite loop. */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        <SnapShortsScroller
          total={total}
          initialIdx={initialIdx}
          onIndexChange={setCurIdx}
          renderItem={(itemIndex, isActive) => {
            const item = sorted[itemIndex];
            if (!item) return null;
            return (
              <KurnoolShortItem
                item={item}
                isActive={isActive}
                onShare={() => setShowShare(true)}
                onBell={() => {}}
              />
            );
          }}
        />
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
