import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, mapBulletin, filterBulletinsByLocation, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import { mapIncidentToShort, resolveMediaUrl } from './../data/incidents.js';
import { getLocationIdFromName } from './../data/regions.js';

import BottomNav from './../components/BottomNav.jsx';
import ClassifiedsSection from './../components/Sections/ClassifiedsSection.jsx';
import DistrictNewsFeedScreen from './DistrictNewsFeedScreen.jsx';
import LiveActivityStrip from './../components/LiveActivityStrip.jsx';
import LiveStrip from './../components/Sections/LiveStrip.jsx';
import Logo from './../components/Logo.jsx';
import MenuRow from './../components/MenuRow.jsx';
import PublicVoiceSection from './../components/Sections/PublicVoiceSection.jsx';
import SectionAccentBar from './../components/SectionAccentBar.jsx';
import UnifiedFeedViewer from './../components/Feed/UnifiedFeedViewer.jsx';
import UploadCtaBanner from './../components/Sections/UploadCtaBanner.jsx';
import { LocationPin, LiveDot, FooterLink, SkeletonBox } from './../components/atoms.jsx';
import { ShortNewsSection } from './../components/Sections/ShortNewsSection.jsx';
import { useAuth } from './../contexts/AuthContext.jsx';
import { useNotifications, formatNotifTime } from './../contexts/NotificationContext.jsx';

