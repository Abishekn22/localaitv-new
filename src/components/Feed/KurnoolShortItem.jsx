import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import Logo from './../Logo.jsx';
import { isAudioUnlocked } from './../../utils/audioUnlock.js';

function KurnoolShortItem({ item, isActive, onShare, onBell }) {
  const { T } = useAppTheme();
  const [liked,      setLiked]      = useState(false);
  const [disliked,   setDisliked]   = useState(false);
  const [likeCount,  setLikeCount]  = useState(
    () => Math.floor(Math.random() * 300) + 20
  );
  const [showComment,  setShowComment]  = useState(false);
  const [showRating,   setShowRating]   = useState(false);
  const [showHeart,    setShowHeart]    = useState(false);
  const [bellActive,   setBellActive]   = useState(false);
  const [commentText,  setCommentText]  = useState('');
  const [ratingVal,    setRatingVal]    = useState(0);
  const [ratingDone,   setRatingDone]   = useState(false);
  // Orientation comes from the explicit `item.orientation` field
  // ('vertical' | 'horizontal'). YouTube's thumbnail dimensions are
  // unreliable (all returned as 1280×720 — even for vertical Shorts),
  // so we don't probe them. The data file tags each video correctly.
  const isVertical = item.orientation === 'vertical';
  const lastTap = useRef(0);

  // Refs for the HTML5 video element + tap-tracking on the gesture overlay
  const videoElRef = useRef(null);
  const tapStart = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Toggle HTML5 video play/pause
  const togglePlayPause = () => {
    const v = videoElRef.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setIsPlaying(true); }
    else          { v.pause();                 setIsPlaying(false); }
  };

  // Reset playing flag whenever the active item changes. Optional-chained
  // dep so a transient undefined item (e.g. empty feed mount before parent
  // renders its empty state) doesn't throw.
  useEffect(() => { setIsPlaying(true); }, [item?.id]);

  // Reset state when item changes
  useEffect(() => {
    setLiked(false);
    setDisliked(false);
    setShowComment(false);
    setShowRating(false);
    setRatingDone(false);
    setRatingVal(0);
  }, [item?.id]);

  // Make the active video actually start. Unmuted autoplay is blocked by
  // browsers, so try with sound first, then fall back to muted playback —
  // guaranteeing it never just sits on a black frame. Pause when not active.
  useEffect(() => {
    const v = videoElRef.current;
    if (!v) return;
    if (isActive) {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { v.muted = true; v.play().catch(() => {}); });
      }
      setIsPlaying(true);
    } else {
      try { v.pause(); } catch {}
    }
  }, [isActive, item?.id, item?.mediaUrl]);

  // Defensive null-guard placed AFTER all hooks (Rules of Hooks compliant).
  // The parent screen already renders an empty state when its feed is
  // empty, but this catches any stray mount with an undefined item.
  if (!item) return null;

  const handleLike = () => {
    if (!liked) { setLiked(true); setDisliked(false); setLikeCount(c => c + 1); }
    else         { setLiked(false); setLikeCount(c => c - 1); }
  };
  const handleDislike = () => {
    if (!disliked) { setDisliked(true); setLiked(false); setLikeCount(c => liked ? c - 1 : c); }
    else            { setDisliked(false); }
  };
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 320) {
      setLiked(true);
      setLikeCount(c => c + 1);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 750);
    }
    lastTap.current = now;
  };

  // Format upload date/time nicely
  const formatUploadTime = () => {
    if (!item.uploadedAt) return item.uploadTime || '';
    const d   = new Date(item.uploadedAt);
    const now = new Date();
    const diffMs  = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 60)  return `${diffMin}m ago`;
    if (diffHr  < 24)  return `${diffHr}h ago`;
    if (diffDay === 1) return 'Yesterday ' + d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
    return d.toLocaleDateString('en-IN', {day:'numeric', month:'short'}) + ' ' +
           d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
  };

  const MOCK_COMMENTS = [
    { user:'రాజు', time:'2m', text:'చాలా మంచి వార్త! 👏', likes:12 },
    { user:'Priya', time:'8m', text:'LocalAI TV best channel!', likes:8 },
    { user:'వెంకట్', time:'15m', text:'ఇది చాలా అవసరమైన సమాచారం', likes:19 },
    { user:'Suresh', time:'22m', text:'Keep up the good work! 🙏', likes:5 },
    { user:'అనిత', time:'30m', text:'మీ వార్తలు చాలా నమ్మకంగా ఉంటాయి', likes:24 },
  ];

  return (
    <div style={{ width:'100%', height:'100%', display:'flex',
      flexDirection:'column', background:'#000', position:'relative',
      overflow:'hidden' }}>

      {/* ── Double-tap heart ── */}
      {showHeart && (
        <div style={{ position:'absolute', top:'30%', left:'50%', zIndex:50,
          transform:'translate(-50%,-50%)',
          fontSize:88, pointerEvents:'none',
          animation:'heartPop 0.7s ease forwards' }}>❤️</div>
      )}

      {/* Headline relocated below the video per user request — see scrollable area */}

      {/* ══ 1. VIDEO — orientation-aware sizing:
                vertical (Shorts / portrait) → 80%   horizontal (landscape) → 40% ══ */}
      <div onTouchStart={handleDoubleTap}
        style={{ height: isVertical ? '80%' : '40%',
          flexShrink:0, position:'relative',
          background:'#000', overflow:'hidden',
          transition:'height 0.25s ease' }}>
        {isActive && item.mediaUrl ? (
          <>
            <video
              key={`v-${item.id}`}
              data-primary-audio="1"
              ref={el => { if (el) videoElRef.current = el; }}
              src={item.mediaUrl}
              poster={item.img || ''}
              autoPlay
              loop
              muted={!isAudioUnlocked()}
              playsInline
              controls={false}
              preload="auto"
              style={{ width:'100%', height:'100%', objectFit:'cover',
                background:'#000', display:'block' }}
            />
            {/* Gesture + tap-to-pause overlay. Catches swipe / wheel events and
                treats a still tap as play/pause. Bottom 48px left uncovered for
                any future native controls. */}
            <div
              onTouchStart={e => {
                tapStart.current = {
                  x: e.touches[0].clientX,
                  y: e.touches[0].clientY,
                  t: Date.now(),
                };
                handleDoubleTap();
              }}
              onTouchEnd={e => {
                const s = tapStart.current;
                if (!s) return;
                const t = e.changedTouches[0];
                const dx = Math.abs(t.clientX - s.x);
                const dy = Math.abs(t.clientY - s.y);
                const dt = Date.now() - s.t;
                if (dx < 8 && dy < 8 && dt < 300) togglePlayPause();
                tapStart.current = null;
              }}
              onClick={e => { togglePlayPause(); }}
              style={{position:'absolute', top:0, left:0, right:0, bottom:48,
                zIndex:3, background:'transparent', cursor:'pointer'}}/>
          </>
        ) : (
          <div style={{ width:'100%', height:'100%', position:'relative',
            cursor:'pointer' }}>
            {item.img ? (
              <img
                src={item.img}
                alt={item.titleEn}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => { e.target.style.opacity = '0.25'; }}
              />
            ) : (
              <div style={{ width:'100%', height:'100%',
                background:`linear-gradient(135deg, ${item.bg?.[0]||'#1a0a00'}, ${item.bg?.[1]||'#7a1500'})` }}/>
            )}
            {/* Play icon — hidden when no video to play */}
            {item.mediaUrl && (
              <div style={{ position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(0,0,0,0.25)' }}>
                <div style={{ width:52, height:52, borderRadius:'50%',
                  background:'rgba(255,255,255,0.92)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:'0 4px 20px rgba(0,0,0,0.5)' }}>
                  <div style={{ width:0, height:0, marginLeft:5,
                    borderTop:'13px solid transparent',
                    borderBottom:'13px solid transparent',
                    borderLeft:'21px solid #D0021B' }}/>
                </div>
              </div>
            )}
          </div>
        )}
        {/* ── LocalAI TV channel watermark — top-right of the video.
              Offsets bumped 8 → 18 (top) / 8 → 16 (right) so it doesn't hug the edges. ── */}
        <div style={{ position:'absolute', top:18, right:16, zIndex:6,
          background:'rgba(0,0,0,0.5)', borderRadius:6, padding:'2px 6px',
          pointerEvents:'none', backdropFilter:'blur(2px)' }}>
          <Logo size="xs" dark={true} showTV={true}/>
        </div>

        {/* LIVE badge */}
        {item.live && (
          <div style={{ position:'absolute', bottom:10, left:12,
            display:'flex', alignItems:'center', gap:4,
            background:'#D0021B', borderRadius:6, padding:'4px 10px',
            boxShadow:'0 2px 10px rgba(208,2,27,0.5)', zIndex:5 }}>
            <div style={{ width:6, height:6, borderRadius:'50%',
              background:'white', animation:'blink 1s infinite' }}/>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:900, fontSize:11, color:'white', letterSpacing:1.2 }}>LIVE</span>
          </div>
        )}
        {/* Duration */}
        {!item.live && item.duration && (
          <div style={{ position:'absolute', bottom:10, right:12,
            background:'rgba(0,0,0,0.75)', borderRadius:5,
            padding:'3px 8px', zIndex:5 }}>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:11, fontWeight:700, color:'white' }}>▶ {item.duration}</span>
          </div>
        )}
        {/* Bottom fade */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:24,
          background:'linear-gradient(0deg,#000 0%,transparent 100%)',
          pointerEvents:'none' }}/>
      </div>

      {/* ══ SCROLLABLE CONTENT BELOW VIDEO ═════════════════════
            New order per user request:
              2. HEADLINE  →  3. DESCRIPTION  →  4. ACTION BAR  →  5. REPORTER … */}
      <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'none',
        WebkitOverflowScrolling:'touch',
        display:'flex', flexDirection:'column',
        background:'linear-gradient(180deg,#000 0%,#050a14 100%)' }}>

        {/* ══ 2. HEADLINE — Telugu only (English subtitle removed per user request) ══ */}
        <div style={{ padding:'12px 16px 8px',
          borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin:0,
            fontFamily:"'Noto Sans Telugu',sans-serif",
            fontWeight:900, fontSize:18, lineHeight:1.4,
            color:'#fff' }}>
            {item.titleTe}
          </h2>
        </div>

        {/* ══ 3. DESCRIPTION — shown ONLY for HORIZONTAL videos (40% layout).
              Vertical Shorts (70% layout) skip this and go straight to uploader/actions. */}
        {!isVertical && (
          <div style={{ padding:'14px 16px 10px',
            borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            {item.category && (
              <div style={{ display:'inline-flex', alignItems:'center',
                background:'rgba(208,2,27,0.15)',
                border:'1px solid rgba(208,2,27,0.3)',
                borderRadius:6, padding:'3px 10px', marginBottom:10 }}>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:800, fontSize:11, color:'#FF3B30',
                  letterSpacing:0.5, textTransform:'uppercase' }}>
                  {item.category}
                </span>
              </div>
            )}
            <p style={{ margin:0,
              fontFamily:"'Noto Sans Telugu',sans-serif",
              fontSize:14, lineHeight:1.85,
              color:'rgba(255,255,255,0.85)',
              whiteSpace:'pre-wrap' }}>
              {item.fullText}
            </p>
          </div>
        )}

        {/* ══ 4. UPLOADER LINE — single row: Name · time · location ══════════ */}
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          padding:'8px 16px',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          fontFamily:"'Barlow Condensed',sans-serif",
          fontSize:12, fontWeight:600,
          color:'rgba(255,255,255,0.72)',
          overflow:'hidden', whiteSpace:'nowrap',
        }}>
          <span style={{
            color:'rgba(255,255,255,0.95)', fontWeight:800,
            overflow:'hidden', textOverflow:'ellipsis', maxWidth:'40%',
          }}>
            👤 {item.reporter || item.channel || 'LocalAI TV'}
          </span>
          {formatUploadTime() && (
            <>
              <span style={{color:'rgba(255,255,255,0.25)'}}>·</span>
              <span style={{color:'rgba(255,255,255,0.6)'}}>🕐 {formatUploadTime()}</span>
            </>
          )}
          {item.location && (
            <>
              <span style={{color:'rgba(255,255,255,0.25)'}}>·</span>
              <span style={{
                color:'rgba(255,255,255,0.6)',
                overflow:'hidden', textOverflow:'ellipsis', flex:1, minWidth:0,
              }}>📍 {item.location}</span>
            </>
          )}
        </div>

        {/* ══ 5. ACTION BAR — 5 buttons: Like · Dislike · Comment · Views · Share ════ */}
        <div style={{ display:'flex', alignItems:'center', gap:4,
          padding:'10px 14px 10px',
          borderBottom:'1px solid rgba(255,255,255,0.08)' }}>

          {/* 1. Like — YouTube-style thumbs-up SVG (outline inactive, filled active) — hover: lift + blue glow */}
          <button onClick={handleLike}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(59,143,255,0.45)';
              e.currentTarget.style.borderColor='rgba(59,143,255,0.55)';
              e.currentTarget.style.background='rgba(59,143,255,0.18)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor= liked ? 'rgba(59,143,255,0.5)' : 'rgba(255,255,255,0.1)';
              e.currentTarget.style.background= liked ? 'rgba(59,143,255,0.18)' : 'rgba(255,255,255,0.07)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background: liked ? 'rgba(59,143,255,0.18)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${liked ? 'rgba(59,143,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius:11, padding:'8px 4px',
            cursor:'pointer', transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <svg width={20} height={20} viewBox="0 0 24 24"
              fill={liked ? '#3B8FFF' : 'none'}
              stroke={liked ? '#3B8FFF' : 'rgba(255,255,255,0.8)'}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: liked ? 'scale(1.12)' : 'scale(1)', transition:'transform 0.18s' }}>
              <path d="M7 10v12"/>
              <path d="M15 5.88 14 12h5.5a2 2 0 0 1 2 2.26l-1.1 7A2 2 0 0 1 18.44 23H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h2.83a2 2 0 0 0 1.92-1.45l1.9-6.55A.9.9 0 0 1 14.74 0 2.26 2.26 0 0 1 17 2.26V5.88Z"/>
            </svg>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color: liked ? '#3B8FFF' : 'rgba(255,255,255,0.6)' }}>
              {likeCount}
            </span>
          </button>

          {/* 2. Dislike — YouTube-style thumbs-down SVG (outline inactive, filled active) — hover: lift + orange glow */}
          <button onClick={handleDislike}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(255,149,0,0.45)';
              e.currentTarget.style.borderColor='rgba(255,149,0,0.55)';
              e.currentTarget.style.background='rgba(255,149,0,0.18)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor= disliked ? 'rgba(255,149,0,0.5)' : 'rgba(255,255,255,0.1)';
              e.currentTarget.style.background= disliked ? 'rgba(255,149,0,0.18)' : 'rgba(255,255,255,0.07)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background: disliked ? 'rgba(255,149,0,0.18)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${disliked ? 'rgba(255,149,0,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius:11, padding:'8px 4px',
            cursor:'pointer', transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <svg width={20} height={20} viewBox="0 0 24 24"
              fill={disliked ? '#FF9500' : 'none'}
              stroke={disliked ? '#FF9500' : 'rgba(255,255,255,0.8)'}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: disliked ? 'scale(1.12)' : 'scale(1)', transition:'transform 0.18s' }}>
              <path d="M17 14V2"/>
              <path d="M9 18.12 10 12H4.5a2 2 0 0 1-2-2.26l1.1-7A2 2 0 0 1 5.56 1H17a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-2.83a2 2 0 0 0-1.92 1.45l-1.9 6.55A.9.9 0 0 1 9.26 24 2.26 2.26 0 0 1 7 21.74V18.12Z"/>
            </svg>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color: disliked ? '#FF9500' : 'rgba(255,255,255,0.5)' }}>Dislike</span>
          </button>

          {/* 3. Comment — hover: lift + teal glow */}
          <button onClick={() => setShowComment(true)}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(0,200,184,0.45)';
              e.currentTarget.style.borderColor='rgba(0,200,184,0.55)';
              e.currentTarget.style.background='rgba(0,200,184,0.18)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';
              e.currentTarget.style.background='rgba(255,255,255,0.07)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:11, padding:'8px 4px', cursor:'pointer',
            transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <span style={{ fontSize:19 }}>💬</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color:'rgba(255,255,255,0.45)' }}>Comment</span>
          </button>

          {/* 4. Views — non-interactive display of how many people have watched — hover: lift + violet glow */}
          <div
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(123,31,162,0.45)';
              e.currentTarget.style.borderColor='rgba(123,31,162,0.55)';
              e.currentTarget.style.background='rgba(123,31,162,0.18)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';
              e.currentTarget.style.background='rgba(255,255,255,0.07)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:11, padding:'8px 4px',
            userSelect:'none',
            transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <span style={{ fontSize:19 }}>👁</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color:'rgba(255,255,255,0.7)' }}>
              {item.views || '0'}
            </span>
          </div>

          {/* 5. Share — hover: lift + gold glow */}
          <button onClick={onShare}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(255,184,0,0.5)';
              e.currentTarget.style.borderColor='rgba(255,184,0,0.55)';
              e.currentTarget.style.background='rgba(255,184,0,0.18)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';
              e.currentTarget.style.background='rgba(255,255,255,0.07)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:11, padding:'8px 4px', cursor:'pointer',
            transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.7)" strokeWidth={2.2} strokeLinecap="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color:'rgba(255,255,255,0.45)' }}>Share</span>
          </button>
        </div>

        {/* Verbose reporter / metadata card removed — replaced by single-line uploader strip above */}

        {/* Swipe hint */}
        <div style={{ textAlign:'center', padding:'2px 0 18px' }}>
          <span style={{ fontSize:10,
            color:'rgba(255,255,255,0.18)',
            fontFamily:"'Barlow',sans-serif",
            letterSpacing:0.4 }}>↑ swipe up for next short</span>
        </div>
      </div>

      {/* ══ COMMENT DRAWER ══════════════════════════════════════ */}
      {showComment && (
        <div onClick={() => setShowComment(false)}
          style={{ position:'absolute', inset:0, zIndex:60,
            background:'rgba(0,0,0,0.6)',
            display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#111', borderRadius:'20px 20px 0 0',
              maxHeight:'65%', display:'flex', flexDirection:'column',
              boxShadow:'0 -8px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ display:'flex', alignItems:'center',
              justifyContent:'space-between',
              padding:'14px 18px 10px',
              borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800, fontSize:16, color:'white' }}>
                💬 Comments (5)
              </span>
              <button onClick={() => setShowComment(false)}
                style={{ background:'none', border:'none',
                  fontSize:20, color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 18px',
              display:'flex', flexDirection:'column', gap:14 }}>
              {MOCK_COMMENTS.map((c, i) => (
                <div key={i} style={{ display:'flex', gap:10 }}>
                  <div style={{ width:34, height:34, borderRadius:'50%',
                    flexShrink:0, fontSize:14, fontWeight:800, color:'white',
                    background:'linear-gradient(135deg,#D0021B,#FF6B00)',
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {c.user[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:700, fontSize:13, color:'white' }}>{c.user}</span>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{c.time}m</span>
                    </div>
                    <div style={{ fontFamily:"'Noto Sans Telugu',sans-serif",
                      fontSize:13, color:'rgba(255,255,255,0.8)', lineHeight:1.5 }}>{c.text}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:3 }}>
                      ❤️ {c.likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8,
              padding:'10px 16px 24px',
              borderTop:'1px solid rgba(255,255,255,0.08)' }}>
              <input value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="మీ అభిప్రాయం రాయండి..."
                style={{ flex:1, background:'rgba(255,255,255,0.08)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:22, padding:'10px 16px', fontSize:13,
                  fontFamily:"'Noto Sans Telugu',sans-serif",
                  color:'white', outline:'none' }}/>
              <button onClick={() => setCommentText('')}
                style={{ width:42, height:42, borderRadius:'50%',
                  background: commentText ? '#D0021B' : 'rgba(255,255,255,0.08)',
                  border:'none', cursor:'pointer', fontSize:18, color:'white',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'background 0.2s' }}>⬆</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ RATING DRAWER ════════════════════════════════════════ */}
      {showRating && (
        <div onClick={() => setShowRating(false)}
          style={{ position:'absolute', inset:0, zIndex:60,
            background:'rgba(0,0,0,0.6)',
            display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#111', borderRadius:'20px 20px 0 0',
              padding:'20px 24px 40px', textAlign:'center',
              boxShadow:'0 -8px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ width:36, height:4,
              background:'rgba(255,255,255,0.2)',
              borderRadius:2, margin:'0 auto 16px' }}/>
            {ratingDone ? (
              <>
                <div style={{ fontSize:50, marginBottom:12 }}>🙏</div>
                <div style={{ fontFamily:"'Noto Sans Telugu',sans-serif",
                  fontSize:16, fontWeight:800, color:'white', marginBottom:4 }}>
                  ధన్యవాదాలు!
                </div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>
                  మీ రేటింగ్ నమోదు అయింది • {ratingVal} ⭐
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily:"'Noto Sans Telugu',sans-serif",
                  fontWeight:800, fontSize:17, color:'white', marginBottom:4 }}>
                  ఈ వార్తను రేట్ చేయండి
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)',
                  marginBottom:22 }}>Rate this news</div>
                <div style={{ display:'flex', justifyContent:'center',
                  gap:10, marginBottom:24 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setRatingVal(star)}
                      style={{ fontSize:36, background:'none', border:'none',
                        cursor:'pointer', transition:'transform 0.15s',
                        transform: star <= ratingVal ? 'scale(1.2)' : 'scale(1)',
                        filter: star <= ratingVal ? 'none' : 'grayscale(1) opacity(0.35)' }}>⭐</button>
                  ))}
                </div>
                <button
                  onClick={() => { if (ratingVal) { setRatingDone(true); setTimeout(() => setShowRating(false), 1600); }}}
                  disabled={!ratingVal}
                  style={{ width:'100%', padding:'14px',
                    background: ratingVal ? '#D0021B' : 'rgba(255,255,255,0.08)',
                    color: ratingVal ? 'white' : 'rgba(255,255,255,0.3)',
                    border:'none', borderRadius:14,
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:900, fontSize:16, letterSpacing:0.5,
                    cursor: ratingVal ? 'pointer' : 'default',
                    transition:'all 0.2s' }}>
                  Submit Rating
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export { KurnoolShortItem };
export default KurnoolShortItem;
