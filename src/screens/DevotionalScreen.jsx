import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function DevotionalScreen({ onBack }) {
  const temples = [
    { name:'Srisailam Mallikarjuna', timings:'6:00 AM – 9:00 PM', today:'Abhishekam 7 AM', emoji:'🕌', dist:'Nandyal Dist.' },
    { name:'Mahanandi Temple',       timings:'5:00 AM – 9:30 PM', today:'Navagraha Pooja 8 AM', emoji:'🛕', dist:'Nandyal Dist.' },
    { name:'Yaganti Uma Maheshwara', timings:'6:00 AM – 8:00 PM', today:'Monday Special Pooja', emoji:'🕉️', dist:'Kurnool Dist.' },
    { name:'Ahobilam Narasimha',     timings:'6:00 AM – 8:30 PM', today:'Kalyanotsavam 10 AM', emoji:'🙏', dist:'Kurnool Dist.' },
    { name:'Mantralayam Raghavendra',timings:'6:00 AM – 9:00 PM', today:'Brindavana Pooja 7 AM', emoji:'✨', dist:'Kurnool Dist.' },
  ];
  const festivals = [
    { name:'Vaikunta Ekadasi',     date:'June 18', days:'43 days away', emoji:'🌺' },
    { name:'Srisailam Utsavam',    date:'June 22', days:'47 days away', emoji:'🎊' },
    { name:'Guru Purnima',         date:'July 10', days:'65 days away', emoji:'🌕' },
    { name:'Kurnool Temple Jatara',date:'July 15', days:'70 days away', emoji:'🎆' },
  ];
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.bg2,padding:'50px 18px 14px',flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20}}>🙏 Devotional</div>
            <div style={{fontSize:10,color:T.textMuted}}>Temples · Festivals · Daily Darshan</div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {/* Daily sloka */}
        <div style={{background:`linear-gradient(135deg,rgba(208,2,27,0.15),rgba(255,184,0,0.08))`,borderRadius:14,padding:'16px',border:`1px solid rgba(255,184,0,0.15)`,marginBottom:18,textAlign:'center'}}>
          <div style={{fontSize:10,color:T.gold,letterSpacing:2,marginBottom:8}}>✨ TODAY SLOKA</div>
          <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:15,fontWeight:700,color:T.text,lineHeight:1.8}}>
            "శుభం భవతు కళ్యాణం ఆరోగ్యం ధన సంపద<br/>శత్రు బుద్ధి వినాశాయ దీప జ్యోతి నమోస్తుతే"
          </div>
        </div>
        {/* Temple timings */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,marginBottom:10}}>🛕 Temple Timings Today</div>
        {temples.map((t,i)=>(
          <div key={i} style={{background:T.bg2,borderRadius:12,padding:'14px',marginBottom:8,border:`1px solid ${T.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{fontSize:28,flexShrink:0}}>{t.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{t.name}</div>
                <div style={{fontSize:11,color:T.gold,marginTop:2}}>⏰ {t.timings}</div>
                <div style={{fontSize:10,color:T.teal,marginTop:2}}>📅 {t.today}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{t.dist}</div>
              </div>
            </div>
          </div>
        ))}
        {/* Festivals */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,margin:'16px 0 10px'}}>🎊 Upcoming Festivals</div>
        {festivals.map((f,i)=>(
          <div key={i} style={{background:T.bg2,borderRadius:10,padding:'12px 14px',marginBottom:8,border:`1px solid ${T.border}`,display:'flex',alignItems:'center',gap:12}}>
            <div style={{fontSize:24}}>{f.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:T.text}}>{f.name}</div>
              <div style={{fontSize:11,color:T.gold}}>{f.date}</div>
            </div>
            <div style={{fontSize:10,color:T.textMuted}}>{f.days}</div>
          </div>
        ))}
        {/* Upload temple event */}
        <button onClick={()=>onNavigate&&onNavigate('newsupload')} style={{width:'100%',background:T.bg3,border:`1px dashed rgba(255,255,255,0.15)`,borderRadius:12,padding:'14px',color:T.textMuted,fontSize:13,cursor:'pointer',marginTop:8,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
          📷 Upload Temple Event / Darshan Photo
        </button>
      </div>
    </div>
  );
}

export { DevotionalScreen };
export default DevotionalScreen;
