import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BulletinPlayerScreen from './BulletinPlayerScreen.jsx';
import CommentDrawer from './../components/sheets/CommentDrawer.jsx';
import Logo from './../components/Logo.jsx';
import NewsShareSheet from './../components/Feed/NewsShareSheet.jsx';

function DistrictNewsFeedScreen({ onClose, startCat = 'All', startIdx = 0, items, disableCategoryFilter = false }) {
  const { T } = useAppTheme();

  // Caller can inject a custom item list (e.g. live incidents from
  // /api/incidents); falls back to the bundled NEWS_ITEMS otherwise.
  // When disableCategoryFilter is true, the bottom pill bar still renders
  // and tapping a pill still highlights it, but the visible list does
  // NOT filter — useful for sources without a news taxonomy.
  const sourceItems = items || NEWS_ITEMS;

  // ── State ─────────────────────────────────────────────────────
  const [activeCat,   setActiveCat]   = useState(startCat);
  const [activeId,    setActiveId]    = useState(null);
  const [showShare,   setShowShare]   = useState(false);
  const [showComment, setShowComment] = useState(false);
  // 5-button action bar state (matches BulletinPlayerScreen)
  const [liked,       setLiked]       = useState(false);
  const [disliked,    setDisliked]    = useState(false);
  const [likeCount,   setLikeCount]   = useState(() => Math.floor(Math.random()*420) + 24);
  const catBarRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Filter + sort newest first within the active category. When
  // disableCategoryFilter is true the activeCat input is ignored — all
  // source items render regardless of pill selection.
  const filtered = useMemo(() => {
    const list = (disableCategoryFilter || activeCat === 'All')
      ? sourceItems
      : sourceItems.filter(n => n.cat === activeCat);
    return [...list].sort((a, b) =>
      new Date(b.uploadedAt || b.id * -1) - new Date(a.uploadedAt || a.id * -1)
    );
  }, [sourceItems, activeCat, disableCategoryFilter]);

  // When category changes, set the active item — startIdx ⇒ that index,
  // else first item. Skip the reset when disableCategoryFilter is true and
  // we already have an active item: pills should not bounce the player
  // back to its initial position when category filtering is off.
  useEffect(() => {
    if (filtered.length === 0) { setActiveId(null); return; }
    if (disableCategoryFilter && activeId) return;
    const want = (typeof startIdx === 'number' && startIdx < filtered.length) ? filtered[startIdx] : filtered[0];
    setActiveId(want.id);
  // activeId intentionally omitted from deps — including it would cause
  // the reset to fire every time we change activeId from inside the screen.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, startIdx, disableCategoryFilter]);

  const active    = filtered.find(b => b.id === activeId) || filtered[0];
  const remaining = useMemo(() => filtered.filter(b => b.id !== (active && active.id)), [filtered, active]);
  // List repeated 3× for the infinite-feel scrolling (360° cycle)
  const feed      = useMemo(() => [...remaining, ...remaining, ...remaining], [remaining]);

  // Reset Like/Dislike whenever the active item changes
  useEffect(() => {
    setLiked(false);
    setDisliked(false);
    setLikeCount(Math.floor(Math.random()*420) + 24);
  }, [activeId]);

  // Dynamic header: label + emoji + color all reflect the selected category
  const catConf = NEWS_CATS.find(c => c.id === activeCat) || NEWS_CATS[0];
  const catTeFull = (() => {
    const map = {
      All:'వార్తలు', District:'జిల్లా వార్తలు', State:'రాష్ట్ర వార్తలు', National:'జాతీయ వార్తలు',
      World:'ప్రపంచ వార్తలు', Sports:'క్రీడల వార్తలు', Agriculture:'వ్యవసాయ వార్తలు',
      Health:'ఆరోగ్య వార్తలు', Business:'వ్యాపార వార్తలు', Education:'విద్యా వార్తలు',
      Devotional:'భక్తి వార్తలు', Crime:'నేరాల వార్తలు', Weather:'వాతావరణ వార్తలు',
    };
    return map[activeCat] || ((catConf.label || 'వార్తలు') + ' వార్తలు');
  })();
  const catEnFull = (() => {
    const map = {
      All:'All News', District:'District News', State:'State News', National:'National News',
      World:'World News', Sports:'Sports News', Agriculture:'Agriculture News',
      Health:'Health News', Business:'Business News', Education:'Education News',
      Devotional:'Devotional News', Crime:'Crime News', Weather:'Weather News',
    };
    return map[activeCat] || 'News';
  })();

  // Always literal date like "10 May 2026". Many NEWS_ITEMS don't have uploadedAt — fall back
  // to today's date so the label is never empty in the meta row.
  const dateLabel = (iso) => {
    const d = iso ? new Date(iso) : new Date();
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  };

  // Strip trailing " — <date>" patterns so the date isn't duplicated
  const cleanTitle = (text) => {
    if (!text) return '';
    return text.replace(/\s*[—–-]\s*[^—–-]*?20\d{2}[^—–-]*$/, '').trim();
  };

  const handlePick = (id) => {
    setActiveId(id);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const handleCatChange = (cat) => {
    setActiveCat(cat);
    setTimeout(() => {
      if (catBarRef.current) {
        const btn = catBarRef.current.querySelector(`[data-cat="${cat}"]`);
        if (btn) btn.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' });
      }
    }, 50);
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Empty-state fallback
  if (!active) return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:T.bg,
      display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{
        background:'linear-gradient(135deg,#E8001E 0%,#D0021B 100%)',
        padding:'52px 14px 14px', display:'flex', alignItems:'center', gap:12, flexShrink:0,
      }}>
        <button onClick={onClose} style={{
          width:38, height:38, borderRadius:'50%', flexShrink:0,
          background:'rgba(0,0,0,0.25)', border:'1.5px solid rgba(255,255,255,0.25)',
          color:'#FFFFFF', fontSize:18, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>←</button>
        <div style={{ flex:1, textAlign:'center' }}>
          <div style={{ fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
            fontWeight:900, fontSize:18, color:'#FFFFFF' }}>
            {catConf.emoji} {catTeFull}
          </div>
        </div>
        <div style={{width:38, flexShrink:0}}/>
      </div>
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12}}>
        <span style={{fontSize:48}}>📰</span>
        <span style={{fontFamily:"'Noto Sans Telugu',sans-serif", fontSize:16, color:T.textMuted}}>వార్తలు లేవు</span>
      </div>
    </div>
  );

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:300, background:T.bg,
      display:'flex', flexDirection:'column', overflow:'hidden',
    }}>
      {/* ── HEADER — unified red gradient matching BulletinPlayerScreen so all
            news-category viewing pages share one Local AI TV identity. Title
            still reflects the active category so users know what they're
            viewing, but the visual frame is now category-agnostic. ── */}
      <div style={{
        background:'linear-gradient(135deg,#E8001E 0%,#D0021B 100%)',
        padding:'52px 14px 14px',
        display:'flex', alignItems:'center', gap:12, flexShrink:0, zIndex:30,
      }}>
        <button onClick={onClose} style={{
          width:38, height:38, borderRadius:'50%', flexShrink:0,
          background:'rgba(0,0,0,0.25)', border:'1.5px solid rgba(255,255,255,0.25)',
          color:'#FFFFFF', fontSize:18, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>←</button>
        <div style={{ flex:1, minWidth:0, textAlign:'center' }}>
          <div style={{ fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
            fontWeight:900, fontSize:18, color:'#FFFFFF', lineHeight:1.2,
            display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
            <span>{catConf.emoji}</span><span>{catTeFull}</span>
          </div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:600, fontSize:11, color:'rgba(255,255,255,0.85)',
            letterSpacing:0.6, marginTop:2 }}>
            {catEnFull} · Tap any thumbnail to play here
          </div>
        </div>
        <div style={{ width:38, flexShrink:0 }}/>
      </div>

      {/* ── BODY — sticky player + naturally-flowing list (no gap, same as BulletinPlayerScreen) ── */}
      <div ref={scrollRef} style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch',
        background:T.isDark?'#050a14':'#F5F6F8',
        paddingBottom:90 /* room for the bottom category bar */}}>

        {/* Sticky active player — pins at top of scroll container, NO gap below */}
        {active && (
          <div style={{
            position:'sticky', top:0, zIndex:5,
            background:T.bg,
            boxShadow:'0 4px 14px rgba(0,0,0,0.18)',
          }}>
            {/* 16:9 media container — locked to the same aspect ratio
                BulletinPlayerScreen uses so all news category pages share
                one viewing experience. Vertical videos are letterboxed
                (YouTube auto-handles black bars within the iframe).
                Per Mohan's "Same height, Same width, Same layout
                proportions" directive — unified over per-item aspect. */}
            <div style={{ position:'relative', paddingBottom:'56.25%', height:0, background:'#000' }}>
              {active.ytId ? (
                <iframe
                  key={active.id}
                  style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }}
                  src={`https://www.youtube.com/embed/${active.ytId}?autoplay=1&mute=0&modestbranding=1&rel=0&playsinline=1&controls=1&fs=1&enablejsapi=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={active.titleEn || active.title}
                />
              ) : active.mediaUrl ? (
                // Direct S3 / HLS video (incidents from /api/incidents).
                // objectFit:contain so vertical clips letterbox cleanly
                // inside the 16:9 frame instead of being cropped.
                <video
                  key={active.id}
                  src={active.mediaUrl}
                  poster={active.thumbnail || undefined}
                  controls
                  autoPlay
                  playsInline
                  style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'contain', background:'#000' }}
                />
              ) : (
                <img
                  src={active.thumbnail}
                  alt={active.title}
                  style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                  onError={e => { e.target.style.display='none'; }}
                />
              )}
              <div style={{ position:'absolute', top:10, right:10, zIndex:6,
                background:'rgba(0,0,0,0.55)', borderRadius:5, padding:'2px 6px',
                pointerEvents:'none', backdropFilter:'blur(2px)' }}>
                <Logo size="xs" dark={true} showTV={true}/>
              </div>
            </div>

            {/* Centered headline (matches BulletinPlayerScreen) */}
            <div style={{padding:'12px 14px 8px', background:T.bg2, textAlign:'center'}}>
              <h3 style={{margin:0,
                fontFamily:"'Noto Sans Telugu',sans-serif",
                fontWeight:800, fontSize:18.5, lineHeight:1.4, color:T.text,
                textAlign:'center',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                overflow:'hidden'}}>{cleanTitle(active.title)}</h3>
            </div>

            {/* ONE-LINE META + ACTION BAR — date on left, 5 compact buttons on right */}
            <div style={{display:'flex', alignItems:'center', gap:6,
              padding:'4px 14px 10px', background:T.bg2,
              borderBottom:`1px solid ${T.border}`, flexWrap:'wrap'}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:11, fontWeight:600, color:T.textMuted, whiteSpace:'nowrap'}}>
                📅 {dateLabel(active.uploadedAt)}
              </span>

              <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:3}}>
                {/* Like — blue */}
                <button onClick={() => { setLiked(l => { const n=!l; setLikeCount(c=>c+(n?1:-1)); return n; }); setDisliked(false); }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-1px) scale(1.06)';
                    e.currentTarget.style.boxShadow='0 3px 10px rgba(59,143,255,0.45)';
                    e.currentTarget.style.borderColor='rgba(59,143,255,0.55)';
                    e.currentTarget.style.background='rgba(59,143,255,0.18)';
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform='translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow='none';
                    e.currentTarget.style.borderColor = liked ? 'rgba(59,143,255,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)');
                    e.currentTarget.style.background   = liked ? 'rgba(59,143,255,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)');
                  }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:3,
                    background: liked ? 'rgba(59,143,255,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)'),
                    border: `1px solid ${liked ? 'rgba(59,143,255,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)')}`,
                    borderRadius:9, padding:'4px 7px', cursor:'pointer',
                    transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)'}}>
                  <svg width={9} height={9} viewBox="0 0 24 24"
                    fill={liked ? '#3B8FFF' : 'none'}
                    stroke={liked ? '#3B8FFF' : (T.isDark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.7)')}
                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 10v12"/>
                    <path d="M15 5.88 14 12h5.5a2 2 0 0 1 2 2.26l-1.1 7A2 2 0 0 1 18.44 23H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h2.83a2 2 0 0 0 1.92-1.45l1.9-6.55A.9.9 0 0 1 14.74 0 2.26 2.26 0 0 1 17 2.26V5.88Z"/>
                  </svg>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:800, letterSpacing:0.3,
                    color: liked ? '#3B8FFF' : (T.isDark?'rgba(255,255,255,0.65)':T.textMuted)}}>{likeCount}</span>
                </button>

                {/* Dislike — orange */}
                <button onClick={() => { setDisliked(d => !d); if (liked) { setLiked(false); setLikeCount(c=>Math.max(0,c-1)); } }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-1px) scale(1.06)';
                    e.currentTarget.style.boxShadow='0 3px 10px rgba(255,149,0,0.45)';
                    e.currentTarget.style.borderColor='rgba(255,149,0,0.55)';
                    e.currentTarget.style.background='rgba(255,149,0,0.18)';
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform='translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow='none';
                    e.currentTarget.style.borderColor = disliked ? 'rgba(255,149,0,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)');
                    e.currentTarget.style.background   = disliked ? 'rgba(255,149,0,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)');
                  }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:3,
                    background: disliked ? 'rgba(255,149,0,0.18)' : (T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)'),
                    border: `1px solid ${disliked ? 'rgba(255,149,0,0.5)' : (T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)')}`,
                    borderRadius:9, padding:'4px 7px', cursor:'pointer',
                    transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)'}}>
                  <svg width={9} height={9} viewBox="0 0 24 24"
                    fill={disliked ? '#FF9500' : 'none'}
                    stroke={disliked ? '#FF9500' : (T.isDark?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.7)')}
                    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 14V2"/>
                    <path d="M9 18.12 10 12H4.5a2 2 0 0 1-2-2.26l1.1-7A2 2 0 0 1 5.56 1H17a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-2.83a2 2 0 0 0-1.92 1.45l-1.9 6.55A.9.9 0 0 1 9.26 24 2.26 2.26 0 0 1 7 21.74V18.12Z"/>
                  </svg>
                </button>

                {/* Comment — teal */}
                <button onClick={() => setShowComment(true)}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-1px) scale(1.06)';
                    e.currentTarget.style.boxShadow='0 3px 10px rgba(0,200,184,0.45)';
                    e.currentTarget.style.borderColor='rgba(0,200,184,0.55)';
                    e.currentTarget.style.background='rgba(0,200,184,0.18)';
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform='translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow='none';
                    e.currentTarget.style.borderColor = T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
                    e.currentTarget.style.background   = T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)';
                  }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:3,
                    background: T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)',
                    border:`1px solid ${T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'}`,
                    borderRadius:9, padding:'4px 7px', cursor:'pointer',
                    transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)'}}>
                  <span style={{fontSize:9}}>💬</span>
                </button>

                {/* Views — violet */}
                <div
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-1px) scale(1.06)';
                    e.currentTarget.style.boxShadow='0 3px 10px rgba(123,31,162,0.45)';
                    e.currentTarget.style.borderColor='rgba(123,31,162,0.55)';
                    e.currentTarget.style.background='rgba(123,31,162,0.18)';
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform='translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow='none';
                    e.currentTarget.style.borderColor = T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)';
                    e.currentTarget.style.background   = T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)';
                  }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:3,
                    background: T.isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.04)',
                    border:`1px solid ${T.isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'}`,
                    borderRadius:9, padding:'4px 7px', userSelect:'none',
                    transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)'}}>
                  <span style={{fontSize:9}}>👁</span>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:800, letterSpacing:0.3,
                    color: T.isDark?'rgba(255,255,255,0.7)':T.text}}>{active.views || '0'}</span>
                </div>

                {/* Share — RED prominent */}
                <button onClick={() => setShowShare(true)}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform='translateY(-1px) scale(1.08)';
                    e.currentTarget.style.boxShadow='0 5px 14px rgba(208,2,27,0.55)';
                    e.currentTarget.style.background='linear-gradient(135deg,#FF1A35,#C8001F)';
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform='translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow='0 2px 8px rgba(208,2,27,0.4)';
                    e.currentTarget.style.background='linear-gradient(135deg,#E8001E,#B0001A)';
                  }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:3,
                    background:'linear-gradient(135deg,#E8001E,#B0001A)',
                    border:'1px solid rgba(208,2,27,0.55)',
                    borderRadius:9, padding:'4px 8px', cursor:'pointer',
                    boxShadow:'0 2px 8px rgba(208,2,27,0.4)',
                    transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)'}}>
                  <svg width={9} height={9} viewBox="0 0 24 24" fill="none"
                    stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:800, letterSpacing:0.4, color:'#FFFFFF'}}>Share</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable list of OTHER items — flows naturally below the sticky player, ZERO GAP */}
        {feed.length === 0 ? (
          <div style={{textAlign:'center', padding:'40px 12px',
            color:T.textMuted, fontFamily:"'Noto Sans Telugu',sans-serif", fontSize:13}}>
            ఈ విభాగంలో మరిన్ని వార్తలు లేవు. <br/>
            <span style={{fontSize:11, color:T.textMuted, opacity:0.7}}>No more items in this category.</span>
          </div>
        ) : (
          feed.map((b, i) => {
            const bCat = NEWS_CATS.find(c => c.id === b.cat) || NEWS_CATS[0];
            return (
              <div key={`row-${i}`}
                onClick={() => handlePick(b.id)}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px) scale(1.01)'; e.currentTarget.style.boxShadow=`0 6px 20px ${bCat.color}33`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow=T.isDark?'none':'0 2px 10px rgba(0,0,0,0.06)'; }}
                style={{
                  background:T.bg2,
                  margin:'12px 12px 0',
                  borderRadius:12,
                  border:`1px solid ${T.border}`,
                  boxShadow:T.isDark?'none':'0 2px 10px rgba(0,0,0,0.06)',
                  cursor:'pointer',
                  display:'flex', flexDirection:'column', overflow:'hidden',
                  transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)',
                }}>
                {/* 16:9 thumbnail */}
                <div style={{position:'relative', paddingBottom:'56.25%', height:0, background:'#000'}}>
                  <img
                    src={b.thumbnail || (b.ytId ? `https://img.youtube.com/vi/${b.ytId}/hqdefault.jpg` : '')}
                    alt={b.title}
                    style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                    onError={e=>{e.target.style.display='none'; e.target.parentNode.style.background='#1a0010';}}
                  />
                  {(b.ytId || b.mediaUrl) && (
                    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
                      <div style={{width:44, height:44, borderRadius:'50%',
                        background:'rgba(255,255,255,0.88)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow:'0 2px 8px rgba(0,0,0,0.35)'}}>
                        <div style={{width:0, height:0, marginLeft:4,
                          borderTop:'8px solid transparent',
                          borderBottom:'8px solid transparent',
                          borderLeft:'12px solid #1A237E'}}/>
                      </div>
                    </div>
                  )}
                </div>
                {/* Headline + mini date + mini 5-action bar (matches BulletinPlayerScreen list cards) */}
                <div style={{padding:'10px 14px 12px'}}>
                  <div style={{
                    fontFamily:"'Noto Sans Telugu',sans-serif",
                    fontWeight:800, fontSize:14, lineHeight:1.4, color:T.text,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                    overflow:'hidden'}}>{cleanTitle(b.title)}</div>

                  <div style={{display:'flex', alignItems:'center', gap:5,
                    marginTop:5, flexWrap:'wrap'}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:8.5, fontWeight:600, color:T.textMuted, whiteSpace:'nowrap'}}>
                      📅 {dateLabel(b.uploadedAt)}
                    </span>
                    <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:2}}>
                      <span style={{display:'inline-flex', alignItems:'center', gap:2,
                        background: T.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',
                        border:`1px solid ${T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
                        borderRadius:6, padding:'1.5px 4px'}}>
                        <svg width={6} height={6} viewBox="0 0 24 24" fill="none"
                          stroke={T.isDark?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)'}
                          strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 10v12"/>
                          <path d="M15 5.88 14 12h5.5a2 2 0 0 1 2 2.26l-1.1 7A2 2 0 0 1 18.44 23H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4h2.83a2 2 0 0 0 1.92-1.45l1.9-6.55A.9.9 0 0 1 14.74 0 2.26 2.26 0 0 1 17 2.26V5.88Z"/>
                        </svg>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                          fontSize:7, fontWeight:800, letterSpacing:0.2,
                          color:T.isDark?'rgba(255,255,255,0.55)':T.textMuted}}>{b.likes || ''}</span>
                      </span>
                      <span style={{display:'inline-flex', alignItems:'center',
                        background: T.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',
                        border:`1px solid ${T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
                        borderRadius:6, padding:'1.5px 4px'}}>
                        <svg width={6} height={6} viewBox="0 0 24 24" fill="none"
                          stroke={T.isDark?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)'}
                          strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 14V2"/>
                          <path d="M9 18.12 10 12H4.5a2 2 0 0 1-2-2.26l1.1-7A2 2 0 0 1 5.56 1H17a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4h-2.83a2 2 0 0 0-1.92 1.45l-1.9 6.55A.9.9 0 0 1 9.26 24 2.26 2.26 0 0 1 7 21.74V18.12Z"/>
                        </svg>
                      </span>
                      <span style={{display:'inline-flex', alignItems:'center',
                        background: T.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',
                        border:`1px solid ${T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
                        borderRadius:6, padding:'1.5px 4px'}}>
                        <span style={{fontSize:6}}>💬</span>
                      </span>
                      <span style={{display:'inline-flex', alignItems:'center', gap:2,
                        background: T.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',
                        border:`1px solid ${T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
                        borderRadius:6, padding:'1.5px 4px'}}>
                        <span style={{fontSize:6}}>👁</span>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                          fontSize:7, fontWeight:800, letterSpacing:0.2,
                          color:T.isDark?'rgba(255,255,255,0.65)':T.text}}>{b.views || ''}</span>
                      </span>
                      <span style={{display:'inline-flex', alignItems:'center', gap:2,
                        background:'linear-gradient(135deg,#E8001E,#B0001A)',
                        border:'1px solid rgba(208,2,27,0.5)',
                        borderRadius:6, padding:'1.5px 5px',
                        boxShadow:'0 1px 4px rgba(208,2,27,0.3)'}}>
                        <svg width={6} height={6} viewBox="0 0 24 24" fill="none"
                          stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                          fontSize:7, fontWeight:800, letterSpacing:0.3, color:'#FFFFFF'}}>Share</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div style={{textAlign:'center', padding:'18px 12px 8px',
          fontFamily:"'Barlow Condensed',sans-serif",
          fontSize:11, color:T.textMuted, letterSpacing:0.6}}>
          — Scrolls endlessly · tap any card to play it at the top —
        </div>
      </div>

      {/* ── BOTTOM CATEGORY BAR — horizontal, hover-highlighted, dynamic accent ── */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:25,
        background: T.isDark
          ? 'linear-gradient(0deg,rgba(0,0,0,0.97) 0%,rgba(0,0,0,0.85) 100%)'
          : 'linear-gradient(0deg,rgba(255,255,255,0.98) 0%,rgba(248,250,255,0.95) 100%)',
        borderTop:`1px solid ${T.border}`,
        backdropFilter:'blur(12px)',
        paddingBottom:8,
      }}>
        <div ref={catBarRef} style={{
          display:'flex', flexWrap:'nowrap',
          overflowX:'auto', scrollbarWidth:'none',
          WebkitOverflowScrolling:'touch',
          padding:'8px 10px 4px', gap:6,
        }}>
          {NEWS_CATS.filter(cat => disableCategoryFilter || cat.id === 'All' || sourceItems.some(n => n.cat === cat.id)).map(cat => {
            const isActive = activeCat === cat.id;
            const count = cat.id === 'All'
              ? sourceItems.length
              : sourceItems.filter(n => n.cat === cat.id).length;
            return (
              <button
                key={cat.id}
                data-cat={cat.id}
                onClick={() => handleCatChange(cat.id)}
                onMouseEnter={e=>{
                  e.currentTarget.style.transform = isActive ? 'translateY(-2px) scale(1.08)' : 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = `0 6px 18px ${cat.color}66`;
                  if (!isActive) {
                    e.currentTarget.style.background  = `${cat.color}1F`;
                    e.currentTarget.style.borderColor = `${cat.color}55`;
                  }
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
                  e.currentTarget.style.boxShadow = isActive ? `0 4px 14px ${cat.color}44` : 'none';
                  if (!isActive) {
                    e.currentTarget.style.background  = T.bg3;
                    e.currentTarget.style.borderColor = T.border;
                  }
                }}
                style={{
                  flexShrink:0, whiteSpace:'nowrap',
                  display:'flex', alignItems:'center', gap:5,
                  padding:'7px 13px', borderRadius:22,
                  background: isActive
                    ? `linear-gradient(135deg,${cat.color},${cat.color}cc)`
                    : T.bg3,
                  border:`1.5px solid ${isActive ? 'transparent' : T.border}`,
                  cursor:'pointer',
                  transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                  boxShadow: isActive ? `0 4px 14px ${cat.color}44` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}>
                <span style={{fontSize:14}}>{cat.emoji}</span>
                <div>
                  <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",
                    fontSize:11, fontWeight:700,
                    color: isActive ? 'white' : T.text, lineHeight:1.2}}>{cat.label}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:9, fontWeight:700,
                    color: isActive ? 'rgba(255,255,255,0.7)' : T.textMuted, lineHeight:1}}>{count} posts</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showShare && active && (
        <NewsShareSheet item={active} onClose={() => setShowShare(false)} />
      )}
      {showComment && (
        <CommentDrawer open={true} onClose={() => setShowComment(false)} itemId={active?.id} />
      )}
    </div>
  );
}


export { DistrictNewsFeedScreen };
export default DistrictNewsFeedScreen;
