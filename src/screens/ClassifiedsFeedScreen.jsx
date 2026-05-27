import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import ClassifiedFeedItem from './../components/Feed/ClassifiedFeedItem.jsx';
import ClassifiedShareSheet from './../components/Feed/ClassifiedShareSheet.jsx';
import CommentDrawer from './../components/sheets/CommentDrawer.jsx';

function ClassifiedsFeedScreen({ onClose, startIdx = 0, startCat = 'All' }) {
  const { T }    = useAppTheme();
  const [activeCat,   setActiveCat]   = useState(startCat);
  const [idx,         setIdx]         = useState(startIdx);
  const [animDir,     setAnimDir]     = useState(null);
  const [showShare,   setShowShare]   = useState(false);
  const [showComment, setShowComment] = useState(false);
  const touchY  = useRef(0);
  const touchX  = useRef(0);
  const moved   = useRef(false);
  const animating = useRef(false);
  // Throttle mouse-wheel events so one flick doesn't fire goNext 5×.
  const wheelLock = useRef(false);

  useEffect(() => { document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow=''; }; }, []);

  const filtered = useMemo(() => {
    const items = activeCat === 'All' ? CLASSIFIEDS : CLASSIFIEDS.filter(c => c.cat === activeCat);
    return [...items].sort((a,b) => new Date(b.uploadedAt||0) - new Date(a.uploadedAt||0));
  }, [activeCat]);

  const total   = filtered.length;
  // 360° infinite wrap — getLoopIdx handles negative indices, so goPrev can decrement freely.
  const safeIdx = total > 0 ? ((idx % total) + total) % total : 0;
  const cur     = filtered[safeIdx];

  const handleCatChange = (cat) => { setActiveCat(cat); setIdx(0); setAnimDir(null); };

  const goNext = () => {
    if (animating.current) return;
    animating.current = true;
    setAnimDir('up');
    setTimeout(() => { setIdx(i=>i+1); setAnimDir(null); animating.current=false; }, 240);
  };
  const goPrev = () => {
    if (animating.current) return;
    animating.current = true;
    setAnimDir('down');
    // Decrement freely; safeIdx's modulo wrap handles negatives — true infinite backward.
    setTimeout(() => { setIdx(i=>i-1); setAnimDir(null); animating.current=false; }, 240);
  };

  const onTouchStart = e => { touchY.current=e.touches[0].clientY; touchX.current=e.touches[0].clientX; moved.current=false; };
  const onTouchMove  = e => { moved.current=true; };
  const onTouchEnd   = e => {
    if(!moved.current) return;
    const dy=touchY.current-e.changedTouches[0].clientY;
    const dx=Math.abs(e.changedTouches[0].clientX-touchX.current);
    if(dx>Math.abs(dy)*1.2) return;
    if(dy>45) goNext();
    if(dy<-45) goPrev();
  };

  // Desktop mouse-wheel — scroll wheel down = next, scroll up = previous.
  // Wheel lock prevents one wheel event from firing 5 transitions back-to-back.
  const onWheel = e => {
    if (wheelLock.current || animating.current) return;
    if (Math.abs(e.deltaY) < 8) return;
    wheelLock.current = true;
    if (e.deltaY > 0) goNext(); else goPrev();
    setTimeout(() => { wheelLock.current = false; }, 320);
  };

  useEffect(() => {
    const h=e=>{ if(e.key==='ArrowUp') goPrev(); if(e.key==='ArrowDown') goNext(); if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);
  },[idx,activeCat]);

  if(!cur && total===0) return (
    <div style={{position:'fixed',inset:0,zIndex:300,background:T.bg,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
      <span style={{fontSize:48}}>📋</span>
      <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:16,color:T.textMuted}}>ఇంకా ఏ పోస్ట్ లేదు</span>
      <button onClick={onClose} style={{marginTop:16,padding:'10px 24px',borderRadius:12,
        background:T.red,border:'none',color:'white',fontSize:14,cursor:'pointer'}}>← వెనక్కి</button>
    </div>
  );

  return (
    <div style={{position:'fixed',inset:0,zIndex:300,background:T.isDark?'#000':'#f8faff',
      display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Top progress-bar strip removed per user request — was a Stories-style row of
          up to 20 thin segments that the user found visually noisy. */}
      {/* Discreet back button only — title / index / share removed per user request.
          LocalAI TV logo is now on the media itself, share lives in the action bar. */}
      <button onClick={onClose} style={{
        position:'absolute', top:18, left:14, zIndex:26,
        width:36, height:36, borderRadius:'50%',
        background:'rgba(0,0,0,0.55)',
        border:'1.5px solid rgba(255,255,255,0.22)',
        color:'white', fontSize:18, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        backdropFilter:'blur(8px)' }}>←</button>
      {/* Feed — leaves 72px at the bottom so the ClassifiedFeedItem's action bar
            is visible ABOVE the absolute-positioned category bar below.
            onWheel adds desktop mouse-wheel navigation (same UX as Mana Kurnool Shorts). */}
      <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onWheel={onWheel}
        style={{flex:1,position:'relative',overflow:'hidden'}}>
        {cur && (
          <div key={`${activeCat}-${safeIdx}`} style={{
            /* explicit bottom:72 (instead of inset:0) so the action bar inside
               stays above the bottom category strip */
            position:'absolute', top:0, left:0, right:0, bottom:72,
            animation:animDir==='up'?'slideOutUp 0.24s cubic-bezier(0.4,0,1,1) forwards':animDir==='down'?'slideOutDown 0.24s cubic-bezier(0.4,0,1,1) forwards':'slideInUp 0.26s cubic-bezier(0,0,0.2,1) both'}}>
            <ClassifiedFeedItem item={cur} isActive={!animDir} onShare={()=>setShowShare(true)} onComment={()=>setShowComment(true)}/>
          </div>
        )}
      </div>
      {/* Bottom category bar — single color box / panel.
          NO top border, NO gradient — one solid attractive color so the whole strip reads
          as a clean banner. Each button inside gets its OWN distinct color from `catColors`
          so the row is a vibrant rainbow that catches the eye and signals "categories to browse." */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:25,
        background: T.isDark ? '#0A2540' : '#1A237E', /* deep indigo banner — one solid color */
        boxShadow: T.isDark
          ? '0 -6px 20px rgba(0,0,0,0.55)'
          : '0 -4px 16px rgba(26,35,126,0.30)',
        paddingBottom:8}}>
        <div style={{display:'flex',flexWrap:'nowrap',overflowX:'auto',scrollbarWidth:'none',
          WebkitOverflowScrolling:'touch',padding:'10px 10px 4px',gap:7}}>
          {(() => {
            /* Per-category solid color — each button reads as its own little tile, so the
               whole row looks like a rainbow of categories on top of the deep indigo bar. */
            const catColors = {
              'All':           '#FFB300', // amber/gold
              'Birthdays':     '#E91E63', // pink/magenta
              'Marriage Anniversary': '#AB47BC', // light purple
              'Marriages':     '#F06292', // rose
              'Who is Who':    '#14B8A6', // teal
              'Talent Show':   '#F472B6', // pink
              'Public Voice':  '#F97316', // orange-red
              'Jobs':          '#26C6DA', // cyan
              'Car Sales':     '#66BB6A', // green
              'House Rents':   '#FF7043', // coral
              'Events':        '#FFD54F', // golden yellow
              'Shopping':      '#F57F17', // amber (shopping)
            };
            return CL_SUBCATS.map(cat=>{
              const isActive = activeCat === cat.id;
              const count    = cat.id==='All' ? CLASSIFIEDS.length : CLASSIFIEDS.filter(c=>c.cat===cat.id).length;
              const color    = catColors[cat.id] || '#90A4AE';
              return (
                <button key={cat.id} onClick={()=>handleCatChange(cat.id)}
                  onMouseEnter={e=>{
                    e.currentTarget.style.transform = isActive ? 'translateY(-2px) scale(1.09)' : 'translateY(-2px) scale(1.06)';
                    e.currentTarget.style.boxShadow = `0 6px 18px ${color}99`;
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.transform = isActive ? 'scale(1.06)' : 'scale(1)';
                    e.currentTarget.style.boxShadow = isActive
                      ? `0 4px 14px ${color}80, 0 0 0 2px rgba(255,255,255,0.30)`
                      : `0 2px 8px ${color}55`;
                  }}
                  style={{
                    flexShrink:0, whiteSpace:'nowrap',
                    display:'flex', alignItems:'center', gap:5,
                    padding:'7px 13px', borderRadius:22, cursor:'pointer',
                    transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                    /* Solid per-category color background. Active = brighter ring + scale-up. */
                    background: color,
                    border: isActive ? '2px solid rgba(255,255,255,0.85)' : `1.5px solid ${color}`,
                    boxShadow: isActive
                      ? `0 4px 14px ${color}80, 0 0 0 2px rgba(255,255,255,0.30)`
                      : `0 2px 8px ${color}55`,
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  }}>
                  <span style={{fontSize:14}}>{cat.emoji}</span>
                  <div>
                    <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",
                      fontSize:11, fontWeight:800,
                      color:'#FFFFFF', lineHeight:1.2,
                      textShadow:'0 1px 2px rgba(0,0,0,0.35)'}}>{cat.label}</div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:9, fontWeight:700,
                      color:'rgba(255,255,255,0.85)', lineHeight:1,
                      textShadow:'0 1px 2px rgba(0,0,0,0.35)'}}>{count} posts</div>
                  </div>
                </button>
              );
            });
          })()}
        </div>
      </div>
      {showShare && cur && <ClassifiedShareSheet item={cur} onClose={()=>setShowShare(false)}/>}
      {showComment && <CommentDrawer open={true} onClose={()=>setShowComment(false)} itemId={cur?.id}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BULLETIN PLAYER SCREEN
// Telugu Digital TV Bulletin Center
// Layout: Fixed video player (top 38%) + scrollable bulletin list
// Tap any bulletin → player switches instantly, no page reload
// ═══════════════════════════════════════════════════════════════


export { ClassifiedsFeedScreen };
export default ClassifiedsFeedScreen;
