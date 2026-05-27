import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function RatingDrawer({ open, onClose }) {
  const { T } = useAppTheme();
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{ position:'absolute', inset:0, zIndex:40,
        background:'rgba(0,0,0,0.55)', display:'flex',
        flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:T.isDark?'#111':'#fff', borderRadius:'20px 20px 0 0',
          padding:'20px 24px 36px', textAlign:'center',
          boxShadow:'0 -8px 40px rgba(0,0,0,0.35)' }}>
        <div style={{ width:40, height:4, background:T.border,
          borderRadius:2, margin:'0 auto 16px' }}/>
        {submitted ? (
          <>
            <div style={{ fontSize:48, marginBottom:12 }}>🙏</div>
            <div style={{ fontFamily:"'Noto Sans Telugu',sans-serif",
              fontSize:16, fontWeight:700, color:T.text, marginBottom:6 }}>
              ధన్యవాదాలు!
            </div>
            <div style={{ fontSize:13, color:T.textMuted }}>
              మీ రేటింగ్ నమోదు అయింది
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily:"'Noto Sans Telugu',sans-serif",
              fontSize:17, fontWeight:700, color:T.text, marginBottom:4 }}>
              ఈ వార్తను రేట్ చేయండి
            </div>
            <div style={{ fontSize:12, color:T.textMuted, marginBottom:20 }}>
              Rate this news
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:12, marginBottom:24 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={()=>setRating(star)}
                  style={{ fontSize:36, background:'none', border:'none',
                    cursor:'pointer', transition:'transform 0.15s',
                    transform: star <= rating ? 'scale(1.2)' : 'scale(1)',
                    filter: star <= rating ? 'none' : 'grayscale(1) opacity(0.4)' }}>
                  ⭐
                </button>
              ))}
            </div>
            <button onClick={()=>{ if(rating) { setSubmitted(true); setTimeout(onClose,1500); }}}
              disabled={!rating}
              style={{ width:'100%', padding:'14px',
                background: rating ? T.red : T.bg3,
                color: rating ? 'white' : T.textMuted,
                border:'none', borderRadius:14, fontSize:15,
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800, letterSpacing:0.5, cursor: rating ? 'pointer' : 'default',
                transition:'all 0.2s' }}>
              Submit Rating
            </button>
          </>
        )}
      </div>
    </div>
  );
}


export { RatingDrawer };
export default RatingDrawer;
