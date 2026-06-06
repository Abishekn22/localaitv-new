import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, safeImageUrl, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import ClassifiedsFeedScreen from './../../screens/ClassifiedsFeedScreen.jsx';
import { isBrokenKey } from './../Feed/ImageSlideshowPlayer.jsx';
import SectionAccentBar from './../SectionAccentBar.jsx';
import { CL_CATS_TE } from './../../data/classifieds.js';
import { publicVoiceToShortShape } from './ShortNewsSection.jsx';

function ClassifiedsSection({ onNavigate, constituency, channel, locationId }) {
  const { T } = useAppTheme();
  const [cat,      setCat]      = useState('All');
  const [selected, setSelected] = useState(null);
  const [selIdx,   setSelIdx]   = useState(0);
  const scrollRef = useRef(null);

  const { data: liveClassifieds, loading: clsLoading } = useAPI(
    () => apiCall(`/classifieds?constituency=${encodeURIComponent(constituency)}&limit=30`).then(d => d.items || d),
    [], [constituency]
  );
  // Public Voice — its own API. Only ADMIN-VERIFIED items, scoped to location.
  // Uses a retrying fetch (not single-shot useAPI): on a fresh load the app
  // mounts twice and the browser aborts in-flight requests (net::ERR_ABORTED),
  // which would otherwise leave the Public Voice cards permanently empty. The
  // retry mirrors PublicVoiceSection so both render the same verified set.
  const [pvData, setPvData] = useState([]);
  useEffect(() => {
    let alive = true;
    let tries = 0;
    const qs = locationId != null ? `location_id=${locationId}&` : '';
    const load = () => {
      if (!alive) return;
      apiCall(`/public-voice-requests?${qs}limit=50`)
        .then(d => { if (alive) setPvData((d && d.items) || (Array.isArray(d) ? d : [])); })
        .catch(() => { if (alive && tries < 6) { tries += 1; setTimeout(load, 700); } });
    };
    load();
    return () => { alive = false; };
  }, [locationId]);
  // Only admin-approved (verified) Public Voice videos, scoped to the selected
  // location. Mirrors PublicVoiceSection so the catalog shows the same set.
  const pvVerified = (Array.isArray(pvData) ? pvData : [])
    .filter(it => it.verified === true || it.verified === 'true' || it.verified === 1 || it.verified === '1')
    .filter(it => locationId == null || String(it.location_id) === String(locationId));
  // Map verified Public Voice → classifieds-card shape so the "Public Voice"
  // category tile renders the real uploaded video (not a static mock).
  const pvCards = pvVerified.map(pv => ({
    id: 'pv-' + pv.id,
    cat: 'Public Voice',
    type: 'publicvoice',
    title: pv.issue_name || 'Public Voice',
    images: (Array.isArray(pv.images) && pv.images.length) ? pv.images : [],
    videos: Array.isArray(pv.videos) ? pv.videos.filter(Boolean) : [],
    location: pv.location || pv.constituency || '',
    time: pv.time || '',
    date: pv.date || '',
    badge: '📢 పబ్లిక్ వాయిస్',
    // Used by the newest-first sort below — keep parity with talentCards
    // and liveClassifieds. Falls back through the common timestamp field
    // names the public-voice API has been observed to use.
    uploadedAt: pv.uploadedAt || pv.uploaded_at || pv.created_at || pv.received_at || '',
  }));

  // Talent Show — its own feed API (/feed/talent). Only ADMIN-VERIFIED items,
  // scoped to the selected location. Same retrying-fetch pattern as Public
  // Voice (a fresh load double-mounts and aborts in-flight requests, which
  // would otherwise leave Talent Show permanently empty).
  const [talentData, setTalentData] = useState([]);
  useEffect(() => {
    let alive = true;
    let tries = 0;
    const load = () => {
      if (!alive) return;
      apiCall('/feed/talent')
        .then(d => { if (alive) setTalentData((d && d.items) || (Array.isArray(d) ? d : [])); })
        .catch(() => { if (alive && tries < 6) { tries += 1; setTimeout(load, 700); } });
    };
    load();
    return () => { alive = false; };
  }, []);
  // Only admin-approved (verified) talent videos, scoped to the selected
  // location. Mirrors the dashboard's /feed/talent verified set.
  const talentVerified = (Array.isArray(talentData) ? talentData : [])
    .filter(it => it.verified === true || it.verified === 'true' || it.verified === 1 || it.verified === '1')
    .filter(it => locationId == null || String(it.location_id) === String(locationId));
  // Map verified Talent Show → classifieds-card shape so the "Talent Show"
  // category tile renders the real uploaded video (not a static mock).
  const talentCards = talentVerified.map(tv => ({
    id: String(tv.id),               // already prefixed "talent33" by the feed
    cat: 'Talent Show',
    type: 'talent',
    title: tv.title || tv.performerName || tv.performer_name || 'Talent Show',
    images: (Array.isArray(tv.images) && tv.images.length) ? tv.images : [],
    videos: Array.isArray(tv.videos) ? tv.videos.filter(Boolean) : [],
    location: tv.location || '',
    time: tv.time || '',
    date: tv.date || '',
    badge: '🎤 ' + (tv.eventName || tv.event_name || 'Talent Show'),
    uploadedAt: tv.uploadedAt || tv.uploaded_at || '',
  }));

  // Home page shows ONLY real API content for the SELECTED location that an
  // admin has approved — across every catalog/category. Two hard rules:
  //   1. verified === true  (unverified submissions stay hidden until approved)
  //   2. location_id === the selected dropdown's location id (exact match)
  // No static CLASSIFIEDS mock is mixed in or used as a fallback; if nothing
  // matches, the strip is simply empty.
  const allLive = (Array.isArray(liveClassifieds) ? liveClassifieds : [])
    .filter(c => c.verified === true || c.verified === 'true' || c.verified === 1 || c.verified === '1');
  const liveItems = locationId != null
    ? allLive.filter(c => String(c.location_id) === String(locationId))
    : allLive;
  // DEV-only diagnostic: show exactly how many items pass each filter stage
  // so an "empty strip" doesn't look like the API failed when really it's
  // just verified=false. Logged once per (constituency, locationId) change.
  // The effect itself runs unconditionally (Rules of Hooks); the body is
  // gated on import.meta.env.DEV so production builds are silent.
  useEffect(() => {
    if (!(import.meta.env && import.meta.env.DEV)) return;
    const raw = Array.isArray(liveClassifieds) ? liveClassifieds : [];
    if (!raw.length) {
      console.log('[Classifieds] API returned 0 items for', constituency, '— check Network tab');
      return;
    }
    const byCat = raw.reduce((m, c) => { m[c.cat] = (m[c.cat] || 0) + 1; return m; }, {});
    const verCount = raw.filter(c => c.verified === true || c.verified === 'true' || c.verified === 1 || c.verified === '1').length;
    const locCount = locationId != null
      ? raw.filter(c => String(c.location_id) === String(locationId)).length
      : raw.length;
    const passBoth = raw
      .filter(c => c.verified === true || c.verified === 'true' || c.verified === 1 || c.verified === '1')
      .filter(c => locationId == null || String(c.location_id) === String(locationId));
    console.log(
      `[Classifieds] constituency=${constituency} locationId=${locationId} | ` +
      `API=${raw.length}, verified=${verCount}, location-match=${locCount}, BOTH=${passBoth.length}`,
      byCat,
    );
    if (raw.length > 0 && passBoth.length === 0) {
      const locs = [...new Set(raw.map(c => c.location_id))];
      console.warn('[Classifieds] All items filtered out. Sample data location_ids in API response:', locs);
      console.warn('[Classifieds] Sample verified values:', [...new Set(raw.map(c => c.verified))]);
    }
  }, [liveClassifieds, locationId, constituency]);
  // Only verified, location-matched API content: live classifieds + verified
  // Public Voice cards + verified Talent Show cards (each list is already
  // verified + location-scoped above). Dedupe by `id` (falling back to a
  // type+title+location composite for the rare item that ships without one)
  // so the rail never renders the same post twice when the API returns it
  // from more than one source or repeats it across pages.
  const _seenKeys = new Set();
  const all = [...liveItems, ...pvCards, ...talentCards].filter(it => {
    const k = it && it.id != null
      ? `id:${it.id}`
      : `c:${it && it.type}|${it && (it.title || it.name)}|${it && it.location}`;
    if (_seenKeys.has(k)) return false;
    _seenKeys.add(k);
    return true;
  });

  // Newest-first stable order — same items, same positions on every
  // refresh. When a refresh brings in new uploads they prepend at
  // position 0 (highest uploadedAt) and existing items shift right by
  // N positions. Cards keep their React identity via key={cl.id} below,
  // so existing <video>/<img> DOM nodes don't unmount/remount — they
  // smoothly slide to their new slot without reloading. Replaces the
  // previous `Math.random()` shuffle that was re-running on every
  // 3-min refresh and made items look like they were teleporting
  // between positions.
  const sorted = useMemo(
    () => [...all].sort((a, b) =>
      new Date(b.uploadedAt || b.created_at || 0) - new Date(a.uploadedAt || a.created_at || 0)),
    [all]
  );
  // Filter from the SORTED list (not the raw `all`) so category-pill
  // selections also get newest-first ordering.
  const filtered = cat === 'All' ? sorted : sorted.filter(c => c.cat === cat);

  // Auto-scroll removed per UX request — the strip is now a static
  // horizontal carousel. Native browser scrolling (overflowX:'auto' below)
  // gives users manual swipe (mobile) + scroll (desktop) when they want to
  // browse, with no automatic movement on page load.

  // Open the tapped classified in the App-level classifieds detail page
  // (not an inline overlay). Per Mohan's request: clicking any Kurnool
  // Local thumbnail should navigate to a separate page rather than
  // rendering inside this section. Category + item id are stashed in
  // window flags so the route handler can land on the exact item.
  function openItem(item) {
    // Public Voice items open in the fullscreen video viewer, not the
    // image-based classifieds feed.
    if (item && item.type === 'publicvoice') {
      if (typeof window !== 'undefined') {
        window.__publicVoiceItems   = pvVerified.map(publicVoiceToShortShape);
        window.__publicVoiceStartId = String(item.id).replace(/^pv-/, '');
      }
      onNavigate && onNavigate('publicvoicefeed');
      return;
    }
    if (typeof window !== 'undefined') {
      window.__classifiedsStartCat    = cat;
      window.__classifiedsStartItemId = item && item.id;
      // Also stash the full item so the feed can render it even when its own
      // API call hasn't resolved yet (or fails — e.g. CORS on a new origin).
      // Without this, tapping any card may land on the empty-state screen.
      window.__classifiedsStartItem   = item || null;
    }
    onNavigate && onNavigate('classifiedsfeed');
  }

  // Shimmer skeleton styling — shared by the home strip placeholders and the
  // per-thumbnail loading sheen. The keyframes are injected once below.
  const shimmerStyle = {
    background: T.bg3,
    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
    backgroundSize: '200% 100%',
    animation: 'clShimmer 1.3s linear infinite',
  };
  // While the live API hasn't resolved AND we have nothing to show yet, render
  // skeleton cards instead of an empty strip.
  const showSkeleton = clsLoading && filtered.length === 0;

  return (
    <>
      <style>{`@keyframes clShimmer{0%{background-position:-150% 0}100%{background-position:150% 0}}`}</style>
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

        {/* ── Cards — static horizontal carousel (manual scroll only) ── */}
        <div
          ref={scrollRef}
          style={{display:'flex',gap:10,padding:'0 16px 14px',overflowX:'auto',scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
          {/* Loading skeletons — shimmer placeholders while the live feed
              hasn't returned yet, so the strip never looks empty/broken. */}
          {showSkeleton && Array.from({length:5}).map((_,i)=>(
            <div key={'sk'+i} style={{flexShrink:0,width:155,borderRadius:14,overflow:'hidden',
              border:`1px solid ${T.border}`,background:T.bg2}}>
              <div style={{width:'100%',height:100,...shimmerStyle}}/>
              <div style={{padding:'8px 10px 10px'}}>
                <div style={{height:10,borderRadius:4,marginBottom:6,...shimmerStyle}}/>
                <div style={{height:10,width:'62%',borderRadius:4,...shimmerStyle}}/>
              </div>
            </div>
          ))}
          {/* Render the list ONCE — every post shows a single time (no
              duplicates). The auto-scroll wraps back to the start at the end so
              the strip keeps moving without repeating cards. */}
          {!showSkeleton && filtered.length > 0 && filtered.map((cl,i)=>{
            // Use the REAL generated bulletin video as the thumbnail. Drop
            // malformed S3 keys (Windows-path uploads) so a broken URL can't
            // leave a black box — fall back to a real photo, then the category
            // image only as a last resort.
            const vid = (Array.isArray(cl.videos) ? cl.videos : []).find(u => !isBrokenKey(u)) || null;
            const img = (Array.isArray(cl.images) ? cl.images : []).find(u => !isBrokenKey(u)) || null;
            return (
            // key={cl.id} alone (not `cl.id+'-'+i`) so React keeps the SAME
            // DOM node for each card across re-renders. When new uploads
            // prepend at position 0 every existing card's index changes,
            // but its id doesn't — React diffs by id, keeps the existing
            // <video>/<img> mounted, and just slides the node to its new
            // grid slot. With the index appended, every card would get a
            // new key after a prepend and React would unmount+remount all
            // cards (videos reload, flash, lose playback position). The
            // `_seenKeys` dedupe above already guarantees unique ids, so
            // the index suffix was redundant defense.
            <div key={cl.id ?? `cl-pos-${i}`} onClick={()=>openItem(cl)}
              style={{flexShrink:0,width:155,borderRadius:14,overflow:'hidden',
                border:`1px solid ${T.border}`,cursor:'pointer',
                background:T.bg2,
                boxShadow:T.isDark?'none':`0 2px 10px ${T.shadow}`,
                transition:'transform 0.15s',
              }}
              onTouchStart={e=>e.currentTarget.style.transform='scale(0.97)'}
              onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
            >
              {/* Thumbnail — the live bulletin video plays muted/looped as a
                  moving preview; only items with no usable video fall back to a
                  photo. */}
              <div style={{width:'100%',height:100,position:'relative',overflow:'hidden',
                ...shimmerStyle}}>
                {vid ? (
                  <video
                    src={vid + '#t=0.1'}
                    poster={img ? safeImageUrl(img) : undefined}
                    muted loop autoPlay playsInline preload="metadata"
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block',background:'#000'}}
                    onError={e=>{ e.target.style.display='none'; }}
                  />
                ) : (
                  <img
                    src={safeImageUrl(img || CL_CAT_IMG[cl.cat] || CL_CAT_IMG['Events'])}
                    alt={cl.cat}
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    onError={e=>{ if (e.target.src.endsWith('/placeholder.svg')) return; e.target.src = '/placeholder.svg'; }}
                  />
                )}
                {/* Play badge for video cards */}
                {vid && (
                  <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
                    width:30,height:30,borderRadius:'50%',background:'rgba(255,255,255,0.9)',
                    display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
                    <div style={{width:0,height:0,marginLeft:2,borderTop:'6px solid transparent',
                      borderBottom:'6px solid transparent',borderLeft:'9px solid #1A237E'}}/>
                  </div>
                )}
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
          );})}
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
