import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import ClassifiedFeedItem from './../components/Feed/ClassifiedFeedItem.jsx';
import ClassifiedShareSheet from './../components/Feed/ClassifiedShareSheet.jsx';
import CommentDrawer from './../components/sheets/CommentDrawer.jsx';
import SnapShortsScroller from './../components/Feed/SnapShortsScroller.jsx';

function ClassifiedsFeedScreen({ onClose, startItemId = null, startItem = null, startIdx = 0, startCat = 'All', constituency = 'Kurnool' }) {
  const { T }    = useAppTheme();
  const [activeCat,   setActiveCat]   = useState(startCat);
  const [curIdx,      setCurIdx]      = useState(startIdx); // live looped index (for share/comment target)
  const [showShare,   setShowShare]   = useState(false);
  const [showComment, setShowComment] = useState(false);
  // One-shot seek: only honour startItemId until the user manually navigates.
  const seekedRef = useRef(false);

  useEffect(() => { document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow=''; }; }, []);

  // Escape closes the viewer (↑/↓ navigation is handled by SnapShortsScroller).
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Live data from the backend (Who-is-Who today; more categories later).
  const { data: liveClassifieds, loading: clsLoading } = useAPI(
    () => apiCall(`/classifieds?constituency=${encodeURIComponent(constituency)}&limit=50`).then(d => d.items || d),
    [], [constituency]
  );
  // Talent Show has its own feed endpoint (not part of /classifieds). Pull it
  // here so tapping a Talent card on the home strip lands on the REAL verified
  // video instead of the static mock.
  const { data: liveTalent, loading: talentLoading } = useAPI(
    () => apiCall('/feed/talent').then(d => d.items || d),
    [], []
  );
  const apiLoading = clsLoading || talentLoading;

  const filtered = useMemo(() => {
    const liveItems = Array.isArray(liveClassifieds) ? liveClassifieds : [];
    // Only admin-approved (verified) talent videos, shaped like a classified.
    const talentItems = (Array.isArray(liveTalent) ? liveTalent : [])
      .filter(it => it.verified === true || it.verified === 'true' || it.verified === 1 || it.verified === '1')
      .map(tv => ({ ...tv, cat: 'Talent Show', type: 'talent' }));
    const live = [...liveItems, ...talentItems];
    // Categories that have live rows replace their mock entirely (so verified
    // Talent Show hides the ts1–ts3 placeholders once real talent exists).
    const liveCats  = new Set(live.map(c => c.cat));
    const source = live.length > 0
      ? [...live, ...CLASSIFIEDS.filter(c => !liveCats.has(c.cat))]
      : CLASSIFIEDS;
    let items = activeCat === 'All' ? source : source.filter(c => c.cat === activeCat);
    // Fallback: if the live API hasn't returned (or fails) AND the static
    // CLASSIFIEDS doesn't contain the tapped post for this category, fall
    // back to the post the user actually tapped — it travelled in with the
    // navigation, so we ALWAYS have at least it.
    if (items.length === 0 && startItem) items = [startItem];
    // Also: if the user landed on a category that's empty in the current
    // source but the tapped item is from a different cat, just show the
    // tapped item rather than the empty screen.
    else if (startItem && !items.some(c => String(c.id) === String(startItem.id))) {
      items = [startItem, ...items];
    }
    return [...items].sort((a,b) => new Date(b.uploadedAt||0) - new Date(a.uploadedAt||0));
  }, [activeCat, liveClassifieds, liveTalent, startItem]);

  const total   = filtered.length;
  const safeIdx = total > 0 ? ((curIdx % total) + total) % total : 0;
  const cur     = filtered[safeIdx];

  // Resolve the requested start item to an index against the LIVE filtered
  // list. Runs once per startItemId — after the data loads and we land on
  // the correct post, subsequent renders leave the scroller alone.
  const resolvedStartIdx = useMemo(() => {
    if (seekedRef.current) return curIdx;
    if (!startItemId || total === 0) return startIdx;
    const ix = filtered.findIndex(c => String(c.id) === String(startItemId));
    if (ix >= 0) { seekedRef.current = true; return ix; }
    return startIdx;
  }, [startItemId, filtered, total, startIdx, curIdx]);

  // Sync curIdx once we resolve, so the share/comment target tracks the
  // landed post even before the user scrolls.
  useEffect(() => {
    if (seekedRef.current && curIdx !== resolvedStartIdx) setCurIdx(resolvedStartIdx);
  }, [resolvedStartIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCatChange = (cat) => { setActiveCat(cat); setCurIdx(0); seekedRef.current = true; };

  // Still loading? Show a quiet spinner instead of the "no posts" screen so
  // the user never lands on an empty state during a normal navigation.
  if (total === 0 && apiLoading) return (
    <div style={{position:'fixed',inset:0,zIndex:300,background:T.bg,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14}}>
      <div style={{width:36,height:36,border:`3px solid ${T.border}`,borderTopColor:T.red,borderRadius:'50%',
        animation:'classifiedsFeedSpin 0.9s linear infinite'}}/>
      <style>{`@keyframes classifiedsFeedSpin { to { transform: rotate(360deg); } }`}</style>
      <button onClick={onClose} style={{marginTop:6,padding:'8px 20px',borderRadius:12,
        background:'transparent',border:`1px solid ${T.border}`,color:T.textMuted,fontSize:13,cursor:'pointer'}}>← వెనక్కి</button>
    </div>
  );
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
      {/* Feed — native scroll-snap vertical shorts (one swipe = one short, smooth
            momentum scrolling, infinite loop). The scroller is a flex child so it
            occupies exactly the space ABOVE the category bar; each slide is one
            screen tall, leaving the ClassifiedFeedItem's action bar visible. */}
      <div style={{flex:1,position:'relative',overflow:'hidden'}}>
        <SnapShortsScroller
          key={`cls-${activeCat}-${resolvedStartIdx}`}
          total={total}
          initialIdx={resolvedStartIdx}
          resetKey={activeCat}
          onIndexChange={setCurIdx}
          renderItem={(itemIndex, isActive) => {
            const item = filtered[itemIndex];
            if (!item) return null;
            return (
              <ClassifiedFeedItem
                item={item}
                isActive={isActive}
                onShare={()=>setShowShare(true)}
                onComment={()=>setShowComment(true)}
              />
            );
          }}
        />
      </div>
      {/* Bottom category bar — single color box / panel.
          NO top border, NO gradient — one solid attractive color so the whole strip reads
          as a clean banner. Each button inside gets its OWN distinct color from `catColors`
          so the row is a vibrant rainbow that catches the eye and signals "categories to browse." */}
      <div style={{flexShrink:0,zIndex:25,
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
