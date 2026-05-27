import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import BottomNav from './../components/BottomNav.jsx';
import BottomSheet from './../components/BottomSheet.jsx';
import GrievanceBlock from './../components/GrievanceBlock.jsx';
import Toast from './../components/Toast.jsx';
function SettingsScreen({ onBack, onNavigate }) {
  const [deleteModal, setDeleteModal]   = useState(false);
  const [deleteStep, setDeleteStep]     = useState(0);
  const [toast, setToast]               = useState('');
  const { isDark, toggleTheme }         = useAppTheme(); // Phase 1: theme toggle
  function showToast(m) { setToast(m); setTimeout(() => setToast(''), 2500); }
  function nav(to) { if (onNavigate) onNavigate(to); }

  const sections = [
    {
      title: 'Account',
      items: [
        { icon:'👤', label:'Edit Profile',       sub:'Name, photo, district' },
        { icon:'🔔', label:'Notifications',      sub:'Breaking news, replies' },
        { icon:'🌐', label:'Language',           sub:'Telugu / English' },
        { icon:'📍', label:'Location Settings',  sub:'Change district and mandal', action:() => showToast('Go to Profile → My District to change') },
      ],
    },
    {
      title: 'Display',
      themeToggle: true, // Phase 1: renders the theme toggle row
    },
    {
      title: 'Privacy & Account',
      items: [
        { icon:'🔒', label:'Privacy Policy',     sub:'How we collect and use your data', action:() => nav('privacy') },
        { icon:'📋', label:'Terms & Conditions', sub:'Usage rules and rights',          action:() => nav('terms') },
        { icon:'©️',  label:'Copyright & Takedown', sub:'IP policy and takedown requests', action:() => nav('copyright') },
        { icon:'📣', label:'Grievance Redressal', sub:'Submit complaints to our Officer', action:() => nav('complaint') },
        { icon:'🗑️', label:'Delete Account',     sub:'Permanently remove your data', red:true, action:() => nav('deleteaccount') },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon:'📞', label:'Contact Support', sub:'+91 7569684979 · support@localaitv.com', action:() => nav('contact') },
        { icon:'❓', label:'About LocalAI',    sub:'Who we are, our mission', action:() => nav('about') },
        { icon:'⭐', label:'Rate the App',     sub:'Share your feedback', action:() => window.open('https://play.google.com/store/apps/details?id=com.localaitv.app') },
        { icon:'📢', label:'Version Info',    sub:'Version 1.0.6 · localaitv.com', action:() => window.open('https://localaitv.com') },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        { icon:'🚪', label:'Sign Out',            sub:'', red:true, action:() => showToast('Signed out') },
      ],
    },
  ];

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
      <Toast msg={toast}/>

      {/* Header */}
      <div style={{background:T.bg2,padding:'52px 18px 14px',display:'flex',alignItems:'center',gap:14,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
        <button onClick={onBack} style={{width:34,height:34,borderRadius:10,background:T.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:22,letterSpacing:1}}>⚙️ Settings</div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 18px 120px'}}>
        {sections.map((sec,si) => (
          <div key={si} style={{marginBottom:24}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,letterSpacing:2,color:T.textMuted,textTransform:'uppercase',marginBottom:8}}>{sec.title}</div>

            {sec.themeToggle ? (
              /* ── PHASE 1: THEME TOGGLE ── */
              <div style={{background:T.bg3,borderRadius:14,overflow:'hidden',border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
                <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px'}}>
                  <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,184,0,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                    {isDark ? '🌙' : '☀️'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:2}}>App Theme</div>
                    <div style={{fontSize:11,color:T.textMuted}}>{isDark ? '🌙 Dark Mode' : '☀️ Light Mode (recommended)'}</div>
                  </div>
                  {/* Toggle switch */}
                  <div onClick={toggleTheme} style={{
                    width:50,height:28,borderRadius:14,
                    background: isDark ? T.gray3 : T.red,
                    position:'relative',cursor:'pointer',
                    transition:'background 0.3s',flexShrink:0,
                  }}>
                    <div style={{
                      position:'absolute',top:3,
                      left: isDark ? 3 : 23,
                      width:22,height:22,borderRadius:'50%',
                      background:'white',
                      transition:'left 0.3s',
                      boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
                    }}/>
                  </div>
                </div>
                <div style={{padding:'10px 16px',borderTop:`1px solid ${T.border}`}}>
                  <div style={{fontSize:10,color:T.textMuted,lineHeight:1.5}}>
                    Light mode is recommended for best readability of Telugu text. Your preference is saved automatically.
                  </div>
                </div>
              </div>
            ) : sec.grievance ? (
              /* ── GRIEVANCE BLOCK ── */
              <GrievanceBlock />
            ) : (
              <div style={{background:T.bg3,borderRadius:14,overflow:'hidden',border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
                {sec.items.map((item,ii) => (
                  <div key={ii} onClick={item.action} style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'14px 16px',
                    borderBottom: ii < sec.items.length-1 ? `1px solid ${T.border}` : 'none',
                    cursor: item.action ? 'pointer' : 'default',
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:10,
                      background: item.red ? 'rgba(208,2,27,0.12)' : 'rgba(255,255,255,0.06)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:18, flexShrink:0,
                    }}>{item.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600,color:item.red?T.red:'white',marginBottom:item.sub?2:0}}>{item.label}</div>
                      {item.sub && <div style={{fontSize:11,color:T.textMuted,lineHeight:1.4}}>{item.sub}</div>}
                    </div>
                    {item.link ? (
                      <span style={{fontSize:12,color:T.teal}}>↗</span>
                    ) : (
                      <span style={{fontSize:16,color:T.textMuted}}>›</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Privacy notice */}
        <div style={{background:'rgba(255,184,0,0.06)',border:`1px solid rgba(255,184,0,0.15)`,borderRadius:12,padding:'14px 16px',marginBottom:16}}>
          <div style={{fontSize:11,color:T.gold,fontWeight:600,marginBottom:6}}>🔒 Your Data is Safe</div>
          <div style={{fontSize:11,color:T.textMuted,lineHeight:1.6}}>
            LocalAI TV collects only what is needed to show you local news. We never sell your data to third parties. All data is encrypted in transit. You can delete your account at any time.
          </div>
        </div>

        {/* Editorial contact — Apple guideline 14.1 */}
        <div style={{background:T.bg3,borderRadius:12,padding:'14px 16px',border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
          <div style={{fontSize:11,color:T.textMuted,fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:1}}>Editorial Team Contact</div>
          <div style={{fontSize:12,color:T.text,marginBottom:4}}>📧 support@localaitv.com</div>
          <div style={{fontSize:12,color:T.text,marginBottom:4}}>📞 +91 7569684979</div>
          <div style={{fontSize:12,color:T.text}}>🌐 localaitv.com/contact</div>
        </div>
      </div>

      {/* Delete Account Modal — Apple guideline 5.1 */}
      <BottomSheet show={deleteModal} onClose={() => { setDeleteModal(false); setDeleteStep(0); }} title="">
        {deleteStep === 0 ? (
          <>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div style={{fontSize:48,marginBottom:10}}>⚠️</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:T.red,marginBottom:8}}>Delete Account?</div>
              <div style={{fontSize:13,color:T.textMuted,lineHeight:1.7}}>
                This will permanently delete your account, all your uploaded content, earnings history and profile data. This cannot be undone.
              </div>
            </div>
            <div style={{background:'rgba(208,2,27,0.07)',border:`1px solid rgba(208,2,27,0.2)`,borderRadius:10,padding:'12px',marginBottom:18}}>
              <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>
                ❌ All uploaded videos deleted{'\n'}
                ❌ Earnings history removed{'\n'}
                ❌ Profile and badges removed{'\n'}
                ❌ This action is permanent
              </div>
            </div>
            <button onClick={() => setDeleteStep(1)} style={{width:'100%',background:`linear-gradient(135deg,${T.red},#7A0010)`,color:'white',borderRadius:12,padding:'14px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,letterSpacing:1.5,cursor:'pointer',marginBottom:10}}>
              Yes, Delete My Account
            </button>
            <button onClick={() => setDeleteModal(false)} style={{width:'100%',background:T.bg3,color:T.textMuted,borderRadius:12,padding:'13px',fontSize:13,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              Cancel — Keep My Account
            </button>
          </>
        ) : (
          <div style={{textAlign:'center',padding:'16px 0'}}>
            <div style={{fontSize:48,marginBottom:12}}>✅</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:22,marginBottom:8}}>Request Submitted</div>
            <div style={{fontSize:12,color:T.textMuted,lineHeight:1.7}}>
              Your account deletion request has been received. Your account will be permanently deleted within 30 days. You will receive a confirmation email at your registered address.
            </div>
          </div>
        )}
      </BottomSheet>
      <BottomNav active="profile" onChange={onNavigate} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WOW FACTOR 1 — ANIMATED INTRO (Network Launch Feel)

export { SettingsScreen };
export default SettingsScreen;
