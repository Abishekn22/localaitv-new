import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import { LiveDot } from './../components/atoms.jsx';
import { mapBulletin, filterBulletinsByLocation } from '../_imports.js';
import { isAudioUnlocked } from './../utils/audioUnlock.js';

function ChannelDetailScreen({ channel, onBack, onOpenNews, onOpenBulletin }) {
  // Filter tabs reuse BULLETIN_SEGS: [LOCAL, DISTRICT, STATE, NATIONAL, ADS].
  // LOCAL (index 0) is the only one backed by real data today.
  const [activeFilter, setActiveFilter] = useState(0);

  // Previous bulletins for this district come from /api/bulletins. The backend
  // returns location_id: 0, so filterBulletinsByLocation matches by name.
  const { data: liveBulletins, loading: bulletinsLoading } = useAPI(
    () => apiCall('/bulletins?page=1&limit=50').then(d => d.items || d),
    [],
    []
  );
  const localBulletins = useMemo(() => {
    const items = Array.isArray(liveBulletins) ? liveBulletins : [];
    return filterBulletinsByLocation(items, {
      id: channel.location_id, name: channel.name, nameEn: channel.nameEn,
    }).map(mapBulletin).filter(Boolean);
  }, [liveBulletins, channel.location_id, channel.name, channel.nameEn]);

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Topbar */}
      <div style={{background:T.bg2,padding:'52px 18px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <button onClick={onBack} style={{width:36,height:36,borderRadius:10,background:T.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18,letterSpacing:1}}>
          <span style={{color:T.red}}>{channel.name.toUpperCase()}</span> NEWS TV
        </div>
        <button style={{width:36,height:36,borderRadius:10,background:T.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>⋯</button>
      </div>

      <div style={{flex:1,overflowY:'auto'}}>
        {/* Video player — real YouTube live embed (same stream the home hero plays) */}
        <div style={{width:'100%',height:210,background:'#000',position:'relative'}}>
          <iframe
            key={channel.id}
            data-yt-audio="1"
            src={`https://www.youtube.com/embed/${CHANNEL_VIDEO[channel.id] || YT_LIVE_VIDEO}?autoplay=1&mute=${isAudioUnlocked() ? '0' : '1'}&modestbranding=1&rel=0&playsinline=1&controls=1&fs=1&enablejsapi=1`}
            style={{width:'100%',height:'100%',border:'none',display:'block'}}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${channel.name} TV Live`}
          />
          {channel.live && <div style={{position:'absolute',top:12,left:12,background:T.red,borderRadius:4,padding:'3px 10px',fontSize:9,fontWeight:700,letterSpacing:2,display:'flex',alignItems:'center',gap:4,pointerEvents:'none'}}><LiveDot size={5}/>LIVE</div>}
        </div>

        {/* ── FILTER TABS — LOCAL / DISTRICT / STATE / NATIONAL / ADS ── */}
        <div style={{background:T.bg2,padding:'12px 14px',borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:'flex',gap:6}}>
            {BULLETIN_SEGS.map((seg, i) => (
              <button
                key={seg.label}
                onClick={() => setActiveFilter(i)}
                style={{
                  flex:1, padding:'8px 4px', borderRadius:8, cursor:'pointer',
                  background: i === activeFilter ? seg.color : `${seg.color}1A`,
                  border: `1px solid ${i === activeFilter ? seg.color : `${seg.color}44`}`,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:2,
                  transition:'all 0.2s ease',
                }}
              >
                <span style={{fontSize:9,fontWeight:800,letterSpacing:0.5,color:i===activeFilter?'white':seg.color}}>{seg.label}</span>
                <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:9,color:i===activeFilter?'rgba(255,255,255,0.9)':seg.color}}>{seg.labelTe}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Channel info */}
        <div style={{padding:'14px 18px',background:T.bg2,borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${T.red},#7A0010)`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,flexShrink:0,boxShadow:`0 4px 12px ${T.red}44`,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0,textAlign:'center',lineHeight:1.1,padding:'0 3px'}}>{channel.name||channel.name}</div>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18}}>{channel.name} News 24×7</div>
              <div style={{fontSize:11,color:channel.live?T.teal:T.gray1,display:'flex',alignItems:'center',gap:4}}>
                {channel.live ? <><LiveDot size={5}/> LIVE</> : 'LocalAI TV'}
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:20}}>
            {[{v:'3.4K',l:'Watching'},{v:'128',l:'Today'},{v:'4.8⭐',l:'Rating'}].map(s => (
              <div key={s.l}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:19}}>{s.v}</div>
                <div style={{fontSize:9,color:T.textMuted,textTransform:'uppercase',letterSpacing:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter content — LOCAL shows this district's previous bulletins from
            /api/bulletins; the other tabs are placeholders until the backend
            categorises bulletins by scope. */}
        <div style={{padding:'16px 18px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:17,color:T.text}}>
              📋 {BULLETIN_SEGS[activeFilter].label} — Previous Bulletins
            </div>
          </div>

          {activeFilter === 0 ? (
            bulletinsLoading ? (
              <div style={{textAlign:'center',padding:'28px 16px',color:T.textMuted,fontSize:13}}>Loading…</div>
            ) : localBulletins.length > 0 ? (
              localBulletins.map((b,i) => (
                <div key={b.id ?? i} onClick={()=>onOpenBulletin && onOpenBulletin(b.id)}
                  style={{display:'flex',gap:10,padding:'12px 0',borderBottom:`1px solid ${T.border}`,cursor:'pointer',alignItems:'center'}}>
                  <div style={{width:28,height:28,borderRadius:8,background:`rgba(208,2,27,0.15)`,color:T.red,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.65,marginBottom:4}}>{b.titleTe || b.titleEn}</div>
                    <div style={{fontSize:10,color:T.textMuted,display:'flex',gap:6,alignItems:'center'}}>
                      {b.broadcastTime && <><span style={{color:T.gold}}>{b.broadcastTime}</span><span>·</span></>}
                      <span>{b.channel}</span>
                    </div>
                  </div>
                  <div style={{flexShrink:0,width:30,height:30,borderRadius:'50%',background:`rgba(208,2,27,0.12)`,border:`1px solid rgba(208,2,27,0.3)`,color:T.red,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>▶</div>
                </div>
              ))
            ) : (
              <div style={{textAlign:'center',padding:'28px 16px',color:T.textMuted}}>
                <div style={{fontSize:32,marginBottom:8}}>📭</div>
                <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>No bulletins yet for {channel.name}</div>
                <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12}}>ఇంకా బులెటిన్‌లు లేవు</div>
              </div>
            )
          ) : (
            <div style={{textAlign:'center',padding:'28px 16px',color:T.textMuted}}>
              <div style={{fontSize:32,marginBottom:8}}>🗓️</div>
              <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>{BULLETIN_SEGS[activeFilter].label} — Coming soon</div>
              <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12}}>త్వరలో</div>
            </div>
          )}
        </div>
        <div style={{height:20}} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COMPLIANCE COMPONENTS — Apple App Store Guideline 4.2 / 5.1
// ══════════════════════════════════════════════════════════════


export { ChannelDetailScreen };
export default ChannelDetailScreen;
