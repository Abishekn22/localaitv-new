import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function BottomNav({ active, onChange }) {
  const { T } = useAppTheme();
  const items = [
    { id:'home',     label:'Home'    },
    { id:'channels', label:'Live TV' },
    { id:'upload',   label:'Upload'  },
    { id:'local',    label:'Local'   },
    { id:'profile',  label:'Profile' },
  ];

  // SVG icons — clean line-art style
  const icons = {
    home: (on) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={on ? T.red : T.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
    channels: (on) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={on ? T.red : T.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 3l-4 4-4-4"/>
        <circle cx="12" cy="14" r="3"/>
      </svg>
    ),
    local: (on) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={on ? T.red : T.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
    profile: (on) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={on ? T.red : T.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
  };

  // Paper-plane upload icon (matching the photo exactly)
  const UploadIcon = () => (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );

  // Phase-2 OTT nav reskin — glass dock, sliding-feel active indicator,
  // premium press feedback. Same items, same icons, same onClick wiring.
  return (
    <div style={{
      position: 'relative',
      flexShrink: 0,
      paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      paddingTop: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      // Soft cinematic dock: deep-navy with a subtle inner top highlight + drop shadow.
      // Glass effect kept conservative so it works on both light and dark theme.
      background: T.isDark
        ? `linear-gradient(180deg, rgba(11,15,26,0.78) 0%, ${T.bg2} 18%)`
        : `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, ${T.bg2} 18%)`,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderTop: `1px solid ${T.isDark ? OTT.color.lineStrong : T.border}`,
      boxShadow: T.isDark
        ? '0 -8px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)'
        : '0 -4px 18px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
    }}>
      {/* Top accent line — premium red glow fade, signals this is the new design language */}
      <div style={{
        position:'absolute', top:0, left:'18%', right:'18%', height:1,
        background:`linear-gradient(90deg, transparent 0%, ${OTT.color.redSoft} 50%, transparent 100%)`,
        pointerEvents:'none',
      }}/>

      {items.map(item => {
        const isUpload = item.id === 'upload';
        const isActive = active === item.id;

        if (isUpload) {
          return (
            <div key={item.id}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                marginTop: -24, position:'relative' }}>
              {/* Upload circle button — premium press feedback + stronger red glow */}
              <button onClick={() => onChange(item.id)}
                className="ott-press-strong"
                style={{
                  width: 58, height: 58,
                  borderRadius: '50%',
                  background: `linear-gradient(145deg, #E8001E, #A0000F)`,
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 8px 30px rgba(225,29,72,0.55), 0 2px 10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)`,
                  cursor: 'pointer',
                  position: 'relative', zIndex: 1,
                }}>
                <UploadIcon/>
              </button>
              <span style={{
                fontSize: 9, letterSpacing: '0.8px', textTransform: 'uppercase',
                fontWeight: 800, fontFamily:"'Barlow Condensed',sans-serif",
                color: T.red, position:'relative', zIndex:1,
              }}>Upload</span>
            </div>
          );
        }

        return (
          <button key={item.id} onClick={() => onChange(item.id)}
            className="ott-tab"
            style={{
              position:'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '10px 12px 2px',
              background: 'none', border: 'none', cursor: 'pointer',
            }}>
            {/* Active indicator — soft red dot above the icon, fades+scales in */}
            <div style={{
              position:'absolute', top:3, left:'50%',
              width: isActive ? 18 : 4, height: 3,
              borderRadius: 2,
              background: OTT.color.red,
              boxShadow: isActive ? `0 0 10px ${OTT.color.red}, 0 0 18px rgba(225,29,72,0.45)` : 'none',
              opacity: isActive ? 1 : 0,
              transform: `translateX(-50%) scaleX(${isActive?1:0.3})`,
              transformOrigin:'center',
              transition: `all ${OTT.motion.base}`,
              pointerEvents:'none',
            }}/>
            {icons[item.id]?.(isActive)}
            <span style={{
              fontSize: 9, letterSpacing: '0.8px', textTransform: 'uppercase',
              fontWeight: 700, fontFamily:"'Barlow Condensed',sans-serif",
              color: isActive ? T.red : T.textMuted,
              transition: `color ${OTT.motion.fast}`,
            }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}



export { BottomNav };
export default BottomNav;
