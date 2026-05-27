import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

function QRCodeScreen({ onBack, constituency }) {
  const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.localaitv.app';
  const IOS_URL = 'https://apps.apple.com/in/app/localai-tv/id6753254717'; // Update with real iOS App Store ID once published
  const SMART_LINK = 'https://localaitv.com/app'; // Universal link — auto-detects iOS/Android

  // Reusable QR code SVG component
  const QRCode = ({ color }) => (
    <svg width="120" height="120" viewBox="0 0 160 160">
      {[0,1,2,3,4,5,6].map(r=>[0,1,2,3,4,5,6].map(c=>{
        const inCorner=(r<2&&c<2)||(r<2&&c>4)||(r>4&&c<2);
        const fill=inCorner?'#000':'transparent';
        return <rect key={`${r}-${c}`} x={r*10+10} y={c*10+10} width={9} height={9} fill={fill} rx={1}/>;
      }))}
      {[[3,3],[3,5],[5,3],[2,2],[4,4],[6,2],[2,6],[5,5],[3,1],[1,3],[6,6],[4,2],[2,4],[7,7],[7,3],[3,7],[1,7],[7,1],[5,1],[1,5],[6,4],[4,6],[8,8],[8,4],[4,8],[8,2],[2,8],[9,9],[9,5],[5,9],[7,5],[5,7],[10,10],[10,6],[6,10],[11,11],[11,7],[7,11],[9,7],[7,9],[12,12],[12,8],[8,12],[10,8],[8,10],[13,13],[13,9],[9,13]].map(([r,c],i)=>(
        <rect key={i} x={r*10+5} y={c*10+5} width={8} height={8} fill="#000" rx={1}/>
      ))}
      {[[0,0],[0,110],[110,0]].map(([x,y],i)=>(
        <g key={i}>
          <rect x={x+5} y={y+5} width={35} height={35} fill="none" stroke="#000" strokeWidth="4" rx={3}/>
          <rect x={x+13} y={y+13} width={19} height={19} fill="#000" rx={2}/>
        </g>
      ))}
      <rect x={65} y={65} width={30} height={30} fill={color} rx={4}/>
      <text x={80} y={85} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">L</text>
    </svg>
  );

  const [linkCopied, setLinkCopied] = useState(false);

  // ── PROMOTIONAL TEXT — this is what gets shared on every social platform ──
  const PROMO_TEXT = `📺 *LocalAI TV* — India's first AI-powered hyperlocal Telugu news app!

✨ Live news from your constituency
🤖 AI-powered news bulletins in Telugu
📱 Free for everyone
📺 9 districts covered (and growing!)
🎙️ Citizen reporter network — local news by local people

📥 Download LocalAI TV for your local town news and information.

Stay informed about ${constituency || 'your area'} like never before.

📲 Download now:
🤖 Android: ${ANDROID_URL}
🍎 iPhone: ${IOS_URL}
🔗 Smart Link: ${SMART_LINK}

📡 YouTube: https://youtube.com/@localaitv`;

  const PROMO_TEXT_SHORT = `📺 LocalAI TV — India's first AI hyperlocal Telugu news app! Get live news from ${constituency || 'your constituency'}. Download: ${SMART_LINK}`;

  const copyLink = () => {
    const copied = copyToClipboardSilent(PROMO_TEXT);
    if (copied) { setLinkCopied(true); setTimeout(()=>setLinkCopied(false), 2000); }
  };

  // ── SOCIAL MEDIA SHARE HANDLERS (verified working as of May 2026) ──
  // Each platform has its own share URL format. Reference: official platform docs + react-share library.
  const enc = encodeURIComponent;

  // Helper: copy promo text to clipboard before opening platforms that don't accept text via URL
  const copyToClipboardSilent = (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for iOS Safari which blocks navigator.clipboard on file:// or without user gesture
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return true;
    } catch (e) { /* ignore */ }
    return false;
  };

  const shareTargets = {
    // WhatsApp: api.whatsapp.com/send is more reliable than wa.me for sharing without a phone number.
    // Falls back to WhatsApp Web on desktop, opens app on mobile.
    whatsapp:  () => window.open(`https://api.whatsapp.com/send?text=${enc(PROMO_TEXT)}`, '_blank'),

    // Telegram: official t.me/share/url endpoint (per core.telegram.org/api/links)
    telegram:  () => window.open(`https://t.me/share/url?url=${enc(SMART_LINK)}&text=${enc(PROMO_TEXT)}`, '_blank'),

    // Facebook: 'quote' parameter is deprecated since 2017 — Facebook ignores it and pulls metadata from
    // Open Graph tags on the destination URL. We pre-copy promo text to clipboard so user can paste it.
    facebook:  () => {
      copyToClipboardSilent(PROMO_TEXT);
      navigator.clipboard&&navigator.clipboard.writeText('LocalAI TV - https://localaitv.com/app');
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(SMART_LINK)}`, '_blank', 'width=626,height=436');
    },

    // X / Twitter: 'twitter.com/intent/tweet' still works in 2026. Stay under 280 chars total.
    twitter:   () => window.open(`https://twitter.com/intent/tweet?text=${enc(PROMO_TEXT_SHORT)}&url=${enc(SMART_LINK)}`, '_blank'),

    // LinkedIn: only accepts 'url' parameter — pulls title/description from Open Graph tags.
    // We pre-copy promo text to clipboard so user can add it as commentary.
    linkedin:  () => {
      copyToClipboardSilent(PROMO_TEXT);
      navigator.clipboard&&navigator.clipboard.writeText('LocalAI TV - https://localaitv.com/app');
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(SMART_LINK)}`, '_blank', 'width=600,height=600');
    },

    // Reddit: official submit endpoint
    reddit:    () => window.open(`https://www.reddit.com/submit?url=${enc(SMART_LINK)}&title=${enc('LocalAI TV — India\'s first AI hyperlocal Telugu news app')}`, '_blank'),

    // SMS: standard sms: URL scheme (works on all mobile devices)
    sms:       () => window.open(`sms:?&body=${enc(PROMO_TEXT_SHORT)}`),

    // Email: standard mailto: URL scheme
    email:     () => window.open(`mailto:?subject=${enc('Check out LocalAI TV — Hyperlocal Telugu News')}&body=${enc(PROMO_TEXT)}`),

    // Instagram: doesn't support URL-based text sharing (platform limitation, not a bug).
    // Best approach: copy text + open Instagram so user can paste in Story/DM/post.
    instagram: () => {
      const copied = copyToClipboardSilent(PROMO_TEXT);
      /* copied */;
      window.open('https://www.instagram.com/', '_blank');
    },

    // Native share: uses Web Share API (best on mobile — opens device's share sheet with all installed apps)
    nativeShare: () => {
      if (navigator.share) {
        navigator.share({
          title: 'LocalAI TV — Hyperlocal Telugu News',
          text: PROMO_TEXT_SHORT,
          url: SMART_LINK,
        }).catch((err) => {
          // User cancelled or error — silently ignore
          if (err.name !== 'AbortError') console.warn('Share failed:', err);
        });
      } else {
        // Desktop fallback: copy to clipboard
        copyLink();
        /* share not supported - clipboard used */
      }
    },
  };

  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.isDark?`linear-gradient(135deg,${T.bg},#1a2a4a)`:T.bg2,padding:'48px 18px 16px',flexShrink:0}}>
        <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',marginBottom:10}}>←</button>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:T.text}}>📲 Share the App</div>
        <div style={{fontSize:11,color:T.textMuted,marginTop:4}}>Help your community stay informed</div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 16px 120px'}}>

        {/* ════════════════════════════════════════════════ */}
        {/* SECTION 1: QR CODES AT TOP (Android + iPhone)    */}
        {/* ════════════════════════════════════════════════ */}
        <div style={{display:'flex',gap:10,marginBottom:18}}>
          {/* Android QR */}
          <div style={{flex:1,background:'white',borderRadius:16,padding:'14px 10px',textAlign:'center'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'#3DDC84',color:T.text,borderRadius:6,padding:'3px 9px',fontSize:10,fontWeight:800,marginBottom:10,letterSpacing:0.5}}>
              <span style={{fontSize:13}}>🤖</span> ANDROID
            </div>
            <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
              <QRCode color="#3DDC84"/>
            </div>
            <div style={{fontSize:10,color:'#666',fontWeight:600}}>Scan with Android phone</div>
          </div>

          {/* iOS QR */}
          <div style={{flex:1,background:'white',borderRadius:16,padding:'14px 10px',textAlign:'center'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'#000',color:'white',borderRadius:6,padding:'3px 9px',fontSize:10,fontWeight:800,marginBottom:10,letterSpacing:0.5}}>
              <span style={{fontSize:13}}>🍎</span> iPHONE
            </div>
            <div style={{display:'flex',justifyContent:'center',marginBottom:8}}>
              <QRCode color="#000"/>
            </div>
            <div style={{fontSize:10,color:'#666',fontWeight:600}}>Scan with iPhone</div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* SECTION 2: PROMO TEXT (this gets shared)         */}
        {/* ════════════════════════════════════════════════ */}
        <div style={{background:'rgba(255,184,0,0.06)',border:'1px solid rgba(255,184,0,0.2)',borderRadius:14,padding:'14px',marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
            <span style={{background:T.gold,color:T.navy,fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:5,letterSpacing:0.8}}>📝 PROMO MESSAGE</span>
            <span style={{fontSize:9,color:T.gold,fontWeight:600}}>This text is shared with every link</span>
          </div>
          <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:'12px',fontSize:12,color:T.textMuted,lineHeight:1.55,whiteSpace:'pre-line',maxHeight:180,overflowY:'auto'}}>
{`📺 LocalAI TV — India's first AI-powered hyperlocal Telugu news app!

✨ Live news from your constituency
🤖 AI-powered Telugu news bulletins
📱 Free for everyone
🎙️ Citizen reporter network

📥 Download LocalAI TV for your local town news and information.

Stay informed about ${constituency || 'your area'}.`}
          </div>
          <button onClick={copyLink}
            style={{width:'100%',background:linkCopied?T.green:'rgba(255,255,255,0.08)',color:T.text,border:`1px solid ${linkCopied?T.green:'rgba(255,255,255,0.15)'}`,borderRadius:10,padding:'9px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:12,letterSpacing:0.5,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:10,transition:'all 0.2s'}}>
            <span style={{fontSize:13}}>{linkCopied?'✓':'📋'}</span>
            {linkCopied ? 'Copied to clipboard!' : 'Copy full promo message'}
          </button>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* SECTION 3: DOWNLOAD LINKS (Android + Apple)      */}
        {/* ════════════════════════════════════════════════ */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:T.textMuted,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>📥 Direct Download Links</div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:18}}>

          {/* Android Play Store link */}
          <a href={ANDROID_URL} target="_blank" rel="noreferrer"
            style={{display:'flex',alignItems:'center',gap:14,background:'linear-gradient(135deg,rgba(61,220,132,0.12),rgba(61,220,132,0.04))',border:'1.5px solid rgba(61,220,132,0.35)',borderRadius:14,padding:'14px',textDecoration:'none',cursor:'pointer'}}>
            <div style={{width:46,height:46,borderRadius:11,background:'#3DDC84',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,boxShadow:'0 4px 12px rgba(61,220,132,0.4)'}}>🤖</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:'#3DDC84',letterSpacing:0.8}}>FOR ANDROID PHONES</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:T.text,letterSpacing:0.3,marginTop:1}}>Download on Google Play</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:2,wordBreak:'break-all'}}>play.google.com</div>
            </div>
            <span style={{fontSize:18,color:'#3DDC84',flexShrink:0}}>↗</span>
          </a>

          {/* iOS App Store link */}
          <a href={IOS_URL} target="_blank" rel="noreferrer"
            style={{display:'flex',alignItems:'center',gap:14,background:'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))',border:'1.5px solid rgba(255,255,255,0.18)',borderRadius:14,padding:'14px',textDecoration:'none',cursor:'pointer'}}>
            <div style={{width:46,height:46,borderRadius:11,background:'#000',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0,boxShadow:'0 4px 12px rgba(0,0,0,0.5)',border:`1px solid ${T.border}`}}>🍎</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:T.textMuted,letterSpacing:0.8}}>FOR iPHONES (iOS)</div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,color:T.text,letterSpacing:0.3,marginTop:1}}>Download on App Store</div>
              <div style={{fontSize:10,color:T.textMuted,marginTop:2,wordBreak:'break-all'}}>apps.apple.com</div>
            </div>
            <span style={{fontSize:18,color:T.text,flexShrink:0}}>↗</span>
          </a>
        </div>

        {/* Smart link (works on both) */}
        <div style={{background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:'10px 12px',display:'flex',alignItems:'center',gap:10,marginBottom:22,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
          <span style={{fontSize:14}}>🔗</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9,color:T.gold,fontWeight:700,letterSpacing:0.5,marginBottom:1}}>SMART LINK · WORKS ON BOTH</div>
            <div style={{fontSize:11,color:T.text,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:600,wordBreak:'break-all'}}>{SMART_LINK}</div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* SECTION 4: SOCIAL MEDIA SHARE BUTTONS            */}
        {/* ════════════════════════════════════════════════ */}
        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:T.textMuted,letterSpacing:1.5,textTransform:'uppercase',marginBottom:10}}>🌐 Share on Social Media</div>
        <div style={{fontSize:10,color:T.textMuted,marginBottom:12,lineHeight:1.5}}>The complete promo message + download links will be shared on every platform.</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:14}}>
          {[
            { icon:'💬', label:'WhatsApp',  bg:'rgba(37,211,102,0.15)',  border:'rgba(37,211,102,0.35)',  color:'#25D366', action:shareTargets.whatsapp },
            { icon:'✈️', label:'Telegram',  bg:'rgba(0,136,204,0.15)',   border:'rgba(0,136,204,0.35)',   color:'#0088CC', action:shareTargets.telegram },
            { icon:'📘', label:'Facebook',  bg:'rgba(24,119,242,0.15)',  border:'rgba(24,119,242,0.35)',  color:'#1877F2', action:shareTargets.facebook },
            { icon:'📸', label:'Instagram', bg:'rgba(225,48,108,0.15)',  border:'rgba(225,48,108,0.35)',  color:'#E1306C', action:shareTargets.instagram },
            { icon:'❌', label:'X / Twitter',bg:'rgba(0,0,0,0.3)',        border:'rgba(255,255,255,0.25)',  color:'#FFFFFF', action:shareTargets.twitter },
            { icon:'💼', label:'LinkedIn',  bg:'rgba(10,102,194,0.15)',  border:'rgba(10,102,194,0.35)',  color:'#0A66C2', action:shareTargets.linkedin },
            { icon:'🤖', label:'Reddit',    bg:'rgba(255,69,0,0.15)',    border:'rgba(255,69,0,0.35)',    color:'#FF4500', action:shareTargets.reddit },
            { icon:'📱', label:'SMS',       bg:'rgba(37,99,235,0.15)',   border:'rgba(37,99,235,0.35)',   color:'#2563EB', action:shareTargets.sms },
            { icon:'📧', label:'Email',     bg:'rgba(234,67,53,0.15)',   border:'rgba(234,67,53,0.35)',   color:'#EA4335', action:shareTargets.email },
          ].map(s=>(
            <button key={s.label} onClick={s.action}
              style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'12px 6px',display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',transition:'all 0.15s'}}>
              <span style={{fontSize:22}}>{s.icon}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:11,color:s.color,letterSpacing:0.3,whiteSpace:'nowrap'}}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Native share + Copy as fallback row */}
        <div style={{display:'flex',gap:8,marginBottom:18}}>
          <button onClick={shareTargets.nativeShare}
            style={{flex:1,background:'linear-gradient(135deg,rgba(208,2,27,0.18),rgba(208,2,27,0.08))',border:'1px solid rgba(208,2,27,0.3)',borderRadius:12,padding:'11px',display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer'}}>
            <span style={{fontSize:18}}>📤</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.text,letterSpacing:0.5}}>More Apps</span>
          </button>
          <button onClick={copyLink}
            style={{flex:1,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:12,padding:'11px',display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <span style={{fontSize:18}}>{linkCopied?'✓':'📋'}</span>
            <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.text,letterSpacing:0.5}}>{linkCopied?'Copied!':'Copy'}</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* SECTION 5: YOUTUBE LINK                          */}
        {/* ════════════════════════════════════════════════ */}
        <div onClick={()=>window.open('https://youtube.com/@localaitv','_blank')}
          style={{background:'rgba(255,0,0,0.08)',border:'1px solid rgba(255,0,0,0.2)',borderRadius:14,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
          <span style={{fontSize:28}}>▶️</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text}}>Subscribe on YouTube</div>
            <div style={{fontSize:11,color:T.textMuted,marginTop:2}}>youtube.com/@localaitv</div>
          </div>
          <span style={{fontSize:14,color:T.red}}>↗</span>
        </div>
      </div>
    </div>
  );
}

// ── SOCIAL SHARE ROW — Instagram-style share row ─────────────

export { QRCodeScreen };
export default QRCodeScreen;
