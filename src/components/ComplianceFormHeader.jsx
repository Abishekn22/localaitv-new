import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function ComplianceFormHeader({ icon, title, subtitle, gradient, onBack }) {
  const { T } = useAppTheme();
  // On light mode: use clean white header unless a specific gradient is passed
  // On dark mode: use provided gradient or default navy gradient
  const bg = gradient
    ? gradient
    : T.isDark
      ? `linear-gradient(135deg,#0A1538,${T.bg2})`
      : T.bg2;
  return (
    <div style={{background: bg, padding:'48px 18px 22px', flexShrink:0, position:'relative',
      borderBottom:`1px solid ${T.border}`}}>
      <button onClick={onBack} style={{
        position:'absolute',top:52,left:14,
        background:T.bg3,border:`1px solid ${T.border}`,
        borderRadius:8,width:32,height:32,
        color:T.text,fontSize:16,cursor:'pointer',
        boxShadow:T.isDark?'none':`0 1px 4px ${T.shadow}`,
      }}>←</button>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:34,marginBottom:6}}>{icon}</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,
          color:gradient?'white':T.text,letterSpacing:0.8}}>{title}</div>
        {subtitle && <div style={{fontSize:11,color:gradient?'rgba(255,255,255,0.8)':T.textMuted,
          marginTop:5,lineHeight:1.5}}>{subtitle}</div>}
      </div>
    </div>
  );
}


export { ComplianceFormHeader };
export default ComplianceFormHeader;