function HomeScreen({ onNavigate, onOpenNews, onReport, onLogoTap, userConstituency, userState, onChangeLocation, onSelectLocation }) {
  const { T, isDark, toggleTheme } = useAppTheme();
  // Signed-in user drives the hamburger header. When logged out, show a
  // generic "Guest" prompt instead of stale data.
  const { user, isAuthenticated, isVerified, logout } = useAuth();
  // Internal, app-driven notifications (verification status + future events).
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const displayName   = isAuthenticated ? (user?.name || 'User') : 'Guest';
  const avatarInitial = (displayName.trim().charAt(0) || 'G').toUpperCase();
  // Resolve the signed-in user's profile photo (same rules as the Profile page).
  const profilePhotoUrl = useMemo(() => {
    if (!isAuthenticated) return '';
    const raw = user?.profile_picture || user?.profile_photo || user?.profilePhoto || user?.photo || user?.avatar || '';
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    const host = API_BASE.replace(/\/api\/?$/, '');
    let path = String(raw).trim();
    if (path.startsWith('/api/')) path = path.slice(4);
    if (!path.startsWith('/')) path = '/' + path;
    return host + path;
  }, [user, isAuthenticated]);
  // Resolve the live channel from the constituency the user picked in the
  // onboarding LocationPicker (userConstituency = LIVE_CHANNELS[].nameEn, e.g. "Tirupati").
  // Falls back to the first channel only when there is no match (e.g. not yet picked).
  const __initChannel = LIVE_CHANNELS.find(c => c.nameEn === userConstituency) || LIVE_CHANNELS[0];
  const [activeChannel, setActiveChannel] = useState(__initChannel);
  const [viewers,       setViewers]       = useState(__initChannel.viewers);
  const [cat,           setCat]           = useState('District');
  const [showNotifs,    setShowNotifs]    = useState(false);
  const [showHamburger, setShowHamburger] = useState(() => {
    // If user just hit "Go Back" from the Profile screen, auto-open the hamburger menu.
    if (typeof window !== 'undefined' && window.__openHamburgerOnLoad) {
      try { delete window.__openHamburgerOnLoad; } catch(e) { window.__openHamburgerOnLoad = false; }
      return true;
    }
    return false;
  });
  const [showLiveOverlay, setShowLiveOverlay] = useState(false); // bulletin click → fullscreen YouTube live
  const [showSearch,    setShowSearch]    = useState(false);
  const [showAppShare,  setShowAppShare]  = useState(false); // share-the-app sheet (triggered by the new Share App button)
  const [searchQuery,   setSearchQuery]   = useState('');
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [feedViewer,    setFeedViewer]    = useState(null);  // {type,items,startIdx,title}
  const [selectedShort, setSelectedShort] = useState(null);  // legacy shorts compat
  // Index into the sorted incidentShorts feed for the KurnoolShortsScreen overlay
  // opened from a Top Stories rail tap. null = overlay closed.
  const [topStoriesViewerIdx, setTopStoriesViewerIdx] = useState(null);
  const [pullRefreshing, setPullRefreshing] = useState(false);
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('localaitv_bookmarks') || '[]'); }
    catch { return []; }
  });
  const toggleBookmark = (newsId) => {
    setBookmarks(prev => {
      const next = prev.includes(newsId)
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId];
      try { localStorage.setItem('localaitv_bookmarks', JSON.stringify(next)); } catch {}
      return next;
    });
  };
  const homeScrollRef = useRef(null);
  const pullStartY    = useRef(0);
  const [dropStep,      setDropStep]      = useState('state');  // 'state' | 'constituency'
  const [dropState,     setDropState]     = useState(null);     // 'AP' | 'TG'

  const displayConstituency = userConstituency || 'Kurnool';
  const displayState        = userState        || 'AP';

  // ── LIVE API FEEDS — auto-refresh every 5 min ─────────────
  // (The /api/news feed was removed from the project; Top Stories renders the
  //  static NEWS_ITEMS set. Bulletins and incidents below are still live.)
  const [refreshTick, setRefreshTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setRefreshTick(v => v + 1), 5 * 60 * 1000); // 5 min
    return () => clearInterval(t);
  }, []);

  // ── OpenWeatherMap live weather ────────────────────────────
  // Free-tier key embedded in the bundle (per OWM convention).
  // Refresh whenever the active channel switches and on a 15-min tick.
  // Cached in component state — only one in-flight request per city.
  // Falls back silently on error (the widget renders a neutral placeholder).
  const OWM_KEY = 'cdbf68f3afc557e674b97c9f52536ab6';
  const [weather, setWeather] = useState(null); // { city, temp, main, icon }
  const [weatherTick, setWeatherTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWeatherTick(v => v + 1), 15 * 60 * 1000); // 15 min
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const city = activeChannel?.nameEn;
    if (!city) return;
    let cancelled = false;
    const ctrl = new AbortController();
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city + ',IN')}&appid=${OWM_KEY}&units=metric`,
      { signal: ctrl.signal }
    )
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled || !d || !d.main) return;
        setWeather({
          city,
          temp: d.main.temp,
          main: d.weather && d.weather[0] ? d.weather[0].main : '',
          icon: d.weather && d.weather[0] ? d.weather[0].icon : '',
        });
      })
      .catch(() => {});
    return () => { cancelled = true; ctrl.abort(); };
  }, [activeChannel?.nameEn, weatherTick]);
  // OWM "main" → emoji. Defaults to a neutral cloud-sun if we can't classify.
  const weatherEmoji = (main) => {
    switch ((main || '').toLowerCase()) {
      case 'clear':         return '☀️';
      case 'clouds':        return '☁️';
      case 'rain':          return '🌧️';
      case 'drizzle':       return '🌦️';
      case 'thunderstorm':  return '⛈️';
      case 'snow':          return '❄️';
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'fog':           return '🌫️';
      default:              return '🌤️';
    }
  };
  // Only render API data for the currently-selected channel — guards against
  // stale data briefly showing during a channel switch.
  const weatherForActive = (weather && weather.city === activeChannel?.nameEn) ? weather : null;

  // The selected channel maps to the backend's numeric locations.id. Bulletins
  // and incidents are scoped to it so the feeds match the location the user
  // picked (and refetch when they switch channels). Falls back to the picked
  // constituency name when no channel object is resolved yet.
  const activeLocationId = useMemo(
    () => getLocationIdFromName(activeChannel?.nameEn || displayConstituency, activeChannel?.state || userState),
    [activeChannel?.nameEn, activeChannel?.state, displayConstituency, userState]
  );
  const locParam = activeLocationId != null ? `&location_id=${activeLocationId}` : '';

  // The /news API was removed from the project — Top Stories now renders the
  // static NEWS_ITEMS set (see newsToShow below).
  // /api/bulletins — paginated bulletin board (id, title, content, timestamp,
  // priority_level, image_url, audio_url, video_url). The backend returns
  // location_id: 0 for every bulletin, so we fetch all and filter by the
  // selected channel client-side (see filterBulletinsByLocation / bulletinsToShow).
  const { data: liveBulletins, loading: bulletinsLoading, error: bulletinsError } = useAPI(
    () => apiCall(`/bulletins?page=1&limit=50`).then(d => d.items || d),
    BULLETINS,
    [refreshTick]
  );
  // /api/incidents — paginated incident feed (id, title, category, location).
  // Mapped into the SHORT_NEWS shape and passed to <ShortNewsSection items={…} />.
  const { data: liveIncidents, loading: incidentsLoading } = useAPI(
    () => apiCall(`/incidents?page=1&limit=10${locParam}`).then(d => d.items || d),
    [],
    [activeLocationId, refreshTick]
  );

  // Incident → SHORT_NEWS shape adapter + media URL resolver are shared
  // with the App-level 'shortsfeed' route via src/data/incidents.js so
  // both feeds project incidents the same way.

  // Incident → news-shape projection used by both the Top Stories rail
  // cards and the DistrictNewsFeedScreen viewer that opens on tap. The
  // rail card reads id/title/cat/source/time/live/thumbnail; the viewer
  // additionally reads mediaUrl (for the <video> player) and uploadedAt
  // (for sort + date label). ytId/link stay null — incidents are S3
  // videos, not YouTube embeds or external articles.
  const mapIncidentToRailItem = (it) => ({
    id:         it?.id,
    title:      it?.title || '',
    cat:        it?.category?.name || 'District',
    source:     'LocalAI TV',
    channel:    'LocalAI TV',
    time:       it?.created_at
      ? new Date(it.created_at).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' })
      : '',
    live:       !!(it?.is_live),
    link:       null,
    ytId:       null,
    thumbnail:  resolveMediaUrl(it?.cover_image_path || it?.thumbnail),
    mediaUrl:   resolveMediaUrl(it?.video_path || it?.media_url),
    uploadedAt: it?.created_at || null,
  });

  const newsToShow     = NEWS_ITEMS;
  const bulletinsToShow= (Array.isArray(liveBulletins) && liveBulletins.length > 0)
    ? filterBulletinsByLocation(liveBulletins, { id: activeLocationId, name: activeChannel?.name, nameEn: activeChannel?.nameEn }).map(mapBulletin)
    : BULLETINS;
  const incidentShorts = (Array.isArray(liveIncidents) && liveIncidents.length > 0)
    ? liveIncidents.map(mapIncidentToShort)
    : null;

  // Pulse viewer count every 5 seconds
  useEffect(() => {
    if (!activeChannel?.live) return;
    const t = setInterval(() => {
      setViewers(v => v + Math.floor(Math.random() * 30) - 14);
    }, 5000);
    return () => clearInterval(t);
  }, [activeChannel]);

  useEffect(() => { setViewers(activeChannel?.viewers); }, [activeChannel]);

  // News categories — English id, Telugu label as specified
  const cats = [
    { id:'All',       emoji:'📋', te:'అన్నీ'               },
    { id:'District',  emoji:'🏙️', te:'జిల్లా వార్తలు'      },
    { id:'State',     emoji:'🗺️', te:'రాష్ట్ర వార్తలు'     },
    { id:'National',  emoji:'🇮🇳', te:'జాతీయ వార్తలు'      },
    { id:'World',     emoji:'🌍', te:'ప్రపంచ వార్తలు'      },
    { id:'Devotional',emoji:'🙏', te:'భక్తి వార్తలు'       },
    { id:'Agri',      emoji:'🌾', te:'వ్యవసాయ వార్తలు'     },
    { id:'Business',  emoji:'💼', te:'వ్యాపార వార్తలు'     },
    { id:'Crime',     emoji:'🚔', te:'నేర వార్తలు'         },
    { id:'Health',    emoji:'🏥', te:'ఆరోగ్య వార్తలు'      },
    { id:'Sports',    emoji:'🏆', te:'క్రీడా వార్తలు'      },
  ];
  // Search box (currently dead UI — hidden by default; theme toggle replaced
  // the search icon) still filters news for any future re-enable. Left intact
  // because FeaturedStoryHero above continues to consume newsToShow.
  const searchLower = searchQuery.toLowerCase();
  const searched = searchQuery.trim()
    ? newsToShow.filter(n =>
        n.title?.toLowerCase().includes(searchLower) ||
        n.titleTe?.toLowerCase().includes(searchLower) ||
        n.titleEn?.toLowerCase().includes(searchLower))
    : newsToShow;
  // Top Stories rail is sourced from /api/incidents (live citizen-reporter
  // short videos), not /api/news. Category pills below the header are kept
  // as UI only — setCat still fires but no filtering is applied, since
  // incidents don't currently carry the news category taxonomy. When the
  // backend starts returning category-tagged incidents, wire the filter back
  // in here. Empty rail when the API returns nothing — no static fallback.
  const incidentsRailItems = useMemo(
    () => (Array.isArray(liveIncidents) ? liveIncidents.map(mapIncidentToRailItem) : []),
    [liveIncidents]
  );
  // Top Stories rail shows the newest 10 incidents (indices 0–9). The newest
  // one (index 0) renders as the big LEAD STORY card; the rest are secondary.
  const filteredHome = useMemo(() => incidentsRailItems.slice(0, 10), [incidentsRailItems]);

  return (
    <div className="ott-screen-in"
      style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* Offline / API error banner removed per user request — it was distracting
          while analyzing the home page. Cached content still loads silently. */}

      {/* ══════════════════════════════════════════════════════
           HOME TOPBAR — exact layout from wireframe sketch
           ROW 1: Logo (left)  ·  Search icon  ·  Bell (right)
           ROW 2: Headline — AI ... హైపర్‌లోకల్ TV channel
           ROW 3: Tagline  — India's First AI Hyperlocal channel
           ROW 4: Search expand (only when search icon tapped)
      ══════════════════════════════════════════════════════ */}
      <div style={{
        background: T.isDark
          ? 'linear-gradient(180deg,#030814 0%,#050D20 100%)'
          : '#FFFFFF',
        /* paddingTop bumped 8 → 16 for more breathing room above the logo row */
        paddingTop:16,
        flexShrink:0,
        /* Bottom border removed per user request */
      }}>

        {/* ── ROW 1: Logo | Search | Bell | Hamburger ─────────
            alignItems:'center' — icons centered vertically against the taller logo
            (reverted to previous placement, keeping the smaller 34px icon size). */}
        <div style={{
          display:'flex', alignItems:'center',
          justifyContent:'space-between',
          /* paddingBottom 8 → 14 so the logo→dropdown gap matches the
             dropdown→live-TV gap (also 14px). paddingLeft kept at 22. */
          padding:'0 16px 14px 22px', gap:10,
        }}>
          {/* Logo — animated MP4 with instant SVG placeholder to avoid blank flash.
              The static SVG renders synchronously (no network). The MP4 lazily replaces it
              once it can play, giving a smooth no-flicker handoff.
              Height history: 48 → 58 → 73 → 80 → 88 → 70 → 60 → 48 → 43 (-10% per user request). */}
          <div onClick={onLogoTap} style={{
            cursor:'pointer', flexShrink:0, height:43,
            display:'flex', alignItems:'center', position:'relative',
            minWidth:80, /* reserve space so layout doesn't shift when video loads */
          }}>
            {/* Static SVG logo — visible immediately (instant first paint).
                key flips with theme so it remounts (resets opacity) on toggle. */}
            <div key={isDark?'logo-dark':'logo-light'} style={{
              position:'absolute', left:0, top:'50%',
              transform:'translateY(-50%)',
              transition:'opacity 0.25s ease',
              opacity: 1,
            }} className="logo-svg-fallback">
              <Logo size="smx" dark={isDark} showTV={true} />
            </div>
            {/* Animated MP4 — LIGHT MODE ONLY (it's a white-background asset).
                In Dark mode the adaptive SVG <Logo dark> stays visible instead. */}
            {!isDark && (
            <video
              src="home-page-header-logo.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{
                height:43, width:'auto', display:'block', objectFit:'contain',
                position:'relative', zIndex:2,
                opacity:0, transition:'opacity 0.25s ease',
              }}
              onCanPlay={e=>{
                // Video is buffered enough to play — fade it in and fade the SVG out
                e.target.style.opacity = '1';
                const svg = e.target.previousSibling;
                if (svg) svg.style.opacity = '0';
              }}
              onError={e=>{
                // Hide the broken video; SVG fallback stays visible
                e.target.style.display='none';
              }}
            />
            )}
          </div>

          {/* Right icons — Search + Bell */}
          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>

            {/* Dark / Light mode toggle — replaces Search. Default = Light.
                Moon = currently Light (tap → Dark) · Sun = currently Dark (tap → Light) */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              style={{
                width:34, height:34, borderRadius:10, cursor:'pointer',
                background: isDark ? 'rgba(255,193,7,0.16)' : T.bg3,
                border:`1.5px solid ${isDark?'rgba(255,193,7,0.5)':T.border}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s',
                boxShadow: isDark?'0 0 12px rgba(255,193,7,0.25)':'none',
              }}>
              {isDark ? (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="#FFC107" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="2"  x2="12" y2="4"/>
                  <line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4.93" y1="4.93"  x2="6.34" y2="6.34"/>
                  <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
                  <line x1="2"  y1="12" x2="4"  y2="12"/>
                  <line x1="20" y1="12" x2="22" y2="12"/>
                  <line x1="6.34" y1="17.66" x2="4.93" y2="19.07"/>
                  <line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/>
                </svg>
              ) : (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke={T.textMuted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* Bell icon — 10% smaller (38 → 34) */}
            <button
              onClick={()=>setShowNotifs(v=>!v)}
              style={{
                width:34, height:34, borderRadius:10, cursor:'pointer',
                background: showNotifs ? 'rgba(208,2,27,0.12)' : T.bg3,
                border:`1.5px solid ${showNotifs?'rgba(208,2,27,0.45)':T.border}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s', position:'relative',
              }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke={showNotifs?T.red:T.textMuted}
                strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position:'absolute', top:-3, right:-3,
                  minWidth:15, height:15, padding:'0 3px', borderRadius:8,
                  background:T.red, border:`1.5px solid ${T.bg2}`,
                  color:'#fff', fontSize:9, fontWeight:800, lineHeight:'12px',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  pointerEvents:'none',
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {/* Hamburger menu — 10% smaller (38 → 34) */}
            <button
              onClick={()=>{ setShowHamburger(v=>!v); setShowNotifs(false); }}
              aria-label="Open menu"
              style={{
                width:34, height:34, borderRadius:10, cursor:'pointer',
                background: showHamburger ? 'rgba(43,127,255,0.14)' : T.bg3,
                border:`1.5px solid ${showHamburger?'rgba(43,127,255,0.55)':T.border}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all 0.2s',
                boxShadow: showHamburger?'0 0 12px rgba(43,127,255,0.22)':'none',
              }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke={showHamburger?'#2B7FFF':T.textMuted}
                strokeWidth={2.4} strokeLinecap="round">
                <line x1="4" y1="7"  x2="20" y2="7"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="17" x2="20" y2="17"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tagline + sub-tagline intentionally removed per user request — cleaner header */}

        {/* ── ROW 4: Search expand bar (only when open) ─────── */}
        {showSearch && (
          <div style={{padding:'0 16px 12px', animation:'fadeIn 0.18s ease'}}>
            <div style={{
              display:'flex', alignItems:'center', gap:10,
              background:T.bg3, borderRadius:14, padding:'11px 14px',
              border:'1.5px solid rgba(59,143,255,0.45)',
              boxShadow:'0 0 18px rgba(59,143,255,0.14)',
            }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none"
                stroke="rgba(59,143,255,0.7)" strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                autoFocus
                value={searchQuery}
                onChange={e=>setSearchQuery(e.target.value)}
                placeholder="వార్తలు వెతకండి… (Search news)"
                style={{
                  flex:1, background:'none', border:'none', outline:'none',
                  fontSize:14, color:T.text, fontFamily:"'Barlow',sans-serif",
                }}
              />
              {searchQuery && (
                <button onClick={()=>setSearchQuery('')}
                  style={{background:'none',border:'none',color:T.textMuted,
                    fontSize:18,cursor:'pointer',lineHeight:1,padding:'0 2px'}}>
                  ×
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* ══ UNIFIED FEED VIEWER ════════════════════════════════ */}
      {feedViewer && (
        <UnifiedFeedViewer
          type={feedViewer.type}
          items={feedViewer.items}
          startIdx={feedViewer.startIdx || 0}
          title={feedViewer.title}
          activeChannel={activeChannel}
          onClose={()=>setFeedViewer(null)}
        />
      )}
      {/* ── NOTIFICATION PANEL ─────────────────────────────── */}
      {showNotifs && (
        <div style={{position:'absolute',top:148,right:12,left:12,zIndex:100,
          background:T.bg2,borderRadius:16,border:`1px solid ${T.border}`,
          boxShadow:`0 8px 32px rgba(0,0,0,0.25)`,overflow:'hidden'}}>
          {/* Header — action controls are real <button>s with comfortable
              tap targets so they work reliably on touch screens. */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,
            padding:'10px 12px',borderBottom:`1px solid ${T.border}`,
            background:T.isDark?'rgba(208,2,27,0.08)':'rgba(208,2,27,0.04)'}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:T.text,
              flexShrink:1,minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              🔔 Notifications
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
              <button
                type="button"
                disabled={unreadCount===0}
                onClick={(e)=>{ e.stopPropagation(); markAllRead(); }}
                style={{
                  fontFamily:"'Barlow',sans-serif",fontSize:11,fontWeight:700,lineHeight:1,
                  padding:'8px 10px',minHeight:34,borderRadius:8,whiteSpace:'nowrap',flexShrink:0,
                  border:`1px solid ${unreadCount>0?'rgba(43,127,255,0.45)':T.border}`,
                  background:unreadCount>0?'rgba(43,127,255,0.12)':'transparent',
                  color:unreadCount>0?'#2B7FFF':`${T.textMuted}66`,
                  cursor:unreadCount>0?'pointer':'default',
                  WebkitTapHighlightColor:'transparent',touchAction:'manipulation',
                }}>Mark all read</button>
              <button
                type="button"
                disabled={notifications.length===0}
                onClick={(e)=>{ e.stopPropagation(); clearAll(); }}
                style={{
                  fontFamily:"'Barlow',sans-serif",fontSize:11,fontWeight:700,lineHeight:1,
                  padding:'8px 10px',minHeight:34,borderRadius:8,whiteSpace:'nowrap',flexShrink:0,
                  border:`1px solid ${notifications.length?'rgba(208,2,27,0.45)':T.border}`,
                  background:notifications.length?'rgba(208,2,27,0.12)':'transparent',
                  color:notifications.length?T.red:`${T.red}66`,
                  cursor:notifications.length?'pointer':'default',
                  WebkitTapHighlightColor:'transparent',touchAction:'manipulation',
                }}>Clear all</button>
              <button
                type="button"
                onClick={(e)=>{ e.stopPropagation(); setShowNotifs(false); }}
                aria-label="Close notifications"
                style={{background:'none',border:'none',fontSize:20,color:T.textMuted,
                  cursor:'pointer',lineHeight:1,width:34,height:34,flexShrink:0,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>×</button>
            </div>
          </div>
          {/* Notif list */}
          <div style={{maxHeight:'60vh',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
          {notifications.length === 0 ? (
            <div style={{padding:'28px 16px',textAlign:'center'}}>
              <div style={{fontSize:26,marginBottom:6}}>🔕</div>
              <div style={{fontSize:12,fontWeight:600,color:T.text}}>No notifications yet</div>
              <div style={{fontSize:10.5,color:T.textMuted,marginTop:3}}>We'll let you know when your account status changes.</div>
            </div>
          ) : notifications.map(n=>(
            <div key={n.id} onClick={()=>{
              setShowNotifs(false);
              if (n.nav) onNavigate(n.nav);
            }} style={{
              display:'flex',alignItems:'center',gap:12,padding:'12px 16px',
              borderBottom:`1px solid ${T.border}`,cursor:n.nav?'pointer':'default',
              background:n.unread?`${T.red}08`:'transparent',
              transition:'background 0.15s',
            }}>
              <div style={{width:38,height:38,borderRadius:10,flexShrink:0,
                background:n.unread?`${T.red}15`:T.bg3,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>
                {n.icon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:T.text,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.title}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{n.sub}</div>
              </div>
              <div style={{flexShrink:0,fontSize:9,color:T.textMuted,minWidth:24,textAlign:'right'}}>
                {formatNotifTime(n.ts)}
                {n.unread&&<div style={{width:6,height:6,borderRadius:'50%',background:T.red,marginTop:3,marginLeft:'auto'}}/>}
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* ══ HAMBURGER MENU DRAWER — slides in from the right (matches the user's mockup) ══ */}
      {showHamburger && (
        <>
          {/* Backdrop — translucent grey overlay; tap closes the drawer */}
          <div onClick={()=>setShowHamburger(false)} style={{
            position:'fixed', inset:0, zIndex:200,
            background:'rgba(0,0,0,0.35)',
            animation:'fadeIn 0.2s ease',
          }}/>
          {/* Drawer panel — fills the right ~78% of the screen */}
          <div style={{
            position:'fixed', top:0, right:0, bottom:0, zIndex:201,
            width:'78%', maxWidth:380,
            background:'#FFFFFF',
            boxShadow:'-8px 0 32px rgba(0,0,0,0.25)',
            display:'flex', flexDirection:'column',
            animation:'slideInRight 0.28s cubic-bezier(0.22,1,0.36,1)',
          }}>
            {/* ── Red gradient header with user info + close ── */}
            <div style={{
              background:'linear-gradient(135deg,#E8001E 0%,#D0021B 100%)',
              padding:'48px 18px 16px',
              display:'flex', alignItems:'center', gap:12,
              flexShrink:0,
            }}>
              {/* Avatar circle — profile photo when available, else initial */}
              <div style={{
                width:48, height:48, borderRadius:'50%',
                background:'#FFFFFF',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:900, fontSize:22, color:'#D0021B',
                flexShrink:0, overflow:'hidden',
                boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
              }}>
                {profilePhotoUrl
                  ? <img src={profilePhotoUrl} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.currentTarget.style.display='none';}}/>
                  : avatarInitial}
              </div>
              {/* Name */}
              <div style={{flex:1, minWidth:0}}>
                <div style={{
                  fontFamily:"'Barlow',sans-serif",
                  fontWeight:700, fontSize:18, color:'#FFFFFF',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{displayName}</div>
                {isAuthenticated && (
                  <div style={{
                    marginTop:5, display:'inline-flex', alignItems:'center', gap:5,
                    padding:'2px 9px 2px 7px', borderRadius:999,
                    background: isVerified ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.18)',
                    border: isVerified ? 'none' : '1px solid rgba(255,255,255,0.45)',
                  }}>
                    <span style={{fontSize:11, lineHeight:1}}>{isVerified ? '✅' : '⏳'}</span>
                    <span style={{
                      fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:11,
                      color: isVerified ? '#0F9D58' : '#FFFFFF',
                    }}>{isVerified ? 'Verified' : 'Not verified'}</span>
                  </div>
                )}
                {!isAuthenticated && (
                  <button
                    onClick={()=>{ setShowHamburger(false); onNavigate('profile'); }}
                    style={{
                      marginTop:2, padding:0, background:'transparent', border:'none',
                      cursor:'pointer', textAlign:'left',
                      fontFamily:"'Barlow',sans-serif", fontWeight:600, fontSize:12.5,
                      color:'rgba(255,255,255,0.92)', textDecoration:'underline',
                    }}>
                    Sign in / లాగిన్
                  </button>
                )}
              </div>
              {/* Close X */}
              <button onClick={()=>setShowHamburger(false)} style={{
                width:32, height:32, borderRadius:'50%',
                background:'transparent', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}>
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth={2.4} strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18"/>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                </svg>
              </button>
            </div>

            {/* ── Scrollable menu body ── */}
            <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch'}}>
              {/* Group 1: Primary nav */}
              {[
                { icon:'home',     label:'Home',         action:'home',         color:'#D0021B' },
                { icon:'info',     label:'About Us',     action:'about',        color:'#D0021B' },
                { icon:'upload',   label:'Upload News / Information',  action:'upload',       color:'#D0021B' },
              ].map((m,i,arr)=>(
                <MenuRow key={`g1-${i}`} item={m}
                  isLast={i===arr.length-1}
                  onClick={()=>{ setShowHamburger(false); try { window.__openHamburgerOnLoad = true; } catch(e){} if(m.action) onNavigate(m.action); }}/>
              ))}

              {/* divider */}
              <div style={{height:8, background:'#FAFBFC'}}/>

              {/* Group 2: Profile */}
              {[
                { icon:'user',      label:'My Profile',  action:'profile',   color:'#D0021B' },
              ].map((m,i,arr)=>(
                <MenuRow key={`g2-${i}`} item={m}
                  isLast={i===arr.length-1}
                  onClick={()=>{ setShowHamburger(false); try { window.__openHamburgerOnLoad = true; } catch(e){} if(m.action){ onNavigate(m.action); } }}/>
              ))}

              {/* divider */}
              <div style={{height:8, background:'#FAFBFC'}}/>

              {/* Group 3: Contact */}
              <MenuRow item={{icon:'mail', label:'Contact Us', action:'contact', color:'#D0021B'}}
                isLast={true}
                onClick={()=>{ setShowHamburger(false); try { window.__openHamburgerOnLoad = true; } catch(e){} onNavigate('contact'); }}/>

              {/* Section header */}
              <div style={{
                padding:'18px 18px 8px',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:11, fontWeight:800, color:'#9CA3AF',
                letterSpacing:1.5, textTransform:'uppercase',
                borderTop:'1px solid #F3F4F6',
              }}>
                Company & Support
              </div>

              {/* Group 4: Company & Support */}
              {[
                { icon:'doc',     label:'Grievance',               action:'grievance',      color:'#6B7280' },
                { icon:'shield',  label:'Privacy Policy',          action:'privacy',        color:'#6B7280' },
                { icon:'doc',     label:'Terms & Conditions',      action:'terms',          color:'#6B7280' },
                { icon:'shield',  label:'Copyright & Takedown',    action:'copyright',      color:'#6B7280' },
                { icon:'people',  label:'Channel Partner Program', action:'channelpartner', color:'#6B7280' },
                { icon:'bolt',    label:'Advertise With Us',       action:'advertise',      color:'#6B7280' },
              ].map((m,i,arr)=>(
                <MenuRow key={`g4-${i}`} item={m}
                  isLast={i===arr.length-1}
                  onClick={()=>{ setShowHamburger(false); try { window.__openHamburgerOnLoad = true; } catch(e){} if(m.action) onNavigate(m.action); }}/>
              ))}

              {/* Section header */}
              <div style={{
                padding:'18px 18px 12px',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:11, fontWeight:800, color:'#9CA3AF',
                letterSpacing:1.5, textTransform:'uppercase',
                borderTop:'1px solid #F3F4F6',
              }}>
                Follow Us
              </div>

              {/* Social icons row */}
              <div style={{display:'flex', gap:14, padding:'0 18px 18px'}}>
                {/* X (Twitter) */}
                <a href="https://x.com/localaitv/" target="_blank" rel="noreferrer"
                  style={{ width:44, height:44, borderRadius:'50%', background:'#000',
                    display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
                  <svg width={20} height={20} viewBox="0 0 32 32" fill="white">
                    <path d="M18.24 14.17L27.1 4h-2.1l-7.7 8.95L11 4H4l9.3 13.53L4 28h2.1l8.13-9.45L21 28h7L18.24 14.17z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://www.facebook.com/people/Local-AI-Media-Network-Private-Limited/61578436672896/" target="_blank" rel="noreferrer"
                  style={{ width:44, height:44, borderRadius:'50%', background:'#1877F2',
                    display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
                  <svg width={20} height={20} viewBox="0 0 32 32" fill="white">
                    <path d="M16 2C8.27 2 2 8.27 2 16c0 6.99 5.12 12.77 11.81 13.82V19.9h-3.55V16h3.55v-3.08c0-3.51 2.09-5.44 5.28-5.44 1.53 0 3.12.27 3.12.27v3.44h-1.76c-1.73 0-2.27 1.07-2.27 2.17V16h3.87l-.62 3.9h-3.25v9.92C24.88 28.77 30 22.99 30 16c0-7.73-6.27-14-14-14z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/localaitv" target="_blank" rel="noreferrer"
                  style={{ width:44, height:44, borderRadius:'50%',
                    background:'linear-gradient(135deg,#FFD600 0%,#FF7A00 25%,#FF1A6F 60%,#A845C9 100%)',
                    display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="white"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="https://www.youtube.com/@Localaitv" target="_blank" rel="noreferrer"
                  style={{ width:44, height:44, borderRadius:'50%', background:'#FF0000',
                    display:'flex', alignItems:'center', justifyContent:'center', textDecoration:'none' }}>
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="white">
                    <path d="M10 15l5.19-3L10 9v6zm11.56-7.83c-.13-.49-.51-.87-1-1C19.69 6 12 6 12 6s-7.69 0-8.56.17c-.49.13-.87.51-1 1C2.27 8.04 2.27 12 2.27 12s0 3.96.17 4.83c.13.49.51.87 1 1C4.31 18 12 18 12 18s7.69 0 8.56-.17c.49-.13.87-.51 1-1 .17-.87.17-4.83.17-4.83s0-3.96-.17-4.83z"/>
                  </svg>
                </a>
              </div>

              {/* spacer above logout */}
              <div style={{height:24}}/>
            </div>

            {/* ── Logout button pinned at the bottom (signed-in users only) ── */}
            {isAuthenticated && (
              <div style={{padding:'12px 14px 22px', flexShrink:0, background:'#FFFFFF'}}>
                <button onClick={()=>{ setShowHamburger(false); logout(); onNavigate('home'); }}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                    background:'linear-gradient(135deg,#E8001E,#D0021B)',
                    border:'none', borderRadius:14, padding:'14px',
                    fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:16,
                    color:'#FFFFFF', cursor:'pointer',
                    boxShadow:'0 4px 16px rgba(208,2,27,0.4)',
                  }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white"
                    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Trending hashtag chips intentionally removed per user request — keeps header focused */}

      {/* Tagline sentence removed per user request — cleaner header */}

      {/* ── LOCATION BAR — dropdown + weather (label + pin both removed) ─── */}
      <div style={{position:'relative',flexShrink:0,zIndex:50}}>
        {/* "మీ టౌన్ / మీ నియోజకవర్గం ఎంచుకోండి" label removed per user request — cleaner header */}
        <div style={{
          background:T.bg2,
          /* paddingTop 0 — tagline above already adds 8px gap; paddingBottom 14 for live-player breathing room */
          padding:'0 14px 14px',
          display:'flex', alignItems:'center', gap:10,
          /* bottom border removed for a cleaner header */
        }}>

          {/* Location pin SVG intentionally removed per user request */}

          {/* Dropdown selector — shows active channel, lists all 9 live */}
          <div style={{flex:1,position:'relative'}} onClick={()=>setShowDropdown(v=>!v)}>
            <div style={{
              display:'flex', alignItems:'center', gap:6,
              background:T.bg3,
              border:`1.5px solid ${showDropdown?'rgba(208,2,27,0.5)':T.border}`,
              borderRadius:10,
              padding:'6px 10px',
              cursor:'pointer',
              transition:'border 0.15s',
              boxShadow: showDropdown?'0 0 10px rgba(208,2,27,0.15)':'none',
            }}>
              {/* Live dot */}
              <div style={{width:7,height:7,borderRadius:'50%',background:'#00C85A',
                animation:'blink 1s infinite',boxShadow:'0 0 5px #00C85A',flexShrink:0}}/>
              {/* Selected channel name — Telugu – English (dash shortened to ~75% of previous length) */}
              <span style={{
                fontFamily:"'Noto Sans Telugu',sans-serif",
                fontWeight:700, fontSize:14, lineHeight:1.4,
                color:T.text, flex:1,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>
                {activeChannel?.name}
                {activeChannel?.nameEn ? (
                  <>
                    <span style={{color:T.textMuted, margin:'0 2px', fontWeight:500}}>–</span>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:600, color:T.textMuted}}>{activeChannel.nameEn}</span>
                  </>
                ) : null}
              </span>
              {/* TV label — indigo gradient (matches news/premium brand) */}
              <span style={{
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:900, fontSize:11, letterSpacing:0.6,
                background:'linear-gradient(135deg,#1A237E,#3F51B5)', // deep indigo gradient
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              }}>TV</span>
              {/* Chevron */}
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke={T.textMuted} strokeWidth={2.5} strokeLinecap="round">
                <polyline points={showDropdown?"18 15 12 9 6 15":"6 9 12 15 18 9"}/>
              </svg>
            </div>

            {/* ── Hierarchical Dropdown ─────────────────────── */}
            {showDropdown && (
              <div style={{
                position:'absolute', top:'calc(100% + 6px)', left:0, right:0,
                background:T.bg2,
                borderRadius:16,
                border:`1px solid ${T.border}`,
                boxShadow:`0 10px 40px rgba(0,0,0,0.28)`,
                overflow:'hidden',
                zIndex:200,
                animation:'fadeIn 0.15s ease',
              }} onClick={e=>e.stopPropagation()}>

                {/* ── STEP 1: Select State ── */}
                {dropStep === 'state' && (
                  <>
                    {/* Header */}
                    <div style={{
                      padding:'12px 16px 10px',
                      borderBottom:`1px solid ${T.border}`,
                      background: T.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',
                    }}>
                      <div style={{
                        fontFamily:"'Barlow Condensed',sans-serif",
                        fontWeight:800, fontSize:11,
                        letterSpacing:1.5, color:T.textMuted,
                      }}>SELECT STATE</div>
                    </div>

                    {/* AP option — clean text only, no image */}
                    <div onClick={()=>{ setDropState('AP'); setDropStep('constituency'); }}
                      style={{
                        display:'flex', alignItems:'center', gap:12,
                        padding:'16px 18px',
                        cursor:'pointer',
                        borderBottom:`1px solid ${T.border}`,
                        transition:'background 0.15s',
                        background: activeChannel.state==='AP'?`rgba(208,2,27,0.06)`:'transparent',
                      }}>
                      {/* Active indicator dot */}
                      <div style={{
                        width:8, height:8, borderRadius:'50%', flexShrink:0,
                        background: activeChannel.state==='AP' ? T.red : T.border,
                      }}/>
                      <div style={{flex:1}}>
                        <div style={{
                          fontFamily:"'Barlow Condensed',sans-serif",
                          fontWeight:800, fontSize:18, color:T.text, letterSpacing:0.3,
                        }}>Andhra Pradesh</div>
                        <div style={{
                          fontFamily:"'Noto Sans Telugu',sans-serif",
                          fontSize:12, lineHeight:1.65, color:T.textMuted, marginTop:1,
                        }}>ఆంధ్రప్రదేశ్ · 5 live channels</div>
                      </div>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                        stroke={T.textMuted} strokeWidth={2.5} strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>

                    {/* TG option — clean text only, no image */}
                    <div onClick={()=>{ setDropState('TG'); setDropStep('constituency'); }}
                      style={{
                        display:'flex', alignItems:'center', gap:12,
                        padding:'16px 18px',
                        cursor:'pointer',
                        transition:'background 0.15s',
                        background: activeChannel.state==='TG'?`rgba(208,2,27,0.06)`:'transparent',
                      }}>
                      {/* Active indicator dot */}
                      <div style={{
                        width:8, height:8, borderRadius:'50%', flexShrink:0,
                        background: activeChannel.state==='TG' ? T.red : T.border,
                      }}/>
                      <div style={{flex:1}}>
                        <div style={{
                          fontFamily:"'Barlow Condensed',sans-serif",
                          fontWeight:800, fontSize:18, color:T.text, letterSpacing:0.3,
                        }}>Telangana</div>
                        <div style={{
                          fontFamily:"'Noto Sans Telugu',sans-serif",
                          fontSize:12, lineHeight:1.65, color:T.textMuted, marginTop:1,
                        }}>తెలంగాణ · 4 live channels</div>
                      </div>
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                        stroke={T.textMuted} strokeWidth={2.5} strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                    <div style={{height:4}}/>
                  </>
                )}

                {/* ── STEP 2: Select Constituency ── */}
                {dropStep === 'constituency' && (
                  <>
                    {/* Header with back button */}
                    <div style={{
                      display:'flex', alignItems:'center', gap:10,
                      padding:'10px 14px',
                      borderBottom:`1px solid ${T.border}`,
                      background: T.isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',
                    }}>
                      <button
                        onClick={()=>setDropStep('state')}
                        style={{
                          width:30, height:30, borderRadius:8, border:`1px solid ${T.border}`,
                          background:T.bg3, color:T.text, cursor:'pointer',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          flexShrink:0,
                        }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                          stroke={T.text} strokeWidth={2.5} strokeLinecap="round">
                          <polyline points="15 18 9 12 15 6"/>
                        </svg>
                      </button>
                      <div style={{flex:1}}>
                        <div style={{
                          fontFamily:"'Barlow Condensed',sans-serif",
                          fontWeight:800, fontSize:11,
                          letterSpacing:1.5, color:T.textMuted,
                        }}>
                          {dropState==='AP'?'ANDHRA PRADESH':'TELANGANA'} · SELECT CHANNEL
                        </div>
                      </div>
                    </div>

                    {/* Constituency list for selected state */}
                    {LIVE_CHANNELS.filter(c=>c.state===dropState).map((c,i)=>(
                      <div key={c.id}
                        onClick={()=>{
                          setActiveChannel(c);
                          setViewers(c.viewers);
                          setShowDropdown(false);
                          setDropStep('state');
                          setDropState(null);
                          // Propagate to the app so the choice persists across all pages.
                          onSelectLocation?.(c.nameEn, c.state);
                        }}
                        style={{
                          display:'flex', alignItems:'center', gap:12,
                          padding:'13px 16px',
                          cursor:'pointer',
                          background: activeChannel.id===c.id?`rgba(208,2,27,0.1)`:'transparent',
                          borderLeft: activeChannel.id===c.id?`3px solid ${T.red}`:'3px solid transparent',
                          borderBottom: i < LIVE_CHANNELS.filter(x=>x.state===dropState).length-1
                            ? `1px solid ${T.border}` : 'none',
                          transition:'all 0.15s',
                        }}>
                        {/* Location pin */}
                        <div style={{flexShrink:0}}>
                          <LocationPin size={22}/>
                        </div>
                        {/* Channel name — Telugu – English (per user request) */}
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{
                            fontFamily:"'Noto Sans Telugu',sans-serif",
                            fontWeight:700, fontSize:17, color:T.text, lineHeight:1.3,
                            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                          }}>
                            {c.name}
                            {c.nameEn ? (
                              <>
                                <span style={{color:T.textMuted, margin:'0 2px', fontWeight:500}}>–</span>
                                <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:600, color:T.textMuted, fontSize:15}}>{c.nameEn}</span>
                              </>
                            ) : null}
                          </div>
                          <div style={{
                            display:'flex', alignItems:'center', gap:5, marginTop:2,
                          }}>
                            <div style={{width:5,height:5,borderRadius:'50%',
                              background:'#00C85A',animation:'blink 1s infinite'}}/>
                            <span style={{
                              fontFamily:"'Barlow Condensed',sans-serif",
                              fontSize:10, color:'#00C85A', fontWeight:700, letterSpacing:0.5,
                            }}>LIVE · {c.viewers.toLocaleString()} watching</span>
                          </div>
                        </div>
                        {/* Checkmark if active */}
                        {activeChannel.id===c.id && (
                          <div style={{
                            width:22, height:22, borderRadius:'50%',
                            background:T.red,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:12, color:'white', fontWeight:700, flexShrink:0,
                          }}>✓</div>
                        )}
                      </div>
                    ))}
                    <div style={{height:6}}/>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Weather widget — right side */}
          <div style={{
            flexShrink:0,
            display:'flex', alignItems:'center', gap:5,
            background:T.bg3,
            border:`1px solid ${T.border}`,
            borderRadius:10,
            padding:'5px 10px',
            minWidth:72,
          }}>
            {/* Live weather icon — driven by OpenWeatherMap. Falls back to
                a neutral cloud-sun glyph during the first fetch / on error. */}
            <span style={{fontSize:18}}>
              {weatherForActive ? weatherEmoji(weatherForActive.main) : '🌤️'}
            </span>
            <div>
              {/* Live temperature — rounded to the nearest whole °C. Shows
                  an em-dash while the first request for this city is in flight. */}
              <div style={{
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:700, fontSize:12, lineHeight:1.2,
                color:T.text,
              }}>
                {weatherForActive ? `${Math.round(weatherForActive.temp)}°C` : '—'}
              </div>
              {/* City — matched to dropdown English-name font size (8 → 11) */}
              <div style={{
                fontSize:11, color:T.textMuted,
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:600,
                lineHeight:1.1, marginTop:1,
              }}>
                {activeChannel?.nameEn}
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop to close dropdown */}
        {showDropdown && (
          <div style={{position:'fixed',inset:0,zIndex:49}}
            onClick={()=>setShowDropdown(false)}/>
        )}
      </div>

      {/* ── SCROLLABLE BODY ────────────────────────────────── */}
      <div
        ref={homeScrollRef}
        style={{flex:1,overflowY:'auto',background:T.bg}}
        onTouchStart={e=>{pullStartY.current=e.touches[0].clientY;}}
        onTouchEnd={e=>{
          const dy=e.changedTouches[0].clientY-pullStartY.current;
          if(dy>70&&homeScrollRef.current?.scrollTop===0){
            setPullRefreshing(true);
            setRefreshTick(t=>t+1);
            if(homeScrollRef.current) homeScrollRef.current.scrollTop=0;
            setTimeout(()=>setPullRefreshing(false),1400);
          }
        }}>

        {/* Pull-to-refresh indicator */}
        {pullRefreshing && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',
            padding:'10px',background:T.bg2,borderBottom:`1px solid ${T.border}`}}>
            <div style={{width:18,height:18,borderRadius:'50%',
              border:`2px solid ${T.red}`,borderTopColor:'transparent',
              animation:'spin 0.8s linear infinite',marginRight:8}}/>
            <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",
              fontSize:12,color:T.textMuted}}>అప్‌డేట్ అవుతోంది...</span>
          </div>
        )}

        {/* ── LIVE VIDEO PLAYER ── (Phase-3 SIGNATURE CINEMATIC HERO:
             ambient red halo + AI-curated identity ribbon. The live TV stream
             is the homepage's hero — this treatment makes it FEEL like a
             premium broadcast experience, not an embedded iframe.) */}
        <div style={{
          width:'100%',
          background:OTT.color.bg1,
          position:'relative',
          padding:'10px 14px 12px',
        }}>
        {/* HALO WRAPPER — ambient red glow breathes behind the live frame.
            Only renders for live channels (it would feel wrong on the
            "coming soon" placeholder). */}
        <div style={{position:'relative', isolation:'isolate'}}>
          {activeChannel?.live && (
            <>
              {/* Primary halo — same as Phase 3 */}
              <div className="ott-halo" style={{
                position:'absolute',
                inset:-14,
                borderRadius:OTT.radius.xl,
                background:'radial-gradient(ellipse at center, rgba(225,29,72,0.28) 0%, rgba(225,29,72,0.10) 45%, transparent 72%)',
                filter:'blur(22px)',
                pointerEvents:'none',
                zIndex:0,
              }}/>
              {/* Secondary halo — desynchronized (5.7s vs 4.2s, prime-ish so
                  they never align). Wider radial cutoff + softer core makes
                  the combined glow read as micro-organic, not mathematical. */}
              <div className="ott-halo2" style={{
                position:'absolute',
                inset:-18,
                borderRadius:OTT.radius.xl,
                background:'radial-gradient(ellipse at center, rgba(225,29,72,0.18) 0%, rgba(225,29,72,0.06) 55%, transparent 82%)',
                filter:'blur(28px)',
                pointerEvents:'none',
                zIndex:0,
              }}/>
            </>
          )}
        <div style={{
          position:'relative',
          zIndex:1,
          borderRadius:OTT.radius.lg,
          overflow:'hidden',
          background:'#000',
          border:`1px solid ${OTT.color.lineStrong}`,
          boxShadow:OTT.elev.md,
        }}>
          {activeChannel?.live ? (
            <div style={{position:'relative',paddingBottom:'56.25%',height:0,background:'#000'}}>
              {/* Muted autoplay (mute=1): browsers BLOCK unmuted autoplay without a
                  prior user gesture, so on initial page open / location change the
                  video would otherwise stay paused. Muted guarantees it always
                  auto-plays; the viewer taps YouTube's unmute for sound.
                  key={channel id} → the iframe fully remounts on channel switch, so
                  the new channel starts cleanly.
                  The iframe is REMOVED from the DOM whenever another video surface is
                  open (Shorts / feed viewer / fullscreen bulletin-live). Removing it
                  hard-stops its audio — guaranteeing only ONE audio plays anywhere.
                  When that overlay closes, the iframe remounts and resumes. */}
              {(!feedViewer && !selectedShort && !showLiveOverlay && topStoriesViewerIdx === null) && (
              <iframe
                key={activeChannel.id}
                style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',border:'none'}}
                src={`https://www.youtube.com/embed/${CHANNEL_VIDEO[activeChannel.id] || YT_LIVE_VIDEO}?autoplay=1&mute=1&modestbranding=1&rel=0&playsinline=1&controls=1&fs=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
                title={`${activeChannel?.name} TV Live`}
              />
              )}
              {/* Top-left watermark + bottom-right LIVE badge intentionally removed —
                  the YouTube embed already shows its own branding and live badge. */}
            </div>
          ) : (
            <div style={{paddingBottom:'56.25%',position:'relative'}}>
              <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,${T.bg3},${T.surface})`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}>
                <div style={{fontSize:40,opacity:0.3}}>📡</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18,color:T.textMuted,letterSpacing:1}}>{activeChannel?.name} TV</div>
                <div style={{background:`rgba(255,184,0,0.15)`,border:`1px solid rgba(255,184,0,0.3)`,borderRadius:20,padding:'6px 16px',fontSize:11,color:T.gold,fontWeight:700,letterSpacing:1}}>🔜 COMING SOON</div>
                <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:13,lineHeight:1.65,fontWeight:700,color:T.textMuted,opacity:0.7}}>త్వరలో ప్రారంభమవుతుంది</div>

              </div>
            </div>
          )}

          {/* ── Floating "LIVE" pill (top-left over the video) ── */}
          {activeChannel?.live && (
            <div style={{
              position:'absolute', top:10, left:10, zIndex:3,
              display:'flex', alignItems:'center', gap:6,
              padding:'4px 9px',
              background:OTT.color.glass,
              backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
              border:`1px solid ${OTT.color.glassEdge}`,
              borderRadius:OTT.radius.pill,
              boxShadow:OTT.elev.sm,
              pointerEvents:'none',
            }}>
              <div style={{width:7,height:7,borderRadius:'50%',background:OTT.color.red,
                boxShadow:`0 0 0 2px rgba(225,29,72,0.25)`,animation:'blink 1.1s infinite'}}/>
              <span style={{fontFamily:OTT.type.mono.font, fontSize:9.5, fontWeight:900,
                color:'#fff', letterSpacing:1.3}}>LIVE</span>
            </div>
          )}

          {/* ── Floating channel-name pill (top-right over the video) ── */}
          {activeChannel?.name && (
            <div style={{
              position:'absolute', top:10, right:10, zIndex:3,
              display:'flex', alignItems:'center', gap:5,
              padding:'4px 10px',
              background:OTT.color.glass,
              backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
              border:`1px solid ${OTT.color.glassEdge}`,
              borderRadius:OTT.radius.pill,
              boxShadow:OTT.elev.sm,
              pointerEvents:'none',
              maxWidth:'55%', overflow:'hidden',
            }}>
              <span style={{fontFamily:OTT.type.te.font, fontSize:11, fontWeight:800,
                color:'#fff', whiteSpace:'nowrap'}}>{activeChannel.name}</span>
              <span style={{fontFamily:OTT.type.mono.font, fontSize:9, fontWeight:900,
                color:OTT.color.gold, letterSpacing:0.8}}>TV</span>
            </div>
          )}
        </div>
        </div>

        {/* AI-CURATED IDENTITY RIBBON — sits below the live frame, inside the
            same padding wrapper. The single most important Phase-3 element:
            the subliminal cue that users are watching an AI-powered platform,
            not a traditional broadcaster. Pulsing red dot + scan-line sweep
            establish "this platform is intelligent" in <1 second of glance. */}
        {activeChannel?.live && (
          <div style={{
            marginTop: 10,
            display:'flex', alignItems:'center', justifyContent:'space-between',
            gap: 10, padding:'0 2px',
            position:'relative', overflow:'hidden',
          }}>
            {/* Left: AI-curated label with pulsing dot */}
            <div style={{display:'flex', alignItems:'center', gap:8, minWidth:0}}>
              <div className="ott-ai-pulse" style={{
                width:7, height:7, borderRadius:'50%',
                background:OTT.color.red, flexShrink:0,
              }}/>
              <span style={{
                fontFamily:OTT.type.mono.font, fontSize:10, fontWeight:800,
                color:OTT.color.text, letterSpacing:1.6, textTransform:'uppercase',
                whiteSpace:'nowrap',
              }}>AI&nbsp;Curated&nbsp;Live</span>
              {/* Separator dot */}
              <span style={{
                width:3, height:3, borderRadius:'50%',
                background:OTT.color.text3, flexShrink:0,
              }}/>
              {/* Constituency name — tracks the LIVE dropdown selection
                  (activeChannel) so the ribbon updates whenever the user
                  switches constituency from the homepage dropdown.
                  Telugu (activeChannel.name) preferred; English nameEn
                  fallback; then the onboarding-time displayConstituency
                  as a final backstop. */}
              <span style={{
                fontFamily:OTT.type.te.font, fontSize:11, fontWeight:700,
                color:OTT.color.text2, letterSpacing:0.3,
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              }}>{activeChannel?.name
                  || activeChannel?.nameEn
                  || (typeof displayConstituency === 'object'
                      ? (displayConstituency?.te || displayConstituency?.en)
                      : displayConstituency)
                  || (userConstituency?.te || userConstituency?.en || userState || 'Andhra Pradesh')}</span>
            </div>
            {/* Right: tiny "Powered by AI" eyebrow — anchors the platform identity */}
            <span style={{
              fontFamily:OTT.type.mono.font, fontSize:8.5, fontWeight:700,
              color:OTT.color.text3, letterSpacing:1.8, textTransform:'uppercase',
              flexShrink:0,
            }}>Powered&nbsp;by&nbsp;AI</span>
            {/* Subtle scan-line sweep across the ribbon */}
            <div className="ott-ai-scan" style={{
              position:'absolute', top:0, bottom:0, left:0, width:'30%',
              background:'linear-gradient(90deg, transparent 0%, rgba(225,29,72,0.18) 45%, rgba(255,184,0,0.10) 55%, transparent 100%)',
              pointerEvents:'none',
            }}/>
          </div>
        )}
        </div>

        {/* Red scrolling breaking-news ticker intentionally removed per user request. */}

        {/* ══ LIVE STRIP — channel name left, viewers + share icons right ══ */}
        <LiveStrip activeChannel={activeChannel} allChannels={LIVE_CHANNELS} onNavigate={onNavigate} />

        {/* ══ ROTATING UPLOAD CTA — two messages swap every 3.5s ══ */}
        {/* Hidden once the user is signed in (no need to prompt them to register). */}
        {!isAuthenticated && (
          <Reveal>
            <UploadCtaBanner onNavigate={onNavigate} />
          </Reveal>
        )}

        {/* ── CLASSIFIEDS (Kurnool Local) — moved to top per request ─ */}
        <Reveal delay={0.05}>
          <ClassifiedsSection onNavigate={onNavigate} constituency={displayConstituency} channel={activeChannel} locationId={activeLocationId} />
        </Reveal>

        {/* Section gap */}
        <div style={{height:8,background:T.isDark?T.bg3:`#EBEBEB`}}/>

        {/* ── SHORT NEWS (ManaKurnool Shorts, auto-scrolling) ─
            items prop = /api/incidents mapped to the SHORT_NEWS shape.
            When the API returns nothing the section falls back to the
            bundled SHORT_NEWS demo set so the rail is never empty. */}
        <ShortNewsSection channel={activeChannel} items={incidentShorts} />

        {/* Section gap */}
        <div style={{height:8,background:T.isDark?T.bg3:`#EBEBEB`}}/>

        {/* ── PREVIOUS BULLETINS ───────────────────────────── */}
        <div style={{padding:'16px 0 0',background:T.bg}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px 12px',gap:10}}>
            <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0}}>
              <SectionAccentBar/>
              <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:800,fontSize:16,color:T.text,lineHeight:1.4}}>ఈరోజు {activeChannel?.name} <span style={{
                  fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:18,letterSpacing:0.5,
                  background:'linear-gradient(135deg,#7B1FA2,#AB47BC)', // royal purple/violet — distinct from other TVs
                  WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
                }}>TV</span> ప్రసారాలు</div>
            </div>
            <span onClick={()=>onNavigate('bulletinsfeed')} style={{fontSize:11,color:T.red,fontWeight:600,cursor:'pointer',letterSpacing:0.3,flexShrink:0}}>See all →</span>
          </div>
          {/* Manual-scroll strip — no auto-rotate. List is repeated 10× so dragging never reaches the end.
              Click any thumbnail → opens the vertical Bulletin feed at that bulletin's position. */}
          <div style={{display:'flex',gap:10,padding:'0 16px 14px',overflowX:'auto',scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
            {Array.from({length:10}).flatMap(()=>bulletinsToShow).map((b,i) => (
              <div key={`bul-${i}`}
                onClick={()=>{ window.__bulletinStartId = b.id; onNavigate('bulletinsfeed'); }}
                style={{flexShrink:0,width:160,cursor:'pointer'}}>
                {/* Real YouTube thumbnail (falls back to API image_url when ytId is absent) */}
                <div style={{width:'100%',height:92,borderRadius:12,position:'relative',marginBottom:6,overflow:'hidden',background:'#000'}}>
                  <img
                    src={b.ytId ? `https://img.youtube.com/vi/${b.ytId}/mqdefault.jpg` : (b.thumbnail || '')}
                    alt={b.titleEn || b.titleTe || ''}
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                    onError={e=>{e.target.style.display='none'; e.target.parentNode.style.background='#1a0010';}}
                  />
                  {/* Dark overlay */}
                  <div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,rgba(0,0,0,0.55) 0%,transparent 55%)',pointerEvents:'none'}}/>
                  {/* Channel badge */}
                  <div style={{position:'absolute',top:6,left:6,background:'rgba(0,0,0,0.72)',borderRadius:4,padding:'2px 7px',pointerEvents:'none'}}>
                    <span style={{fontSize:8,color:T.textMuted,fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700}}>
                      {b.channel}
                    </span>
                  </div>
                  {/* Play icon — soft white circle with dark triangle (no aggressive red) */}
                  <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',
                      background:'rgba(255,255,255,0.88)',
                      border:'1.5px solid rgba(255,255,255,0.95)',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      boxShadow:'0 2px 8px rgba(0,0,0,0.35)'}}>
                      <div style={{width:0,height:0,marginLeft:3,
                        borderTop:'7px solid transparent',
                        borderBottom:'7px solid transparent',
                        borderLeft:'11px solid #1A237E'}}/>
                    </div>
                  </div>
                </div>
                {/* Title */}
                <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12,fontWeight:700,color:T.text,lineHeight:1.5,marginBottom:4}}>{b.titleTe}</div>
                {/* Bulletin timing — e.g. కర్నూలు News Bulletin at 11:00 AM */}
                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:9,color:T.textMuted}}>🕐</span>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:700,
                    color:T.isDark?'rgba(255,184,0,0.85)':'#92660a',letterSpacing:0.3}}>
                    {b.broadcastTime}
                  </span>
                  <span style={{fontSize:9,color:T.textMuted}}>· {b.channel}</span>
                </div>
              </div>
            ))}
            {/* "See All on YouTube" tile removed per user request */}
          </div>
        </div>

        {/* Section gap */}
        <div style={{height:8,background:T.isDark?T.bg3:`#EBEBEB`}}/>

        {/* ── KURNOOL పబ్లిక్ వాయిస్ (Shorts-style auto-scroll rail) ── */}
        <Reveal delay={0.05}>
          <PublicVoiceSection onNavigate={onNavigate} channel={activeChannel} locationId={activeLocationId} />
        </Reveal>

        {/* Section gap */}
        <div style={{height:8,background:T.isDark?T.bg3:`#EBEBEB`}}/>

        {/* ── TOP STORIES (live-fed from web aggregation) ─── */}
        <div style={{borderTop:`1px solid ${T.border}`,padding:'16px 0 0',background:T.bg}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px 12px',gap:10}}>
            <div style={{display:'flex',alignItems:'center',gap:9,minWidth:0}}>
              <SectionAccentBar/>
              <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
                <div>
                  {/* Dynamic district title — tracks activeChannel dropdown selection */}
                  <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:800,fontSize:17,color:T.text,lineHeight:1.3}}>
                    {(CONSTITUENCY_DISTRICT[activeChannel?.nameEn]||activeChannel.name)} జిల్లా{' '}
                    <span style={{
                      background:'linear-gradient(135deg,#2E7D32,#43A047)', // forest green → vivid green (distinct, fresh)
                      WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                      fontWeight:900,
                    }}>వార్తలు</span>
                  </div>
                </div>
                {incidentsLoading && (
                  <span style={{fontSize:9,color:T.textMuted,fontStyle:'italic'}}>Refreshing…</span>
                )}
              </div>
            </div>
            {/* "See all" button removed per user request — the section auto-refreshes
                via the useAPI hook so no manual trigger is needed. */}
          </div>

          {/* Category pills with hover highlight —
              paddingTop:6 leaves room for the hover lift so the top border doesn't clip. */}
          <div style={{display:'flex',gap:6,padding:'6px 16px 12px',overflowX:'auto',overflowY:'visible'}}>
            {cats.map(c => (
              <button key={c.id} onClick={() => { setCat(c.id); }}
                onMouseEnter={e=>{
                  if (cat===c.id) return;
                  e.currentTarget.style.transform='translateY(-2px) scale(1.04)';
                  e.currentTarget.style.boxShadow=`0 4px 14px ${T.red}40`;
                  e.currentTarget.style.borderColor=`${T.red}80`;
                  e.currentTarget.style.background=`${T.red}1F`;
                  e.currentTarget.style.color=T.red;
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform='translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow= cat===c.id?`0 2px 8px ${T.red}44`:'none';
                  e.currentTarget.style.borderColor= cat===c.id ? T.red : T.border;
                  e.currentTarget.style.background= cat===c.id ? T.red : T.bg3;
                  e.currentTarget.style.color= cat===c.id ? 'white' : T.textMuted;
                }}
                style={{
                display:'flex',alignItems:'center',gap:5,
                borderRadius:20,padding:'6px 12px',
                whiteSpace:'nowrap',cursor:'pointer',
                transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)',flexShrink:0,
                background: cat===c.id ? T.red : T.bg3,
                color: cat===c.id ? 'white' : T.textMuted,
                border:`1px solid ${cat===c.id ? T.red : T.border}`,
                boxShadow: cat===c.id?`0 2px 8px ${T.red}44`:'none',
              }}>
                <span style={{fontSize:12}}>{c.emoji}</span>
                <span style={{
                  fontFamily:"'Noto Sans Telugu',sans-serif",
                  fontWeight:700,fontSize:11,lineHeight:1,
                }}>{c.te}</span>
              </button>
            ))}
          </div>

          {/* Stories — fixed height block, scroll inside */}
          <div style={{
            padding:'0 16px',
            maxHeight: 420,
            overflowY:'auto',
            scrollbarWidth:'none',
            WebkitOverflowScrolling:'touch',
          }}>

            {/* First load — incidents still fetching and nothing to show yet.
                Render shimmer placeholders shaped like the lead + secondary
                cards so the rail reserves its height instead of jumping. */}
            {filteredHome.length === 0 && incidentsLoading && (
              <>
                <div style={{ padding:'14px 0 16px', borderBottom:`1px solid ${T.border}` }}>
                  <SkeletonBox style={{ width:120, height:10, borderRadius:5, marginBottom:10 }} />
                  <SkeletonBox style={{ width:'100%', paddingBottom:'56.25%', height:0, borderRadius:OTT.radius.md }} />
                  <SkeletonBox style={{ width:'95%', height:14, borderRadius:6, marginTop:12 }} />
                  <SkeletonBox style={{ width:'70%', height:14, borderRadius:6, marginTop:7 }} />
                </div>
                {Array.from({ length:4 }).map((_, i) => (
                  <div key={`ts-sk-${i}`} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:`1px solid ${T.border}` }}>
                    <SkeletonBox style={{ width:82, height:62, borderRadius:10, flexShrink:0 }} />
                    <div style={{ flex:1, paddingTop:4 }}>
                      <SkeletonBox style={{ width:'95%', height:12, borderRadius:6 }} />
                      <SkeletonBox style={{ width:'80%', height:12, borderRadius:6, marginTop:7 }} />
                      <SkeletonBox style={{ width:'40%', height:10, borderRadius:5, marginTop:10 }} />
                    </div>
                  </div>
                ))}
              </>
            )}

            {filteredHome.map((n, idx) => {
              const isLocalAI = n.source === 'LocalAI TV' || n.channel === 'LocalAI TV';
              const isGovt = ['PIB','MyGov','AP CMO','TG CMO'].includes(n.source) || ['PIB','MyGov','AP CMO','TG CMO'].includes(n.channel);
              const sourceName = n.source || n.channel || 'Unknown';

              // Top Stories cards are incident-backed. Tap opens the
              // DistrictNewsFeedScreen viewer (sticky-top video player +
              // scrolling list + category bar — same UI as tapping the
              // FeaturedStoryHero above). DistrictNewsFeedScreen sorts by
              // uploadedAt desc internally; mirror that sort here so the
              // start index lines up with the tapped incident.
              const handleClick = () => {
                const sorted = [...incidentsRailItems].sort((a, b) =>
                  new Date(b.uploadedAt || b.id * -1) - new Date(a.uploadedAt || a.id * -1)
                );
                const idx = sorted.findIndex(x => x.id === n.id);
                setTopStoriesViewerIdx(idx >= 0 ? idx : 0);
              };

              // Shared image-src resolution — used by both LEAD and secondary cards.
              const catImgs = {
                District:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=75',
                State:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=75',
                National:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=75',
                World:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=75',
                Politics:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=75',
                Agri:'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=75',
                Health:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=75',
                Education:'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=75',
                Crime:'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=75',
                Weather:'/placeholder.svg',
                Sports:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=75',
                Business:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=75',
                Culture:'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=75',
                Devotional:'/placeholder.svg',
                Local:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=75',
              };
              const ytSrc  = n.ytId ? `https://img.youtube.com/vi/${n.ytId}/hqdefault.jpg` : null;
              const imgSrc = ytSrc || n.thumbnail || catImgs[n.cat] || catImgs.District;
              const onImgError = e => {
                // Terminal fallback is a same-origin asset so a failed image can
                // never 404-to-HTML and trigger CORB, nor loop on itself.
                if (e.target.src.endsWith('/placeholder.svg')) return;
                e.target.src = '/placeholder.svg';
              };

              /* ══════════════════════════════════════════════════════════
                 LEAD CARD (idx === 0) — Phase-5 editorial hierarchy
                 ──────────────────────────────────────────────────────────
                 Bigger 16:9 thumbnail, "LEAD STORY" eyebrow, full Telugu
                 headline at editorial weight. Establishes within-rail
                 hierarchy so the rest of the rail feels like discovery.
                 Deliberately less dramatic than the FeaturedStoryHero
                 above (no Ken Burns, no shine) — hierarchy by SIZE and
                 typography, not by effects.
                 ══════════════════════════════════════════════════════════ */
              if (idx === 0) {
                return (
                  <div
                    key={n.id}
                    onClick={handleClick}
                    className="ott-press"
                    style={{
                      padding:'14px 0 16px',
                      borderBottom:`1px solid ${T.border}`,
                      cursor:'pointer',
                    }}
                  >
                    {/* Lead-story eyebrow — small red mono, matches the
                        AI-ribbon / featured-hero language */}
                    <div style={{
                      display:'flex', alignItems:'center', gap:7,
                      marginBottom:8,
                    }}>
                      <span style={{
                        fontFamily:OTT.type.mono.font, fontSize:9.5, fontWeight:900,
                        color:OTT.color.red, letterSpacing:1.8, textTransform:'uppercase',
                      }}>Lead&nbsp;Story</span>
                      <span style={{
                        width:3, height:3, borderRadius:'50%', background:OTT.color.text3,
                      }}/>
                      <span style={{
                        fontFamily:OTT.type.mono.font, fontSize:9.5, fontWeight:800,
                        color:T.textMuted, letterSpacing:0.8, textTransform:'uppercase',
                      }}>{n.cat || sourceName}</span>
                    </div>

                    {/* 16:9 cinematic thumbnail */}
                    <div style={{
                      position:'relative',
                      width:'100%', paddingBottom:'56.25%', height:0,
                      borderRadius:OTT.radius.md, overflow:'hidden',
                      background:T.bg3,
                      boxShadow:T.isDark ? OTT.elev.sm : `0 4px 12px ${T.shadow}`,
                    }}>
                      <img src={imgSrc} alt="" loading="lazy" onError={onImgError}
                        style={{
                          position:'absolute', inset:0,
                          width:'100%', height:'100%', objectFit:'cover',
                        }}
                      />
                      {/* Bottom gradient for any overlay legibility (small) */}
                      <div style={{
                        position:'absolute', left:0, right:0, bottom:0, top:'55%',
                        background:'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.55) 100%)',
                        pointerEvents:'none',
                      }}/>
                      {/* Play overlay — only on items that actually have a video */}
                      {n.ytId && (
                        <div style={{
                          position:'absolute', inset:0,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          pointerEvents:'none',
                        }}>
                          <div style={{
                            width:46, height:46, borderRadius:'50%',
                            background:'rgba(255,255,255,0.92)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow:'0 2px 10px rgba(0,0,0,0.45)',
                          }}>
                            <div style={{
                              width:0, height:0, marginLeft:3,
                              borderTop:'9px solid transparent',
                              borderBottom:'9px solid transparent',
                              borderLeft:'14px solid #1A237E',
                            }}/>
                          </div>
                        </div>
                      )}
                      {/* Urgency cue — time pill, top-right.
                          Mirrors the FeaturedStoryHero language but smaller. */}
                      {n.time && (
                        <div style={{
                          position:'absolute', top:8, right:8, zIndex:2,
                          display:'flex', alignItems:'center', gap:5,
                          padding:'4px 8px',
                          background: n.live ? 'rgba(225,29,72,0.92)' : OTT.color.glass,
                          backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)',
                          border:`1px solid ${n.live ? 'rgba(255,255,255,0.18)' : OTT.color.glassEdge}`,
                          borderRadius:OTT.radius.pill,
                        }}>
                          {n.live && (
                            <div style={{
                              width:5, height:5, borderRadius:'50%', background:'#fff',
                              animation:'blink 1.1s infinite',
                            }}/>
                          )}
                          <span style={{
                            fontFamily:OTT.type.mono.font, fontSize:8.5, fontWeight:900,
                            color:'#fff', letterSpacing:1.2,
                          }}>{n.live ? 'NEW' : n.time.toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    {/* Lead headline — Telugu at editorial weight */}
                    <div style={{
                      marginTop:10,
                      fontFamily:OTT.type.te.font,
                      fontWeight:800,
                      fontSize:16,
                      lineHeight:1.32,
                      color:T.text,
                      letterSpacing:0.1,
                      display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical',
                      overflow:'hidden',
                    }}>{n.title}</div>

                    {/* Attribution */}
                    <div style={{
                      marginTop:6,
                      display:'flex', alignItems:'center', gap:6,
                      fontSize:10, color:T.textMuted, flexWrap:'wrap',
                    }}>
                      <span style={{fontWeight:700}}>{isLocalAI?'📍':'📰'} {sourceName}</span>
                      <span>·</span>
                      <span>{n.time}</span>
                      {!isLocalAI && n.link && (
                        <>
                          <span>·</span>
                          <span style={{color:T.red, fontWeight:700}}>Read full →</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              }

              /* SECONDARY CARDS (idx >= 1) — unchanged Phase-4 layout */
              return (
                <div key={n.id} onClick={handleClick} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:`1px solid ${T.border}`,cursor:'pointer'}}>
                  {/* Thumbnail */}
                  <div style={{width:82,height:62,borderRadius:10,background:T.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0,position:'relative',overflow:'hidden',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
                    <img src={imgSrc} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={onImgError}/>
                    {/* Play overlay — only on items that actually have a video */}
                    {n.ytId && (
                      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
                        <div style={{width:24,height:24,borderRadius:'50%',
                          background:'rgba(255,255,255,0.88)',
                          display:'flex',alignItems:'center',justifyContent:'center',
                          boxShadow:'0 1px 4px rgba(0,0,0,0.4)'}}>
                          <div style={{width:0,height:0,marginLeft:2,
                            borderTop:'5px solid transparent',
                            borderBottom:'5px solid transparent',
                            borderLeft:'7px solid #1A237E'}}/>
                        </div>
                      </div>
                    )}
                    {n.live && <div style={{position:'absolute',top:4,left:4,background:T.red,borderRadius:3,padding:'1px 5px',display:'flex',alignItems:'center',gap:1,zIndex:2}}><LiveDot size={3}/><span style={{fontSize:6,fontWeight:800,color:'white'}}>NEW</span></div>}
                  </div>

                  {/* Story content */}
                  <div style={{flex:1,minWidth:0}}>
                    {/* Headline — stronger weight, better line height */}
                    <div style={{
                      fontFamily:"'Barlow Condensed',sans-serif",
                      fontWeight:700,
                      fontSize:14,
                      lineHeight:1.35,
                      marginBottom:5,
                      color:T.text,
                    }}>{n.title}</div>

                    {/* Attribution */}
                    <div style={{display:'flex',alignItems:'center',gap:5,fontSize:9,color:T.textMuted,flexWrap:'wrap'}}>
                      <span style={{fontWeight:600}}>{isLocalAI?'📍':'📰'} {sourceName}</span>
                      <span>·</span>
                      <span>{n.time}</span>
                      {!isLocalAI && n.link && (<><span>·</span><span style={{color:T.red,fontWeight:600}}>Read full →</span></>)}
                    </div>
                  </div>
                </div>
              );
            })}

            {false && (
              <div style={{padding:'14px 0 8px',fontSize:9,color:T.textMuted,lineHeight:1.5,textAlign:'center',fontStyle:'italic'}}>
                News stories sourced from publishers' official RSS feeds. Tap any story to read full article on the publisher's website.
              </div>
            )}
          </div>
        </div>

        {/* ── 4 CTA BUTTONS + FOLLOW US ROW ────────────────────────────
             Row 1: Subscribe on YouTube (red) + Share App (orange, opens share sheet)
             Row 2: Advertise With Us (teal) + Channel Partner (purple)
             Below : "Follow Us On" — single-line strip of social media icons */}
        <div style={{padding:'20px 16px 14px',borderTop:`1px solid ${T.border}`,background:T.bg2}}>

          {/* Row 1 — Subscribe on YouTube + Share App */}
          <div style={{display:'flex',gap:8,marginBottom:8}}>
            <a href="https://www.youtube.com/@Localaitv" target="_blank" rel="noreferrer"
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow=`0 6px 20px ${T.red}66`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow=`0 4px 16px ${T.red}44`;}}
              style={{flex:1,background:T.red,color:'white',borderRadius:14,padding:'11px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,letterSpacing:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',boxShadow:`0 4px 16px ${T.red}44`,textDecoration:'none',transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)'}}>
              ▶ Subscribe on YouTube
            </a>
            <button onClick={()=>setShowAppShare(true)}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(255,77,0,0.6)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(255,77,0,0.4)';}}
              style={{flex:1,background:'linear-gradient(135deg,#FF7A00,#FF4D00)',color:'white',border:'none',borderRadius:14,padding:'11px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,letterSpacing:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',boxShadow:'0 4px 16px rgba(255,77,0,0.4)',transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)'}}>
              📤 Share App
            </button>
          </div>

          {/* Row 2 — Advertise With Us + Channel Partner */}
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            <button onClick={()=>onNavigate('advertise')}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(0,131,143,0.55)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,131,143,0.4)';}}
              style={{flex:1,background:'linear-gradient(135deg,#00838F,#00ACC1)',color:'white',border:'none',borderRadius:14,padding:'11px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,letterSpacing:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',boxShadow:'0 4px 16px rgba(0,131,143,0.4)',transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)'}}>
              📢 Advertise With Us
            </button>
            <button onClick={()=>onNavigate('channelpartner')}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(123,31,162,0.55)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(123,31,162,0.4)';}}
              style={{flex:1,background:'linear-gradient(135deg,#7B1FA2,#9C27B0)',color:'white',border:'none',borderRadius:14,padding:'11px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,letterSpacing:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',boxShadow:'0 4px 16px rgba(123,31,162,0.4)',transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)'}}>
              🤝 Channel Partner
            </button>
          </div>

          {/* ── FOLLOW US ON — single-line strip of social platforms ── */}
          <div style={{textAlign:'center',marginBottom:8}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,
              fontSize:11,letterSpacing:1.6,color:T.gold}}>📣 FOLLOW US ON</span>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'center',alignItems:'center',flexWrap:'nowrap',overflowX:'auto',scrollbarWidth:'none',WebkitOverflowScrolling:'touch'}}>
            {[
              { label:'X/Twitter', href:'https://x.com/localaitv/',  color:'#000000', bg:T.isDark?'rgba(255,255,255,0.08)':'#0F0F0F',
                icon:<svg width={16} height={16} viewBox="0 0 32 32" fill="white"><path d="M18.24 14.17L27.1 4h-2.1l-7.7 8.95L11 4H4l9.3 13.53L4 28h2.1l8.13-9.45L21 28h7z"/></svg> },
              { label:'Telegram',  href:'https://t.me/localaitv',         color:'#0088CC', bg:'rgba(0,136,204,0.12)',
                icon:<svg width={16} height={16} viewBox="0 0 32 32" fill="#0088CC"><path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm6.84 9.58l-2.36 11.12c-.18.8-.64 1-1.3.62l-3.6-2.65-1.73 1.67c-.2.2-.36.36-.73.36l.26-3.68 6.7-6.05c.3-.26-.06-.4-.44-.14l-8.28 5.21-3.57-1.12c-.78-.24-.8-.78.16-1.15l13.93-5.37c.64-.24 1.2.14.96 1.18z"/></svg> },
              { label:'WhatsApp',  href:'https://whatsapp.com/channel/localaitv', color:'#25D366', bg:'rgba(37,211,102,0.12)',
                icon:<svg width={16} height={16} viewBox="0 0 32 32" fill="#25D366"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.76 1.83 6.74L2 30l7.44-1.79A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.1 19.1c-.3.84-1.76 1.6-2.4 1.7-.62.1-1.4.14-2.26-.14a20.6 20.6 0 01-2.04-.75c-3.58-1.55-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7s.92-2.62 1.26-2.98c.3-.34.66-.42.88-.42l.64.01c.2 0 .48-.08.74.56.28.66.94 2.3.02 2.56l-.5.22c-.28.14-.52.3-.36.6.16.3.7 1.16 1.5 1.88l1.44 1.14c.3.16.6.12.82-.12.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.02.96 2.36 1.13.34.18.58.26.66.4.08.16.08.9-.22 1.74z"/></svg> },
              { label:'Facebook',  href:'https://www.facebook.com/people/Local-AI-Media-Network-Private-Limited/61578436672896/', color:'#1877F2', bg:'rgba(24,119,242,0.12)',
                icon:<svg width={16} height={16} viewBox="0 0 32 32" fill="#1877F2"><path d="M16 2C8.27 2 2 8.27 2 16c0 6.99 5.12 12.77 11.81 13.82V19.9h-3.55V16h3.55v-3.08c0-3.51 2.09-5.44 5.28-5.44 1.53 0 3.12.27 3.12.27v3.44h-1.76c-1.73 0-2.27 1.07-2.27 2.17V16h3.87l-.62 3.9h-3.25v9.92C24.88 28.77 30 22.99 30 16c0-7.73-6.27-14-14-14z"/></svg> },
              { label:'Instagram', href:'https://www.instagram.com/localaitv', color:'#E1306C', bg:'rgba(225,48,108,0.12)',
                icon:<svg width={16} height={16} viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="6" stroke="#E1306C" strokeWidth="2.4"/><circle cx="16" cy="16" r="5.5" stroke="#E1306C" strokeWidth="2.4"/><circle cx="23" cy="9" r="1.5" fill="#E1306C"/></svg> },
              { label:'LinkedIn',  href:'https://www.linkedin.com/company/local-ai-media-network-private-limited/?viewAsMember=true', color:'#0A66C2', bg:'rgba(10,102,194,0.12)',
                icon:<svg width={16} height={16} viewBox="0 0 32 32" fill="#0A66C2"><path d="M26 2H6C3.79 2 2 3.79 2 6v20c0 2.21 1.79 4 4 4h20c2.21 0 4-1.79 4-4V6c0-2.21-1.79-4-4-4zM10 25H6V12h4v13zM8 10c-1.38 0-2.5-1.12-2.5-2.5S6.62 5 8 5s2.5 1.12 2.5 2.5S9.38 10 8 10zm18 15h-4v-7c0-1.66-.34-3-2-3s-2 1.34-2 3v7h-4V12h4v2c.62-.92 1.92-2 4-2 3.31 0 6 2.69 6 6v7z"/></svg> },
            ].map(p => (
              <a key={p.label} href={p.href} target="_blank" rel="noreferrer" title={p.label}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px) scale(1.1)'; e.currentTarget.style.boxShadow=`0 5px 16px ${p.color}66`;}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow=`0 2px 8px ${p.color}22`;}}
                style={{flexShrink:0,width:38,height:38,borderRadius:11,
                  background:p.bg,border:`1.5px solid ${p.color}44`,
                  display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
                  boxShadow:`0 2px 8px ${p.color}22`,textDecoration:'none',
                  transition:'all 0.18s cubic-bezier(0.22,1,0.36,1)'}}>
                {p.icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── SHARE-THE-APP SHEET — opens when user taps the orange "Share App" button ── */}
        {showAppShare && (() => {
          const enc = encodeURIComponent;
          const appUrl = 'https://localaitv.com/app';
          const shareText = enc(`📱 LocalAI TV — హైపర్‌లోకల్ తెలుగు వార్తలు\n\nDownload the LocalAI TV app: ${appUrl}`);
          const urlEnc = enc(appUrl);
          const close = () => setShowAppShare(false);
          const PLATFORMS = [
            { label:'WhatsApp', color:'#25D366', bg:'rgba(37,211,102,0.15)',
              icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#25D366"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.76 1.83 6.74L2 30l7.44-1.79A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.1 19.1c-.3.84-1.76 1.6-2.4 1.7-.62.1-1.4.14-2.26-.14a20.6 20.6 0 01-2.04-.75c-3.58-1.55-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7s.92-2.62 1.26-2.98c.3-.34.66-.42.88-.42l.64.01c.2 0 .48-.08.74.56.28.66.94 2.3.02 2.56l-.5.22c-.28.14-.52.3-.36.6.16.3.7 1.16 1.5 1.88l1.44 1.14c.3.16.6.12.82-.12.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.02.96 2.36 1.13.34.18.58.26.66.4.08.16.08.9-.22 1.74z"/></svg>,
              action:()=>window.open(`https://api.whatsapp.com/send?text=${shareText}`,'_blank','noopener,noreferrer') },
            { label:'Telegram', color:'#0088CC', bg:'rgba(0,136,204,0.15)',
              icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#0088CC"><path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm6.84 9.58l-2.36 11.12c-.18.8-.64 1-1.3.62l-3.6-2.65-1.73 1.67c-.2.2-.36.36-.73.36l.26-3.68 6.7-6.05c.3-.26-.06-.4-.44-.14l-8.28 5.21-3.57-1.12c-.78-.24-.8-.78.16-1.15l13.93-5.37c.64-.24 1.2.14.96 1.18z"/></svg>,
              action:()=>window.open(`https://t.me/share/url?url=${urlEnc}&text=${shareText}`,'_blank','noopener,noreferrer') },
            { label:'Facebook', color:'#1877F2', bg:'rgba(24,119,242,0.15)',
              icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="#1877F2"><path d="M16 2C8.27 2 2 8.27 2 16c0 6.99 5.12 12.77 11.81 13.82V19.9h-3.55V16h3.55v-3.08c0-3.51 2.09-5.44 5.28-5.44 1.53 0 3.12.27 3.12.27v3.44h-1.76c-1.73 0-2.27 1.07-2.27 2.17V16h3.87l-.62 3.9h-3.25v9.92C24.88 28.77 30 22.99 30 16c0-7.73-6.27-14-14-14z"/></svg>,
              action:()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${urlEnc}`,'_blank','noopener,noreferrer') },
            { label:'X/Twitter', color:'#fff', bg:'rgba(255,255,255,0.1)',
              icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="white"><path d="M18.24 14.17L27.1 4h-2.1l-7.7 8.95L11 4H4l9.3 13.53L4 28h2.1l8.13-9.45L21 28h7z"/></svg>,
              action:()=>window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${urlEnc}`,'_blank','noopener,noreferrer') },
            { label:'Email', color:'#EA4335', bg:'rgba(234,67,53,0.15)',
              icon:<svg width={26} height={26} viewBox="0 0 32 32" fill="none"><rect x="2" y="6" width="28" height="20" rx="3" stroke="#EA4335" strokeWidth="2.2"/><path d="M2 10l14 9 14-9" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round"/></svg>,
              action:()=>window.open(`mailto:?subject=${enc('Try LocalAI TV')}&body=${shareText}`,'_self') },
            { label:'Copy Link', color:'#9CA3AF', bg:'rgba(156,163,175,0.12)',
              icon:<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>,
              action:()=>{ try { navigator.clipboard?.writeText(decodeURIComponent(shareText)).then(()=>{try{alert('🔗 Link copied to clipboard!');}catch(e){}}); } catch(e){} } },
          ];
          return (
            <div onClick={close}
              style={{position:'fixed', inset:0, zIndex:200,
                background:'rgba(0,0,0,0.65)',
                display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
              <div onClick={e=>e.stopPropagation()}
                style={{background:'#111', borderRadius:'22px 22px 0 0',
                  padding:'12px 0 42px',
                  boxShadow:'0 -6px 40px rgba(0,0,0,0.6)'}}>
                <div style={{width:38, height:4, background:'rgba(255,255,255,0.18)',
                  borderRadius:2, margin:'0 auto 16px'}}/>
                <div style={{textAlign:'center', marginBottom:6,
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontWeight:800, fontSize:16, color:'white', letterSpacing:0.5}}>
                  📱 Share LocalAI TV
                </div>
                <div style={{textAlign:'center', marginBottom:20,
                  fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
                  fontSize:11, color:'rgba(255,255,255,0.5)',
                  padding:'0 24px', lineHeight:1.4}}>
                  Spread the word — share the app with your friends and family
                </div>
                <div style={{display:'flex', flexWrap:'wrap',
                  justifyContent:'center', gap:16, padding:'0 20px'}}>
                  {PLATFORMS.map(p => (
                    <div key={p.label}
                      onClick={()=>{ p.action(); close(); }}
                      style={{display:'flex', flexDirection:'column',
                        alignItems:'center', gap:6, cursor:'pointer', width:68}}>
                      <div
                        onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px) scale(1.08)'; e.currentTarget.style.boxShadow=`0 6px 22px ${p.color}55`; }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow=`0 2px 16px ${p.color}22`; }}
                        style={{width:56, height:56, borderRadius:18,
                          background:p.bg, border:`1.5px solid ${p.color}44`,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          boxShadow:`0 2px 16px ${p.color}22`,
                          transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)'}}>
                        {p.icon}
                      </div>
                      <span style={{fontFamily:"'Barlow',sans-serif",
                        fontSize:10, color:'rgba(255,255,255,0.7)',
                        fontWeight:600, textAlign:'center'}}>{p.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={close}
                  style={{display:'block', margin:'22px auto 0',
                    background:'rgba(255,255,255,0.07)',
                    border:'1px solid rgba(255,255,255,0.14)',
                    borderRadius:14, padding:'12px 50px',
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:700, fontSize:15,
                    color:'rgba(255,255,255,0.5)', cursor:'pointer'}}>
                  Cancel
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── FOOTER LINKS (About, Privacy, Contact, etc.) ── */}
        <div style={{padding:'20px 16px 16px',borderTop:`1px solid ${T.border}`,background:T.bg3}}>
          {/* Column 1: Company / Legal */}
          <div style={{marginBottom:16}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:11,letterSpacing:1.5,color:T.gold,marginBottom:10}}>📋 COMPANY & LEGAL</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <FooterLink label="About Us" sub="మా గురించి" onClick={()=>onNavigate('about')} />
              <FooterLink label="Grievances" sub="ఫిర్యాదులు" onClick={()=>onNavigate('grievance')} />
              <FooterLink label="Privacy Policy" sub="గోప్యతా విధానం" onClick={()=>onNavigate('privacy')} />
              <FooterLink label="Terms & Conditions" sub="నిబంధనలు" onClick={()=>onNavigate('terms')} />
              <FooterLink label="Copyright & Takedown" sub="కాపీరైట్" onClick={()=>onNavigate('copyright')} />
              <FooterLink label="Contact Us" sub="సంప్రదించండి" onClick={()=>onNavigate('contact')} />
            </div>
          </div>

          {/* "PARTNER WITH US" section removed per user request — duplicated by the new
              Advertise With Us + Channel Partner buttons in the CTA block above. */}

          {/* Company info */}
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,textAlign:'center'}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:T.text,letterSpacing:0.5,marginBottom:4}}>LOCALAI MEDIA NETWORK PVT LTD</div>
            <div style={{fontSize:9,color:T.textMuted,marginBottom:2}}>CIN: U63910KA2025PTC212593</div>
            <div style={{fontSize:9,color:T.textMuted,marginBottom:8}}>Hyderabad, Telangana, India</div>
            <a href="mailto:support@localaitv.com" style={{display:'block',fontSize:9,color:T.teal,marginBottom:2,textDecoration:'none'}}>📧 support@localaitv.com</a>
            <a href="tel:+917569684979" style={{display:'block',fontSize:9,color:T.teal,marginBottom:10,textDecoration:'none'}}>📞 +91 7569684979</a>

            {/* Grievance Officer (per IT Rules 2021) */}
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,marginBottom:10}}>
              <div style={{fontSize:8,color:T.gold,fontWeight:700,letterSpacing:0.5,marginBottom:2}}>GRIEVANCE OFFICER (IT Rules 2021)</div>
              <div style={{fontSize:9,color:T.textMuted}}>Bommena Prashanth · Hyderabad, Telangana</div>
            </div>

            <div style={{fontSize:8,color:T.textMuted,lineHeight:1.6}}>
              © {new Date().getFullYear()} LocalAI Media Network Pvt Ltd.<br/>
              All rights reserved. · LocalAI / AI News Network
            </div>
          </div>
        </div>

        <div style={{height:24}}/>

      </div>

      {/* ── WOW FACTOR 3 — Live Activity Strip ────────── */}
      <LiveActivityStrip constituency={displayConstituency}/>

      {/* ── LIVE OVERLAY — opened when user taps a bulletin thumbnail.
            Shows the same YouTube live embed used by the top home-page player. ── */}
      {showLiveOverlay && (
        <div style={{
          position:'fixed', inset:0, zIndex:400,
          background:'#000',
          display:'flex', flexDirection:'column',
        }}>
          {/* Discreet close button — top-left */}
          <button onClick={()=>setShowLiveOverlay(false)} style={{
            position:'absolute', top:18, left:14, zIndex:5,
            width:36, height:36, borderRadius:'50%',
            background:'rgba(0,0,0,0.6)',
            border:'1.5px solid rgba(255,255,255,0.22)',
            color:'white', fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(8px)' }}>←</button>
          {/* LocalAI TV channel watermark — top-right */}
          <div style={{position:'absolute', top:18, right:16, zIndex:5,
            background:'rgba(0,0,0,0.5)', borderRadius:6, padding:'2px 6px',
            pointerEvents:'none', backdropFilter:'blur(2px)' }}>
            <Logo size="xs" dark={true} showTV={true}/>
          </div>
          {/* The live YouTube embed (same one as the top of the home page) */}
          <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div style={{width:'100%', paddingBottom:'56.25%', height:0, position:'relative'}}>
              <iframe
                src={`https://www.youtube.com/embed/${CHANNEL_VIDEO[activeChannel?.id] || YT_LIVE_VIDEO}?autoplay=1&mute=0&modestbranding=1&rel=0&playsinline=1&controls=1&fs=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={`${activeChannel?.name || 'LocalAI'} TV Live`}
                style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none'}}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TOP STORIES → DISTRICT NEWS FEED VIEWER OVERLAY ─────────
            Opened when the user taps any card in the District news rail.
            Mirrors the UI that FeaturedStoryHero opens (sticky-top
            player + scrolling list + bottom category bar) but populated
            from the live /api/incidents feed via the items prop, with
            category filtering disabled (pills remain as UI only). */}
      {topStoriesViewerIdx !== null && (
        <div style={{position:'fixed', inset:0, zIndex:200, background:T.bg}}>
          <DistrictNewsFeedScreen
            onClose={() => setTopStoriesViewerIdx(null)}
            startCat="All"
            startIdx={topStoriesViewerIdx}
            items={incidentsRailItems}
            disableCategoryFilter
          />
        </div>
      )}

      {/* Fix 5 — "Local" instead of "Issues" in BottomNav handled below */}
      <BottomNav active="home" onChange={onNavigate} />
    </div>
  );
}


export { HomeScreen };
export default HomeScreen;
