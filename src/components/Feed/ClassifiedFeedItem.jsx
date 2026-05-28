import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import CompactField from './../CompactField.jsx';
import ImageSlideshowPlayer from './ImageSlideshowPlayer.jsx';
import Logo from './../Logo.jsx';
import { Badge } from './../atoms.jsx';

function ClassifiedFeedItem({ item, isActive, onShare, onComment }) {
  const { T }  = useAppTheme();
  const [liked,      setLiked]      = useState(false);
  const [disliked,   setDisliked]   = useState(false);
  const [likeCount,  setLikeCount]  = useState(item.likes || Math.floor(Math.random()*120)+8);
  const showContact = CONTACT_CATS.includes(item.cat);

  const handleLike = () => {
    if (liked) setLikeCount(c=>c-1); else setLikeCount(c=>c+1);
    setLiked(l=>!l); setDisliked(false);
  };
  const handleDislike = () => {
    if (liked) setLikeCount(c=>c-1);
    setDisliked(d=>!d); setLiked(false);
  };

  // All form fields the user entered when uploading — rendered as a clean
  // labeled list below the media. Empty fields are filtered out.
  const formFields = [
    { icon:'📰', label:'Headline / శీర్షిక',           val: item.title },
    { icon:'🏷️', label:'Category / వర్గం',              val: item.cat },
    { icon:'🔖', label:'Badge / గుర్తు',                val: item.badge },
    { icon:'📝', label:'Description / వివరాలు',         val: item.desc, multiline:true },
    { icon:'📅', label:'Date / తేదీ',                   val: item.date },
    { icon:'🕐', label:'Time / సమయం',                   val: item.time },
    { icon:'📍', label:'Location / ప్రదేశం',            val: item.location },
    { icon:'📞', label:'Contact / సంప్రదింపు',          val: item.phone },
    { icon:'👤', label:'Uploaded by / అప్‌లోడ్',         val: item.uploaderName },
  ].filter(f => f.val);

  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', flexDirection:'column',
      background:T.isDark?'#050d1a':'#000',
      overflow:'hidden', position:'relative',
    }}>
      {/* ══ 1. MEDIA — always 40% of screen ══ */}
      <div style={{
        height:'40%', position:'relative', flexShrink:0, overflow:'hidden',
        background:'#000',
      }}>
        <ImageSlideshowPlayer
          images={item.images}
          videos={item.videos}
          ytId={item.ytId}
          isActive={isActive}
          cat={item.cat}
        />
        {/* LocalAI TV channel watermark — top-right */}
        <div style={{ position:'absolute', top:18, right:16, zIndex:6,
          background:'rgba(0,0,0,0.5)', borderRadius:6, padding:'2px 6px',
          pointerEvents:'none', backdropFilter:'blur(2px)' }}>
          <Logo size="xs" dark={true} showTV={true}/>
        </div>
      </div>

      {/* ── Non-scrolling content area below media — everything fits in 60% screen ── */}
      <div style={{
        flex:1, overflow:'hidden', // NO scroll — layout compressed to fit one screen
        display:'flex', flexDirection:'column',
        background:T.isDark?'linear-gradient(180deg,#000 0%,#050a14 100%)':'#fff',
      }}>

        {/* ══ COMPACT FIELDS — fits in ~60% screen, no scrolling needed.
              flex:1 with minHeight:0 so it consumes available space WITHOUT pushing
              the action bar (flexShrink:0) below it off-screen. ══ */}
        <div style={{ flex:1, padding:'10px 14px 6px', display:'flex', flexDirection:'column', gap:7, minHeight:0, overflow:'hidden' }}>

          {/* Headline + badge pill (row 1) */}
          <div>
            <h2 style={{ margin:0,
              fontFamily:"'Noto Sans Telugu',sans-serif",
              fontWeight:900, fontSize:15, lineHeight:1.35,
              color:T.isDark?'#fff':'#0a0a14',
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              overflow:'hidden' }}>{item.title}</h2>
            {item.badge && (
              <span style={{ display:'inline-block', marginTop:4,
                background:'rgba(208,2,27,0.12)', border:'1px solid rgba(208,2,27,0.3)',
                borderRadius:5, padding:'2px 8px',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:10, fontWeight:800, color:'#D0021B',
                letterSpacing:0.4, textTransform:'uppercase' }}>
                {item.badge}
              </span>
            )}
          </div>

          {/* ROW: Date · Time · Category (3-column grid, single row) */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:6 }}>
            <CompactField icon="📅" label="DATE" val={item.date} T={T}/>
            <CompactField icon="🕐" label="TIME" val={item.time} T={T}/>
            <CompactField icon="🏷️" label="CATEGORY" val={item.cat} T={T}/>
          </div>

          {/* ROW: Location · Contact (2-column grid, single row) */}
          <div style={{ display:'grid', gridTemplateColumns:item.phone?'1fr 1fr':'1fr', gap:6 }}>
            <CompactField icon="📍" label="LOCATION" val={item.location} T={T}/>
            {item.phone && <CompactField icon="📞" label="CONTACT" val={item.phone} T={T}/>}
          </div>

          {/* ROW: Uploader (full row, single line) */}
          {item.uploaderName && (
            <CompactField icon="👤" label="UPLOADED BY" val={item.uploaderName} T={T}/>
          )}

          {/* Description — flex grows to fill remaining space, 3-line clamp */}
          {item.desc && (
            <div style={{
              flex:1, minHeight:0,
              padding:'8px 10px',
              background:T.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',
              border:`1px solid ${T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'}`,
              borderRadius:8,
              display:'flex', flexDirection:'column', gap:3,
            }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:0.4,
                fontFamily:"'Barlow Condensed',sans-serif",
                color:T.isDark?'rgba(255,255,255,0.5)':T.textMuted,
                textTransform:'uppercase' }}>📝 DESCRIPTION</div>
              <div style={{
                fontFamily:"'Noto Sans Telugu',sans-serif",
                fontSize:12, fontWeight:500, lineHeight:1.55,
                color:T.isDark?'rgba(255,255,255,0.85)':'#0a0a14',
                whiteSpace:'pre-line', wordBreak:'break-word',
                display:'-webkit-box', WebkitLineClamp:5, WebkitBoxOrient:'vertical',
                overflow:'hidden',
              }}>{item.desc}</div>
            </div>
          )}

        </div>

        {/* ══ CONTACT BUTTONS — only for Jobs / Car Sales / House Rents.
              Pinned just above the action bar (flexShrink:0 so always visible). ══ */}
        {showContact && item.phone && (
          <div style={{ flexShrink:0, display:'flex', gap:8,
            padding:'0 14px 8px' }}>
            <button
              onClick={()=>window.open(`tel:+91${item.phone?.replace(/\s/g,'')}`, '_blank')}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                background:'linear-gradient(135deg,#059669,#047857)',
                border:'none', borderRadius:10, padding:'10px',
                fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
                fontSize:13, color:'white', cursor:'pointer',
                boxShadow:'0 3px 12px rgba(5,150,105,0.35)', letterSpacing:0.4 }}>
              📞 కాల్ చేయండి / Call
            </button>
            <button
              onClick={()=>window.open(`https://wa.me/91${item.phone?.replace(/\s/g,'')}?text=${encodeURIComponent(`నమస్కారం, LocalAI TV లో మీ "${item.title}" చూశాను. మరిన్ని వివరాలు కావాలి.`)}`, '_blank')}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                background:'linear-gradient(135deg,#25D366,#128C7E)',
                border:'none', borderRadius:10, padding:'10px',
                fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
                fontSize:13, color:'white', cursor:'pointer',
                boxShadow:'0 3px 12px rgba(37,211,102,0.35)', letterSpacing:0.4 }}>
              💬 WhatsApp
            </button>
          </div>
        )}

        {/* ══ ACTION BAR — 5 buttons (Like · Dislike · Comment · Views · Share).
              flexShrink:0 + explicit margin so it's always visible at the bottom. ══ */}
        <div style={{ flexShrink:0, display:'flex', alignItems:'center', gap:4,
          padding:'8px 14px 10px',
          borderTop:`1px solid ${T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
          background: T.isDark?'rgba(0,0,0,0.6)':'rgba(255,255,255,0.95)',
          backdropFilter:'blur(8px)',
        }}>

          {/* Like — hover: lift + blue glow */}
          <button onClick={handleLike}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(59,143,255,0.35)';
              e.currentTarget.style.borderColor='rgba(59,143,255,0.55)';
              e.currentTarget.style.background='rgba(59,143,255,0.12)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor= liked ? 'rgba(59,143,255,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)');
              e.currentTarget.style.background= liked ? 'rgba(59,143,255,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)');
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background: liked ? 'rgba(59,143,255,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)'),
            border: `1px solid ${liked ? 'rgba(59,143,255,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)')}`,
            borderRadius:11, padding:'8px 4px',
            cursor:'pointer', transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <svg width={20} height={20} viewBox="0 0 24 24"
              fill={liked ? '#3B8FFF' : 'none'}
              stroke={liked ? '#3B8FFF' : (T.isDark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.7)')}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: liked ? 'scale(1.12)' : 'scale(1)', transition:'transform 0.18s' }}>
              <path d="M7 10v12"/>
              <path d="M15 5.88 14 12h5.5a2 2 0 0 1 2 2.26l-1.1 7A2 2 0 0 1 18.44 23H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h2.83a2 2 0 0 0 1.92-1.45l1.9-6.55A.9.9 0 0 1 14.74 0 2.26 2.26 0 0 1 17 2.26V5.88Z"/>
            </svg>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color: liked ? '#3B8FFF' : (T.isDark?'rgba(255,255,255,0.6)':T.textMuted) }}>
              {likeCount}
            </span>
          </button>

          {/* Dislike — hover: lift + orange glow */}
          <button onClick={handleDislike}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(255,149,0,0.35)';
              e.currentTarget.style.borderColor='rgba(255,149,0,0.55)';
              e.currentTarget.style.background='rgba(255,149,0,0.12)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor= disliked ? 'rgba(255,149,0,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)');
              e.currentTarget.style.background= disliked ? 'rgba(255,149,0,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)');
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background: disliked ? 'rgba(255,149,0,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)'),
            border: `1px solid ${disliked ? 'rgba(255,149,0,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)')}`,
            borderRadius:11, padding:'8px 4px',
            cursor:'pointer', transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <svg width={20} height={20} viewBox="0 0 24 24"
              fill={disliked ? '#FF9500' : 'none'}
              stroke={disliked ? '#FF9500' : (T.isDark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.7)')}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: disliked ? 'scale(1.12)' : 'scale(1)', transition:'transform 0.18s' }}>
              <path d="M17 14V2"/>
              <path d="M9 18.12 10 12H4.5a2 2 0 0 1-2-2.26l1.1-7A2 2 0 0 1 5.56 1H17a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-2.83a2 2 0 0 0-1.92 1.45l-1.9 6.55A.9.9 0 0 1 9.26 24 2.26 2.26 0 0 1 7 21.74V18.12Z"/>
            </svg>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color: disliked ? '#FF9500' : (T.isDark?'rgba(255,255,255,0.5)':T.textMuted) }}>Dislike</span>
          </button>

          {/* Comment — hover: lift + teal glow */}
          <button onClick={onComment}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(0,131,143,0.35)';
              e.currentTarget.style.borderColor='rgba(0,131,143,0.55)';
              e.currentTarget.style.background='rgba(0,131,143,0.12)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor= T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
              e.currentTarget.style.background= T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background: T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)',
            border:`1px solid ${T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'}`,
            borderRadius:11, padding:'8px 4px', cursor:'pointer',
            transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <span style={{ fontSize:19 }}>💬</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color: T.isDark?'rgba(255,255,255,0.45)':T.textMuted }}>Comment</span>
          </button>

          {/* Views — hover: lift + violet glow (non-interactive but still feels responsive) */}
          <div
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(123,31,162,0.35)';
              e.currentTarget.style.borderColor='rgba(123,31,162,0.55)';
              e.currentTarget.style.background='rgba(123,31,162,0.12)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor= T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
              e.currentTarget.style.background= T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background: T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)',
            border:`1px solid ${T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'}`,
            borderRadius:11, padding:'8px 4px',
            userSelect:'none',
            transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <span style={{ fontSize:19 }}>👁</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color: T.isDark?'rgba(255,255,255,0.7)':T.text }}>
              {item.views || '0'}
            </span>
          </div>

          {/* Share — hover: lift + gold glow */}
          <button onClick={onShare}
            onMouseEnter={e=>{
              e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
              e.currentTarget.style.boxShadow='0 4px 14px rgba(255,184,0,0.4)';
              e.currentTarget.style.borderColor='rgba(255,184,0,0.55)';
              e.currentTarget.style.background='rgba(255,184,0,0.14)';
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.transform='translateY(0) scale(1)';
              e.currentTarget.style.boxShadow='none';
              e.currentTarget.style.borderColor= T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
              e.currentTarget.style.background= T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)';
            }}
            style={{
            flex:1, display:'flex', flexDirection:'column',
            alignItems:'center', gap:3,
            background: T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)',
            border:`1px solid ${T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'}`,
            borderRadius:11, padding:'8px 4px', cursor:'pointer',
            transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
              stroke={T.isDark?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)'}
              strokeWidth={2.2} strokeLinecap="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:9, fontWeight:800, letterSpacing:0.3,
              color: T.isDark?'rgba(255,255,255,0.45)':T.textMuted }}>Share</span>
          </button>
        </div>
        {/* Swipe-up hint removed — layout fits without scroll */}
      </div>
    </div>
  );
}


export { ClassifiedFeedItem };
export default ClassifiedFeedItem;
