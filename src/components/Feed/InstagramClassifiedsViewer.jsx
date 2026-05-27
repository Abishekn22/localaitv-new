import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function InstagramClassifiedsViewer({ items, startIndex, onClose, badgeColor }) {
  const { T } = useAppTheme();
  const containerRef = useRef(null);

  // Scroll to the startIndex card on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Scroll instantly to the tapped card (no animation on open)
    el.scrollTo({ top: startIndex * window.innerHeight, behavior: 'auto' });
  }, [startIndex]);

  // Derive current visible index from scroll position
  const [currentIdx, setCurrentIdx] = useState(startIndex);
  function handleScroll(e) {
    const idx = Math.round(e.target.scrollTop / window.innerHeight);
    setCurrentIdx(Math.max(0, Math.min(idx, items.length - 1)));
  }

  const cl = items[currentIdx] || items[0];

  // Category gradient backgrounds — each category has its own colour
  const catGradient = {
    Property:    ['#1e3a5f', '#2563eb'],
    Vehicles:    ['#1a3a1a', '#16a34a'],
    Jobs:        ['#3a1a0a', '#ea580c'],
    Electronics: ['#1a1a3a', '#7c3aed'],
    Services:    ['#0a2a2a', '#0891b2'],
    Agri:        ['#1a3a0a', '#15803d'],
    Shops:       ['#2a1a0a', '#b45309'],
    Marriage:    ['#3a0a2a', '#be185d'],
    Wishes:      ['#2a0a3a', '#9333ea'],
    Education:   ['#0a1a3a', '#1d4ed8'],
    Pets:        ['#2a1a0a', '#92400e'],
  };
  const grad = catGradient[cl?.cat] || ['#1a1a2e', '#374151'];

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: '#000',
    }}>
      {/* ── SNAP SCROLL CONTAINER ── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {items.map((item, idx) => {
          const g = catGradient[item.cat] || ['#1a1a2e', '#374151'];
          return (
            <div
              key={item.id}
              style={{
                width: '100%',
                height: '100%',
                flexShrink: 0,
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                background: `linear-gradient(160deg, ${g[0]} 0%, ${g[1]} 60%, #000 100%)`,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Big background emoji watermark */}
              <div style={{
                position: 'absolute',
                top: '15%', right: '-10%',
                fontSize: 200, opacity: 0.07,
                pointerEvents: 'none',
                lineHeight: 1,
                userSelect: 'none',
              }}>{item.emoji}</div>

              {/* Top bar — close + counter */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '52px 16px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'linear-gradient(180deg,rgba(0,0,0,0.6) 0%,transparent 100%)',
                zIndex: 10,
              }}>
                <button onClick={onClose} style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white', fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>←</button>
                <div style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '5px 12px',
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 700, fontSize: 12, color: 'white',
                }}>
                  {idx + 1} / {items.length}
                </div>
                <div style={{width:36}}/>
              </div>

              {/* Scroll hint dots (right side like Instagram) */}
              <div style={{
                position: 'absolute', right: 14,
                top: '50%', transform: 'translateY(-50%)',
                display: 'flex', flexDirection: 'column', gap: 5, zIndex: 10,
              }}>
                {items.slice(Math.max(0,idx-2), Math.min(items.length, idx+3)).map((_, di) => {
                  const absIdx = Math.max(0,idx-2) + di;
                  return (
                    <div key={di} style={{
                      width: absIdx===idx ? 6 : 4,
                      height: absIdx===idx ? 6 : 4,
                      borderRadius: '50%',
                      background: absIdx===idx ? 'white' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.2s',
                    }}/>
                  );
                })}
              </div>

              {/* Main content — centered */}
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '0 20px 28px',
              }}>
                {/* Category badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 20, padding: '4px 12px',
                  marginBottom: 12, alignSelf: 'flex-start',
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 700, fontSize: 11, color: 'white', letterSpacing: 0.5,
                }}>
                  {CL_CAT_EMOJI[item.cat]} {item.cat.toUpperCase()}
                </div>

                {/* Title */}
                <div style={{
                  fontFamily: "'Barlow Condensed',sans-serif",
                  fontWeight: 800, fontSize: 26,
                  color: 'white', lineHeight: 1.15,
                  marginBottom: 10,
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                }}>{item.title}</div>

                {/* Description */}
                <div style={{
                  fontSize: 14, color: 'rgba(255,255,255,0.88)',
                  lineHeight: 1.6, marginBottom: 16,
                  textShadow: '0 1px 6px rgba(0,0,0,0.4)',
                }}>{item.desc}</div>

                {/* Meta row */}
                <div style={{
                  display: 'flex', gap: 14, marginBottom: 20,
                  flexWrap: 'wrap',
                }}>
                  {[
                    { icon: '📍', val: item.location },
                    { icon: '🕐', val: item.time },
                    { icon: '📞', val: item.contact },
                  ].map(m => (
                    <div key={m.icon} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 20, padding: '4px 10px',
                      fontSize: 11, color: 'rgba(255,255,255,0.9)',
                      fontWeight: 600,
                    }}>
                      <span style={{fontSize:12}}>{m.icon}</span> {m.val}
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{display: 'flex', gap: 10}}>
                  {!NO_CALL_CATS.includes(item.cat) ? (
                    <>
                      <button
                        onClick={() => window.open(`tel:+91${item.contact.replace(/\s/g,'')}`)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg,#059669,#047857)',
                          border: 'none', borderRadius: 14,
                          padding: '14px', color: 'white',
                          fontFamily: "'Barlow Condensed',sans-serif",
                          fontWeight: 800, fontSize: 15, cursor: 'pointer',
                          letterSpacing: 0.5,
                          boxShadow: '0 4px 16px rgba(5,150,105,0.4)',
                        }}>
                        📞 Call Now
                      </button>
                      <button
                        onClick={() => window.open(`https://wa.me/91${item.contact.replace(/\s/g,'')}?text=${encodeURIComponent('Hi, I saw your ad on LocalAI TV: '+item.title)}`,'_blank')}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg,#16a34a,#15803d)',
                          border: 'none', borderRadius: 14,
                          padding: '14px', color: 'white',
                          fontFamily: "'Barlow Condensed',sans-serif",
                          fontWeight: 800, fontSize: 15, cursor: 'pointer',
                          letterSpacing: 0.5,
                          boxShadow: '0 4px 16px rgba(22,163,74,0.4)',
                        }}>
                        💬 WhatsApp
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => window.open(`https://wa.me/91${item.contact.replace(/\s/g,'')}?text=${encodeURIComponent('Hi, I saw your post on LocalAI TV: '+item.title)}`,'_blank')}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg,#be185d,#9d174d)',
                        border: 'none', borderRadius: 14,
                        padding: '14px', color: 'white',
                        fontFamily: "'Barlow Condensed',sans-serif",
                        fontWeight: 800, fontSize: 15, cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(190,24,93,0.4)',
                      }}>
                      💕 Send Wishes
                    </button>
                  )}
                </div>

                {/* Swipe hint — only on first card */}
                {idx === startIndex && (
                  <div style={{
                    textAlign: 'center', marginTop: 12,
                    fontSize: 11, color: 'rgba(255,255,255,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    <span style={{animation:'bounceUp 1.2s ease-in-out infinite'}}>↑</span>
                    Swipe up for more ads
                    <span style={{animation:'bounceUp 1.2s ease-in-out infinite'}}>↑</span>
                    <style>{`@keyframes bounceUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { InstagramClassifiedsViewer };
export default InstagramClassifiedsViewer;
