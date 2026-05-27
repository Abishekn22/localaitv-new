import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

function CommentDrawer({ open, onClose, itemId }) {
  const { T } = useAppTheme();
  const [text, setText] = useState('');
  const MOCK_COMMENTS = [
    { user:'రాజు కె', time:'2m ago', text:'చాలా మంచి వార్త! 👏', likes:12 },
    { user:'Priya D', time:'5m ago', text:'కర్నూలు అభివృద్ధి జోరుగా సాగుతోంది', likes:8 },
    { user:'Suresh R', time:'12m ago', text:'LocalAI TV best news channel! 🎉', likes:24 },
    { user:'అనిత',    time:'18m ago', text:'Very useful information. Thank you!', likes:5 },
    { user:'వెంకట్',  time:'25m ago', text:'ఎప్పటికీ ఇలాంటి వార్తలు చాలా అవసరం', likes:17 },
  ];
  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{ position:'absolute', inset:0, zIndex:40,
        background:'rgba(0,0,0,0.55)', display:'flex',
        flexDirection:'column', justifyContent:'flex-end' }}>
      <div onClick={e=>e.stopPropagation()}
        style={{ background:T.isDark?'#111':'#fff', borderRadius:'20px 20px 0 0',
          maxHeight:'65%', display:'flex', flexDirection:'column',
          boxShadow:'0 -8px 40px rgba(0,0,0,0.35)' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'14px 18px 12px', borderBottom:`1px solid ${T.border}` }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800,
            fontSize:16, color:T.text }}>💬 Comments ({MOCK_COMMENTS.length})</span>
          <button onClick={onClose} style={{ background:'none', border:'none',
            fontSize:20, color:T.textMuted, cursor:'pointer' }}>✕</button>
        </div>
        {/* Comment list */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 18px',
          display:'flex', flexDirection:'column', gap:14 }}>
          {MOCK_COMMENTS.map((c,i) => (
            <div key={i} style={{ display:'flex', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0,
                background:`linear-gradient(135deg,${T.red},#FF6B00)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:700, color:'white' }}>
                {c.user[0]}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif",
                    fontWeight:700, fontSize:13, color:T.text }}>{c.user}</span>
                  <span style={{ fontSize:10, color:T.textMuted }}>{c.time}</span>
                </div>
                <div style={{ fontSize:13, color:T.text, lineHeight:1.5,
                  fontFamily:"'Noto Sans Telugu',sans-serif" }}>{c.text}</div>
                <div style={{ fontSize:10, color:T.textMuted, marginTop:4 }}>❤️ {c.likes}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div style={{ display:'flex', gap:8, padding:'10px 16px 20px',
          borderTop:`1px solid ${T.border}` }}>
          <input value={text} onChange={e=>setText(e.target.value)}
            placeholder="మీ అభిప్రాయం రాయండి..."
            style={{ flex:1, background:T.bg3, border:`1px solid ${T.border}`,
              borderRadius:22, padding:'10px 16px', fontSize:13,
              fontFamily:"'Noto Sans Telugu',sans-serif", color:T.text,
              outline:'none' }}/>
          <button onClick={()=>setText('')}
            style={{ width:42, height:42, borderRadius:'50%',
              background:text ? T.red : T.bg3,
              border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:17, transition:'background 0.2s',
              color: text ? 'white' : T.textMuted }}>⬆</button>
        </div>
      </div>
    </div>
  );
}


export { CommentDrawer };
export default CommentDrawer;
