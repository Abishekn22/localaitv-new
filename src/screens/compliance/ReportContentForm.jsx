import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import ComplianceFormHeader from './../../components/ComplianceFormHeader.jsx';
import TakedownForm from './TakedownForm.jsx';
import { FormSuccess, FormField } from './../../components/Form/FormElements.jsx';

function ReportContentForm({ onBack, contentId, contentUrl }) {
  const { T } = useAppTheme();
  const [category, setCategory] = useState('');
  const [explanation, setExp]   = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [sent, setSent]         = useState(false);
  const [refId, setRefId]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const CATEGORIES = [
    'Fake or misleading news',
    'Defamation',
    'Hate speech',
    'Harassment or threat',
    'Privacy violation',
    'Copyright violation',
    'Obscene or illegal content',
    'Impersonation',
    'Other',
  ];

  function validate() {
    setError('');
    if (!category) { setError('Please select a category.'); return false; }
    const wc = explanation.trim().split(/\s+/).filter(Boolean).length;
    if (wc < 10) { setError(`Explanation must be at least 10 words (currently ${wc}).`); return false; }
    return true;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    const id = genComplianceId('RPT');
    try {
      try {
        await apiCall('/content-reports', { method:'POST', body: JSON.stringify({
          report_id: id, content_id: contentId, content_url: contentUrl,
          category, explanation, proof_url: proofUrl,
          status: 'New', created_at: new Date().toISOString(),
        }) });
      } catch (e) { /* swallow */ }
      setRefId(id);
      setSent(true);
    } catch (e) {
      setError('Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // If user selected "Copyright violation", redirect to the proper Takedown form
  function handleCopyrightRedirect() {
    onBack(); // close this form, parent should open TakedownForm
    setTimeout(() => window.dispatchEvent(new CustomEvent('open-takedown', { detail: { url: contentUrl }})), 100);
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <ComplianceFormHeader onBack={onBack} icon="🚩" title="Report Content" subtitle="Help us keep LocalAI safe and lawful" />

      {sent ? (
        <FormSuccess
          title="Report Received!"
          message="Thank you. Your report has been received and will be reviewed by our moderation team."
          refId={refId}
          onBack={onBack}
        />
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:'20px 18px 140px'}}>
          {contentUrl && (
            <div style={{padding:'10px 12px',background:T.bg3,borderRadius:10,marginBottom:14,fontSize:11,color:T.textMuted,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              <div style={{fontSize:9,color:T.gold,fontWeight:700,marginBottom:3}}>REPORTING CONTENT:</div>
              <div style={{wordBreak:'break-all'}}>{contentUrl}</div>
            </div>
          )}

          <FormField label="Category of Concern" required>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              <option value="" style={{background:T.bg2}}>-- Select --</option>
              {CATEGORIES.map(c => <option key={c} value={c} style={{background:T.bg2}}>{c}</option>)}
            </select>
          </FormField>

          {category === 'Copyright violation' && (
            <div style={{padding:'12px',background:'rgba(255,184,0,0.08)',border:'1px solid rgba(255,184,0,0.25)',borderRadius:10,marginBottom:14}}>
              <div style={{fontSize:12,color:T.gold,marginBottom:8}}>For copyright complaints, please use our dedicated Takedown Request form which collects the legally required information.</div>
              <button onClick={handleCopyrightRedirect} style={{background:T.gold,color:T.navy,border:'none',borderRadius:8,padding:'8px 14px',fontWeight:700,fontSize:11,cursor:'pointer'}}>
                → Open Copyright Takedown Form
              </button>
            </div>
          )}

          <FormField label="Explanation" value={explanation} onChange={setExp} placeholder="Please explain the issue (minimum 10 words)..." rows={4} required />
          <FormField label="Optional Proof URL" value={proofUrl} onChange={setProofUrl} placeholder="https://... (supporting evidence)" />

          {error && <div style={{background:'rgba(208,2,27,0.15)',border:'1px solid rgba(208,2,27,0.3)',borderRadius:8,padding:'10px',color:'#ff6b6b',fontSize:12,marginBottom:14}}>⚠️ {error}</div>}

          <button onClick={submit} disabled={submitting} style={{
            width:'100%',background:T.red,color:'white',border:'none',borderRadius:14,padding:'14px',
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,letterSpacing:1.2,
            cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.6:1,
          }}>{submitting ? '⏳ Submitting...' : '🚩 SUBMIT REPORT'}</button>
        </div>
      )}
    </div>
  );
}


export { ReportContentForm };
export default ReportContentForm;
