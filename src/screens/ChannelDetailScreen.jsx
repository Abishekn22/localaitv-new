import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import { LiveDot } from './../components/atoms.jsx';

function ChannelDetailScreen({ channel, onBack, onOpenNews }) {
  const [activeSeg, setActiveSeg] = useState(0);
  const chNews = NEWS_ITEMS.filter(n => n.district === channel.name).concat(NEWS_ITEMS.slice(0,3));

  // Auto-advance bulletin segment every 4 seconds for demo
  useEffect(() => {
    const t = setInterval(() => setActiveSeg(s => (s + 1) % BULLETIN_SEGS.length), 4000);
    return () => clearInterval(t);
  }, []);

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
        {/* Video player */}
        <div style={{width:'100%',height:210,background:'#000',position:'relative'}}>
          <div style={{position:'absolute',inset:0,background:`linear-gradient(135deg,#1a0505,#050510)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:70,opacity:0.08}}>📺</div>
          {channel.live && <div style={{position:'absolute',top:12,left:12,background:T.red,borderRadius:4,padding:'3px 10px',fontSize:9,fontWeight:700,letterSpacing:2,display:'flex',alignItems:'center',gap:4}}><LiveDot size={5}/>LIVE</div>}
          <div style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.7)',color:T.text,fontSize:11,padding:'4px 10px',borderRadius:20}}>👁 3,421</div>
          <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:56,height:56,background:`rgba(208,2,27,0.9)`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,boxShadow:`0 0 30px ${T.red}55`,cursor:'pointer'}}>▶</div>
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:3,background:T.bg3}}>
            <div style={{height:'100%',width:'35%',background:T.red}} />
          </div>
        </div>

        {/* ── BULLETIN SEGMENT INDICATOR ─────────────────── */}
        <div style={{background:T.bg2,padding:'12px 14px',borderBottom:`1px solid ${T.border}`}}>

          {/* Segment label */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:BULLETIN_SEGS[activeSeg].color,animation:'blink 1s infinite'}}/>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:BULLETIN_SEGS[activeSeg].color,letterSpacing:1}}>
                NOW: {BULLETIN_SEGS[activeSeg].label}
              </span>
              <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12,lineHeight:1.65,fontWeight:700,color:BULLETIN_SEGS[activeSeg].color,opacity:0.8}}>

                {BULLETIN_SEGS[activeSeg].labelTe}
              </span>
            </div>
            <span style={{fontSize:10,color:T.textMuted}}>15 min bulletin</span>
          </div>

          {/* Segment progress strip */}
          <div style={{display:'flex',gap:3}}>
            {BULLETIN_SEGS.map((seg, i) => (
              <div
                key={i}
                onClick={() => setActiveSeg(i)}
                style={{
                  flex: seg.mins,
                  height: 28,
                  borderRadius: 6,
                  background: i === activeSeg ? seg.color : `${seg.color}22`,
                  border: `1px solid ${i === activeSeg ? seg.color : `${seg.color}44`}`,
                  display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                  cursor:'pointer',
                  transition:'all 0.3s ease',
                  position:'relative',
                  overflow:'hidden',
                }}
              >
                {/* Active segment fill animation */}
                {i === activeSeg && (
                  <div style={{position:'absolute',inset:0,background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)`,animation:'shimmer 1.5s infinite'}}/>
                )}
                <span style={{fontSize:7,fontWeight:800,letterSpacing:0.5,color:i===activeSeg?'white':seg.color}}>{seg.label}</span>
                <span style={{fontSize:6,color:i===activeSeg?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.3)'}}>{seg.mins}m</span>
              </div>
            ))}
          </div>

          {/* Mini progress bar inside active segment */}
          <div style={{marginTop:6,height:2,background:T.bg3,borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:'60%',background:BULLETIN_SEGS[activeSeg].color,borderRadius:2,transition:'width 4s linear'}}/>
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

        {/* Bulletins */}
        <div style={{padding:'16px 18px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:17}}>📋 Previous Bulletins</div>
            <span style={{fontSize:11,color:T.gold,fontWeight:600,cursor:'pointer'}}>See All →</span>
          </div>
          {chNews.slice(0,5).map((n,i) => (
            <div key={n.id} onClick={() => onOpenNews(n)} style={{display:'flex',gap:10,padding:'12px 0',borderBottom:`1px solid ${T.border}`,cursor:'pointer'}}>
              <div style={{width:28,height:28,borderRadius:8,background:`rgba(208,2,27,0.15)`,color:T.red,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:14,fontWeight:700,color:T.text,lineHeight:1.65,marginBottom:4}}>{n.title}</div>
                <div style={{fontSize:10,color:T.textMuted,display:'flex',gap:6}}>
                  <span style={{color:i<2?T.red:T.gold}}>{['8:05 PM','6:30 PM','4:15 PM','2:00 PM','11:30 AM'][i]}</span>
                  <span>·</span>
                  <span>{n.views} views</span>
                </div>
              </div>
            </div>
          ))}
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
