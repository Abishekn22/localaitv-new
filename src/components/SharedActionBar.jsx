import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function SharedActionBar({ itemId, onShare, onComment, compact = false }) {
  const { T } = useAppTheme();
  const storageKey = `localaitv_actions_${itemId}`;

  // Per-item state — persisted in localStorage
  const [liked,      setLiked]     = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}').liked || false; } catch { return false; }
  });
  const [disliked,   setDisliked]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}').disliked || false; } catch { return false; }
  });
  const [bellOn,     setBellOn]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}').bellOn || false; } catch { return false; }
  });
  const [likeCount,  setLikeCount] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}').likeCount || Math.floor(Math.random()*180)+12; } catch { return 24; }
  });
  const [showHeart,  setShowHeart] = useState(false);
  const lastTap = useRef(0);

  // Persist to localStorage on change
  const persist = (updates) => {
    try {
      const cur = JSON.parse(localStorage.getItem(storageKey) || '{}');
      localStorage.setItem(storageKey, JSON.stringify({...cur, ...updates}));
    } catch {}
  };

  const handleLike = () => {
    const next = !liked;
    const nextCount = next ? likeCount + 1 : likeCount - 1;
    setLiked(next); setDisliked(false); setLikeCount(nextCount);
    persist({ liked: next, disliked: false, likeCount: nextCount });
  };
  const handleDislike = () => {
    const next = !disliked;
    if (liked) { setLikeCount(c => c-1); setLiked(false); }
    setDisliked(next);
    persist({ disliked: next, liked: false });
  };
  const handleBell = () => {
    const next = !bellOn;
    setBellOn(next);
    persist({ bellOn: next });
  };

  // Double-tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      if (!liked) { setLiked(true); setLikeCount(c=>c+1); persist({liked:true}); }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 700);
    }
    lastTap.current = now;
  };

  const pad   = compact ? '6px 10px' : '10px 14px';
  const fsize = compact ? 16 : 19;
  const lsize = compact ? 8  : 10;

  return (
    <div style={{ position:'relative' }}>
      {/* Double-tap heart overlay */}
      {showHeart && (
        <div style={{ position:'absolute', top:'-40px', left:'50%',
          transform:'translateX(-50%)', zIndex:20,
          fontSize:60, animation:'heartPop 0.65s ease forwards',
          pointerEvents:'none' }}>❤️</div>
      )}
      <div
        onTouchStart={handleDoubleTap}
        style={{
          display:'flex', alignItems:'center', gap:compact?4:6,
          padding: pad,
          borderTop:`1px solid ${T.border}`,
          borderBottom:`1px solid ${T.border}`,
          background: T.isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)',
        }}>

        {/* ── LIKE ── */}
        <button onClick={handleLike} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
          background: liked ? 'rgba(255,59,48,0.12)' : 'rgba(128,128,128,0.07)',
          border:`1px solid ${liked ? 'rgba(255,59,48,0.35)' : T.border}`,
          borderRadius:10, padding:compact?'6px 3px':'8px 4px', cursor:'pointer',
          transition:'all 0.2s', minWidth:0,
        }}>
          <span style={{ fontSize:fsize,
            transform: liked ? 'scale(1.25)' : 'scale(1)',
            transition:'transform 0.2s' }}>
            {liked ? '❤️' : '🤍'}
          </span>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:lsize, fontWeight:700,
            color: liked ? '#FF3B30' : T.textMuted }}>
            {likeCount >= 1000 ? `${(likeCount/1000).toFixed(1)}K` : likeCount}
          </span>
        </button>

        {/* ── DISLIKE ── */}
        <button onClick={handleDislike} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
          background: disliked ? 'rgba(255,149,0,0.12)' : 'rgba(128,128,128,0.07)',
          border:`1px solid ${disliked ? 'rgba(255,149,0,0.35)' : T.border}`,
          borderRadius:10, padding:compact?'6px 3px':'8px 4px', cursor:'pointer',
          transition:'all 0.2s', minWidth:0,
        }}>
          <span style={{ fontSize:fsize }}>
            {disliked ? '👎' : '👍🏽'}
          </span>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:lsize, fontWeight:700, color:T.textMuted }}>
            Dislike
          </span>
        </button>

        {/* ── COMMENT ── */}
        <button onClick={onComment} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
          background:'rgba(128,128,128,0.07)', border:`1px solid ${T.border}`,
          borderRadius:10, padding:compact?'6px 3px':'8px 4px', cursor:'pointer',
          minWidth:0,
        }}>
          <span style={{ fontSize:fsize }}>💬</span>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:lsize, fontWeight:700, color:T.textMuted }}>Comment</span>
        </button>

        {/* ── SHARE ── */}
        <button onClick={onShare} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
          background:'rgba(128,128,128,0.07)', border:`1px solid ${T.border}`,
          borderRadius:10, padding:compact?'6px 3px':'8px 4px', cursor:'pointer',
          minWidth:0,
        }}>
          <svg width={fsize} height={fsize} viewBox="0 0 24 24" fill="none"
            stroke={T.textMuted} strokeWidth={2.2} strokeLinecap="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:lsize, fontWeight:700, color:T.textMuted }}>Share</span>
        </button>

        {/* ── BELL ── */}
        <button onClick={handleBell} style={{
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2,
          background: bellOn ? 'rgba(255,184,0,0.12)' : 'rgba(128,128,128,0.07)',
          border:`1px solid ${bellOn ? 'rgba(255,184,0,0.4)' : T.border}`,
          borderRadius:10, padding:compact?'6px 3px':'8px 4px', cursor:'pointer',
          transition:'all 0.2s', minWidth:0,
        }}>
          <span style={{ fontSize:fsize }}>
            {bellOn ? '🔔' : '🔕'}
          </span>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:lsize, fontWeight:700,
            color: bellOn ? '#FFB800' : T.textMuted }}>
            {bellOn ? 'Following' : 'Follow'}
          </span>
        </button>
      </div>
    </div>
  );
}

export { SharedActionBar };
export default SharedActionBar;
