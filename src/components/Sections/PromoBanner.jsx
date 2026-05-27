import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

// ── PROMO BANNER — continuously scrolling promotional banner ─────
// Shows birthday/marriage/wishes upload CTA with register link
// Slides left endlessly (duplicated content for seamless loop)
function PromoBanner({ onNavigate }) {
  const { T } = useAppTheme();

  // Each card = one promo slide
  const SLIDES = [
    {
      emoji:   '🎂',
      gradient: ['#7B1FA2', '#AB47BC'],
      titleEn: 'Celebrate Birthdays',
      titleTe: 'పుట్టినరోజు శుభాకాంక్షలు',
      descTe:  'మీ ప్రియమైన వారి పుట్టినరోజు మా ఛానెల్‌లో ప్రసారం చేయండి',
      cta:     'Register Free →',
      action:  'register',
    },
    {
      emoji:   '💍',
      gradient: ['#C2185B', '#E91E63'],
      titleEn: 'Wedding Announcements',
      titleTe: 'పెళ్ళి శుభాకాంక్షలు',
      descTe:  'మీ వివాహ శుభవేళ స్థానిక ప్రేక్షకులకు తెలియజేయండి',
      cta:     'Register Free →',
      action:  'register',
    },
    {
      emoji:   '📺',
      gradient: ['#1565C0', '#1976D2'],
      titleEn: 'Become a Reporter',
      titleTe: 'విలేకరిగా చేరండి',
      descTe:  'మీ ప్రాంత వార్తలు అప్‌లోడ్ చేసి లక్షల మందికి చేరండి',
      cta:     'Register Free →',
      action:  'register',
    },
    {
      emoji:   '📢',
      gradient: ['#E65100', '#F57C00'],
      titleEn: 'Advertise Your Business',
      titleTe: 'మీ వ్యాపారాన్ని ప్రచారం చేయండి',
      descTe:  'స్థానిక ప్రేక్షకులకు మీ ఉత్పత్తులు, సేవలు తెలియజేయండి',
      cta:     'Register Free →',
      action:  'register',
    },
    {
      emoji:   '🌟',
      gradient: ['#2E7D32', '#388E3C'],
      titleEn: 'Join LocalAI TV',
      titleTe: 'LocalAI TV లో చేరండి',
      descTe:  'ఇప్పుడే నమోదు చేసుకుని మీ నియోజకవర్గ వార్తలు పొందండి',
      cta:     'Register Now →',
      action:  'register',
      highlight: true,
    },
  ];

  // Duplicate for seamless infinite loop
  const ALL = [...SLIDES, ...SLIDES];

  return (
    <div style={{
      background: T.isDark ? T.bg2 : '#FFF',
      borderTop:  `1px solid ${T.border}`,
      borderBottom:`1px solid ${T.border}`,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Scrolling track — CSS animation scrolls left forever */}
      <div style={{
        display: 'flex',
        gap: 10,
        padding: '12px 0 12px 12px',
        animation: 'scrollBanner 28s linear infinite',
        width: 'max-content',
      }}>
        {ALL.map((s, i) => (
          <div
            key={i}
            onClick={() => onNavigate(s.action)}
            style={{
              flexShrink: 0,
              width: 240,
              borderRadius: 14,
              overflow: 'hidden',
              cursor: 'pointer',
              background: `linear-gradient(135deg,${s.gradient[0]},${s.gradient[1]})`,
              boxShadow: `0 4px 16px ${s.gradient[0]}44`,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Background emoji watermark */}
            <div style={{
              position: 'absolute', top: -8, right: -4,
              fontSize: 72, opacity: 0.15, pointerEvents: 'none',
              lineHeight: 1,
            }}>{s.emoji}</div>

            {/* Card content */}
            <div style={{padding:'12px 14px 10px', position:'relative'}}>
              {/* Top row: emoji + english title */}
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:24}}>{s.emoji}</span>
                <div>
                  <div style={{
                    fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:800, fontSize:14,
                    color:'white', letterSpacing:0.5, lineHeight:1.1,
                  }}>{s.titleEn}</div>
                  {s.highlight && (
                    <div style={{
                      display:'inline-block',
                      background:'rgba(255,255,255,0.25)',
                      color:'white', fontSize:7, fontWeight:800,
                      padding:'1px 6px', borderRadius:4,
                      letterSpacing:1, marginTop:2,
                    }}>FREE</div>
                  )}
                </div>
              </div>

              {/* Telugu description */}
              <div style={{
                fontFamily:"'Noto Sans Telugu',sans-serif",
                fontSize:11, fontWeight:500,
                color:'rgba(255,255,255,0.9)',
                lineHeight:1.5, marginBottom:10,
              }}>{s.descTe}</div>

              {/* CTA button */}
              <div style={{
                display:'inline-flex', alignItems:'center', gap:5,
                background:'rgba(255,255,255,0.22)',
                borderRadius:20, padding:'5px 12px',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:700, fontSize:11, color:'white',
                letterSpacing:0.5,
                border:'1px solid rgba(255,255,255,0.35)',
              }}>{s.cta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Left/right fade masks for clean edge effect */}
      <div style={{
        position:'absolute', top:0, left:0, bottom:0, width:24,
        background:`linear-gradient(90deg,${T.isDark?T.bg2:'#FFF'},transparent)`,
        pointerEvents:'none', zIndex:2,
      }}/>
      <div style={{
        position:'absolute', top:0, right:0, bottom:0, width:24,
        background:`linear-gradient(270deg,${T.isDark?T.bg2:'#FFF'},transparent)`,
        pointerEvents:'none', zIndex:2,
      }}/>

      {/* Bottom strip — register CTA */}
      <div style={{
        borderTop:`1px solid ${T.border}`,
        padding:'8px 16px',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background: T.isDark ? 'rgba(208,2,27,0.06)' : 'rgba(208,2,27,0.04)',
      }}>
        <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:11,color:T.textMuted,lineHeight:1.65}}>
          మీ వార్తలు, శుభాకాంక్షలు ప్రసారం చేయండి
        </div>
        <button
          onClick={() => onNavigate('register')}
          style={{
            background:`linear-gradient(135deg,${T.red},#7A0010)`,
            color:'white', border:'none', borderRadius:20,
            padding:'6px 14px',
            fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:800, fontSize:11, letterSpacing:0.8,
            cursor:'pointer', flexShrink:0,
            boxShadow:`0 3px 10px ${T.red}44`,
            whiteSpace:'nowrap',
          }}>
          📲 Register Now
        </button>
      </div>
    </div>
  );
}

export { PromoBanner };
export default PromoBanner;
