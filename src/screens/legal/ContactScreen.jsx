import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function ContactScreen({ onBack }) {
  const { T } = useAppTheme();
  function openEmail() { window.open('mailto:support@localaitv.com'); }
  function openPhone() { window.open('tel:+917569684979'); }
  function openWA()    { window.open('https://wa.me/917569684979','_blank'); }
  function openMaps()  { window.open('https://maps.google.com/?q=Madhapur+Hyderabad','_blank'); }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <div style={{background:T.isDark?`linear-gradient(135deg,#0A1538,${T.bg2})`:T.bg2,padding:'48px 18px 20px',flexShrink:0,position:'relative',borderBottom:`1px solid ${T.border}`}}>
        <button onClick={onBack} style={{position:'absolute',top:52,left:14,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:6}}>📞</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text,letterSpacing:0.8}}>Contact Us</div>
          <div style={{fontFamily:"'Noto Sans Telugu',sans-serif",fontSize:14,lineHeight:1.65,fontWeight:700,color:T.gold,marginTop:4}}>మమ్మల్ని సంప్రదించండి</div>

        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'18px 18px 120px'}}>
        <div style={{fontSize:13,color:T.textMuted,textAlign:'center',marginBottom:18,lineHeight:1.6}}>
          We'd love to hear from you! Reach out for support, partnerships, or general inquiries.
        </div>

        {/* Contact methods */}
        <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
          <button onClick={openEmail} style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:`linear-gradient(135deg,rgba(208,2,27,0.12),rgba(208,2,27,0.04))`,border:`1px solid rgba(208,2,27,0.25)`,borderRadius:14,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:46,height:46,borderRadius:11,background:`rgba(208,2,27,0.15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>📧</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>Email Support</div>
              <div style={{fontSize:12,color:T.red,marginTop:2}}>support@localaitv.com</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>Response within 24 hours</div>
            </div>
          </button>

          <button onClick={openPhone} style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:`linear-gradient(135deg,rgba(0,198,184,0.12),rgba(0,198,184,0.04))`,border:`1px solid rgba(0,198,184,0.25)`,borderRadius:14,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:46,height:46,borderRadius:11,background:`rgba(0,198,184,0.15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>📞</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>Call Helpline</div>
              <div style={{fontSize:12,color:T.teal,marginTop:2}}>+91 7569684979</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>Mon–Sat, 9 AM – 7 PM IST</div>
            </div>
          </button>

          <button onClick={openWA} style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:`linear-gradient(135deg,rgba(37,211,102,0.12),rgba(37,211,102,0.04))`,border:`1px solid rgba(37,211,102,0.25)`,borderRadius:14,cursor:'pointer',textAlign:'left'}}>
            <div style={{width:46,height:46,borderRadius:11,background:`rgba(37,211,102,0.15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>💬</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>WhatsApp</div>
              <div style={{fontSize:12,color:'#25D366',marginTop:2}}>Chat with us</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>Quick support, photo sharing</div>
            </div>
          </button>

          <button onClick={openMaps} style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:14,cursor:'pointer',textAlign:'left',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <div style={{width:46,height:46,borderRadius:11,background:`rgba(255,184,0,0.15)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>📍</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text}}>Office Address</div>
              <div style={{fontSize:12,color:T.gold,marginTop:2}}>Hyderabad, Telangana</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:1}}>India</div>
            </div>
          </button>
        </div>

        {/* Office details */}
        <div style={{padding:'14px',background:T.bg3,borderRadius:12,border:`1px solid ${T.border}`,marginBottom:14,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:12,color:T.gold,letterSpacing:1,marginBottom:8}}>🏢 COMPANY</div>
          <div style={{fontSize:12,color:T.textMuted,lineHeight:1.7}}>
            <strong style={{color:T.text}}>LocalAI Media Network Pvt Ltd</strong><br/>
            CIN: U63910KA2025PTC212593<br/>
            Hyderabad, Telangana, India
          </div>
        </div>

        {/* Grievance officer */}
        <div style={{padding:'14px',background:`rgba(208,2,27,0.06)`,borderRadius:12,border:`1px solid rgba(208,2,27,0.18)`}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:12,color:T.red,letterSpacing:1,marginBottom:6}}>⚖️ GRIEVANCE OFFICER (IT Rules 2021)</div>
          <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4}}>Bommena Prashanth</div>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:2}}>📧 support@localaitv.com</div>
          <div style={{fontSize:11,color:T.textMuted}}>📞 +91 7569684979</div>
        </div>

        <div style={{textAlign:'center',padding:'16px 0 4px',fontSize:9,color:T.textMuted}}>
          CIN: U63910KA2025PTC212593
        </div>
      </div>
    </div>
  );
}


export { ContactScreen };
export default ContactScreen;
