import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import CommentDrawer from './../sheets/CommentDrawer.jsx';
import RatingDrawer from './../sheets/RatingDrawer.jsx';
import SharedActionBar from './../SharedActionBar.jsx';
import UnifiedFeedViewer from './UnifiedFeedViewer.jsx';
import { isAudioUnlocked } from './../../utils/audioUnlock.js';

function FeedItem({ item, isActive, onShare }) {
  const { T } = useAppTheme();
  const [liked,     setLiked]     = useState(false);
  const [disliked,  setDisliked]  = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showRating,  setShowRating]  = useState(false);
  const [showHeart,   setShowHeart]   = useState(false);
  const [likeCount,   setLikeCount]   = useState(Math.floor(Math.random()*200)+10);
  const lastTap = useRef(0);

  const handleLike = () => {
    if (!liked) setLikeCount(c=>c+1);
    else setLikeCount(c=>c-1);
    setLiked(l=>!l);
    setDisliked(false);
  };
  const handleDislike = () => {
    if (liked) setLikeCount(c=>c-1);
    setDisliked(d=>!d);
    setLiked(false);
  };
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setLiked(true);
      setLikeCount(c=>c+1);
      setShowHeart(true);
      setTimeout(()=>setShowHeart(false), 700);
    }
    lastTap.current = now;
  };

  return (
    <div style={{ width:'100%', height:'100%', display:'flex',
      flexDirection:'column', position:'relative', background:'#000' }}>

      {/* ── Double-tap heart animation ── */}
      {showHeart && (
        <div style={{ position:'absolute', top:'25%', left:'50%',
          transform:'translate(-50%,-50%)', zIndex:30,
          fontSize:90, animation:'heartPop 0.65s ease forwards',
          pointerEvents:'none' }}>❤️</div>
      )}

      {/* ── VIDEO / THUMBNAIL (35-40% of screen) ── */}
      <div onTouchStart={handleDoubleTap}
        style={{ height:'38%', position:'relative',
          background:'#000', flexShrink:0, overflow:'hidden' }}>
        {item.ytId && isActive ? (
          <iframe
            data-yt-audio="1"
            src={`https://www.youtube.com/embed/${item.ytId}?autoplay=1&mute=${isAudioUnlocked() ? '0' : '1'}&loop=1&playlist=${item.ytId}&controls=1&rel=0&modestbranding=1&cc_load_policy=0&enablejsapi=1`}
            title={item.headline}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{ width:'100%', height:'100%', border:'none', display:'block' }}
          />
        ) : (
          <div style={{ width:'100%', height:'100%', position:'relative' }}>
            <img src={item.thumb}
              alt={item.headline}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onError={e => { if (e.target.src.endsWith('/placeholder.svg')) return; e.target.src='/placeholder.svg'; }}
            />
            {/* Play overlay if has video */}
            {item.ytId && !isActive && (
              <div style={{ position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(0,0,0,0.25)' }}>
                <div style={{ width:54, height:54, borderRadius:'50%',
                  background:'rgba(255,255,255,0.92)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ width:0, height:0, marginLeft:5,
                    borderTop:'14px solid transparent',
                    borderBottom:'14px solid transparent',
                    borderLeft:'22px solid #D0021B' }}/>
                </div>
              </div>
            )}
            {/* LIVE badge */}
            {item.live && (
              <div style={{ position:'absolute', top:10, left:10,
                display:'flex', alignItems:'center', gap:4,
                background:'#D0021B', borderRadius:6, padding:'4px 10px',
                boxShadow:'0 2px 8px rgba(208,2,27,0.4)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%',
                  background:'white', animation:'blink 1s infinite' }}/>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:900, fontSize:11, color:'white', letterSpacing:1.2 }}>LIVE</span>
              </div>
            )}
            {/* Duration */}
            {item.time && !item.live && item.type==='shorts' && (
              <div style={{ position:'absolute', bottom:8, right:10,
                background:'rgba(0,0,0,0.75)', borderRadius:5, padding:'3px 8px' }}>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:11, fontWeight:700, color:'white' }}>▶ {item.time}</span>
              </div>
            )}
            {/* Category badge */}
            {item.type !== 'shorts' && (
              <div style={{ position:'absolute', top:10, right:10,
                background:'rgba(0,0,0,0.7)', borderRadius:6, padding:'4px 10px',
                border:`1px solid ${T.red}44` }}>
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:10, fontWeight:700, color:'white', letterSpacing:0.5 }}>
                  {item.category}
                </span>
              </div>
            )}
          </div>
        )}
        {/* Bottom fade into content */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:30,
          background:'linear-gradient(0deg,#000 0%,transparent 100%)',
          pointerEvents:'none' }}/>
      </div>

      {/* ── SCROLLABLE CONTENT AREA (60-65%) ── */}
      <div style={{ flex:1, overflowY:'auto', scrollbarWidth:'none',
        WebkitOverflowScrolling:'touch',
        background:'#000',
        display:'flex', flexDirection:'column' }}>

        {/* Headline */}
        <div style={{ padding:'14px 18px 8px' }}>
          <h2 style={{ margin:0,
            fontFamily:"'Noto Sans Telugu',sans-serif",
            fontWeight:800, fontSize:18, lineHeight:1.5,
            color:'white', marginBottom: item.headlineEn ? 6 : 0 }}>
            {item.headline}
          </h2>
          {item.headlineEn && item.headlineEn !== item.headline && (
            <p style={{ margin:0, fontFamily:"'Barlow',sans-serif",
              fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>
              {item.headlineEn}
            </p>
          )}
        </div>

        {/* ── SharedActionBar — below video, above text ── */}
        <SharedActionBar
          itemId={`feed_${item.id}_${item.type}`}
          onShare={onShare}
          onComment={()=>setShowComment(true)}
          compact={false}
        />

        {/* ── FULL TEXT ── */}        {/* ── FULL TEXT ── */}
        <div style={{ padding:'14px 18px 10px' }}>
          {item.type === 'classifieds' && item.badge && (
            <div style={{ display:'inline-flex', alignItems:'center',
              background:'rgba(208,2,27,0.15)', border:'1px solid rgba(208,2,27,0.3)',
              borderRadius:8, padding:'4px 12px', marginBottom:10 }}>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800, fontSize:13, color:T.red, letterSpacing:0.5 }}>
                {item.badge}
              </span>
            </div>
          )}
          <p style={{ margin:0, fontFamily:"'Noto Sans Telugu',sans-serif",
            fontSize:14, lineHeight:1.8, color:'rgba(255,255,255,0.82)',
            whiteSpace:'pre-line' }}>
            {item.fullText}
          </p>
          {/* Classifieds: call+WhatsApp */}
          {item.type === 'classifieds' && item.contact && (
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button onClick={()=>window.open(`tel:+91${item.contact.replace(/\s/g,'')}`, '_blank')}
                style={{ flex:1, background:'linear-gradient(135deg,#059669,#047857)',
                  border:'none', borderRadius:12, padding:'13px',
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:800, fontSize:14, color:'white', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                📞 Call Now
              </button>
              <button onClick={()=>window.open(`https://wa.me/91${item.contact.replace(/\s/g,'')}?text=${encodeURIComponent('Hi, I saw your ad on LocalAI TV: '+item.headline)}`, '_blank')}
                style={{ flex:1, background:'linear-gradient(135deg,#25D366,#128C7E)',
                  border:'none', borderRadius:12, padding:'13px',
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:800, fontSize:14, color:'white', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                💬 WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* ── REPORTER / METADATA ── */}
        <div style={{ margin:'4px 18px 16px',
          background:'rgba(255,255,255,0.05)',
          borderRadius:12, padding:'12px 14px',
          border:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
            gap:8 }}>
            {[
              { icon:'👤', label:'Reporter', value: item.reporter },
              { icon:'📍', label:'Location', value: item.location },
              { icon:'📂', label:'Category', value: item.category },
              { icon:'🕐', label:'Time',     value: item.time },
            ].map(({icon,label,value}) => value ? (
              <div key={label}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)',
                  fontFamily:"'Barlow Condensed',sans-serif",
                  letterSpacing:0.8, marginBottom:2, textTransform:'uppercase' }}>
                  {icon} {label}
                </div>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:12, fontWeight:600,
                  color:'rgba(255,255,255,0.7)', lineHeight:1.3 }}>
                  {value}
                </div>
              </div>
            ) : null)}
          </div>
        </div>

        {/* Swipe hint */}
        <div style={{ textAlign:'center', padding:'4px 0 20px' }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.18)',
            fontFamily:"'Barlow',sans-serif", letterSpacing:0.3 }}>
            ↑ swipe up for next
          </span>
        </div>
      </div>

      {/* Drawers */}
      <CommentDrawer open={showComment} onClose={()=>setShowComment(false)} itemId={item.id}/>
      <RatingDrawer  open={showRating}  onClose={()=>setShowRating(false)}/>
    </div>
  );
}

export { FeedItem };
export default FeedItem;
