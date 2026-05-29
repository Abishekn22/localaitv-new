import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';

function UtilityScreen({ onBack, onNavigate, constituency, initialTab='veg' }) {
  const { T } = useAppTheme();
  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState(initialTab);

  const VEG_FALLBACK = [
    { item:'టమాట (Tomato)',       unit:'per kg',     trend:'↑', up:true  },
    { item:'వంకాయ (Brinjal)',      unit:'per kg',     trend:'↓', up:false },
    { item:'మిరపకాయ (Chilli)',     unit:'per kg',     trend:'↑', up:true  },
    { item:'బంగాళాదుంప (Potato)',  unit:'per kg',     trend:'→', up:null  },
    { item:'ఉల్లిపాయ (Onion)',     unit:'per kg',     trend:'↑', up:true  },
    { item:'కూరగాయలు (Greens)',    unit:'per bundle', trend:'↓', up:false },
  ];
  const TRAIN_FALLBACK = [
    { name:'Rayalaseema Express', number:'17429', from:'Kurnool City', to:'Hyderabad', dep:'06:15', arr:'11:45' },
    { name:'Sabari Express',       number:'17643', from:'Kurnool City', to:'Tirupati',  dep:'14:20', arr:'19:30' },
    { name:'Krishnavenni Exp',     number:'17211', from:'Kurnool City', to:'Chennai',   dep:'22:10', arr:'06:30' },
    { name:'Nandyal Passenger',    number:'77680', from:'Kurnool',      to:'Nandyal',   dep:'08:00', arr:'10:45' },
  ];

  const { data: vegPrices  } = useAPI(
    () => apiCall(`/utility/veg-prices?district=${encodeURIComponent(constituency||'Kurnool')}&date=${today}`).then(d => d.items || d),
    VEG_FALLBACK, [constituency]
  );
  const { data: trains } = useAPI(
    () => apiCall(`/utility/trains?from=${encodeURIComponent(constituency||'Kurnool')}`).then(d => d.items || d),
    TRAIN_FALLBACK, [constituency]
  );

  const tabs = [
    {id:'veg',     label:'🥦 Vegetables'},
    {id:'train',   label:'🚂 Trains'},
    {id:'bullion', label:'💰 Bullion'},
    {id:'weather', label:'🌤️ Weather'},
  ];
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.bg2,padding:'50px 18px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20}}>📊 Utility Info</div>
            <div style={{fontSize:10,color:T.textMuted}}>{constituency} · Updated daily</div>
          </div>
        </div>
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${T.border}`}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:'none',color:tab===t.id?'white':T.gray1,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:tab===t.id?700:400,fontSize:11,padding:'10px 2px',borderBottom:tab===t.id?`2px solid ${T.red}`:'2px solid transparent',cursor:'pointer'}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {tab==='veg'&&(
          <>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>Kurnool APMC Market · Today May 6, 2026</div>
            {vegPrices.map((v,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',background:T.bg2,borderRadius:10,padding:'12px 14px',marginBottom:8,border:`1px solid ${T.border}`}}>
                <div style={{flex:1,fontSize:13,color:T.text}}>{v.item}</div>
                <div style={{fontSize:10,color:T.textMuted,marginRight:6}}>{v.unit}</div>
                <div style={{fontSize:14,color:v.up===true?T.red:v.up===false?T.green:T.gray1}}>{v.trend}</div>
              </div>
            ))}
            <button onClick={()=>onNavigate&&onNavigate('vegpriceform')} style={{width:'100%',background:`linear-gradient(135deg,#166534,#16a34a)`,border:'none',borderRadius:12,padding:'14px',color:T.text,fontWeight:800,fontSize:15,cursor:'pointer',marginTop:6,letterSpacing:0.5}}>
              🥦 Submit Today's Prices
            </button>
          </>
        )}
        {tab==='train'&&(
          <>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>{constituency||'Kurnool'} Railway Station · Today</div>
            {trains.map((t,i)=>(
              <div key={i} style={{background:T.bg2,borderRadius:12,padding:'14px',marginBottom:10,border:`1px solid ${T.border}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text}}>{t.name}</div>
                  <div style={{fontSize:10,color:T.textMuted,background:T.bg3,borderRadius:4,padding:'2px 6px'}}>{t.number}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:800,color:T.teal}}>{t.dep}</div>
                    <div style={{fontSize:10,color:T.textMuted}}>{t.from}</div>
                  </div>
                  <div style={{flex:1,height:1,background:T.bg3,position:'relative'}}>
                    <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:12}}>🚂</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    {t.arr
                      ? <div style={{fontSize:18,fontWeight:800,color:T.gold}}>{t.arr}</div>
                      : <div style={{fontSize:14,fontWeight:800,color:T.gold}}>{t.to}</div>}
                    <div style={{fontSize:10,color:T.textMuted}}>
                      {t.arr
                        ? t.to
                        : (Array.isArray(t.days) && t.days.length
                            ? (t.days.length >= 7 ? 'Daily' : t.days.join(', '))
                            : (t.type || ''))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {tab==='bullion'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>
              {constituency} Bullion Market · Today {new Date().toLocaleDateString('en-IN')}
            </div>
            {[
              {label:'🪙 Gold (24K)',    value:'₹73,450', unit:'per 10g',  change:'+₹120', up:true,  color:'#B8860B'},
              {label:'🪙 Gold (22K)',    value:'₹67,330', unit:'per 10g',  change:'+₹110', up:true,  color:'#B8860B'},
              {label:'🥈 Silver',        value:'₹84,200', unit:'per kg',   change:'-₹80',  up:false, color:'#888'},
              {label:'⛽ Petrol',        value:'₹103.50', unit:'per litre', change:'—',     up:null,  color:T.red},
              {label:'🛢️ Diesel',        value:'₹91.20',  unit:'per litre', change:'—',     up:null,  color:'#F57F17'},
              {label:'🍳 LPG Cylinder',  value:'₹803.00', unit:'per 14kg', change:'—',     up:null,  color:T.teal},
            ].map((r,i)=>(
              <div key={i} style={{background:T.bg2,borderRadius:12,padding:'16px',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:T.isDark?'none':`0 2px 6px ${T.shadow}`}}>
                <div>
                  <div style={{fontSize:14,color:T.text,fontWeight:600}}>{r.label}</div>
                  <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{r.unit}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:18,fontWeight:800,color:r.color}}>{r.value}</div>
                  {r.change !== '—' && (
                    <div style={{fontSize:10,color:r.up?T.green:T.red,fontWeight:600}}>{r.change} today</div>
                  )}
                </div>
              </div>
            ))}
            <div style={{fontSize:10,color:T.textMuted,textAlign:'center',marginTop:4}}>
              Indicative rates only. Please verify at local bullion dealer.
            </div>
          </div>
        )}
        {tab==='weather'&&(
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <div style={{background:`linear-gradient(135deg,#0d2a6e,#06153a)`,borderRadius:16,padding:'20px',border:`1px solid rgba(100,150,255,0.2)`,textAlign:'center'}}>
              <div style={{fontSize:56}}>☀️</div>
              <div style={{fontSize:48,fontWeight:800,marginTop:4}}>38°C</div>
              <div style={{fontSize:13,color:T.textMuted}}>Sunny · {constituency}</div>
              <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>Feels like 41°C · Humidity 42%</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {[
                {label:'Wind',   value:'12 km/h', icon:'💨'},
                {label:'UV',     value:'Very High',icon:'☀️'},
                {label:'Sunrise',value:'06:02 AM', icon:'🌅'},
                {label:'Sunset', value:'06:38 PM', icon:'🌇'},
              ].map((w,i)=>(
                <div key={i} style={{background:T.bg2,borderRadius:10,padding:'12px',border:`1px solid ${T.border}`,textAlign:'center'}}>
                  <div style={{fontSize:20}}>{w.icon}</div>
                  <div style={{fontSize:14,fontWeight:700,color:T.text,marginTop:4}}>{w.value}</div>
                  <div style={{fontSize:10,color:T.textMuted}}>{w.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav active="local" onChange={onNavigate} />
    </div>
  );
}

export { UtilityScreen };
export default UtilityScreen;
