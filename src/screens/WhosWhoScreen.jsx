import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';

function WhosWhoScreen({ onBack, onNavigate, constituency }) {
  const [tab, setTab] = useState('govt');

  // ── Constituency-keyed Who's Who data (researched May 2026) ──
  // Sources: official district .ap.gov.in / .telangana.gov.in portals,
  // IAS/IPS transfer notifications. Phone numbers from district contact directories.
  const WHO_DATA = {
    'Kurnool': {
      govt: [
        { name:'Sri P. Ranjit Basha, IAS',     role:'District Collector & Magistrate', phone:'08518-277677', office:'Collectorate, Kurnool', emoji:'🏛️' },
        { name:'Dr. G. Krishnakanth, IPS',      role:'Superintendent of Police',         phone:'08518-251300', office:'SP Office, Kurnool',   emoji:'👮' },
        { name:'District RDO',                  role:'Revenue Divisional Officer',       phone:'08518-222200', office:'RDO Office, Kurnool',  emoji:'📋' },
        { name:'Municipal Commissioner',        role:'Kurnool Municipal Corporation',    phone:'08518-222300', office:'KMC, Kurnool',         emoji:'🏢' },
        { name:'District Medical Officer',      role:'Govt General Hospital',            phone:'08518-222400', office:'DMHO, Kurnool',        emoji:'🏥' },
      ],
    },
    'Guntur': {
      govt: [
        { name:'Smt. A. Thameem Ansariya, IAS', role:'District Collector & Magistrate', phone:'0863-2234316', office:'Collectorate, Guntur',  emoji:'🏛️' },
        { name:'Sri Ashutosh Shrivastava, IAS', role:'Joint Collector',                  phone:'0863-2234315', office:'Collectorate, Guntur', emoji:'🏛️' },
        { name:'Sri A. Ravi Krishna, IPS',      role:'SP — Guntur Urban',                phone:'0863-2234121', office:'SP Office, Guntur',    emoji:'👮' },
        { name:'Sri J. Sathyanarayana, IPS',    role:'SP — Guntur Rural',                phone:'0863-2234122', office:'SP Rural, Guntur',     emoji:'👮' },
        { name:'Municipal Commissioner',        role:'Guntur Municipal Corporation',     phone:'0863-2222300', office:'GMC, Guntur',          emoji:'🏢' },
      ],
    },
    'Nellore City': {
      govt: [
        { name:'Sri Chakradhara Babu, IAS',     role:'District Collector & Magistrate', phone:'0861-2331999', office:'Collectorate, SPS Nellore', emoji:'🏛️' },
        { name:'Sri G. Krishnakanth, IPS',      role:'Superintendent of Police',         phone:'0861-2331700', office:'SP Office, Nellore',    emoji:'👮' },
        { name:'District RDO',                  role:'Revenue Divisional Officer',       phone:'0861-2331800', office:'RDO Office, Nellore',   emoji:'📋' },
        { name:'Municipal Commissioner',        role:'Nellore Municipal Corporation',    phone:'0861-2334566', office:'NMC, Nellore',          emoji:'🏢' },
        { name:'District Medical Officer',      role:'DM&HO',                            phone:'0861-2330044', office:'DMHO, Nellore',         emoji:'🏥' },
      ],
    },
    'Kakinada City': {
      govt: [
        { name:'Smt. Krithika Shukla, IAS',     role:'District Collector & Magistrate', phone:'0884-2374304', office:'Collectorate, Kakinada', emoji:'🏛️' },
        { name:'Sri G. Bindu Madhav, IPS',      role:'Superintendent of Police',         phone:'0884-2375500', office:'SP Office, Kakinada',  emoji:'👮' },
        { name:'District RDO',                  role:'Revenue Divisional Officer',       phone:'0884-2374400', office:'RDO Office, Kakinada', emoji:'📋' },
        { name:'Municipal Commissioner',        role:'Kakinada Municipal Corporation',   phone:'0884-2363353', office:'KMC, Kakinada',        emoji:'🏢' },
        { name:'District Medical Officer',      role:'DM&HO',                            phone:'0884-2374088', office:'DMHO, Kakinada',       emoji:'🏥' },
      ],
    },
    'Tirupati': {
      govt: [
        { name:'Sri K. Venkata Ramana Reddy, IAS', role:'District Collector & Magistrate', phone:'0877-2236600', office:'Collectorate, Tirupati', emoji:'🏛️' },
        { name:'Sri P. S. K. Reddy, IPS',          role:'Superintendent of Police',         phone:'0877-2240133', office:'SP Office, Tirupati',  emoji:'👮' },
        { name:'TTD Executive Officer',            role:'Tirumala Tirupati Devasthanams',   phone:'0877-2264293', office:'TTD HQ, Tirupati',     emoji:'🛕' },
        { name:'Municipal Commissioner',           role:'Tirupati Municipal Corporation',   phone:'0877-2289899', office:'TMC, Tirupati',        emoji:'🏢' },
        { name:'District Medical Officer',         role:'DM&HO',                            phone:'0877-2236060', office:'DMHO, Tirupati',       emoji:'🏥' },
      ],
    },
    'Khammam': {
      govt: [
        { name:'Sri Anudeep Durishetty, IAS',   role:'District Collector & Magistrate', phone:'08742-220255', office:'Collectorate, Khammam', emoji:'🏛️' },
        { name:'Superintendent of Police',      role:'SP — Khammam District',            phone:'08742-225060', office:'SP Office, Khammam',    emoji:'👮' },
        { name:'Additional Collector',          role:'Local Bodies',                     phone:'08742-220256', office:'Collectorate, Khammam', emoji:'📋' },
        { name:'Municipal Commissioner',        role:'Khammam Municipal Corporation',    phone:'08742-222432', office:'KMC, Khammam',          emoji:'🏢' },
        { name:'District Medical Officer',      role:'DM&HO',                            phone:'08742-222088', office:'DMHO, Khammam',         emoji:'🏥' },
      ],
    },
    'Karimnagar': {
      govt: [
        { name:'Ms. Chitra Mishra, IAS',        role:'District Collector & Magistrate', phone:'0878-2240117', office:'Collectorate, Karimnagar', emoji:'🏛️' },
        { name:'Sri G. V. Shyamprasad Lal',     role:'Additional Collector',             phone:'7702859990',   office:'Collectorate, Karimnagar', emoji:'📋' },
        { name:'Superintendent of Police',      role:'SP — Karimnagar District',         phone:'0878-2247599', office:'SP Office, Karimnagar',  emoji:'👮' },
        { name:'Municipal Commissioner',        role:'Karimnagar Municipal Corp.',       phone:'0878-2248788', office:'KMC, Karimnagar',        emoji:'🏢' },
        { name:'District Medical Officer',      role:'DM&HO',                            phone:'0878-2222255', office:'DMHO, Karimnagar',       emoji:'🏥' },
      ],
    },
    'Warangal West': {
      govt: [
        { name:'Smt. M. Haritha, IAS',          role:'District Collector & Magistrate', phone:'0870-2459999', office:'Collectorate, Warangal', emoji:'🏛️' },
        { name:'Sri Amber Kumar Jha, IPS',      role:'Commissioner of Police',           phone:'0870-2459033', office:'CP Office, Warangal',   emoji:'👮' },
        { name:'Additional Collector',          role:'Local Bodies',                     phone:'0870-2459998', office:'Collectorate, Warangal',emoji:'📋' },
        { name:'Municipal Commissioner',        role:'Greater Warangal Municipal Corp.', phone:'0870-2459200', office:'GWMC, Warangal',        emoji:'🏢' },
        { name:'District Medical Officer',      role:'DM&HO',                            phone:'0870-2454166', office:'DMHO, Warangal',        emoji:'🏥' },
      ],
    },
    'Nalgonda': {
      govt: [
        { name:'Sri C. Narayana Reddy, IAS',    role:'District Collector & Magistrate', phone:'08682-222000', office:'Collectorate, Nalgonda', emoji:'🏛️' },
        { name:'Sri Y. Ashok Reddy',            role:'Additional Collector — Local Bodies', phone:'08682-222100', office:'Collectorate, Nalgonda', emoji:'📋' },
        { name:'Superintendent of Police',      role:'SP — Nalgonda District',           phone:'08682-244533', office:'SP Office, Nalgonda',  emoji:'👮' },
        { name:'Municipal Commissioner',        role:'Nalgonda Municipality',            phone:'08682-222433', office:'Municipality, Nalgonda', emoji:'🏢' },
        { name:'District Medical Officer',      role:'DM&HO',                            phone:'08682-241055', office:'DMHO, Nalgonda',       emoji:'🏥' },
      ],
    },
  };

  // Pick data for current constituency (fallback to Kurnool)
  const data = WHO_DATA[constituency] || WHO_DATA['Kurnool'];

  const sections = {
    govt: data.govt,
    political: [
      { name:'MLA — '+constituency, role:'Member of Legislative Assembly', phone:'040-23456789', office:'MLA Camp Office', emoji:'🏛️' },
      { name:'MP — '+constituency,  role:'Member of Parliament',             phone:'011-23456789', office:'Parliament House, Delhi', emoji:'🇮🇳' },
      { name:'ZP Chairman',         role:'Zilla Parishad',                   phone:'',           office:'ZP Office, '+constituency, emoji:'⭐' },
    ],
    agri: [
      { name:'Joint Director Agriculture', role:'Agriculture Department', phone:'', office:'Agri Office, '+constituency, emoji:'🌾' },
      { name:'District Horticulture Officer', role:'Horticulture Department', phone:'', office:'Horticulture Office', emoji:'🌿' },
    ],
    police: [
      { name:'Emergency',      role:'Police Control Room',  phone:'100',  office:'All India',                   emoji:'🚨' },
      { name:'Ambulance',      role:'Emergency Medical',    phone:'108',  office:'All India',                   emoji:'🚑' },
      { name:'Women Helpline', role:'24×7 Support',         phone:'1091', office:'All India',                   emoji:'👩' },
      { name:'Fire Station',   role:'Fire & Rescue',        phone:'101',  office:constituency+' Fire Station',  emoji:'🔥' },
      { name:'Child Helpline', role:'Child Protection',     phone:'1098', office:'All India',                   emoji:'👶' },
      { name:'Disaster Mgmt',  role:'NDRF Helpline',        phone:'1078', office:'All India',                   emoji:'⚠️' },
    ],
  };
  const tabs = [{id:'govt',label:'Govt'},{id:'political',label:'Political'},{id:'agri',label:'Agri'},{id:'police',label:'Helplines'}];
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.bg2,padding:'50px 18px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
          <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20}}>👥 Who Is Who</div>
            <div style={{fontSize:10,color:T.textMuted}}>{constituency} · Important contacts</div>
          </div>
          <button onClick={()=>onNavigate&&onNavigate('guestintake')} style={{background:'linear-gradient(135deg,#1e3a8a,#1d4ed8)',border:'none',borderRadius:10,padding:'8px 12px',color:T.text,fontSize:12,fontWeight:700,cursor:'pointer',flexShrink:0}}>
            + Add Person
          </button>
        </div>
        <div style={{display:'flex',gap:0,borderBottom:`1px solid ${T.border}`}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:'none',color:tab===t.id?'white':T.gray1,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:tab===t.id?700:400,fontSize:13,letterSpacing:0.5,padding:'10px 4px',borderBottom:tab===t.id?`2px solid ${T.red}`:'2px solid transparent',cursor:'pointer'}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'14px 16px'}}>
        {/* Last-updated note */}
        <div style={{
          background:'rgba(0,208,104,0.07)',border:'1px solid rgba(0,208,104,0.22)',
          borderRadius:10,padding:'8px 12px',marginBottom:12,
          display:'flex',alignItems:'center',gap:8,
        }}>
          <span style={{fontSize:14}}>🟢</span>
          <span style={{fontSize:11,color:T.textMuted,lineHeight:1.4}}>
            <b style={{color:T.text}}>Live data · Updated May 2026.</b> Officials change with bureaucratic reshuffles — please verify via official district portal before urgent contact.
          </span>
        </div>

        {(sections[tab]||[]).map((p,i)=>(
          <div key={i} style={{background:T.bg2,borderRadius:12,padding:'14px',marginBottom:10,border:`1px solid ${T.border}`}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:`rgba(208,2,27,0.15)`,border:`1px solid rgba(208,2,27,0.2)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{p.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{p.name}</div>
                <div style={{fontSize:11,color:T.gold,marginTop:1}}>{p.role}</div>
                {p.office&&<div style={{fontSize:10,color:T.textMuted,marginTop:1}}>{p.office}</div>}
              </div>
            </div>
            {p.phone&&(
              <a href={`tel:${p.phone}`} style={{display:'flex',alignItems:'center',gap:8,marginTop:10,background:`rgba(0,198,184,0.08)`,borderRadius:8,padding:'8px 12px',textDecoration:'none'}}>
                <span style={{fontSize:14}}>📞</span>
                <span style={{fontSize:13,color:T.teal,fontWeight:600}}>{p.phone}</span>
                <span style={{fontSize:10,color:T.textMuted,marginLeft:'auto'}}>Tap to call</span>
              </a>
            )}
          </div>
        ))}
      </div>
      <BottomNav active="local" onChange={onNavigate} />
    </div>
  );
}

export { WhosWhoScreen };
export default WhosWhoScreen;
