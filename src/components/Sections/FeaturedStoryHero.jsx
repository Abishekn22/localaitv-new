import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function FeaturedStoryHero({ item, loading, onOpenNews }) {
  // No data and not loading → render nothing (homepage falls through to
  // the next section). Loading → skeleton (preserves layout).
  if (!loading && (!item || !item.thumbnail)) return null;

  // Telugu-first headline with English fallback.
  const headlineTe = item?.title || '';
  const headlineEn = item?.titleEn || '';
  const channel    = item?.channel || '';
  const cat        = item?.cat || '';
  const time       = item?.time || '';
  const isLive     = !!item?.live;

  return (
    <div style={{
      width:'100%',
      background:OTT.color.bg1,
      padding:'4px 14px 14px',
    }}>
      <div
        className="ott-press-strong"
        onClick={() => !loading && item && onOpenNews && onOpenNews(item)}
        style={{
          position:'relative',
          borderRadius:OTT.radius.lg,
          overflow:'hidden',
          background:OTT.color.bg2,
          border:`1px solid ${OTT.color.lineStrong}`,
          boxShadow:OTT.elev.md,
          cursor: loading ? 'default' : 'pointer',
          isolation:'isolate',
        }}
      >
        {/* 16:9 aspect (matches live player's rhythm above) */}
        <div style={{position:'relative', paddingBottom:'56.25%', height:0}}>

          {loading ? (
            /* Skeleton — soft shimmer over a flat surface */
            <div style={{
              position:'absolute', inset:0,
              background:`linear-gradient(135deg, ${OTT.color.bg2} 0%, ${OTT.color.bg3} 50%, ${OTT.color.bg2} 100%)`,
              backgroundSize:'200% 100%',
              animation:'shimmer 1.8s linear infinite',
            }}/>
          ) : (
            <>
              {/* Background photo — Ken Burns zoom for cinematic breath */}
              <img
                className="ott-kenburns"
                src={item.thumbnail}
                alt=""
                loading="lazy"
                style={{
                  position:'absolute', inset:0,
                  width:'100%', height:'100%',
                  objectFit:'cover',
                  transformOrigin:'center center',
                  willChange:'transform',
                }}
              />

              {/* Edge vignette — darkens corners so chrome floats cleanly */}
              <div style={{
                position:'absolute', inset:0,
                background:'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)',
                pointerEvents:'none',
              }}/>

              {/* Bottom gradient — text legibility shield, heavy */}
              <div style={{
                position:'absolute', left:0, right:0, bottom:0, top:'35%',
                background:'linear-gradient(to bottom, transparent 0%, rgba(6,8,15,0.55) 45%, rgba(6,8,15,0.95) 100%)',
                pointerEvents:'none',
              }}/>

              {/* Single rare gold shine sweep — "this story is highlighted" */}
              <div style={{
                position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none',
              }}>
                <div className="ott-featured-shine" style={{
                  position:'absolute', top:0, bottom:0, left:0, width:'35%',
                  background:'linear-gradient(100deg, transparent 0%, rgba(255,184,0,0.10) 40%, rgba(255,255,255,0.18) 50%, rgba(255,184,0,0.10) 60%, transparent 100%)',
                  transform:'translateX(-120%)',
                }}/>
              </div>

              {/* TOP-LEFT eyebrow: AI SELECTED prestige cue.
                  Ties visually back to the live-player AI ribbon. */}
              <div style={{
                position:'absolute', top:12, left:12, zIndex:2,
                display:'flex', alignItems:'center', gap:7,
                padding:'5px 10px 5px 8px',
                background:OTT.color.glass,
                backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
                border:`1px solid ${OTT.color.glassEdge}`,
                borderRadius:OTT.radius.pill,
                boxShadow:OTT.elev.sm,
              }}>
                <div className="ott-ai-pulse" style={{
                  width:6, height:6, borderRadius:'50%',
                  background:OTT.color.red,
                }}/>
                <span style={{
                  fontFamily:OTT.type.mono.font, fontSize:9, fontWeight:900,
                  color:'#fff', letterSpacing:1.6, textTransform:'uppercase',
                }}>Featured&nbsp;·&nbsp;AI&nbsp;Selected</span>
              </div>

              {/* TOP-RIGHT urgency cue: LIVE pulse if live, else relative time */}
              {(isLive || time) && (
                <div style={{
                  position:'absolute', top:12, right:12, zIndex:2,
                  display:'flex', alignItems:'center', gap:6,
                  padding:'5px 10px',
                  background: isLive ? 'rgba(225,29,72,0.92)' : OTT.color.glass,
                  backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
                  border:`1px solid ${isLive ? 'rgba(255,255,255,0.18)' : OTT.color.glassEdge}`,
                  borderRadius:OTT.radius.pill,
                  boxShadow:OTT.elev.sm,
                }}>
                  {isLive && (
                    <div style={{
                      width:6, height:6, borderRadius:'50%', background:'#fff',
                      animation:'blink 1.1s infinite',
                    }}/>
                  )}
                  <span style={{
                    fontFamily:OTT.type.mono.font, fontSize:9.5, fontWeight:900,
                    color:'#fff', letterSpacing:1.3,
                  }}>{isLive ? 'LIVE NOW' : time.toUpperCase()}</span>
                </div>
              )}

              {/* BOTTOM block — editorial hierarchy: category eyebrow,
                  Telugu headline at full editorial weight, English subtitle */}
              <div style={{
                position:'absolute', left:14, right:14, bottom:12, zIndex:2,
              }}>
                {/* Category · channel eyebrow */}
                {(cat || channel) && (
                  <div style={{
                    display:'flex', alignItems:'center', gap:6,
                    marginBottom:6,
                  }}>
                    <span style={{
                      fontFamily:OTT.type.mono.font, fontSize:9.5, fontWeight:900,
                      color:OTT.color.red, letterSpacing:1.6, textTransform:'uppercase',
                    }}>{cat || 'NEWS'}</span>
                    {cat && channel && (
                      <span style={{
                        width:3, height:3, borderRadius:'50%',
                        background:OTT.color.text3,
                      }}/>
                    )}
                    {channel && (
                      <span style={{
                        fontFamily:OTT.type.mono.font, fontSize:9.5, fontWeight:800,
                        color:OTT.color.text2, letterSpacing:0.8, textTransform:'uppercase',
                      }}>{channel}</span>
                    )}
                  </div>
                )}

                {/* Telugu headline — editorial weight, two-line clamp */}
                {headlineTe && (
                  <div style={{
                    fontFamily:OTT.type.te.font, fontSize:18, fontWeight:900,
                    color:'#fff', lineHeight:1.22, letterSpacing:0.1,
                    textShadow:'0 2px 12px rgba(0,0,0,0.55)',
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                    overflow:'hidden',
                  }}>{headlineTe}</div>
                )}

                {/* English title — secondary hierarchy */}
                {headlineEn && (
                  <div style={{
                    marginTop:4,
                    fontFamily:OTT.type.body.font, fontSize:11.5, fontWeight:500,
                    color:'rgba(255,255,255,0.72)', lineHeight:1.35,
                    textShadow:'0 1px 6px rgba(0,0,0,0.5)',
                    display:'-webkit-box', WebkitLineClamp:1, WebkitBoxOrient:'vertical',
                    overflow:'hidden',
                  }}>{headlineEn}</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export { FeaturedStoryHero };
export default FeaturedStoryHero;
