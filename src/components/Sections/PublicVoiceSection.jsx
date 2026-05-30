import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, safeImageUrl, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import KurnoolShortsScreen from './../../screens/KurnoolShortsScreen.jsx';
import SectionAccentBar from './../SectionAccentBar.jsx';
import { SkeletonBox } from './../atoms.jsx';
import { publicVoiceToShortShape } from './ShortNewsSection.jsx';

function PublicVoiceSection({ onNavigate, channel, locationId }) {
  const { T } = useAppTheme();
  const scrollerRef    = useRef(null);
  const touchingRef    = useRef(false);
  const lastTouchEndAt = useRef(0);
  const lastTickAt     = useRef(0);
  const initialisedRef = useRef(false);

  // Fetch the set, then on the client keep only admin-verified items scoped to
  // the selected location (see `items` below). The section shows ONLY approved
  // videos for the current location and hides entirely when there are none.
  //
  // The fetch retries on failure. On a fresh page load the app mounts twice and
  // the browser aborts in-flight requests (net::ERR_ABORTED); a single-shot
  // fetch would then leave the rail permanently empty. Retrying recovers the
  // data so the section reliably appears after a reload.
  const [pvData, setPvData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    let tries = 0;
    const load = () => {
      if (!alive) return;
      apiCall(`/public-voice-requests?limit=50`)
        .then(d => { if (alive) { setPvData((d && d.items) || (Array.isArray(d) ? d : [])); setLoading(false); } })
        .catch(() => { if (alive) { if (tries < 6) { tries += 1; setTimeout(load, 700); } else setLoading(false); } });
    };
    load();
    return () => { alive = false; };
  }, []);
  const isVerified = (it) => it.verified === true || it.verified === 'true' || it.verified === 1 || it.verified === '1';
  const verified = (Array.isArray(pvData) ? pvData : []).filter(isVerified);
  // Show ONLY admin-approved (verified) videos for the selected location. No
  // fallback to other locations — if this location has no verified videos the
  // section hides itself entirely (see the items.length === 0 guard below).
  const items = locationId != null
    ? verified.filter(it => String(it.location_id) === String(locationId))
    : verified;

  const CARD_W = 116;                  // 108 + marginRight:8
  const cycleW = items.length * CARD_W;
  const looped = items.length ? [...items, ...items, ...items] : [];   // 3 copies

  function openCard(item) {
    // Hand the LIVE (already location-filtered) items to the fullscreen viewer,
    // mapped to the shorts shape so the actual uploaded videos play.
    if (typeof window !== 'undefined') {
      window.__publicVoiceItems = items.map(publicVoiceToShortShape);
      if (item && (item.id != null || item.request_id)) {
        window.__publicVoiceStartId = item.id != null ? item.id : item.request_id;
      }
    }
    onNavigate && onNavigate('publicvoicefeed');
  }

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // Park scroll position in the middle copy on first mount so the user
    // can freely swipe left and right by a whole copy before we wrap.
    if (!initialisedRef.current) {
      el.scrollLeft = cycleW;
      initialisedRef.current = true;
    }

    let raf;
    const SPEED = 28; // px / sec — calm reels-like pace
    const tick = (t) => {
      if (!el) { raf = requestAnimationFrame(tick); return; }
      if (lastTickAt.current === 0) lastTickAt.current = t;
      const dt = Math.min(0.1, (t - lastTickAt.current) / 1000);
      lastTickAt.current = t;

      // Auto-nudge only when the user is fully idle (touch released for >1s
      // so native momentum has finished). Otherwise let native scroll run.
      const idleMs = performance.now() - lastTouchEndAt.current;
      if (!touchingRef.current && idleMs > 1000) {
        el.scrollLeft += SPEED * dt;
      }

      // Buffer-zone wrap: when scrollLeft drifts past the middle copy in
      // either direction, snap by exactly cycleW. Visually identical pixels
      // (because the copies are duplicates), so the snap is invisible — and
      // it never happens near where the user's finger is right now.
      if (el.scrollLeft >= 2 * cycleW)      el.scrollLeft -= cycleW;
      else if (el.scrollLeft < cycleW * 0.5) el.scrollLeft += cycleW;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cycleW]);

  // Touch / mouse — purely for tracking idle state; native scroll handles motion.
  const onTouchStart = () => { touchingRef.current = true; };
  const onTouchEnd   = () => { touchingRef.current = false; lastTouchEndAt.current = performance.now(); };

  // While the first fetch is still in flight, show a shimmer skeleton rail so
  // the section reserves its space and signals loading rather than popping in
  // late or flashing empty.
  if (items.length === 0 && loading) return <PublicVoiceSkeleton T={T} channel={channel} />;
  // No public-voice submissions for this location → hide the section entirely.
  if (items.length === 0) return null;

  return (
    <div style={{ background:T.bg }}>
      {/* Header — Phase 5.5: shared accent bar primitive */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px 10px', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, minWidth:0 }}>
          <SectionAccentBar/>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, minWidth:0 }}>
            <span style={{ fontFamily:"'Noto Sans Telugu',sans-serif", fontWeight:800,
              fontSize:16, color:T.text }}>
              {channel ? channel.name : 'కర్నూలు'}
            </span>
            <span style={{
              fontFamily:"'Noto Sans Telugu',sans-serif", fontWeight:900,
              fontSize:17, letterSpacing:0.3,
              background:'linear-gradient(135deg,#DC2626,#F97316)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>పబ్లిక్ వాయిస్</span>
          </div>
        </div>
        <span onClick={openCard}
          style={{ fontSize:11, color:T.red, fontWeight:600, cursor:'pointer', flexShrink:0 }}>See all →</span>
      </div>

      {/* Native horizontal scroller. Auto-nudge + manual swipe coexist. */}
      <div
        ref={scrollerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        onMouseDown={onTouchStart}
        onMouseUp={onTouchEnd}
        onMouseLeave={onTouchEnd}
        style={{
          display:'flex',
          padding:'0 16px 14px',
          overflowX:'auto',
          overflowY:'hidden',
          scrollbarWidth:'none',
          msOverflowStyle:'none',
          WebkitOverflowScrolling:'touch',
          overscrollBehaviorX:'contain',
        }}>
        {looped.map((s, i) => {
          const hasVideo = Array.isArray(s.videos) && s.videos.length > 0;
          const thumb = (Array.isArray(s.images) && s.images[0]) || s.thumbnail;
          const dur = s.duration_seconds;
          const durLabel = (typeof dur === 'number' && dur > 0)
            ? `${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')}` : null;
          return (
          <div key={`pv-${i}`} onClick={() => openCard(s)}
            style={{ flexShrink:0, width:108, marginRight:8, cursor:'pointer', position:'relative' }}>
            {/* Clean 9:16 tile — plays the actual uploaded video (muted, looping
                preview); falls back to the image when there's no video. */}
            <div style={{ width:108, height:192, borderRadius:10, overflow:'hidden',
              background:'#111', position:'relative' }}>
              {hasVideo ? (
                // Show only the first frame as a lightweight thumbnail. We append
                // a #t=0.1 media fragment and preload="metadata" so the browser
                // fetches just enough to paint the first frame — it never streams
                // or autoplays the whole clip. The full video plays on click
                // (openCard → fullscreen feed). This stops the section from
                // stalling while every clip in the row downloads.
                <video
                  src={`${s.videos[0]}#t=0.1`}
                  muted
                  playsInline
                  preload="metadata"
                  draggable={false}
                  style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none', background:'#000' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <img
                  src={safeImageUrl(thumb)}
                  alt={s.issue_name || 'Public Voice'}
                  draggable={false}
                  style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }}
                  onError={e => { e.target.style.opacity = '0.25'; }}
                />
              )}
              {/* Duration badge bottom-right */}
              {durLabel && (
                <div style={{ position:'absolute', bottom:6, right:6,
                  background:'rgba(0,0,0,0.7)', borderRadius:4, padding:'1px 5px',
                  fontSize:9, fontWeight:700, color:'#fff' }}>▶ {durLabel}</div>
              )}
            </div>
            {/* Issue name below */}
            <div style={{ marginTop:6, fontSize:10.5, fontWeight:700, lineHeight:1.3,
              color:T.text, fontFamily:"'Noto Sans Telugu',sans-serif",
              display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              overflow:'hidden' }}>
              {s.issue_name || s.uploader_name || '—'}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}


// Shimmer placeholder shown while the first public-voice fetch is in flight.
// Mirrors the real rail's header + 108×192 tile geometry so there's no layout
// shift when the data arrives.
function PublicVoiceSkeleton({ T, channel }) {
  return (
    <div style={{ background:T.bg }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'14px 16px 10px', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, minWidth:0 }}>
          <SectionAccentBar/>
          <div style={{ display:'flex', alignItems:'baseline', gap:6, minWidth:0 }}>
            <span style={{ fontFamily:"'Noto Sans Telugu',sans-serif", fontWeight:800,
              fontSize:16, color:T.text }}>
              {channel ? channel.name : 'కర్నూలు'}
            </span>
            <span style={{
              fontFamily:"'Noto Sans Telugu',sans-serif", fontWeight:900,
              fontSize:17, letterSpacing:0.3,
              background:'linear-gradient(135deg,#DC2626,#F97316)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>పబ్లిక్ వాయిస్</span>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', padding:'0 16px 14px', overflow:'hidden' }}>
        {Array.from({ length:5 }).map((_, i) => (
          <div key={`pv-sk-${i}`} style={{ flexShrink:0, width:108, marginRight:8 }}>
            <SkeletonBox style={{ width:108, height:192, borderRadius:10 }} />
            <SkeletonBox style={{ width:'90%', height:10, borderRadius:5, marginTop:8 }} />
            <SkeletonBox style={{ width:'60%', height:10, borderRadius:5, marginTop:5 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export { PublicVoiceSection };
export default PublicVoiceSection;
