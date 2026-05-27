import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function LiveStrip({ activeChannel, allChannels }) {
  const { T } = useAppTheme();
  const [count, setCount] = useState(allChannels.reduce((s,c)=>s+(c.viewers||0),0));
  const [showShare, setShowShare] = useState(false);

  useEffect(()=>{
    const t = setInterval(()=>setCount(v=>v + Math.floor(Math.random()*15)-5), 3000);
    return ()=>clearInterval(t);
  },[]);

  const shareUrl  = 'https://localaitv.com/app';
  // Short clean message — no long URL-encoded garbage in WhatsApp
  const shareText = `${activeChannel.name} TV LIVE చూడండి! ${shareUrl}`;
  const enc       = encodeURIComponent;

  const SOCIAL = [
    { label:'WhatsApp',  color:'#25D366', bg:'rgba(37,211,102,0.12)',
      icon: <svg width={20} height={20} viewBox="0 0 32 32" fill="#25D366"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.76 1.83 6.74L2 30l7.44-1.79A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.1 19.1c-.3.84-1.76 1.6-2.4 1.7-.62.1-1.4.14-2.26-.14a20.6 20.6 0 01-2.04-.75c-3.58-1.55-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7s.92-2.62 1.26-2.98c.3-.34.66-.42.88-.42l.64.01c.2 0 .48-.08.74.56.28.66.94 2.3.02 2.56-.18.06-.34.14-.5.22-.28.14-.52.3-.36.6.16.3.7 1.16 1.5 1.88.02.02 1.04.92 1.44 1.14.3.16.6.12.82-.12.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.02.96 2.36 1.13.34.18.58.26.66.4.08.16.08.9-.22 1.74z"/></svg>,
      action: ()=>{
        const msg = enc(shareText);
        const a = document.createElement('a');
        a.href = `whatsapp://send?text=${msg}`;
        a.style.display='none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(()=>window.open(`https://wa.me/?text=${msg}`,'_blank'),1500);
      }},
    { label:'Telegram',  color:'#0088CC', bg:'rgba(0,136,204,0.12)',
      icon: <svg width={20} height={20} viewBox="0 0 32 32" fill="#0088CC"><path d="M16 2C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm6.84 9.58l-2.36 11.12c-.18.8-.64 1-1.3.62l-3.6-2.65-1.73 1.67c-.2.2-.36.36-.73.36l.26-3.68 6.7-6.05c.3-.26-.06-.4-.44-.14l-8.28 5.21-3.57-1.12c-.78-.24-.8-.78.16-1.15l13.93-5.37c.64-.24 1.2.14.96 1.18z"/></svg>,
      action: ()=>window.open(`https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareText)}`,'_blank') },
    { label:'Facebook',  color:'#1877F2', bg:'rgba(24,119,242,0.12)',
      icon: <svg width={20} height={20} viewBox="0 0 32 32" fill="#1877F2"><path d="M16 2C8.27 2 2 8.27 2 16c0 6.99 5.12 12.77 11.81 13.82V19.9h-3.55V16h3.55v-3.08c0-3.51 2.09-5.44 5.28-5.44 1.53 0 3.12.27 3.12.27v3.44h-1.76c-1.73 0-2.27 1.07-2.27 2.17V16h3.87l-.62 3.9h-3.25v9.92C24.88 28.77 30 22.99 30 16c0-7.73-6.27-14-14-14z"/></svg>,
      action: ()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,'_blank') },
    { label:'X (Twitter)', color:'#000000', bg:'rgba(0,0,0,0.12)',
      icon: <svg width={20} height={20} viewBox="0 0 32 32" fill={T.isDark?'#fff':'#000'}><path d="M18.24 14.17L27.1 4h-2.1l-7.7 8.95L11 4H4l9.3 13.53L4 28h2.1l8.13-9.45L21 28h7L18.24 14.17zm-2.88 3.35l-.94-1.34L6.8 5.6h3.23l6.04 8.64.94 1.35 7.86 11.24h-3.23l-6.28-8.3z"/></svg>,
      action: ()=>window.open(`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`,'_blank') },
    { label:'Instagram',  color:'#E1306C', bg:'rgba(225,48,108,0.12)',
      icon: <svg width={20} height={20} viewBox="0 0 32 32" fill="url(#ig)"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path d="M16 4.32c3.86 0 4.32.01 5.84.08 1.41.06 2.17.29 2.68.48.67.26 1.15.57 1.65 1.07s.81.98 1.07 1.65c.19.51.42 1.28.48 2.68.07 1.52.08 1.98.08 5.84s-.01 4.32-.08 5.84c-.06 1.41-.29 2.17-.48 2.68-.26.67-.57 1.15-1.07 1.65s-.98.81-1.65 1.07c-.51.19-1.28.42-2.68.48-1.52.07-1.98.08-5.84.08s-4.32-.01-5.84-.08c-1.41-.06-2.17-.29-2.68-.48-.67-.26-1.15-.57-1.65-1.07s-.81-.98-1.07-1.65c-.19-.51-.42-1.28-.48-2.68C4.33 20.32 4.32 19.86 4.32 16s.01-4.32.08-5.84c.06-1.41.29-2.17.48-2.68.26-.67.57-1.15 1.07-1.65s.98-.81 1.65-1.07c.51-.19 1.28-.42 2.68-.48 1.52-.07 1.98-.08 5.84-.08M16 2c-3.93 0-4.42.02-5.96.09-1.54.07-2.59.31-3.51.67a7.1 7.1 0 00-2.57 1.67A7.1 7.1 0 002.29 6.9c-.36.92-.6 1.97-.67 3.51C1.55 11.95 1.54 12.44 1.54 16.37s.02 4.42.09 5.96c.07 1.54.31 2.59.67 3.51a7.1 7.1 0 001.67 2.57 7.1 7.1 0 002.57 1.67c.92.36 1.97.6 3.51.67 1.54.07 2.03.09 5.96.09s4.42-.02 5.96-.09c1.54-.07 2.59-.31 3.51-.67a7.1 7.1 0 002.57-1.67 7.1 7.1 0 001.67-2.57c.36-.92.6-1.97.67-3.51.07-1.54.09-2.03.09-5.96s-.02-4.42-.09-5.96c-.07-1.54-.31-2.59-.67-3.51a7.1 7.1 0 00-1.67-2.57A7.1 7.1 0 0025.47 2.76c-.92-.36-1.97-.6-3.51-.67C20.42 2.02 19.93 2 16 2zm0 6.7a7.3 7.3 0 100 14.6A7.3 7.3 0 0016 8.7zm0 12.03a4.73 4.73 0 110-9.46 4.73 4.73 0 010 9.46zM23.58 7.04a1.71 1.71 0 100 3.42 1.71 1.71 0 000-3.42z"/></svg>,
      action: ()=>{ navigator.clipboard&&navigator.clipboard.writeText(shareText); /* copied */; } },
    { label:'More...',   color:'#6B7280', bg:'rgba(107,114,128,0.12)',
      icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth={2.2} strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
      action: ()=>{ if(navigator.share){navigator.share({title:`${activeChannel.name} TV Live`,text:shareText,url:shareUrl}).catch(()=>{});} else{ navigator.clipboard&&navigator.clipboard.writeText(shareText); /* copied */; } } },
  ];

  return (
    <>
      {/* ── Main strip ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 14px',
        height:46,
        background: T.isDark?'linear-gradient(90deg,#050c1a,#071224)':'linear-gradient(90deg,#ffffff,#f4f7ff)',
        borderBottom:`1px solid ${T.border}`,
      }}>
        {/* LEFT: red dot · channel name · TV Live */}
        <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0,overflow:'hidden'}}>
          {/* Red blinking dot */}
          <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
            background:'#FF1A1A', animation:'blink 1s infinite',
            boxShadow:'0 0 5px rgba(255,26,26,0.7)'}}/>
          <span style={{fontFamily:"'Noto Sans Telugu',sans-serif",
            fontWeight:800,fontSize:15,lineHeight:1,
            color:T.isDark?'#FFFFFF':'#0a0a14',flexShrink:0}}>
            {activeChannel.name}
          </span>
          {/* TV — plain black text per user request */}
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",
            fontWeight:800,fontSize:14,letterSpacing:0.5,
            color:T.isDark?'#FFFFFF':'#0a0a14',
            flexShrink:0,lineHeight:1}}>
            TV
          </span>
          {/* LIVE — smaller, non-blinking red pill button */}
          <div style={{display:'inline-flex',alignItems:'center',
            background:'linear-gradient(135deg,#C0021A,#E8001E)',
            borderRadius:4,padding:'1px 6px',flexShrink:0,
            boxShadow:'0 1px 4px rgba(208,2,27,0.35)'}}>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:900,fontSize:9,color:'white',letterSpacing:1,lineHeight:1}}>LIVE</span>
          </div>
        </div>

        {/* RIGHT: plain watching count + WhatsApp icon + Share icon */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          {/* Viewer count — plain text on transparent background (pill box removed) */}
          <div style={{display:'flex',alignItems:'center',gap:5,padding:'0 4px'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:T.green,
              animation:'blink 1.2s infinite',flexShrink:0}}/>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:700,fontSize:10.5,color:T.green,letterSpacing:0.3}}>
              {count.toLocaleString('en-IN')} watching
            </span>
          </div>

          {/* WhatsApp icon button */}
          <button onClick={()=>{
              const msg = encodeURIComponent(shareText);
              // Try native WhatsApp deep link first (opens app directly)
              // Falls back to wa.me if app not installed
              const waUrl = `whatsapp://send?text=${msg}`;
              const waWeb = `https://wa.me/?text=${msg}`;
              const a = document.createElement('a');
              a.href = waUrl;
              a.style.display = 'none';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              // Fallback after 1.5s if app didn't open
              setTimeout(()=>{ window.open(waWeb,'_blank'); }, 1500);
            }}
            style={{width:26,height:26,borderRadius:'50%',border:'none',
              background:'#25D366',cursor:'pointer',flexShrink:0,
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 1px 4px rgba(37,211,102,0.4)'}}>
            <svg width={12} height={12} viewBox="0 0 32 32" fill="white">
              <path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.76 1.83 6.74L2 30l7.44-1.79A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm7.1 19.1c-.3.84-1.76 1.6-2.4 1.7-.62.1-1.4.14-2.26-.14a20.6 20.6 0 01-2.04-.75c-3.58-1.55-5.92-5.16-6.1-5.4-.18-.24-1.46-1.94-1.46-3.7s.92-2.62 1.26-2.98c.3-.34.66-.42.88-.42l.64.01c.2 0 .48-.08.74.56.28.66.94 2.3.02 2.56-.18.06-.34.14-.5.22-.28.14-.52.3-.36.6.16.3.7 1.16 1.5 1.88.02.02 1.04.92 1.44 1.14.3.16.6.12.82-.12.22-.24.9-1.04 1.14-1.4.24-.36.48-.3.8-.18.32.12 2.02.96 2.36 1.13.34.18.58.26.66.4.08.16.08.9-.22 1.74z"/>
            </svg>
          </button>

          {/* Share icon button — opens social sheet */}
          <button onClick={()=>setShowShare(true)}
            style={{width:26,height:26,borderRadius:'50%',
              background:T.bg3,border:`1px solid ${T.border}`,
              cursor:'pointer',flexShrink:0,
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:T.isDark?'none':'0 1px 3px rgba(0,0,0,0.08)'}}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
              stroke={T.textMuted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Social Share Sheet ── */}
      {showShare && (
        <div onClick={()=>setShowShare(false)}
          style={{position:'fixed',inset:0,zIndex:300,
            background:'rgba(0,0,0,0.55)',display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:T.bg2,borderRadius:'20px 20px 0 0',
              padding:'12px 0 32px',boxShadow:'0 -4px 32px rgba(0,0,0,0.3)'}}>
            {/* Handle */}
            <div style={{width:36,height:4,background:T.border,borderRadius:2,margin:'0 auto 16px'}}/>
            {/* Title */}
            <div style={{textAlign:'center',marginBottom:20,
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,
              color:T.text,letterSpacing:0.5}}>
              Share {activeChannel.name} TV Live
            </div>
            {/* Social icons grid */}
            <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:16,padding:'0 20px'}}>
              {SOCIAL.map(s=>(
                <div key={s.label} onClick={()=>{s.action();setShowShare(false);}}
                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,
                    cursor:'pointer',width:64}}>
                  <div style={{width:52,height:52,borderRadius:16,
                    background:s.bg,border:`1.5px solid ${s.color}22`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    boxShadow:`0 2px 10px ${s.color}22`}}>
                    {s.icon}
                  </div>
                  <span style={{fontFamily:"'Barlow',sans-serif",fontSize:10,
                    color:T.textMuted,fontWeight:600,textAlign:'center',lineHeight:1.2}}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            {/* Cancel */}
            <button onClick={()=>setShowShare(false)}
              style={{display:'block',margin:'20px auto 0',
                background:T.bg3,border:`1px solid ${T.border}`,
                borderRadius:12,padding:'10px 40px',
                fontFamily:"'Barlow Condensed',sans-serif",
                fontWeight:700,fontSize:14,color:T.textMuted,cursor:'pointer'}}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── UPLOAD CTA BANNER — alternates between two upload prompts every 3.5s ──
// Two-line slides on a deep-indigo background (replacing the red).
//   Slide 1 (Telugu only):
//     మీ వార్తను మీరే
//     ఒక్క నిమిషంలో అప్లోడ్ చేసుకోండి!
//   Slide 2 (English only):
//     CLICK HERE TO REGISTER

export { LiveStrip };
export default LiveStrip;
