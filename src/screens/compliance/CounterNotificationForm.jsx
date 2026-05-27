import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import ComplianceFormHeader from './../../components/ComplianceFormHeader.jsx';
import { FormSuccess, FormField, FormCheckbox } from './../../components/Form/FormElements.jsx';

function CounterNotificationForm({ onBack }) {
  const { T } = useAppTheme();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [mobile, setMobile]     = useState('');
  const [contentUrl, setUrl]    = useState('');
  const [reason, setReason]     = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [declared, setDeclared] = useState(false);
  const [signature, setSig]     = useState('');
  const [sent, setSent]         = useState(false);
  const [refId, setRefId]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  function validate() {
    setError('');
    if (!name.trim()) { setError('Full Name is required.'); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Valid email is required.'); return false; }
    if (!mobile.trim() || !/^[6-9]\d{9}$/.test(mobile.replace(/\D/g,''))) { setError('Valid 10-digit mobile required.'); return false; }
    if (!contentUrl.trim()) { setError('Removed Content URL or Content ID is required.'); return false; }
    const wordCount = reason.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 15) { setError(`Reason must be at least 15 words (currently ${wordCount}).`); return false; }
    if (!declared) { setError('Please confirm the declaration.'); return false; }
    if (!signature.trim()) { setError('Electronic signature is required.'); return false; }
    return true;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    const id = genComplianceId('CN');
    try {
      try {
        await apiCall('/copyright-counter-notifications', { method:'POST', body: JSON.stringify({
          counter_notification_id: id, full_name: name, email, mobile,
          removed_content_url: contentUrl, reason, proof_url: proofUrl,
          declared: true, electronic_signature: signature,
          status: 'New', created_at: new Date().toISOString(),
        }) });
      } catch (e) { /* swallow */ }
      setRefId(id);
      setSent(true);
    } catch (e) {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <ComplianceFormHeader onBack={onBack} icon="↩️" title="Counter-Notification" subtitle="Dispute the removal of your content"
        gradient={`linear-gradient(135deg,#1a2a4a,#0A1538)`} />

      {sent ? (
        <FormSuccess
          title="Counter-Notification Submitted!"
          message="Your counter-notification has been received. Our team will review and respond. Content may be restored if the claim is found valid."
          refId={refId}
          onBack={onBack}
        />
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:'20px 18px 140px'}}>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:14,lineHeight:1.6}}>
            If you believe your content was wrongly removed, you may submit a counter-notification.
          </div>

          <FormField label="Full Name" value={name} onChange={setName} placeholder="Your full name" required />
          <FormField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" required />
          <FormField label="Mobile Number" value={mobile} onChange={setMobile} placeholder="10-digit mobile" type="tel" required />
          <FormField label="Removed Content URL / Content ID" value={contentUrl} onChange={setUrl} placeholder="URL or content reference" required />
          <FormField label="Reason for Counter-Notification" value={reason} onChange={setReason} placeholder="Explain why your content does not infringe (minimum 15 words)..." rows={5} required />
          <FormField label="Proof of Ownership / Permission / License / Fair Dealing" value={proofUrl} onChange={setProofUrl} placeholder="https://... (link to proof)" />

          <div style={{padding:'12px',background:T.bg3,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:14,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <FormCheckbox checked={declared} onChange={setDeclared}>
              I declare that the information provided is true and accurate.
            </FormCheckbox>
          </div>

          <FormField label="Electronic Signature (typed full name)" value={signature} onChange={setSig} placeholder="Type your full legal name" required />

          {error && <div style={{background:'rgba(208,2,27,0.15)',border:'1px solid rgba(208,2,27,0.3)',borderRadius:8,padding:'10px',color:'#ff6b6b',fontSize:12,marginBottom:14}}>⚠️ {error}</div>}

          <button onClick={submit} disabled={submitting} style={{
            width:'100%',background:`linear-gradient(135deg,${T.red},#7A0010)`,color:T.text,border:'none',borderRadius:14,padding:'14px',
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,letterSpacing:1.5,
            cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.6:1,boxShadow:`0 8px 24px ${T.red}55`,
          }}>{submitting ? '⏳ SUBMITTING...' : '📤 SUBMIT COUNTER-NOTIFICATION'}</button>
        </div>
      )}
    </div>
  );
}


export { CounterNotificationForm };
export default CounterNotificationForm;
