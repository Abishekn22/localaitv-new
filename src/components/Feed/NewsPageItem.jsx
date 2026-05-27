import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import SharedActionBar from './../SharedActionBar.jsx';

function NewsPageItem({ item, isActive, onShare, onComment }) {
  const { T } = useAppTheme();
  const catConf = NEWS_CATS.find(c => c.id === item.cat) || NEWS_CATS[0];

  const formatTime = () => {
    if (!item.uploadedAt) return item.time || '';
    const d = new Date(item.uploadedAt);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hrs  = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hrs  < 24) return `${hrs}h ago`;
    if (days === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  };

  return (
    <div style={{
      width:'100%', height:'100%',
      display:'flex', flexDirection:'column',
      background: T.isDark ? '#000' : '#f8faff',
      overflow:'hidden',
    }}>

      {/* ── 1. HEADLINE + CATEGORY BADGE ── */}
      <div style={{
        padding:'60px 16px 10px',
        background: T.isDark
          ? 'linear-gradient(180deg,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.5) 70%,transparent 100%)'
          : 'linear-gradient(180deg,rgba(248,250,255,0.98) 0%,rgba(248,250,255,0.8) 100%)',
        flexShrink:0,
      }}>
        {/* Category + live badge */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:4,
            background:`${catConf.color}18`,
            border:`1px solid ${catConf.color}44`,
            borderRadius:6, padding:'3px 10px',
          }}>
            <span style={{ fontSize:11 }}>{catConf.emoji}</span>
            <span style={{
              fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:10, fontWeight:800, color:catConf.color,
              letterSpacing:0.8, textTransform:'uppercase',
            }}>{item.cat}</span>
          </div>
          {item.live && (
            <div style={{
              display:'flex', alignItems:'center', gap:4,
              background:'rgba(208,2,27,0.12)',
              border:'1px solid rgba(208,2,27,0.3)',
              borderRadius:6, padding:'3px 10px',
            }}>
              <div style={{ width:6,height:6,borderRadius:'50%',
                background:'#D0021B', animation:'blink 1s infinite' }}/>
              <span style={{
                fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:10, fontWeight:800, color:'#D0021B', letterSpacing:0.8,
              }}>LIVE</span>
            </div>
          )}
        </div>
        {/* Telugu headline */}
        <h2 style={{
          margin:0, fontFamily:"'Noto Sans Telugu',sans-serif",
          fontWeight:800, fontSize:17, lineHeight:1.5,
          color: T.isDark ? 'white' : '#0a0a14',
        }}>{item.title}</h2>
        {item.titleEn && (
          <p style={{
            margin:'4px 0 0', fontFamily:"'Barlow',sans-serif",
            fontSize:12, color:T.textMuted, lineHeight:1.4,
          }}>{item.titleEn}</p>
        )}
      </div>

      {/* ── 2. VIDEO PLAYER (38% height) ── */}
      <div style={{
        height:'38%', flexShrink:0,
        position:'relative', background:'#000', overflow:'hidden',
      }}>
        {isActive && item.ytId ? (
          <iframe
            key={`nv-${item.id}`}
            src={`https://www.youtube.com/embed/${item.ytId}?autoplay=1&mute=0&rel=0&modestbranding=1&controls=1`}
            title={item.titleEn || item.title}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{ width:'100%', height:'100%', border:'none', display:'block' }}
          />
        ) : (
          <div style={{ width:'100%', height:'100%', position:'relative' }}>
            <img
              src={item.thumbnail || `https://img.youtube.com/vi/${item.ytId||'vLQ32b7rMAs'}/maxresdefault.jpg`}
              alt={item.title}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';
              }}
            />
            {item.ytId && (
              <div style={{
                position:'absolute', inset:0,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(0,0,0,0.25)',
              }}>
                <div style={{
                  width:52, height:52, borderRadius:'50%',
                  background:'rgba(255,255,255,0.92)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <div style={{
                    width:0, height:0, marginLeft:5,
                    borderTop:'13px solid transparent',
                    borderBottom:'13px solid transparent',
                    borderLeft:'20px solid #D0021B',
                  }}/>
                </div>
              </div>
            )}
            {/* Views overlay */}
            {item.views && (
              <div style={{
                position:'absolute', bottom:8, right:10,
                background:'rgba(0,0,0,0.7)', borderRadius:6,
                padding:'3px 8px', backdropFilter:'blur(4px)',
              }}>
                <span style={{
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:10, fontWeight:700, color:'white',
                }}>👁 {item.views}</span>
              </div>
            )}
          </div>
        )}
        {/* Bottom fade */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:28,
          background:'linear-gradient(0deg,rgba(0,0,0,0.8) 0%,transparent 100%)',
          pointerEvents:'none',
        }}/>
      </div>

      {/* ── 3. SHARED ACTION BAR ── */}
      <SharedActionBar
        itemId={`news_feed_${item.id}`}
        onShare={onShare}
        onComment={onComment}
        compact={false}
      />

      {/* ── 4. SCROLLABLE CONTENT ── */}
      <div style={{
        flex:1, overflowY:'auto',
        scrollbarWidth:'none', WebkitOverflowScrolling:'touch',
        paddingBottom:80, // space for bottom category bar
      }}>
        {/* Full text */}
        <div style={{ padding:'14px 16px 12px' }}>
          <p style={{
            margin:0, fontFamily:"'Noto Sans Telugu',sans-serif",
            fontSize:14, lineHeight:1.85, whiteSpace:'pre-line',
            color: T.isDark ? 'rgba(255,255,255,0.82)' : T.text,
          }}>
            {item.fullText || item.title}
          </p>
        </div>

        {/* ── 5. REPORTER / UPLOADER META ── */}
        <div style={{
          margin:'4px 16px 12px',
          background: T.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          borderRadius:14, padding:'12px 14px',
          border:`1px solid ${T.border}`,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            {/* Profile photo */}
            <div style={{
              width:38, height:38, borderRadius:'50%', flexShrink:0,
              background:`linear-gradient(135deg,${catConf.color},${catConf.color}88)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:16, color:'white', fontWeight:700,
              border:`2px solid ${catConf.color}44`,
            }}>
              {(item.reporter || item.channel || 'L')[0]}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:800, fontSize:14, color:T.text,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
              }}>
                {item.reporter || item.channel || 'LocalAI TV'}
              </div>
              <div style={{ fontSize:10, color:T.textMuted, marginTop:1 }}>
                {item.channel} · Verified ✓
              </div>
            </div>
            <div style={{
              background:`${catConf.color}18`,
              border:`1px solid ${catConf.color}44`,
              borderRadius:20, padding:'3px 10px',
            }}>
              <span style={{
                fontFamily:"'Barlow Condensed',sans-serif",
                fontSize:9, fontWeight:800,
                color:catConf.color, letterSpacing:0.5,
              }}>{catConf.emoji} {item.cat}</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {[
              { icon:'📅', label:'Date',     val: item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : item.time },
              { icon:'🕐', label:'Time',     val: item.uploadedAt ? new Date(item.uploadedAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : formatTime() },
              { icon:'📍', label:'Location', val: item.location },
              { icon:'👁',  label:'Views',   val: item.views },
            ].filter(x => x.val).map(({ icon, label, val }) => (
              <div key={label}>
                <div style={{
                  fontSize:9, color:T.textMuted, letterSpacing:0.5,
                  fontFamily:"'Barlow Condensed',sans-serif",
                  textTransform:'uppercase', marginBottom:1,
                }}>
                  {icon} {label}
                </div>
                <div style={{
                  fontFamily:"'Barlow Condensed',sans-serif",
                  fontSize:12, fontWeight:600, color:T.text,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Swipe hint */}
        <div style={{ textAlign:'center', paddingBottom:16 }}>
          <span style={{
            fontSize:11, color:T.textMuted,
            fontFamily:"'Barlow',sans-serif", letterSpacing:0.3,
          }}>↑ swipe up for next news</span>
        </div>
      </div>
    </div>
  );
}


export { NewsPageItem };
export default NewsPageItem;
