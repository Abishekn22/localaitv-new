import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import { LocationPin } from './../components/atoms.jsx';

function LocationPickerScreen({ onDone }) {
  const [state, setState] = useState('AP');
  const [sel,   setSel]   = useState(null);

  const AP_LIVE = [
    { en:'Kurnool',    te:'కర్నూలు'   },
    { en:'Guntur',     te:'గుంటూరు'   },
    { en:'Nellore',    te:'నెల్లూరు'  },
    { en:'Kakinada',   te:'కాకినాడ'   },
    { en:'Tirupati',   te:'తిరుపతి'   },
  ];
  const TG_LIVE = [
    { en:'Khammam',    te:'ఖమ్మం'     },
    { en:'Karimnagar', te:'కరీంనగర్'  },
    { en:'Warangal',   te:'వరంగల్'    },
    { en:'Nalgonda',   te:'నల్గొండ'   },
  ];
  const list = state === 'AP' ? AP_LIVE : TG_LIVE;

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',
      background:'linear-gradient(180deg,#04051a 0%,#080c24 60%,#030510 100%)'}}>

      {/* Header */}
      <div style={{padding:'56px 22px 20px',flexShrink:0}}>
        {/* Pin hero */}
        <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
          <LocationPin size={52} glow/>
        </div>
        {/* Title */}
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,fontSize:22,
            color:'white',lineHeight:1.5,marginBottom:6}}>
            మీ నియోజకవర్గం ఎంచుకోండి
          </div>
          <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:13,
            color:'rgba(255,184,0,0.85)',lineHeight:1.6}}>
            లైవ్ చానల్ చూడడానికి మీ ప్రాంతాన్ని ఎంచుకోండి
          </div>
        </div>
        {/* State toggle — Telugu */}
        <div style={{display:'flex',gap:10}}>
          {[
            {id:'AP', te:'ఆంధ్రప్రదేశ్', count:5},
            {id:'TG', te:'తెలంగాణ',       count:4},
          ].map(s=>(
            <button key={s.id} onClick={()=>{setState(s.id);setSel(null);}}
              style={{flex:1,padding:'14px 10px',borderRadius:16,
                background:state===s.id?'linear-gradient(135deg,#D0021B,#7A0010)':'rgba(255,255,255,0.06)',
                border:state===s.id?'1.5px solid rgba(208,2,27,0.6)':'1.5px solid rgba(255,255,255,0.1)',
                cursor:'pointer',transition:'all 0.25s',
                display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <LocationPin size={state===s.id?20:16}/>
              <div style={{textAlign:'left'}}>
                <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,
                  fontSize:state===s.id?15:13,lineHeight:1.4,
                  color:state===s.id?'white':'rgba(255,255,255,0.65)'}}>
                  {s.te}
                </div>
                <div style={{fontSize:10,letterSpacing:0.5,fontFamily:"'Barlow Condensed',sans-serif",
                  color:state===s.id?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.35)',marginTop:1}}>
                  {s.count} live channels
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{flex:1,overflowY:'auto',padding:'4px 18px 16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,padding:'0 2px'}}>
          <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>
          <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12,lineHeight:1.65,
            color:'rgba(255,184,0,0.7)',fontWeight:600}}>లైవ్ ఛానెల్‌లు</span>
          <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>
        </div>
        {list.map(c=>{
          const isSel = sel && sel.en===c.en;
          return (
            <div key={c.en} onClick={()=>setSel(c)}
              style={{display:'flex',alignItems:'center',gap:14,padding:'16px 18px',marginBottom:10,
                borderRadius:18,cursor:'pointer',transition:'all 0.2s',
                background:isSel?'linear-gradient(135deg,rgba(208,2,27,0.25),rgba(208,2,27,0.12))':'rgba(255,255,255,0.05)',
                border:`1.5px solid ${isSel?'rgba(208,2,27,0.55)':'rgba(255,255,255,0.08)'}`,
                boxShadow:isSel?'0 4px 20px rgba(208,2,27,0.2)':'none'}}>
              <div style={{flexShrink:0,filter:isSel?'drop-shadow(0 2px 6px rgba(208,2,27,0.6))':'none'}}>
                <LocationPin size={isSel?30:24}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,fontSize:18,
                  lineHeight:1.5,color:isSel?'white':'rgba(255,255,255,0.9)',display:'flex',alignItems:'baseline',gap:5}}>
                  {c.te}
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,
                    fontSize:15,letterSpacing:0.5,color:isSel?'rgba(255,255,255,0.9)':'rgba(255,184,0,0.85)'}}>TV</span>
                </div>

              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5,flexShrink:0}}>
                <div style={{display:'flex',alignItems:'center',gap:4,
                  background:'rgba(0,200,90,0.15)',borderRadius:6,padding:'3px 8px',
                  border:'1px solid rgba(0,200,90,0.3)'}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite'}}/>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,
                    fontSize:9,color:'#00C85A',letterSpacing:1}}>LIVE</span>
                </div>
                {isSel&&(
                  <div style={{width:22,height:22,borderRadius:'50%',background:'#D0021B',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'white'}}>✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm */}
      <div style={{padding:'14px 18px 40px',background:'rgba(0,0,0,0.4)',
        borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <button onClick={()=>sel&&onDone(sel.en,state)} disabled={!sel}
          style={{width:'100%',borderRadius:16,padding:'17px',border:'none',
            background:sel?'linear-gradient(135deg,#D0021B,#7A0010)':'rgba(255,255,255,0.08)',
            color:sel?'white':'rgba(255,255,255,0.3)',
            fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,fontSize:17,
            cursor:sel?'pointer':'not-allowed',
            boxShadow:sel?'0 8px 28px rgba(208,2,27,0.45)':'none',transition:'all 0.3s'}}>
          {sel?`${sel.te} TV చూడండి →`:'నియోజకవర్గం ఎంచుకోండి'}
        </button>
      </div>
    </div>
  );
}



export { LocationPickerScreen };
export default LocationPickerScreen;
