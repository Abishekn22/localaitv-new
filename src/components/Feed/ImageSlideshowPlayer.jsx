import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

// Some upload keys are stored by a backend bug as Windows local paths
// (e.g. "C:\Users\…\file.jpg", percent-encoded as %3A %5C). Those never exist
// in S3 → 403/404 → CORB console noise. Drop them before they reach <img src>.
function isBrokenKey(u) {
  return typeof u !== 'string' || u.includes('\\') || u.includes('%5C') || u.includes('%3A%5C');
}

function ImageSlideshowPlayer({ images, videos, ytId, isActive, cat }) {
  const { T } = useAppTheme();
  const [slide, setSlide]   = useState(0);
  const [fading, setFading]  = useState(false);
  // Skeleton shimmer while the media (video/image) is still loading, so the
  // detail page shows a loading animation instead of a black/blank frame.
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const safeImages = Array.isArray(images) ? images.filter(u => !isBrokenKey(u)) : [];
  const safeVideos = Array.isArray(videos) ? videos.filter(u => !isBrokenKey(u)) : [];
  const total = safeImages.length;

  // Reset the loading shimmer whenever the media source changes.
  useEffect(() => { setMediaLoaded(false); }, [images, videos, ytId, slide]);

  // Full-bleed shimmer overlay shown until the media reports loaded.
  const Shimmer = () => (
    <>
      <style>{`@keyframes clShimmer{0%{background-position:-150% 0}100%{background-position:150% 0}}`}</style>
      <div style={{
        position:'absolute', inset:0, zIndex:1,
        background:'#15151f',
        backgroundImage:'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
        backgroundSize:'200% 100%',
        animation:'clShimmer 1.3s linear infinite',
      }}/>
    </>
  );

  // Auto-advance slides every 2.8s when active
  useEffect(() => {
    if (!isActive || !total || total < 2) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setSlide(s => (s + 1) % total);
        setFading(false);
      }, 350);
    }, 2800);
    return () => clearInterval(t);
  }, [isActive, total]);

  // Reset on item change
  useEffect(() => { setSlide(0); setFading(false); }, [images]);

  // Category gradient backgrounds
  const catGrad = {
    'Birthdays':    'linear-gradient(135deg,#7B1FA2,#E91E63)',
    'Marriage Anniversary':'linear-gradient(135deg,#C62828,#E91E63)',
    'Marriages':    'linear-gradient(135deg,#AD1457,#F06292)',
    'Who is Who':   'linear-gradient(135deg,#0D9488,#14B8A6)',
    'Talent Show':  'linear-gradient(135deg,#EC4899,#F472B6)',
    'Public Voice': 'linear-gradient(135deg,#DC2626,#F97316)',
    'Jobs':         'linear-gradient(135deg,#1565C0,#1976D2)',
    'Car Sales':    'linear-gradient(135deg,#1B5E20,#388E3C)',
    'House Rents':  'linear-gradient(135deg,#0D47A1,#1976D2)',
    'Events':       'linear-gradient(135deg,#E65100,#FF9800)',
    'Shopping':     'linear-gradient(135deg,#F57F17,#FFB300)',
  };

  // If an uploaded/generated video is present, play it (autoplay, looped,
  // with controls). EXCEPTION: "Who is Who" always shows the photo only —
  // no bulletin video is generated for that category, and even if a stray
  // URL ever appears in `videos` we want the headshot to render instead.
  if (cat !== 'Who is Who' && safeVideos.length > 0) {
    return (
      <div style={{ width:'100%', height:'100%', position:'relative', background:'#000' }}>
        {!mediaLoaded && <Shimmer/>}
        <video
          src={safeVideos[0]}
          poster={safeImages[0] || undefined}
          autoPlay={isActive}
          muted
          loop
          playsInline
          controls
          preload="auto"
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', background:'#000', position:'relative', zIndex:2 }}
          onLoadedData={() => setMediaLoaded(true)}
          onError={e => { e.target.style.display='none'; }}
        />
      </div>
    );
  }

  // If YouTube video available, embed it
  if (ytId && isActive) {
    return (
      <div style={{ width:'100%', height:'100%', position:'relative', background:'#000' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&loop=1&playlist=${ytId}&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&showinfo=0&fs=0`}
          title="Video" allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ width:'100%', height:'100%', border:'none', display:'block' }}
        />
      </div>
    );
  }

  // Image slideshow
  if (total > 0) {
    return (
      <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden',
        background: catGrad[cat] || 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>

        {/* Loading shimmer until the current image paints */}
        {!mediaLoaded && <Shimmer/>}

        {/* Current image */}
        <img
          src={safeImages[slide]}
          alt=""
          style={{
            position:'absolute', inset:0, zIndex:2,
            width:'100%', height:'100%', objectFit:'cover',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.35s ease-in-out',
          }}
          onLoad={() => setMediaLoaded(true)}
          onError={e => e.target.style.opacity='0'}
        />

        {/* Slide counter */}
        {total > 1 && (
          <div style={{
            position:'absolute', top:10, right:12, zIndex:5,
            background:'rgba(0,0,0,0.55)', borderRadius:20,
            padding:'3px 10px', backdropFilter:'blur(4px)',
          }}>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:11, fontWeight:700, color:'white', letterSpacing:0.5 }}>
              {slide+1}/{total}
            </span>
          </div>
        )}

        {/* Bottom dot indicators */}
        {total > 1 && (
          <div style={{
            position:'absolute', bottom:10, left:'50%',
            transform:'translateX(-50%)',
            display:'flex', gap:5, zIndex:5,
          }}>
            {safeImages.map((_,i) => (
              <div key={i} onClick={() => setSlide(i)} style={{
                width: i===slide ? 18 : 6, height:6,
                borderRadius:3, cursor:'pointer',
                background: i===slide ? 'white' : 'rgba(255,255,255,0.4)',
                transition:'all 0.25s',
                boxShadow: i===slide ? '0 0 6px rgba(255,255,255,0.6)' : 'none',
              }}/>
            ))}
          </div>
        )}

        {/* Progress bar for auto-advance */}
        {total > 1 && isActive && (
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:3,
            background:'rgba(255,255,255,0.2)',
          }}>
            <div style={{
              height:'100%',
              background:'rgba(255,255,255,0.85)',
              animation:'slideshowProgress 2.8s linear infinite',
              transformOrigin:'left',
            }}/>
          </div>
        )}

        {/* Bottom gradient */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:60,
          background:'linear-gradient(0deg,rgba(0,0,0,0.8) 0%,transparent 100%)',
          pointerEvents:'none',
        }}/>
      </div>
    );
  }

  // No images fallback
  return (
    <div style={{
      width:'100%', height:'100%',
      background: catGrad[cat] || 'linear-gradient(135deg,#1a1a2e,#16213e)',
      display:'flex', alignItems:'center', justifyContent:'center',
      flexDirection:'column', gap:8,
    }}>
      <span style={{ fontSize:52 }}>
        {CL_SUBCATS.find(s=>s.id===cat)?.emoji || '📋'}
      </span>
      <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
        fontSize:13, color:'rgba(255,255,255,0.5)', letterSpacing:1 }}>
        {cat}
      </span>
    </div>
  );
}

// ── Single Classified Feed Item ─────────────────────────────

export { ImageSlideshowPlayer, isBrokenKey };
export default ImageSlideshowPlayer;
