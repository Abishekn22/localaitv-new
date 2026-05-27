import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

// Single bulletin card in the list
function BulletinCard({ item, isPlaying, onSelect }) {
  const { T } = useAppTheme();
  const colors = PROGRAM_COLORS[item.programType] || { bg:'#455A64', text:'white' };

  return (
    <div
      onClick={() => onSelect(item)}
      style={{
        display:'flex', gap:12, padding:'12px 16px',
        borderBottom:`1px solid ${T.border}`,
        background: isPlaying
          ? (T.isDark ? 'rgba(208,2,27,0.08)' : 'rgba(208,2,27,0.04)')
          : 'transparent',
        cursor:'pointer',
        transition:'background 0.2s',
        borderLeft: isPlaying ? '3px solid #D0021B' : '3px solid transparent',
      }}>

      {/* Thumbnail */}
      <div style={{ flexShrink:0, position:'relative', width:120, height:68 }}>
        <img
          src={item.thumbnail}
          alt={item.titleTe}
          style={{ width:'100%', height:'100%', objectFit:'cover',
            borderRadius:8, display:'block' }}
          onError={e => {
            e.target.src = `https://img.youtube.com/vi/${item.ytId}/hqdefault.jpg`;
          }}
        />
        {/* Duration overlay */}
        <div style={{
          position:'absolute', bottom:5, right:5,
          background:'rgba(0,0,0,0.8)', borderRadius:4,
          padding:'2px 5px',
        }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:10, fontWeight:700, color:'white' }}>
            {item.duration}
          </span>
        </div>
        {/* Playing indicator */}
        {isPlaying && (
          <div style={{
            position:'absolute', inset:0, borderRadius:8,
            background:'rgba(208,2,27,0.25)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{ display:'flex', gap:2, alignItems:'flex-end' }}>
              {[1,2,3].map(i=>(
                <div key={i} style={{
                  width:3, borderRadius:2,
                  background:'#D0021B',
                  height: i===2?14:10,
                  animation:`soundbar${i} 0.7s ease-in-out infinite alternate`,
                }}/>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:4 }}>
        {/* Program type badge */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:4,
          background:colors.bg, borderRadius:5,
          padding:'2px 8px', alignSelf:'flex-start' }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:9, fontWeight:800, color:colors.text,
            letterSpacing:0.5, textTransform:'uppercase' }}>
            {item.programType}
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily:"'Noto Sans Telugu',sans-serif",
          fontWeight:700, fontSize:13, lineHeight:1.45,
          color: isPlaying ? '#D0021B' : T.text,
          display:'-webkit-box', WebkitLineClamp:2,
          WebkitBoxOrient:'vertical', overflow:'hidden',
        }}>{item.titleTe}</div>

        {/* Meta */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:'auto' }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:11, color:T.textMuted }}>
            🕐 {item.broadcastTime}
          </span>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:11, color:T.textMuted }}>
            👁 {item.views}
          </span>
          {isPlaying && (
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:10, fontWeight:800, color:'#D0021B', letterSpacing:0.5 }}>
              ▶ చూస్తున్నారు
            </span>
          )}
        </div>
      </div>
    </div>
  );
}


export { BulletinCard };
export default BulletinCard;
