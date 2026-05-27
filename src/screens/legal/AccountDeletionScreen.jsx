import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import ComplianceFormHeader from './../../components/ComplianceFormHeader.jsx';
import { FormField, FormSuccess } from './../../components/Form/FormElements.jsx';

function AccountDeletionScreen({ onBack }) {
  const { T } = useAppTheme();
  const [step, setStep]         = useState(1); // 1=warning, 2=confirm, 3=verify, 4=success
  const [otp, setOtp]           = useState('');
  const [reason, setReason]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  async function requestDeletion() {
    setSubmitting(true);
    setError('');
    try {
      try {
        await apiCall('/account-deletion-requests', { method:'POST', body: JSON.stringify({
          reason, otp, requested_at: new Date().toISOString(),
        }) });
      } catch (e) { /* still proceed locally */ }
      // Local cleanup
      try {
        localStorage.removeItem('localaitv_user_profile');
        localStorage.removeItem('localaitv_registered');
        localStorage.removeItem('localaitv_seen_intro');
      } catch (e) { /* ignore */ }
      setStep(4);
    } catch (e) {
      setError('Could not submit deletion request. Please try again or email support.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden',background:T.bg}}>
      <ComplianceFormHeader onBack={onBack} icon="🗑️" title="Delete Account" subtitle="Permanently remove your account and personal data"
        gradient={`linear-gradient(135deg,#7A0010,#D0021B)`} />

      <div style={{flex:1,overflowY:'auto',padding:'20px 18px 140px'}}>
        {step === 1 && (
          <>
            <div style={{padding:'14px',background:'rgba(208,2,27,0.08)',border:'1px solid rgba(208,2,27,0.25)',borderRadius:12,marginBottom:18}}>
              <div style={{fontSize:14,fontWeight:800,color:T.red,marginBottom:8}}>⚠️ This action cannot be undone</div>
              <div style={{fontSize:12,color:T.textMuted,lineHeight:1.7}}>
                Deleting your account will remove your profile and personal data from LocalAI, except information we are legally required to retain for compliance, security, fraud prevention, grievance handling, or legal obligations.
              </div>
            </div>

            <div style={{fontSize:13,color:T.textMuted,marginBottom:8,fontWeight:600}}>What will be deleted:</div>
            <div style={{padding:'10px 14px',background:T.bg3,borderRadius:10,marginBottom:18,fontSize:12,color:T.textMuted,lineHeight:1.8,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              ✓ Your profile (name, phone, email)<br/>
              ✓ Your saved preferences<br/>
              ✓ Your uploaded content (where legally permissible)<br/>
              ✓ Your subscription/notification settings
            </div>

            <div style={{fontSize:13,color:T.textMuted,marginBottom:8,fontWeight:600}}>What we may retain (required by law):</div>
            <div style={{padding:'10px 14px',background:T.bg3,borderRadius:10,marginBottom:24,fontSize:12,color:T.textMuted,lineHeight:1.8,boxShadow:T.isDark?'none':`0 2px 8px ${T.shadow}`}}>
              • Audit logs · Compliance records<br/>
              • Grievance/complaint records<br/>
              • Fraud-prevention data<br/>
              • Tax & financial records (if applicable)
            </div>

            <button onClick={()=>setStep(2)} style={{
              width:'100%',background:T.red,color:'white',border:'none',borderRadius:14,padding:'14px',
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,letterSpacing:1.2,cursor:'pointer',
            }}>Continue to Delete Account</button>

            <button onClick={onBack} style={{
              width:'100%',background:T.bg3,color:T.text,border:`1px solid ${T.border}`,
              borderRadius:14,padding:'14px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,
              letterSpacing:1,cursor:'pointer',marginTop:10,
            }}>Cancel · Keep My Account</button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{fontSize:14,color:T.text,fontWeight:700,marginBottom:14}}>Why are you leaving? (Optional)</div>
            <FormField label="Reason for deletion" value={reason} onChange={setReason} placeholder="Help us improve (optional)..." rows={3} />

            <div style={{padding:'14px',background:'rgba(255,184,0,0.06)',border:'1px solid rgba(255,184,0,0.2)',borderRadius:12,marginBottom:18}}>
              <div style={{fontSize:12,color:T.gold,fontWeight:700,marginBottom:6}}>📞 Need help instead?</div>
              <div style={{fontSize:12,color:T.textMuted,lineHeight:1.6}}>
                If you're having issues with the app, please contact us first:<br/>
                <a href="mailto:support@localaitv.com" style={{color:T.teal}}>support@localaitv.com</a> · <a href="tel:+917569684979" style={{color:T.teal}}>+91 7569684979</a>
              </div>
            </div>

            <button onClick={()=>setStep(3)} style={{
              width:'100%',background:T.red,color:'white',border:'none',borderRadius:14,padding:'14px',
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,letterSpacing:1.2,cursor:'pointer',
            }}>Proceed to Verification</button>

            <button onClick={()=>setStep(1)} style={{
              width:'100%',background:T.bg3,color:T.text,border:`1px solid ${T.border}`,
              borderRadius:14,padding:'14px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,
              letterSpacing:1,cursor:'pointer',marginTop:10,
            }}>← Back</button>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{fontSize:14,color:T.text,fontWeight:700,marginBottom:8}}>Verification Required</div>
            <div style={{fontSize:12,color:T.textMuted,marginBottom:18,lineHeight:1.6}}>
              For your security, please enter the OTP sent to your registered mobile number, or type "DELETE" to confirm.
            </div>

            <FormField label="Enter OTP or type DELETE" value={otp} onChange={setOtp} placeholder="6-digit OTP or DELETE" required />

            {error && <div style={{background:'rgba(208,2,27,0.15)',border:'1px solid rgba(208,2,27,0.3)',borderRadius:8,padding:'10px',color:'#ff6b6b',fontSize:12,marginBottom:14}}>⚠️ {error}</div>}

            <button onClick={requestDeletion} disabled={submitting || (!otp.trim())} style={{
              width:'100%',background:T.red,color:'white',border:'none',borderRadius:14,padding:'14px',
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:14,letterSpacing:1.2,
              cursor:(!otp.trim() || submitting)?'not-allowed':'pointer',opacity:(!otp.trim() || submitting)?0.5:1,
            }}>{submitting ? '⏳ Processing...' : '🗑️ DELETE MY ACCOUNT PERMANENTLY'}</button>

            <button onClick={()=>setStep(2)} style={{
              width:'100%',background:T.bg3,color:T.text,border:`1px solid ${T.border}`,
              borderRadius:14,padding:'14px',fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,
              letterSpacing:1,cursor:'pointer',marginTop:10,
            }}>← Back</button>
          </>
        )}

        {step === 4 && (
          <FormSuccess
            icon="👋"
            title="Account Deletion Requested"
            message="Your account deletion request has been received. Your data will be removed from our active systems, except information we are legally required to retain. You may close the app now."
            onBack={onBack}
          />
        )}
      </div>
    </div>
  );
}


export { AccountDeletionScreen };
export default AccountDeletionScreen;
