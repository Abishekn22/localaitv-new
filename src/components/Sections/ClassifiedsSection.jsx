import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, safeImageUrl, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import ClassifiedsFeedScreen from './../../screens/ClassifiedsFeedScreen.jsx';
import SectionAccentBar from './../SectionAccentBar.jsx';
import { CL_CATS_TE } from './../../data/classifieds.js';

function ClassifiedsSection({ onNavigate, constituency, channel }) {
  const { T } = useAppTheme();
  const [cat,      setCat]      = useState('All');
  const [selected, setSelected] = useState(null);
  const [selIdx,   setSelIdx]   = useState(0);
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const { data: liveClassifieds } = useAPI(
    () => apiCall(`/classifieds?constituency=${encodeURIComponent(constituency)}&limit=30`).then(d => d.items || d),
    [], [constituency]
  );
  // For every category the API returns live data for, use ONLY the live rows;
  // keep the static mock for categories that have no live data yet.
  const liveItems = Array.isArray(liveClassifieds) ? liveClassifieds : [];
  // TEMP DEBUG — remove once videos render correctly.
  // Logs to browser console what /classifieds returned so we can see whether
  // each card has a populated videos[] array.
  if (typeof window !== 'undefined' && !window.__cl_logged) {
    window.__cl_logged = true;
    // eslint-disable-next-line no-console
    console.log('[Classifieds] constituency =', constituency,
      ' liveItems =', liveItems.length,
      ' withVideos =', liveItems.filter(c => Array.isArray(c.videos) && c.videos[0]).length,
      ' sample =', liveItems[0]);
  }
  const liveCats  = new Set(liveItems.map(c => c.cat));
  const all = liveItems.length > 0
    ? [...liveItems, ...CLASSIFIEDS.filter(c => !liveCats.has(c.cat))]
    : CLASSIFIEDS;

  // Randomly shuffle for display on home page — memoised so it doesn't re-shuffle on every re-render
  const shuffled = useMemo(() => [...all].sort(() => Math.random() - 0.5), [all]);
  const filtered = cat === 'All' ? shuffled : all.filter(c => c.cat === cat);

  // Auto-scroll the strip continuously, like Mana Kurnool Shorts.
  // We render the filtered items TWICE in a row, then loop scrollLeft from 0 → half → 0,
  // so the transition is seamless (no jump when looping).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const iv = setInterval(() => {
      if (!el || paused) return;
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      else el.scrollLeft += 1;
    }, 30);
    return () => clearInterval(iv);
  }, [paused, cat, filtered.length]);

  // Open the tapped classified in the App-level classifieds detail page
  // (not an inline overlay). Per Mohan's request: clicking any Kurnool
  // Local thumbnail should navigate to a separate page rather than
  // rendering inside this section. Category + item id are stashed in
  // window flags so the route handler can land on the exact item.
  function openItem(item) {
    if (typeof window !== 'undefined') {
      window.__classifiedsStartCat    = cat;
      window.__classifiedsStartItemId = item && item.id;
    }
    onNavigate && onNavigate('classifiedsfeed');
  }

  return (
    <>
      <div style={{background:T.bg}}>
        {/* ── Header — OTT premium typography hierarchy with red accent bar ── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 16px 10px',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0}}>
            {/* Section accent bar — Phase 5.5 shared primitive */}
            <SectionAccentBar/>
            <div style={{display:'flex',alignItems:'baseline',gap:6,minWidth:0}}>
              <span style={{
                fontFamily:OTT.type.te.font, fontWeight:800, fontSize:18,
                color:T.text, letterSpacing:0.2,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{channel?channel.name:'కర్నూలు'}</span>
              <span style={{
                fontFamily:OTT.type.display.font, fontWeight:900, fontSize:20, letterSpacing:1.2,
                background:'linear-gradient(135deg,#00ACC1,#26C6DA)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>LOCAL</span>
            </div>
          </div>
          <button onClick={()=>onNavigate&&onNavigate('classifiedsfeed')}
            className="ott-press"
            style={{flexShrink:0, background:'transparent',
              border:`1px solid ${T.border}`, borderRadius:OTT.radius.pill,
              padding:'5px 11px', fontSize:10, color:T.textMuted, fontWeight:700,
              cursor:'pointer', letterSpacing:0.6,
              fontFamily:OTT.type.mono.font, textTransform:'uppercase',
            }}>
            See all  ›
          </button>
        </div>

        {/* ── Category pills with hover highlight ──
            paddingTop:6 leaves room for the hover lift so the top border doesn't get clipped. */}
        <div style={{display:'flex',gap:6,padding:'6px 16px 10px',overflowX:'auto',overflowY:'visible',scrollbarWidth:'none'}}>
          {CL_CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              onMouseEnter={e=>{
                if (cat===c) return;
                e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
                e.currentTarget.style.boxShadow='0 4px 14px rgba(43,127,255,0.3)';
                e.currentTarget.style.borderColor='rgba(43,127,255,0.55)';
                e.currentTarget.style.background='rgba(43,127,255,0.10)';
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0) scale(1)';
                e.currentTarget.style.boxShadow= cat===c?'0 2px 10px rgba(43,127,255,0.3)':'none';
                e.currentTarget.style.borderColor= cat===c?'#2B7FFF':T.border;
                e.currentTarget.style.background= cat===c?'#2B7FFF':T.bg3;
              }}
              style={{
              display:'flex',alignItems:'center',gap:5,flexShrink:0,
              background: cat===c ? '#2B7FFF' : T.bg3,
              border:`1.5px solid ${cat===c?'#2B7FFF':T.border}`,
              borderRadius:14,padding:'5px 11px',cursor:'pointer',
              transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)',
              boxShadow: cat===c?'0 2px 10px rgba(43,127,255,0.3)':'none',
            }}>
              <span style={{fontSize:13}}>{CL_CAT_EMOJI[c]}</span>
              <div>
                <div style={{fontSize:10,fontWeight:700,lineHeight:1.1,
                  color:cat===c?'white':T.text,
                  fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.3}}>{c}</div>
                <div style={{fontSize:8,lineHeight:1,marginTop:1,
                  color:cat===c?'rgba(255,255,255,0.75)':T.textMuted,
                  fontFamily:"'Noto Sans Telugu',sans-serif"}}>{CL_CATS_TE[c]||c}</div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Cards — continuous auto-scroll loop (doubled list) ── */}
        <div
          ref={scrollRef}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
          style={{display:'flex',gap:10,padding:'0 16px 14px',overflowX:'auto',scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
          {/* Duplicate the list only when there are enough cards to actually
              scroll — keeps the seamless auto-scroll loop for long lists while
              avoiding a visible repeat for short ones. */}
          {(filtered.length > 7 ? [...filtered, ...filtered] : filtered).map((cl,i)=>(
            <div key={cl.id+'-'+i} onClick={()=>openItem(cl)}
              style={{flexShrink:0,width:155,borderRadius:14,overflow:'hidden',
                border:`1px solid ${T.border}`,cursor:'pointer',
                background:T.bg2,
                boxShadow:T.isDark?'none':`0 2px 10px ${T.shadow}`,
                transition:'transform 0.15s',
              }}
              onTouchStart={e=>e.currentTarget.style.transform='scale(0.97)'}
              onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
            >
              {/* Real category thumbnail — prefer generated bulletin video when present,
                  fall back to the uploaded photo, then to the category placeholder.
                  EXCEPTION: "Who is Who" always shows the photo only — no bulletin
                  video is generated for that category and we don't want to play one
                  even if a stray URL ever shows up in `videos`. */}
              <div style={{width:'100%',height:100,position:'relative',overflow:'hidden',
                background:T.bg3}}>
<<<<<<< Updated upstream
                <img
                  src={safeImageUrl((Array.isArray(cl.images) && cl.images[0]) || CL_CAT_IMG[cl.cat] || CL_CAT_IMG['Events'])}
                  alt={cl.cat}
                  style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                  onError={e=>{ if (e.target.src.endsWith('/placeholder.svg')) return; e.target.src = '/placeholder.svg'; }}
                />
=======
                {cl.cat !== 'Who is Who' && Array.isArray(cl.videos) && cl.videos[0] ? (
                  <video
                    src={cl.videos[0]}
                    poster={(Array.isArray(cl.images) && cl.images[0]) || CL_CAT_IMG[cl.cat] || CL_CAT_IMG['Events']}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block',background:'#000'}}
                  />
                ) : (
                  <img
                    src={(Array.isArray(cl.images) && cl.images[0]) || CL_CAT_IMG[cl.cat] || CL_CAT_IMG['Events']}
                    alt={cl.cat}
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    onError={e=>{ e.target.src = CL_CAT_IMG[cl.cat] || CL_CAT_IMG['Events']; }}
                  />
                )}
>>>>>>> Stashed changes
                {/* Light gradient at bottom for text */}
                <div style={{position:'absolute',bottom:0,left:0,right:0,height:40,
                  background:'linear-gradient(0deg,rgba(0,0,0,0.55),transparent)'}}/>
                {/* Category badge top-left */}
                <div style={{position:'absolute',top:6,left:6,
                  background:'rgba(0,0,0,0.65)',borderRadius:5,
                  padding:'2px 7px',display:'flex',alignItems:'center',gap:3}}>
                  <span style={{fontSize:9}}>{CL_CAT_EMOJI[cl.cat]}</span>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:8,fontWeight:800,color:'white',letterSpacing:0.5}}>{cl.cat}</span>
                </div>
                {/* Time badge top-right */}
                <div style={{position:'absolute',top:6,right:6,
                  background:'rgba(0,0,0,0.6)',borderRadius:5,padding:'2px 6px'}}>
                  <span style={{fontSize:8,color:'rgba(255,255,255,0.85)'}}>{cl.time}</span>
                </div>
              </div>
              {/* Card body */}
              <div style={{padding:'8px 10px 10px'}}>
                <div style={{fontSize:11,fontWeight:700,lineHeight:1.3,
                  color:T.text,marginBottom:4,
                  display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                  {cl.title}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:8,color:'#2B7FFF'}}>📍 {cl.location.slice(0,12)}</span>
                </div>
              </div>
            </div>
          ))}
          {/* "Post Free Ad" CTA removed per user request — strip now loops continuously */}
        </div>
      </div>

      {/* Inline ClassifiedsFeedScreen overlay removed — tapping a
          thumbnail now navigates to the App-level 'classifiedsfeed'
          route for a clean page transition (per Mohan's request). */}
    </>
  );
}

// ── CLASSIFIEDS FULL SCREEN ───────────────────────────────────
// ── INSTAGRAM-STYLE CLASSIFIEDS FULL-SCREEN VIEWER ────────────
// One classified per screen. Swipe up → next, swipe down → prev.

export { ClassifiedsSection };
export default ClassifiedsSection;
