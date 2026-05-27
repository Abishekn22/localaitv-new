import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function AILabel({ type = 'ai' }) {
  const configs = {
    ai:       { bg:'rgba(124,58,237,0.15)', border:'rgba(124,58,237,0.3)', color:'#A78BFA', text:'🤖 AI Generated' },
    assisted: { bg:'rgba(0,198,184,0.10)', border:'rgba(0,198,184,0.25)', color:T.teal,    text:'🤖 AI Assisted' },
    local:    { bg:'rgba(0,208,104,0.10)', border:'rgba(0,208,104,0.25)', color:T.green,   text:'📍 Local Report' },
  };
  const c = configs[type] || configs.ai;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      background:c.bg, border:`1px solid ${c.border}`,
      borderRadius:5, padding:'2px 7px',
      fontSize:8, fontWeight:700, color:c.color,
      letterSpacing:0.5, fontFamily:"'Barlow Condensed',sans-serif",
    }}>{c.text}</span>
  );
}

// ── Compliance 4: Permission Explanation Sheet ─────────────────

export { AILabel };
export default AILabel;
