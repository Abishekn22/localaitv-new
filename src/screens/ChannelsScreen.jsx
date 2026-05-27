import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import { LocationPin } from './../components/atoms.jsx';

function ChannelsScreen({ onNavigate, onOpenChannel }) {
  const { T } = useAppTheme();
  const [state, setState] = useState('AP');

  const AP_TV = [
    { id:'kur', en:'Kurnool',    te:'కర్నూలు',   viewers:1842, ytId:'BTRyZDiLbEE' },
    { id:'gun', en:'Guntur',     te:'గుంటూరు',   viewers:2103, ytId:'FWilVnvR0Es'  },
    { id:'nel', en:'Nellore',    te:'నెల్లూరు',  viewers:1247, ytId:'BTRyZDiLbEE' },
    { id:'kak', en:'Kakinada',   te:'కాకినాడ',   viewers:983,  ytId:'2qyb8WBP75c'  },
    { id:'tpt', en:'Tirupati',   te:'తిరుపతి',   viewers:1534, ytId:'ahb4disXmOU'  },
  ];
  const TG_TV = [
    { id:'khm', en:'Khammam',    te:'ఖమ్మం',     viewers:1621, ytId:'2qyb8WBP75c'  },
    { id:'kar', en:'Karimnagar', te:'కరీంనగర్',  viewers:1842, ytId:'t7OrzwZW-ss'  },
    { id:'war', en:'Warangal',   te:'వరంగల్',    viewers:1387, ytId:'h_VEIP5tSxc'  },
    { id:'nal', en:'Nalgonda',   te:'నల్గొండ',   viewers:798,  ytId:'PMzf6Tnyd-o'  },
  ];
  const list = state === 'AP' ? AP_TV : TG_TV;
  const totalViewers = list.reduce((s,c)=>s+c.viewers,0);

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* Header */}
      <div style={{background:T.isDark?'linear-gradient(135deg,#0a1628,#1a2a4a)':T.bg2,
        padding:'52px 18px 16px',borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
          <LocationPin size={26} glow/>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:26,
              letterSpacing:1,color:T.text}}>LIVE TV</div>
            <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12,lineHeight:1.65,
              color:T.textMuted}}>లైవ్ టీవీ · {list.length} channels · {totalViewers.toLocaleString()} viewers</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(208,2,27,0.12)',
            borderRadius:8,padding:'5px 10px',border:'1px solid rgba(208,2,27,0.25)'}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:T.red,animation:'blink 1s infinite'}}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:10,
              color:T.red,letterSpacing:1}}>LIVE</span>
          </div>
        </div>
        {/* State toggle — Telugu */}
        <div style={{display:'flex',gap:8}}>
          {[
            {id:'AP',te:'ఆంధ్రప్రదేశ్',count:5},
            {id:'TG',te:'తెలంగాణ',count:4},
          ].map(s=>(
            <button key={s.id} onClick={()=>setState(s.id)}
              style={{flex:1,padding:'12px 8px',borderRadius:14,cursor:'pointer',transition:'all 0.2s',
                background:state===s.id?`linear-gradient(135deg,${T.red},#7A0010)`:T.bg3,
                color:state===s.id?'white':T.textMuted,
                border:`1.5px solid ${state===s.id?T.red:T.border}`,
                display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <LocationPin size={state===s.id?18:14}/>
              <div style={{textAlign:'left'}}>
                <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,fontSize:13,lineHeight:1.4}}>
                  {s.te}
                </div>
                <div style={{fontSize:9,opacity:0.7,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>
                  {s.count} LIVE
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Channel list */}
      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 120px'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
          <div style={{width:8,height:8,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite',boxShadow:'0 0 8px #00C85A'}}/>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:13,
            color:'#00C85A',letterSpacing:1.5}}>LIVE NOW — {list.length} CHANNELS</span>
          <div style={{flex:1,height:1,background:T.border}}/>
          <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:11,lineHeight:1.65,color:T.textMuted}}>లైవ్ టీవీ</span>
        </div>

        {list.map(c=>{
          const waMsg = encodeURIComponent(`📺 Watch ${c.en} TV live!\n📱 Download: https://localaitv.com/app`);
          return (
            <div key={c.id}
              onClick={()=>onOpenChannel({id:c.id,name:c.te,nameEn:c.en,code:c.en.slice(0,3).toUpperCase()+'TV',
                live:true,viewers:c.viewers,dist:c.dist,ytId:c.ytId})}
              style={{display:'flex',alignItems:'center',gap:14,padding:'16px',marginBottom:12,
                borderRadius:18,background:T.bg2,border:`1.5px solid ${T.border}`,cursor:'pointer',
                transition:'all 0.2s',boxShadow:T.isDark?'none':`0 2px 10px ${T.shadow}`}}
              onTouchStart={e=>e.currentTarget.style.transform='scale(0.97)'}
              onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}>
              <div style={{flexShrink:0}}>
                <LocationPin size={32} glow/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:3}}>
                  <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontWeight:700,
                    fontSize:18,lineHeight:1.5,color:T.text}}>{c.te}</span>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,
                    fontSize:11,color:T.textMuted}}>TV</span>
                </div>

                <div style={{display:'flex',alignItems:'center',gap:4}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:'#00C85A',animation:'blink 1s infinite'}}/>
                  <span style={{fontSize:10,color:'#00C85A',fontWeight:600,fontFamily:"'Barlow Condensed',sans-serif"}}>
                    {c.viewers.toLocaleString()} watching now
                  </span>
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
                <span style={{background:T.red,color:'white',fontSize:8,fontWeight:800,
                  letterSpacing:1.5,padding:'3px 8px',borderRadius:5}}>LIVE</span>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={e=>{e.stopPropagation();window.open(`https://api.whatsapp.com/send?text=${waMsg}`,'_blank');}}
                    style={{width:30,height:30,borderRadius:8,background:'#25d366',border:'none',
                      display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14}}>
                    💬
                  </button>
                  <div style={{width:30,height:30,borderRadius:8,background:`rgba(208,2,27,0.15)`,
                    border:`1px solid rgba(208,2,27,0.3)`,
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>▶</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Channel Partner CTA */}
        <div onClick={()=>onNavigate('channelpartner')}
          style={{marginTop:8,background:`linear-gradient(135deg,rgba(255,184,0,0.1),rgba(255,184,0,0.04))`,
            border:`1px solid rgba(255,184,0,0.28)`,borderRadius:18,padding:'18px',
            cursor:'pointer',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:32,flexShrink:0}}>
            <LocationPin size={32} gold/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,
              color:T.gold,marginBottom:3}}>Launch Your Town Channel</div>
            <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:12,lineHeight:1.65,color:T.textMuted}}>
              మీ నియోజకవర్గం ఛానెల్ ప్రారంభించండి
            </div>
          </div>
          <span style={{background:T.gold,color:'#000',fontSize:10,fontWeight:800,
            padding:'6px 12px',borderRadius:8,flexShrink:0}}>APPLY</span>
        </div>
      </div>

      <BottomNav active="channels" onChange={onNavigate} />
    </div>
  );
}


export { ChannelsScreen };
export default ChannelsScreen;
