import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, mapBulletin, filterBulletinsByLocation, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import CommentDrawer from './../components/sheets/CommentDrawer.jsx';
import Logo from './../components/Logo.jsx';
import { isAudioUnlocked } from './../utils/audioUnlock.js';

function BulletinPlayerScreen({ startIdx = 0, onClose, location = null }) {
  const { T } = useAppTheme();

  // Pull bulletins from /api/bulletins and map to the legacy shape. Falls
  // back to BULLETINS (currently empty) so the screen never reads undefined.
  // The backend returns location_id: 0 for every bulletin, so we fetch all
  // and filter by the selected channel name client-side (see below).
  const { data: liveBulletins, loading: bulletinsLoading } = useAPI(
    () => apiCall(`/bulletins?page=1&limit=50`).then(d => d.items || d),
    BULLETINS,
    []
  );

  // Filter to the selected location, then sort newest first.
  const sorted = useMemo(() => {
    const filtered = filterBulletinsByLocation(liveBulletins, location || {});
    const src = Array.isArray(filtered) && filtered.length > 0
      ? filtered.map(mapBulletin).filter(Boolean)
      : BULLETINS;
    return [...src].sort((a,b) => new Date(b.uploadedAt||0) - new Date(a.uploadedAt||0));
  }, [liveBulletins, location?.id, location?.name, location?.nameEn]);

  // Find the bulletin the user originally tapped (handed off via window)
  const taggedId = (typeof window !== 'undefined') ? window.__bulletinStartId : null;
  const initialIdx = useMemo(() => {
    if (taggedId == null) return 0;
    const i = sorted.findIndex(b => b.id === taggedId);
    return i >= 0 ? i : 0;
  }, [taggedId, sorted]);

  // The video currently pinned at the top.
  const [activeId, setActiveId] = useState(sorted[initialIdx]?.id);
  // Whether the platform share sheet is open (toggled by the Share pill button below the player)
  const [showShare, setShowShare] = useState(false);
  // 5-button action bar state — Like / Dislike / Comment / Views / Share
  const [liked,      setLiked]      = useState(false);
  const [disliked,   setDisliked]   = useState(false);
  const [likeCount,  setLikeCount]  = useState(() => Math.floor(Math.random()*420) + 24);
  const [showComment,setShowComment]= useState(false);
  // The API fetch resolves after first render, so on mount `sorted` is empty
  // and `activeId` is undefined. Once the data arrives, point activeId at the
  // bulletin the user originally tapped (or the first one if no handoff).
  useEffect(() => {
    if (activeId) return;
    const id = sorted[initialIdx]?.id;
    if (id) setActiveId(id);
  }, [sorted, initialIdx, activeId]);
  // Clear the window hand-off once we've consumed it
  useEffect(() => {
    if (typeof window !== 'undefined') { try { delete window.__bulletinStartId; } catch(e){} }
  }, []);

  const active = sorted.find(b => b.id === activeId) || sorted[0];

  // Reset Like/Dislike state every time the user swaps to a different bulletin
  useEffect(() => {
    setLiked(false);
    setDisliked(false);
    setLikeCount(Math.floor(Math.random()*420) + 24);
  }, [activeId]);

  // The remaining list scrolls under the sticky player.
  // Repeat it so it feels endless even after today's bulletins are exhausted.
  const remaining = useMemo(() => (
    sorted.filter(b => b.id !== activeId)
  ), [sorted, activeId]);
  const feed = useMemo(() => (
    [...remaining, ...remaining, ...remaining]
  ), [remaining]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Always render a literal date like "10 May 2026" — no relative "Today/Yesterday/Day before" labels (per user request)
  const dateLabel = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  };

  // Strip trailing " — <date>" patterns from titleTe so the date isn't shown twice
  // (the date is rendered separately in the meta row). Matches anything after an em-dash
  // that ends with a 4-digit year, e.g. "— మే 10, 2026" or "— May 10, 2026".
  const cleanTitle = (text) => {
    if (!text) return '';
    return text.replace(/\s*[—–-]\s*[^—–-]*?20\d{2}[^—–-]*$/, '').trim();
  };

  // When user taps a thumbnail row, swap it into the sticky player at top
  const scrollRef = useRef(null);
  const handlePick = (id) => {
    setActiveId(id);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
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
        <div style={{flex:1, minWidth:0, textAlign:'center'}}>
          <div style={{fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
            fontWeight:900, fontSize:18, color:'#FFFFFF', lineHeight:1.2}}>
            కర్నూలు TV ప్రసారాలు
          </div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:600, fontSize:11, color:'rgba(255,255,255,0.85)',
            letterSpacing:0.6, marginTop:2}}>
            Kurnool TV Broadcasts · Tap any thumbnail to play here
          </div>
        </div>
        <div style={{width:38, flexShrink:0}}/>
      </div>

      {/* Body — sticky player + naturally-flowing list (no gap).
          The scroll container is the body div itself; the player uses position:sticky so
          it stays pinned to the top while the user scrolls through the remaining items. */}
      <div ref={scrollRef} style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch',
        background:T.isDark?'#050a14':'#F5F6F8',
        paddingBottom:24}}>
        {!active && (
          <div style={{padding:'48px 16px', textAlign:'center',
            fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, letterSpacing:0.5,
            color:T.textMuted}}>
            {bulletinsLoading ? 'Loading bulletins…' : 'No bulletins available yet.'}
          </div>
        )}
        {/* Sticky active player — pins at top of scroll container, NO extra paddingTop on the list */}
        {active && (
          <div style={{
            position:'sticky', top:0, zIndex:5,
            background:T.bg,
            boxShadow:'0 4px 14px rgba(0,0,0,0.18)',
          }}>
            <div style={{position:'relative', paddingBottom:'56.25%', height:0, background:'#000'}}>
              {active.ytId ? (
                <iframe
                  key={active.id}
                  data-yt-audio="1"
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none'}}
                  src={`https://www.youtube.com/embed/${active.ytId}?autoplay=1&mute=${isAudioUnlocked() ? '0' : '1'}&modestbranding=1&rel=0&playsinline=1&controls=1&fs=1&enablejsapi=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={active.titleEn || active.titleTe}
                />
              ) : active.videoUrl ? (
                <video
                  key={active.id}
                  data-primary-audio="1"
                  src={active.videoUrl}
                  poster={active.thumbnail || undefined}
                  controls
                  autoPlay
                  muted={!isAudioUnlocked()}
                  playsInline
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'#000', objectFit:'contain'}}
                />
              ) : (
                <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8, color:'rgba(255,255,255,0.55)'}}>
                  <div style={{fontSize:36}}>📺</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, letterSpacing:1}}>
                    {bulletinsLoading ? 'Loading bulletin…' : 'No video available'}
                  </div>
                </div>
              )}
              {/* LocalAI TV watermark */}
              <div style={{position:'absolute', top:10, right:10, zIndex:6,
                background:'rgba(0,0,0,0.55)', borderRadius:5, padding:'2px 6px',
                pointerEvents:'none', backdropFilter:'blur(2px)' }}>
                <Logo size="xs" dark={true} showTV={true}/>
              </div>
            </div>

            {/* Active headline only — time/date/duration line removed per user request.
                Bumped fontSize 16 → 18.5 (+15%) and centered per latest user request. */}
            <div style={{padding:'12px 14px 8px', background:T.bg2, textAlign:'center'}}>
              <h3 style={{margin:0,
                fontFamily:"'Noto Sans Telugu',sans-serif",
                fontWeight:800, fontSize:18.5, lineHeight:1.4, color:T.text,
                textAlign:'center',
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                overflow:'hidden'}}>{cleanTitle(active.titleTe)}</h3>
            </div>

            {/* ONE-LINE META + ACTION BAR — date/year on the left, 5 compact buttons on the right.
                Icons reduced to 8px (25% smaller than the prior 11px) per user request.
                Share keeps its red gradient so it stays visually prominent. */}
            <div style={{display:'flex', alignItems:'center', gap:6,
              padding:'4px 14px 10px', background:T.bg2,
              borderBottom:`1px solid ${T.border}`, flexWrap:'wrap'}}>

              {/* Date / month / year */}
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:11, fontWeight:600, color:T.textMuted, whiteSpace:'nowrap'}}>
                📅 {dateLabel(active.uploadedAt)}
              </span>

              {/* Right-aligned compact action bar */}
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

                {/* Views — violet (non-interactive) */}
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

        {/* Scrollable list of OTHER bulletins — flows naturally below the sticky player,
            zero gap. position:sticky on the player above keeps it pinned during scroll. */}
        <div style={{
          paddingTop:0,
        }}>
          {feed.map((b,i) => (
            <div key={`row-${i}`}
              onClick={()=>handlePick(b.id)}
              style={{
                background:T.bg2,
                margin:'0 12px 14px',
                borderRadius:12,
                border:`1px solid ${T.border}`,
                boxShadow:T.isDark?'none':'0 2px 10px rgba(0,0,0,0.06)',
                cursor:'pointer',
                display:'flex', flexDirection:'column', overflow:'hidden',
                transition:'transform 0.15s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}>
              {/* Full-width 16:9 thumbnail — matches the sticky player layout above */}
              <div style={{width:'100%', position:'relative', paddingBottom:'56.25%', height:0, background:'#000'}}>
                <img
                  src={b.ytId ? `https://img.youtube.com/vi/${b.ytId}/maxresdefault.jpg` : (b.thumbnail || '')}
                  alt={b.titleEn||b.titleTe}
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                  onError={e=>{
                    if (b.ytId) { e.target.src = `https://img.youtube.com/vi/${b.ytId}/hqdefault.jpg`; }
                    else { e.target.style.display = 'none'; }
                  }}
                />
                {/* Center play-button overlay */}
                <div style={{position:'absolute', inset:0, display:'flex',
                  alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
                  <div style={{width:56, height:56, borderRadius:'50%',
                    background:'rgba(255,255,255,0.92)', display:'flex',
                    alignItems:'center', justifyContent:'center',
                    boxShadow:'0 4px 18px rgba(0,0,0,0.5)'}}>
                    <div style={{width:0, height:0, marginLeft:5,
                      borderTop:'12px solid transparent', borderBottom:'12px solid transparent',
                      borderLeft:'20px solid #D0021B'}}/>
                  </div>
                </div>
                {/* LocalAI TV channel watermark — top-right */}
                <div style={{position:'absolute', top:10, right:10, zIndex:2,
                  background:'rgba(0,0,0,0.55)', borderRadius:5, padding:'2px 6px',
                  pointerEvents:'none', backdropFilter:'blur(2px)' }}>
                  <Logo size="xs" dark={true} showTV={true}/>
                </div>
                {/* Duration badge — bottom right */}
                {b.duration && (
                  <div style={{position:'absolute', bottom:8, right:8, zIndex:2,
                    background:'rgba(0,0,0,0.78)', borderRadius:4, padding:'2px 7px'}}>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                      fontSize:10, fontWeight:700, color:'white', letterSpacing:0.3}}>
                      ▶ {b.duration}
                    </span>
                  </div>
                )}
              </div>
              {/* Headline + compact date row + mini 5-action bar (~50% of header size) */}
              <div style={{padding:'10px 14px 12px'}}>
                <div style={{
                  fontFamily:"'Noto Sans Telugu',sans-serif",
                  fontWeight:800, fontSize:14, lineHeight:1.4, color:T.text,
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                  overflow:'hidden'}}>{cleanTitle(b.titleTe)}</div>

                {/* Date + mini action bar — clicking these still bubbles up to handlePick, so we stopPropagation per button. */}
                <div style={{display:'flex', alignItems:'center', gap:5,
                  marginTop:5, flexWrap:'wrap'}}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                    fontSize:8.5, fontWeight:600, color:T.textMuted, whiteSpace:'nowrap'}}>
                    📅 {dateLabel(b.uploadedAt)}
                  </span>

                  <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:2}}>
                    {/* Like (mini) */}
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
                    {/* Dislike (mini) */}
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
                    {/* Comment (mini) */}
                    <span style={{display:'inline-flex', alignItems:'center',
                      background: T.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',
                      border:`1px solid ${T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
                      borderRadius:6, padding:'1.5px 4px'}}>
                      <span style={{fontSize:6}}>💬</span>
                    </span>
                    {/* Views (mini) */}
                    <span style={{display:'inline-flex', alignItems:'center', gap:2,
                      background: T.isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)',
                      border:`1px solid ${T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}`,
                      borderRadius:6, padding:'1.5px 4px'}}>
                      <span style={{fontSize:6}}>👁</span>
                      <span style={{fontFamily:"'Barlow Condensed',sans-serif",
                        fontSize:7, fontWeight:800, letterSpacing:0.2,
                        color:T.isDark?'rgba(255,255,255,0.65)':T.text}}>{b.views || ''}</span>
                    </span>
                    {/* Share (mini RED) */}
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
          ))}
          {/* End filler */}
          <div style={{textAlign:'center', padding:'12px 12px 4px',
            fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, color:T.textMuted, letterSpacing:0.6}}>
            — Tap any bulletin to play it at the top —
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SHARE SHEET — pops up when user taps the red Share pill below
          the active video. Works on desktop AND mobile without relying
          on navigator.share. Each platform opens its own share URL.
          ═══════════════════════════════════════════════════════════ */}
      {showShare && active && (() => {
        const enc      = encodeURIComponent;
        const videoUrl = active.ytId
          ? `https://www.youtube.com/watch?v=${active.ytId}`
          : (active.videoUrl || '');
        const titleTe  = active.titleTe || '';
        const titleEn  = active.titleEn || '';
        const subject  = titleEn || titleTe || 'LocalAI TV bulletin';
        const text     = enc(`${titleTe}${titleEn ? '\n'+titleEn : ''}\n📺 Watch on LocalAI TV: ${videoUrl}`);
        const url      = enc(videoUrl);
        const close    = () => setShowShare(false);

        const PLATFORMS = [
          { label:'WhatsApp', color:'#25D366', bg:'rgba(37,211,102,0.15)',
            icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#25D366"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.76 1.83 6.74L2 30l7.44-1.79A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.1 19.1c-.3.84-1.76 1.6-2.4 1.7-.62.1-1.4.14-2.26-.14a20.6 20.6 0 01-2.04-.75c-3.58-1.55-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7s.92-2.62 1.26-2.98c.3-.34.66-.42.88-.42l.64.01c.2 0 .48-.08.74.56.28.66.94 2.3.02 2.56l-.5.22c-.28.14-.52.3-.36.6.16.3.7 1.16 1.5 1.88l1.44 1.14c.3.16.6.12.82-.12.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.02.96 2.36 1.13.34.18.58.26.66.4.08.16.08.9-.22 1.74z"/></svg>,
            action:()=>window.open(`https://api.whatsapp.com/send?text=${text}`,'_blank','noopener,noreferrer') },
          { label:'Telegram', color:'#0088CC', bg:'rgba(0,136,204,0.15)',
            icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#0088CC"><path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm6.84 9.58l-2.36 11.12c-.18.8-.64 1-1.3.62l-3.6-2.65-1.73 1.67c-.2.2-.36.36-.73.36l.26-3.68 6.7-6.05c.3-.26-.06-.4-.44-.14l-8.28 5.21-3.57-1.12c-.78-.24-.8-.78.16-1.15l13.93-5.37c.64-.24 1.2.14.96 1.18z"/></svg>,
            action:()=>window.open(`https://t.me/share/url?url=${url}&text=${text}`,'_blank','noopener,noreferrer') },
          { label:'Facebook', color:'#1877F2', bg:'rgba(24,119,242,0.15)',
            icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#1877F2"><path d="M16 2C8.27 2 2 8.27 2 16c0 6.99 5.12 12.77 11.81 13.82V19.9h-3.55V16h3.55v-3.08c0-3.51 2.09-5.44 5.28-5.44 1.53 0 3.12.27 3.12.27v3.44h-1.76c-1.73 0-2.27 1.07-2.27 2.17V16h3.87l-.62 3.9h-3.25v9.92C24.88 28.77 30 22.99 30 16c0-7.73-6.27-14-14-14z"/></svg>,
            action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`,'_blank','noopener,noreferrer') },
          { label:'X/Twitter', color:'#fff', bg:'rgba(255,255,255,0.1)',
            icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="white"><path d="M18.24 14.17L27.1 4h-2.1l-7.7 8.95L11 4H4l9.3 13.53L4 28h2.1l8.13-9.45L21 28h7z"/></svg>,
            action:()=>window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`,'_blank','noopener,noreferrer') },
          { label:'Email', color:'#EA4335', bg:'rgba(234,67,53,0.15)',
            icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="28" height="20" rx="3" stroke="#EA4335" strokeWidth="2.2"/><path d="M2 10l14 9 14-9" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round"/></svg>,
            action:()=>window.open(`mailto:?subject=${enc(subject)}&body=${text}`,'_self') },
          { label:'Copy Link', color:'#9CA3AF', bg:'rgba(156,163,175,0.12)',
            icon:<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>,
            action:()=>{ try {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(decodeURIComponent(text)).then(()=>{ try { alert('🔗 Link copied to clipboard!'); } catch(e){} });
              } else {
                const ta = document.createElement('textarea'); ta.value = decodeURIComponent(text);
                document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                alert('🔗 Link copied to clipboard!');
              }
            } catch(e){} } },
        ];

        return (
          <div onClick={close}
            style={{ position:'absolute', inset:0, zIndex:100,
              background:'rgba(0,0,0,0.65)',
              display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:'#111', borderRadius:'22px 22px 0 0',
                padding:'12px 0 42px',
                boxShadow:'0 -6px 40px rgba(0,0,0,0.6)' }}>
              <div style={{ width:38, height:4, background:'rgba(255,255,255,0.18)',
                borderRadius:2, margin:'0 auto 16px' }}/>
              <div style={{ textAlign:'center', marginBottom:6,
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800, fontSize:16, color:'white', letterSpacing:0.5 }}>
                Share this Bulletin
              </div>
              <div style={{ textAlign:'center', marginBottom:20,
                fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
                fontSize:11, color:'rgba(255,255,255,0.5)',
                padding:'0 24px', lineHeight:1.4,
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                {titleTe || titleEn}
              </div>
              <div style={{ display:'flex', flexWrap:'wrap',
                justifyContent:'center', gap:16, padding:'0 20px' }}>
                {PLATFORMS.map(p => (
                  <div key={p.label}
                    onClick={() => { p.action(); close(); }}
                    style={{ display:'flex', flexDirection:'column',
                      alignItems:'center', gap:6, cursor:'pointer', width:68 }}>
                    <div
                      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px) scale(1.08)'; e.currentTarget.style.boxShadow=`0 6px 22px ${p.color}55`; }}
                      onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow=`0 2px 16px ${p.color}22`; }}
                      style={{ width:56, height:56, borderRadius:18,
                        background:p.bg, border:`1.5px solid ${p.color}44`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        boxShadow:`0 2px 16px ${p.color}22`,
                        transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)' }}>
                      {p.icon}
                    </div>
                    <span style={{ fontFamily:"'Barlow',sans-serif",
                      fontSize:10, color:'rgba(255,255,255,0.7)',
                      fontWeight:600, textAlign:'center' }}>{p.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={close}
                style={{ display:'block', margin:'22px auto 0',
                  background:'rgba(255,255,255,0.07)',
                  border:'1px solid rgba(255,255,255,0.14)',
                  borderRadius:14, padding:'12px 50px',
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:700, fontSize:15,
                  color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

      {/* Comment drawer — opened by the teal Comment button in the 5-button action bar */}
      {showComment && (
        <CommentDrawer open={true} onClose={() => setShowComment(false)} itemId={active?.id} />
      )}
    </div>
  );
}





// ═══════════════════════════════════════════════════════════════
// DISTRICT NEWS FEED SCREEN — జిల్లా వార్తలు
// Full-screen vertical swipe feed with single-line bottom category bar
// Same UX pattern as Shorts + Classifieds
// ═══════════════════════════════════════════════════════════════


export { BulletinPlayerScreen };
export default BulletinPlayerScreen;
