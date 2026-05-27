import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import BottomSheet from './../BottomSheet.jsx';
import { Label } from './../Form/FormElements.jsx';

function ReportSheet({ show, onClose, contentTitle }) {
  const [step, setStep] = useState(0); // 0=choose 1=done
  const reasons = [
    { icon:'📰', label:'Fake or misleading news', desc:'This story appears false or misleading' },
    { icon:'🚫', label:'Defamation',              desc:'False claims targeting a person' },
    { icon:'🤬', label:'Hate speech',             desc:'Hateful or discriminatory content' },
    { icon:'⚠️', label:'Harassment or threat',    desc:'Threatening or harassing content' },
    { icon:'🔐', label:'Privacy violation',       desc:'Private personal info shared without consent' },
    { icon:'©️', label:'Copyright violation',     desc:'Content used without permission' },
    { icon:'🔞', label:'Obscene or illegal content', desc:'Not suitable / unlawful content' },
    { icon:'🎭', label:'Impersonation',           desc:'Pretending to be someone else' },
    { icon:'💬', label:'Other',                   desc:'Something else is wrong' },
  ];

  async function handleReport(reason) {
    const reportId = genComplianceId('RPT');
    // Best-effort backend submit
    try {
      apiCall('/content-reports', { method:'POST', body: JSON.stringify({
        report_id: reportId, content_title: contentTitle || '',
        category: reason, status: 'New', created_at: new Date().toISOString(),
      }) }).catch(()=>{});
    } catch (e) { /* ignore */ }
    const subject = encodeURIComponent(`Content Report [${reportId}] — ${reason}`);
    const body = encodeURIComponent(`Report Type: ${reason}\nReference: ${reportId}\nContent: ${contentTitle||'N/A'}\nSubmitted: ${new Date().toLocaleString('en-IN')}`);
    window.open(`mailto:support@localaitv.com?subject=${subject}&body=${body}`);
    setStep(1);
    setTimeout(() => { setStep(0); onClose(); }, 2500);
  }

  return (
    <BottomSheet show={show} onClose={() => { setStep(0); onClose(); }} title={step===0 ? '⚑ Report Content' : ''}>
      {step === 0 ? (
        <>
          {contentTitle && (
            <div style={{background:T.bg3,borderRadius:10,padding:'10px 12px',marginBottom:14,border:`1px solid ${T.border}`,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              <div style={{fontSize:10,color:T.textMuted,marginBottom:3}}>Reporting:</div>
              <div style={{fontSize:12,color:T.text,lineHeight:1.4}}>{contentTitle}</div>
            </div>
          )}
          <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>Why are you reporting this?</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {reasons.map(r => (
              <button key={r.label} onClick={() => handleReport(r.label)} style={{
                display:'flex', alignItems:'center', gap:12,
                background:T.bg3, border:`1px solid ${T.border}`,
                borderRadius:11, padding:'12px 14px', cursor:'pointer', textAlign:'left',
                transition:'all 0.15s',
              }}>
                <span style={{fontSize:20,flexShrink:0}}>{r.icon}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:2}}>{r.label}</div>
                  <div style={{fontSize:10,color:T.textMuted}}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {/* Block user option — Apple 4.2 */}
          <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
            <button onClick={() => handleReport('block')} style={{
              width:'100%', background:`rgba(208,2,27,0.08)`,
              border:`1px solid rgba(208,2,27,0.2)`, borderRadius:11,
              padding:'12px', color:T.red, fontSize:13, fontWeight:700,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            }}>
              🚫 Block This Reporter
            </button>
          </div>
        </>
      ) : (
        <div style={{textAlign:'center',padding:'24px 0'}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:22,marginBottom:6}}>Report Submitted</div>
          <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>
            Thank you. Your report has been received and will be reviewed by our moderation team.{'\n'}
            Thank you for keeping LocalAI TV trustworthy.
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

// ── Compliance 3: AI Content Label ────────────────────────────

export { ReportSheet };
export default ReportSheet;
