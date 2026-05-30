import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import FeedItem from './FeedItem.jsx';
import TerminalContinuationCard from './TerminalContinuationCard.jsx';

function UnifiedFeedViewer({ type, items, startIdx, onClose, title, activeChannel }) {
  const { T } = useAppTheme();
  const feedItems   = useMemo(()=>buildFeedItems(type, items, activeChannel?.nameEn), [type, items]);
  const [idx, setIdx]           = useState(startIdx || 0);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const total   = feedItems.length;
  const cur     = feedItems[idx] || feedItems[0];

  // Phase 6.5 — terminal continuation card. Shorts only (the addictive
  // surface). For other types, the existing edge-bounce behavior is
  // more appropriate (bulletins/classifieds/news are finite content
  // the user explicitly opened).
  const hasTerminal  = type === 'shorts';
  const TERMINAL_IDX = feedItems.length;             // virtual index for the terminal
  const lastNavIdx   = hasTerminal ? TERMINAL_IDX : feedItems.length - 1;
  const onTerminal   = hasTerminal && idx === TERMINAL_IDX;
  const isShareable  = !onTerminal && cur;           // disable share on terminal

  /* ═══════════════════════════════════════════════════════════════════
     PHASE-6 ELITE SHORTS POLISH — drag-with-peek + velocity-aware snap
     ───────────────────────────────────────────────────────────────────
     Replaces the old touchend-only swipe with real-time drag tracking:
     - As the user drags, the feed translates with their finger
     - Adjacent items (prev/next) peek into view at the edges
     - On release: snap based on (a) distance > 25% viewport OR (b)
       velocity > 0.55 px/ms — fast flick wins over short distance
     - Edge resistance: at idx 0 dragging down (or idx last up), drag
       is dampened to 35% — communicates "you're at the edge"
     - Snap duration scales with velocity (fast flick = snappier feel)
     - Adjacent FeedItems mount but isActive=false → they show
       thumbnails only, no video iframe (perf-safe, no audio bleed)
     ═══════════════════════════════════════════════════════════════════ */
  const [dragOffset, setDragOffset] = useState(0); // px; positive = finger moved down
  const [isSnapping, setIsSnapping] = useState(false); // controls transition vs raw transform
  const [snapDur,    setSnapDur]    = useState(220);   // ms; adapts to flick velocity
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(0);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const touchStartT = useRef(0);
  const touchLastY  = useRef(0);
  const touchLastT  = useRef(0);
  const moved       = useRef(false);
  const horizGuess  = useRef(false); // locks once we determine drag is horizontal

  // Lock body scroll
  useEffect(()=>{ document.body.style.overflow='hidden'; return ()=>{ document.body.style.overflow=''; }; },[]);

  // Measure container height for the drag-with-peek layout
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerH(containerRef.current.clientHeight);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Snappy spring curve — overshoots slightly on settle for premium feel.
  // Used for both forward navigation and spring-back.
  const SNAP_CURVE = 'cubic-bezier(0.34,1.56,0.64,1)';

  const goNext = (velocity = 0) => {
    if (idx >= lastNavIdx) {
      // Edge: spring back to 0
      setIsSnapping(true);
      setSnapDur(260);
      setDragOffset(0);
      setTimeout(()=>setIsSnapping(false), 260);
      return;
    }
    const dur = velocity > 1.2 ? 180 : velocity > 0.6 ? 220 : 280;
    setSnapDur(dur);
    setIsSnapping(true);
    setDragOffset(-containerH); // animate current item off the top
    setTimeout(() => {
      setIsSnapping(false);
      setDragOffset(0);
      setIdx(i => i + 1);
    }, dur);
  };
  const goPrev = (velocity = 0) => {
    if (idx <= 0) {
      setIsSnapping(true);
      setSnapDur(260);
      setDragOffset(0);
      setTimeout(()=>setIsSnapping(false), 260);
      return;
    }
    const dur = velocity > 1.2 ? 180 : velocity > 0.6 ? 220 : 280;
    setSnapDur(dur);
    setIsSnapping(true);
    setDragOffset(containerH); // animate current item off the bottom
    setTimeout(() => {
      setIsSnapping(false);
      setDragOffset(0);
      setIdx(i => i - 1);
    }, dur);
  };

  const onTouchStart = e => {
    if (isSnapping) return; // ignore touches mid-animation
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    touchStartT.current = performance.now();
    touchLastY.current  = touchStartY.current;
    touchLastT.current  = touchStartT.current;
    moved.current       = false;
    horizGuess.current  = false;
    setIsSnapping(false);
  };

  const onTouchMove = e => {
    if (isSnapping) return;
    const y  = e.touches[0].clientY;
    const x  = e.touches[0].clientX;
    const dy = y - touchStartY.current;
    const dx = x - touchStartX.current;

    // Determine drag axis once movement exceeds a small threshold
    if (!moved.current && Math.hypot(dx, dy) > 8) {
      moved.current = true;
      horizGuess.current = Math.abs(dx) > Math.abs(dy) * 1.4;
    }
    if (horizGuess.current) return; // let horizontal scroll happen elsewhere

    // Edge resistance: clamp at idx=0 (drag down) and idx=lastNavIdx (drag up).
    // lastNavIdx accounts for the terminal continuation card on shorts.
    let offset = dy;
    if (idx === 0 && dy > 0)              offset = dy * 0.35;
    else if (idx === lastNavIdx && dy < 0) offset = dy * 0.35;

    setDragOffset(offset);
    touchLastY.current = y;
    touchLastT.current = performance.now();
  };

  const onTouchEnd = e => {
    if (isSnapping || !moved.current || horizGuess.current) {
      // Treat as a tap or non-vertical gesture — spring back to 0
      if (dragOffset !== 0) {
        setIsSnapping(true);
        setSnapDur(220);
        setDragOffset(0);
        setTimeout(()=>setIsSnapping(false), 220);
      }
      return;
    }

    const dy = touchLastY.current - touchStartY.current; // total drag
    const dt = Math.max(1, touchLastT.current - touchStartT.current);
    const velocity = Math.abs(dy) / dt; // px/ms, magnitude

    const DIST_THRESH = Math.max(60, containerH * 0.22); // 22% of viewport
    const VEL_THRESH  = 0.55; // ~550 px/sec

    const wantNext = (dy < -DIST_THRESH || (dy < -20 && velocity > VEL_THRESH));
    const wantPrev = (dy >  DIST_THRESH || (dy >  20 && velocity > VEL_THRESH));

    if (wantNext)      goNext(velocity);
    else if (wantPrev) goPrev(velocity);
    else {
      // Spring back to 0
      setIsSnapping(true);
      setSnapDur(220);
      setDragOffset(0);
      setTimeout(()=>setIsSnapping(false), 220);
    }
  };

  // Keyboard nav
  useEffect(()=>{
    const h = e => {
      if (e.key==='ArrowUp')    goNext();
      if (e.key==='ArrowDown')  goPrev();
      if (e.key==='Escape')     onClose();
    };
    window.addEventListener('keydown', h);
    return ()=>window.removeEventListener('keydown', h);
  },[idx, containerH]);

  const shareText = cur ? encodeURIComponent(`${cur.headline}\n📱 LocalAI TV: https://localaitv.com/app`) : '';
  const enc = encodeURIComponent;

  const SHARE_PLATFORMS = [
    { label:'WhatsApp',  color:'#25D366', bg:'rgba(37,211,102,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#25D366"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.76 1.83 6.74L2 30l7.44-1.79A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.1 19.1c-.3.84-1.76 1.6-2.4 1.7-.62.1-1.4.14-2.26-.14a20.6 20.6 0 01-2.04-.75c-3.58-1.55-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7s.92-2.62 1.26-2.98c.3-.34.66-.42.88-.42l.64.01c.2 0 .48-.08.74.56.28.66.94 2.3.02 2.56-.18.06-.34.14-.5.22-.28.14-.52.3-.36.6.16.3.7 1.16 1.5 1.88l1.44 1.14c.3.16.6.12.82-.12.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.02.96 2.36 1.13.34.18.58.26.66.4.08.16.08.9-.22 1.74z"/></svg>,
      action:()=>window.open(`https://api.whatsapp.com/send?text=${shareText}`,'_blank') },
    { label:'Telegram',  color:'#0088CC', bg:'rgba(0,136,204,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#0088CC"><path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm6.84 9.58l-2.36 11.12c-.18.8-.64 1-1.3.62l-3.6-2.65-1.73 1.67c-.2.2-.36.36-.73.36l.26-3.68 6.7-6.05c.3-.26-.06-.4-.44-.14l-8.28 5.21-3.57-1.12c-.78-.24-.8-.78.16-1.15l13.93-5.37c.64-.24 1.2.14.96 1.18z"/></svg>,
      action:()=>window.open(`https://t.me/share/url?url=${enc('https://localaitv.com/app')}&text=${shareText}`,'_blank') },
    { label:'Facebook',  color:'#1877F2', bg:'rgba(24,119,242,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#1877F2"><path d="M16 2C8.27 2 2 8.27 2 16c0 6.99 5.12 12.77 11.81 13.82V19.9h-3.55V16h3.55v-3.08c0-3.51 2.09-5.44 5.28-5.44 1.53 0 3.12.27 3.12.27v3.44h-1.76c-1.73 0-2.27 1.07-2.27 2.17V16h3.87l-.62 3.9h-3.25v9.92C24.88 28.77 30 22.99 30 16c0-7.73-6.27-14-14-14z"/></svg>,
      action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc('https://localaitv.com/app')}`,'_blank') },
    { label:'X/Twitter', color:'#fff',    bg:'rgba(255,255,255,0.1)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="white"><path d="M18.24 14.17L27.1 4h-2.1l-7.7 8.95L11 4H4l9.3 13.53L4 28h2.1l8.13-9.45L21 28h7L18.24 14.17z"/></svg>,
      action:()=>window.open(`https://twitter.com/intent/tweet?text=${shareText}`,'_blank') },
    { label:'Email',     color:'#EA4335', bg:'rgba(234,67,53,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="28" height="20" rx="3" stroke="#EA4335" strokeWidth="2.2"/><path d="M2 10l14 9 14-9" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round"/></svg>,
      action:()=>window.open(`mailto:?subject=${enc(cur?.headline||'')}&body=${shareText}`,'_blank') },
    { label:'More',      color:'#9CA3AF', bg:'rgba(156,163,175,0.15)',
      icon:<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2.2} strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
      action:()=>navigator.share?navigator.share({title:cur?.headline,text:decodeURIComponent(shareText),url:'https://localaitv.com/app'}).catch(()=>{}):null },
  ];

  if (!cur) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300,
      background:'#000', display:'flex', flexDirection:'column',
      overflow:'hidden' }}>

      {/* ── TOP CHROME ── */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:20,
        paddingTop:52 }}>
        {/* Progress bars — on terminal, all bars read as completed */}
        <div style={{ display:'flex', gap:2, padding:'0 12px 10px' }}>
          {feedItems.map((_,i)=>(
            <div key={i} style={{ flex:1, height:2.5, borderRadius:2,
              background: onTerminal
                ? 'rgba(255,255,255,0.9)'
                : i<idx?'rgba(255,255,255,0.9)':i===idx?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.2)',
              transition:'background 0.3s' }}/>
          ))}
        </div>
        {/* Title bar */}
        <div style={{ display:'flex', alignItems:'center',
          padding:'0 14px 10px',
          background:'linear-gradient(180deg,rgba(0,0,0,0.75) 0%,transparent 100%)' }}>
          <button onClick={onClose} style={{ width:38,height:38,borderRadius:'50%',
            background:'rgba(0,0,0,0.55)',border:'1.5px solid rgba(255,255,255,0.22)',
            color:'white',fontSize:18,cursor:'pointer',flexShrink:0,
            display:'flex',alignItems:'center',justifyContent:'center' }}>←</button>
          <div style={{ flex:1, textAlign:'center' }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:800, fontSize:14,
              color:'white', letterSpacing:0.5 }}>{title}</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:11, color:'rgba(255,255,255,0.55)' }}>
              {onTerminal ? 'End of feed' : `${idx+1} / ${total}`}
            </div>
          </div>
          {/* Share button — hidden on terminal (nothing item-specific to share) */}
          {!onTerminal ? (
            <button onClick={()=>setShowShareSheet(true)} style={{ width:38,height:38,
              borderRadius:'50%',background:'rgba(0,0,0,0.55)',
              border:'1.5px solid rgba(255,255,255,0.22)',
              color:'white',cursor:'pointer',flexShrink:0,
              display:'flex',alignItems:'center',justifyContent:'center' }}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth={2.2} strokeLinecap="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          ) : (
            <div style={{ width:38, height:38, flexShrink:0 }}/>
          )}
        </div>
      </div>

      {/* ── SWIPE CONTAINER — Phase-6 drag-with-peek ── */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{ flex:1, position:'relative', overflow:'hidden', touchAction:'pan-y' }}>
        {containerH > 0 && (
          <>
            {/* PREV item — peeks from the top as user drags down. Base
                position above viewport; transform applies the live drag.
                When on terminal, prev is the last real item (feedItems[idx-1]
                resolves correctly via natural indexing). */}
            {idx > 0 && (
              <div
                style={{
                  position:'absolute',
                  left:0, right:0, top: -containerH,
                  height: containerH,
                  transform: `translateY(${dragOffset}px)`,
                  transition: isSnapping ? `transform ${snapDur}ms ${SNAP_CURVE}` : 'none',
                  willChange:'transform',
                }}>
                <FeedItem
                  item={feedItems[idx-1]}
                  isActive={false}
                  onShare={()=>setShowShareSheet(true)}
                />
              </div>
            )}

            {/* CURRENT item — follows the finger directly. Swaps to the
                TerminalContinuationCard when onTerminal. */}
            <div
              style={{
                position:'absolute',
                left:0, right:0, top:0,
                height: containerH,
                transform: `translateY(${dragOffset}px)`,
                transition: isSnapping ? `transform ${snapDur}ms ${SNAP_CURVE}` : 'none',
                willChange:'transform',
              }}>
              {onTerminal ? (
                <TerminalContinuationCard type={type} title={title}/>
              ) : (
                <FeedItem
                  item={cur}
                  isActive={!isSnapping && dragOffset === 0}
                  onShare={()=>setShowShareSheet(true)}
                />
              )}
            </div>

            {/* NEXT item — peeks from the bottom as user drags up. When the
                next position IS the terminal (only on shorts, idx === last
                real), render the TerminalContinuationCard as the peek. */}
            {idx < lastNavIdx && (
              <div
                style={{
                  position:'absolute',
                  left:0, right:0, top: containerH,
                  height: containerH,
                  transform: `translateY(${dragOffset}px)`,
                  transition: isSnapping ? `transform ${snapDur}ms ${SNAP_CURVE}` : 'none',
                  willChange:'transform',
                }}>
                {hasTerminal && (idx + 1) === TERMINAL_IDX ? (
                  <TerminalContinuationCard type={type} title={title}/>
                ) : (
                  <FeedItem
                    item={feedItems[idx+1]}
                    isActive={false}
                    onShare={()=>setShowShareSheet(true)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── SHARE SHEET ── */}
      {showShareSheet && (
        <div onClick={()=>setShowShareSheet(false)}
          style={{ position:'absolute', inset:0, zIndex:50,
            background:'rgba(0,0,0,0.65)',
            display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
          <div onClick={e=>e.stopPropagation()}
            style={{ background:'#111', borderRadius:'22px 22px 0 0',
              padding:'12px 0 40px',
              boxShadow:'0 -6px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ width:38,height:4,background:'rgba(255,255,255,0.18)',
              borderRadius:2,margin:'0 auto 16px' }}/>
            <div style={{ textAlign:'center', marginBottom:22,
              fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:800, fontSize:16, color:'white', letterSpacing:0.5 }}>
              Share this Story
            </div>
            <div style={{ display:'flex', flexWrap:'wrap',
              justifyContent:'center', gap:16, padding:'0 20px' }}>
              {SHARE_PLATFORMS.map(p=>(
                <div key={p.label}
                  onClick={()=>{ p.action(); setShowShareSheet(false); }}
                  style={{ display:'flex', flexDirection:'column',
                    alignItems:'center', gap:6, cursor:'pointer', width:68 }}>
                  <div style={{ width:56,height:56,borderRadius:18,
                    background:p.bg, border:`1.5px solid ${p.color}44`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:`0 2px 14px ${p.color}22` }}>
                    {p.icon}
                  </div>
                  <span style={{ fontFamily:"'Barlow',sans-serif", fontSize:10,
                    color:'rgba(255,255,255,0.65)', fontWeight:600,
                    textAlign:'center' }}>{p.label}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowShareSheet(false)}
              style={{ display:'block', margin:'22px auto 0',
                background:'rgba(255,255,255,0.07)',
                border:'1px solid rgba(255,255,255,0.14)',
                borderRadius:14, padding:'12px 48px',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:700, fontSize:15,
                color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════
// UNIFIED VERTICAL FEED — Used by all 4 categories
// Shorts · Classifieds · Bulletins · District/State/National News
// ════════════════════════════════════════════════════════════════

// ── Normalise any data source into a common FeedItem shape ──────
function normaliseFeedItems(items, type) {
  return items.map((item, i) => {
    const base = {
      id:        item.id || item.ytId || i,
      type,
      likes:     Math.floor(Math.random()*980)+20,
      dislikes:  Math.floor(Math.random()*60)+2,
      comments:  Math.floor(Math.random()*120)+5,
      rating:    (3.5 + Math.random()*1.5).toFixed(1),
      uploadedAt: item.uploadedAt || item.time || new Date().toISOString(),
    };
    if (type === 'shorts') return {
      ...base,
      headline:   item.titleTe,
      headlineEn: item.titleEn,
      videoId:    item.ytId,
      thumbnail:  item.img,
      fullText:   item.titleTe + '\n\n' + item.titleEn,
      reporter:   item.channel,
      location:   'కర్నూలు జిల్లా',
      category:   'Shorts',
      date:       item.time || 'ఈరోజు',
      views:      item.views,
    };
    if (type === 'classifieds') return {
      ...base,
      headline:   item.title,
      headlineEn: item.title,
      videoId:    null,
      thumbnail:  item.img || CL_CAT_IMG[item.cat],
      fullText:   item.desc || item.title,
      reporter:   item.poster || 'స్థానిక వ్యాపారి',
      location:   item.location,
      category:   item.cat,
      date:       item.time,
      contact:    item.contact,
      price:      item.price,
    };
    if (type === 'bulletins') return {
      ...base,
      headline:   item.titleTe || item.channel + ' వార్తా బులెటిన్',
      headlineEn: item.titleEn || 'News Bulletin',
      videoId:    item.ytId,
      thumbnail:  `https://img.youtube.com/vi/${item.ytId}/hqdefault.jpg`,
      fullText:   'ఈరోజు ' + (item.channel||'కర్నూలు') + ' TV ప్రసారం. '
                + 'ముఖ్యమైన వార్తలు, స్థానిక సమాచారం మరియు ప్రత్యేక కార్యక్రమాలు '
                + (item.broadcastTime||'') + ' సమయంలో ప్రసారమయ్యాయి.',
      reporter:   item.channel,
      location:   'కర్నూలు',
      category:   'Bulletin',
      date:       item.broadcastTime || 'ఈరోజు',
    };
    // news (district/state/national/etc)
    return {
      ...base,
      headline:   item.titleTe || item.title,
      headlineEn: item.titleEn || item.title,
      videoId:    item.ytId || null,
      thumbnail:  item.thumbnail || CL_CAT_IMG[item.cat] || '/placeholder.svg',
      fullText:   item.body || item.titleTe || item.title,
      reporter:   item.reporter || item.channel || 'LocalAI TV',
      location:   item.location || item.district || 'కర్నూలు జిల్లా',
      category:   item.cat || 'District',
      date:       item.time || 'ఈరోజు',
      views:      item.views,
    };
  });
}

// ── Comment Drawer ───────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════
// KURNOOL SHORTS — Never-ending vertical swipe feed
// Sakshi/YouTube Shorts style. Finger swipe only. No arrows.
// Auto-plays video+audio. Full text inline. Reporter details.
// Feed order: today newest first → yesterday → older → loops back
// ════════════════════════════════════════════════════════════════

// ── Sort shorts: today first (latest time), then yesterday, loop ──
function sortShortsForFeed(items) {
  const sorted = [...items].sort((a, b) => {
    const da = a.uploadedAt ? new Date(a.uploadedAt) : new Date(0);
    const db = b.uploadedAt ? new Date(b.uploadedAt) : new Date(0);
    return db - da; // newest first
  });
  return sorted;
}

// ── Never-ending index: wraps around when all items shown ──
function getLoopIdx(rawIdx, total) {
  return ((rawIdx % total) + total) % total;
}


export { UnifiedFeedViewer, sortShortsForFeed, getLoopIdx };
export default UnifiedFeedViewer;
