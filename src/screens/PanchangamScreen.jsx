import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function PanchangamScreen({ onBack }) {
  const today = new Date();
  const panch = {
    tithi: 'ద్వాదశి (Dwadashi)',
    nakshatra: 'పుష్యమి (Pushyami)',
    yoga: 'సిద్ధి (Siddhi)',
    karana: 'బాలవ (Balava)',
    var: 'బుధవారం (Wednesday)',
    sunrise: '6:02 AM', sunset: '6:31 PM',
    rahukalam: '12:00 PM – 1:30 PM',
    yamagandam: '7:30 AM – 9:00 AM',
    gulika: '10:30 AM – 12:00 PM',
    abhijit: '11:48 AM – 12:36 PM',
    shubha: '9:00 AM – 10:30 AM',
    festivals: ['ఏకాదశి (Ekadashi) పారణ', 'ప్రదోష వ్రతం'],
  };
  const SRow = ({icon,label,value,good,bad}) => (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'11px 0',borderBottom:`1px solid ${T.border}`}}>
      <span style={{fontSize:18,width:28,flexShrink:0}}>{icon}</span>
      <div style={{flex:1}}>
        <div style={{fontSize:10,color:T.textMuted,marginBottom:1}}>{label}</div>
        <div style={{fontSize:13,fontWeight:600,color:T.text}}>{value}</div>
      </div>
      {good&&<span style={{background:'rgba(0,208,104,0.15)',color:T.green,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:6}}>SHUBHA</span>}
      {bad&&<span style={{background:'rgba(208,2,27,0.15)',color:T.red,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:6}}>AVOID</span>}
    </div>
  );
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#4a1a00,#8b3a00,#4a1a00)',padding:'48px 18px 16px',flexShrink:0}}>
        <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',marginBottom:10}}>←</button>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:36}}>🪔</span>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>నిత్య పంచాంగం</div>
            <div style={{fontSize:11,color:'rgba(255,200,100,0.8)',marginTop:2}}>Daily Panchangam · {today.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
        {/* Sun times */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {[{icon:'🌅',label:'Sunrise · సూర్యోదయం',val:panch.sunrise},{icon:'🌇',label:'Sunset · సూర్యాస్తమయం',val:panch.sunset}].map(s=>(
            <div key={s.label} style={{background:'linear-gradient(135deg,rgba(255,140,0,0.15),rgba(255,140,0,0.05))',border:'1px solid rgba(255,140,0,0.2)',borderRadius:12,padding:'14px',textAlign:'center'}}>
              <div style={{fontSize:28,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:20,color:T.gold}}>{s.val}</div>
              <div style={{fontSize:9,color:T.textMuted,marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Panchangam details */}
        <div style={{background:T.bg3,borderRadius:14,padding:'4px 16px',marginBottom:16,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
          <SRow icon="🌙" label="తిథి · Tithi"       value={panch.tithi}     good />
          <SRow icon="⭐" label="నక్షత్రం · Nakshatra" value={panch.nakshatra}  good />
          <SRow icon="🔮" label="యోగం · Yoga"        value={panch.yoga}      good />
          <SRow icon="🌿" label="కరణం · Karana"      value={panch.karana} />
          <SRow icon="📅" label="వారం · Vara"        value={panch.var} />
        </div>
        {/* Muhurtam timings */}
        <div style={{background:T.bg3,borderRadius:14,padding:'4px 16px',marginBottom:16,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.gold,padding:'12px 0 8px',letterSpacing:0.5}}>⏱ నిషిద్ధ కాలాలు · Inauspicious Times</div>
          <SRow icon="🚫" label="రాహుకాలం · Rahukalam"  value={panch.rahukalam}  bad />
          <SRow icon="⚠️" label="యమగండం · Yamagandam"   value={panch.yamagandam} bad />
          <SRow icon="⚠️" label="గుళికకాలం · Gulika"    value={panch.gulika}     bad />
          <SRow icon="✅" label="అభిజిత్ · Abhijit"     value={panch.abhijit}    good />
          <SRow icon="✅" label="శుభ కాలం · Shubha"     value={panch.shubha}     good />
        </div>
        {/* Festivals */}
        <div style={{background:'rgba(255,140,0,0.08)',border:'1px solid rgba(255,140,0,0.2)',borderRadius:14,padding:'14px 16px',marginBottom:20}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.gold,marginBottom:10}}>🎊 నేటి పండుగలు · Today's Festivals</div>
          {panch.festivals.map((f,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{color:T.gold,fontSize:12}}>•</span>
              <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:14,lineHeight:1.65,fontWeight:700,color:T.text}}>{f}</span>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export { PanchangamScreen };
export default PanchangamScreen;
