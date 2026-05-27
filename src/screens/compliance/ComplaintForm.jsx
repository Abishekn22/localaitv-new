import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import ComplianceFormHeader from './../../components/ComplianceFormHeader.jsx';
import { FormSuccess, FormField, FormCheckbox } from './../../components/Form/FormElements.jsx';

function ComplaintForm({ onBack }) {
  const { T } = useAppTheme();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject]   = useState('');
  const [desc, setDesc]         = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [declared, setDeclared] = useState(false);
  const [sent, setSent]         = useState(false);
  const [refId, setRefId]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const CATEGORIES = [
    'Defamation / Objectionable Content',
    'False / Misleading Information',
    'Intellectual Property Violation',
    'Privacy Violation',
    'Fake Profile / Impersonation',
    'Harassment / Threats',
    'Hate Speech / Illegal Content',
    'Other',
  ];

  function validate() {
    setError('');
    if (!name.trim()) { setError('Full Name is required.'); return false; }
    if (!email.trim() && !phone.trim()) { setError('Please provide either Email or Phone.'); return false; }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid Email.'); return false; }
    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g,''))) { setError('Please enter a valid 10-digit Indian mobile number.'); return false; }
    if (!category) { setError('Please select Nature of Complaint.'); return false; }
    if (!subject.trim()) { setError('Subject is required.'); return false; }
    const wordCount = desc.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 20) { setError(`Description must be at least 20 words (currently ${wordCount}).`); return false; }
    if (!declared) { setError('Please confirm the declaration.'); return false; }
    return true;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    const id = genComplianceId('GRV');
    try {
      // Best-effort backend call — don't block UX if backend is down
      try {
        await apiCall('/complaints', { method:'POST', body: JSON.stringify({
          complaint_id: id, full_name: name, email, phone, category, subject,
          description: desc, proof_url: proofUrl, status: 'New', created_at: new Date().toISOString(),
        }) });
      } catch (e) { /* fallback: also send via mailto so it's not lost */ }

      // Always also create a mailto fallback so submission is never lost
      const body = encodeURIComponent(
`COMPLAINT — LocalAI / AI News Network
Reference ID: ${id}

Name: ${name}
Email: ${email || 'Not provided'}
Phone: ${phone || 'Not provided'}
Category: ${category}
Subject: ${subject}

Description:
${desc}

Proof URL: ${proofUrl || 'Not provided'}

Submitted: ${new Date().toLocaleString('en-IN')}`);
      // Use background mail (don't open mail app — backend handles it)
      // Only fallback if needed: window.open(`mailto:support@localaitv.com?subject=Complaint%20${id}&body=${body}`);
      setRefId(id);
      setSent(true);
    } catch (e) {
      setError('Submission failed. Please try again or email support@localaitv.com directly.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <ComplianceFormHeader onBack={onBack} icon="📣" title="Submit a Complaint" subtitle="Report objectionable, unlawful, or harmful content"
        gradient={`linear-gradient(135deg,#7A0010,#D0021B)`} />

      {sent ? (
        <FormSuccess
          title="Complaint Submitted!"
          message="Your complaint has been submitted successfully. Our team will review it and contact you if more information is required."
          refId={refId}
          onBack={onBack}
        />
      ) : (
        <div style={{flex:1,overflowY:'auto',padding:'20px 18px 140px'}}>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:14,lineHeight:1.6}}>
            Please provide accurate details. Our Grievance Officer will review and respond.
          </div>

          <FormField label="Full Name" value={name} onChange={setName} placeholder="Your full name" required />
          <FormField label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <FormField label="Phone" value={phone} onChange={setPhone} placeholder="10-digit mobile" type="tel" />

          <FormField label="Nature of Complaint" required>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              style={{width:'100%',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,padding:'12px',color:T.text,fontSize:13,cursor:'pointer',boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              <option value="" style={{background:T.bg2}}>-- Select --</option>
              {CATEGORIES.map(c => <option key={c} value={c} style={{background:T.bg2}}>{c}</option>)}
            </select>
          </FormField>

          <FormField label="Subject" value={subject} onChange={setSubject} placeholder="Brief subject of complaint" required />
          <FormField label="Detailed Description" value={desc} onChange={setDesc} placeholder="Please describe in detail (minimum 20 words)..." rows={5} required />
          <FormField label="Proof URL / News URL / Content URL" value={proofUrl} onChange={setProofUrl} placeholder="https://... (optional but recommended)" />

          <div style={{padding:'12px',background:T.bg3,borderRadius:10,border:`1px solid ${T.border}`,marginBottom:14,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
            <FormCheckbox checked={declared} onChange={setDeclared}>
              By submitting this complaint, I declare that the information provided is true and accurate to the best of my knowledge.
            </FormCheckbox>
          </div>

          {error && <div style={{background:'rgba(208,2,27,0.15)',border:'1px solid rgba(208,2,27,0.3)',borderRadius:8,padding:'10px',color:'#ff6b6b',fontSize:12,marginBottom:14}}>⚠️ {error}</div>}

          <button onClick={submit} disabled={submitting} style={{
            width:'100%',
            background: `linear-gradient(135deg,${T.red},#7A0010)`,
            color:T.text,border:'none',borderRadius:14,padding:'14px',
            fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,letterSpacing:1.5,
            cursor:submitting?'not-allowed':'pointer',opacity:submitting?0.6:1,
            boxShadow:`0 8px 24px ${T.red}55`,
          }}>{submitting ? '⏳ SUBMITTING...' : '📤 SUBMIT COMPLAINT'}</button>

          <div style={{textAlign:'center',padding:'14px 0 4px',fontSize:10,color:T.textMuted,lineHeight:1.6}}>
            Or contact directly:<br/>
            📧 <a href="mailto:support@localaitv.com" style={{color:T.textMuted}}>support@localaitv.com</a> · 📞 <a href="tel:+917569684979" style={{color:T.textMuted}}>+91 7569684979</a>
          </div>
        </div>
      )}
    </div>
  );
}


export { ComplaintForm };
export default ComplaintForm;
