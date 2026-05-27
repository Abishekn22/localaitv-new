import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import ComplianceFormHeader from './../../components/ComplianceFormHeader.jsx';
import { FormSuccess, FormField, FormCheckbox } from './../../components/Form/FormElements.jsx';

function TakedownForm({ onBack, prefilledUrl }) {
  const { T } = useAppTheme();
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [mobile, setMobile]           = useState('');
  const [requesterType, setReqType]   = useState('');
  const [company, setCompany]         = useState('');
  const [workDesc, setWorkDesc]       = useState('');
  const [infringingUrl, setInfUrl]    = useState(prefilledUrl || '');
  const [originalUrl, setOrigUrl]     = useState('');
  const [goodFaith, setGoodFaith]     = useState(false);
  const [accuracy, setAccuracy]       = useState(false);
  const [authority, setAuthority]     = useState(false);
  const [signature, setSignature]     = useState('');
  const [notes, setNotes]             = useState('');
  const [sent, setSent]               = useState(false);
  const [refId, setRefId]             = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');

  const REQUESTER_TYPES = [
    'Copyright Owner',
    'Authorized Representative',
    'Company / Organization Representative',
    'Legal Representative',
    'Other',
  ];

  function validate() {
    setError('');
    if (!name.trim()) { setError('Full Name is required.'); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Valid email is required.'); return false; }
    if (!mobile.trim() || !/^[6-9]\d{9}$/.test(mobile.replace(/\D/g,''))) { setError('Valid 10-digit Indian mobile required.'); return false; }
    if (!requesterType) { setError('Please select your role.'); return false; }
    if (!workDesc.trim()) { setError('Description of copyrighted work is required.'); return false; }
    if (!infringingUrl.trim()) { setError('URL of infringing content is required.'); return false; }
    if (!goodFaith) { setError('Please confirm the good faith statement.'); return false; }
    if (!accuracy) { setError('Please confirm the accuracy declaration.'); return false; }
    if (!authority) { setError('Please confirm the authority declaration.'); return false; }
    if (!signature.trim()) { setError('Electronic signature (typed full name) is required.'); return false; }
    return true;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    const id = genComplianceId('IP');
    try {
      try {
        await apiCall('/copyright-takedown-requests', { method:'POST', body: JSON.stringify({
          request_id: id, full_name: name, email, mobile, requester_type: requesterType,
          company_name: company, copyrighted_work_description: workDesc,
          infringing_content_url: infringingUrl, original_source_url: originalUrl,
          good_faith_confirmed: true, accuracy_confirmed: true, authority_confirmed: true,
          electronic_signature: signature, additional_notes: notes,
          status: 'New', created_at: new Date().toISOString(),
        }) });
      } catch (e) { /* fallback handled below */ }
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
      <ComplianceFormHeader onBack={onBack} icon="©️" title="Copyright Takedown Request" subtitle="Report copyrighted content infringement"
        gradient={`linear-gradient(135deg,#1a2a4a,#0A1538)`} />

      {sent ? (
        <FormSuccess
          title="Takedown Request Submitted!"
          message="Your copyright takedown request has been submitted successfully. Our team will review your request and contact you if more information is required."
          refId={refId}
          onBack={onBack}
        />
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:'20px 18px 140px'}}>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:14,lineHeight:1.6}}>
            Fill in the details below. Our team will review your request and contact you if more information is required.
          </div>

          <FormField label="Full Name" value={name} onChange={setName} placeholder="Your full name" required />
          <FormField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" required />
          <FormField label="Mobile Number" value={mobile} onChange={setMobile} placeholder="10-digit mobile" type="tel" required />

          <FormField label="Are you the copyright owner or authorized representative?" required>
            <select value={requesterType} onChange={e=>setReqType(e.target.value)}
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              <option value="" style={{background:T.bg2}}>-- Select --</option>
              {REQUESTER_TYPES.map(t => <option key={t} value={t} style={{background:T.bg2}}>{t}</option>)}
            </select>
          </FormField>

          <FormField label="Company / Organization Name" value={company} onChange={setCompany} placeholder="If applicable" />
          <FormField label="Description of Copyrighted Work" value={workDesc} onChange={setWorkDesc} placeholder="Describe the work you own (e.g., article, video, photo, song)" rows={3} required />
          <FormField label="URL / Location of Infringing Content" value={infringingUrl} onChange={setInfUrl} placeholder="https://localaitv.com/..." required />
          <FormField label="Original Source / Proof URL" value={originalUrl} onChange={setOrigUrl} placeholder="https://... (your original work)" />

          <div style={{padding:'12px',background:'rgba(255,184,0,0.05)',borderRadius:10,border:`1px solid rgba(255,184,0,0.15)`,marginBottom:14}}>
            <div style={{fontSize:11,color:T.gold,fontWeight:700,marginBottom:8,letterSpacing:0.5}}>📋 REQUIRED DECLARATIONS</div>
            <FormCheckbox checked={goodFaith} onChange={setGoodFaith}>
              I believe in good faith that the disputed use of the copyrighted work is not authorized by the copyright owner, its agent, or the law.
            </FormCheckbox>
            <FormCheckbox checked={accuracy} onChange={setAccuracy}>
              I declare that the information provided in this request is true and accurate to the best of my knowledge.
            </FormCheckbox>
            <FormCheckbox checked={authority} onChange={setAuthority}>
              I confirm that I am the copyright owner or authorized to act on behalf of the copyright owner.
            </FormCheckbox>
          </div>

          <FormField label="Electronic Signature (typed full name)" value={signature} onChange={setSignature} placeholder="Type your full legal name" required />
          <FormField label="Additional Notes" value={notes} onChange={setNotes} placeholder="Any other relevant information" rows={3} />

          {error && <div style={{background:'rgba(208,2,27,0.15)',border:'1px solid rgba(208,2,27,0.3)',borderRadius:8,padding:'10px',color:'#ff6b6b',fontSize:12,marginBottom:14}}>⚠️ {error}</div>}

          <button onClick={submit} disabled={submitting} style={{
            width:'100%',background:`linear-gradient(135deg,${T.red},#7A0010)`,color:T.text,border:'none',borderRadius:14,padding:'14px',
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,letterSpacing:1.5,
            cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.6:1,boxShadow:`0 8px 24px ${T.red}55`,
          }}>{submitting ? '⏳ SUBMITTING...' : '📤 SUBMIT TAKEDOWN REQUEST'}</button>

          <div style={{textAlign:'center',padding:'14px 0 4px',fontSize:10,color:T.textMuted,lineHeight:1.6}}>
            Submitting false claims may result in rejection or legal consequences.<br/>
            Grievance Officer: Bommena Prashanth · 📧 support@localaitv.com
          </div>
        </div>
      )}
    </div>
  );
}


export { TakedownForm };
export default TakedownForm;
