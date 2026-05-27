import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function SectionAccentBar() {
  // Adaptive shadow: in light mode, a subtle dark underbase anchors the bar
  // against bright surfaces. Same red, same glow, same dimensions — only
  // the perceived authority is normalized. Mohan: "goal is consistency of
  // perceived authority, not consistency of raw dimensions."
  const { T } = useAppTheme();
  const isLight = !T.isDark;
  return (
    <div style={{
      width:3, height:22, borderRadius:2,
      background:OTT.color.red,
      boxShadow: isLight
        ? `0 0 16px rgba(225,29,72,0.32), 0 1px 3px rgba(0,0,0,0.14)`
        : `0 0 14px ${OTT.color.redSoft}`,
      flexShrink:0,
    }}/>
  );
}


export { SectionAccentBar };
export default SectionAccentBar;
