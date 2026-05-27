import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import HomeScreen from './HomeScreen.jsx';

function ProfileScreen({ onNavigate }) {
  const { T } = useAppTheme();

  // The 5 fields collected at Registration (single source of truth — would
  // come from a user store in a real backend).
  const user = {
    name: 'Mohan Reddy Koneti',
    constituency: 'Kurnool, Andhra Pradesh',
    role: 'Super Admin',
    mobile: '+91 7569 684 979',
    photo: '', // empty → fall back to initial avatar
  };
  const initial = (user.name || '?')[0];

  const fields = [
    { icon:'👤', label:'Name / పేరు',                    val: user.name },
    { icon:'📍', label:'Constituency / నియోజకవర్గం',     val: user.constituency },
    // Role / పాత్ర field removed per user request
    { icon:'📞', label:'Mobile / మొబైల్',                  val: user.mobile },
  ];

  // Go back to the home page WITH the hamburger menu auto-opened.
  // Use a global flag the HomeScreen reads in a mount-effect, then clears.
  const goBackToHamburger = () => {
    if (typeof window !== 'undefined') { try { window.__openHamburgerOnLoad = true; } catch(e){} }
    onNavigate('home');
  };

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header with go-back button + profile photo */}
      <div style={{
        background: 'linear-gradient(135deg,#E8001E 0%,#D0021B 100%)',
        padding:'52px 18px 24px', textAlign:'center', flexShrink:0,
        position:'relative',
      }}>
        {/* Go Back button — top-left. Reopens the hamburger menu on home. */}
        <button onClick={goBackToHamburger}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.08)'; e.currentTarget.style.background='rgba(0,0,0,0.4)';}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.background='rgba(0,0,0,0.25)';}}
          style={{
            position:'absolute', top:48, left:14,
            width:38, height:38, borderRadius:'50%',
            background:'rgba(0,0,0,0.25)', border:'1.5px solid rgba(255,255,255,0.30)',
            color:'#FFFFFF', fontSize:18, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s cubic-bezier(0.22,1,0.36,1)',
          }}>←</button>

        <div style={{
          width:90, height:90, borderRadius:'50%',
          background:'#FFFFFF',
          display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto 12px',
          boxShadow:'0 4px 16px rgba(0,0,0,0.2)',
          overflow:'hidden',
        }}>
          {user.photo ? (
            <img src={user.photo} alt={user.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          ) : (
            /* Male silhouette with tie — fallback when no photo uploaded */
            <svg width={62} height={62} viewBox="0 0 64 64" fill="none">
              {/* Head */}
              <circle cx="32" cy="22" r="10" fill="#D0021B"/>
              {/* Shoulders/body */}
              <path d="M12 56c0-11 9-18 20-18s20 7 20 18v4H12v-4z" fill="#D0021B"/>
              {/* Collar */}
              <path d="M25 38l7 7 7-7-2-2c-1.5 1.5-3 2.5-5 2.5s-3.5-1-5-2.5l-2 2z" fill="#FFFFFF"/>
              {/* Tie */}
              <path d="M30 45l2-2 2 2-0.6 5-1.4 8-1.4-8z" fill="#1A237E"/>
              {/* Tie knot */}
              <path d="M30.5 45l1.5-1.5 1.5 1.5-1.5 1.5z" fill="#0D47A1"/>
            </svg>
          )}
        </div>
        <div style={{fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:20,color:'#FFFFFF',marginBottom:4}}>
          {user.name}
        </div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.85)'}}>
          📍 {user.constituency}
        </div>
      </div>

      {/* Field list */}
      <div style={{flex:1,overflowY:'auto',padding:'18px 18px 120px'}}>
        {fields.map((f,i) => (
          <div key={i} style={{
            background: T.bg2,
            border:`1px solid ${T.border}`,
            borderRadius:12, padding:'12px 14px', marginBottom:10,
          }}>
            <div style={{
              fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:10, fontWeight:700, color:T.textMuted,
              letterSpacing:1, textTransform:'uppercase', marginBottom:4,
              display:'flex', alignItems:'center', gap:5,
            }}>
              <span style={{fontSize:13}}>{f.icon}</span>{f.label}
            </div>
            <div style={{
              fontFamily:"'Noto Sans Telugu','Barlow',sans-serif",
              fontSize:15, fontWeight:600, color:T.text,
            }}>{f.val}</div>
          </div>
        ))}

        {/* Admin Dashboard — Super Admin entry (demo) */}
        <button onClick={()=>onNavigate('admindashboard')} style={{
          width:'100%', marginTop:8, marginBottom:10,
          background:'linear-gradient(135deg,#1A237E,#3949AB)',
          color:'#FFFFFF', border:'none', borderRadius:12, padding:'14px',
          fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:15,
          cursor:'pointer', boxShadow:'0 4px 14px rgba(26,35,126,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          🛡️ Admin Dashboard
          <span style={{fontSize:10,fontWeight:700,background:'rgba(255,255,255,0.22)',borderRadius:6,padding:'2px 7px',letterSpacing:0.5}}>SUPER ADMIN</span>
        </button>

        {/* Edit Profile button */}
        <button onClick={()=>onNavigate('register')} style={{
          width:'100%', marginTop:0,
          background:'linear-gradient(135deg,#E8001E,#D0021B)',
          color:'#FFFFFF', border:'none', borderRadius:12, padding:'14px',
          fontFamily:"'Barlow',sans-serif", fontWeight:700, fontSize:15,
          cursor:'pointer', boxShadow:'0 4px 14px rgba(208,2,27,0.35)',
        }}>
          ✏️ Edit Profile
        </button>
      </div>

      <BottomNav active="profile" onChange={onNavigate} />
    </div>
  );
}


export { ProfileScreen };
export default ProfileScreen;
