import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, ACCENT, SEC, OTT, getNewsAccent, useAppTheme, API_BASE, YT_CHANNEL, APP_VERSION, apiCall, API, useAPI, useReveal, Reveal, AP_CONSTITUENCIES, TG_CONSTITUENCIES, NEWS_ITEMS, NEWS_CATS, REPORTERS, BULLETIN_SEGS, CLASSIFIEDS, CL_CATS, CL_CAT_EMOJI, CL_CAT_IMG, CL_BADGE_COLOR, NO_CALL_CATS, CL_SUBCATS, CONTACT_CATS, CHANNELS_AP, CHANNELS_TG, TICKER_TEXT, getChannelName, YT_CHANNEL_ID, YT_LIVE_KURNOOL, YT_LIVE_GUNTUR, YT_LIVE_NELLORE, YT_LIVE_KAKINADA, YT_LIVE_TIRUPATI, YT_LIVE_KHAMMAM, YT_LIVE_KARIMNAGAR, YT_LIVE_WARANGAL, YT_LIVE_NALGONDA, YT_LIVE_VIDEO, YT_LIVE_KNR, YT_LIVE_GTV, YT_LIVE_FALLBACK, CHANNEL_VIDEO, LIVE_CHANNELS, BULLETINS, PROGRAM_TYPES, PROGRAM_COLORS, SHORT_NEWS, CONSTITUENCY_DISTRICT, WISH_TYPES, CONTENT_TYPES, TE_LABEL_MAP, VEG_LIST, VEG_LIST_TE, AP_DISTRICTS, TG_DISTRICTS, css } from '../../_imports.js';

import LegalDocScreen from './LegalDocScreen.jsx';

function PrivacyScreen({ onBack, onNavigate }) {
  const { T } = useAppTheme();
  return <LegalDocScreen
    onBack={onBack}
    onNavigate={onNavigate}
    icon="🔒"
    title="Privacy Policy"
    subtitle="గోప్యతా విధానం"
    topActions={[
      { icon:'🗑️', label:'Delete My Account', action:'deleteaccount' },
      { icon:'📣', label:'Submit a Grievance', action:'complaint' },
    ]}
    sections={[
      { heading: "1. INTRODUCTION", body: "LocalAI Media Network Pvt Ltd (\"we\", \"us\", \"LocalAI\") respects your privacy. This Privacy Policy explains how we collect, use, store, process, share, and protect your information when you use LocalAI / AI News Network." },
      { heading: "2. INFORMATION WE COLLECT",
        bullets: [
          "Name", "Email", "Phone number", "Location", "Uploaded text, photos, videos, audio",
          "URLs and proof documents", "Complaint details", "Device information",
          "Usage data", "Login/authentication data", "Advertising enquiry details",
          "Channel partner application details", "Takedown request details",
        ]
      },
      { heading: "3. ACCOUNT INFORMATION", body: "When you register, we collect your name, mobile number, email, state, and constituency. This information is used for authentication, content attribution, and contact." },
      { heading: "4. UPLOADED CONTENT", body: "Content you upload — text, photos, videos, audio, URLs, and proof documents — is stored on our servers for moderation, verification, AI processing, and publishing purposes. You retain ownership of your original content as per our Terms & Conditions." },
      { heading: "5. LOCATION INFORMATION", body: "We collect location only when you explicitly request location-based features (e.g., finding local news, selecting your constituency). We do not track your location in the background." },
      { heading: "6. DEVICE AND USAGE INFORMATION", body: "We collect device model, OS version, app version, language, screens viewed, time spent, and content interactions (anonymized) to improve the platform and detect abuse." },
      { heading: "7. COOKIES, ANALYTICS, AND DIAGNOSTICS", body: "We may use cookies, analytics tools, and crash diagnostics to understand app usage, fix bugs, and improve features." },
      { heading: "8. AI PROCESSING DISCLOSURE", body: "Some uploaded content may be processed using AI systems to assist with transcription, translation, summarization, categorization, moderation, verification support, and news workflow automation. AI output may be reviewed by authorized human/admin teams before publication or action." },
      { heading: "9. HOW WE USE INFORMATION",
        bullets: [
          "To deliver hyperlocal news relevant to your area",
          "To verify your identity via SMS OTP",
          "To enable citizen reporter and partner contributions",
          "To process complaints, takedown requests, and grievances",
          "To respond to advertising enquiries and partner applications",
          "To send notifications you have opted into",
          "To improve services through analytics",
          "To comply with applicable law",
        ]
      },
      { heading: "10. CONTENT MODERATION AND VERIFICATION", body: "Content uploaded by users may be reviewed by automated systems and/or our editorial/moderation team for accuracy, safety, policy compliance, and legal compliance before publication. We may delay, edit, or decline to publish content that does not meet our standards." },
      { heading: "11. SHARING OF INFORMATION", body: "LocalAI may use third-party services for hosting, authentication, storage, analytics, diagnostics, AI processing, notifications, email, SMS, WhatsApp, moderation, and operational workflows. These providers are bound by data processing agreements. We do not sell your personal data." },
      { heading: "12. DATA RETENTION", body: "We retain your data only as long as needed for the purposes stated in this policy or as required by applicable law (including for compliance, security, fraud prevention, grievance handling, and legal obligations)." },
      { heading: "13. DATA CORRECTION AND DELETION", body: "You may request correction or deletion of your personal information by contacting us at support@localaitv.com or using in-app account deletion." },
      { heading: "14. ACCOUNT DELETION", body: "You can delete your account from inside the app at: Profile → Settings → Privacy & Account → Delete Account.\n\nDeleting your account will remove your profile and personal data from LocalAI, except information we are legally required to retain for compliance, security, fraud prevention, grievance handling, or legal obligations." },
      { heading: "15. SECURITY", body: "We use industry-standard encryption (TLS in transit, AES-256 at rest), access controls, and regular security audits to protect your data. In the event of a data breach, we will notify affected users in line with applicable law." },
      { heading: "16. CHILDREN'S PRIVACY", body: "LocalAI is not intended for children under 18. We require verifiable parental consent before processing data of minors. Parents may request deletion at any time." },
      { heading: "17. GRIEVANCE AND CONTACT DETAILS", body: "Grievance Officer: Bommena Prashanth\nDesignation: Grievance Officer\nEmail: support@localaitv.com\nPhone: +91 7569684979\nJurisdiction: Hyderabad, Telangana, India" },
      { heading: "18. CHANGES TO PRIVACY POLICY", body: "We may update this Privacy Policy from time to time. Updates will be posted within the app or website. Continued use after updates indicates acceptance." },
      { heading: "19. GOVERNING LAW", body: "This Privacy Policy is governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Hyderabad, Telangana, India." },
      { body: "This information is provided for platform compliance and user guidance and does not constitute legal advice." },
    ]}
  />;
}


export { PrivacyScreen };
export default PrivacyScreen;
