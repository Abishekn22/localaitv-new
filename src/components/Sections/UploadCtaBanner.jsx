import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function UploadCtaBanner({ onNavigate }) {
  const [slot, setSlot] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setSlot(s => (s + 1) % 2), 3500);
    return () => clearInterval(iv);
  }, []);

  // Each slide has a line1, line2, and a fontFamily appropriate to the language
  const SLIDES = [
    {
      line1: 'మీ వార్తను మీరే',
      line2: 'ఒక్క నిమిషంలో అప్లోడ్ చేసుకోండి!',
      font: "'Noto Sans Telugu','Barlow',sans-serif",
      isTelugu: true,
    },
    {
      line1: 'CLICK HERE TO REGISTER',
      line2: 'to upload News / Information',
      font: "'Barlow Condensed',sans-serif",
      isTelugu: false,
    },
  ];
  const cur = SLIDES[slot];

  // Navy-blue register banner — brighter, saturated navy per design screenshot.
  const BG_DEFAULT  = `linear-gradient(135deg, #15294F 0%, #1E3C6B 100%)`;
  const BG_HOVER    = `linear-gradient(135deg, #1E3C6B 0%, #27508A 100%)`;
  const BORDER      = OTT.color.lineStrong;
  const ACCENT_LEFT = OTT.color.red;       // premium red accent strip
  const TXT_PRIMARY = OTT.color.text;
  const TXT_SECOND  = OTT.color.text2;

  return (
    <div
      onClick={() => onNavigate && onNavigate('upload')}
      onMouseEnter={e => { e.currentTarget.style.background = BG_HOVER; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `${OTT.elev.md}, ${OTT.color.redGlow}`; }}
      onMouseLeave={e => { e.currentTarget.style.background = BG_DEFAULT; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = OTT.elev.sm; }}
      style={{
        position: 'relative',
        margin: '10px 16px 12px',
        padding: '14px 18px 14px 17px',
        background: BG_DEFAULT,
        borderRadius: OTT.radius.lg,
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${ACCENT_LEFT}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        boxShadow: OTT.elev.sm,
        transition: `all ${OTT.motion.base}`,
        userSelect: 'none',
        minHeight: 72,
        overflow: 'hidden',
      }}>
      {/* Soft red glow behind the upload glyph — premium, not distracting */}
      <div style={{
        flexShrink:0, width:42, height:42, borderRadius:OTT.radius.md,
        background:`radial-gradient(120% 120% at 30% 20%, ${OTT.color.redSoft} 0%, transparent 70%), ${OTT.color.bg3}`,
        border:`1px solid ${OTT.color.lineStrong}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`inset 0 0 0 1px rgba(255,255,255,0.04)`,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={OTT.color.red}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </div>
      <div key={`slide-${slot}`} style={{
        flex:1, minWidth:0,
        display:'flex', flexDirection:'column', gap:3,
        animation:'fadeIn 0.35s ease',
      }}>
        <span style={{
          fontFamily: cur.font,
          fontWeight: cur.isTelugu ? 800 : 900,
          fontSize: cur.isTelugu ? 15.5 : 14,
          lineHeight: 1.3,
          letterSpacing: cur.isTelugu ? 0.2 : 1.4,
          textTransform: cur.isTelugu ? 'none' : 'uppercase',
          color: TXT_PRIMARY,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>
          {cur.line1}
        </span>
        <span style={{
          fontFamily: cur.font,
          fontWeight: cur.isTelugu ? 700 : 600,
          fontSize: cur.isTelugu ? 14 : 11.5,
          lineHeight: 1.3,
          letterSpacing: cur.isTelugu ? 0.2 : 0.5,
          color: TXT_SECOND,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>
          {cur.line2}
        </span>
      </div>
      <span style={{
        flexShrink:0, color:OTT.color.text3, fontSize:18, marginLeft:4,
      }}>›</span>
    </div>
  );
}

export { UploadCtaBanner };
export default UploadCtaBanner;
