import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../_imports.js';

import InstagramClassifiedsViewer from './../components/Feed/InstagramClassifiedsViewer.jsx';

function ClassifiedsScreen({ onBack, constituency, initialCat }) {
  const { T } = useAppTheme();
  const [cat,        setCat]        = useState(initialCat || 'All');
  const [search,     setSearch]     = useState('');
  const [showPost,   setShowPost]   = useState(false);
  const [igIndex,    setIgIndex]    = useState(null); // null = list view, number = Instagram view

  // Post form state
  const [pTitle,     setPTitle]     = useState('');
  const [pDesc,      setPDesc]      = useState('');
  const [pCat,       setPCat]       = useState('Property');
  const [pContact,   setPContact]   = useState('');
  const [pLocation,  setPLocation]  = useState('');
  const [pSubmitted, setPSubmitted] = useState(false);

  const filtered = CLASSIFIEDS.filter(c =>
    (cat === 'All' || c.cat === cat) &&
    (!search || c.title.toLowerCase().includes(search.toLowerCase()) ||
     c.desc.toLowerCase().includes(search.toLowerCase()) ||
     c.cat.toLowerCase().includes(search.toLowerCase()))
  );

  const badgeColor = (badge) => {
    for (const [k,v] of Object.entries(CL_BADGE_COLOR)) { if (badge === k) return v; }
    if (badge && badge.startsWith('₹')) return '#b45309';
    return '#374151';
  };

  // ── POST AD FORM ──────────────────────────────────────────────
  if (showPost) return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#f7f8fa'}}>
      <div style={{background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',padding:'48px 18px 20px',flexShrink:0,position:'relative'}}>
        <button onClick={()=>setShowPost(false)} style={{position:'absolute',top:52,left:14,background:'rgba(255,255,255,0.2)',border:'none',borderRadius:8,width:32,height:32,color:'white',fontSize:16,cursor:'pointer'}}>←</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,marginBottom:6}}>📢</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:22,color:'white'}}>Post Free Classified</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.8)',marginTop:3}}>{constituency} · Reach thousands of locals</div>
        </div>
      </div>
      {pSubmitted ? (
        <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,textAlign:'center'}}>
          <div style={{fontSize:56,marginBottom:12}}>✅</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:'#111',marginBottom:8}}>Ad Submitted!</div>
          <div style={{fontSize:14,color:'#555',marginBottom:24}}>Your classified ad will be reviewed and posted shortly.</div>
          <button onClick={()=>{setShowPost(false);setPSubmitted(false);setPTitle('');setPDesc('');setPContact('');setPLocation('');}}
            style={{background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',color:'white',border:'none',borderRadius:12,padding:'14px 32px',fontWeight:800,fontSize:15,cursor:'pointer'}}>Done</button>
        </div>
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:16}}>
          <div style={{background:'white',borderRadius:14,padding:16,marginBottom:12,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <div style={{fontWeight:800,fontSize:14,color:'#111',marginBottom:10}}>Category *</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {CL_CATS.filter(c=>c!=='All').map(c=>(
                <button key={c} onClick={()=>setPCat(c)} style={{background:pCat===c?'#1e3a8a':'#f8fafc',border:`1.5px solid ${pCat===c?'#1e3a8a':'#e2e8f0'}`,borderRadius:10,padding:'10px 8px',fontSize:12,fontWeight:700,color:pCat===c?'white':'#374151',cursor:'pointer',display:'flex',alignItems:'center',gap:5,justifyContent:'center'}}>
                  {CL_CAT_EMOJI[c]} {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{background:'white',borderRadius:14,padding:16,marginBottom:12,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <div style={{marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Ad Title <span style={{color:'#e53e3e'}}>*</span></div>
              <input value={pTitle} onChange={e=>setPTitle(e.target.value)} placeholder="e.g. 2BHK Flat for Rent in Kurnool"
                style={{width:'100%',border:'1.5px solid #ddd',borderRadius:10,padding:'12px 14px',fontSize:14,color:'#111',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Description <span style={{color:'#e53e3e'}}>*</span></div>
              <textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="Describe your ad in detail…"
                style={{width:'100%',border:'1.5px solid #ddd',borderRadius:10,padding:'12px 14px',fontSize:14,color:'#111',height:90,resize:'none',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Location <span style={{color:'#e53e3e'}}>*</span></div>
                <input value={pLocation} onChange={e=>setPLocation(e.target.value)} placeholder={constituency}
                  style={{width:'100%',border:'1.5px solid #ddd',borderRadius:10,padding:'12px',fontSize:13,color:'#111',boxSizing:'border-box'}}/>
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:'#222',marginBottom:6}}>Phone <span style={{color:'#e53e3e'}}>*</span></div>
                <input value={pContact} onChange={e=>setPContact(e.target.value)} placeholder="98765 43210" type="tel"
                  style={{width:'100%',border:'1.5px solid #ddd',borderRadius:10,padding:'12px',fontSize:13,color:'#111',boxSizing:'border-box'}}/>
              </div>
            </div>
          </div>
          <button onClick={()=>{if(pTitle&&pDesc&&pContact&&pLocation)setPSubmitted(true);}}
            style={{width:'100%',background:'linear-gradient(135deg,#1e3a8a,#3b82f6)',color:'white',border:'none',borderRadius:12,padding:'16px',fontWeight:800,fontSize:16,cursor:'pointer',letterSpacing:0.5}}>
            📢 Submit Free Ad
          </button>
          <div style={{height:24}}/>
        </div>
      )}
    </div>
  );

  // ── INSTAGRAM FULL-SCREEN VIEWER ─────────────────────────────
  if (igIndex !== null) return (
    <InstagramClassifiedsViewer
      items={filtered}
      startIndex={igIndex}
      onClose={() => setIgIndex(null)}
      badgeColor={badgeColor}
    />
  );

  // ── LIST VIEW ──────────────────────────────────────────────────
  return (
    <div style={{width:'100%',height:'100%',background:T.bg,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:T.bg2,padding:'48px 16px 0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
          <button onClick={onBack} style={{background:T.bg3,border:'none',borderRadius:8,width:32,height:32,color:T.text,fontSize:16,cursor:'pointer',flexShrink:0}}>←</button>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:20,color:T.text}}>📢 Local Classifieds</div>
            <div style={{fontSize:10,color:T.textMuted}}>{constituency} · {filtered.length} ads</div>
          </div>
          <button onClick={()=>setShowPost(true)} style={{background:T.red,border:'none',borderRadius:10,padding:'8px 12px',color:'white',fontSize:11,fontWeight:700,cursor:'pointer',flexShrink:0}}>+ Post Ad</button>
        </div>
        <div style={{position:'relative',marginBottom:12}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:T.textMuted}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search property, jobs, vehicles…"
            style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'10px 14px 10px 34px',color:T.text,fontSize:13,boxSizing:'border-box'}}/>
        </div>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:12}}>
          {CL_CATS.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{
              display:'flex',alignItems:'center',gap:4,flexShrink:0,
              background:cat===c?T.red:T.bg3,
              border:`1px solid ${cat===c?T.red:T.border}`,
              borderRadius:14,padding:'5px 10px',cursor:'pointer',
            }}>
              <span style={{fontSize:10}}>{CL_CAT_EMOJI[c]}</span>
              <span style={{fontSize:10,fontWeight:600,color:cat===c?'white':T.textMuted,fontFamily:"'Barlow Condensed',sans-serif"}}>{c}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tap any card to open Instagram viewer */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 14px'}}>
        {filtered.length===0 && (
          <div style={{textAlign:'center',padding:'48px 24px'}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text}}>No ads found</div>
            <div style={{fontSize:12,marginTop:4,color:T.textMuted}}>Try a different category or search</div>
          </div>
        )}
        {filtered.map((cl,idx)=>(
          <div key={cl.id} onClick={()=>setIgIndex(idx)}
            style={{background:T.bg2,borderRadius:14,padding:'12px 14px',marginBottom:10,
              border:`1px solid ${T.border}`,cursor:'pointer',display:'flex',gap:12,
              alignItems:'flex-start',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <div style={{width:50,height:50,borderRadius:12,background:T.bg3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{cl.emoji}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:6,marginBottom:4}}>
                <div style={{fontSize:13,fontWeight:700,color:T.text,lineHeight:1.3,flex:1}}>{cl.title}</div>
                <div style={{background:badgeColor(cl.badge),color:'white',fontSize:8,fontWeight:800,padding:'2px 7px',borderRadius:4,flexShrink:0}}>{cl.badge}</div>
              </div>
              <div style={{fontSize:11,color:T.textMuted,lineHeight:1.4,marginBottom:6}}>{cl.desc.slice(0,70)}…</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',gap:8}}>
                  <span style={{fontSize:9,color:T.teal}}>📍 {cl.location}</span>
                  <span style={{fontSize:9,color:T.textMuted}}>🕐 {cl.time}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,fontSize:9,color:T.textMuted}}>
                  <span>Tap to view ›</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// WOW FEATURES — 10 NEW SCREENS
// ══════════════════════════════════════════════════════════════


export { ClassifiedsScreen };
export default ClassifiedsScreen;
